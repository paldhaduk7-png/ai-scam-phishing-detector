"""
Google OAuth 2.0 Service.
Handles Google authorization URL generation, code exchange for access/ID tokens,
and retrieval of verified user profile data.
"""

import logging
from typing import Any, Dict
from urllib.parse import urlencode

import httpx

from app.config import settings

logger = logging.getLogger("scamshield.google_auth_service")

GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_authorization_url(state: str) -> str:
    """
    Constructs the standard Google OAuth 2.0 authorization URL with required scopes and state.
    """
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    return f"{GOOGLE_AUTH_BASE_URL}?{urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    """
    Exchanges an authorization code for Google access and ID tokens.
    Never logs client secret or raw token payloads.
    """
    payload = {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.google_redirect_uri,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(GOOGLE_TOKEN_URL, data=payload)
        if response.status_code != 200:
            logger.warning(
                "Google token exchange failed with status %d: %s",
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()


async def get_google_user_info(access_token: str) -> Dict[str, Any]:
    """
    Retrieves the verified user profile from Google's OpenID userinfo endpoint.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(GOOGLE_USERINFO_URL, headers=headers)
        if response.status_code != 200:
            logger.warning(
                "Google userinfo request failed with status %d: %s",
                response.status_code,
                response.text,
            )
            response.raise_for_status()
        return response.json()
