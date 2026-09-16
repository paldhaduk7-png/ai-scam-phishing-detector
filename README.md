# 🛡️ ScamShield — AI-Powered Scam & Phishing Detection Platform

An end-to-end, full-stack cybersecurity application designed to identify scams, fraudulent messages, and phishing attempts across multiple communication vectors. ScamShield combines modern natural language processing (NLP), traditional machine learning, deep learning sequence models, a high-performance REST API, and an intuitive reactive user interface to deliver actionable threat assessments in real time.

---

## 📌 Project Overview

Digital communication channels (email, SMS, and web links) remain the primary initial access vector for social engineering, financial fraud, and credential harvesting. Traditional rule-based filters struggle against rapidly evolving phrasing and obfuscated links. 

**ScamShield** addresses this challenge by analyzing three high-risk communication modalities:
- **Emails**: Analyzed for credential theft language, urgency triggers, fake invoices, and deceptive account alerts.
- **SMS / Short Messages**: Evaluated for smishing patterns, predatory financial schemes, prize lures, and malicious shortlinks.
- **URLs**: Screened for deceptive domain attributes, suspicious character heuristics, brand impersonation, and malicious routing.

The platform provides a unified architecture integrating:
1. **Frontend**: A reactive, single-page application built with React, Vite, and Tailwind CSS.
2. **Backend**: An asynchronous REST API built with FastAPI and Pydantic.
3. **Inference Engines**: Multi-channel traditional machine learning (scikit-learn, XGBoost) and deep sequence modeling (Keras Bi-LSTM).
4. **Persistence Layer**: A relational PostgreSQL database managed through SQLAlchemy ORM for user accounts, scan audit trails, and personalized analytics.

---

## ✨ Key Features

- **Multi-Vector Threat Detection**:
  - **Email Analysis via Traditional ML**: LinearSVC classification coupled with TF-IDF vectorization for fast, reliable email threat scoring.
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
  - **Token Authentication**: JSON Web Tokens (JWT) stored in HTTP-only cookies to mitigate script-based token theft.
  - **Cryptographic Security**: Passwords hashed securely using `bcrypt`.
  - **Profile Management**: Profile name updates and optional Cloudinary avatar management (upload and removal).
  - **User Isolation**: Detections executed while logged in are automatically linked to the user account; unauthenticated public scans remain accessible without polluting personal records.
- **User Experience & System Design**:
  - **Adaptive Theme**: One-click Light and Dark mode toggle with persistent state.
  - **Error Handling & Sanitization**: Standardized API error responses with server-side traceback isolation.
  - **Built-in Documentation**: Interactive Swagger UI and ReDoc endpoints available out of the box.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([User / Browser])
    
    subgraph Frontend ["Frontend (React + Vite + Tailwind CSS)"]
        UI["React SPA<br/>(Landing, Detect, Dashboard, History, Auth)"]
        APIClient["API Service Layer<br/>(Axios / Credentials)"]
        UI --> APIClient
    end
    
    subgraph Gateway ["FastAPI Gateway (Uvicorn)"]
        CORS["CORS & Origin Verification"]
        RateLimit["IP Rate Limiter"]
        AuthMiddleware["JWT Authentication / Session Cookie"]
        CORS --> RateLimit --> AuthMiddleware
    end
    
    subgraph Routers ["FastAPI Route Handlers"]
        DetectRouter["/api/v1/detect<br/>/api/v1/detect/dl"]
        AuthRouter["/api/v1/auth/*"]
        DashboardRouter["/api/v1/dashboard/*<br/>/api/v1/detections/*"]
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
    end

    User --> UI
    APIClient -->|HTTP / JSON Requests| CORS
    AuthMiddleware --> DetectRouter
    AuthMiddleware --> AuthRouter
    AuthMiddleware --> DashboardRouter
    
    DetectRouter -->|Email ML| ML_Email
    DetectRouter -->|Email DL| DL_Email
    DetectRouter -->|SMS| ML_SMS
    DetectRouter -->|URL| ML_URL
    
    DetectRouter -.->|Persist Scan| DetectionsTable
    AuthRouter <-->|Read / Write Users| UsersTable
    DashboardRouter <-->|Aggregate Stats & History| DetectionsTable
