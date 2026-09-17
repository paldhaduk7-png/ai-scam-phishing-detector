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


import re
from urllib.parse import urlparse

# Popular authentic brand root domains to catch brand spoofing / typosquatting
AUTHENTIC_BRAND_DOMAINS = {
    'paypal': {'paypal.com', 'paypal.me'},
    'apple': {'apple.com', 'icloud.com'},
    'google': {'google.com', 'google.co.uk', 'google.ca', 'google.de', 'google.fr', 'google.co.in', 'youtube.com', 'gmail.com'},
    'microsoft': {'microsoft.com', 'live.com', 'office.com', 'outlook.com', 'windows.com', 'azure.com', 'bing.com'},
    'netflix': {'netflix.com'},
    'amazon': {'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.in', 'amazon.co.jp', 'aws.amazon.com'},
    'facebook': {'facebook.com', 'fb.com', 'messenger.com'},
    'instagram': {'instagram.com'},
    'chase': {'chase.com'},
    'bankofamerica': {'bankofamerica.com', 'bofa.com'},
    'wellsfargo': {'wellsfargo.com'},
    'binance': {'binance.com'},
    'coinbase': {'coinbase.com'},
    'metamask': {'metamask.io'},
    'whatsapp': {'whatsapp.com'},
    'linkedin': {'linkedin.com'},
    'twitter': {'twitter.com', 'x.com'},
    'github': {'github.com', 'github.io'},
    'dropbox': {'dropbox.com'},
    'adobe': {'adobe.com'}
}

# High-risk / free TLDs heavily correlated with disposable phishing sites
SUSPICIOUS_TLDS = {
    'xyz', 'top', 'tk', 'ml', 'cf', 'gq', 'ga', 'buzz', 'work', 'icu',
    'sbs', 'cfd', 'rest', 'fit', 'country', 'su', 'click', 'link', 'download'
}

# Suspicious keywords indicative of credential harvesting or account deception
HIGH_RISK_KEYWORDS = {
    'verify', 'verification', 'update', 'login', 'signin', 'secure', 'security',
    'banking', 'account', 'confirm', 'confirmation', 'wallet', 'recovery',
    'suspended', 'suspend', 'authenticate', 'unusual', 'locked', 'billing'
}

# Known URL shortener services that mask final destination
SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
    'adf.ly', 'bit.do', 'cutt.ly', 'rb.gy', 'shorte.st', 'tiny.cc'
}

IP_PATTERN = re.compile(r'^(?:http[s]?://)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?(?:/.*)?$')
LOCAL_HOSTNAMES = {'localhost', '127.0.0.1', '0.0.0.0', '::1'}

# Comprehensive set of trusted global platforms, developer hubs, and news authorities
POPULAR_LEGITIMATE_DOMAINS = {
    'google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'amazon.com', 'apple.com', 'microsoft.com', 'netflix.com', 'wikipedia.org', 'github.com',
    'linkedin.com', 'yahoo.com', 'reddit.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'paypal.com', 'stackoverflow.com', 'medium.com', 'nytimes.com', 'bbc.com', 'cnn.com',
    'react.dev', 'tailwindcss.com', 'fastapi.tiangolo.com', 'docs.python.org', 'python.org',
    'lovable.dev', 'vercel.com', 'supabase.com', 'pypi.org', 'npmjs.com', 'coursera.org',
    'huggingface.co', 'mozilla.org', 'developer.mozilla.org', 'cloudflare.com', 'docker.com',
    'gitlab.com', 'bitbucket.org', 'slack.com', 'zoom.us', 'dropbox.com', 'canva.com',
    'figma.com', 'adobe.com', 'spotify.com', 'twitch.tv', 'quora.com', 'imdb.com',
    'ycombinator.com', 'news.ycombinator.com', 'bloomberg.com', 'forbes.com', 'wsj.com',
    'reuters.com', 'theguardian.com', 'nature.com', 'nih.gov', 'cdc.gov', 'who.int'
}


def extract_registered_domain(hostname: str) -> str:
    """Extracts effective second-level domain + TLD (e.g. www.sub.example.co.uk -> example.co.uk)."""
    parts = hostname.lower().split('.')
    if len(parts) <= 2:
        return hostname
    if parts[-2] in {'co', 'com', 'org', 'net', 'gov', 'edu', 'ac', 'ind'} and len(parts) >= 3:
        return '.'.join(parts[-3:])
    return '.'.join(parts[-2:])


def check_brand_spoofing(hostname: str) -> tuple[bool, str]:
    """Detects if a hostname contains a well-known brand name on an illegitimate root domain."""
    reg_dom = extract_registered_domain(hostname)
    for brand, legit_domains in AUTHENTIC_BRAND_DOMAINS.items():
        if brand in hostname:
            if any(reg_dom == d or reg_dom.endswith('.' + d) for d in legit_domains):
                continue
            return True, brand
    return False, ""


