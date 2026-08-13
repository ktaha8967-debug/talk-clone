from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VoiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    language: Optional[str] = None


class VoiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_favorite: Optional[bool] = None


class VoiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    reference_file: str
    duration_seconds: float
    language: Optional[str]
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True
