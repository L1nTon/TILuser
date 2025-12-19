# Educational Center (FastAPI + Vite)

## Backend (FastAPI + SQLite)
- `cd backend && cp env.example .env` — отредактируй при необходимости.
- `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Для миграций: `cd backend && alembic -c ../alembic.ini upgrade head` (или из корня: `alembic upgrade head`; база `backend/local.db`).

## Frontend (Vite)
- `cd frontend && cp env.example .env`
- `cd frontend && npm install`
- `cd frontend && npm run dev -- --host --port 5173`
- Админка на `http://localhost:5173/admin`: вход по логину/паролю из `backend/.env`, дальше доступны разделы (курсы, трек, отзывы, партнёры, блог, контакты) с добавлением записей через API.

API по умолчанию доступен на `http://localhost:8000`, фронтенд — на `http://localhost:5173`.
