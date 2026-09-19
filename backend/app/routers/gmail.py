"""
Gmail Integration Router.
Provides authenticated endpoints for:
1. Connecting Gmail via Google OAuth 2.0 (read-only scope)
2. Handling OAuth 2.0 callback and securely storing temporary session tokens
3. Checking connection status and disconnecting
4. Listing inbox messages and retrieving email content for scam/phishing analysis
5. Asynchronous Background Gmail Analysis Job:
   - Runs independently of frontend component lifecycles or browser navigation
   - Uses Gmail pagination to avoid loading all bodies into memory at once
   - Analyzes emails one by one through the existing ML/DL detection pipeline
   - Persists each analyzed email immediately to PostgreSQL
   - Maintains real-time progress state for frontend polling
   - Prevents duplicate concurrent jobs for the same user
"""

import asyncio
from datetime import datetime, timedelta, timezone
import logging
import secrets
from typing import Any, Dict, List, Optional
from urllib.parse import quote_plus

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal, get_db
from app.models import Detection, User
from app.services.auth_service import get_current_user
from app.services.gmail_service import (
    build_gmail_authorization_url,
    exchange_gmail_code_for_tokens,
    get_gmail_message,
    list_gmail_messages,
    parse_gmail_message,
)
from app.services.unified_detector import detect_unified

logger = logging.getLogger("scamshield.gmail_router")

router = APIRouter(prefix="/api/v1/gmail", tags=["Gmail Integration"])

# In-memory storage for active OAuth state tokens (10-minute TTL)
# Maps state_token -> {"user_id": int, "expires_at": datetime}
_GMAIL_OAUTH_STATES: Dict[str, Dict[str, Any]] = {}

# In-memory server-side storage for active Gmail session tokens (development implementation)
# Maps user_id -> {"access_token": str, "refresh_token": Optional[str], "expires_at": datetime}
_GMAIL_USER_TOKENS: Dict[int, Dict[str, Any]] = {}

# Server-side Background Analysis Job Registry
# Maps job_id -> {
#    "job_id": str,
#    "user_id": int,
#    "status": "starting" | "processing" | "completed" | "failed" | "cancelled",
#    "total": int,
#    "processed": int,
#    "remaining": int,
#    "current_email": Optional[Dict[str, str]],
#    "progress_percent": float,
#    "errors": int,
#    "started_at": str,
#    "completed_at": Optional[str],
#    "cancelled": bool
# }
_GMAIL_JOBS: Dict[str, Dict[str, Any]] = {}

# Maps user_id -> active job_id
_USER_ACTIVE_JOBS: Dict[int, str] = {}

# Strong references for background asyncio tasks to prevent garbage collection
_BACKGROUND_TASKS: set = set()


def _clean_expired_states() -> None:
    """Removes expired OAuth state tokens."""
    now = datetime.now(timezone.utc)
    expired = [k for k, v in _GMAIL_OAUTH_STATES.items() if v.get("expires_at", now) < now]
    for k in expired:
        _GMAIL_OAUTH_STATES.pop(k, None)


def _clean_expired_tokens() -> None:
    """Removes expired user tokens."""
    now = datetime.now(timezone.utc)
    expired = [k for k, v in _GMAIL_USER_TOKENS.items() if v.get("expires_at", now) < now]
    for k in expired:
        _GMAIL_USER_TOKENS.pop(k, None)


