"""
Unified Detection Service Module for AI Scam & Phishing Detector.
Provides a central routing entry point for multi-channel threat detection.
Dispatches requests to the appropriate specialized ML pipelines (Email, SMS, URL)
while preserving the separate Deep Learning Bi-LSTM service.
"""

from typing import Any, Dict
from backend.app.services.detector import detect

SUPPORTED_CHANNELS = {"email", "sms", "url"}


def detect_unified(content: str, content_type: str) -> Dict[str, Any]:
    """
    Unified detection dispatcher.
    
    Safely normalizes content_type and routes incoming requests:
    - email -> Standard ML Email Phishing pipeline (LinearSVC + TF-IDF)
    - sms   -> Standard ML SMS Spam pipeline (LinearSVC + TF-IDF)
    - url   -> Standard ML URL Phishing pipeline (XGBoost + Lexical features)
    
    Note: Deep Learning Bi-LSTM email inference remains accessible via its
    dedicated endpoint (/api/v1/detect/dl) and is not automatically invoked here.
    
    Args:
        content: Message text, email body, or URL string to evaluate.
        content_type: Channel identifier ('email', 'sms', or 'url').
        
    Returns:
        Structured prediction dictionary with classification results, risk score,
        and indicators (or an error dictionary if content_type is unsupported).
    """
    if not isinstance(content_type, str):
        return {
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "score_type": None,
            "risk_percentage": 0.0,
            "is_phishing": False,
            "is_spam": None,
            "error": f"Invalid content_type format. Expected string, got {type(content_type).__name__}."
        }

    normalized_type = content_type.strip().lower()

    if normalized_type not in SUPPORTED_CHANNELS:
        return {
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "score_type": None,
            "risk_percentage": 0.0,
            "is_phishing": False,
            "is_spam": None,
            "error": f"Unsupported content_type '{content_type}'. Must be one of: {', '.join(sorted(SUPPORTED_CHANNELS))}."
        }

    # Route to existing ML detection service
    return detect(content=content, content_type=normalized_type)
