"""
Centralized Backend Configuration Module.
Provides application-level settings, API metadata, and CORS parameters
with safe local-development defaults and environment variable overrides.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load backend/.env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
else:
    load_dotenv(override=True)

API_TITLE_DEFAULT = "AI Scam & Phishing Detector API"
API_VERSION_DEFAULT = "1.0.0"

API_DESCRIPTION_DEFAULT = """
## Overview
The **AI Scam & Phishing Detector API** is a production-ready RESTful cybersecurity service designed to detect and analyze deceptive online threats in real time. Powered by trained machine learning and deep learning models, the service identifies potential phishing, fraud, and scam content across three primary digital communication channels:

- **Email**: Analyzes email subject lines and body text to identify phishing lures, spoofed sender notices, fake security alerts, and credential harvesting schemes.
- **SMS / Text Messages**: Identifies mobile smishing attacks, urgent payment demands, lottery/prize scams, and fake delivery notifications.
- **URLs**: Inspects web addresses and hyperlinks for suspicious lexical patterns, typosquatting domains, deceptive login pages, and malicious redirectors.

---

## Detection Endpoints & Model Architectures

The API provides two dedicated detection endpoints tailored for distinct modeling techniques:

1. **Standard Unified Detection (`POST /api/v1/detect`)**
   - **Supported Channels**: `email`, `sms`, and `url`
   - **Model Architecture**: Multi-channel machine learning pipelines combining TF-IDF n-gram vectorization, structural/lexical URL feature extraction, and optimized scikit-learn / XGBoost classifiers.
   - **Use Case**: General multi-vector threat detection with low inference latency and balanced precision.

2. **Deep Learning Bi-LSTM Detection (`POST /api/v1/detect/dl`)**
   - **Supported Channels**: `email` only (*rejects `sms` and `url` with HTTP 400 Bad Request*)
   - **Model Architecture**: 128-unit Bidirectional Long Short-Term Memory (Bi-LSTM) recurrent neural network with word tokenization, dense embeddings, and dropout regularization.
   - **Use Case**: In-depth sequential semantic analysis of long-form email phishing lures.
""".strip()

DEFAULT_ALLOWED_ORIGINS: List[str] = [
    "https://ai-scam-phishing-detector.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]


def _parse_cors_origins(raw_origins: str) -> List[str]:
    """
    Parses a comma-delimited origins string into a sanitized list of origin URLs.
    Normalizes by stripping whitespace and trailing slashes.
    Always includes default development and production Vercel origins.
    """
    origins_set = {orig.rstrip("/") for orig in DEFAULT_ALLOWED_ORIGINS}
    if raw_origins:
        for orig in raw_origins.split(","):
            cleaned = orig.strip().rstrip("/")
            if cleaned:
                origins_set.add(cleaned)
    return list(origins_set)


class Settings:
    """
    Application settings container with environment variable overrides.
    """
    def __init__(self) -> None:
        self.api_title: str = os.getenv("API_TITLE", API_TITLE_DEFAULT)
        self.api_version: str = os.getenv("API_VERSION", API_VERSION_DEFAULT)
        self.api_description: str = os.getenv("API_DESCRIPTION", API_DESCRIPTION_DEFAULT)
        
        # CORS origins (supports CORS_ORIGINS or ALLOWED_ORIGINS)
        raw_origins = os.getenv("CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS")
        self.allowed_origins: List[str] = (
            _parse_cors_origins(raw_origins) if raw_origins else list(DEFAULT_ALLOWED_ORIGINS)
        )

        # JWT Settings
        self.jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "fallback-secret-key-for-dev-change-in-env")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

        # Environment Detection (Render sets RENDER=true automatically)
        is_render = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_URL"))

        # Cookie Settings
        cookie_sec_default = "True" if is_render else "False"
        cookie_sec_raw = os.getenv("COOKIE_SECURE", cookie_sec_default).lower()
        self.cookie_secure: bool = cookie_sec_raw in ("true", "1", "yes")

        cookie_samesite_default = "none" if is_render else "lax"
        self.cookie_samesite: str = os.getenv("COOKIE_SAMESITE", cookie_samesite_default).lower()
        self.cookie_name: str = "access_token"

        # Cloudinary Settings
        self.cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        self.cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
        self.cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")

        # SMTP & Password Reset Email Settings
        self.mail_username: str = (os.getenv("MAIL_USERNAME") or "").strip()
        # Clean app password (remove spaces often provided by Google like 'abcd efgh ijkl mnop')
        self.mail_password: str = (os.getenv("MAIL_PASSWORD") or "").replace(" ", "").strip()
        self.mail_from: str = (os.getenv("MAIL_FROM") or self.mail_username or "no-reply@scamshield.ai").strip()
        self.mail_server: str = (os.getenv("MAIL_SERVER") or "smtp.gmail.com").strip()
        self.mail_port: int = int(os.getenv("MAIL_PORT", "587"))

        default_frontend = "https://ai-scam-phishing-detector.vercel.app" if is_render else "http://localhost:5173"
        self.frontend_url: str = os.getenv("FRONTEND_URL", default_frontend)

        # Google OAuth 2.0 Settings
        self.google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
        self.google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
        default_redirect_uri = (
            "https://ai-scam-phishing-detector.onrender.com/api/v1/auth/google/callback"
            if is_render
            else "http://localhost:8000/api/v1/auth/google/callback"
        )
        self.google_redirect_uri: str = os.getenv("GOOGLE_REDIRECT_URI", default_redirect_uri)

        default_gmail_redirect_uri = (
            "https://ai-scam-phishing-detector.onrender.com/api/v1/gmail/callback"
            if is_render
            else "http://localhost:8000/api/v1/gmail/callback"
        )
        self.google_gmail_redirect_uri: str = os.getenv("GOOGLE_GMAIL_REDIRECT_URI", default_gmail_redirect_uri)

        self.google_auth_base_url: str = os.getenv(
            "GOOGLE_AUTH_BASE_URL", "https://accounts.google.com/o/oauth2/v2/auth"
        ).strip()
        self.google_token_url: str = os.getenv(
            "GOOGLE_TOKEN_URL", "https://oauth2.googleapis.com/token"
        ).strip()
        self.gmail_api_base_url: str = os.getenv(
            "GMAIL_API_BASE_URL", "https://gmail.googleapis.com/gmail/v1/users/me"
        ).strip()
        self.gmail_readonly_scope: str = os.getenv(
            "GMAIL_READONLY_SCOPE", "https://www.googleapis.com/auth/gmail.readonly"
        ).strip()

        # Deep Learning Model Control (set DISABLE_DL=true on memory-constrained platforms like Render Free tier)
        disable_dl_raw = os.getenv("DISABLE_DL", "false").strip().lower()
        self.disable_dl: bool = disable_dl_raw in ("true", "1", "yes")


# Singleton application settings instance
settings = Settings()

