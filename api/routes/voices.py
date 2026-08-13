import os
from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from api.database import get_db
from api.services.voice_service import get_voices, get_voice, update_voice, delete_voice
from api.schemas.voice import VoiceUpdate, VoiceResponse
from api.config import UPLOAD_DIR

router = APIRouter(prefix="/api/voices", tags=["voices"])


@router.get("", response_model=list[VoiceResponse])
def list_voices(
    favorite: bool = Query(False),
    search: str = Query(None),
    db: Session = Depends(get_db),
):
    return get_voices(db, user_id=1, favorite_only=favorite, search=search)


@router.get("/{voice_id}", response_model=VoiceResponse)
def get_voice_detail(voice_id: int, db: Session = Depends(get_db)):
    voice = get_voice(db, voice_id)
    if not voice:
        return {"error": "Voice not found"}
    return voice


@router.put("/{voice_id}", response_model=VoiceResponse)
def update_voice_detail(voice_id: int, data: VoiceUpdate, db: Session = Depends(get_db)):
    voice = get_voice(db, voice_id)
    if not voice:
        return {"error": "Voice not found"}
    return update_voice(db, voice, data)


@router.delete("/{voice_id}")
def delete_voice_detail(voice_id: int, db: Session = Depends(get_db)):
    voice = get_voice(db, voice_id)
    if not voice:
        return {"error": "Voice not found"}
    file_path = UPLOAD_DIR / voice.reference_file
    if os.path.exists(file_path):
        os.remove(file_path)
    delete_voice(db, voice)
    return {"message": "Voice deleted"}


@router.get("/{voice_id}/preview")
def preview_voice(voice_id: int, db: Session = Depends(get_db)):
    voice = get_voice(db, voice_id)
    if not voice:
        return {"error": "Voice not found"}
    file_path = UPLOAD_DIR / voice.reference_file
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    return FileResponse(file_path, media_type="audio/wav")
