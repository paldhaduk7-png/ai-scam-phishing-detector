import logging
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.schemas import DetectionRequest, DetectionResponse
from backend.app.services.unified_detector import detect_unified
from backend.app.services.dl_detector import detect_email_dl

# Configure standard Python logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
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


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global safety net: logs full traceback server-side while guaranteeing
    that no internal paths or sensitive details leak to the client.
    """
    logger.error("Unhandled server exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Detection service temporarily unavailable."}
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
        result = detect_unified(request.content, request.content_type)
        return DetectionResponse(**result)
    except HTTPException:
        raise
    except ValueError as val_err:
        logger.warning("Input validation error for type %s: %s", request.content_type, val_err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        ) from None
    except Exception as exc:
        logger.error("Inference failure for type %s: %s", request.content_type, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Detection service temporarily unavailable."
        ) from None


@app.post(
    "/api/v1/detect/dl",
    response_model=DetectionResponse,
    tags=["Detection"],
    summary="Scan email content using Deep Learning Bi-LSTM neural network"
)
def detect_threat_dl(request: DetectionRequest) -> DetectionResponse:
    """
    Analyzes email body text using the trained Deep Learning Bi-LSTM model.
    Only supports content_type='email'. Rejects 'sms' and 'url' channels.
    """
    if request.content_type.lower() != "email":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deep Learning Bi-LSTM model only supports content_type='email'."
        )

    try:
        result = detect_email_dl(request.content)
        return DetectionResponse(**result)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Deep Learning inference failure: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Detection service temporarily unavailable."
        ) from None
