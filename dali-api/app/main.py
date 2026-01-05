"""FastAPI application entry point.

搭理app Backend API - AI-powered fashion styling assistant.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import JSONResponse

from app.__version__ import __version__
from app.api.v1.router import router as api_v1_router
from app.config import settings
from app.core.exceptions import APIException
from app.core.logging import setup_logging
from app.services.verification_store import start_cleanup_task

# Use unpkg CDN which is more reliable in China
SWAGGER_JS_URL = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
SWAGGER_CSS_URL = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
REDOC_JS_URL = "https://unpkg.com/redoc@latest/bundles/redoc.standalone.js"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    setup_logging()
    # Start background cleanup task for verification codes
    cleanup_task = asyncio.create_task(start_cleanup_task())
    yield
    # Shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="搭理app API",
    description="AI-powered fashion styling assistant backend",
    version=__version__,
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Handle custom API exceptions.

    Returns standardized error response format:
    {
        "code": "DOMAIN_ERROR_TYPE",
        "message": "User-friendly message",
        "details": {...}
    }
    """
    content: dict[str, Any] = {
        "code": exc.code,
        "message": exc.message,
    }
    if exc.details:
        content["details"] = exc.details
    return JSONResponse(status_code=exc.status_code, content=content)


# Include API routers
app.include_router(api_v1_router)


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI with reliable CDN."""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_js_url=SWAGGER_JS_URL,
        swagger_css_url=SWAGGER_CSS_URL,
    )


@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    """Custom ReDoc with reliable CDN."""
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - ReDoc",
        redoc_js_url=REDOC_JS_URL,
    )


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint returning API info."""
    return {
        "name": "搭理app API",
        "version": __version__,
        "docs": "/docs",
    }
