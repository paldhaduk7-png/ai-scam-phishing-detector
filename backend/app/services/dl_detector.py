"""
Deep Learning Email Detection Service.
Provides lazy-loaded, cached inference using the trained Bi-LSTM neural network and tokenizer.
"""

import json
import logging
from pathlib import Path
import pickle
import re
from typing import Any, Dict, Optional

logger = logging.getLogger("scamshield.dl_detector")

# Relative paths resolving from repository root
DL_MODELS_DIR = Path(__file__).resolve().parents[3] / "dl" / "models"
MODEL_PATH = DL_MODELS_DIR / "best_model.keras"
TOKENIZER_PATH = DL_MODELS_DIR / "tokenizer.pkl"
METADATA_PATH = DL_MODELS_DIR / "metadata.json"


class DLModelManager:
    """
    Singleton manager that lazily loads and caches the Bi-LSTM model, tokenizer, and metadata.
    """
    _model: Optional[Any] = None
    _tokenizer: Optional[Any] = None
    _metadata: Optional[Dict[str, Any]] = None
    _max_sequence_length: int = 200
    _threshold: float = 0.5

    @classmethod
    def get_model(cls) -> Any:
        if cls._model is None:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Trained Bi-LSTM model not found at {MODEL_PATH}")
            import tensorflow as tf
            cls._model = tf.keras.models.load_model(str(MODEL_PATH))
            logger.info("Loaded Bi-LSTM model from %s", MODEL_PATH)
        return cls._model

    @classmethod
    def get_tokenizer(cls) -> Any:
        if cls._tokenizer is None:
            if not TOKENIZER_PATH.exists():
                raise FileNotFoundError(f"Fitted tokenizer not found at {TOKENIZER_PATH}")
            with open(TOKENIZER_PATH, "rb") as f:
                cls._tokenizer = pickle.load(f)
            logger.info("Loaded tokenizer from %s", TOKENIZER_PATH)
        return cls._tokenizer

    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        if cls._metadata is None:
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    cls._metadata = json.load(f)
                cls._max_sequence_length = int(cls._metadata.get("max_sequence_length", 200))
                cls._threshold = float(cls._metadata.get("classification_threshold", 0.5))
            else:
                cls._metadata = {}
        return cls._metadata

    @classmethod
    def get_max_sequence_length(cls) -> int:
        cls.get_metadata()
        return cls._max_sequence_length

    @classmethod
    def get_threshold(cls) -> float:
        cls.get_metadata()
        return cls._threshold


def clean_email_text(text: str) -> str:
    """
    Normalizes raw email text to match the preprocessing applied during DL experimentation.
    """
    if not text:
        return ""
    cleaned = str(text).lower().strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned


def detect_email_dl(text: str) -> Dict[str, Any]:
    """
    Performs forward-pass inference on raw email text using the trained Bi-LSTM network.
    Returns a structured prediction dictionary.
    """
    cleaned = clean_email_text(text)
    if not cleaned:
        return {
            "predicted_label": None,
            "classification": "Unknown",
            "score": None,
            "score_type": "probability (Bi-LSTM)",
            "risk_percentage": 0.0,
            "is_phishing": False,
            "is_spam": None,
            "error": "Email content must not be empty or whitespace."
        }

    from tensorflow.keras.preprocessing.sequence import pad_sequences

    tokenizer = DLModelManager.get_tokenizer()
    model = DLModelManager.get_model()
    max_len = DLModelManager.get_max_sequence_length()
    threshold = DLModelManager.get_threshold()

    # Tokenize and pad
    seq = tokenizer.texts_to_sequences([cleaned])
    padded = pad_sequences(seq, maxlen=max_len, padding='post', truncating='post')

    # Predict
    prob = float(model.predict(padded, verbose=0)[0][0])
    is_phishing = bool(prob >= threshold)
    pred_label = 1 if is_phishing else 0
    risk_pct = round(prob * 100.0, 2)
    classification = "Phishing / Scam Email" if is_phishing else "Safe / Legitimate Email"

    return {
        "predicted_label": pred_label,
        "classification": classification,
        "score": round(prob, 6),
        "score_type": "probability (Bi-LSTM)",
        "risk_percentage": risk_pct,
        "is_phishing": is_phishing,
        "is_spam": None,
        "error": None
    }
