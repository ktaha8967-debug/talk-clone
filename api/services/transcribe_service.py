from sqlalchemy.orm import Session
from api.models.transcript import Transcript
from api.ai.sensevoice_wrapper import SenseVoiceWrapper

wrapper = SenseVoiceWrapper()


def transcribe_audio(db: Session, project_id: int, audio_path: str,
                     language: str = "auto") -> Transcript:
    result = wrapper.transcribe(audio_path, language=language)

    transcript = Transcript(
        project_id=project_id,
        text=result["text"],
        language=result["language"],
        segments=result["segments"],
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript
