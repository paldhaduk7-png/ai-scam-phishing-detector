# 🛡️ ScamShield — AI-Powered Scam & Phishing Detection Platform

An end-to-end, full-stack cybersecurity application designed to identify scams, fraudulent messages, and phishing attempts across multiple communication vectors in real time. ScamShield combines traditional machine learning, deep learning bidirectional sequence models (Bi-LSTM), a high-performance asynchronous REST API, relational persistence, and an intuitive, reactive user interface to deliver actionable threat assessments and security telemetry.

---

## 📌 Project Overview

Digital communication channels (email, SMS, and web links) remain the primary initial access vector for social engineering, financial fraud, and credential harvesting. Traditional static signature and rule-based filters struggle against rapidly evolving phrasing, obfuscated hyperlinks, and novel social-engineering lures.

**ScamShield** addresses this challenge through a multi-tiered, multi-vector architecture that inspects three high-risk modalities:
- **Emails**: Analyzed for credential theft language, urgency triggers, fake invoices, and deceptive account alerts using both Traditional ML and Deep Learning sequence models.
- **SMS / Short Messages**: Evaluated for smishing patterns, predatory financial schemes, prize lures, and malicious shortlinks.
- **URLs**: Screened for deceptive domain attributes, suspicious character heuristics, brand impersonation, and malicious routing.

The platform provides a unified architecture integrating:
1. **Frontend**: A reactive, single-page application built with React, Vite, and Tailwind CSS.
2. **Backend**: An asynchronous REST API built with FastAPI and Pydantic.
3. **Inference Engines**: Multi-channel traditional machine learning (scikit-learn, XGBoost) and deep sequence modeling (TensorFlow/Keras Bi-LSTM).
4. **Persistence Layer**: A relational PostgreSQL database managed through SQLAlchemy ORM for user accounts, scan audit trails, and personalized analytics.
5. **Authentication System**: Secure email/password authentication, Google OAuth 2.0 single sign-on, HTTP-only JWT sessions, and 6-digit email OTP password recovery via Gmail SMTP.

---

## ✨ Features

- **Multi-Vector Threat Detection**:
  - **Email Analysis via Traditional ML**: LinearSVC classification coupled with TF-IDF n-gram vectorization for low-latency email threat scoring.
  - **Email Analysis via Deep Learning (Bi-LSTM)**: Bidirectional Long Short-Term Memory recurrent neural network with word tokenization and dense embeddings for semantic context analysis.
  - **SMS Smishing & Spam Detection**: Dedicated classification pipeline optimized for short, text-based scam and spam patterns.
  - **Malicious URL Detection**: Heuristic and lexical feature-based detection pipeline powered by XGBoost for malicious link classification.
- **Security Operations Dashboard**:
  - **Real Database Statistics**: Dynamic aggregation of total scans, safe results, suspicious alerts, and verified phishing threats.
  - **7-Day Detection Overview Chart**: Responsive day-by-day activity visualization categorizing scans into Safe, Suspicious, and Phishing.
  - **Recent Detections Feed**: Real-time display of the latest security scans with timestamp, threat classification, and risk severity percentage.
  - **Interactive Safety Advisories**: Actionable security tips and quick-navigation shortcuts.
- **Detection History & Management**:
  - **Search & Filtering**: Full-text search across content and results, with channel type and threat status filter buttons.
  - **Detection Details Modal**: Comprehensive modal inspecting input text, normalized risk percentage, prediction classification, and timestamp.
  - **Scan Management**: Individual deletion of historical scan records strictly isolated to the authenticated owner.
