from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from api.services.upload_service import save_uploaded_file
from api.schemas.audio import AudioUploadResponse

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("", response_model=AudioUploadResponse)
async def upload_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    result = await save_uploaded_file(file)
    return AudioUploadResponse(
        file_id=0,
        filename=result["filename"],
        duration=result["duration"],
        format=result["format"],
    )