@router.get(
    "/connect",
    summary="Initiate Gmail OAuth 2.0 connection",
    description="Requires authenticated ScamShield session. Generates state and redirects to Google OAuth consent screen for read-only Gmail access.",
)
def gmail_connect(
    current_user: User = Depends(get_current_user),
) -> RedirectResponse:
    """
    Initiates Gmail OAuth 2.0 flow:
    1. Validates server Google OAuth credentials.
    2. Generates a secure CSRF state token bound to current_user.id.
    3. Sets an HTTP-only state cookie.
    4. Redirects the user to Google OAuth consent screen.
    """
    if not settings.google_client_id or not settings.google_client_secret:
        logger.error("Google OAuth is not configured on the backend server")
        return RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus('Google OAuth is not configured on the server.')}",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    _clean_expired_states()
    state = secrets.token_urlsafe(32)
    _GMAIL_OAUTH_STATES[state] = {
        "user_id": current_user.id,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }

    auth_url = build_gmail_authorization_url(state)

    response = RedirectResponse(url=auth_url, status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(
        key="gmail_oauth_state",
        value=state,
        max_age=600,  # 10 minutes
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )
    return response


@router.get(
    "/callback",
    summary="Gmail OAuth 2.0 callback endpoint",
    description="Handles Google redirect after user grants or denies Gmail read-only access.",
)
async def gmail_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
) -> RedirectResponse:
    """
    Handles Gmail OAuth 2.0 callback:
    1. Checks for provider error or user cancellation.
    2. Validates state cookie and resolves the bound ScamShield user.
    3. Exchanges authorization code for Gmail access and refresh tokens.
    4. Stores tokens in temporary server-side storage (never in URL or cookies).
    5. Redirects to frontend with success or error query parameter.
    """
    if error:
        logger.warning("Gmail OAuth denied or error: %s", error)
        error_msg = (
            "Gmail access was cancelled or denied."
            if "access_denied" in str(error).lower()
            else f"Gmail authorization failed: {error}"
        )
        response = RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus(error_msg)}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(key="gmail_oauth_state", path="/")
        return response

    cookie_state = request.cookies.get("gmail_oauth_state")
    if not state or not cookie_state or not secrets.compare_digest(state, cookie_state):
        logger.warning("Gmail OAuth state mismatch or missing cookie")
        response = RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus('Invalid or expired Gmail session state. Please try again.')}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(key="gmail_oauth_state", path="/")
        return response

    _clean_expired_states()
    state_record = _GMAIL_OAUTH_STATES.pop(state, None)
    if not state_record:
        logger.warning("Gmail OAuth state expired or already consumed: %s", state)
        response = RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus('Gmail authorization session expired. Please try connecting again.')}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(key="gmail_oauth_state", path="/")
        return response

    user_id = state_record["user_id"]

    if not code:
        logger.warning("Gmail OAuth callback missing authorization code")
        response = RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus('Missing authorization code from Google.')}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(key="gmail_oauth_state", path="/")
        return response

    try:
        token_data = await exchange_gmail_code_for_tokens(code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise ValueError("Missing access_token in token response")
    except Exception as exc:
        logger.error("Failed to exchange Gmail authorization code: %s", exc)
        response = RedirectResponse(
            url=f"{settings.frontend_url}/detect?gmail_error={quote_plus('Failed to complete Gmail token exchange.')}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(key="gmail_oauth_state", path="/")
        return response

    expires_in = token_data.get("expires_in", 3599)
    _GMAIL_USER_TOKENS[user_id] = {
        "access_token": access_token,
        "refresh_token": token_data.get("refresh_token"),
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=expires_in),
    }

    logger.info("Successfully connected Gmail for ScamShield user id=%s", user_id)

    response = RedirectResponse(
        url=f"{settings.frontend_url}/detect?gmail_connected=true",
        status_code=status.HTTP_303_SEE_OTHER,
    )
    response.delete_cookie(key="gmail_oauth_state", path="/")
    return response


@router.get(
    "/status",
    summary="Get current Gmail connection status",
)
def get_gmail_status(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Checks whether the currently authenticated user has an active Gmail access token."""
    _clean_expired_tokens()
    token_data = _GMAIL_USER_TOKENS.get(current_user.id)
    if not token_data:
        return {"connected": False, "expires_at": None}

    now = datetime.now(timezone.utc)
    if token_data.get("expires_at", now) <= now:
        _GMAIL_USER_TOKENS.pop(current_user.id, None)
        return {"connected": False, "expires_at": None}

    return {
        "connected": True,
        "expires_at": token_data["expires_at"].isoformat(),
    }


@router.post(
    "/disconnect",
    summary="Disconnect Gmail integration",
)
def disconnect_gmail(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Clears temporary Gmail access tokens and cancels active jobs for the authenticated user."""
    _GMAIL_USER_TOKENS.pop(current_user.id, None)
    active_job_id = _USER_ACTIVE_JOBS.pop(current_user.id, None)
    if active_job_id and active_job_id in _GMAIL_JOBS:
        _GMAIL_JOBS[active_job_id]["cancelled"] = True
        _GMAIL_JOBS[active_job_id]["status"] = "cancelled"

    logger.info("Disconnected Gmail for user id=%s", current_user.id)
    return {"success": True, "message": "Gmail integration disconnected successfully."}


# ==============================================================================
# Background Analysis Engine & Job Management
# ==============================================================================

async def _run_gmail_analysis_worker(job_id: str, user_id: int, access_token: str) -> None:
    """
    Independent background worker task:
    1. Connects to Gmail and fetches message IDs with pagination (never all bodies at once).
    2. Sequentially fetches, parses, classifies, and saves each email immediately to PostgreSQL.
    3. Updates job status so the user can navigate anywhere in the app while analysis progresses.
    4. Handles individual message failures gracefully (skips and continues).
    """
    job = _GMAIL_JOBS.get(job_id)
    if not job:
        return

    logger.info("Starting background Gmail analysis worker for job_id=%s, user_id=%s", job_id, user_id)
    job["status"] = "processing"

    message_ids: List[str] = []
    page_token: Optional[str] = None
    max_to_collect = 1000  # Safe cap to process all available emails in controlled pages

    try:
        # Step 1: Collect message IDs using pagination (lightweight metadata only)
        while len(message_ids) < max_to_collect:
            if job.get("cancelled"):
                job["status"] = "cancelled"
                return

            res = await list_gmail_messages(
                access_token=access_token,
                max_results=min(100, max_to_collect - len(message_ids)),
                page_token=page_token,
            )
            raw_msgs = res.get("messages", [])
            for m in raw_msgs:
                if m.get("id"):
                    message_ids.append(m["id"])

            page_token = res.get("nextPageToken")
            if not page_token or not raw_msgs:
                break

    except Exception as exc:
        logger.error("Failed while collecting Gmail message IDs: %s", exc)
        job["status"] = "failed"
        job["error_message"] = f"Failed to retrieve email list from Gmail: {str(exc)}"
        _USER_ACTIVE_JOBS.pop(user_id, None)
        return

    total_count = len(message_ids)
    job["total"] = total_count
    job["remaining"] = total_count

    if total_count == 0:
        job["status"] = "completed"
        job["progress_percent"] = 100.0
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        _USER_ACTIVE_JOBS.pop(user_id, None)
        logger.info("Job %s completed: 0 emails found in mailbox.", job_id)
        return

    logger.info("Found %d emails to analyze for job_id=%s", total_count, job_id)

    # Step 2: Process emails ONE BY ONE
    for idx, msg_id in enumerate(message_ids, start=1):
        if job.get("cancelled"):
            job["status"] = "cancelled"
            logger.info("Job %s cancelled by user request.", job_id)
            _USER_ACTIVE_JOBS.pop(user_id, None)
            return

        try:
            # Fetch single email body
            full_msg = await get_gmail_message(access_token, msg_id)
            parsed = parse_gmail_message(full_msg)

            subject = (parsed.get("subject") or "No Subject").strip()
            sender = (parsed.get("from") or "Unknown Sender").strip()
            body = (parsed.get("body") or "").strip()

            # Update live current item tracking
            job["current_email"] = {
                "from": sender[:60],
                "subject": subject[:80],
            }

            # Prepare text for ML detector
            text_to_analyze = f"Subject: {subject}\n\n{body}" if body else f"Subject: {subject}"

            # Run existing ScamShield ML Email detection pipeline
            result = detect_unified(content=text_to_analyze, content_type="email")

            # Persist immediately to PostgreSQL so results appear live in Email History
            db: Session = SessionLocal()
            try:
                record = Detection(
                    user_id=user_id,
                    input_type="email",
                    input_text=text_to_analyze[:5000],
                    predicted_label=result.get("predicted_label"),
                    classification=result.get("classification"),
                    score=result.get("score"),
                    score_type=result.get("score_type"),
                    risk_percentage=result.get("risk_percentage", 0.0),
                    is_phishing=result.get("is_phishing", False),
                    is_spam=result.get("is_spam"),
                    model_used="ML",
                    source="gmail",
                    sender=sender[:255],
                    subject=subject[:500],
                )
                db.add(record)
                db.commit()
            finally:
                db.close()

            job["processed"] += 1
            job["remaining"] = max(0, total_count - job["processed"])
            job["progress_percent"] = round((job["processed"] / total_count) * 100, 1)

        except Exception as msg_err:
            # If one email fails, do NOT abort the entire analysis.
            logger.warning("Error processing message %s: %s", msg_id, msg_err)
            job["errors"] += 1
            job["processed"] += 1
            job["remaining"] = max(0, total_count - job["processed"])
            job["progress_percent"] = round((job["processed"] / total_count) * 100, 1)

        # Brief yield to event loop to ensure smooth async concurrency
        await asyncio.sleep(0.01)

    # Step 3: Complete job
    if not job.get("cancelled"):
        job["status"] = "completed"
        job["progress_percent"] = 100.0
        job["remaining"] = 0
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        job["current_email"] = None
        _USER_ACTIVE_JOBS.pop(user_id, None)
        logger.info("Job %s completed successfully: %d analyzed, %d errors.", job_id, job["processed"], job["errors"])


@router.post(
    "/analysis/start",
    summary="Start background Gmail email analysis",
    description="Starts a persistent background job that paginates and analyzes all available emails one by one. Survives frontend route navigation.",
)
async def start_gmail_analysis(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Launches or reconnects to an active Gmail analysis job.
    Includes multiple-job protection: returns existing job if one is already running.
    """
    _clean_expired_tokens()
    token_data = _GMAIL_USER_TOKENS.get(current_user.id)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gmail account is not connected. Please connect Gmail first.",
        )

    # Check for active existing job for this user
    existing_job_id = _USER_ACTIVE_JOBS.get(current_user.id)
    if existing_job_id and existing_job_id in _GMAIL_JOBS:
        existing_job = _GMAIL_JOBS[existing_job_id]
        if existing_job["status"] in ("starting", "processing"):
            logger.info("User id=%s reconnected to active job_id=%s", current_user.id, existing_job_id)
            return existing_job

    # Create new background job
    job_id = secrets.token_urlsafe(16)
    job_payload = {
        "job_id": job_id,
        "user_id": current_user.id,
        "status": "starting",
        "total": 0,
        "processed": 0,
        "remaining": 0,
        "current_email": None,
        "progress_percent": 0.0,
        "errors": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "cancelled": False,
    }

    _GMAIL_JOBS[job_id] = job_payload
    _USER_ACTIVE_JOBS[current_user.id] = job_id

    # Spawn background task detached from request lifecycle
    task = asyncio.create_task(
        _run_gmail_analysis_worker(job_id, current_user.id, token_data["access_token"])
    )
    _BACKGROUND_TASKS.add(task)
    task.add_done_callback(_BACKGROUND_TASKS.discard)

    return job_payload


@router.get(
    "/analysis/active",
    summary="Get active or most recent Gmail analysis job for current user",
)
def get_active_gmail_analysis(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Discovers active or recent Gmail background job when navigating or reopening pages."""
    job_id = _USER_ACTIVE_JOBS.get(current_user.id)
    if job_id and job_id in _GMAIL_JOBS:
        return {"active": True, "job": _GMAIL_JOBS[job_id]}

    # Check if there is any recent job created by this user
    user_jobs = [j for j in _GMAIL_JOBS.values() if j.get("user_id") == current_user.id]
    if user_jobs:
        latest = sorted(user_jobs, key=lambda x: x.get("started_at", ""), reverse=True)[0]
        is_active = latest["status"] in ("starting", "processing")
        return {"active": is_active, "job": latest}

    return {"active": False, "job": None}


@router.get(
    "/analysis/progress/{job_id}",
    summary="Get live progress of a Gmail analysis job",
)
def get_gmail_analysis_progress(
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Returns current real-time metrics for a specific background job."""
    job = _GMAIL_JOBS.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis job not found.",
        )

    if job.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this analysis job.",
        )

    return job


@router.post(
    "/analysis/cancel/{job_id}",
    summary="Cancel a running Gmail analysis job",
)
def cancel_gmail_analysis(
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Allows user to explicitly stop/cancel background email analysis."""
    job = _GMAIL_JOBS.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis job not found.",
        )

    if job.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this analysis job.",
        )

    job["cancelled"] = True
    job["status"] = "cancelled"
    job["completed_at"] = datetime.now(timezone.utc).isoformat()
    _USER_ACTIVE_JOBS.pop(current_user.id, None)

    logger.info("Cancelled Gmail analysis job %s for user id=%s", job_id, current_user.id)
    return {"success": True, "message": "Gmail analysis job cancelled.", "job": job}


@router.get(
    "/messages",
    summary="List recent inbox emails from connected Gmail",
)
async def list_messages(
    max_results: int = Query(default=10, ge=1, le=25),
    q: Optional[str] = Query(default=None, description="Optional Gmail search query"),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Lists recent emails from the connected user's Gmail inbox.
    Returns preview metadata (id, snippet, subject, from, date) for each email.
    """
    _clean_expired_tokens()
    token_data = _GMAIL_USER_TOKENS.get(current_user.id)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gmail account is not connected. Please connect Gmail first.",
        )

    access_token = token_data["access_token"]

    try:
        raw_list = await list_gmail_messages(access_token, max_results=max_results, query=q)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            _GMAIL_USER_TOKENS.pop(current_user.id, None)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gmail session expired or authorization revoked. Please reconnect Gmail.",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gmail API error: {exc.response.text}",
        )
    except Exception as exc:
        logger.error("Error listing Gmail messages: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages from Gmail.",
        )

    messages_meta = raw_list.get("messages", [])
    items: List[Dict[str, Any]] = []
    for m in messages_meta:
        msg_id = m.get("id")
        if not msg_id:
            continue
        try:
            full_msg = await get_gmail_message(access_token, msg_id)
            parsed = parse_gmail_message(full_msg)
            items.append({
                "id": parsed["id"],
                "subject": parsed["subject"],
                "from": parsed["from"],
                "date": parsed["date"],
                "snippet": parsed["snippet"],
            })
        except Exception as exc:
            logger.warning("Failed to fetch metadata for message %s: %s", msg_id, exc)
            items.append({
                "id": msg_id,
                "subject": "Email",
                "from": "Unknown",
                "date": "",
                "snippet": "",
            })

    return {
        "count": len(items),
        "resultSizeEstimate": raw_list.get("resultSizeEstimate", len(items)),
        "messages": items,
    }


@router.get(
    "/messages/{message_id}",
    summary="Get full email content for scam & phishing analysis",
)
async def get_message_detail(
    message_id: str,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Fetches full subject, sender, date, and body content for a specific email.
    """
    _clean_expired_tokens()
    token_data = _GMAIL_USER_TOKENS.get(current_user.id)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gmail account is not connected. Please connect Gmail first.",
        )

    access_token = token_data["access_token"]

    try:
        raw_msg = await get_gmail_message(access_token, message_id)
        parsed = parse_gmail_message(raw_msg)
        return parsed
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            _GMAIL_USER_TOKENS.pop(current_user.id, None)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gmail session expired or authorization revoked. Please reconnect Gmail.",
            )
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email message not found.",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch email details from Gmail API.",
        )
    except Exception as exc:
        logger.error("Error retrieving message %s: %s", message_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve message content.",
        )
