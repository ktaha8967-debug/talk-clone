from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from api.services.upload_service import save_uploaded_file
from api.services.transcribe_service import transcribe_audio
from api.services.generate_service import create_project
from api.schemas.transcript import TranscriptResponse

router = APIRouter(prefix="/api/transcribe", tags=["transcribe"])


@router.post("", response_model=TranscriptResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    db: Session = Depends(get_db),
):
    upload_result = await save_uploaded_file(file)
    project = create_project(db, user_id=1, name=f"Transcribe: {file.filename}")
    transcript = transcribe_audio(db, project.id, upload_result["file_path"], language)
    return transcript
