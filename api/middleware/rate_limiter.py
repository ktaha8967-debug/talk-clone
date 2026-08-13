from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from api.models.user import User
from api.services.auth_service import check_usage_limit, increment_usage
from api.config import TIER_LIMITS


class RateLimiter:
    def __init__(self, db: Session):
        self.db = db

    def check_and_increment(self, user: User, engine: str = "general") -> None:
        """Check usage limit and increment if allowed"""
        if not check_usage_limit(user):
            limit = TIER_LIMITS.get(user.tier, 100)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Monthly usage limit reached ({limit} generations). Upgrade your plan for more.",
            )
        
        increment_usage(self.db, user)

    def get_usage_info(self, user: User) -> dict:
        """Get current usage info for user"""
        limit = TIER_LIMITS.get(user.tier, 100)
        remaining = max(0, limit - user.monthly_usage) if limit > 0 else -1
        
        return {
            "tier": user.tier,
            "used": user.monthly_usage,
            "limit": limit,
            "remaining": remaining,
        }


def get_rate_limiter(db: Session) -> RateLimiter:
    return RateLimiter(db)
