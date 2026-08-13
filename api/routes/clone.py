from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from api.services.upload_service import save_uploaded_file
from api.services.voice_service import create_voice
from api.workers.voice_tasks import clone_voice_task
from api.config import MIN_VOICE_DURATION, MAX_VOICE_DURATION

router = APIRouter(prefix="/api/clone", tags=["clone"])


@router.post("")
async def clone_voice(
    file: UploadFile = File(...),
    name: str = Form(...),
    language: str = Form("auto"),
    db: Session = Depends(get_db),
):
    upload_result = await save_uploaded_file(file)

    if upload_result["duration"] < MIN_VOICE_DURATION:
        return {"error": f"Voice must be at least {MIN_VOICE_DURATION} seconds"}
    if upload_result["duration"] > MAX_VOICE_DURATION:
        return {"error": f"Voice must be at most {MAX_VOICE_DURATION} seconds"}

    voice = create_voice(
        db=db,
        user_id=1,
        name=name,
        reference_file=upload_result["filename"],
        duration=upload_result["duration"],
        language=language,
    )

    task = clone_voice_task.delay(voice.id, upload_result["file_path"], language)

    return {
        "task_id": task.id,
        "voice_id": voice.id,
        "status": "processing",
    }