- **Authentication & User Profiles**:
  - **Account Registration & Login**: User registration, login with credentials, and secure session termination.
  - **Google OAuth 2.0 Integration**: One-click authentication with Google OpenID Connect with CSRF protection.
  - **Forgot Password with 6-Digit Email OTP**: Automated password recovery dispatching single-use verification codes via Gmail SMTP with a 10-minute expiry and 60-second resend cooldown.
  - **Token Authentication**: JSON Web Tokens (JWT) stored in HTTP-only cookies to mitigate script-based token theft.
  - **Cryptographic Security**: Passwords hashed securely using `bcrypt` with unique salts.
  - **Profile Management**: Profile name updates and optional Cloudinary avatar management (upload and removal).
  - **User Isolation**: Detections executed while logged in are automatically linked to the user account; unauthenticated public scans remain accessible without polluting personal records.
- **User Experience & System Design**:
  - **Adaptive Theme**: One-click Light and Dark mode toggle with persistent state.
  - **Error Handling & Sanitization**: Standardized API error responses with server-side traceback isolation.
  - **Built-in Documentation**: Interactive Swagger UI and ReDoc endpoints available out of the box.

---

## ⚙️ How ScamShield Works

```text
  [ User Input (Email / SMS / URL) ]
                 │
                 ▼
  [ Frontend React Client ]
                 │
                 ▼ (HTTP POST with JSON Payload)
  [ FastAPI Gateway & Middleware ]
        │  - CORS Verification
        │  - IP Rate Limiting (60 req/min)
        │  - Session Authentication Check
        ▼
  [ Detection Dispatcher ]
   ├── Email (ML)  ──► TF-IDF + LinearSVC Pipeline
   ├── Email (DL)  ──► Tokenizer + Bi-LSTM Neural Network
   ├── SMS (ML)    ──► TF-IDF + LinearSVC Pipeline
   └── URL (ML)    ──► Lexical Feature Extractor + XGBoost
        │
        ▼
  [ Verdict & Score Normalization ]
   ├── Risk Percentage: 0.0% to 100.0%
   └── Classification: Safe / Suspicious / Phishing
        │
        ├── Authenticated? ──► Persist to PostgreSQL (detections table)
        └── Unauthenticated? ─► Return Instant Guest Result
        │
        ▼
  [ Client Response Display ]
   ├── Dynamic Threat Gauge & Risk Badge
   └── Instant History & Dashboard Telemetry Update
```

---

## 🎯 Supported Detection Types

| Detection Channel | Model Engine | API Route | Supported Inputs | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Email (Traditional ML)** | TF-IDF + LinearSVC | `POST /api/v1/detect` | Subject + Body text (`content_type: "email"`) | Fast lexical and n-gram classification identifying phishing lures, fake alerts, and credential harvesting. |
| **Email (Deep Learning)** | Tokenizer + Bi-LSTM | `POST /api/v1/detect/dl` | Subject + Body text (`content_type: "email"`) | Bidirectional LSTM neural network evaluating semantic sentence context and deep structural phrasing. |
| **SMS / Text Message** | TF-IDF + LinearSVC | `POST /api/v1/detect` | SMS message text (`content_type: "sms"`) | Identifies smishing, financial fraud, package delivery scams, and predatory prize messages. |
| **URL / Web Link** | Lexical Extractor + XGBoost | `POST /api/v1/detect` | Full URL / Web address (`content_type: "url"`) | Parses domain length, entropy, special characters, and keyword heuristics to detect malicious and typosquatting domains. |

> **Routing Note**:
> - Standard unified detection (`email`, `sms`, `url`) routes to `POST /api/v1/detect`.
> - Deep learning sequence analysis is specialized for email and routes to `POST /api/v1/detect/dl`.

---

## 🔐 Authentication Features

ScamShield provides comprehensive authentication and identity management:

1. **Email/Password Authentication**:
   - Registration with optional profile photo upload via multipart/form-data.
   - Login with email and password verifying salted `bcrypt` hashes.
   - Session tokens delivered as HTTP-only, `SameSite=Lax` cookies, protecting against Cross-Site Scripting (XSS) credential theft.
