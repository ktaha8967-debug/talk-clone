from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from api.database import get_db
from api.deps import get_current_user
from api.models.user import User
from api.middleware.rate_limiter import get_rate_limiter
from api.ai.bark_wrapper import bark_wrapper

router = APIRouter(prefix="/api/bark", tags=["bark"])


class BarkGenerateRequest(BaseModel):
    script: str = Field(..., min_length=1, max_length=10000, description="Text to convert to speech")
    voice_preset: str = Field(default="v2/en_speaker_6", description="Voice preset ID")
    style: str = Field(default="neutral", description="Speaking style")
    temperature: float = Field(default=0.7, ge=0.0, le=1.5, description="Generation temperature")
    output_format: str = Field(default="wav", description="Output audio format")


class BarkGenerateResponse(BaseModel):
    success: bool
    file_path: str
    duration: float
    voice_preset: str
    style: str


class VoiceInfo(BaseModel):
    id: str
    name: str
    language: str
    gender: str
    style: str


class StyleInfo(BaseModel):
    id: str
    name: str
    description: str


@router.get("/voices", response_model=list[VoiceInfo])
async def list_bark_voices(
    language: str = None,
    gender: str = None,
):
    """List available Bark voice presets"""
    voices = bark_wrapper.list_voices(language=language, gender=gender)
    return voices


@router.get("/styles", response_model=list[StyleInfo])
async def list_bark_styles():
    """List available speaking styles"""
    styles = bark_wrapper.list_styles()
    return styles


@router.post("/generate", response_model=BarkGenerateResponse)
async def generate_bark_speech(
    req: BarkGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate speech using Bark TTS"""
    # Check usage limit
    rate_limiter = get_rate_limiter(db)
    rate_limiter.check_and_increment(current_user, "bark")
    
    try:
        file_path, duration = bark_wrapper.generate_speech(
            script=req.script,
            voice_preset=req.voice_preset,
            style=req.style,
            temperature=req.temperature,
            output_format=req.output_format,
        )
        
        return BarkGenerateResponse(
            success=True,
            file_path=file_path,
            duration=duration,
            voice_preset=req.voice_preset,
            style=req.style,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def bark_health():
    """Check if Bark is available"""
    try:
        from transformers import AutoProcessor, BarkModel
        return {
            "status": "available",
            "message": "Bark TTS is ready to use"
        }
    except ImportError:
        return {
            "status": "not_installed",
            "message": "Bark not installed. Run: pip install git+https://github.com/suno-ai/bark.git"
        }
