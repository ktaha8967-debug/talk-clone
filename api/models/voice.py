from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Float, Boolean, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


class Voice(Base):
    __tablename__ = "voices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reference_file: Mapped[str] = mapped_column(String(500))
    embedding_file: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[float] = mapped_column(Float)
    language: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="voices")
    generated_audios: Mapped[list["GeneratedAudio"]] = relationship(back_populates="voice")
