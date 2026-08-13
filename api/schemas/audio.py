from pydantic import BaseModel


class AudioUploadResponse(BaseModel):
    file_id: int
    filename: str
    duration: float
    format: str
