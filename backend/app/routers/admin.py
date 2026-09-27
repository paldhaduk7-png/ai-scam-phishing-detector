"""
Administrator Management Router.
Provides authenticated endpoints for:
1. Live SaaS dashboard metrics (Active Users, Pending Requests, Admins, Standard Users, Deleted Users)
2. Gmail Access Request review workflows (Approve, Reject with reason, Revoke)
3. User directory management (All Users, Admins with last-admin protection, Standard Users)
4. User lifecycle management (Soft Delete, Trash, Restore, 30-Day Permanent Delete)
5. Comprehensive audit trail logging for all administrative actions
All endpoints are strictly guarded by the get_current_admin_user dependency (role == 'ADMIN').
"""

from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, Detection, GmailAccessHistory, GmailAccessRequest, User
from app.routers.gmail import _GMAIL_USER_TOKENS, _format_request_item
from app.schemas import (
    AdminGmailRequestsResponse,
    AdminStatsResponse,
    AdminUserItem,
    AdminUsersListResponse,
    AuditLogItem,
    AuditLogsResponse,
    GmailAccessHistoryItem,
    GmailAccessRequestItem,
    GmailReviewRequest,
    GmailManualGrantRequest,
)
from app.services.auth_service import get_current_admin_user

logger = logging.getLogger("scamshield.admin_router")

router = APIRouter(prefix="/api/v1/admin", tags=["Administrator Management"])


def _calculate_days_remaining(deleted_at: Optional[datetime]) -> Optional[int]:
    """Calculates days remaining until 30-day permanent deletion threshold."""
    if not deleted_at:
        return None
    now = datetime.now(timezone.utc)
    elapsed_days = (now - deleted_at).days
    return max(0, 30 - elapsed_days)


def _format_admin_user(user: User, db: Session) -> AdminUserItem:
    """Formats SQLAlchemy User model into comprehensive AdminUserItem schema."""
    # Resolve approved emails list
    approved_emails: List[str] = []
    if user.approved_gmail_emails:
        try:
            approved_emails = json.loads(user.approved_gmail_emails)
        except Exception:
            approved_emails = [e.strip() for e in user.approved_gmail_emails.split(",") if e.strip()]

    # Resolve latest requested emails and request date
    latest_req = (
        db.query(GmailAccessRequest)
        .filter(GmailAccessRequest.user_id == user.id)
        .order_by(desc(GmailAccessRequest.requested_at))
        .first()
    )
    requested_emails: List[str] = []
    request_date: Optional[str] = None
    approval_date: Optional[str] = None

    if latest_req:
        request_date = latest_req.requested_at.isoformat() if latest_req.requested_at else None
        if latest_req.reviewed_at and latest_req.status == "APPROVED":
            approval_date = latest_req.reviewed_at.isoformat()
        if latest_req.requested_emails:
            try:
                requested_emails = json.loads(latest_req.requested_emails)
            except Exception:
                requested_emails = [e.strip() for e in latest_req.requested_emails.split(",") if e.strip()]

    # Resolve deleted_by user name if soft deleted
    deleted_by_name: Optional[str] = None
    if user.deleted_by:
        del_admin = db.query(User).filter(User.id == user.deleted_by).first()
        if del_admin:
            deleted_by_name = del_admin.name

    days_remaining = _calculate_days_remaining(user.deleted_at) if user.account_status == "SOFT_DELETED" else None

    return AdminUserItem(
        id=user.id,
        name=user.name,
        email=user.email,
        role=getattr(user, "role", "USER") or "USER",
        account_status=getattr(user, "account_status", "ACTIVE") or "ACTIVE",
        gmail_access_status=getattr(user, "gmail_access_status", "NOT_REQUESTED") or "NOT_REQUESTED",
        requested_emails=requested_emails,
        approved_emails=approved_emails,
        request_date=request_date,
        approval_date=approval_date,
        created_at=user.created_at.isoformat() if user.created_at else "",
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        deleted_at=user.deleted_at.isoformat() if user.deleted_at else None,
        deleted_by=user.deleted_by,
        deleted_by_name=deleted_by_name,
        days_remaining=days_remaining,
    )


# ==============================================================================
# 1. Admin Statistics Endpoint (Real DB metrics)
# ==============================================================================

