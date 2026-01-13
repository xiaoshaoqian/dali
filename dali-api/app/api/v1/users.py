"""User endpoints for profile and preferences management."""

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DBSession
from app.schemas.user import (
    AvatarUploadUrlResponse,
    UpdateUserProfileRequest,
    UserProfileResponse,
    UserStatsResponse,
)
from app.schemas.user_preferences import UserPreferencesRequest, UserPreferencesResponse
from app.services.storage import storage_service
from app.services.user_preferences import user_preferences_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: CurrentUser,
) -> UserProfileResponse:
    """Get current user's profile information.

    Args:
        current_user: Authenticated user

    Returns:
        User profile information
    """
    return UserProfileResponse(
        id=str(current_user.id),
        phone=current_user.phone,
        wechat_id=current_user.wechat_id,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_user_profile(
    request: UpdateUserProfileRequest,
    current_user: CurrentUser,
    db: DBSession,
) -> UserProfileResponse:
    """Update current user's profile.

    Args:
        request: Profile update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated user profile
    """
    # Update fields if provided
    if request.nickname is not None:
        current_user.nickname = request.nickname
    if request.avatar is not None:
        current_user.avatar = request.avatar

    current_user.updated_at = datetime.now(UTC)
    db.add(current_user)
    await db.flush()

    return UserProfileResponse(
        id=str(current_user.id),
        phone=current_user.phone,
        wechat_id=current_user.wechat_id,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: CurrentUser,
    db: DBSession,
) -> UserStatsResponse:
    """Get current user's statistics.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        User statistics including outfits, favorites, shares, etc.
    """
    from sqlalchemy import func, select

    from app.models.outfit import Outfit
    from app.models.share_record import ShareRecord

    # Count total outfits
    total_outfits_stmt = select(func.count(Outfit.id)).where(
        Outfit.user_id == current_user.id,
        Outfit.is_deleted == False,  # noqa: E712
    )
    total_outfits = await db.scalar(total_outfits_stmt) or 0

    # Count favorites
    favorite_count_stmt = select(func.count(Outfit.id)).where(
        Outfit.user_id == current_user.id,
        Outfit.is_favorited == True,  # noqa: E712
        Outfit.is_deleted == False,  # noqa: E712
    )
    favorite_count = await db.scalar(favorite_count_stmt) or 0

    # Count shares
    share_count_stmt = select(func.count(ShareRecord.id)).where(
        ShareRecord.user_id == current_user.id,
    )
    share_count = await db.scalar(share_count_stmt) or 0

    # Calculate joined days
    joined_days = (datetime.now(UTC) - current_user.created_at).days

    # AI accuracy (placeholder - would need ML model evaluation)
    ai_accuracy = 0.82

    return UserStatsResponse(
        total_outfits=total_outfits,
        favorite_count=favorite_count,
        share_count=share_count,
        joined_days=joined_days,
        ai_accuracy=ai_accuracy,
    )


@router.post("/me/avatar/upload-url", response_model=AvatarUploadUrlResponse)
async def get_avatar_upload_url(
    current_user: CurrentUser,
) -> AvatarUploadUrlResponse:
    """Generate a presigned URL for uploading user avatar.

    Args:
        current_user: Authenticated user

    Returns:
        Presigned URL and final avatar URL
    """
    # Generate unique object key for avatar
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    unique_id = uuid4().hex[:8]
    object_key = f"users/{current_user.id}/avatar/{timestamp}_{unique_id}.jpg"

    # Generate presigned URL
    signed_url, _ = storage_service.generate_upload_url(
        object_key=object_key,
        content_type="image/jpeg",
        expiry_minutes=10,
    )

    # Generate the final URL where the avatar will be accessible
    avatar_url = storage_service.get_file_url(object_key)

    return AvatarUploadUrlResponse(
        signed_url=signed_url,
        avatar_url=avatar_url,
    )


@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_preferences(
    current_user: CurrentUser,
    db: DBSession,
) -> UserPreferencesResponse:
    """Get current user's preferences.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        User preferences

    Raises:
        HTTPException: If preferences not found
    """
    preferences = await user_preferences_service.get_preferences(current_user, db)

    if preferences is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "PREFERENCES_NOT_FOUND", "message": "用户偏好设置不存在"},
        )

    return user_preferences_service.to_response(preferences)


@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def save_preferences(
    request: UserPreferencesRequest,
    current_user: CurrentUser,
    db: DBSession,
) -> UserPreferencesResponse:
    """Save or update current user's preferences.

    Args:
        request: Preferences data
        current_user: Authenticated user
        db: Database session

    Returns:
        Saved user preferences
    """
    preferences = await user_preferences_service.save_preferences(
        current_user,
        request,
        db,
    )
    return user_preferences_service.to_response(preferences)