2. **Google OAuth 2.0 Single Sign-On**:
   - One-click Google sign-in using standard OAuth 2.0 authorization code flow.
   - Cryptographically random state tokens stored in short-lived HTTP-only cookies prevent Cross-Site Request Forgery (CSRF).
   - Seamless account creation or linking without compromising existing passwords.
3. **Forgot Password with 6-Digit Email OTP**:
   - Secure password recovery using a 6-digit numeric verification code.
   - OTP codes are hashed with SHA-256 prior to storage; plaintext codes are never persisted in the database.
   - Automated email dispatch using standard Gmail SMTP with TLS.
   - Protected with a 10-minute expiration window, single-use consumption, and a 60-second resend cooldown.
4. **Guest & Authenticated Modes**:
   - Unauthenticated visitors can execute public threat scans in guest mode.
   - Authenticated users automatically have their scans tied to their account for private history and dashboard analytics.

---

## 🖥️ Technology Stack

| Layer | Technology | Primary Role / Package |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19** | Component-based single-page application framework |
| **Build Tooling** | **Vite 8** | High-performance frontend development server and production bundler |
| **Styling** | **Tailwind CSS 4** | Responsive styling, modern cards, and light/dark theme management |
| **Icons & Visuals** | **Lucide React** | Consistent iconography across dashboards, navigation, and detection cards |
| **Notifications** | **Sonner** | Interactive toast notifications for user actions and error alerts |
| **State & HTTP** | **Redux Toolkit & Axios** | Global auth state management and API communication with credentials |
| **Backend API** | **FastAPI** | Asynchronous, OpenAPI-compliant Python web framework |
| **Server** | **Uvicorn** | High-performance ASGI production server |
| **Data Validation** | **Pydantic v2** | Request validation, type enforcement, and response serialization |
| **Database** | **PostgreSQL** | Relational ACID-compliant production database engine |
| **ORM** | **SQLAlchemy** | Object-relational mapping, model definitions, and database migrations |
| **Authentication** | **PyJWT & Bcrypt** | HS256 cryptographic JWT signing and salted password hashing |
| **OAuth 2.0** | **HTTPX** | Asynchronous HTTP client for Google token exchange and user info |
| **Email (SMTP)** | **Standard Library `smtplib`** | Secure TLS email delivery for password reset OTPs |
| **Cloud Storage** | **Cloudinary SDK** | Optional cloud storage integration for user profile photos |
| **Traditional ML** | **Scikit-Learn & XGBoost** | TF-IDF vectorization, LinearSVC, and gradient-boosted decision trees |
| **Deep Learning** | **TensorFlow / Keras** | Bidirectional LSTM neural network and sequence tokenization |
| **Serialization** | **Joblib & Pickle** | Model persistence and runtime pipeline loading |
| **Testing** | **Pytest & HTTPX** | Automated unit and integration test suite |
| **Code Quality** | **Oxlint** | High-performance frontend JavaScript/JSX linter |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([User / Browser])
    
    subgraph Frontend ["Frontend (React + Vite + Tailwind CSS)"]
        UI["React SPA<br/>(Detect, Dashboard, History, Login, Register)"]
        APIClient["API Service Layer<br/>(Axios / withCredentials)"]
        UI --> APIClient
    end
    
    subgraph Gateway ["FastAPI Gateway (Uvicorn)"]
        CORS["CORS & Origin Verification"]
        RateLimit["IP Rate Limiter (60 req/min)"]
        AuthMiddleware["JWT Authentication / Session Cookie"]
        CORS --> RateLimit --> AuthMiddleware
    end
    
    subgraph Routers ["FastAPI Route Handlers"]
        DetectRouter["/api/v1/detect<br/>/api/v1/detect/dl"]
        AuthRouter["/api/v1/auth/*<br/>(login, register, OTP, Google OAuth)"]
        DashboardRouter["/api/v1/dashboard/*<br/>/api/v1/detections/*"]
    end
    
    subgraph Services ["Backend Application Services"]
        EmailService["SMTP Email Service<br/>(Gmail TLS)"]
        GoogleAuth["Google OAuth Service<br/>(OpenID Connect)"]
        CloudinaryService["Cloudinary Service<br/>(Avatar Storage)"]
    end
    
    subgraph Inference ["Model Inference Engines"]
        ML_Email["Email ML Pipeline<br/>(TF-IDF + LinearSVC)"]
        DL_Email["Email DL Pipeline<br/>(Tokenizer + Bi-LSTM)"]
        ML_SMS["SMS ML Pipeline<br/>(TF-IDF + LinearSVC)"]
        ML_URL["URL ML Pipeline<br/>(Lexical Features + XGBoost)"]
    end
    
    subgraph Database ["PostgreSQL Relational Database"]
        UsersTable[(Users Table<br/>id, email, password_hash, profile_photo)]
        DetectionsTable[(Detections Table<br/>id, user_id, content, type, risk_percentage, is_phishing)]
        OTPTable[(Password Reset OTP Table<br/>id, user_id, otp_hash, expires_at, is_used)]
    end

    User --> UI
    APIClient -->|HTTP / JSON Requests| CORS
    AuthMiddleware --> DetectRouter
    AuthMiddleware --> AuthRouter
    AuthMiddleware --> DashboardRouter
    
    AuthRouter --> EmailService
    AuthRouter --> GoogleAuth
    AuthRouter --> CloudinaryService
    
    DetectRouter -->|Email ML| ML_Email
    DetectRouter -->|Email DL| DL_Email
    DetectRouter -->|SMS| ML_SMS
    DetectRouter -->|URL| ML_URL
    
    DetectRouter -.->|Persist Scan| DetectionsTable
    AuthRouter <-->|Read / Write Users & OTPs| UsersTable
    AuthRouter <-->|Store & Validate OTPs| OTPTable
    DashboardRouter <-->|Aggregate Stats & History| DetectionsTable