```

---

## 🔄 Detection Flow

When a user submits content for verification, the system executes the following flow:

1. **Client Submission**: The user enters an Email, SMS text, or URL in the detection interface and submits.
2. **Channel Selection**:
   - For **Email**: The user can toggle between the **Traditional ML Pipeline** or the **Bi-LSTM Deep Learning Neural Network**.
   - For **SMS**: Routed to the SMS Spam/Smishing analysis pipeline.
   - For **URL**: Routed to the URL Phishing feature extractor and classifier.
3. **API Routing**:
   - Standard ML inference requests are sent via `POST /api/v1/detect` with a JSON payload specifying `content` and `content_type` (`"email"`, `"sms"`, or `"url"`).
   - Email Deep Learning inference is sent via `POST /api/v1/detect/dl` with `content` and `content_type: "email"`.
4. **Feature Extraction & Inference**:
   - **Email ML / SMS ML**: The text is normalized and converted into sparse n-gram features via TF-IDF before passing into a Linear Support Vector Classifier (LinearSVC).
   - **Email DL**: Text is cleaned, sequence-tokenized, truncated/padded to 200 tokens, passed through word embedding layers, and evaluated through a Bidirectional LSTM network yielding a sigmoid probability.
   - **URL ML**: The URL string is parsed into domain-level and lexical features (length, special character ratios, entropy, keyword triggers) and classified with XGBoost.
5. **Score Normalization & Verdict**: Raw model outputs (probabilities or decision boundary distances) are transformed into a normalized `risk_percentage` (0.0% to 100.0%) and assigned a classification verdict (`Safe`, `Suspicious`, or `Phishing`).
6. **Optional Persistence**: If an authenticated session cookie is present, the detection record, risk percentage, and metadata are persisted to the PostgreSQL `detections` table linked to the user's ID.
7. **Client Feedback**: The frontend receives the structured response, displays the threat badge, updates the risk gauge meter, and enables saving or reviewing in Detection History.

---

## 🧠 Machine Learning & Deep Learning

| Input Channel | Approach | Architecture / Algorithm | Purpose |
| :--- | :--- | :--- | :--- |
| **Email** | Traditional ML | TF-IDF Vectorizer + LinearSVC (`email_phishing_pipeline.joblib`) | Fast text classification for email scams and credential harvesting |
| **Email** | Deep Learning | Tokenizer + Embedding Layer + Bidirectional LSTM (`best_model.keras`) | Sequence-aware semantic classification capturing long-distance sentence context |
| **SMS / Message** | Traditional ML | TF-IDF Vectorizer + LinearSVC (`sms_spam_pipeline.joblib`) | Smishing, financial fraud, and SMS spam classification |
| **URL** | ML Heuristics | Lexical Feature Extractor + XGBoost (`url_phishing_pipeline.joblib`) | Phishing domain, obfuscated URL, and malicious link detection |

> **Note on Model Artifacts**: Trained model binaries (`*.keras`, `*.joblib`, `*.pkl`) and raw training datasets are managed in `ml/models/` and `dl/models/` and isolated from the Git version tree via `.gitignore` to maintain repository hygiene.

---

## 🗄️ Database & Persistence

The application uses **PostgreSQL** as its primary relational datastore, interfaced using **SQLAlchemy ORM**:

- **`users` Table**: Stores registered user identity, unique email, bcrypt-hashed passwords, profile metadata, and Cloudinary avatar references.
- **`detections` Table**: Stores individual detection audit logs including `user_id` (foreign key, nullable for unauthenticated scans), `content_type`, input content snippet, threat classification verdict, continuous decision score, normalized `risk_percentage`, `is_phishing` boolean flag, and timestamp.
- **Automatic Schema Synchronization**: Table schemas and indexing (such as `ix_detections_user_id`) are safely verified and created automatically on backend initialization via `Base.metadata.create_all()`.
- **User-Isolated Analytics**: All dashboard metrics (Total Scans, Safe, Suspicious, Phishing), 7-day activity graphs, and scan history queries are strictly scoped to `Detection.user_id == current_user.id`.

---

## 🔐 Authentication & Security

The platform adheres to practical application security standards:

- **JWT Session Tokens**: Authentication generates signed JSON Web Tokens (using HS256) encapsulated in HTTP-only, `SameSite=Lax` cookies to prevent client-side JavaScript access.
- **Password Hashing**: User passwords are encrypted with individual salt rounds using `bcrypt`. Plaintext passwords are never stored or logged.
- **Protected Endpoints**: Dashboard metrics, detection history, profile updates, and avatar uploads enforce authentication dependencies (`get_current_user`).
- **Data Isolation**: History deletion and retrieval queries enforce database-level user ID matching, preventing unauthorized cross-user data access.
- **Sanitized Server Responses**: Unhandled backend exceptions are intercepted by a global exception handler, logging detailed tracebacks server-side while returning generic, safe error messages to clients.
- **Origin & Rate Control**: CORS middleware restricts allowable browser origins, and mutating requests validate request headers. An in-memory IP sliding-window rate limiter prevents abuse of public detection endpoints.
- **Repository Hygiene**: Sensitive files (`.env`, `.env.*`), Python bytecode (`__pycache__`), virtual environments (`.venv`), package dependencies (`node_modules`), build output (`dist`), and training data are strictly excluded via `.gitignore`.

---

## 🖥️ Technology Stack

| Layer | Technology | Primary Role / Package |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19** | Component-based single-page application framework |
| **Build Tooling** | **Vite 8** | Modern frontend development server and bundler |
| **Styling** | **Tailwind CSS 4** | Utility-first responsive styling and dark mode theming |
| **Icons & UI** | **Lucide React** | Consistent iconography across dashboards and detection cards |
| **Notifications** | **Sonner** | Toast notifications for detection feedback and auth events |
| **State & HTTP** | **Redux Toolkit & Axios** | Global user state management and API client communication |
| **Backend API** | **FastAPI** | Asynchronous, OpenAPI-compliant Python web framework |
| **Server** | **Uvicorn** | ASGI web server implementation |
| **Validation** | **Pydantic v2** | Request/response data validation and schema serialization |
| **Database** | **PostgreSQL** | Relational ACID-compliant production database engine |
| **ORM** | **SQLAlchemy** | Object-relational mapping and database session handling |
| **Authentication** | **PyJWT & Bcrypt** | Cryptographic token signing and salted password hashing |
| **Cloud Storage** | **Cloudinary SDK** | Optional cloud storage integration for user profile photos |
| **Traditional ML**| **Scikit-Learn & XGBoost** | TF-IDF vectorization, LinearSVC, and gradient-boosted trees |
| **Deep Learning** | **TensorFlow / Keras** | Bidirectional LSTM neural network and text tokenization |
| **Serialization** | **Joblib & Pickle** | Deserialization and caching of trained ML pipelines |
| **Testing** | **Pytest & HTTPX** | Automated test suite and asynchronous API client testing |
| **Code Quality** | **Oxlint** | High-performance JavaScript linting |

---

## 📂 Repository Structure

```text
ai-scam-phishing-detector/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, CORS, rate limiting, and exception handlers
│   │   ├── config.py             # Pydantic settings & environment variable loaders
│   │   ├── database.py           # PostgreSQL engine, SessionLocal, and table creation
│   │   ├── models.py             # SQLAlchemy models (User, Detection)
│   │   ├── schemas.py            # Pydantic request/response validation schemas
│   │   ├── routers/
│   │   │   ├── auth.py           # Registration, login, logout, me, and photo endpoints
│   │   │   └── detections.py     # History, dashboard statistics, and chart endpoints
│   │   └── services/
│   │       ├── auth_service.py   # Password hashing, JWT token creation, and auth dependencies
│   │       ├── detector.py       # ML pipeline loaders and individual channel inferencing
│   │       ├── unified_detector.py # Unified ML request dispatcher (Email, SMS, URL)
│   │       ├── dl_detector.py    # Bi-LSTM deep learning inference manager
│   │       └── cloudinary_service.py # Cloudinary avatar upload and deletion helpers
│   ├── tests/
│   │   ├── conftest.py           # Pytest fixtures and mock client setup
│   │   ├── test_auth.py          # Authentication and user registration test suite
│   │   ├── test_detector.py      # ML detection and response schema test suite
│   │   └── test_dl_detector.py   # Deep learning Bi-LSTM endpoint test suite
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Template for backend configuration
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, Footer, ThemeToggle, Card)
│   │   │   ├── dashboard/        # StatsCards, DetectionChart, RecentDetections
│   │   │   └── history/          # HistoryTable, DetectionModal
│   │   ├── pages/                # Landing, Detect, Dashboard, History, Login, Register, Profile, About
│   │   ├── services/
│   │   │   └── api.js            # Axios client with base URL configuration and interceptors
│   │   ├── App.jsx               # Route definitions and application layout wrapper
│   │   └── main.jsx              # Application bootstrap with Redux Provider and ThemeProvider
│   ├── package.json              # Frontend scripts and dependencies
│   ├── vite.config.js            # Vite build configuration
│   └── .env.example              # Template for frontend API base URL
├── ml/
│   ├── models/                   # Serialized ML pipelines (email, sms, url .joblib files)
│   └── notebooks/                # Experimentation and training notebooks
├── dl/
│   ├── models/                   # Bi-LSTM model (best_model.keras), tokenizer.pkl, metadata.json
│   └── notebooks/                # Deep learning training and evaluation notebooks
├── .gitignore                    # Git exclusion rules for environments, caches, models, and builds
└── README.md                     # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js**: `v18.0.0` or newer (with `npm`)
- **Python**: `3.10` or newer
- **PostgreSQL**: `v14` or newer (running locally or via a cloud instance)
- **Git**: Installed and configured

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-scam-phishing-detector.git
cd ai-scam-phishing-detector
```

---

### Step 2: PostgreSQL Database Setup

1. Launch your PostgreSQL service (e.g., via pgAdmin, Docker, or command line).
2. Create an empty database for the application:
   ```sql
   CREATE DATABASE scam_detector;
   ```

---

### Step 3: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   # On Windows:
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure the environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to match your local PostgreSQL connection credentials and a secure random JWT secret (see [Environment Variables](#-environment-variables)).*

5. Start the FastAPI backend application:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will automatically initialize the database tables on startup. The API will be accessible at `http://localhost:8000`.*

