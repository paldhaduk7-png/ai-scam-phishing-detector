import logging
from typing import Any, Dict
from fastapi import Body, FastAPI, HTTPException, Request, status
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

API_DESCRIPTION = """
## Overview
The **AI Scam & Phishing Detector API** is a production-ready RESTful cybersecurity service designed to detect and analyze deceptive online threats in real time. Powered by trained machine learning and deep learning models, the service identifies potential phishing, fraud, and scam content across three primary digital communication channels:

- **Email**: Analyzes email subject lines and body text to identify phishing lures, spoofed sender notices, fake security alerts, and credential harvesting schemes.
- **SMS / Text Messages**: Identifies mobile smishing attacks, urgent payment demands, lottery/prize scams, and fake delivery notifications.
- **URLs**: Inspects web addresses and hyperlinks for suspicious lexical patterns, typosquatting domains, deceptive login pages, and malicious redirectors.

---

## Detection Endpoints & Model Architectures

The API provides two dedicated detection endpoints tailored for distinct modeling techniques:

1. **Standard Unified Detection (`POST /api/v1/detect`)**
   - **Supported Channels**: `email`, `sms`, and `url`
   - **Model Architecture**: Multi-channel machine learning pipelines combining TF-IDF n-gram vectorization, structural/lexical URL feature extraction, and optimized scikit-learn / XGBoost classifiers.
   - **Use Case**: General multi-vector threat detection with low inference latency and balanced precision.

2. **Deep Learning Bi-LSTM Detection (`POST /api/v1/detect/dl`)**
   - **Supported Channels**: `email` only (*rejects `sms` and `url` with HTTP 400 Bad Request*)
   - **Model Architecture**: 128-unit Bidirectional Long Short-Term Memory (Bi-LSTM) recurrent neural network with word tokenization, dense embeddings, and dropout regularization.
   - **Use Case**: In-depth sequential semantic analysis of long-form email phishing lures.
"""

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
    title="AI Scam & Phishing Detector API",
    description=API_DESCRIPTION,
    version="1.0.0",
    openapi_tags=TAGS_METADATA
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
        "service": "AI Scam & Phishing Detector API"
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