```

---

## 📂 Project Structure

```text
ai-scam-phishing-detector/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application, CORS, rate limiting, and detection endpoints
│   │   ├── config.py             # Centralized settings & environment variable loaders
│   │   ├── database.py           # PostgreSQL engine, sessionmaker, and table auto-creation
│   │   ├── models.py             # SQLAlchemy models (User, Detection, PasswordResetOTP)
│   │   ├── schemas.py            # Pydantic request/response validation schemas
│   │   ├── routers/
│   │   │   ├── auth.py           # Auth routes: register, login, logout, me, OTP, Google OAuth
│   │   │   └── detections.py     # User history, dashboard statistics, and chart endpoints
│   │   └── services/
│   │       ├── auth_service.py   # Password hashing, JWT token creation, and auth dependencies
│   │       ├── email_service.py  # SMTP password reset email delivery (Gmail TLS)
│   │       ├── google_auth_service.py # Google OAuth token exchange and user info fetching
│   │       ├── detector.py       # Scikit-learn & XGBoost model loaders and inferencing
│   │       ├── unified_detector.py # Unified ML request dispatcher (Email, SMS, URL)
│   │       ├── dl_detector.py    # Bi-LSTM deep learning model inference manager
│   │       └── cloudinary_service.py # Cloudinary avatar upload and deletion helpers
│   ├── tests/
│   │   ├── conftest.py           # Pytest fixtures and mock client setup
│   │   ├── test_api.py           # API detection, CORS, health, and error handling tests
│   │   └── test_auth.py          # Registration, login, OTP recovery, and Google OAuth tests
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Template for backend environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── auth/             # Illustrations, shields, and auth visual elements
│   │   │   ├── dashboard/        # StatsCards, DetectionChart, RecentDetections
│   │   │   ├── history/          # HistoryTable, DetectionModal
│   │   │   ├── Navbar.jsx        # Navigation bar with auth status and theme toggle
│   │   │   └── Footer.jsx        # Footer with cybersecurity disclaimers and links
│   │   ├── pages/                # Landing, Detect, Dashboard, History, Login, Register, Profile, About
│   │   ├── services/
│   │   │   └── api.js            # Axios client with base URL configuration and interceptors
│   │   ├── context/              # ThemeContext (light/dark mode toggle)
│   │   ├── store/                # Redux Toolkit store and auth slices
│   │   ├── App.jsx               # Application routes and navigation structure
│   │   └── main.jsx              # React root bootstrap
│   ├── package.json              # Frontend scripts and dependencies
│   ├── vite.config.js            # Vite build configuration
│   └── .env.example              # Template for frontend environment variables
├── ml/
│   ├── models/                   # Serialized ML pipelines (email, sms, url .joblib files)
│   └── notebooks/                # Model exploration, feature extraction, and training notebooks
├── dl/
│   ├── models/                   # Bi-LSTM model (best_model.keras), tokenizer.pkl, metadata.json
│   └── notebooks/                # Deep learning training and evaluation notebooks
├── .gitignore                    # Git rules for environments, caches, models, and build output
└── README.md                     # Comprehensive project documentation
```

---

## 🧠 ML / DL Models

| Channel | Model Engine | Pipeline Artifact | Key Features & Architecture |
| :--- | :--- | :--- | :--- |
| **Email Phishing** | Traditional ML | `ml/models/email_phishing_pipeline.joblib` | TF-IDF n-gram vectorization + Linear Support Vector Classifier (LinearSVC). Fast, robust against sparse text representations. |
| **Email Phishing** | Deep Learning | `dl/models/best_model.keras`<br/>`dl/models/tokenizer.pkl` | 128-unit Bidirectional LSTM recurrent neural network with word embedding layers, dropout regularization, and sequence padding (200 tokens). |
| **SMS Spam / Smishing** | Traditional ML | `ml/models/sms_spam_pipeline.joblib` | Text preprocessing + TF-IDF vectorizer + LinearSVC tailored for short character counts and SMS phishing keywords. |
| **URL Phishing** | Machine Learning | `ml/models/url_phishing_pipeline.joblib` | Lexical feature extraction (URL length, domain entropy, special character frequencies, keyword flags) + XGBoost classifier. |

> **Model Artifact Notice**: Trained model files (`*.keras`, `*.joblib`, `*.pkl`) are located in `ml/models/` and `dl/models/`. Because of their binary size, they are excluded from Git commits via `.gitignore`. When packaging or deploying the backend, ensure these model directories are present.

---

## 📡 API Endpoints

### Threat Detection Routes

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/detect` | Optional | Standard multi-channel ML detection (`email`, `sms`, `url`). Persists to user account if logged in. |
| `POST` | `/api/v1/detect/dl` | Optional | Deep Learning Bi-LSTM detection (`email` only). Rejects other channels with HTTP 400. |

