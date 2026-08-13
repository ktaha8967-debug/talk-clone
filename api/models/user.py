from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Subscription
    tier: Mapped[str] = mapped_column(String(20), default="starter")  # starter, pro, enterprise
    monthly_usage: Mapped[int] = mapped_column(Integer, default=0)
    usage_limit: Mapped[int] = mapped_column(Integer, default=500)  # generations per month
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    voices: Mapped[list["Voice"]] = relationship(back_populates="user")
    projects: Mapped[list["Project"]] = relationship(back_populates="user")
