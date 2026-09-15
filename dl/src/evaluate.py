"""
Deep Learning Model Evaluation Module.
Computes batch-level and global evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC) for Deep Learning models.
"""

from typing import Any, Dict, List, Optional, Union
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


def evaluate_predictions(
    y_true: Union[List[int], np.ndarray],
    y_pred: Union[List[int], np.ndarray],
    y_probs: Optional[Union[List[float], np.ndarray]] = None
) -> Dict[str, Any]:
    """
    Computes standard evaluation metrics on model predictions.
    """
    y_true_arr = np.array(y_true)
    y_pred_arr = np.array(y_pred)

    acc = float(accuracy_score(y_true_arr, y_pred_arr))
    prec = float(precision_score(y_true_arr, y_pred_arr, zero_division=0))
    rec = float(recall_score(y_true_arr, y_pred_arr, zero_division=0))
    f1 = float(f1_score(y_true_arr, y_pred_arr, zero_division=0))

    cm = confusion_matrix(y_true_arr, y_pred_arr)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    metrics: Dict[str, Any] = {
        "accuracy": round(acc, 6),
        "precision": round(prec, 6),
        "recall": round(rec, 6),
        "f1_score": round(f1, 6),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "false_positive_rate": round(fp / (fp + tn), 6) if (fp + tn) > 0 else 0.0,
            "false_negative_rate": round(fn / (fn + tp), 6) if (fn + tp) > 0 else 0.0
        }
    }

    if y_probs is not None:
        try:
            auc = float(roc_auc_score(y_true_arr, y_probs))
            metrics["roc_auc"] = round(auc, 6)
        except Exception:
            metrics["roc_auc"] = None

    return metrics
