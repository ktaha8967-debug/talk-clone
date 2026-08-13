from datetime import datetime
from typing import Optional
from sqlalchemy import String, BigInteger, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


class AudioFile(Base):
    __tablename__ = "audio_files"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    filename: Mapped[str] = mapped_column(String(500))
    original_name: Mapped[str] = mapped_column(String(500))
    file_path: Mapped[str] = mapped_column(String(1000))
    file_size: Mapped[int] = mapped_column(BigInteger)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    format: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    project: Mapped["Project"] = relationship(back_populates="audio_files")
