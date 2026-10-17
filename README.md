# Vitality Hub

Vitality Hub is a full-stack wellness platform for college project use. It combines a FastAPI backend with a Vite + React frontend to support daily wellness tracking, community awareness, educational resources, and lifestyle habit planning.

## Features

- Secure user authentication and role-based access
- Personal wellness profile management
- Daily goals, water, sleep, and mood tracking
- Healthy food and exercise discovery
- Community survey and summary analytics
- Challenge, reminder, and achievement modules
- Wellness resource library and chatbot assistant
- Admin summary dashboard for monitoring participation

## Tech stack

- Frontend: React, Vite, React Router, Recharts, Lucide, QR code generation
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, SQLite for development/testing
- Testing: pytest

## Project structure

- backend/ — FastAPI application and tests
- frontend/ — React frontend application
- index.html — root HTML entry for the app shell

## Quick start

### Backend

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The frontend is configured to talk to the backend at http://localhost:8000 by default.

## Environment

Copy the backend environment template if needed:

```bash
cd backend
cp .env.example .env
```

Update the values to match your local Postgres or app settings when needed.

## Testing

```bash
cd backend
source venv/bin/activate
pytest -q
```

## Notes

- This project is intended for educational and demonstrative use, not medical advice.
- The app includes demo data and example wellness content for a realistic project experience.
- The app can be adapted for Postgres in production by switching the SQLAlchemy connection string.

## Main routes

- / — landing page
- /login — user login
- /register — account creation
- /dashboard — wellness dashboard
- /profile — profile management
- /exercise — movement guidance
- /food — nutrition resources
- /water — hydration logging
- /sleep — sleep tracking
- /mood — mood check-ins
- /survey — community awareness survey
- /community — community analytics
- /resources — educational resources
- /awareness — campaign info
- /chatbot — wellness assistant
- /admin — admin summary dashboard
