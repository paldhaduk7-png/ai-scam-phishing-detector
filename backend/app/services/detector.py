"""
Detection Service Module for AI Scam & Phishing Detector.
Encapsulates inference execution by connecting to the existing ML prediction pipelines.
Updated with URL normalization and trusted authority verification.
"""

import sys
from pathlib import Path
from typing import Any, Dict

# Ensure project root is available on sys.path so 'ml' can be imported when running from backend
PROJECT_ROOT = str(Path(__file__).resolve().parents[3])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.src.predict import predict


def detect(content: str, content_type: str) -> Dict[str, Any]:
    """
    Dispatches incoming content to the appropriate ML classification pipeline
    (email, sms, or url) and returns the prediction result dictionary.
    """
    from ml.src.predict import predict as _predict
    return _predict(content, content_type)
