# AI Scam & Phishing Detector (ScamShield)

An AI-powered cybersecurity platform for detecting scams, phishing attempts, and fraudulent content in text messages, emails, and URLs.

## Frontend Architecture

The frontend is built with **React**, **Vite**, **Tailwind CSS**, and **Lucide React**.

### Routes
- `/` — Public Landing Page (Brand showcase, feature cards, capability highlights)
- `/detect` — Scam & Phishing Detection Portal (Message, Email, and URL analysis with interactive states)
- `/dashboard` — Security Operations Dashboard (Statistics, activity overview, recent detections, quick actions, safety tips)
- `/history` — Detection History (Search, filter by type/result, and manage past scans)
- `/profile` — User Account Profile (UI shell prepared for future FastAPI authentication)
- `/about` — About ScamShield (Mission statement, 3-step AI pipeline, and architecture technology stack)

### Data Architecture
- **Static Content**: Headings, descriptions, navigation, safety tips, and architecture specs are rendered statically.
- **Dynamic Application Data**: Designed to consume real backend endpoints via `src/services/api.js`. Initially displays clean, honest empty and idle states without fabricated mock numbers.

### Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Environment Configuration
Configure the FastAPI backend URL in `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```