---

### Step 4: Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure the frontend environment:
   ```bash
   cp .env.example .env
   ```
   *Verify that `VITE_API_BASE_URL` points to `http://localhost:8000/api/v1`.*

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start at `http://localhost:5173`.*

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:password@localhost:5432/scam_detector` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | **Yes** | `sample_secure_random_64_character_hex_key` | Secret key used for signing JWT access tokens |
| `JWT_ALGORITHM` | No | `HS256` | Cryptographic algorithm for JWT signature |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | Token lifetime (default: 24 hours) |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | Allowed origins for cross-origin resource sharing |
| `COOKIE_SECURE` | No | `False` | Set to `True` in production environments with HTTPS |
| `COOKIE_SAMESITE` | No | `lax` | Cookie SameSite policy (`lax`, `strict`, `none`) |
| `CLOUDINARY_CLOUD_NAME` | No | `your_cloud_name` | Cloudinary cloud identifier (for avatar uploads) |
| `CLOUDINARY_API_KEY` | No | `your_api_key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | `your_api_secret` | Cloudinary API secret |

### Frontend Configuration (`frontend/.env`)

| Variable | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8000/api/v1` | Base REST API URL consumed by the Axios service client |

---

## 📡 API Documentation

Once the backend is running, complete interactive OpenAPI documentation is automatically served:
- **Swagger UI**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc**: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

### Primary REST Endpoints

| Category | Method | Endpoint | Auth Required | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Health** | `GET` | `/health` | No | Operational status check |
| **Detection** | `POST` | `/api/v1/detect` | Optional | Multi-channel ML detection (`email`, `sms`, `url`) |
| **Detection (DL)**| `POST` | `/api/v1/detect/dl` | Optional | Deep Learning Bi-LSTM detection (`email` only) |
| **Auth** | `POST` | `/api/v1/auth/register` | No | Register a new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | No | Authenticate user and issue HTTP-only session cookie |
| **Auth** | `POST` | `/api/v1/auth/logout` | Yes | Clear authentication session cookie |
| **Auth** | `GET` | `/api/v1/auth/me` | Yes | Retrieve profile details of authenticated user |
| **Auth** | `PUT` | `/api/v1/auth/me` | Yes | Update profile name of authenticated user |
| **Auth** | `POST` | `/api/v1/auth/me/photo` | Yes | Upload or update user avatar image |
| **Auth** | `DELETE`| `/api/v1/auth/me/photo` | Yes | Remove user avatar image |
| **Dashboard** | `GET` | `/api/v1/dashboard/stats` | Yes | Aggregate scan counts (total, safe, suspicious, phishing) |
| **Dashboard** | `GET` | `/api/v1/dashboard/recent` | Yes | Retrieve most recent scans for the user |
| **Dashboard** | `GET` | `/api/v1/dashboard/chart` | Yes | 7-day daily activity breakdown |
| **History** | `GET` | `/api/v1/detections/history` | Yes | Paginated scan history with search and status filters |
| **History** | `DELETE`| `/api/v1/detections/{id}` | Yes | Delete a specific scan record owned by the user |

---

## 🧪 Testing & Quality Assurance

The codebase includes automated unit and integration tests for backend API routing, machine learning inference, and authentication security, alongside frontend linting and production build validation.

### Backend Automated Tests

Run the full test suite from the `backend/` directory:

```bash
pytest tests -v
```
**Verified Results**:
- Total Tests: **34**
- Passed: **34**
- Failed: **0**
- Errors: **0**

Run authentication and session tests specifically:
```bash
pytest tests/test_auth.py -v
```
**Verified Results**:
- Authentication Tests: **14 passed** (0 failed)

### Frontend Verification

Execute frontend code analysis and production build tests from the `frontend/` directory:

```bash
# Code style and syntax linting
npm run lint
# Verified Result: 0 errors

