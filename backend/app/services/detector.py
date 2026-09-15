"""
Detection Service Module for AI Scam & Phishing Detector.
Encapsulates inference execution by connecting to the existing ML prediction pipelines.
"""

from typing import Any, Dict
from ml.src.predict import predict


def detect(content: str, content_type: str) -> Dict[str, Any]:
    """
    Dispatches incoming content to the appropriate ML classification pipeline
    (email, sms, or url) and returns the prediction result dictionary.
    """
    return predict(content, content_type)
