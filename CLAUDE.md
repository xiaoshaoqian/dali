# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**搭理 (Dali)** is an AI-powered fashion styling assistant mobile app with a full-stack monorepo architecture.

- **Backend ([dali-api/](dali-api/))**: Python/FastAPI REST API with PostgreSQL
- **Frontend ([dali-mobile/](dali-mobile/))**: React Native mobile app via Expo (iOS, Android, Web)
- **Architecture**: Client-server with mobile as the primary interface

## Development Commands

### Backend (dali-api/)

```bash
# Install dependencies
poetry install

# Start development server
poetry run uvicorn app.main:app --reload

# Database migrations
poetry run alembic upgrade head              # Apply migrations
poetry run alembic revision --autogenerate -m "description"  # Create migration
poetry run alembic downgrade -1              # Rollback

# Testing
poetry run pytest                             # Run tests
poetry run pytest --cov=app --cov-report=html # With coverage

# Linting (Ruff)
poetry run ruff check .                       # Check
poetry run ruff check --fix .                 # Auto-fix
```

### Frontend (dali-mobile/)

```bash
# Install dependencies
npm install

# Start development server
npx expo start
npx expo start --android    # Android emulator/device
npx expo start --ios        # iOS simulator
npx expo start --web        # Web browser

# Linting and testing
npm run lint
npm run test
```

### Docker (Backend)

```bash
# Using Docker Compose
docker-compose up -d
docker-compose logs -f api

# Standalone Docker
docker build -t dali-api:latest .
docker run -d --name dali-api -p 8000:8000 --env-file .env dali-api:latest
```

## Architecture

### Backend Structure ([dali-api/](dali-api/))

- **[app/api/](dali-api/app/api/)** - API routes organized under `/api/v1/`
- **[app/core/](dali-api/app/core/)** - Utilities (exceptions, logging, security)
- **[app/db/](dali-api/app/db/)** - Database session and connection management
- **[app/integrations/](dali-api/app/integrations/)** - External services (Alibaba Cloud OSS, AI, SMS)
- **[app/models/](dali-api/app/models/)** - SQLAlchemy ORM models (User, Outfit, Garment, etc.)
- **[app/schemas/](dali-api/app/schemas/)** - Pydantic schemas for request/response validation
- **[app/services/](dali-api/app/services/)** - Business logic layer
- **[alembic/](dali-api/alembic/)** - Database migrations

**Key Patterns:**
- Async/await throughout with SQLAlchemy 2.0+ async support
- Custom exception handling with standardized error responses ([app/core/exceptions.py](dali-api/app/core/exceptions.py))
- Dependency injection via FastAPI's `Depends()`
- OSS storage with automatic fallback to mock in development

### Frontend Structure ([dali-mobile/](dali-mobile/))

- **[app/](dali-mobile/app/)** - Expo Router file-based routing
  - **[(auth)/](dali-mobile/app/(auth)/)** - Authentication screens (login, register)
  - **[(tabs)/](dali-mobile/app/(tabs)/)** - Main tab navigation (home, wardrobe, outfit, profile)
  - **[camera/](dali-mobile/app/camera/)** - Camera functionality for clothing photos
  - **[recognition/](dali-mobile/app/recognition/)** - AI clothing recognition
  - **[outfit/](dali-mobile/app/outfit/)** - Outfit management and generation
  - **[style-profile/](dali-mobile/app/style-profile/)** - User style preferences
- **[src/components/](dali-mobile/src/components/)** - Reusable UI components
- **[src/stores/](dali-mobile/src/stores/)** - Zustand state management (auth, garment, outfit, offline)
- **[src/services/](dali-mobile/src/services/)** - API client and data fetching
- **[src/hooks/](dali-mobile/src/hooks/)** - Custom React hooks
- **[src/types/](dali-mobile/src/types/)** - TypeScript type definitions

**Key Patterns:**
- File-based routing with Expo Router
- Zustand for global state, React Query for server state
- Offline-first with action queue persistence ([src/stores/offlineStore.ts](dali-mobile/src/stores/offlineStore.ts))
- Path alias `@/` maps to `src/`

## Environment Configuration

### Backend Required Variables ([.env.example](dali-api/.env.example))

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT secret key |
| `ALIBABA_OSS_*` | OSS configuration (optional - uses mock if unset) |
| `TONGYI_API_KEY` | AI service key |
| `SMS_ACCESS_KEY_*` | SMS service credentials |

### Frontend

- API base URL configured in [src/services/api.ts](dali-mobile/src/services/api.ts)
- AsyncStorage for secure token storage

## Database Schema (Key Models)

- **User** - Authentication and profile
- **Garment** - Individual clothing items with photos and metadata
- **Outfit** - Curated outfit combinations
- **UserPreferences** - Style preferences (colors, styles, occasions)
- **ShareRecord** - Social sharing records

## External Services

- **Alibaba Cloud OSS** - Image storage with automatic mock fallback
- **Tongyi AI** - Clothing recognition and styling recommendations
- **Alibaba SMS** - Phone-based authentication

## BMAD Framework

The project includes BMAD (Business Method Agile Development) workflows in `[.cursor/rules/bmad/](.cursor/rules/bmad/)`. These are manual rules - reference explicitly when needed for structured development workflows (PRD creation, architecture design, code reviews, etc.).

## API Documentation

When backend is running: http://localhost:8000/docs (Swagger UI) or /redoc
