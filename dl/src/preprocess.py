"""
Deep Learning Preprocessing and Tokenization Module.
Provides sequence tokenization, padding, text normalization, and dataset loaders for Deep Learning models.
"""

from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd


def clean_sequence_text(text: Optional[str]) -> str:
    """
    Cleans raw text before tokenization by normalizing whitespace and stripping boundary spaces.
    """
    if not isinstance(text, str):
        return ""
    return text.strip()


def tokenize_texts(
    texts: List[str],
    tokenizer: Any,
    max_length: int = 256,
    truncation: bool = True,
    padding: Union[bool, str] = "max_length"
) -> Dict[str, Any]:
    """
    Tokenizes input texts for Transformer-based architectures (BERT, RoBERTa, DistilBERT)
    or sequence neural networks (BiLSTM, CNN).
    """
    return tokenizer(
        texts,
        max_length=max_length,
        truncation=truncation,
        padding=padding,
        return_tensors="pt" if hasattr(tokenizer, "return_tensors") else None
    )
