from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(200))
    script: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    voice_id: Mapped[Optional[int]] = mapped_column(ForeignKey("voices.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="projects")
    audio_files: Mapped[list["AudioFile"]] = relationship(back_populates="project")
    transcripts: Mapped[list["Transcript"]] = relationship(back_populates="project")
    generated_audios: Mapped[list["GeneratedAudio"]] = relationship(back_populates="project")
