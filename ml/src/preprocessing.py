"""
Preprocessing and Feature Engineering Module for AI Scam & Phishing Detector.
Contains URL lexical feature extraction, SMS message reconstruction, and text sanitization.
"""

import re
import sys
from urllib.parse import urlparse
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# ==============================================================================
# URL Lexical & Structural Feature Constants
# ==============================================================================

SHORTENERS = {
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
    'adf.ly', 'bit.do', 'cutt.ly', 'rb.gy', 'shorte.st', 'tiny.cc'
}

SUSPICIOUS_KEYWORDS = [
    'login', 'verify', 'update', 'secure', 'banking', 'account', 'signin',
    'confirm', 'security', 'wallet', 'admin', 'service', 'support', 'password'
]

IP_PATTERN = re.compile(r'^(?:http[s]?://)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?(?:/.*)?$')

FEATURE_NAMES = [
    'url_len', 'hostname_len', 'path_len', 'query_len',
    'dot_count', 'hyphen_count', 'underscore_count', 'slash_count',
    'question_count', 'equal_count', 'ampersand_count', 'at_count',
    'digit_count', 'letter_count', 'special_count',
    'digit_ratio', 'special_ratio', 'no_of_subdomains',
    'is_ip', 'is_https', 'is_shortener', 'keyword_count', 'tld_len'
]


# ==============================================================================
# URL Feature Extraction Functions
# ==============================================================================

def extract_url_features_single(url: str) -> List[Union[int, float]]:
    """
    Extracts 23 domain-specific lexical and structural features from a single raw URL string.
    Fully offline, safe, and operates without making network requests.
    """
    url_str = str(url).strip()
    url_len = len(url_str)

    # Ensure valid scheme for reliable urlparse
    if not (url_str.startswith('http://') or url_str.startswith('https://')):
        parse_target = 'http://' + url_str
    else:
        parse_target = url_str

    try:
        parsed = urlparse(parse_target)
        netloc = parsed.netloc.lower()
        path = parsed.path
        query = parsed.query
    except Exception:
        netloc = ""
        path = ""
        query = ""

    hostname = netloc.split(':')[0] if ':' in netloc else netloc

    # Character and delimiter counts
    dot_count = url_str.count('.')
    hyphen_count = url_str.count('-')
    underscore_count = url_str.count('_')
    slash_count = url_str.count('/')
    question_count = url_str.count('?')
    equal_count = url_str.count('=')
    ampersand_count = url_str.count('&')
    at_count = url_str.count('@')

    digit_count = sum(c.isdigit() for c in url_str)
    letter_count = sum(c.isalpha() for c in url_str)
    special_count = sum(not c.isalnum() for c in url_str)

    digit_ratio = digit_count / url_len if url_len > 0 else 0.0
    special_ratio = special_count / url_len if url_len > 0 else 0.0

    # Structural component lengths
    hostname_len = len(hostname)
    path_len = len(path)
    query_len = len(query)

    # Subdomain count
    parts = hostname.split('.')
    no_of_subdomains = max(0, len(parts) - 2) if len(parts) >= 2 else 0

    # IP address presence in URL or hostname
    is_ip = 1 if IP_PATTERN.match(url_str) or re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', hostname) else 0

    # Security protocol and shortener flags
    is_https = 1 if url_str.lower().startswith('https://') else 0
    is_shortener = 1 if hostname in SHORTENERS else 0

    # Suspicious keywords frequency
    url_lower = url_str.lower()
    keyword_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    # Top Level Domain length
    tld = parts[-1] if len(parts) > 1 else ""
    tld_len = len(tld)

    return [
        url_len, hostname_len, path_len, query_len,
        dot_count, hyphen_count, underscore_count, slash_count,
        question_count, equal_count, ampersand_count, at_count,
        digit_count, letter_count, special_count,
        digit_ratio, special_ratio, no_of_subdomains,
        is_ip, is_https, is_shortener, keyword_count, tld_len
    ]


class URLFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Custom scikit-learn Transformer for URL lexical and structural feature extraction.
    Enables atomic end-to-end inference inside a scikit-learn Pipeline from raw URL strings.
    """

    def __init__(self):
        self.feature_names_ = FEATURE_NAMES

    def fit(self, X: Any, y: Any = None) -> "URLFeatureExtractor":
        return self

    def transform(self, X: Union[str, List[str], np.ndarray, pd.Series]) -> np.ndarray:
        """
        Transforms raw URL string(s) into a 2D float32 feature matrix (N, 23).
        """
        if isinstance(X, str):
            X = [X]
        features = [extract_url_features_single(url) for url in X]
        return np.array(features, dtype=np.float32)


# Register class in __main__ namespace to guarantee backward compatibility
# when deserializing existing pipelines saved from notebook environments.
import __main__
if not hasattr(__main__, 'URLFeatureExtractor'):
    setattr(__main__, 'URLFeatureExtractor', URLFeatureExtractor)


# ==============================================================================
# SMS Continuation Reconstruction Helper
# ==============================================================================

def reconstruct_sms_message(row: pd.Series, continuation_cols: Optional[List[str]] = None) -> str:
    """
    Reconstructs an SMS message split across continuation columns during CSV parsing.
    Combines 'v2' with any non-null continuation column fragments in sequential order using commas.
    """
    if continuation_cols is None:
        continuation_cols = ['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4']

    parts = [str(row.get('v2', ''))]
    for col in continuation_cols:
        if col in row:
            val = row[col]
            if pd.notnull(val) and str(val).strip() != '':
                parts.append(str(val).strip())

    return ','.join(parts)


def reconstruct_sms_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates a clean copy of the SMS dataframe with reconstructed full messages.
    Does not modify the original dataframe in place.
    """
    df_copy = df.copy()
    df_copy['full_message'] = df_copy.apply(reconstruct_sms_message, axis=1)
    return df_copy


# ==============================================================================
# Common Text Sanitization Helpers
# ==============================================================================

def clean_text(text: Optional[str]) -> str:
    """
    Basic text cleaner: strips leading/trailing whitespace and normalizes internal whitespace.
    """
    if not isinstance(text, str):
        return ""
    return re.sub(r'\s+', ' ', text).strip()


def is_valid_input(text: Optional[str]) -> bool:
    """
    Checks if the input text is a non-empty, non-whitespace string.
    """
    return isinstance(text, str) and len(text.strip()) > 0
