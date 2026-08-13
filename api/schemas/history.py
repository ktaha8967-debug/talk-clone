from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HistoryResponse(BaseModel):
    id: int
    project_id: int
    script: str
    file_path: str
    file_format: str
    duration_seconds: Optional[float]
    status: str
    voice_id: Optional[int]
    settings: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True
