"""
Pydantic API Schemas Module for AI Scam & Phishing Detector API.
Contains request and response data validation models for API endpoints.
"""

from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class DetectionRequest(BaseModel):
    """
    Incoming request schema for scanning text, emails, or URLs.
    """
    content: str = Field(
        ...,
        description="Raw message text, email body, or URL string to analyze for threats.",
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
            "example": {
                "content": "URGENT: Your Chase bank account is suspended. Verify immediately at http://chase-update-security.xyz",
                "content_type": "email"
            }
        }
    )


class DetectionResponse(BaseModel):
    """
    Standardized response schema containing threat predictions, risk scores, and classifications.
    """
    predicted_label: Optional[int] = Field(
        default=None,
        description="Binary classification label: 1 for Phishing/Scam, 0 for Safe/Legitimate, None on error."
    )
    classification: str = Field(
        ...,
        description="Human-readable classification outcome.",
        examples=["Phishing / Scam Email"]
    )
    score: Optional[float] = Field(
        default=None,
        description="Underlying raw decision function value or continuous model probability score."
    )
    score_type: Optional[str] = Field(
        default=None,
        description="Explanation of score calculation (e.g., 'probability (predict_proba)', 'decision_function (LinearSVC)')."
    )
    risk_percentage: float = Field(
        ...,
        description="Normalized risk percentage (0.0 to 100.0%).",
        ge=0.0,
        le=100.0,
        examples=[98.75]
    )
    is_phishing: bool = Field(
        ...,
        description="Primary boolean indicator for phishing or malicious threat presence."
    )
    is_spam: Optional[bool] = Field(
        default=None,
        description="Channel-specific boolean indicator for SMS spam detections."
    )
    error: Optional[str] = Field(
        default=None,
        description="Descriptive error explanation if input validation or inference failed."
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "predicted_label": 1,
                "classification": "Phishing / Scam Email",
                "score": 0.9854,
                "score_type": "probability (predict_proba)",
                "risk_percentage": 98.54,
                "is_phishing": True,
                "is_spam": None,
                "error": None
            }
        }
    )
