"""
Gmail OAuth 2.0 & REST API Service.
Handles Gmail read-only authorization URL generation, authorization code exchange,
and secure fetching of inbox messages for scam & phishing threat analysis.
"""

import base64
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
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


def _clean_html_to_text(html_content: str) -> str:
    """
    Converts raw HTML email content into clean, human-readable plain text.
    Strips out style, script, head, meta, and SVG tags to ensure no CSS or HTML markup leaks into the email body.
    Preserves links and formatting nicely for detection and user display.
    """
    if not html_content:
        return ""
    if BeautifulSoup is not None:
        try:
            soup = BeautifulSoup(html_content, "html.parser")
            # Remove elements that contain code, styles, or hidden headers
            for tag in soup(["style", "script", "head", "title", "meta", "noscript", "svg"]):
                tag.decompose()

            # Format links cleanly if anchor text exists
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                link_text = a.get_text().strip()
                if href and not href.startswith(("mailto:", "tel:", "javascript:")):
                    if link_text and link_text != href:
                        a.replace_with(f"[{link_text}]({href})")
                    elif link_text:
                        a.replace_with(link_text)
                    else:
                        a.replace_with(href)

            # Add newline to structural block tags
            for block in soup(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "br"]):
                block.append("\n")

            raw_text = soup.get_text()
            lines = [line.strip() for line in raw_text.splitlines()]
            clean_lines = [line for line in lines if line]
            return "\n\n".join(clean_lines)
        except Exception as exc:
            logger.warning("Error stripping HTML to plain text: %s", exc)

    # Fallback regex strip
    clean = re.sub(r"(?is)<(style|script|head).*?>.*?</\1>", "", html_content)
    clean = re.sub(r"<[^>]+>", " ", clean)
    return " ".join(clean.split())



def _extract_body_text(payload: Dict[str, Any]) -> str:
    """
    Recursively extracts clean plain text from MIME parts or body data.
    Correctly handles multipart/alternative by picking the richest text content
    without duplicating or leaking raw HTML/CSS into the body text.
    """
    mime_type = (payload.get("mimeType") or "").lower()
    body_data = payload.get("body", {}).get("data")

    # If this part is plain text and has data
    if mime_type == "text/plain" and body_data:
        try:
            decoded = base64.urlsafe_b64decode(body_data.encode("ASCII")).decode("utf-8", errors="replace")
            # If the plain text payload somehow contains raw HTML tags, clean it
            if "<html" in decoded.lower() or "<style" in decoded.lower() or "<div" in decoded.lower() or "<body" in decoded.lower():
                return _clean_html_to_text(decoded)
            return decoded.strip()
        except Exception:
            return ""

    # If this part is text/html and has data
    if mime_type == "text/html" and body_data:
        try:
            decoded = base64.urlsafe_b64decode(body_data.encode("ASCII")).decode("utf-8", errors="replace")
            return _clean_html_to_text(decoded)
        except Exception:
            return ""

    parts = payload.get("parts", [])

    # If multipart/alternative: select the richest clean text rather than concatenating
    if mime_type == "multipart/alternative":
        plain_text = ""
        html_text = ""
        for part in parts:
            p_mime = (part.get("mimeType") or "").lower()
            if p_mime == "text/plain":
                plain_text = _extract_body_text(part)
            elif p_mime == "text/html":
                html_text = _extract_body_text(part)
            else:
                sub = _extract_body_text(part)
                if not plain_text:
                    plain_text = sub

        # If HTML gave rich text and plain text is just a short stub (< 150 chars, e.g. "View in browser"),
        # prefer the cleaned HTML version which contains the actual email body
        if html_text and (len(html_text) > len(plain_text) or len(plain_text) < 150):
            return html_text
        return plain_text or html_text

    # For other multipart types (mixed, related, etc.), extract all subparts
    if parts:
        text_content = []
        for part in parts:
            extracted = _extract_body_text(part)
            if extracted:
                text_content.append(extracted)
        if text_content:
            return "\n\n".join(text_content)

    # Fallback to direct body data
    if body_data:
        try:
            decoded = base64.urlsafe_b64decode(body_data.encode("ASCII")).decode("utf-8", errors="replace")
            if "<html" in decoded.lower() or "<style" in decoded.lower() or "<div" in decoded.lower() or "<body" in decoded.lower():
                return _clean_html_to_text(decoded)
            return decoded.strip()
        except Exception:
            return ""

    return ""

