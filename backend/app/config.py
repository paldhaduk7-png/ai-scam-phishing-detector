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
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

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
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175"
]


def _parse_cors_origins(raw_origins: str) -> List[str]:
    """
    Parses a comma-delimited origins string into a sanitized list of origin URLs.
    Falls back to DEFAULT_ALLOWED_ORIGINS if empty or whitespace.
    """
    if not raw_origins:
        return DEFAULT_ALLOWED_ORIGINS
    origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
    return origins if origins else DEFAULT_ALLOWED_ORIGINS


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

        # Cookie Settings
        cookie_sec_raw = os.getenv("COOKIE_SECURE", "False").lower()
        self.cookie_secure: bool = cookie_sec_raw in ("true", "1", "yes")
        self.cookie_samesite: str = os.getenv("COOKIE_SAMESITE", "lax").lower()
        self.cookie_name: str = "access_token"

        # Cloudinary Settings
        self.cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        self.cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
        self.cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")

        # SMTP & Password Reset Email Settings
        self.mail_username: str = os.getenv("MAIL_USERNAME", "")
        self.mail_password: str = os.getenv("MAIL_PASSWORD", "")
        self.mail_from: str = os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME", "no-reply@scamshield.ai"))
        self.mail_server: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        self.mail_port: int = int(os.getenv("MAIL_PORT", "587"))
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")


# Singleton application settings instance
settings = Settings()