### Authentication Routes

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | No | Register a new user account (JSON or multipart with avatar photo). |
| `POST` | `/api/v1/auth/login` | No | Authenticate with credentials and receive an HTTP-only JWT cookie. |
| `POST` | `/api/v1/auth/logout` | Yes | Invalidate session and clear the authentication cookie. |
| `GET` | `/api/v1/auth/me` | Yes | Retrieve the authenticated user's profile. |
| `PUT` | `/api/v1/auth/profile` | Yes | Update the user's display name. |
| `POST` | `/api/v1/auth/profile-photo` | Yes | Upload or replace user profile avatar via Cloudinary. |
| `DELETE` | `/api/v1/auth/profile-photo` | Yes | Delete avatar image from Cloudinary and reset database reference. |
| `POST` | `/api/v1/auth/forgot-password` | No | Generate a 6-digit OTP and send recovery email via Gmail SMTP. |
| `POST` | `/api/v1/auth/verify-otp` | No | Validate the 6-digit OTP against active database records. |
| `POST` | `/api/v1/auth/reset-password` | No | Consume single-use OTP and update account password. |
| `GET` | `/api/v1/auth/google/login` | No | Initiate Google OAuth 2.0 flow with CSRF state protection. |
| `GET` | `/api/v1/auth/google/callback` | No | Handle Google OAuth redirect, exchange code, and establish session. |

