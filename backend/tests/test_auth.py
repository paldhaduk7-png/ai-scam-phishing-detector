"""
Comprehensive Automated Test Suite for ScamShield Authentication & Authorization.
Tests user registration, login, logout, cookie security, profile management,
guest detection, authenticated detection, and strict multi-tenant history isolation.
"""

from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.main import app
from app.models import Detection, User
from app.services.auth_service import hash_password

client = TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session for tests and cleans up test data."""
    session = SessionLocal()
    try:
        yield session
    finally:
        # Clean up test users created during test run
        test_users = session.query(User).filter(User.email.like("test_%@example.com")).all()
        for u in test_users:
            session.query(Detection).filter(Detection.user_id == u.id).delete()
            session.delete(u)
        session.commit()
        session.close()


def test_register_successfully(db_session):
    """1. Test successful user registration."""
    email = "test_register_ok@example.com"
    # Ensure clean slate
    db_session.query(User).filter(User.email == email).delete()
    db_session.commit()

    payload = {
        "name": "Jane Doe",
        "email": email,
        "password": "SecretPassword123",
        "confirm_password": "SecretPassword123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["email"] == email
    assert data["name"] == "Jane Doe"
    assert "id" in data
    assert "password_hash" not in data
    assert "password" not in data


def test_register_duplicate_email(db_session):
    """2. Test duplicate email registration returns HTTP 409 Conflict."""
    email = "test_duplicate@example.com"
    # Register once
    client.post("/api/v1/auth/register", json={
        "name": "First User",
        "email": email,
        "password": "Password123",
    })

    # Register again with same email
    response = client.post("/api/v1/auth/register", json={
        "name": "Second User",
        "email": email,
        "password": "Password123",
    })
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_register_invalid_payload():
    """3. Test invalid registration payload returns HTTP 422."""
    response = client.post("/api/v1/auth/register", json={
        "name": "Bad User",
        "email": "not-an-email",
        "password": "123",  # too short
    })
    assert response.status_code == 422


def test_login_successfully(db_session):
    """4. Test successful login sets HTTP-only cookie and does not expose JWT in response body."""
    email = "test_login_success@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Login Tester",
        "email": email,
        "password": "MySecurePassword123",
    })

    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "MySecurePassword123",
    })
    assert response.status_code == 200
    data = response.json()

    # JWT must NOT be in JSON response
    assert "token" not in data
    assert "access_token" not in data
    assert "password_hash" not in data
    assert data["email"] == email

    # Cookie must be set as HttpOnly
    assert "access_token" in response.cookies
    cookie_header = response.headers.get("set-cookie", "")
    assert "HttpOnly" in cookie_header or "httponly" in cookie_header.lower()


def test_login_incorrect_password(db_session):
    """5. Test incorrect password returns HTTP 401."""
    email = "test_wrong_pwd@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Tester",
        "email": email,
        "password": "CorrectPassword123",
    })

    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword123",
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_auth_me_with_valid_cookie(db_session):
    """6. Test GET /api/v1/auth/me with valid cookie returns user profile."""
    email = "test_me_ok@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Profile Tester",
        "email": email,
        "password": "Password123",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123",
    })
    cookies = login_resp.cookies

    response = client.get("/api/v1/auth/me", cookies=cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["name"] == "Profile Tester"
    assert "password_hash" not in data


def test_auth_me_without_cookie():
    """7. Test GET /api/v1/auth/me without cookie returns HTTP 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout_clears_cookie(db_session):
    """8. Test POST /api/v1/auth/logout clears the access_token cookie."""
    email = "test_logout@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Logout Tester",
        "email": email,
        "password": "Password123",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123",
    })

    response = client.post("/api/v1/auth/logout", cookies=login_resp.cookies)
    assert response.status_code == 200
    # Cookie should be deleted/expired in response
    set_cookie = response.headers.get("set-cookie", "")
    assert 'access_token=""' in set_cookie or "max-age=0" in set_cookie.lower()


