# 搭理 API (Dali API)

AI-powered fashion styling assistant backend service.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Poetry (Python dependency manager)

### Installation

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run database migrations:
   ```bash
   poetry run alembic upgrade head
   ```

4. Start the development server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

The API will be available at http://localhost:8000

## 📸 Cloud Storage (OSS)

### Development Mode (Mock)

By default, the system uses **mock storage** if OSS credentials are not configured. This is perfect for development and testing.

### Production Mode (Real OSS)

To use real Alibaba Cloud OSS:

1. Follow the setup guide: [docs/OSS_SETUP_GUIDE.md](docs/OSS_SETUP_GUIDE.md)
2. Configure your `.env` file:
   ```bash
   ALIBABA_ACCESS_KEY_ID=your_access_key
   ALIBABA_ACCESS_KEY_SECRET=your_secret
   ALIBABA_OSS_BUCKET=your_bucket_name
   ALIBABA_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
   ```
3. Restart the server

The system will automatically detect the configuration and switch to real OSS.

**Cost**: ~5-10 元/month for 100 users (includes 3 months free tier)

## 🧪 Testing

Run tests:
```bash
poetry run pytest
```

Run tests with coverage:
```bash
poetry run pytest --cov=app --cov-report=html
```

## 📚 API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🏗️ Project Structure

```
dali-api/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core utilities
│   ├── db/           # Database session
│   ├── integrations/ # External service integrations
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── alembic/          # Database migrations
├── tests/            # Unit and integration tests
└── docs/             # Documentation
```

## 🔧 Configuration

Key environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SECRET_KEY` | JWT secret key | ✅ |
| `ALIBABA_OSS_*` | OSS configuration | Optional |
| `TONGYI_API_KEY` | AI service key | Optional |
| `SMS_ACCESS_KEY_*` | SMS service | Optional |

See [.env.example](.env.example) for full configuration.

## 🛠️ Development

### Code Style

This project uses:
- `ruff` for linting and formatting
- Type hints with Python 3.11+ syntax

Run linter:
```bash
poetry run ruff check .
```

Auto-fix issues:
```bash
poetry run ruff check --fix .
```

### Database Migrations

Create a new migration:
```bash
poetry run alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
poetry run alembic upgrade head
```

Rollback:
```bash
poetry run alembic downgrade -1
```

## 📦 Dependencies

Core:
- FastAPI - Web framework
- SQLAlchemy 2.0 - ORM
- Pydantic - Data validation
- Alembic - Database migrations
- oss2 - Alibaba Cloud OSS SDK

See [pyproject.toml](pyproject.toml) for full list.

## 🚀 Deployment

### Docker (Recommended) 🐳

#### Quick Start with Docker Compose

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，配置数据库连接等

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f api

# 4. 访问 API
# http://localhost:8000/docs
```

#### 单独使用 Docker

```bash
# 构建镜像
docker build -t dali-api:latest .

# 运行容器
docker run -d \
  --name dali-api \
  -p 8000:8000 \
  --env-file .env \
  --add-host host.docker.internal:host-gateway \
  dali-api:latest
```

**详细部署指南**：查看 [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)

### Manual Deployment

1. Set environment variables
2. Run migrations: `alembic upgrade head`
3. Start with Gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

Built with ❤️ using FastAPI and Python
