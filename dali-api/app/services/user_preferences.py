"""User preferences service for managing style preferences."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user_preferences import UserPreferencesRequest, UserPreferencesResponse


class UserPreferencesService:
    """Service for managing user preferences."""

    async def get_preferences(
        self,
        user: User,
        db: AsyncSession,
    ) -> UserPreferences | None:
        """Get user preferences.

        Args:
            user: Current user
            db: Database session

        Returns:
            UserPreferences if exists, None otherwise
        """
        stmt = select(UserPreferences).where(UserPreferences.user_id == user.id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def save_preferences(
        self,
        user: User,
        request: UserPreferencesRequest,
        db: AsyncSession,
    ) -> UserPreferences:
        """Save or update user preferences.

        Args:
            user: Current user
            request: Preferences data from request
            db: Database session

        Returns:
            Created or updated UserPreferences
        """
        # Check if preferences already exist
        existing = await self.get_preferences(user, db)

        if existing:
            # Update existing preferences
            existing.body_type = request.bodyType
            existing.styles = list(request.styles)
            existing.occasions = list(request.occasions)
            return existing

        # Create new preferences
        preferences = UserPreferences(
            user_id=user.id,
            body_type=request.bodyType,
            styles=list(request.styles),
            occasions=list(request.occasions),
        )
        db.add(preferences)
        await db.flush()
        return preferences

    def to_response(self, preferences: UserPreferences) -> UserPreferencesResponse:
        """Convert UserPreferences model to response schema.

        Args:
            preferences: UserPreferences model

        Returns:
            UserPreferencesResponse schema
        """
        return UserPreferencesResponse(
            id=str(preferences.id),
            userId=str(preferences.user_id),
            bodyType=preferences.body_type,
            styles=preferences.styles,
            occasions=preferences.occasions,
            createdAt=preferences.created_at.isoformat(),
            updatedAt=preferences.updated_at.isoformat(),
        )


# Global service instance
user_preferences_service = UserPreferencesService()