### Dashboard & History Routes

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/dashboard/stats` | Yes | Retrieve aggregate detection counts (total, safe, suspicious, phishing). |
| `GET` | `/api/v1/dashboard/recent` | Yes | Retrieve the 5 most recent scans for the authenticated user. |
| `GET` | `/api/v1/dashboard/chart` | Yes | Retrieve 7-day daily activity breakdown for dashboard trends. |
| `GET` | `/api/v1/detections/history` | Yes | Retrieve paginated detection history with search and status filtering. |
| `DELETE` | `/api/v1/detections/{id}` | Yes | Delete a specific detection record owned by the authenticated user. |

### Health Route

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | Operational health check returning service status. |

---

## 🔑 Environment Variables

ScamShield uses environment variables for all sensitive configuration. **Never commit `.env` files to version control.**

### Backend Configuration (`backend/.env`)

| Variable | Required | Example / Placeholder Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:password@localhost:5432/scam_detector` | PostgreSQL database connection string |
| `JWT_SECRET_KEY` | **Yes** | `your_secure_random_64_character_hex_key` | High-entropy secret key for signing JWT session tokens |
| `JWT_ALGORITHM` | No | `HS256` | Cryptographic algorithm for JWT signature |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | JWT token lifetime in minutes (default: 24 hours) |
| `CORS_ORIGINS` | **Yes** | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins |
| `COOKIE_SECURE` | No | `False` | Set to `True` in production environments using HTTPS |
| `COOKIE_SAMESITE` | No | `lax` | Cookie SameSite policy (`lax`, `strict`, or `none`) |
| `MAIL_USERNAME` | No | `your_email@gmail.com` | Gmail address used for sending password reset OTP emails |
| `MAIL_PASSWORD` | No | `your_app_password` | Gmail 16-character App Password (requires 2FA enabled) |
| `MAIL_FROM` | No | `no-reply@scamshield.ai` | From display address for automated notification emails |
| `MAIL_SERVER` | No | `smtp.gmail.com` | SMTP host for sending emails |
| `MAIL_PORT` | No | `587` | SMTP port (587 for TLS) |
| `FRONTEND_URL` | **Yes** | `http://localhost:5173` | Frontend URL for OAuth redirects and email references |
| `GOOGLE_CLIENT_ID` | No | `your_google_client_id.apps.googleusercontent.com` | Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | No | `your_google_client_secret` | Google Cloud OAuth 2.0 Client Secret |
| `GOOGLE_REDIRECT_URI` | No | `http://localhost:8000/api/v1/auth/google/callback` | Google OAuth authorized redirect URI |
| `CLOUDINARY_CLOUD_NAME` | No | `your_cloud_name` | Cloudinary cloud identifier for profile avatar storage |
| `CLOUDINARY_API_KEY` | No | `your_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | No | `your_api_secret` | Cloudinary API Secret |

### Frontend Configuration (`frontend/.env`)

| Variable | Required | Example / Placeholder Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8000/api/v1` | Public API base URL consumed by the Axios HTTP client |

---

