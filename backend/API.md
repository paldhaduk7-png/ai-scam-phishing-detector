# Backend API Contract & Integration Guide

This document defines the formal REST API contract for the **AI Scam & Phishing Detector API**, specifically tailored for frontend integration with the React client (`http://localhost:5173`).

---

## 1. Frontend Integration Notes

When connecting a frontend client (such as React with Axios, Fetch API, or TanStack Query):

- **Base URL**: `http://localhost:8000` (or `http://127.0.0.1:8000`)
- **Content Type**: All `POST` requests **must** include the header:
  ```http
  Content-Type: application/json
  ```
- **CORS Configuration**: The backend pre-configures Starlette `CORSMiddleware` to allow credentials, all HTTP methods (`*`), and headers (`*`) from:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- **Interactive Documentation**:
  - Swagger UI: `http://localhost:8000/docs`
  - OpenAPI Spec: `http://localhost:8000/openapi.json`

---

## 2. Health Check Endpoint

### `GET /health`
Verifies operational availability without invoking ML or DL models.

#### Response (HTTP 200 OK)
```json
{
  "status": "ok",
  "service": "AI Scam & Phishing Detector API"
}
```

---

## 3. Standard Unified ML Detection Endpoint

### `POST /api/v1/detect`
Performs threat classification across multiple communication channels using specialized scikit-learn and XGBoost pipelines with TF-IDF vectorization and domain heuristics.

### Request Body (`DetectionRequest`)

```json
{
  "content": "Subject: URGENT Account Verification Required\nDear Customer, your bank access has been restricted. Verify at http://chase-update-security.xyz",
  "content_type": "email"
}
```

#### Request Fields
| Field | Type | Required | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `content` | `string` | **Yes** | Non-empty, non-whitespace string | Raw email text, SMS message body, or full URL to inspect. Outer whitespace is automatically trimmed. |
| `content_type` | `string` | **Yes** | `"email"`, `"sms"`, `"url"` | Target vector channel determining which ML pipeline executes inference. |

---

### Response Fields (`DetectionResponse`)
| Field | Type | Nullable | Description | Frontend Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `predicted_label` | `integer` | Yes | `1` for Phishing/Scam/Malicious, `0` for Safe/Legitimate, `null` on error. | Use for state evaluation or programmatic conditional logic. |
| `classification` | `string` | No | Human-readable threat verdict (e.g., `"Phishing / Scam Email"`, `"Safe / Legitimate"`). | Display directly as the main card header / verdict badge. |
| `score` | `float` | Yes | Underlying continuous probability or decision function value. | Useful for advanced technical details or confidence inspector modal. |
| `score_type` | `string` | Yes | Scoring algorithm description (e.g. `"probability (predict_proba)"`, `"decision_function (LinearSVC)"`). | Display in model metadata tooltip. |
| `risk_percentage` | `float` | No | Normalized threat severity scaled between `0.0` and `100.0`. | Drive risk meter, gauge, or progress bar styling (e.g., green < 40%, yellow 40-70%, red > 70%). |
| `is_phishing` | `boolean` | No | Primary threat boolean flag (`true` if threat detected, `false` if safe). | Toggle warning banners, red border highlights, or alert icons. |
| `is_spam` | `boolean` | Yes | Channel-specific indicator for SMS spam (`null` for email and URL). | Display sub-badge specifically when scanning SMS texts. |
| `error` | `string` | Yes | Diagnostic error message if processing failed (`null` on success). | Check if non-null to render inline warning messages. |

---

### Response Examples for `POST /api/v1/detect`

#### A. Email Response Example (Phishing Detected)
```json
{
  "predicted_label": 1,
  "classification": "Phishing / Scam Email",
  "score": 0.8453,
  "score_type": "probability (predict_proba)",
  "risk_percentage": 84.53,
  "is_phishing": true,
  "is_spam": null,
  "error": null
}
```

#### B. SMS Response Example (Spam / Smishing Detected)
```json
{
  "predicted_label": 1,
  "classification": "Spam / Phishing SMS",
  "score": 0.6922,
  "score_type": "probability (predict_proba)",
  "risk_percentage": 69.22,
  "is_phishing": true,
  "is_spam": true,
  "error": null
}
```

#### C. URL Response Example (Malicious Link Detected)
```json
{
  "predicted_label": 1,
  "classification": "Phishing / Scam URL",
  "score": 1.0,
  "score_type": "probability (predict_proba)",
  "risk_percentage": 100.0,
  "is_phishing": true,
  "is_spam": null,
  "error": null
}
```

---

## 4. Deep Learning Bi-LSTM Detection Endpoint

### `POST /api/v1/detect/dl`
Evaluates long-form email content using a trained 128-unit **Bidirectional Long Short-Term Memory (Bi-LSTM)** neural network with Keras word tokenization and dense embeddings.

> **Important**: This endpoint **strictly supports `content_type="email"`**. Submissions with `content_type="sms"` or `content_type="url"` are rejected with HTTP 400 Bad Request.

### Request Body (`DetectionRequest`)
```json
{
  "content": "URGENT: Your PayPal account access has been revoked due to unauthorized login attempts. Verify your credentials immediately at http://paypal-security-update.net/login",
  "content_type": "email"
}
```

### Response Example (HTTP 200 OK)
```json
{
  "predicted_label": 1,
  "classification": "Phishing / Scam Email",
  "score": 0.999124,
  "score_type": "probability (Bi-LSTM)",
  "risk_percentage": 99.91,
  "is_phishing": true,
  "is_spam": null,
  "error": null
}
```

---

## 5. HTTP Status Codes & Error Responses

The backend enforces standardized, clean HTTP error responses:

### 1. `200 OK`
- Request successfully processed and threat analysis completed.
- Returns `DetectionResponse` payload.

### 2. `400 Bad Request`
- Returned when input validation fails or an unsupported content channel is sent to a specialized endpoint (such as sending `sms` or `url` to `/api/v1/detect/dl`).
```json
{
  "detail": "Deep Learning Bi-LSTM model only supports content_type='email'."
}
```

### 3. `422 Unprocessable Entity`
- Returned automatically by FastAPI/Pydantic when the request body violates schema constraints (e.g., missing `content`, empty/whitespace `content`, or invalid `content_type` value).
```json
{
  "detail": [
    {
      "type": "literal_error",
      "loc": ["body", "content_type"],
      "msg": "Input should be 'email', 'sms' or 'url'",
      "input": "social_media"
    }
  ]
}
```

### 4. `500 Internal Server Error`
- Returned if an unexpected inference or backend exception occurs.
- **Security Notice**: Internal tracebacks and file paths are logged server-side and are **never** leaked to the client.
```json
{
  "detail": "Detection service temporarily unavailable."
}
```
