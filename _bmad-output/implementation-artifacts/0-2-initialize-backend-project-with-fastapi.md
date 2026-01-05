# Story 0.2: Initialize Backend Project with FastAPI

Status: done

## Story

As a **developer**,
I want to initialize the backend project with Python FastAPI and SQLAlchemy 2.0,
So that the backend has the correct architecture foundation for AI integration and data management.

## Acceptance Criteria

1. **Given** no existing backend project
   **When** I create `dali-api` directory and run `poetry init`
   **Then** the Poetry project is initialized with Python 3.11+

2. **Given** Poetry is initialized
   **When** I add core dependencies: `poetry add fastapi uvicorn sqlalchemy alembic asyncpg`
   **Then** all packages are installed and `pyproject.toml` is updated

3. **Given** dependencies are installed
   **When** I create the architecture-defined folder structure
   **Then** the project has all required directories per architecture document

4. **Given** folder structure is created
   **When** I configure naming conventions in code templates
   **Then** database tables use `snake_case`, API endpoints use kebab-case, JSON fields use camelCase

5. **Given** the project is configured
   **When** I run `poetry run uvicorn app.main:app --reload`
   **Then** the FastAPI server starts successfully with Swagger docs accessible at `/docs`

## Tasks / Subtasks

- [x] Task 1: Initialize Poetry project (AC: #1)
  - [x] Create `dali-api` directory in project root
  - [x] Run `poetry init --no-interaction --name dali-api --python "^3.11"`
  - [x] Verify `pyproject.toml` is created with Python 3.11+ constraint
  - [x] Configure Poetry to use non-package mode (for API service)

- [x] Task 2: Install core dependencies (AC: #2)
  - [x] Install FastAPI framework: `poetry add fastapi[standard]`
  - [x] Install async server: `poetry add uvicorn[standard]`
  - [x] Install ORM with async support: `poetry add "sqlalchemy[asyncio]>=2.0"`
  - [x] Install async PostgreSQL driver: `poetry add asyncpg`
  - [x] Install database migrations: `poetry add alembic`
  - [x] Install additional utilities: `poetry add python-dotenv pydantic-settings`
  - [x] Install JWT/security: `poetry add python-jose[cryptography] passlib[bcrypt]`
  - [x] Install dev dependencies: `poetry add --group dev pytest pytest-asyncio httpx ruff`

- [x] Task 3: Create folder structure per architecture (AC: #3)
  - [x] Create `app/` main application directory
  - [x] Create `app/main.py` FastAPI entry point
  - [x] Create `app/config.py` settings management with Pydantic
  - [x] Create `app/api/` routes directory with `__init__.py`
  - [x] Create `app/api/deps.py` for dependency injection
  - [x] Create `app/api/v1/` versioned routes with `router.py`
  - [x] Create route modules: `auth.py`, `users.py`, `outfits.py`, `wardrobe.py`, `share.py`, `context.py`
  - [x] Create `app/models/` SQLAlchemy models with `base.py`
  - [x] Create model files: `user.py`, `preference.py`, `outfit.py`, `outfit_item.py`, `theory.py`, `share_record.py`
  - [x] Create `app/schemas/` Pydantic schemas directory
  - [x] Create schema files: `auth.py`, `user.py`, `outfit.py`, `wardrobe.py`, `common.py`
  - [x] Create `app/services/` business logic directory
  - [x] Create service files: `auth.py`, `user.py`, `outfit.py`, `ai_orchestrator.py`, `storage.py`, `sms.py`
  - [x] Create `app/integrations/` external APIs directory
  - [x] Create integration files: `alibaba_vision.py`, `tongyi_qianwen.py`, `alibaba_oss.py`, `wechat.py`, `weather.py`
  - [x] Create `app/core/` utilities directory with `security.py`, `exceptions.py`, `logging.py`
  - [x] Create `app/db/` database directory with `session.py`, `init_db.py`
  - [x] Initialize Alembic with `alembic init alembic`
  - [x] Configure `alembic/env.py` for async SQLAlchemy

- [x] Task 4: Create essential configuration files (AC: #4)
  - [x] Create `.env.example` with all required environment variables
  - [x] Create `.gitignore` for Python/FastAPI project
  - [x] Create `Dockerfile` for containerized deployment
  - [x] Create `docker-compose.yml` for local development (FastAPI + PostgreSQL)
  - [x] Create `docker-compose.dev.yml` for development overrides

- [x] Task 5: Implement base code structure (AC: #4, #5)
  - [x] Implement `app/config.py` with Pydantic Settings
  - [x] Implement `app/main.py` with FastAPI app, CORS, and router includes
  - [x] Implement `app/db/session.py` with async engine and session maker
  - [x] Implement `app/models/base.py` with SQLAlchemy declarative base
  - [x] Implement `app/api/deps.py` with database session dependency
  - [x] Implement `app/api/v1/router.py` aggregating all route modules
  - [x] Create placeholder route in `app/api/v1/health.py` for testing
  - [x] Implement `app/core/exceptions.py` with custom exception classes

- [x] Task 6: Verify project runs successfully (AC: #5)
  - [x] Run `poetry run uvicorn app.main:app --reload`
  - [x] Verify server starts without errors on port 8000
  - [x] Verify Swagger docs accessible at `http://localhost:8000/docs`
  - [x] Verify ReDoc accessible at `http://localhost:8000/redoc`
  - [x] Verify health endpoint returns 200 OK

## Dev Notes

### Architecture Patterns and Constraints

**Project Initialization Commands (CRITICAL):**
```bash
cd E:/Personal-Project/dali
mkdir dali-api
cd dali-api
poetry init --no-interaction --name dali-api --python "^3.11"
```

**Required Package Versions (Architecture Spec):**
| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.11+ | Runtime with type hints |
| FastAPI | Latest | Async web framework |
| SQLAlchemy | 2.0+ | Async ORM |
| asyncpg | Latest | PostgreSQL async driver |
| Alembic | Latest | Database migrations |
| Pydantic | 2.x | Schema validation |
| uvicorn | Latest | ASGI server |

**Poetry 2.x Best Practices (2025-2026):**
- Use `[project]` table for standard metadata (PEP-621 compliant)
- Use `tool.poetry` section for Poetry-specific configuration
- For API-only projects, use non-package mode:
```toml
[tool.poetry]
package-mode = false
```
- Lock file (`poetry.lock`) should be committed to version control

**Async SQLAlchemy 2.0 Setup (CRITICAL):**
```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/dali"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
```

**FastAPI Dependency Injection Pattern:**
```python
# app/api/deps.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Project Structure Notes

**Expected Directory Structure After This Story:**
```
dali-api/
├── pyproject.toml
├── poetry.lock
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── alembic.ini                       # Alembic config (in root, not alembic/)
├── alembic/
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── __version__.py                # Version single source of truth
│   ├── main.py                       # FastAPI entry point
│   ├── config.py                     # Pydantic Settings
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                   # Dependency injection
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py             # Route aggregation
│   │       ├── health.py             # Health check endpoint
│   │       ├── auth.py               # /auth endpoints (placeholder)
│   │       ├── users.py              # /users endpoints (placeholder)
│   │       ├── outfits.py            # /outfits endpoints (placeholder)
│   │       ├── wardrobe.py           # /wardrobe endpoints (placeholder)
│   │       ├── share.py              # /share endpoints (placeholder)
│   │       └── context.py            # /context endpoints (placeholder)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                   # SQLAlchemy Base class
│   │   ├── user.py                   # users table (placeholder)
│   │   ├── preference.py             # user_preferences table (placeholder)
│   │   ├── outfit.py                 # outfits table (placeholder)
│   │   ├── outfit_item.py            # outfit_items table (placeholder)
│   │   ├── theory.py                 # theories table (placeholder)
│   │   └── share_record.py           # share_records table (placeholder)
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                   # Auth request/response
│   │   ├── user.py                   # User schemas
│   │   ├── outfit.py                 # Outfit schemas
│   │   ├── wardrobe.py               # Wardrobe schemas
│   │   └── common.py                 # Shared schemas (pagination, errors)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py                   # Auth service (placeholder)
│   │   ├── user.py                   # User service (placeholder)
│   │   ├── outfit.py                 # Outfit generation (placeholder)
│   │   ├── ai_orchestrator.py        # AI pipeline (placeholder)
│   │   ├── storage.py                # OSS operations (placeholder)
│   │   └── sms.py                    # SMS sending (placeholder)
│   │
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── alibaba_vision.py         # Alibaba Vision API (placeholder)
│   │   ├── tongyi_qianwen.py         # Tongyi Qianwen API (placeholder)
│   │   ├── alibaba_oss.py            # Alibaba OSS (placeholder)
│   │   ├── wechat.py                 # WeChat OAuth (placeholder)
│   │   └── weather.py                # Weather API (placeholder)
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py               # JWT + encryption
│   │   ├── exceptions.py             # Custom exceptions
│   │   └── logging.py                # Logging config
│   │
│   └── db/
│       ├── __init__.py
│       ├── session.py                # Session management
│       └── init_db.py                # DB initialization
│
└── tests/
    ├── __init__.py
    ├── conftest.py                   # pytest fixtures
    ├── unit/
    │   └── __init__.py
    └── integration/
        └── __init__.py
```

### Naming Conventions (Mandatory - Per Architecture Doc)

**Database Naming (snake_case):**
| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `users`, `outfit_items`, `user_preferences` |
| Columns | snake_case | `user_id`, `created_at`, `is_deleted` |
| Foreign keys | `{table_singular}_id` | `user_id`, `outfit_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_email`, `idx_outfits_user_id` |
| Primary keys | `id` (UUID or auto-increment) | `id` |

**API Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | plural nouns, kebab-case | `/api/v1/outfits`, `/api/v1/wardrobe-items` |
| Path params | camelCase | `/outfits/:outfitId` |
| Query params | camelCase | `?userId=1&pageSize=10&sortBy=createdAt` |
| Headers | Title-Case | `Authorization`, `Content-Type` |

**JSON Response Fields (camelCase):**
```json
{
  "userId": "uuid",
  "createdAt": "2026-01-01T00:00:00Z",
  "outfitItems": [...],
  "isLiked": true
}
```

### API Response Patterns

**Success Response (Direct data, no wrapper):**
```json
{ "id": "uuid", "name": "Summer Outfit", "items": [...] }
```

**Paginated Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

**Error Response (Standardized):**
```json
{
  "code": "AUTH_INVALID_TOKEN",
  "message": "Token 已过期，请重新登录",
  "details": {
    "expiredAt": "2026-01-01T00:00:00Z"
  }
}
```

**Error Code Format:** `{DOMAIN}_{ERROR_TYPE}`
Examples: `AUTH_INVALID_TOKEN`, `OUTFIT_NOT_FOUND`, `VALIDATION_FAILED`, `AI_SERVICE_TIMEOUT`

### Configuration Files

**pyproject.toml Template:**
```toml
[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"

[project]
name = "dali-api"
version = "0.1.0"
description = "搭理app Backend API - AI-powered fashion styling assistant"
readme = "README.md"
requires-python = ">=3.11"

[tool.poetry]
package-mode = false

[tool.poetry.dependencies]
python = "^3.11"
fastapi = {extras = ["standard"], version = "^0.115.0"}
uvicorn = {extras = ["standard"], version = "^0.32.0"}
sqlalchemy = {extras = ["asyncio"], version = "^2.0"}
asyncpg = "^0.30.0"
alembic = "^1.14.0"
python-dotenv = "^1.0.0"
pydantic-settings = "^2.6.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.0"
pytest-asyncio = "^0.24.0"
httpx = "^0.28.0"
ruff = "^0.8.0"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP"]
ignore = ["E501"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
```

**.env.example Template:**
```bash
# Application
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here-change-in-production

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dali
DATABASE_ECHO=true

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# Alibaba Cloud
ALIBABA_ACCESS_KEY_ID=
ALIBABA_ACCESS_KEY_SECRET=
ALIBABA_OSS_BUCKET=
ALIBABA_OSS_ENDPOINT=
ALIBABA_VISION_ENDPOINT=

# Tongyi Qianwen / GPT-4
AI_PROVIDER=tongyi  # or openai
TONGYI_API_KEY=
OPENAI_API_KEY=

# WeChat
WECHAT_APP_ID=
WECHAT_APP_SECRET=

# SMS (Alibaba Cloud)
SMS_ACCESS_KEY_ID=
SMS_ACCESS_KEY_SECRET=
SMS_SIGN_NAME=
SMS_TEMPLATE_CODE=

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:19006
```

### Previous Story Learnings (0-1 Mobile Init)

From Story 0-1 implementation, key learnings for backend:
1. **Expo SDK 54** was the latest version used for mobile - backend API should be compatible
2. **Path aliases** were configured for mobile (`@/` → `src/`); backend uses absolute imports
3. **Review process** caught inline styles and import issues - backend should follow strict patterns from start
4. **TypeScript strict mode** is enabled on mobile - backend should use strict typing with Pydantic

### Technology Version Notes (2025-2026)

Based on web research for latest best practices:

**FastAPI Best Practices:**
- Use async routes for I/O-bound operations (database, external APIs)
- Sync routes are fine for CPU-bound tasks but offload to worker processes for heavy loads
- Use dependency injection for request validation and database sessions
- Pydantic BaseSettings for configuration management
- Use Ruff (replaces Black, isort, flake8) for linting and formatting
- API versioning with `/api/v1/` prefix is recommended

**SQLAlchemy 2.0 Async Setup:**
- Use `create_async_engine()` with `postgresql+asyncpg://` connection string
- Use `async_sessionmaker` with `AsyncSession` class
- Dependency function yields async session for automatic commit/rollback
- SQLAlchemy 2.0 style uses `DeclarativeBase` instead of `declarative_base()`

**Poetry 2.x (Released January 2025):**
- Use `[project]` table for PEP-621 compliant metadata
- Use `tool.poetry` section for Poetry-specific settings
- For API projects, set `package-mode = false` in `tool.poetry`
- Commit `poetry.lock` to version control for consistent environments

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Backend Project Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: _bmad-output/project-context.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.2]
- [Web: FastAPI Best Practices 2025-2026](https://github.com/zhanymkanov/fastapi-best-practices)
- [Web: SQLAlchemy 2.0 Async Setup](https://berkkaraal.com/blog/2024/09/19/setup-fastapi-project-with-async-sqlalchemy-2-alembic-postgresql-and-docker/)
- [Web: Poetry Documentation](https://python-poetry.org/docs/pyproject/)

### Testing Requirements

- Verify Poetry initializes without errors
- Verify all dependencies install without conflicts
- Verify FastAPI server starts on port 8000
- Verify Swagger UI loads at `/docs`
- Verify health endpoint returns `{"status": "ok"}`
- Verify Alembic is configured for async migrations
- Verify all placeholder modules import without errors

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Missing type hints | All functions MUST have complete type hints |
| Sync database operations | Use `async def` for all database operations |
| Hardcoded configuration | Use Pydantic Settings with environment variables |
| Missing `__init__.py` | Every Python package MUST have `__init__.py` |
| `print()` for debugging | Use proper logging with `app/core/logging.py` |
| Catching bare exceptions | Catch specific exceptions or use custom exception classes |
| SQL in route handlers | Use services layer for business logic |
| Missing CORS configuration | Configure CORS in `app/main.py` for mobile app access |

### Security Considerations

- **JWT tokens**: Access token 15min, Refresh token 30 days
- **Password hashing**: Use passlib with bcrypt
- **CORS**: Whitelist specific origins (mobile app, development)
- **Environment variables**: Never commit secrets, use `.env.example` as template
- **Database connections**: Use connection pooling with async engine

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Poetry 2.x initialized with PEP-621 compliant `pyproject.toml`
- All 57 dependencies installed successfully (no conflicts)
- Ruff linting fixed 6 minor issues (datetime.UTC alias, unused imports)
- All 2 unit tests passed in 0.06s
- Uvicorn server starts successfully on port 8000

### Completion Notes List

1. **Poetry 2.x** initialized with `package-mode = false` for API service
2. **FastAPI 0.128.0** installed with standard extras (includes uvicorn, httpx)
3. **SQLAlchemy 2.0.45** installed with asyncio support
4. **Alembic** configured for async migrations using `async_engine_from_config`
5. **Ruff 0.14.10** configured for linting and formatting (replaces Black, isort, flake8)
6. **Complete folder structure** created per architecture document
7. **All placeholder modules** created with appropriate comments for future implementation
8. **Custom exception classes** implemented with standardized error code format
9. **Pydantic Settings** configured for environment variable management
10. **CORS middleware** configured with origins from environment variable
11. **Health endpoint** implemented and tested (`/api/v1/health`)

### File List

**New Files Created:**
- `dali-api/pyproject.toml` - Poetry configuration with PEP-621 metadata
- `dali-api/poetry.lock` - Locked dependencies
- `dali-api/.env.example` - Environment variable template
- `dali-api/.gitignore` - Git ignore patterns for Python
- `dali-api/Dockerfile` - Multi-stage Docker build
- `dali-api/docker-compose.yml` - Production docker-compose
- `dali-api/docker-compose.dev.yml` - Development overrides
- `dali-api/alembic.ini` - Alembic configuration (in project root)
- `dali-api/alembic/env.py` - Async Alembic environment
- `dali-api/alembic/README` - Alembic readme
- `dali-api/alembic/script.py.mako` - Migration template
- `dali-api/alembic/versions/` - Migration versions directory
- `dali-api/app/__init__.py` - App package init
- `dali-api/app/__version__.py` - Version single source of truth
- `dali-api/app/main.py` - FastAPI entry point
- `dali-api/app/config.py` - Pydantic Settings configuration
- `dali-api/app/api/__init__.py` - API package init
- `dali-api/app/api/deps.py` - Dependency injection
- `dali-api/app/api/v1/__init__.py` - v1 package init
- `dali-api/app/api/v1/router.py` - Route aggregation
- `dali-api/app/api/v1/health.py` - Health check endpoint
- `dali-api/app/api/v1/auth.py` - Auth routes placeholder
- `dali-api/app/api/v1/users.py` - Users routes placeholder
- `dali-api/app/api/v1/outfits.py` - Outfits routes placeholder
- `dali-api/app/api/v1/wardrobe.py` - Wardrobe routes placeholder
- `dali-api/app/api/v1/share.py` - Share routes placeholder
- `dali-api/app/api/v1/context.py` - Context routes placeholder
- `dali-api/app/models/__init__.py` - Models package init
- `dali-api/app/models/base.py` - SQLAlchemy DeclarativeBase
- `dali-api/app/models/user.py` - User model placeholder
- `dali-api/app/models/preference.py` - Preference model placeholder
- `dali-api/app/models/outfit.py` - Outfit model placeholder
- `dali-api/app/models/outfit_item.py` - Outfit item model placeholder
- `dali-api/app/models/theory.py` - Theory model placeholder
- `dali-api/app/models/share_record.py` - Share record model placeholder
- `dali-api/app/schemas/__init__.py` - Schemas package init
- `dali-api/app/schemas/auth.py` - Auth schemas
- `dali-api/app/schemas/user.py` - User schemas
- `dali-api/app/schemas/outfit.py` - Outfit schemas
- `dali-api/app/schemas/wardrobe.py` - Wardrobe schemas
- `dali-api/app/schemas/common.py` - Common schemas (pagination, errors)
- `dali-api/app/services/__init__.py` - Services package init
- `dali-api/app/services/auth.py` - Auth service placeholder
- `dali-api/app/services/user.py` - User service placeholder
- `dali-api/app/services/outfit.py` - Outfit service placeholder
- `dali-api/app/services/ai_orchestrator.py` - AI orchestrator placeholder
- `dali-api/app/services/storage.py` - Storage service placeholder
- `dali-api/app/services/sms.py` - SMS service placeholder
- `dali-api/app/integrations/__init__.py` - Integrations package init
- `dali-api/app/integrations/alibaba_vision.py` - Alibaba Vision placeholder
- `dali-api/app/integrations/tongyi_qianwen.py` - Tongyi Qianwen placeholder
- `dali-api/app/integrations/alibaba_oss.py` - Alibaba OSS placeholder
- `dali-api/app/integrations/wechat.py` - WeChat OAuth placeholder
- `dali-api/app/integrations/weather.py` - Weather API placeholder
- `dali-api/app/core/__init__.py` - Core package init
- `dali-api/app/core/security.py` - JWT and password utilities
- `dali-api/app/core/exceptions.py` - Custom exception classes
- `dali-api/app/core/logging.py` - Logging configuration
- `dali-api/app/db/__init__.py` - DB package init
- `dali-api/app/db/session.py` - Async session management
- `dali-api/app/db/init_db.py` - Database initialization
- `dali-api/tests/__init__.py` - Tests package init
- `dali-api/tests/conftest.py` - Pytest fixtures
- `dali-api/tests/unit/__init__.py` - Unit tests package init
- `dali-api/tests/unit/test_health.py` - Health endpoint tests
- `dali-api/tests/integration/__init__.py` - Integration tests package init

## Change Log

- 2026-01-05: Initial implementation of backend project structure (Claude Opus 4.5)
