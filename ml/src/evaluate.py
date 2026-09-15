"""
Model Evaluation Module for AI Scam & Phishing Detector.
Contains reusable metric calculation, confusion matrix analysis, and error diagnosis functions.
"""

from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)


def calculate_confusion_matrix_breakdown(
    y_true: Union[List[int], np.ndarray, pd.Series],
    y_pred: Union[List[int], np.ndarray, pd.Series]
) -> Dict[str, Union[int, float]]:
    """
    Computes a full breakdown of the confusion matrix:
    TN, FP, FN, TP, False Positive Rate (FPR), and False Negative Rate (FNR).
    """
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    return {
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "true_positives": tp,
        "false_positive_rate": round(fpr, 6),
        "false_negative_rate": round(fnr, 6)
    }


def calculate_metrics(
    y_true: Union[List[int], np.ndarray, pd.Series],
    y_pred: Union[List[int], np.ndarray, pd.Series],
    y_scores: Optional[Union[List[float], np.ndarray, pd.Series]] = None
) -> Dict[str, Any]:
    """
    Calculates standard binary classification metrics:
    Accuracy, Precision, Recall, F1-Score, and ROC-AUC (when continuous scores are provided).
    Spam/Phishing is treated as positive class (1).
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    metrics: Dict[str, Any] = {
        "accuracy": round(acc, 6),
        "precision": round(prec, 6),
        "recall": round(rec, 6),
        "f1_score": round(f1, 6)
    }

    if y_scores is not None:
        try:
            auc = float(roc_auc_score(y_true, y_scores))
            metrics["roc_auc"] = round(auc, 6)
        except Exception:
            metrics["roc_auc"] = None
    else:
        metrics["roc_auc"] = None

    metrics["confusion_matrix"] = calculate_confusion_matrix_breakdown(y_true, y_pred)
    return metrics


def extract_error_samples(
    X: Union[List[str], np.ndarray, pd.Series],
    y_true: Union[List[int], np.ndarray, pd.Series],
    y_pred: Union[List[int], np.ndarray, pd.Series],
    y_scores: Optional[Union[List[float], np.ndarray, pd.Series]] = None,
    n_samples: int = 5
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Extracts representative False Positive (Safe misclassified as Phishing/Spam)
    and False Negative (Phishing/Spam misclassified as Safe) samples for error diagnostics.
    """
    y_true_arr = np.array(y_true)
    y_pred_arr = np.array(y_pred)
    X_arr = np.array(X)
    scores_arr = np.array(y_scores) if y_scores is not None else None

    fp_indices = np.where((y_true_arr == 0) & (y_pred_arr == 1))[0]
    fn_indices = np.where((y_true_arr == 1) & (y_pred_arr == 0))[0]

    def format_sample(idx: int, error_type: str) -> Dict[str, Any]:
        item: Dict[str, Any] = {
            "index": int(idx),
            "text": str(X_arr[idx])[:200],
            "actual": int(y_true_arr[idx]),
            "predicted": int(y_pred_arr[idx]),
            "error_type": error_type
        }
        if scores_arr is not None:
            item["score"] = round(float(scores_arr[idx]), 4)
        return item

    return {
        "false_positives": [format_sample(i, "False Positive") for i in fp_indices[:n_samples]],
        "false_negatives": [format_sample(i, "False Negative") for i in fn_indices[:n_samples]],
        "total_false_positives": int(len(fp_indices)),
        "total_false_negatives": int(len(fn_indices))
    }
