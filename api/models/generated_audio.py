from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, JSON, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


class GeneratedAudio(Base):
    __tablename__ = "generated_audios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    voice_id: Mapped[Optional[int]] = mapped_column(ForeignKey("voices.id"), nullable=True)
    script: Mapped[str] = mapped_column(Text)
    file_path: Mapped[str] = mapped_column(String(1000))
    file_format: Mapped[str] = mapped_column(String(10))
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    settings: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    task_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    project: Mapped["Project"] = relationship(back_populates="generated_audios")
    voice: Mapped[Optional["Voice"]] = relationship(back_populates="generated_audios")
