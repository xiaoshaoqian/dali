"""User endpoints for profile and preferences management."""

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DBSession
from app.schemas.user_preferences import UserPreferencesRequest, UserPreferencesResponse
from app.services.user_preferences import user_preferences_service

router = APIRouter(prefix="/users", tags=["users"])


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
