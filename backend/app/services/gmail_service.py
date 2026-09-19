"""
Gmail OAuth 2.0 & REST API Service.
Handles Gmail read-only authorization URL generation, authorization code exchange,
and secure fetching of inbox messages for scam & phishing threat analysis.
"""

import base64
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx

from app.config import settings

logger = logging.getLogger("scamshield.gmail_service")


def build_gmail_authorization_url(state: str) -> str:
    """
    Constructs the Google OAuth 2.0 authorization URL requesting read-only Gmail access.
    Explicitly uses the dedicated Gmail redirect URI to avoid any collision with login.
    """
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_gmail_redirect_uri,
        "response_type": "code",
        "scope": settings.gmail_readonly_scope,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{settings.google_auth_base_url}?{urlencode(params)}"


async def exchange_gmail_code_for_tokens(code: str) -> Dict[str, Any]:
    """
    Exchanges a Gmail authorization code for Google access and refresh tokens.
    Never logs client secrets, authorization codes, or raw token payloads.
    """
    payload = {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.google_gmail_redirect_uri,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(settings.google_token_url, data=payload)
        if response.status_code != 200:
            logger.warning(
                "Gmail token exchange failed with status %d: %s",
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()


async def list_gmail_messages(
    access_token: str,
    max_results: int = 20,
    query: Optional[str] = None,
    page_token: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Retrieves a list of message IDs from the user's Gmail mailbox with pagination support.
    Endpoint: GET https://gmail.googleapis.com/gmail/v1/users/me/messages
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    params: Dict[str, Any] = {"maxResults": min(max(1, max_results), 100)}
    if query:
        params["q"] = query
    if page_token:
        params["pageToken"] = page_token

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(f"{settings.gmail_api_base_url}/messages", headers=headers, params=params)
        if response.status_code != 200:
            logger.warning("Failed to list Gmail messages (status %d): %s", response.status_code, response.text)
            response.raise_for_status()
        return response.json()


async def get_gmail_profile(access_token: str) -> Dict[str, Any]:
    """
    Fetches the user's Gmail profile, including emailAddress.
    Endpoint: GET https://gmail.googleapis.com/gmail/v1/users/me/profile
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{settings.gmail_api_base_url}/profile",
            headers=headers,
        )
        if response.status_code == 200:
            return response.json()
        logger.warning(
            "Failed to fetch Gmail profile (status %d): %s",
            response.status_code,
            response.text,
        )
        return {}


async def get_gmail_message_metadata(
    access_token: str,
    message_id: str,
    client: Optional[httpx.AsyncClient] = None,
) -> Dict[str, Any]:
    """
    Fetches only lightweight message metadata and headers (From, Subject, Date)
    without downloading the entire email MIME body.
    Endpoint: GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}?format=metadata
    Supports reusing an existing httpx.AsyncClient to benefit from connection pooling and HTTP/2 keep-alive.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "format": "metadata",
        "metadataHeaders": ["Subject", "From", "Date"],
    }

    if client is not None:
        response = await client.get(
            f"{settings.gmail_api_base_url}/messages/{message_id}",
            headers=headers,
            params=params,
        )
        if response.status_code != 200:
            logger.warning(
                "Failed to fetch Gmail message metadata %s (status %d): %s",
                message_id,
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()

    async with httpx.AsyncClient(timeout=15.0) as local_client:
        response = await local_client.get(
            f"{settings.gmail_api_base_url}/messages/{message_id}",
            headers=headers,
            params=params,
        )
        if response.status_code != 200:
            logger.warning(
                "Failed to fetch Gmail message metadata %s (status %d): %s",
                message_id,
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()


async def get_gmail_message(access_token: str, message_id: str) -> Dict[str, Any]:
    """
    Fetches the full message metadata and content for a given message ID.
    Endpoint: GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"format": "full"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{settings.gmail_api_base_url}/messages/{message_id}",
            headers=headers,
            params=params,
        )
        if response.status_code != 200:
            logger.warning(
                "Failed to fetch Gmail message %s (status %d): %s",
                message_id,
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()



def parse_gmail_message(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses a raw Gmail message response into structured data:
    subject, sender, date, snippet, and plain text content for ML detection.
    """
    headers_list = message_data.get("payload", {}).get("headers", [])
    headers_dict = {h.get("name", "").lower(): h.get("value", "") for h in headers_list}

    subject = headers_dict.get("subject", "No Subject")
    sender = headers_dict.get("from", "Unknown Sender")
    date_str = headers_dict.get("date", "")
    snippet = message_data.get("snippet", "")

    # Extract body text
    body = _extract_body_text(message_data.get("payload", {}))
    if not body:
        body = snippet

    return {
        "id": message_data.get("id"),
        "thread_id": message_data.get("threadId"),
        "subject": subject,
        "from": sender,
        "date": date_str,
        "snippet": snippet,
        "body": body.strip(),
    }


def _extract_body_text(payload: Dict[str, Any]) -> str:
    """Recursively extracts plain text from MIME parts or body data."""
    mime_type = payload.get("mimeType", "")
    body_data = payload.get("body", {}).get("data")

    # If this part is plain text and has data
    if mime_type == "text/plain" and body_data:
        try:
            return base64.urlsafe_b64decode(body_data.encode("ASCII")).decode("utf-8", errors="replace")
        except Exception:
            return ""

    # If multipart, check subparts
    parts = payload.get("parts", [])
    text_content = []
    for part in parts:
        extracted = _extract_body_text(part)
        if extracted:
            text_content.append(extracted)

    if text_content:
        return "\n".join(text_content)

    # Fallback to text/html stripped or direct body
    if body_data:
        try:
            return base64.urlsafe_b64decode(body_data.encode("ASCII")).decode("utf-8", errors="replace")
        except Exception:
            return ""

    return ""
