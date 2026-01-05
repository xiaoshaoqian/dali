"""Health check endpoint."""

from fastapi import APIRouter

from app.__version__ import __version__
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint.

    Returns:
        HealthResponse: Application health status
    """
    return HealthResponse(status="ok", version=__version__)
