# AI Scam & Phishing Detector — Backend API

## Backend Purpose
The backend service provides high-performance API endpoints for scam, phishing, and threat detection across text messages, emails, and URLs.

## Current Status
**Checkpoint 1 — FastAPI Backend Scaffold Only**
The basic FastAPI application skeleton and directory layout have been established. Endpoints, ML/DL model inference connectors, and validation schemas will be introduced in subsequent checkpoints.

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   └── services/
│       ├── __init__.py
│       └── detector.py
├── requirements.txt
└── README.md
```

## Planned Future Purpose
- Expose RESTful API endpoints for multi-channel threat detection (`/detect`).
- Host service health check and monitoring endpoints (`/health`).
- Integrate cached Machine Learning pipelines (`ml/models/`) and Deep Learning Bi-LSTM neural networks (`dl/models/`).
- Provide structured response payloads with classification results, risk confidence scores, and safety recommendations.
