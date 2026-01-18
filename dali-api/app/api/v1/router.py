"""API v1 router aggregating all route modules."""

from fastapi import APIRouter

from app.api.v1 import auth, context, garments, health, outfits, share, upload, users, wardrobe
from app.api.v1.endpoints import vision, sse

router = APIRouter(prefix="/api/v1")

# Include all route modules
router.include_router(health.router)
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(upload.router)
router.include_router(garments.router)
router.include_router(outfits.router)
router.include_router(wardrobe.router)
router.include_router(share.router)
router.include_router(context.router)
router.include_router(vision.router, tags=["Vision"])
router.include_router(sse.router, tags=["SSE Streaming"])

