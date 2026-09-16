"""
Comprehensive Automated Test Suite for ScamShield Authentication & Authorization.
Tests user registration, login, logout, cookie security, profile management,
guest detection, authenticated detection, and strict multi-tenant history isolation.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.main import app
from app.models import Detection, PasswordResetOTP, User
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
            session.query(PasswordResetOTP).filter(PasswordResetOTP.user_id == u.id).delete()
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


def test_forgot_password_generic_response_existing_user(db_session):
    """16. Test forgot password returns generic response and creates 6-digit OTP for existing user."""
    email = "test_forgot_ok@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Forgot Tester",
        "email": email,
        "password": "Password123",
    })

    response = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert response.status_code == 200
    data = response.json()
    assert "If an account exists for this email" in data["message"]

    # Verify an OTP record was created in the database
    user = db_session.query(User).filter(User.email == email).first()
    assert user is not None
    otps = db_session.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False,
    ).all()
    assert len(otps) == 1
    assert otps[0].expires_at > datetime.now(timezone.utc)


def test_forgot_password_nonexistent_user_shows_error():
    """17. Test forgot password returns 404 'This email does not exist.' for unknown email."""
    response = client.post("/api/v1/auth/forgot-password", json={"email": "test_nonexistent_user@example.com"})
    assert response.status_code == 404
    data = response.json()
    assert "this email does not exist" in data["detail"].lower()


def test_forgot_password_resend_cooldown(db_session):
    """18. Test that requesting another OTP within 60 seconds returns HTTP 429 Too Many Requests."""
    email = "test_cooldown@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Cooldown Tester",
        "email": email,
        "password": "Password123",
    })

    # First request succeeds
    r1 = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert r1.status_code == 200

    # Immediate second request triggers cooldown rate-limit
    r2 = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert r2.status_code == 429
    assert "wait 60 seconds" in r2.json()["detail"].lower()


def test_verify_otp_endpoint(db_session):
    """19. Test POST /verify-otp validates correct 6-digit code and rejects wrong code."""
    email = "test_verify_otp@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Verify Tester",
        "email": email,
        "password": "Password123",
    })
    user = db_session.query(User).filter(User.email == email).first()

    raw_otp = "482915"
    otp_hash = hashlib.sha256(f"{user.id}:{raw_otp}".encode("utf-8")).hexdigest()
    record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        is_used=False,
    )
    db_session.add(record)
    db_session.commit()

    # Wrong OTP returns 400
    bad_resp = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp": "999999"})
    assert bad_resp.status_code == 400
    assert "invalid or expired" in bad_resp.json()["detail"].lower()

    # Correct OTP returns 200 with reset_token
    good_resp = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp": raw_otp})
    assert good_resp.status_code == 200
    assert "confirmed" in good_resp.json()["message"].lower()
    assert "reset_token" in good_resp.json()


def test_reset_password_with_valid_otp(db_session):
    """20. Test reset password with valid OTP updates password and allows login with new credentials."""
    email = "test_otp_reset_flow@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Reset Tester",
        "email": email,
        "password": "OldPassword123",
    })
    user = db_session.query(User).filter(User.email == email).first()

    raw_otp = "739201"
    otp_hash = hashlib.sha256(f"{user.id}:{raw_otp}".encode("utf-8")).hexdigest()
    record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        is_used=False,
    )
    db_session.add(record)
    db_session.commit()

    # Perform reset
    reset_resp = client.post("/api/v1/auth/reset-password", json={
        "email": email,
        "otp": raw_otp,
        "password": "NewSuperPassword123",
        "confirm_password": "NewSuperPassword123",
    })
    assert reset_resp.status_code == 200
    assert "successfully reset" in reset_resp.json()["message"].lower()

    # Verify old password fails
    old_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "OldPassword123",
    })
    assert old_login.status_code == 401

    # Verify new password succeeds
    new_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "NewSuperPassword123",
    })
    assert new_login.status_code == 200
    assert new_login.json()["email"] == email


def test_reset_password_otp_single_use(db_session):
    """21. Test that consumed OTP cannot be reused to reset password a second time."""
    email = "test_otp_reuse@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Reuse Tester",
        "email": email,
        "password": "Password123",
    })
    user = db_session.query(User).filter(User.email == email).first()

    raw_otp = "654321"
    otp_hash = hashlib.sha256(f"{user.id}:{raw_otp}".encode("utf-8")).hexdigest()
    record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        is_used=False,
    )
    db_session.add(record)
    db_session.commit()

    # First reset succeeds
    first_resp = client.post("/api/v1/auth/reset-password", json={
        "email": email,
        "otp": raw_otp,
        "password": "FirstNewPassword123",
    })
    assert first_resp.status_code == 200

    # Second reset with identical OTP fails
    second_resp = client.post("/api/v1/auth/reset-password", json={
        "email": email,
        "otp": raw_otp,
        "password": "SecondNewPassword123",
    })
    assert second_resp.status_code == 400
    assert "invalid or expired" in second_resp.json()["detail"].lower()


def test_reset_password_expired_otp_fails(db_session):
    """22. Test that an expired OTP (> 10 minutes) fails with HTTP 400."""
    email = "test_expired_otp@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Expired Tester",
        "email": email,
        "password": "Password123",
    })
    user = db_session.query(User).filter(User.email == email).first()

    raw_otp = "112233"
    otp_hash = hashlib.sha256(f"{user.id}:{raw_otp}".encode("utf-8")).hexdigest()
    expired_record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=2),  # 2 minutes expired
        is_used=False,
    )
    db_session.add(expired_record)
    db_session.commit()

    response = client.post("/api/v1/auth/reset-password", json={
        "email": email,
        "otp": raw_otp,
        "password": "AttemptedPassword123",
    })
    assert response.status_code == 400
    assert "expired" in response.json()["detail"].lower()


def test_reset_password_mismatched_confirm_password():
    """23. Test password confirmation mismatch returns HTTP 422."""
    response = client.post("/api/v1/auth/reset-password", json={
        "email": "test_mismatch@example.com",
        "otp": "123456",
        "password": "PasswordABC123",
        "confirm_password": "PasswordXYZ999",
    })
    assert response.status_code == 422


def test_google_login_redirect():
    """24. Test GET /api/v1/auth/google/login sets oauth_state cookie and redirects to Google."""
    with patch("app.routers.auth.settings.google_client_id", "mock-client-id"), \
         patch("app.routers.auth.settings.google_client_secret", "mock-client-secret"):
        response = client.get("/api/v1/auth/google/login", follow_redirects=False)
        assert response.status_code == 303
        assert "accounts.google.com" in response.headers["location"]
        assert "client_id=mock-client-id" in response.headers["location"]
        assert "response_type=code" in response.headers["location"]
        assert "oauth_state" in response.cookies


def test_google_callback_cancellation():
    """25. Test GET /api/v1/auth/google/callback with error returns error redirect to frontend."""
    response = client.get("/api/v1/auth/google/callback?error=access_denied", follow_redirects=False)
    assert response.status_code == 303
    assert "error=" in response.headers["location"]
    assert "cancelled" in response.headers["location"].lower()


def test_google_callback_state_mismatch():
    """26. Test GET /api/v1/auth/google/callback with altered state is rejected with CSRF error."""
    client.cookies.set("oauth_state", "correct_state_token")
    response = client.get("/api/v1/auth/google/callback?code=mock_code&state=wrong_state", follow_redirects=False)
    assert response.status_code == 303
    assert "error=" in response.headers["location"]
    assert "invalid" in response.headers["location"].lower() or "expired" in response.headers["location"].lower()


def test_google_callback_new_user_creation(db_session):
    """27. Test Google callback creates new user, sets auth cookie, and redirects to frontend with success."""
    state = "secure_random_state_123"
    client.cookies.set("oauth_state", state)

    mock_tokens = {"access_token": "mock_google_access_token", "id_token": "mock_id_token"}
    mock_userinfo = {
        "sub": "google-user-123456",
        "email": "test_google_new@example.com",
        "email_verified": True,
        "name": "Google Newbie",
        "picture": "https://example.com/photo.jpg",
    }

    with patch("app.routers.auth.exchange_code_for_tokens", return_value=mock_tokens), \
         patch("app.routers.auth.get_google_user_info", return_value=mock_userinfo):
        response = client.get(
            f"/api/v1/auth/google/callback?code=auth_code_123&state={state}",
            follow_redirects=False,
        )

        assert response.status_code == 303
        assert "google_auth=success" in response.headers["location"]
        assert "access_token" in response.cookies

        # Verify new user was created in PostgreSQL
        user = db_session.query(User).filter(User.email == "test_google_new@example.com").first()
        assert user is not None
        assert user.name == "Google Newbie"
        assert user.profile_photo == "https://example.com/photo.jpg"
        assert user.password_hash is not None


def test_google_callback_existing_user_preserves_password(db_session):
    """28. Test Google callback authenticates existing user without altering existing password hash."""
    email = "test_google_existing@example.com"
    original_pwd_hash = hash_password("OriginalSecretPassword123")
    user = User(
        name="Existing Account Holder",
        email=email,
        password_hash=original_pwd_hash,
    )
    db_session.add(user)
    db_session.commit()

    state = "secure_random_state_456"
    client.cookies.set("oauth_state", state)

    mock_tokens = {"access_token": "mock_google_access_token"}
    mock_userinfo = {
        "sub": "google-user-789012",
        "email": email,
        "email_verified": True,
        "name": "Existing Account Holder",
        "picture": "https://example.com/existing.jpg",
    }

    with patch("app.routers.auth.exchange_code_for_tokens", return_value=mock_tokens), \
         patch("app.routers.auth.get_google_user_info", return_value=mock_userinfo):
        response = client.get(
            f"/api/v1/auth/google/callback?code=auth_code_456&state={state}",
            follow_redirects=False,
        )

        assert response.status_code == 303
        assert "google_auth=success" in response.headers["location"]
        assert "access_token" in response.cookies

        # Verify original password hash was untouched
        db_session.refresh(user)
        assert user.password_hash == original_pwd_hash
        assert user.profile_photo == "https://example.com/existing.jpg"