## ⚙️ Local Installation & Setup

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Python**: `3.10` or newer
- **Node.js**: `v18.0.0` or newer (with `npm`)
- **PostgreSQL**: `v14` or newer (running locally or via a cloud instance)
- **Git**: Installed and configured

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-scam-phishing-detector.git
cd ai-scam-phishing-detector
```

---

### Step 2: Database Setup

1. Start your local PostgreSQL server.
2. Connect using `psql` or a graphical manager (pgAdmin, DBeaver) and create the database:
   ```sql
   CREATE DATABASE scam_detector;
   ```
3. Tables (`users`, `detections`, `password_reset_otps`) are **automatically created** by SQLAlchemy on backend startup.

---

### Step 3: Running Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell):
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local configuration:
   ```bash
   cp .env.example .env
   ```
   *Update `DATABASE_URL` with your local PostgreSQL credentials and set a secure `JWT_SECRET_KEY`.*

5. Verify that trained model files exist:
   - `ml/models/email_phishing_pipeline.joblib`
   - `ml/models/sms_spam_pipeline.joblib`
   - `ml/models/url_phishing_pipeline.joblib`
   - `dl/models/best_model.keras`
   - `dl/models/tokenizer.pkl`

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API will be available at `http://localhost:8000`. Swagger documentation is accessible at `http://localhost:8000/docs`.*

---

### Step 4: Running Frontend

1. Open a separate terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure the environment:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_BASE_URL=http://localhost:8000/api/v1` is set.*

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at `http://localhost:5173`.*

---

## 🧪 Testing

The codebase includes comprehensive automated tests covering detection routing, machine learning pipelines, deep learning inferencing, and authentication flows.

### Running Backend Automated Tests

Run the full pytest suite from the `backend/` directory:

```bash
pytest tests -v
```

**Verified Test Results**:
- **Total Automated Tests**: **47 passed** (0 failed, 0 errors)
  - `tests/test_api.py`: **20 passed** (detection pipelines, multi-channel inputs, CORS origin rejection, rate limiting, and OpenAPI schemas)
  - `tests/test_auth.py`: **27 passed** (registration, login, JWT cookies, profile photo management, guest vs. authenticated detection persistence, 6-digit OTP request/verify/reset, and Google OAuth callback flows)

### Running Frontend Verification

Execute code analysis and production build compilation from the `frontend/` directory:

```bash
# Code style and syntax linting (Oxlint)
npm run lint

# Production build bundle compilation (Vite)
npm run build
```
**Verified Results**:
- `npm run lint`: Completed with 0 errors.
- `npm run build`: Production bundle compiled cleanly in ~1.1 seconds.

---

## 🚀 Production / Deployment Preparation

ScamShield is architected for decoupled cloud deployment where the frontend, backend, and database run as independent, scalable services.

```text
  [ User Browser ]
         │
         ├─── HTTPS (HTML/JS/CSS Assets) ──► [ Frontend Static Hosting ]
         │                                   (Vite Production Build)
         │
         └─── HTTPS / Secure Cookies ──────► [ Backend ASGI Server ]
                                             (FastAPI + Uvicorn)
                                                     │
                                                     ├──► [ PostgreSQL Database ]
                                                     ├──► [ Gmail SMTP Server (TLS) ]
                                                     ├──► [ Google Identity Services ]
                                                     └──► [ Cloudinary Media Storage ]
```

### 1. Frontend Deployment
- **Build Output**: Run `npm run build` inside `frontend/` to generate the production-optimized static bundle in `frontend/dist/`.
- **Static Hosting**: Deploy the `frontend/dist/` directory to any static web host or CDN provider.
- **Client Routing**: Ensure the web server is configured with single-page application (SPA) rewrite rules so all paths (e.g., `/login`, `/register`, `/dashboard`) route to `index.html`.
- **Environment Variable**: Set `VITE_API_BASE_URL=<BACKEND_DEPLOYMENT_URL>/api/v1` at build time so the client communicates with the production backend.

