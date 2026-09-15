import logging
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.app.schemas import DetectionRequest, DetectionResponse
from backend.app.services.detector import detect

logger = logging.getLogger("scamshield.api")

app = FastAPI(
    title="AI Scam & Phishing Detector API",
    description="Production RESTful cybersecurity API for detecting scams and phishing across emails, SMS text messages, and URLs.",
    version="1.0.0"
)

# Allowed development origins for React frontend
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health", tags=["Health"], summary="System health check")
def health_check() -> Dict[str, str]:
    """
    Returns API operational status without invoking machine learning pipelines.
    """
    return {
        "status": "ok",
        "service": "AI Scam & Phishing Detector API"
    }


@app.post(
    "/api/v1/detect",
    response_model=DetectionResponse,
    tags=["Detection"],
    summary="Scan content for scam and phishing threats"
)
def detect_threat(request: DetectionRequest) -> DetectionResponse:
    """
    Analyzes an email body, SMS text, or URL string using specialized machine learning
    detection pipelines and returns threat classifications, risk percentages, and indicators.
    """
    try:
        result = detect(request.content, request.content_type)
        return DetectionResponse(**result)
    except Exception as exc:
        logger.error("Inference failure for type %s: %s", request.content_type, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction service temporarily unavailable."
        ) from exc
