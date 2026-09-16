"""
Automated Backend API Test Suite for AI Scam & Phishing Detector.
Covers health checks, standard ML multi-channel detection, Deep Learning Bi-LSTM detection,
input schema validation, and sanitized error handling.
"""

from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ==============================================================================
# 1. Health Endpoint Tests
# ==============================================================================

def test_health_check_returns_200():
    """Verify GET /health returns HTTP 200 with operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert "service" in data


# ==============================================================================
# 2. Standard ML Detection Endpoint Tests (/api/v1/detect)
# ==============================================================================

def test_detect_valid_email():
    """Verify POST /api/v1/detect processes valid email content and returns HTTP 200."""
    payload = {
        "content": "URGENT: Your account has been compromised. Log in immediately to verify your identity.",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("is_phishing"), bool)
    assert isinstance(data.get("risk_percentage"), (int, float))


def test_detect_valid_sms():
    """Verify POST /api/v1/detect processes valid SMS content and returns HTTP 200."""
    payload = {
        "content": "Congratulations! You won a $1,000 gift card. Claim now at http://win-card.xyz",
        "content_type": "sms"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("is_phishing"), bool)
    assert "is_spam" in data


def test_detect_valid_url():
    """Verify POST /api/v1/detect processes valid URL content and returns HTTP 200."""
    payload = {
        "content": "http://secure-login-chase-update.info/login.php",
        "content_type": "url"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("is_phishing"), bool)
    assert "risk_percentage" in data
    assert 0.0 <= data["risk_percentage"] <= 100.0


def test_detect_phishing_email_response_structure():
    """Verify phishing email response contains all required DetectionResponse fields."""
    payload = {
        "content": "Dear customer, your bank account is suspended. Click here to confirm credentials.",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()

    expected_fields = {
        "predicted_label",
        "classification",
        "score",
        "score_type",
        "risk_percentage",
        "is_phishing",
        "is_spam",
        "error"
    }
    assert expected_fields.issubset(data.keys())
    assert data["predicted_label"] in (0, 1)
    assert isinstance(data["classification"], str)
    assert 0.0 <= data["risk_percentage"] <= 100.0


def test_detect_sms_contains_is_spam():
    """Verify SMS response specifically contains the is_spam field."""
    payload = {
        "content": "Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121",
        "content_type": "sms"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "is_spam" in data
    assert isinstance(data["is_spam"], bool)


def test_detect_url_contains_risk_percentage():
    """Verify URL response contains a normalized risk_percentage."""
    payload = {
        "content": "https://www.google.com",
        "content_type": "url"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_percentage" in data
    assert isinstance(data["risk_percentage"], (int, float))
    assert 0.0 <= data["risk_percentage"] <= 100.0


# ==============================================================================
# 3. Deep Learning Bi-LSTM Endpoint Tests (/api/v1/detect/dl)
# ==============================================================================

def test_detect_dl_valid_email():
    """Verify POST /api/v1/detect/dl successfully analyzes email using Bi-LSTM."""
    payload = {
        "content": "Subject: Security Alert\nYour PayPal account has been limited due to suspicious access.",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect/dl", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score_type" in data
    assert "Bi-LSTM" in data["score_type"]
    assert "probability" in data["score_type"].lower()
    assert isinstance(data["is_phishing"], bool)
    assert 0.0 <= data["risk_percentage"] <= 100.0


def test_detect_dl_rejects_sms():
    """Verify POST /api/v1/detect/dl rejects SMS content with HTTP 400."""
    payload = {
        "content": "URGENT: Your parcel delivery is pending. Confirm at http://parcel.info",
        "content_type": "sms"
    }
    response = client.post("/api/v1/detect/dl", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "email" in data.get("detail", "").lower()


def test_detect_dl_rejects_url():
    """Verify POST /api/v1/detect/dl rejects URL content with HTTP 400."""
    payload = {
        "content": "http://suspicious-malicious-site.xyz/phish",
        "content_type": "url"
    }
    response = client.post("/api/v1/detect/dl", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "email" in data.get("detail", "").lower()


def test_detect_dl_disabled_returns_503(monkeypatch):
    """Verify POST /api/v1/detect/dl returns HTTP 503 when DISABLE_DL=True."""
    from app.config import settings
    monkeypatch.setattr(settings, "disable_dl", True)

    payload = {
        "content": "Subject: Account Alert\nYour PayPal account has been locked. Verify immediately.",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect/dl", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert data.get("detail") == "Deep Learning detection is unavailable in the production deployment."


def test_ml_endpoints_work_when_dl_disabled(monkeypatch):
    """Verify standard ML detection (/api/v1/detect) works normally even when DISABLE_DL=True."""
    from app.config import settings
    monkeypatch.setattr(settings, "disable_dl", True)

    channels = [
        ("email", "Subject: Notice\nYour monthly statement is ready."),
        ("sms", "Your verification code is 492019. Valid for 5 minutes."),
        ("url", "https://google.com/search")
    ]
    for c_type, content in channels:
        res = client.post("/api/v1/detect", json={"content": content, "content_type": c_type})
        assert res.status_code == 200
        data = res.json()
        assert "is_phishing" in data
        assert "risk_percentage" in data


# ==============================================================================
# 4. Request Validation Tests (HTTP 422)
# ==============================================================================

def test_detect_empty_content_returns_422():
    """Verify empty content string triggers HTTP 422 Unprocessable Entity."""
    payload = {
        "content": "",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_detect_whitespace_content_returns_422():
    """Verify whitespace-only content string triggers HTTP 422 Unprocessable Entity."""
    payload = {
        "content": "     \t\n   ",
        "content_type": "email"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_detect_invalid_content_type_returns_422():
    """Verify unsupported content_type enum value triggers HTTP 422 Unprocessable Entity."""
    payload = {
        "content": "Check out this suspicious message",
        "content_type": "telegram"
    }
    response = client.post("/api/v1/detect", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_detect_missing_required_fields_returns_422():
    """Verify omission of required content or content_type triggers HTTP 422."""
    # Missing content
    response = client.post("/api/v1/detect", json={"content_type": "email"})
    assert response.status_code == 422

    # Missing content_type
    response = client.post("/api/v1/detect", json={"content": "Some text"})
    assert response.status_code == 422


# ==============================================================================
# 5. Error Handling & Sanitization Tests (HTTP 500)
# ==============================================================================

def test_detect_ml_inference_error_is_sanitized():
    """
    Verify unexpected ML inference failure returns sanitized HTTP 500
    without leaking python tracebacks, file paths, or internal exceptions.
    """
    sensitive_error_msg = "Critical internal fault in /home/user/secret_models/pipeline.py: CUDA out of memory"
    
    with patch("app.main.detect_unified", side_effect=RuntimeError(sensitive_error_msg)):
        response = client.post(
            "/api/v1/detect",
            json={"content": "test email content", "content_type": "email"}
        )
        assert response.status_code == 500
        data = response.json()
        assert data == {"detail": "Detection service temporarily unavailable."}
        # Guarantee sensitive strings are not leaked anywhere in response body
        assert "CUDA" not in response.text
        assert "secret_models" not in response.text
        assert "Traceback" not in response.text


def test_detect_dl_inference_error_is_sanitized():
    """
    Verify unexpected Deep Learning inference failure returns sanitized HTTP 500
    without leaking internal paths or traceback details.
    """
    sensitive_error_msg = "TensorFlow Graph execution failed at C:\\internal\\deep_learning\\model.keras"
    
    with patch("app.main.detect_email_dl", side_effect=RuntimeError(sensitive_error_msg)):
        response = client.post(
            "/api/v1/detect/dl",
            json={"content": "test email content", "content_type": "email"}
        )
        assert response.status_code == 500
        data = response.json()
        assert data == {"detail": "Detection service temporarily unavailable."}
        assert "TensorFlow" not in response.text
        assert "internal" not in response.text
        assert "Traceback" not in response.text


# ==============================================================================
# 6. Centralized Configuration & CORS Tests
# ==============================================================================

def test_cors_allows_localhost_5173():
    """Verify CORS headers are returned for allowed development origin http://localhost:5173."""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_allows_127_0_0_1_5173():
    """Verify CORS headers are returned for allowed development origin http://127.0.0.1:5173."""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://127.0.0.1:5173"


def test_cors_rejects_arbitrary_origin():
    """Verify arbitrary origins do not receive access-control-allow-origin header."""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://malicious-website.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.headers.get("access-control-allow-origin") is None


def test_docs_and_openapi_endpoints_return_200():
    """Verify OpenAPI documentation and schema endpoints are operational."""
    resp_docs = client.get("/docs")
    assert resp_docs.status_code == 200

    resp_openapi = client.get("/openapi.json")
    assert resp_openapi.status_code == 200
    openapi_doc = resp_openapi.json()
    assert openapi_doc["info"]["title"] == "AI Scam & Phishing Detector API"
    assert "/health" in openapi_doc["paths"]
    assert "/api/v1/detect" in openapi_doc["paths"]
    assert "/api/v1/detect/dl" in openapi_doc["paths"]
