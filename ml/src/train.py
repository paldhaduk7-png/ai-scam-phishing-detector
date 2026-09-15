"""
Model Training Module for AI Scam & Phishing Detector.
Contains callable training utilities for reproducible retraining of Traditional ML pipelines.
Note: These functions are designed for programmatic execution and do NOT run automatically on import.
"""

from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from xgboost import XGBClassifier

from ml.src.preprocessing import URLFeatureExtractor, reconstruct_sms_message


def build_email_pipeline() -> Pipeline:
    """
    Constructs the un-fitted Email Phishing Detection Pipeline:
    TfidfVectorizer(ngram_range=(1,2), max_features=100000, sublinear_tf=True) -> LinearSVC(random_state=42)
    """
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            ngram_range=(1, 2),
            max_features=100000,
            sublinear_tf=True
        )),
        ('classifier', LinearSVC(random_state=42, max_iter=2000))
    ])


def build_sms_pipeline() -> Pipeline:
    """
    Constructs the un-fitted SMS Spam Detection Pipeline:
    TfidfVectorizer(ngram_range=(1,2), max_features=10000, sublinear_tf=True) -> LinearSVC(random_state=42)
    """
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            ngram_range=(1, 2),
            max_features=10000,
            sublinear_tf=True
        )),
        ('classifier', LinearSVC(random_state=42))
    ])


def build_url_pipeline() -> Pipeline:
    """
    Constructs the un-fitted URL Phishing Detection Pipeline:
    URLFeatureExtractor(23 features) -> XGBClassifier(n_estimators=150, max_depth=8, learning_rate=0.1)
    """
    return Pipeline([
        ('feature_extractor', URLFeatureExtractor()),
        ('classifier', XGBClassifier(
            n_estimators=150,
            max_depth=8,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1,
            eval_metric='logloss'
        ))
    ])


def train_email_model(csv_path: Path, output_path: Optional[Path] = None) -> Pipeline:
    """
    Trains the email phishing pipeline on a clean dataset and optionally saves the artifact.
    """
    df = pd.read_csv(csv_path)
    df_clean = df.drop_duplicates(subset=['text_combined']).dropna(subset=['text_combined'])
    df_clean = df_clean[df_clean['text_combined'].astype(str).str.strip() != '']

    X = df_clean['text_combined'].astype(str)
    y = df_clean['label'].astype(int)

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    pipeline = build_email_pipeline()
    pipeline.fit(X_train, y_train)

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, output_path)

    return pipeline


def train_sms_model(csv_path: Path, output_path: Optional[Path] = None) -> Pipeline:
    """
    Trains the SMS spam pipeline on a clean dataset with message reconstruction.
    """
    df = pd.read_csv(csv_path, encoding='latin-1')
    df['full_message'] = df.apply(reconstruct_sms_message, axis=1)
    df_clean = df.drop_duplicates(subset=['full_message']).dropna(subset=['full_message'])
    df_clean = df_clean[df_clean['full_message'].astype(str).str.strip() != '']

    X = df_clean['full_message'].astype(str)
    y = (df_clean['v1'] == 'spam').astype(int)

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    pipeline = build_sms_pipeline()
    pipeline.fit(X_train, y_train)

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, output_path)

    return pipeline


def train_url_model(csv_path: Path, output_path: Optional[Path] = None) -> Pipeline:
    """
    Trains the URL phishing pipeline on a clean dataset.
    """
    df = pd.read_csv(csv_path)
    df_clean = df.drop_duplicates(subset=['URL']).dropna(subset=['URL'])
    df_clean = df_clean[df_clean['URL'].astype(str).str.strip() != '']

    X = df_clean['URL'].astype(str)
    y = (df_clean['label'] == 0).astype(int)  # 1 = Phishing, 0 = Safe

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    pipeline = build_url_pipeline()
    pipeline.fit(X_train, y_train)

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, output_path)

    return pipeline
