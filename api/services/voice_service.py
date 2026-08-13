from sqlalchemy.orm import Session
from api.models.voice import Voice
from api.schemas.voice import VoiceUpdate


def create_voice(db: Session, user_id: int, name: str, reference_file: str,
                 duration: float, language: str = None, description: str = None,
                 embedding_file: str = None) -> Voice:
    voice = Voice(
        user_id=user_id,
        name=name,
        reference_file=reference_file,
        duration_seconds=duration,
        language=language,
        description=description,
        embedding_file=embedding_file,
    )
    db.add(voice)
    db.commit()
    db.refresh(voice)
    return voice


def get_voices(db: Session, user_id: int, favorite_only: bool = False,
               search: str = None) -> list[Voice]:
    query = db.query(Voice).filter(Voice.user_id == user_id)
    if favorite_only:
        query = query.filter(Voice.is_favorite == True)
    if search:
        query = query.filter(Voice.name.ilike(f"%{search}%"))
    return query.order_by(Voice.created_at.desc()).all()


def get_voice(db: Session, voice_id: int) -> Voice | None:
    return db.query(Voice).filter(Voice.id == voice_id).first()


def update_voice(db: Session, voice: Voice, data: VoiceUpdate) -> Voice:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(voice, field, value)
    db.commit()
    db.refresh(voice)
    return voice


def delete_voice(db: Session, voice: Voice):
    db.delete(voice)
    db.commit()
