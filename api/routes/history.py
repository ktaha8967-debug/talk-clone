import os
from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from api.database import get_db
from api.services.history_service import get_history, get_history_entry, delete_history_entry
from api.schemas.history import HistoryResponse
from api.config import OUTPUT_DIR

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[HistoryResponse])
def list_history(
    page: int = Query(1),
    limit: int = Query(20),
    db: Session = Depends(get_db),
):
    return get_history(db, user_id=1, page=page, limit=limit)


@router.get("/{entry_id}", response_model=HistoryResponse)
def get_history_detail(entry_id: int, db: Session = Depends(get_db)):
    entry = get_history_entry(db, entry_id)
    if not entry:
        return {"error": "Not found"}
    return entry


@router.delete("/{entry_id}")
def delete_history(entry_id: int, db: Session = Depends(get_db)):
    entry = get_history_entry(db, entry_id)
    if not entry:
        return {"error": "Not found"}
    file_path = OUTPUT_DIR / entry.file_path
    if os.path.exists(file_path):
        os.remove(file_path)
    delete_history_entry(db, entry)
    return {"message": "Deleted"}


@router.get("/{entry_id}/download")
def download_history(entry_id: int, db: Session = Depends(get_db)):
    entry = get_history_entry(db, entry_id)
    if not entry:
        return {"error": "Not found"}
    file_path = OUTPUT_DIR / entry.file_path
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    media_type = "audio/wav" if entry.file_format == "wav" else "audio/mpeg"
    return FileResponse(file_path, media_type=media_type,
                        filename=f"generated_{entry_id}.{entry.file_format}")
