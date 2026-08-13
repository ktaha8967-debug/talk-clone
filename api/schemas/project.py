from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    script: Optional[str] = None
    voice_id: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    script: Optional[str]
    voice_id: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
