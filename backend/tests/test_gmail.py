"""
Automated Unit & Integration Tests for Gmail OAuth 2.0 and REST API Foundation.
Tests authorization URL builder, CSRF state protection, callback handling,
and separation from standard Google Sign-In.
"""

from datetime import datetime, timedelta, timezone
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.models import User
from app.services.auth_service import create_access_token, hash_password
from app.services.gmail_service import (
    build_gmail_authorization_url,
    parse_gmail_message,
)
from app.routers.gmail import _GMAIL_OAUTH_STATES, _GMAIL_USER_TOKENS

client = TestClient(app)


def test_build_gmail_authorization_url():
    """Verifies that Gmail OAuth URL includes correct scopes and dedicated redirect URI."""
    url = build_gmail_authorization_url("test_state_123")
    assert "accounts.google.com" in url
    assert "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly" in url or "gmail.readonly" in url
    assert "test_state_123" in url
    assert "prompt=consent" in url
    assert "access_type=offline" in url


def test_gmail_connect_requires_auth():
    """Unauthenticated users must not be able to initiate Gmail connection."""
    response = client.get("/api/v1/gmail/connect", follow_redirects=False)
    assert response.status_code == 401


def test_gmail_connect_authenticated():
    """Authenticated users receive a state cookie and are redirected to Google."""
    mock_user = User(id=123, name="Test Gmail", email="test@example.com")
    from app.services.auth_service import get_current_user

    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        with patch("app.routers.gmail.settings.google_client_id", "mock-client-id"), \
             patch("app.routers.gmail.settings.google_client_secret", "mock-client-secret"):
            response = client.get(
                "/api/v1/gmail/connect",
                follow_redirects=False,
            )

            assert response.status_code == 303
            assert "accounts.google.com" in response.headers["location"]
            assert "gmail_oauth_state" in response.cookies
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_gmail_callback_user_denial():
    """Callback handles access_denied gracefully and redirects with error."""
    response = client.get(
        "/api/v1/gmail/callback?error=access_denied",
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert "gmail_error=" in response.headers["location"]
    assert "denied" in response.headers["location"].lower() or "cancelled" in response.headers["location"].lower()


def test_gmail_callback_state_mismatch():
    """State mismatch or missing cookie fails with an error redirect."""
    response = client.get(
        "/api/v1/gmail/callback?code=mock_code&state=wrong_state",
        cookies={"gmail_oauth_state": "expected_state"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert "gmail_error=" in response.headers["location"]


def test_gmail_callback_success():
    """Valid state and code exchanges token and saves to temporary user storage."""
    user_id = 999
    state = "valid_secure_state_xyz"
    _GMAIL_OAUTH_STATES[state] = {
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }

    mock_tokens = {
        "access_token": "mock_gmail_access_token",
        "refresh_token": "mock_gmail_refresh_token",
        "expires_in": 3600,
    }

    with patch("app.routers.gmail.exchange_gmail_code_for_tokens", new=AsyncMock(return_value=mock_tokens)):
        response = client.get(
            f"/api/v1/gmail/callback?code=mock_code_123&state={state}",
            cookies={"gmail_oauth_state": state},
            follow_redirects=False,
        )

        assert response.status_code == 303
        assert "gmail_connected=true" in response.headers["location"]
        # Verify stored safely server-side
        assert user_id in _GMAIL_USER_TOKENS
        assert _GMAIL_USER_TOKENS[user_id]["access_token"] == "mock_gmail_access_token"


def test_parse_gmail_message():
    """Tests RFC MIME message parsing into simple subject and body dictionary."""
    mock_msg = {
        "id": "msg_001",
        "threadId": "thread_001",
        "snippet": "Preview of message",
        "payload": {
            "headers": [
                {"name": "Subject", "value": "Account Security Alert"},
                {"name": "From", "value": "security@test.com"},
                {"name": "Date", "value": "Sat, 19 Sep 2026 10:00:00 GMT"},
            ],
            "body": {"data": ""},
            "parts": [
                {
                    "mimeType": "text/plain",
                    # "Your account is at risk" in base64url
                    "body": {"data": "WW91ciBhY2NvdW50IGlzIGF0IHJpc2s="},
                }
            ],
        },
    }

    parsed = parse_gmail_message(mock_msg)
    assert parsed["id"] == "msg_001"
    assert parsed["subject"] == "Account Security Alert"
    assert parsed["from"] == "security@test.com"
    assert parsed["body"] == "Your account is at risk"


def test_gmail_analysis_job_lifecycle():
    """Tests starting, discovering active job, and multiple job protection."""
    from app.services.auth_service import get_current_user
    from app.routers.gmail import _GMAIL_USER_TOKENS, _GMAIL_JOBS, _USER_ACTIVE_JOBS

    user_id = 888
    mock_user = User(id=user_id, name="Job Tester", email="job_tester@example.com")
    _GMAIL_USER_TOKENS[user_id] = {
        "access_token": "mock_token",
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        # Mock background worker so it doesn't try connecting to real Gmail
        with patch("app.routers.gmail._run_gmail_analysis_worker", new=AsyncMock()):
            # 1. Start job
            resp = client.post("/api/v1/gmail/analysis/start")
            assert resp.status_code == 200
            data = resp.json()
            assert "job_id" in data
            job_id = data["job_id"]
            assert data["status"] in ("starting", "processing")

            # 2. Test Multiple Job Protection: starting again returns SAME job_id
            resp2 = client.post("/api/v1/gmail/analysis/start")
            assert resp2.status_code == 200
            assert resp2.json()["job_id"] == job_id

            # 3. Discover Active Job
            active_resp = client.get("/api/v1/gmail/analysis/active")
            assert active_resp.status_code == 200
            active_data = active_resp.json()
            assert active_data["active"] is True
            assert active_data["job"]["job_id"] == job_id

            # 4. Check progress
            prog_resp = client.get(f"/api/v1/gmail/analysis/progress/{job_id}")
            assert prog_resp.status_code == 200
            assert prog_resp.json()["job_id"] == job_id

            # 5. Cancel Job
            cancel_resp = client.post(f"/api/v1/gmail/analysis/cancel/{job_id}")
            assert cancel_resp.status_code == 200
            assert cancel_resp.json()["job"]["status"] == "cancelled"
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_gmail_selective_analysis():
    """Tests starting Gmail analysis with specific selected message IDs."""
    from app.services.auth_service import get_current_user
    from app.routers.gmail import _GMAIL_USER_TOKENS, _USER_ACTIVE_JOBS

    user_id = 777
    mock_user = User(id=user_id, name="Selective Tester", email="selective@example.com")
    _GMAIL_USER_TOKENS[user_id] = {
        "access_token": "mock_token_selective",
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "email": "selective@gmail.com",
    }
    _USER_ACTIVE_JOBS.pop(user_id, None)

    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        selected_ids = ["msg_1", "msg_2", "msg_3", "msg_4", "msg_5"]
        with patch("app.routers.gmail._run_gmail_analysis_worker", new=AsyncMock()) as mock_worker:
            resp = client.post(
                "/api/v1/gmail/analysis/start",
                json={"message_ids": selected_ids},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 5
            assert data["remaining"] == 5
            assert data["status"] == "starting"

            # Verify mock worker was called with selected_ids
            mock_worker.assert_called_once()
            args, kwargs = mock_worker.call_args
            assert kwargs.get("selected_ids") == selected_ids
    finally:
        app.dependency_overrides.pop(get_current_user, None)


