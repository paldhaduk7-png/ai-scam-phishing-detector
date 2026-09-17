"""
Pydantic API Schemas Module for AI Scam & Phishing Detector API.
Contains request and response data validation models for API endpoints.
"""

from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class DetectionRequest(BaseModel):
    """
    Incoming request schema for scanning text, emails, or URLs for scam and phishing threats.
    """
    content: str = Field(
        ...,
        description="Raw message text, email body, or URL string to analyze for potential threats.",
        examples=["URGENT: Your bank account is locked. Verify identity at http://phish-login.com"]
    )
    content_type: Literal["email", "sms", "url"] = Field(
        ...,
        description="Target content channel for classification: 'email', 'sms', or 'url'.",
        examples=["email"]
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        """
        Validates that content is non-empty, non-whitespace, and trims outer whitespace.
        """
        if not isinstance(value, str):
            raise ValueError("Content must be a valid string.")
        
        stripped = value.strip()
        if not stripped:
            raise ValueError("Content must not be empty or consist solely of whitespace.")
        
        return stripped

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "examples": [
                {
                    "content": "Subject: URGENT Account Suspension Notice\nDear Customer, your bank access has been restricted due to suspicious activities. Verify your credentials immediately at http://chase-update-security.xyz to restore full access.",
                    "content_type": "email"
                },
                {
                    "content": "USPS Notification: We were unable to deliver your package due to an invalid street address. Please update your delivery details at http://usps-delivery-portal.info/track within 24 hours.",
                    "content_type": "sms"
                },
                {
                    "content": "http://paypal-security-verification-portal.com/login",
                    "content_type": "url"
                }
            ]
        }
    )


class DetectionResponse(BaseModel):
    """
    Standardized response schema containing threat predictions, risk scores, and classifications.
    """
    predicted_label: Optional[int] = Field(
        default=None,
        description="Binary classification label: 1 for Phishing/Scam/Malicious, 0 for Safe/Legitimate, None on error.",
        examples=[1]
    )
    classification: str = Field(
        ...,
        description="Human-readable threat classification outcome.",
        examples=["Phishing / Scam Email"]
    )
    score: Optional[float] = Field(
        default=None,
        description="Underlying raw decision function value or continuous model probability score.",
        examples=[0.9854]
    )
    score_type: Optional[str] = Field(
        default=None,
        description="Explanation of score calculation (e.g., 'probability (predict_proba)', 'decision_function (LinearSVC)').",
        examples=["probability (predict_proba)"]
    )
    risk_percentage: float = Field(
        ...,
        description="Normalized risk percentage (0.0% to 100.0%). Higher values denote higher threat severity.",
        ge=0.0,
        le=100.0,
        examples=[98.54]
    )
    is_phishing: bool = Field(
        ...,
        description="Primary boolean indicator for phishing or malicious threat presence.",
        examples=[True]
    )
    is_spam: Optional[bool] = Field(
        default=None,
        description="Channel-specific boolean indicator for SMS spam detections.",
        examples=[None]
    )
    error: Optional[str] = Field(
        default=None,
        description="Descriptive error explanation if input validation or inference failed.",
        examples=[None]
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "examples": [
                {
                    "predicted_label": 1,
                    "classification": "Phishing / Scam Email",
                    "score": 0.9854,
                    "score_type": "probability (predict_proba)",
                    "risk_percentage": 98.54,
                    "is_phishing": True,
                    "is_spam": None,
                    "error": None
                },
                {
                    "predicted_label": 0,
                    "classification": "Legitimate / Safe",
                    "score": 0.0412,
                    "score_type": "probability (predict_proba)",
                    "risk_percentage": 4.12,
                    "is_phishing": False,
                    "is_spam": False,
                    "error": None
                }
            ]
        }
    )


# ==============================================================================
# Authentication & User Schemas
# ==============================================================================

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")
    confirm_password: Optional[str] = Field(default=None, description="Password confirmation")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Name cannot be empty.")
        return s

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        s = v.strip().lower()
        if "@" not in s or "." not in s.split("@")[-1]:
            raise ValueError("Please provide a valid email address.")
        return s

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, v: Optional[str], info) -> Optional[str]:
        if v is not None:
            pwd = info.data.get("password")
            if pwd and v != pwd:
                raise ValueError("Passwords do not match.")
        return v


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Registered account email")
    password: str = Field(..., description="Account password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class UserProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Updated full name")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Name cannot be empty.")
        return s


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    profile_photo: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered account email address")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        s = v.strip().lower()
        if not s or "@" not in s or "." not in s.split("@")[-1]:
            raise ValueError("Please provide a valid email address.")
        return s


class ForgotPasswordResponse(BaseModel):
    message: str


class VerifyOTPRequest(BaseModel):
    email: str = Field(..., description="Registered account email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP verification code")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        s = v.strip().lower()
        if not s or "@" not in s or "." not in s.split("@")[-1]:
            raise ValueError("Please provide a valid email address.")
        return s

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        s = v.strip()
        if len(s) != 6 or not s.isdigit():
            raise ValueError("Verification code must be exactly 6 digits.")
        return s


class VerifyOTPResponse(BaseModel):
    message: str
    reset_token: str


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered account email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP verification code")
    reset_token: Optional[str] = Field(default=None, description="Optional temporary session token from verify-otp")
    password: str = Field(..., min_length=6, max_length=128, description="New account password")
    confirm_password: Optional[str] = Field(default=None, description="New password confirmation")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        s = v.strip().lower()
        if not s or "@" not in s or "." not in s.split("@")[-1]:
            raise ValueError("Please provide a valid email address.")
        return s

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        s = v.strip()
        if len(s) != 6 or not s.isdigit():
            raise ValueError("Verification code must be exactly 6 digits.")
        return s

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, v: Optional[str], info) -> Optional[str]:
        if v is not None:
            pwd = info.data.get("password")
            if pwd and v != pwd:
                raise ValueError("Passwords do not match.")
        return v


class ResetPasswordResponse(BaseModel):
    message: str


class DetectionHistoryItem(BaseModel):
    id: int
    input_type: str
    type: str
    input_text: str
    preview: str
    input: str
    classification: str
    result: str
    risk_percentage: float
    confidence: float
    is_phishing: bool
    is_spam: Optional[bool] = None
    is_starred: bool = False
    model_used: str
    created_at: str
    date_time: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


class DetectionHistoryResponse(BaseModel):
    items: list[DetectionHistoryItem]
    total: int
    page: int
    totalPages: int


class DashboardStatsResponse(BaseModel):
    totalScans: int
    safeResults: int
    suspicious: int
    phishing: int


class ChartDayStats(BaseModel):
    date: str
    day: str
    safe: int
    suspicious: int
    phishing: int
    total: int