def predict_url(url: str) -> Dict[str, Any]:
    """
    Classifies a raw URL string by combining canonicalized machine learning inference
    (XGBoost on canonical domain representations) with security heuristics
    (brand impersonation, IP hosts, suspicious TLDs, keyword stacking, and trusted domain validation).
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

    # Protocol normalization
    if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        normalized_url = "https://" + cleaned
    else:
        normalized_url = cleaned

    try:
        parsed = urlparse(normalized_url)
        netloc = (parsed.netloc or "").lower().split(":")[0]
        path = parsed.path.lower()
        query = parsed.query.lower()
        full_path = path + ("?" + query if query else "")
    except Exception:
        netloc = ""
        path = ""
        query = ""
        full_path = ""

    # Local development / loopback addresses are inherently safe
    if netloc in LOCAL_HOSTNAMES or cleaned.split("/")[0].split(":")[0] in LOCAL_HOSTNAMES:
        return {
            "predicted_label": 0,
            "classification": "Safe / Legitimate URL",
            "score": 0.0,
            "score_type": "probability (predict_proba)",
            "risk_percentage": 0.0,
            "is_phishing": False
        }

    reg_domain = extract_registered_domain(netloc)
    tld = netloc.split(".")[-1] if "." in netloc else ""

    # Heuristic threat indicators
    is_ip = bool(IP_PATTERN.match(cleaned) or re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', netloc))
    is_shortener = netloc in SHORTENERS or reg_domain in SHORTENERS
    is_brand_spoof, _ = check_brand_spoofing(netloc)
    has_at_symbol = "@" in netloc or bool(getattr(parsed, 'username', None))

    is_trusted_domain = (
        netloc in POPULAR_LEGITIMATE_DOMAINS or
        reg_domain in POPULAR_LEGITIMATE_DOMAINS or
        netloc.replace("www.", "") in POPULAR_LEGITIMATE_DOMAINS
    )

    found_keywords = [kw for kw in HIGH_RISK_KEYWORDS if kw in full_path or kw in netloc]
    is_suspicious_tld = tld in SUSPICIOUS_TLDS
    subdomain_count = max(0, len(netloc.split(".")) - 2)
    has_excessive_subdomains = subdomain_count >= 3

    # =========================================================================
    # ML XGBoost Pipeline Evaluation on Canonical Domain Form
    # The PhiUSIIL model was trained on https://www.<domain>.<tld>
    # =========================================================================
    if netloc.startswith("www."):
        canonical_domain = f"https://{netloc}"
    else:
        canonical_domain = f"https://www.{reg_domain}" if reg_domain else f"https://www.{netloc}"

    pipeline = ModelManager.get_url_pipeline()
    ml_prob = 0.5
    try:
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba([canonical_domain])[0]
            ml_prob = float(probs[1])
        else:
            ml_prob = 1.0 if int(pipeline.predict([canonical_domain])[0]) == 1 else 0.0
    except Exception:
        ml_prob = 0.5

    # =========================================================================
    # Multi-Vector Risk Calculation
    # =========================================================================
    if is_brand_spoof:
        # Host contains authentic brand in deceptive domain (e.g. paypal-security-verify.com)
        risk = max(95.0, ml_prob * 100)
    elif is_ip:
        # Direct raw IP address in URL
        risk = 92.0
    elif has_at_symbol:
        # Embedded authentication / redirect exploit
        risk = 90.0
    elif is_shortener:
        # Shorteners hide true destination
        risk = 75.0 if len(found_keywords) > 0 else 45.0
    elif is_trusted_domain:
        # High-reputation verified platforms (e.g. lovable.dev, google, github, react.dev, stackoverflow)
        if len(found_keywords) >= 3 and not normalized_url.startswith("https://"):
            risk = 45.0
        else:
            risk = min(5.0, ml_prob * 10)
    elif is_suspicious_tld and len(found_keywords) >= 1:
        # Free/spammy TLD with phishing keywords
        risk = 96.0
    elif is_suspicious_tld:
        risk = max(70.0, ml_prob * 100)
    elif has_excessive_subdomains and len(found_keywords) >= 1:
        risk = 88.0
    else:
        # General domain: baseline ML probability calibrated by path risk
        base_risk = ml_prob * 100
        if len(found_keywords) >= 2:
            risk = min(95.0, base_risk + 35.0)
        elif len(found_keywords) == 1:
            risk = min(80.0, base_risk + 15.0)
        else:
            risk = base_risk

    risk = max(0.0, min(100.0, round(risk, 2)))
    is_phishing = risk >= 50.0

    if risk >= 75.0:
        classification = "Phishing / Scam URL"
    elif risk >= 40.0:
        classification = "Suspicious URL"
    else:
        classification = "Safe / Legitimate URL"

    return {
        "predicted_label": 1 if is_phishing else 0,
        "classification": classification,
        "score": round(risk / 100.0, 4),
        "score_type": "probability (predict_proba)",
        "risk_percentage": risk,
        "is_phishing": is_phishing
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
