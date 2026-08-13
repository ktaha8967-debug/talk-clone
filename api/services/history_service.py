from sqlalchemy.orm import Session
from api.models.generated_audio import GeneratedAudio


def get_history(db: Session, user_id: int, page: int = 1, limit: int = 20) -> list[GeneratedAudio]:
    return (
        db.query(GeneratedAudio)
        .join(GeneratedAudio.project)
        .filter(GeneratedAudio.project.has(user_id=user_id))
        .order_by(GeneratedAudio.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


def get_history_entry(db: Session, entry_id: int) -> GeneratedAudio | None:
    return db.query(GeneratedAudio).filter(GeneratedAudio.id == entry_id).first()


def delete_history_entry(db: Session, entry: GeneratedAudio):
    db.delete(entry)
    db.commit()
