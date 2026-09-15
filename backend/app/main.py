import logging
from typing import Any, Dict
from fastapi import Body, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.schemas import DetectionRequest, DetectionResponse
from backend.app.services.unified_detector import detect_unified
from backend.app.services.dl_detector import detect_email_dl

# Configure standard Python logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("scamshield.api")

TAGS_METADATA = [
    {
        "name": "Health",
        "description": "System health checks and operational status monitoring.",
    },
    {
        "name": "Detection",
        "description": (
            "Cybersecurity threat detection endpoints.\n\n"
            "- **`/api/v1/detect`**: Standard unified Machine Learning detection for Email, SMS, and URL channels.\n"
            "- **`/api/v1/detect/dl`**: Specialized Deep Learning Bi-LSTM neural network detection for Email only."
        ),
    },
]

app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    openapi_tags=TAGS_METADATA
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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


@app.get(
    "/health",
    tags=["Health"],
    summary="Service health check",
    response_description="Service health status",
    responses={
        200: {
            "description": "Service is healthy and operational.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "ok",
                        "service": "AI Scam & Phishing Detector API"
                    }
                }
            }
        }
    }
)
def health_check() -> Dict[str, str]:
    """
    ### Health Check Endpoint

    Verifies that the API service is alive and capable of processing traffic.

    - **Status**: Returns `status: "ok"` when running normally.
    - **Performance**: Zero model inference overhead; suitable for load balancer health probes and uptime monitoring.
    """
    return {
        "status": "ok",
        "service": settings.api_title
    }


DETECT_REQUEST_EXAMPLES = {
    "email_phishing": {
        "summary": "Email Phishing Example",
        "description": "A fraudulent bank alert email requesting urgent credential verification.",
        "value": {
            "content": "Subject: URGENT Account Verification Required\nDear Customer, your bank account has been locked due to suspicious activity. Please verify your credentials immediately at http://secure-login-chase.xyz to avoid permanent suspension.",
            "content_type": "email"
        }
    },
    "sms_scam": {
        "summary": "SMS Scam Example",
        "description": "A deceptive smishing text message announcing a fake lottery prize.",
        "value": {
            "content": "Congratulations! You have won a $1,000 Walmart gift card. Click http://claim-giftcard.biz/now to claim your reward before midnight today.",
            "content_type": "sms"
        }
    },
    "url_phishing": {
        "summary": "Malicious URL Example",
        "description": "A suspected credential harvesting / typosquatting phishing link.",
        "value": {
            "content": "http://paypal-security-verification-portal.com/login",
            "content_type": "url"
        }
    }
}


@app.post(
    "/api/v1/detect",
    response_model=DetectionResponse,
    tags=["Detection"],
    summary="Scan content for scam and phishing threats (ML unified: Email, SMS, URL)",
    response_description="Threat classification, confidence score, and normalized risk percentage",
    responses={
        200: {
            "description": "Successful threat detection analysis.",
            "model": DetectionResponse,
        },
        400: {
            "description": "Bad Request — invalid input parameters (e.g. empty or whitespace-only content).",
            "content": {
                "application/json": {
                    "example": {"detail": "Content must not be empty or consist solely of whitespace."}
                }
            }
        },
        422: {
            "description": "Validation Error — request payload failed schema validation (e.g., missing fields or invalid content_type enum).",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "literal_error",
                                "loc": ["body", "content_type"],
                                "msg": "Input should be 'email', 'sms' or 'url'",
                                "input": "social_media"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "Internal Server Error — unexpected inference or detection failure (traceback is logged server-side; client receives sanitized message).",
            "content": {
                "application/json": {
                    "example": {"detail": "Detection service temporarily unavailable."}
                }
            }
        }
    }
)
def detect_threat(
    request: DetectionRequest = Body(
        ...,
        openapi_examples=DETECT_REQUEST_EXAMPLES
    )
) -> DetectionResponse:
    """
    ### Standard Unified Threat Detection

    Analyzes raw text or URLs using specialized machine learning detection pipelines
    and returns comprehensive threat classifications, risk percentages, and indicators.

    #### Supported Channels (`content_type`):
    - **`email`**: Evaluates email text for phishing keywords, urgency cues, and spoofing indicators.
    - **`sms`**: Identifies mobile smishing scams, spam promotions, and fraudulent delivery alerts.
    - **`url`**: Analyzes web addresses using lexical, structural, and domain-based security heuristics.

    #### Difference from `/api/v1/detect/dl`:
    - **Multi-channel**: Handles Email, SMS, and URL inputs.
    - **Model**: Powered by lightweight, ultra-fast scikit-learn / XGBoost ML pipelines with TF-IDF vectorization.
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


DETECT_DL_REQUEST_EXAMPLES = {
    "email_phishing_dl": {
        "summary": "Email Phishing (Bi-LSTM)",
        "description": "A high-risk phishing email analyzed using the Deep Learning Bi-LSTM neural network.",
        "value": {
            "content": "URGENT: Your PayPal account has been limited! We detected unauthorized access attempts from an unrecognized device. Click here to verify your identity: http://paypal-verify-account.net/login",
            "content_type": "email"
        }
    }
}


@app.post(
    "/api/v1/detect/dl",
    response_model=DetectionResponse,
    tags=["Detection"],
    summary="Scan email content using Deep Learning Bi-LSTM neural network (Email only)",
    response_description="Deep Learning threat classification, probability score, and risk percentage",
    responses={
        200: {
            "description": "Successful Deep Learning Bi-LSTM email threat analysis.",
            "model": DetectionResponse,
        },
        400: {
            "description": "Bad Request — content_type is not 'email' or content is invalid. The Bi-LSTM model exclusively processes email text.",
            "content": {
                "application/json": {
                    "example": {"detail": "Deep Learning Bi-LSTM model only supports content_type='email'."}
                }
            }
        },
        422: {
            "description": "Validation Error — request payload failed schema validation (e.g., missing required fields).",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "missing",
                                "loc": ["body", "content"],
                                "msg": "Field required"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "Internal Server Error — unexpected Deep Learning inference failure (traceback is logged server-side; client receives sanitized message).",
            "content": {
                "application/json": {
                    "example": {"detail": "Detection service temporarily unavailable."}
                }
            }
        }
    }
)
def detect_threat_dl(
    request: DetectionRequest = Body(
        ...,
        openapi_examples=DETECT_DL_REQUEST_EXAMPLES
    )
) -> DetectionResponse:
    """
    ### Deep Learning Bi-LSTM Email Detection

    Analyzes email body text using a trained **Bidirectional LSTM (Bi-LSTM)** neural network.
    The model evaluates sequential semantic dependencies and contextual phrasing across word sequences.

    #### Supported Channel (`content_type`):
    - **`email`**: The Bi-LSTM model is exclusively trained and optimized for email content.

    #### Channel Constraint:
    - Submissions with `content_type="sms"` or `content_type="url"` are **rejected with HTTP 400 Bad Request**.

    #### Difference from `/api/v1/detect`:
    - **Email Only**: Does not support SMS or URL channels.
    - **Model**: Uses a deep sequential neural network (Bi-LSTM with Keras tokenization) rather than TF-IDF classical ML.
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

