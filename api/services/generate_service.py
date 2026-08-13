import time
from pathlib import Path
from sqlalchemy.orm import Session
from api.models.generated_audio import GeneratedAudio
from api.models.project import Project
from api.config import OUTPUT_DIR


def create_generation(db: Session, project_id: int, script: str, voice_id: int = None,
                      settings: dict = None, file_format: str = "wav") -> GeneratedAudio:
    gen = GeneratedAudio(
        project_id=project_id,
        voice_id=voice_id,
        script=script,
        file_path="",
        file_format=file_format,
        settings=settings or {},
        status="pending",
    )
    db.add(gen)
    db.commit()
    db.refresh(gen)
    return gen


def update_generation_status(db: Session, gen: GeneratedAudio, status: str,
                             file_path: str = None, task_id: str = None,
                             error: str = None, duration: float = None):
    gen.status = status
    if file_path:
        gen.file_path = file_path
    if task_id:
        gen.task_id = task_id
    if error:
        gen.error_message = error
    if duration:
        gen.duration_seconds = duration
    db.commit()


def create_project(db: Session, user_id: int, name: str, script: str = None,
                   voice_id: int = None) -> Project:
    project = Project(
        user_id=user_id,
        name=name,
        script=script,
        voice_id=voice_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