@patch("app.routers.auth.upload_profile_photo")
def test_profile_photo_upload(mock_upload, db_session):
    """9. Test profile photo upload updates user profile_photo."""
    mock_upload.return_value = {
        "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "public_id": "scamshield/avatars/user_test",
    }
    email = "test_avatar@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Avatar User",
        "email": email,
        "password": "Password123",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123",
    })

    files = {"file": ("avatar.png", b"fake-image-bytes", "image/png")}
    response = client.post("/api/v1/auth/profile-photo", files=files, cookies=login_resp.cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["profile_photo"] == "https://res.cloudinary.com/demo/image/upload/sample.jpg"


@patch("app.routers.auth.delete_profile_photo")
def test_profile_photo_deletion(mock_delete, db_session):
    """10. Test profile photo deletion resets photo to None."""
    mock_delete.return_value = True
    email = "test_del_photo@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Delete Photo User",
        "email": email,
        "password": "Password123",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123",
    })

    response = client.delete("/api/v1/auth/profile-photo", cookies=login_resp.cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["profile_photo"] is None


def test_public_detection_guest_mode(db_session):
    """11. Test detection WITHOUT authentication works (Guest) and records user_id=None."""
    payload = {
        "content": "Click here to claim your reward http://free-gift.xyz",
        "content_type": "sms",
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_percentage" in data
    assert "classification" in data

    # Verify database recorded user_id as None for guest
    latest = (
        db_session.query(Detection)
        .filter(Detection.input_text == payload["content"])
        .order_by(Detection.id.desc())
        .first()
    )
    assert latest is not None
    assert latest.user_id is None


def test_authenticated_detection_saves_user_id(db_session):
    """12. Test detection WITH authentication links Detection.user_id = current_user.id."""
    email = "test_detect_user@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Scan User",
        "email": email,
        "password": "Password123",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123",
    })
    user_id = login_resp.json()["id"]

    unique_content = f"Auth scan test unique string {user_id} urgent bank alert"
    payload = {
        "content": unique_content,
        "content_type": "email",
    }
    response = client.post("/api/v1/detect", json=payload, cookies=login_resp.cookies)
    assert response.status_code == 200

    # Verify database recorded user_id = user_id
    latest = (
        db_session.query(Detection)
        .filter(Detection.input_text == unique_content)
        .first()
    )
    assert latest is not None
    assert latest.user_id == user_id


def test_detection_history_requires_auth():
    """13. Test detection history rejects unauthenticated access with HTTP 401."""
    response = client.get("/api/v1/detections/history")
    assert response.status_code == 401


def test_detection_history_isolation_between_users(db_session):
    """14 & 15. Test detection history only returns current user's scans and isolates User A from User B."""
    # Create User A
    email_a = "test_user_a@example.com"
    client.post("/api/v1/auth/register", json={"name": "User A", "email": email_a, "password": "Password123"})
    login_a = client.post("/api/v1/auth/login", json={"email": email_a, "password": "Password123"})

    # Create User B
    email_b = "test_user_b@example.com"
    client.post("/api/v1/auth/register", json={"name": "User B", "email": email_b, "password": "Password123"})
    login_b = client.post("/api/v1/auth/login", json={"email": email_b, "password": "Password123"})

    # User A performs a detection
    content_a = "Urgent notice for User A only: http://scam-a.xyz"
    client.post("/api/v1/detect", json={"content": content_a, "content_type": "email"}, cookies=login_a.cookies)

    # User B performs a detection
    content_b = "Urgent notice for User B only: http://scam-b.xyz"
    client.post("/api/v1/detect", json={"content": content_b, "content_type": "email"}, cookies=login_b.cookies)

    # User A queries history
    history_a = client.get("/api/v1/detections/history", cookies=login_a.cookies).json()
    texts_a = [item["input_text"] for item in history_a["items"]]
    assert content_a in texts_a
    assert content_b not in texts_a

    # User B queries history
    history_b = client.get("/api/v1/detections/history", cookies=login_b.cookies).json()
    texts_b = [item["input_text"] for item in history_b["items"]]
    assert content_b in texts_b
    assert content_a not in texts_b
