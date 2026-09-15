"""
Inference and Prediction Module for AI Scam & Phishing Detector.
Provides cached model loading and prediction functions for Email, SMS, and URL pipelines.
"""

from pathlib import Path
from typing import Any, Dict, Literal, Optional, Union
import joblib
import numpy as np

# Import URLFeatureExtractor so joblib can resolve class references during URL pipeline deserialization
from ml.src.preprocessing import URLFeatureExtractor, clean_text, is_valid_input

# Path definitions
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
EMAIL_PIPELINE_PATH = MODELS_DIR / "email_phishing_pipeline.joblib"
SMS_PIPELINE_PATH = MODELS_DIR / "sms_spam_pipeline.joblib"
URL_PIPELINE_PATH = MODELS_DIR / "url_phishing_pipeline.joblib"


class ModelManager:
    """
    Singleton-style cached model loader.
    Loads trained scikit-learn / XGBoost pipelines once into memory and reuses them.
    """
    _email_pipeline: Optional[Any] = None
    _sms_pipeline: Optional[Any] = None
    _url_pipeline: Optional[Any] = None

    @classmethod
    def get_email_pipeline(cls) -> Any:
        if cls._email_pipeline is None:
            if not EMAIL_PIPELINE_PATH.exists():
                raise FileNotFoundError(f"Email pipeline not found at {EMAIL_PIPELINE_PATH}")
            cls._email_pipeline = joblib.load(EMAIL_PIPELINE_PATH)
        return cls._email_pipeline

    @classmethod
    def get_sms_pipeline(cls) -> Any:
        if cls._sms_pipeline is None:
            if not SMS_PIPELINE_PATH.exists():
                raise FileNotFoundError(f"SMS pipeline not found at {SMS_PIPELINE_PATH}")
            cls._sms_pipeline = joblib.load(SMS_PIPELINE_PATH)
        return cls._sms_pipeline

    @classmethod
    def get_url_pipeline(cls) -> Any:
        if cls._url_pipeline is None:
            if not URL_PIPELINE_PATH.exists():
                raise FileNotFoundError(f"URL pipeline not found at {URL_PIPELINE_PATH}")
            cls._url_pipeline = joblib.load(URL_PIPELINE_PATH)
        return cls._url_pipeline

    @classmethod
    def preload_all(cls) -> None:
        """Preloads all models into memory at application startup."""
        cls.get_email_pipeline()
        cls.get_sms_pipeline()
        cls.get_url_pipeline()


def sigmoid_score_mapping(score: float) -> float:
    """
    Applies a standard logistic sigmoid function to map raw linear decision scores
    to a smooth, monotonic 0.0–1.0 risk range for user-facing risk percentage display.
    Note: For LinearSVC, this is a monotonic risk representation, not a calibrated posterior probability.
    """
    return float(1.0 / (1.0 + np.exp(-score)))


def predict_email(text: str) -> Dict[str, Any]:
    """
    Classifies raw email text using the trained Email Phishing Pipeline (TF-IDF + LinearSVC).
    """
    cleaned = clean_text(text)
    if not cleaned:
        return {
            "error": "Input email text must be a non-empty string.",
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "risk_percentage": 0.0,
            "is_phishing": False
        }

    pipeline = ModelManager.get_email_pipeline()
    pred = int(pipeline.predict([cleaned])[0])
    raw_score = float(pipeline.decision_function([cleaned])[0])
    risk_pct = round(sigmoid_score_mapping(raw_score) * 100, 2)

    return {
        "predicted_label": pred,
        "classification": "Phishing / Scam Email" if pred == 1 else "Safe / Legitimate Email",
        "score": round(raw_score, 4),
        "score_type": "decision_function (LinearSVC)",
        "risk_percentage": risk_pct,
        "is_phishing": bool(pred == 1)
    }


def predict_sms(text: str) -> Dict[str, Any]:
    """
    Classifies raw SMS/text message using the trained SMS Spam Pipeline (TF-IDF + LinearSVC).
    """
    cleaned = clean_text(text)
    if not cleaned:
        return {
            "error": "Input SMS message must be a non-empty string.",
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "risk_percentage": 0.0,
            "is_phishing": False,
            "is_spam": False
        }

    pipeline = ModelManager.get_sms_pipeline()
    pred = int(pipeline.predict([cleaned])[0])
    raw_score = float(pipeline.decision_function([cleaned])[0])
    risk_pct = round(sigmoid_score_mapping(raw_score) * 100, 2)

    return {
        "predicted_label": pred,
        "classification": "Spam / Phishing SMS" if pred == 1 else "Safe / Ham SMS",
        "score": round(raw_score, 4),
        "score_type": "decision_function (LinearSVC)",
        "risk_percentage": risk_pct,
        "is_phishing": bool(pred == 1),
        "is_spam": bool(pred == 1)
    }


def predict_url(url: str) -> Dict[str, Any]:
    """
    Classifies a raw URL string using the trained URL Phishing Pipeline (URLFeatureExtractor + XGBoost).
    """
    cleaned = str(url).strip()
    if not cleaned:
        return {
            "error": "Input URL must be a non-empty string.",
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "risk_percentage": 0.0,
            "is_phishing": False
        }

    pipeline = ModelManager.get_url_pipeline()
    pred = int(pipeline.predict([cleaned])[0])

    if hasattr(pipeline, "predict_proba"):
        probs = pipeline.predict_proba([cleaned])[0]
        phish_prob = float(probs[1])
        risk_pct = round(phish_prob * 100, 2)
        raw_score = round(phish_prob, 6)
        score_type = "probability (predict_proba)"
    else:
        raw_score = float(pred)
        risk_pct = 100.0 if pred == 1 else 0.0
        score_type = "discrete_prediction"

    return {
        "predicted_label": pred,
        "classification": "Phishing / Scam URL" if pred == 1 else "Safe / Legitimate URL",
        "score": raw_score,
        "score_type": score_type,
        "risk_percentage": risk_pct,
        "is_phishing": bool(pred == 1)
    }


def predict(content: str, content_type: Literal["email", "sms", "url"]) -> Dict[str, Any]:
    """
    Unified prediction dispatcher for Email, SMS, and URL classification.
    """
    normalized_type = str(content_type).lower().strip()
    if normalized_type == "email":
        return predict_email(content)
    elif normalized_type in ("sms", "text"):
        return predict_sms(content)
    elif normalized_type == "url":
        return predict_url(content)
    else:
        return {
            "error": f"Invalid content_type '{content_type}'. Must be 'email', 'sms', or 'url'.",
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "risk_percentage": 0.0,
            "is_phishing": False
        }