### 2. Backend Deployment
- **ASGI Process Manager**: Run the FastAPI application using Uvicorn or Gunicorn with Uvicorn workers:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port <PORT> --workers 4
  ```
- **Process Supervision**: Use a process supervisor, Docker container, or cloud container platform to ensure automatic process restarts on failures.
- **Python Environment**: Ensure Python 3.10+ is installed and all dependencies from `requirements.txt` are installed in the production environment.

### 3. PostgreSQL Database Deployment
- **Managed Database**: Provision a production PostgreSQL instance (v14 or newer).
- **Connection String**: Supply the secure connection string in `DATABASE_URL` using SSL mode:
  ```text
  DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@<DATABASE_HOST>:<PORT>/<DATABASE_NAME>?sslmode=require
  ```
- **Schema Initialization**: SQLAlchemy automatically checks and creates missing tables (`users`, `detections`, `password_reset_otps`) and foreign-key indexes on backend startup.

### 4. Environment-Variable Configuration
Prepare production environment variables on the hosting platform:
- `DATABASE_URL`: Production PostgreSQL connection string.
- `JWT_SECRET_KEY`: High-entropy random 64-character secret string (e.g., generated with `openssl rand -hex 32`).
- `JWT_ALGORITHM`: `HS256`.
- `COOKIE_SECURE`: `True` (forces the browser to transmit the session cookie only over HTTPS).
- `COOKIE_SAMESITE`: `lax` (or `none` if the frontend and backend are hosted on separate domains with HTTPS).
- `CORS_ORIGINS`: Comma-separated list containing `<FRONTEND_DEPLOYMENT_URL>`.
- `FRONTEND_URL`: Set to `<FRONTEND_DEPLOYMENT_URL>` for OAuth redirects and system links.
- `MAIL_USERNAME` & `MAIL_PASSWORD`: Production email address and App Password for SMTP OTP delivery.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Configured in the Google Cloud Console with authorized redirect URI set to `<BACKEND_DEPLOYMENT_URL>/api/v1/auth/google/callback`.

### 5. CORS Configuration
In production, cross-origin resource sharing must strictly match the frontend domain:
```text
CORS_ORIGINS=https://<FRONTEND_DEPLOYMENT_DOMAIN>
```
The backend automatically rejects requests from unlisted origins and prevents mutating requests with cookies from mismatched origins.

### 6. Production API URL Configuration
- Ensure the frontend build uses the HTTPS URL of the deployed backend:
  ```text
  VITE_API_BASE_URL=https://<BACKEND_DEPLOYMENT_DOMAIN>/api/v1
  ```
- Both frontend and backend must run under HTTPS in production so that secure cookies (`COOKIE_SECURE=True`) are properly accepted and sent by browsers.

### 7. ML / DL Model Availability in Production
Because trained model binaries are ignored by Git, ensure your deployment packaging pipeline explicitly includes:
- `ml/models/email_phishing_pipeline.joblib`
- `ml/models/sms_spam_pipeline.joblib`
- `ml/models/url_phishing_pipeline.joblib`
- `dl/models/best_model.keras`
- `dl/models/tokenizer.pkl`
- `dl/models/metadata.json`

If deploying via Docker, ensure these files are copied into the container image before building.

---

## 🔒 Security Notes

- **Never Commit `.env` Files**: Always ensure `.env` is listed in `.gitignore`. Use `.env.example` templates for configuration reference.
- **Never Expose Secrets in Frontend Code**: The React frontend bundle is publicly readable. Never embed database passwords, JWT secrets, SMTP credentials, or OAuth client secrets in frontend files.
- **Use Strong Production Secrets**: Generate a 256-bit random hex string for `JWT_SECRET_KEY`. Never use fallback or default development keys in production.
- **Protect OAuth & SMTP Credentials**: Restrict Google OAuth authorized redirect URIs strictly to the deployed domain. Use Google App Passwords instead of primary account passwords for SMTP.
- **Enforce HTTPS in Production**: Set `COOKIE_SECURE=True` so authentication cookies cannot be intercepted over plaintext HTTP connections.
- **Restrict Production CORS**: Never set `CORS_ORIGINS=*` when `allow_credentials=True` is enabled. Explicitly list authorized client origins.
- **Rate Limiting**: ScamShield enforces an in-memory sliding-window rate limit (60 requests per minute per IP) on public threat detection endpoints to prevent scraping and denial-of-service attempts.

---




