# Deep Learning (DL) — AI Scam & Phishing Detector

This directory contains the Deep Learning pipeline for advanced sequence modeling and transformer-based scam and phishing detection.

---

## Directory Architecture

```
dl/
│
├── data/
│   ├── raw/                # Raw datasets (local only, ignored by git)
│   └── processed/          # Tokenized, padded, or preprocessed arrays (ignored by git)
│
├── models/                 # Saved deep learning checkpoints (.pt, .pth, .h5, .keras, etc.)
│
├── notebooks/              # Jupyter notebooks for model experimentation & training
│
├── src/                    # Modular deep learning Python package
│   ├── preprocess.py       # Sequence tokenization, padding, and data loaders
│   ├── train.py            # Training loops, optimization, and checkpointing
│   ├── evaluate.py         # Validation and evaluation metrics
│   └── predict.py          # Model inference and checkpoint loading
│
├── results/                # Training loss curves, evaluation reports, and benchmarks
│
├── requirements.txt        # Deep learning Python dependencies
└── README.md               # Documentation and workflow guide
```

---

## Modalities & Tasks

1. **Email Phishing Detection**:
   - Sequence models (BiLSTM, BERT/DistilBERT) for long-form email body and subject line classification.
2. **SMS Spam Detection**:
   - Lightweight recurrent or convolutional text models for short SMS sequences.
3. **URL Phishing Detection**:
   - Character-level CNN / BiLSTM or sequence-based transformer models for raw URL strings.

---

## Git & Storage Policy

- **Model weights and datasets**: Kept locally in `dl/data/` and `dl/models/` and ignored via root `.gitignore`.
- **Reproducibility**: Experiments are tracked in `dl/notebooks/`, with metadata and results documented in `dl/results/`.
