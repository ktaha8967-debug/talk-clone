from celery import shared_task
from api.workers.celery_app import celery_app


@shared_task(bind=True, name="clone_voice")
def clone_voice_task(self, voice_id: int, file_path: str, language: str = "auto"):
    self.update_state(state="PROGRESS", meta={"step": "loading_model", "progress": 10})

    from api.ai.cosyvoice_wrapper import CosyVoiceWrapper
    wrapper = CosyVoiceWrapper()

    self.update_state(state="PROGRESS", meta={"step": "extracting_embedding", "progress": 40})
    embedding_path = wrapper.extract_embedding(file_path, language)

    self.update_state(state="PROGRESS", meta={"step": "saving", "progress": 90})
    from api.database import SessionLocal
    from api.models.voice import Voice
    db = SessionLocal()
    voice = db.query(Voice).filter(Voice.id == voice_id).first()
    if voice:
        voice.embedding_file = embedding_path
        db.commit()
    db.close()

    self.update_state(state="PROGRESS", meta={"step": "completed", "progress": 100})
    return {"voice_id": voice_id, "embedding_path": embedding_path}
