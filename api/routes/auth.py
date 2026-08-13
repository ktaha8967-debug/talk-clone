from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.database import get_db
from api.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from api.services.auth_service import register_user, authenticate_user, create_access_token
from api.deps import get_current_user
from api.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, req.username, req.email, req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    access_token = create_access_token(data={"sub": str(user.id), "admin": user.is_admin})

    return TokenResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            "monthly_usage": user.monthly_usage,
            "usage_limit": user.usage_limit,
            "is_admin": user.is_admin,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id), "admin": user.is_admin})

    return TokenResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            "monthly_usage": user.monthly_usage,
            "usage_limit": user.usage_limit,
            "is_admin": user.is_admin,
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        tier=current_user.tier,
        monthly_usage=current_user.monthly_usage,
        usage_limit=current_user.usage_limit,
        is_active=current_user.is_active,
    )