# Production build compilation
npm run build
# Verified Result: Build completed cleanly in ~700ms with zero errors
```

---

## 🛡️ Repository & Data Hygiene

To guarantee sensitive data isolation and prevent accidental leaks of user credentials or bulky artifacts:

- **Secrets & Credentials**: Local configuration files (`.env`, `.env.*`) are strictly excluded from version control. Only safe templates (`.env.example`) with dummy values are tracked.
- **Trained Model Binaries**: Heavy deep learning checkpoints (`*.keras`, `*.h5`) and serialized pipelines (`*.joblib`, `*.pkl`) are managed locally and excluded by `.gitignore`.
- **Datasets**: Raw and processed training CSVs (such as phishing URLs and spam corpora) are ignored by Git.
- **Build Artifacts & Virtual Environments**: Python bytecode (`__pycache__`), virtual environment folders (`.venv/`), test caches (`.pytest_cache/`), and Node build outputs (`dist/`, `node_modules/`) are isolated.

---

## 🚀 Project Status

- **Backend**: Fully operational. All 34 automated unit/integration tests pass cleanly. Real database integration with PostgreSQL verified.
- **Frontend**: Fully operational. Routing, responsive dark/light theme, API communication, and interactive dashboard charts verified with zero lint errors and clean production builds.
- **Inference Engines**: Both the multi-channel traditional ML pipelines (Email, SMS, URL) and the deep learning Bi-LSTM sequence network load correctly and serve predictions.
- **Persistence & Audit**: PostgreSQL records user sessions and scans with full relational integrity.

---

## 👨‍💻 Project / Internship

- **Developer / Candidate**: [Pal Dhaduk]
- **Internship Role**: [AI / Full-Stack Cybersecurity Intern]
- **Organization / Company**: [Internship Organization Name]
- **Academic Institution**: [University / College Name]
- **Project Mentor**: [Mentor / Supervisor Name]
- **Project Repository**: [ai-scam-phishing-detector](https://github.com/your-username/ai-scam-phishing-detector)
- **License**: MIT License