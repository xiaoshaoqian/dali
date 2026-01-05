"""API v1 router aggregating all route modules."""

from fastapi import APIRouter

from app.api.v1 import auth, context, garments, health, outfits, share, upload, users, wardrobe

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
