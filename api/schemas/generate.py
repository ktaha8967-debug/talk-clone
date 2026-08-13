from typing import Optional
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    script: str
    voice_id: Optional[int] = None
    speed: float = 1.0
    pitch: int = 0
    temperature: float = 0.7
    emotion: str = "neutral"
    output_format: str = "wav"


class GenerateResponse(BaseModel):
    task_id: str
    generation_id: int
    status: str