@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Get real-time administrator dashboard statistics",
)
def get_admin_dashboard_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminStatsResponse:
    """
    Computes real summary metrics directly from PostgreSQL:
    - Active users
    - Pending Gmail access requests
    - Total active administrators
    - Standard active users
    - Soft-deleted users in trash
    """
    active_users = db.query(User).filter(User.account_status == "ACTIVE").count()
    pending_requests = db.query(GmailAccessRequest).filter(GmailAccessRequest.status == "PENDING").count()
    admin_users = db.query(User).filter(User.role == "ADMIN", User.account_status == "ACTIVE").count()
    standard_users = db.query(User).filter(User.role == "USER", User.account_status == "ACTIVE").count()
    deleted_users = db.query(User).filter(User.account_status == "SOFT_DELETED").count()

    return AdminStatsResponse(
        active_users=active_users,
        pending_requests=pending_requests,
        admin_users=admin_users,
        standard_users=standard_users,
        deleted_users=deleted_users,
    )


# ==============================================================================
# 2. User Directory Endpoints (All Users, Admins, Standard Users)
# ==============================================================================

@router.get(
    "/users",
    response_model=AdminUsersListResponse,
    summary="List all users with search, multi-field filters, and pagination",
)
def list_admin_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: admin, user, or all"),
    account_status: Optional[str] = Query(None, description="Filter by status: active, soft_deleted, or all"),
    gmail_access_status: Optional[str] = Query(None, description="Filter by Gmail access: approved, pending, rejected, revoked, not_requested, or all"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUsersListResponse:
    """
    Returns paginated user list with full profile metadata, Gmail access status, and audit timestamps.
    """
    query = db.query(User)

    if search:
        s = search.strip()
        if s:
            pattern = f"%{s}%"
            query = query.filter(or_(User.name.ilike(pattern), User.email.ilike(pattern)))

    if role and role.lower() != "all":
        query = query.filter(func.upper(User.role) == role.strip().upper())

    if account_status and account_status.lower() != "all":
        query = query.filter(func.upper(User.account_status) == account_status.strip().upper())

    if gmail_access_status and gmail_access_status.lower() != "all":
        query = query.filter(func.upper(User.gmail_access_status) == gmail_access_status.strip().upper())

    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    total_pages = max(1, (total + limit - 1) // limit)

    return AdminUsersListResponse(
        users=[_format_admin_user(u, db) for u in users],
        total=total,
        page=page,
        totalPages=total_pages,
    )


@router.get(
    "/deleted-users",
    response_model=AdminUsersListResponse,
    summary="List soft-deleted users currently in trash",
)
def list_deleted_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUsersListResponse:
    """
    Returns soft-deleted users with remaining days countdown (30-day restore window).
    """
    query = db.query(User).filter(User.account_status == "SOFT_DELETED")
    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(desc(User.deleted_at)).offset(offset).limit(limit).all()
    total_pages = max(1, (total + limit - 1) // limit)

    return AdminUsersListResponse(
        users=[_format_admin_user(u, db) for u in users],
        total=total,
        page=page,
        totalPages=total_pages,
    )


# ==============================================================================
# 3. Gmail Access Request Management (Approve, Reject, Revoke)
# ==============================================================================

@router.get(
    "/gmail-requests",
    response_model=AdminGmailRequestsResponse,
    summary="List Gmail access requests with status filtering",
)
def list_admin_gmail_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: pending, approved, rejected, revoked, or all"),
    search: Optional[str] = Query(None, description="Search by user name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminGmailRequestsResponse:
    """
    Lists all submitted Gmail access requests with requesting user profile and review status.
    """
    query = db.query(GmailAccessRequest).join(User, GmailAccessRequest.user_id == User.id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(func.upper(GmailAccessRequest.status) == status_filter.strip().upper())

    if search:
        s = search.strip()
        if s:
            pattern = f"%{s}%"
            query = query.filter(
                or_(
                    User.name.ilike(pattern),
                    User.email.ilike(pattern),
                    GmailAccessRequest.requested_emails.ilike(pattern),
                )
            )

    total = query.count()
    offset = (page - 1) * limit
    requests = query.order_by(desc(GmailAccessRequest.requested_at)).offset(offset).limit(limit).all()
    total_pages = max(1, (total + limit - 1) // limit)

    return AdminGmailRequestsResponse(
        requests=[_format_request_item(r, db) for r in requests],
        total=total,
        page=page,
        totalPages=total_pages,
    )


@router.post(
    "/gmail-requests/{request_id}/approve",
    response_model=GmailAccessRequestItem,
    summary="Approve Gmail access request",
)
def approve_gmail_request(
    request_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> GmailAccessRequestItem:
    """
    Approves a Gmail access request:
    1. Sets request status to APPROVED with review timestamp and reviewer ID.
    2. Updates target user's gmail_access_status to APPROVED and stores approved Gmail address(es).
    3. Logs lifecycle transition to GmailAccessHistory.
    4. Creates administrative AuditLog entry.
    """
    req = db.query(GmailAccessRequest).filter(GmailAccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gmail access request not found.")

    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "PENDING")

    # Update request record
    req.status = "APPROVED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = current_admin.id

    # Update target user
    target_user.gmail_access_status = "APPROVED"
    target_user.approved_gmail_emails = req.requested_emails

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="APPROVED",
        previous_status=prev_status,
        new_status="APPROVED",
        gmail_addresses=req.requested_emails,
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_APPROVED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Approved Gmail access for request #{req.id}. Approved addresses: {req.requested_emails}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(req)

    logger.info("Admin %s approved Gmail access request #%s for user %s", current_admin.email, req.id, target_user.email)
    return _format_request_item(req, db)


@router.post(
    "/gmail-requests/{request_id}/reject",
    response_model=GmailAccessRequestItem,
    summary="Reject Gmail access request with optional reason",
)
def reject_gmail_request(
    request_id: int,
    payload: Optional[GmailReviewRequest] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> GmailAccessRequestItem:
    """
    Rejects a Gmail access request:
    1. Sets request status to REJECTED with rejection reason, review timestamp, and reviewer ID.
    2. Updates target user's gmail_access_status to REJECTED.
    3. Logs transition to GmailAccessHistory.
    4. Creates administrative AuditLog entry.
    """
    req = db.query(GmailAccessRequest).filter(GmailAccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gmail access request not found.")

    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "PENDING")
    rejection_reason = payload.reason.strip() if payload and payload.reason else "Request was declined by administrator."
    admin_note = payload.note.strip() if payload and payload.note else None

    # Update request record
    req.status = "REJECTED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = current_admin.id
    req.rejection_reason = rejection_reason
    req.admin_note = admin_note

    # Update target user
    target_user.gmail_access_status = "REJECTED"

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="REJECTED",
        previous_status=prev_status,
        new_status="REJECTED",
        gmail_addresses=req.requested_emails,
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        admin_note=rejection_reason,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_REJECTED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Rejected Gmail access request #{req.id}. Reason: {rejection_reason}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(req)

    logger.info("Admin %s rejected Gmail access request #%s for user %s", current_admin.email, req.id, target_user.email)
    return _format_request_item(req, db)


@router.post(
    "/gmail-requests/{request_id}/revoke",
    response_model=GmailAccessRequestItem,
    summary="Revoke previously approved Gmail access",
)
def revoke_gmail_request(
    request_id: int,
    payload: Optional[GmailReviewRequest] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> GmailAccessRequestItem:
    """
    Revokes previously granted Gmail access:
    1. Sets request status to REVOKED.
    2. Updates target user's gmail_access_status to REVOKED.
    3. Invalidates active Gmail session tokens immediately.
    4. Logs lifecycle transition to GmailAccessHistory.
    5. Preserves existing detection history untouched.
    """
    req = db.query(GmailAccessRequest).filter(GmailAccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gmail access request not found.")

    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "APPROVED")
    revoke_note = payload.reason.strip() if payload and payload.reason else "Access revoked by administrator."

    # Update request record
    req.status = "REVOKED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = current_admin.id
    req.admin_note = revoke_note

    # Update target user
    target_user.gmail_access_status = "REVOKED"

    # Invalidate active Gmail session tokens for that user
    _GMAIL_USER_TOKENS.pop(target_user.id, None)

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="REVOKED",
        previous_status=prev_status,
        new_status="REVOKED",
        gmail_addresses=req.requested_emails,
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        admin_note=revoke_note,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_REVOKED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Revoked Gmail access for request #{req.id}. Note: {revoke_note}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(req)

    logger.info("Admin %s revoked Gmail access request #%s for user %s", current_admin.email, req.id, target_user.email)
    return _format_request_item(req, db)


@router.post(
    "/users/{user_id}/revoke-gmail",
    response_model=AdminUserItem,
    summary="Revoke approved Gmail access for a specific user directly",
)
def revoke_user_gmail_access(
    user_id: int,
    payload: Optional[GmailReviewRequest] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUserItem:
    """
    Directly revokes Gmail access for a user from the User Directory:
    1. Updates latest approved request to REVOKED.
    2. Sets user's gmail_access_status to REVOKED.
    3. Invalidates active Gmail session tokens immediately.
    4. Logs lifecycle transition to GmailAccessHistory.
    5. Creates administrative AuditLog entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "APPROVED")
    revoke_note = payload.reason.strip() if payload and payload.reason else "Access revoked by administrator from user management."

    # Update latest request if approved
    latest_req = (
        db.query(GmailAccessRequest)
        .filter(GmailAccessRequest.user_id == user_id)
        .order_by(desc(GmailAccessRequest.requested_at))
        .first()
    )
    if latest_req and latest_req.status == "APPROVED":
        latest_req.status = "REVOKED"
        latest_req.reviewed_at = datetime.now(timezone.utc)
        latest_req.reviewed_by = current_admin.id
        latest_req.admin_note = revoke_note

    # Update target user
    target_user.gmail_access_status = "REVOKED"

    # Invalidate active Gmail session tokens
    _GMAIL_USER_TOKENS.pop(target_user.id, None)

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="REVOKED",
        previous_status=prev_status,
        new_status="REVOKED",
        gmail_addresses=target_user.approved_gmail_emails or (latest_req.requested_emails if latest_req else None),
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        admin_note=revoke_note,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_REVOKED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Admin revoked Gmail access for user {target_user.name} ({target_user.email}). Note: {revoke_note}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    logger.info("Admin %s directly revoked Gmail access for user %s", current_admin.email, target_user.email)
    return _format_admin_user(target_user, db)


@router.post(
    "/users/{user_id}/grant-gmail",
    response_model=AdminUserItem,
    summary="Directly grant or approve Gmail access for a user manually",
)
def grant_user_gmail_access(
    user_id: int,
    payload: Optional[GmailManualGrantRequest] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUserItem:
    """
    Directly grants/approves Gmail access for any user:
    1. Determines allowed Gmail address list (defaults to user's registered email).
    2. Updates or creates an approved GmailAccessRequest record.
    3. Sets user's gmail_access_status to APPROVED with approved_gmail_emails JSON.
    4. Logs lifecycle transition in GmailAccessHistory.
    5. Creates administrative AuditLog entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "NOT_REQUESTED")
    admin_note = payload.note.strip() if payload and payload.note else "Manually granted by administrator."

    # Parse and clean target Gmail addresses
    target_emails = []
    if payload and payload.emails:
        target_emails = [e.strip() for e in payload.emails if e and e.strip()]
    if not target_emails:
        if target_user.approved_gmail_emails:
            try:
                target_emails = json.loads(target_user.approved_gmail_emails)
            except Exception:
                target_emails = [target_user.email]
        else:
            target_emails = [target_user.email]

    emails_json = json.dumps(target_emails)

    # Find latest request or create a new approved request record
    latest_req = (
        db.query(GmailAccessRequest)
        .filter(GmailAccessRequest.user_id == user_id)
        .order_by(desc(GmailAccessRequest.requested_at))
        .first()
    )
    if latest_req:
        latest_req.status = "APPROVED"
        latest_req.requested_emails = emails_json
        latest_req.reviewed_at = datetime.now(timezone.utc)
        latest_req.reviewed_by = current_admin.id
        latest_req.admin_note = admin_note
    else:
        new_req = GmailAccessRequest(
            user_id=target_user.id,
            requested_emails=emails_json,
            status="APPROVED",
            requested_at=datetime.now(timezone.utc),
            reviewed_at=datetime.now(timezone.utc),
            reviewed_by=current_admin.id,
            admin_note=admin_note,
        )
        db.add(new_req)

    # Update target user
    target_user.gmail_access_status = "APPROVED"
    target_user.approved_gmail_emails = emails_json

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="APPROVED",
        previous_status=prev_status,
        new_status="APPROVED",
        gmail_addresses=emails_json,
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        admin_note=admin_note,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_APPROVED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Admin manually granted Gmail access to user {target_user.name} ({target_user.email}). Approved addresses: {emails_json}. Note: {admin_note}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    logger.info("Admin %s manually granted Gmail access to user %s with addresses %s", current_admin.email, target_user.email, emails_json)
    return _format_admin_user(target_user, db)


@router.post(
    "/users/{user_id}/reset-gmail",
    response_model=AdminUserItem,
    summary="Reset Gmail access state back to NOT_REQUESTED",
)
def reset_user_gmail_access(
    user_id: int,
    payload: Optional[GmailReviewRequest] = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUserItem:
    """
    Resets a user's Gmail access state to NOT_REQUESTED:
    1. Clears approved addresses and invalidates tokens.
    2. Sets gmail_access_status = NOT_REQUESTED.
    3. Logs lifecycle history and audit entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    prev_status = getattr(target_user, "gmail_access_status", "NOT_REQUESTED")
    reset_note = payload.reason.strip() if payload and payload.reason else "Access state reset to NOT_REQUESTED by administrator."

    target_user.gmail_access_status = "NOT_REQUESTED"
    target_user.approved_gmail_emails = None
    _GMAIL_USER_TOKENS.pop(target_user.id, None)

    # Create history entry
    hist = GmailAccessHistory(
        user_id=target_user.id,
        action="RESET",
        previous_status=prev_status,
        new_status="NOT_REQUESTED",
        gmail_addresses=None,
        performed_by=current_admin.id,
        performed_by_name=current_admin.name,
        admin_note=reset_note,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(hist)

    # Create audit log
    audit = AuditLog(
        action="GMAIL_ACCESS_RESET",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Admin reset Gmail access status for {target_user.name} ({target_user.email}) to NOT_REQUESTED. Note: {reset_note}",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    logger.info("Admin %s reset Gmail access status for user %s to NOT_REQUESTED", current_admin.email, target_user.email)
    return _format_admin_user(target_user, db)


@router.get(
    "/users/{user_id}/gmail-history",
    response_model=List[GmailAccessHistoryItem],
    summary="Get full Gmail access history lifecycle for a specific user",
)
def get_user_gmail_history(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> List[GmailAccessHistoryItem]:
    """
    Returns chronological access requests, approvals, rejections, and revocations for a specific user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    history_records = (
        db.query(GmailAccessHistory)
        .filter(GmailAccessHistory.user_id == user_id)
        .order_by(desc(GmailAccessHistory.timestamp))
        .all()
    )

    return [
        GmailAccessHistoryItem(
            id=h.id,
            user_id=h.user_id,
            action=h.action,
            previous_status=h.previous_status,
            new_status=h.new_status,
            gmail_addresses=h.gmail_addresses,
            performed_by=h.performed_by,
            performed_by_name=h.performed_by_name,
            admin_note=h.admin_note,
            timestamp=h.timestamp.isoformat() if h.timestamp else "",
        )
        for h in history_records
    ]


# ==============================================================================
# 4. User Lifecycle Management (Soft Delete, Restore, Permanent Delete)
# ==============================================================================

@router.post(
    "/users/{user_id}/soft-delete",
    response_model=AdminUserItem,
    summary="Soft-delete user and immediately block application access",
)
def soft_delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUserItem:
    """
    Soft-deletes a user:
    1. Protects the last administrator: prevents deleting/demoting final active admin.
    2. Prevents self-deletion if last admin.
    3. Sets account_status = SOFT_DELETED, deleted_at = now, deleted_by = admin.id.
    4. Invalidates any active Gmail session tokens.
    5. Preserves existing detection scan history.
    6. Logs administrative AuditLog entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if target_user.account_status == "SOFT_DELETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account is already deactivated.")

    # Protect the last administrator
    if target_user.role == "ADMIN":
        active_admins_count = db.query(User).filter(User.role == "ADMIN", User.account_status == "ACTIVE").count()
        if active_admins_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security protection: cannot soft-delete the last remaining administrator account.",
            )

    target_user.account_status = "SOFT_DELETED"
    target_user.deleted_at = datetime.now(timezone.utc)
    target_user.deleted_by = current_admin.id

    # Invalidate active Gmail session tokens for that user
    _GMAIL_USER_TOKENS.pop(target_user.id, None)

    # Log audit entry
    audit = AuditLog(
        action="USER_SOFT_DELETED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Soft-deleted user {target_user.name} ({target_user.email}). Account deactivated.",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    logger.info("Admin %s soft-deleted user id=%s (%s)", current_admin.email, target_user.id, target_user.email)
    return _format_admin_user(target_user, db)


@router.post(
    "/users/{user_id}/restore",
    response_model=AdminUserItem,
    summary="Restore a soft-deleted user before 30-day expiration",
)
def restore_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUserItem:
    """
    Restores a soft-deleted user back to active status:
    1. Sets account_status = ACTIVE.
    2. Clears deleted_at and deleted_by.
    3. Restores application access immediately while preserving all history.
    4. Logs administrative AuditLog entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if target_user.account_status != "SOFT_DELETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account is already active.")

    target_user.account_status = "ACTIVE"
    target_user.deleted_at = None
    target_user.deleted_by = None

    # Log audit entry
    audit = AuditLog(
        action="USER_RESTORED",
        target_user_id=target_user.id,
        target_user_email=target_user.email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Restored user account {target_user.name} ({target_user.email}) to ACTIVE status.",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    logger.info("Admin %s restored user id=%s (%s)", current_admin.email, target_user.id, target_user.email)
    return _format_admin_user(target_user, db)


@router.delete(
    "/users/{user_id}/permanent-delete",
    summary="Permanently delete a soft-deleted user",
)
def permanent_delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Permanently deletes a soft-deleted user after verification:
    - User must be in SOFT_DELETED state.
    - Detection history is preserved (ForeignKey ondelete='SET NULL').
    - Password reset OTPs and Gmail access requests are cleaned up safely.
    - Logs administrative AuditLog entry.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if target_user.account_status != "SOFT_DELETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot permanently delete an active user. Soft-delete the user first.",
        )

    user_email = target_user.email
    user_name = target_user.name

    # Invalidate active Gmail session tokens
    _GMAIL_USER_TOKENS.pop(target_user.id, None)

    # Log audit entry before deletion
    audit = AuditLog(
        action="USER_PERMANENTLY_DELETED",
        target_user_id=target_user.id,
        target_user_email=user_email,
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        details=f"Permanently deleted user {user_name} ({user_email}). Preserved detection scan history.",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)

    # Delete user from DB (detections user_id is automatically set to NULL via ON DELETE SET NULL)
    db.delete(target_user)
    db.commit()

    logger.info("Admin %s permanently deleted user id=%s (%s)", current_admin.email, user_id, user_email)
    return {
        "success": True,
        "message": f"User {user_name} ({user_email}) has been permanently deleted. Historical scan data preserved.",
    }


# ==============================================================================
# 5. Audit Log Directory
# ==============================================================================

@router.get(
    "/audit-logs",
    response_model=AuditLogsResponse,
    summary="List administrative and security audit trail events",
)
def list_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action type"),
    search: Optional[str] = Query(None, description="Search by email or action details"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=50),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AuditLogsResponse:
    """
    Returns administrative and security audit events for compliance and security auditing.
    """
    query = db.query(AuditLog)

    if action and action.lower() != "all":
        query = query.filter(func.upper(AuditLog.action) == action.strip().upper())

    if search:
        s = search.strip()
        if s:
            pattern = f"%{s}%"
            query = query.filter(
                or_(
                    AuditLog.target_user_email.ilike(pattern),
                    AuditLog.admin_email.ilike(pattern),
                    AuditLog.details.ilike(pattern),
                )
            )

    total = query.count()
    offset = (page - 1) * limit
    logs = query.order_by(desc(AuditLog.timestamp)).offset(offset).limit(limit).all()
    total_pages = max(1, (total + limit - 1) // limit)

    return AuditLogsResponse(
        logs=[
            AuditLogItem(
                id=log.id,
                action=log.action,
                target_user_id=log.target_user_id,
                target_user_email=log.target_user_email,
                admin_id=log.admin_id,
                admin_email=log.admin_email,
                details=log.details,
                timestamp=log.timestamp.isoformat() if log.timestamp else "",
            )
            for log in logs
        ],
        total=total,
        page=page,
        totalPages=total_pages,
    )
