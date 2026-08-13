from celery import shared_task
from api.workers.celery_app import celery_app


@shared_task(bind=True, name="generate_speech")
def generate_speech_task(self, generation_id: int, script: str, voice_id: int = None,
                         settings: dict = None):
    self.update_state(state="PROGRESS", meta={"step": "preparing", "progress": 10})

    from api.database import SessionLocal
    from api.models.generated_audio import GeneratedAudio
    from api.models.voice import Voice
    from api.ai.cosyvoice_wrapper import CosyVoiceWrapper

    db = SessionLocal()
    gen = db.query(GeneratedAudio).filter(GeneratedAudio.id == generation_id).first()

    embedding_path = None
    if voice_id:
        voice = db.query(Voice).filter(Voice.id == voice_id).first()
        if voice and voice.embedding_file:
            embedding_path = voice.embedding_file

    settings = settings or {}

    self.update_state(state="PROGRESS", meta={"step": "generating", "progress": 50})
    wrapper = CosyVoiceWrapper()
    output_path, duration = wrapper.generate_speech(
        script=script,
        embedding_path=embedding_path,
        speed=settings.get("speed", 1.0),
        pitch=settings.get("pitch", 0),
        temperature=settings.get("temperature", 0.7),
        emotion=settings.get("emotion", "neutral"),
        output_format=gen.file_format if gen else "wav",
    )

    if gen:
        gen.status = "completed"
        gen.file_path = output_path
        gen.duration_seconds = duration
        db.commit()

    db.close()

    self.update_state(state="PROGRESS", meta={"step": "completed", "progress": 100})
    return {"generation_id": generation_id, "file_path": output_path}
