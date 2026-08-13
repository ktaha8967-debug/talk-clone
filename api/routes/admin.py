from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional
from api.database import get_db
from api.deps import get_admin_user
from api.models.user import User
from api.services.auth_service import hash_password, get_user_by_id
from api.config import TIER_LIMITS

router = APIRouter(prefix="/api/admin", tags=["admin"])


class UserUpdateRequest(BaseModel):
    tier: Optional[str] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None
    monthly_usage: Optional[int] = None
    is_admin: Optional[bool] = None


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6)
    tier: str = Field(default="starter")
    usage_limit: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    tier: str
    monthly_usage: int
    usage_limit: int
    is_active: bool
    is_admin: bool
    created_at: str


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    suspended_users: int
    admin_users: int
    tier_distribution: dict
    total_generations: int


@router.get("/stats", response_model=DashboardStats)
async def get_admin_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get dashboard statistics - admin only"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    suspended_users = db.query(User).filter(User.is_active == False).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()

    tier_counts = {}
    for tier in ["starter", "pro", "enterprise"]:
        tier_counts[tier] = db.query(User).filter(User.tier == tier).count()

    from sqlalchemy import func
    total_gen = db.query(func.sum(User.monthly_usage)).scalar() or 0

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        suspended_users=suspended_users,
        admin_users=admin_users,
        tier_distribution=tier_counts,
        total_generations=total_gen,
    )


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    tier: Optional[str] = None,
    status: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """List all users with filters - admin only"""
    query = db.query(User)

    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    if tier:
        query = query.filter(User.tier == tier)

    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "suspended":
        query = query.filter(User.is_active == False)

    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "tier": u.tier,
                "monthly_usage": u.monthly_usage,
                "usage_limit": u.usage_limit,
                "is_active": u.is_active,
                "is_admin": u.is_admin,
                "created_at": str(u.created_at),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/users/{user_id}")
async def get_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get user details - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "tier": user.tier,
        "monthly_usage": user.monthly_usage,
        "usage_limit": user.usage_limit,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": str(user.created_at),
    }


@router.put("/users/{user_id}")
async def update_user(user_id: int, data: UserUpdateRequest, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Update user details - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.tier is not None:
        if data.tier not in ["starter", "pro", "enterprise"]:
            raise HTTPException(status_code=400, detail="Invalid tier")
        user.tier = data.tier
        if data.usage_limit is None:
            user.usage_limit = TIER_LIMITS.get(data.tier, 500)

    if data.usage_limit is not None:
        user.usage_limit = data.usage_limit

    if data.is_active is not None:
        user.is_active = data.is_active

    if data.monthly_usage is not None:
        user.monthly_usage = data.monthly_usage

    if data.is_admin is not None:
        user.is_admin = data.is_admin

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            "monthly_usage": user.monthly_usage,
            "usage_limit": user.usage_limit,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
        }
    }


@router.post("/users")
async def create_user(data: CreateUserRequest, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Create a new user - admin only"""
    existing = db.query(User).filter(
        (User.email == data.email) | (User.username == data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        tier=data.tier,
        usage_limit=data.usage_limit or TIER_LIMITS.get(data.tier, 500),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            "usage_limit": user.usage_limit,
        }
    }


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Delete a user - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")

    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": "User deleted successfully"
    }


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Suspend a user - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot suspend admin users")

    user.is_active = False
    db.commit()

    return {
        "success": True,
        "message": f"User {user.username} has been suspended"
    }


@router.post("/users/{user_id}/activate")
async def activate_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Activate a suspended user - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    return {
        "success": True,
        "message": f"User {user.username} has been activated"
    }


@router.post("/users/{user_id}/upgrade")
async def upgrade_user(user_id: int, tier: str, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Upgrade user tier - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if tier not in ["starter", "pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid tier")

    user.tier = tier
    user.usage_limit = TIER_LIMITS.get(tier, 500)
    db.commit()

    return {
        "success": True,
        "message": f"User {user.username} upgraded to {tier}"
    }


@router.post("/users/{user_id}/reset-usage")
async def reset_user_usage(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Reset user monthly usage - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.monthly_usage = 0
    db.commit()

    return {
        "success": True,
        "message": f"Usage reset for {user.username}"
    }


@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Toggle admin status - admin only"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")

    user.is_admin = not user.is_admin
    db.commit()

    return {
        "success": True,
        "message": f"User {user.username} admin status: {user.is_admin}"
    }
