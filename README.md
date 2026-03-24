# AI Apprentice Platform

A comprehensive multi-role platform that manages the full apprenticeship lifecycle, connecting Apprentices, Companies, Training Providers, and Admins.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion, React Router, TanStack Query
- React Hook Form + Zod
- Recharts

### Backend
- FastAPI + Python 3.11+
- SQLAlchemy + PostgreSQL + Alembic
- JWT Authentication
- LangGraph (AI workflow orchestration)
- Groq API (Llama 3.3 70B)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Using Docker (Recommended)

```bash
# Clone and setup
cp .env.example .env
# Edit .env with your API keys

# Start everything
docker-compose up --build
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Setup database
alembic upgrade head
python -m app.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@apprentice.ai | Admin123! |
| Apprentice | alex@example.com | Demo123! |
| Apprentice | jordan@example.com | Demo123! |
| Company | hr@techcorp.com | Demo123! |
| Company | recruit@innovate.com | Demo123! |
| Training Provider | admin@skillsacademy.com | Demo123! |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routers
│   │   ├── core/            # Config, security, deps
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── ai/              # LangGraph workflows
│   │   └── utils/           # Utilities
│   ├── alembic/             # Migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature modules
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── pages/           # Page components
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## License

MIT
