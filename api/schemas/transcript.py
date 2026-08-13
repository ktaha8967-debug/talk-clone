from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TranscriptCreate(BaseModel):
    text: str
    language: Optional[str] = None
    segments: Optional[list[dict]] = None


class TranscriptResponse(BaseModel):
    id: int
    project_id: int
    text: str
    language: Optional[str]
    segments: Optional[list[dict]]
    created_at: datetime

    class Config:
        from_attributes = True
