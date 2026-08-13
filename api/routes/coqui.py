from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
from api.database import get_db
from api.deps import get_current_user
from api.models.user import User
from api.middleware.rate_limiter import get_rate_limiter
from api.ai.coqui_wrapper import coqui_wrapper
from api.config import UPLOAD_DIR
import os
import time

router = APIRouter(prefix="/api/coqui", tags=["coqui"])


class CoquiGenerateRequest(BaseModel):
    script: str = Field(..., min_length=1, max_length=10000, description="Text to convert to speech")
    model_name: str = Field(default="tts_models/multilingual/multi-dataset/xtts_v2", description="Model to use")
    language: str = Field(default="en", description="Language code")
    speed: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech speed")
    temperature: float = Field(default=0.7, ge=0.0, le=1.5, description="Generation temperature")
    output_format: str = Field(default="wav", description="Output audio format")


class CoquiGenerateResponse(BaseModel):
    success: bool
    file_path: str
    duration: float
    model_name: str
    language: str


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    languages: list[str]
    type: str
    quality: str


class LanguageInfo(BaseModel):
    code: str
    name: str


@router.get("/models", response_model=list[ModelInfo])
async def list_coqui_models():
    """List available Coqui TTS models"""
    models = coqui_wrapper.list_models()
    return models


@router.get("/languages", response_model=list[LanguageInfo])
async def list_coqui_languages():
    """List supported languages"""
    languages = coqui_wrapper.list_languages()
    return languages


@router.post("/generate", response_model=CoquiGenerateResponse)
async def generate_coqui_speech(
    req: CoquiGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate speech using Coqui TTS"""
    # Check tier (Pro/Enterprise only)
    if current_user.tier == "starter":
        raise HTTPException(status_code=403, detail="Coqui TTS requires Pro or Enterprise subscription")
    
    rate_limiter = get_rate_limiter(db)
    rate_limiter.check_and_increment(current_user, "coqui")
    
    try:
        file_path, duration = coqui_wrapper.generate_speech(
            script=req.script,
            model_name=req.model_name,
            language=req.language,
            speed=req.speed,
            temperature=req.temperature,
            output_format=req.output_format,
        )
        
        return CoquiGenerateResponse(
            success=True,
            file_path=file_path,
            duration=duration,
            model_name=req.model_name,
            language=req.language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clone", response_model=CoquiGenerateResponse)
async def clone_and_generate_coqui(
    script: str = Form(...),
    language: str = Form("en"),
    model_name: str = Form("tts_models/multilingual/multi-dataset/xtts_v2"),
    speed: float = Form(1.0),
    reference_audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clone voice from reference audio and generate speech"""
    # Check tier (Pro/Enterprise only)
    if current_user.tier == "starter":
        raise HTTPException(status_code=403, detail="Voice cloning requires Pro or Enterprise subscription")
    
    rate_limiter = get_rate_limiter(db)
    rate_limiter.check_and_increment(current_user, "coqui")
    
    try:
        # Save reference audio
        ref_path = str(UPLOAD_DIR / f"coqui_ref_{int(time.time())}.wav")
        with open(ref_path, "wb") as f:
            content = await reference_audio.read()
            f.write(content)
        
        file_path, duration = coqui_wrapper.clone_and_generate(
            script=script,
            reference_audio=ref_path,
            language=language,
            model_name=model_name,
            speed=speed,
        )
        
        # Clean up reference file
        os.remove(ref_path)
        
        return CoquiGenerateResponse(
            success=True,
            file_path=file_path,
            duration=duration,
            model_name=model_name,
            language=language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def coqui_health():
    """Check if Coqui TTS is available"""
    try:
        from TTS.api import TTS
        return {
            "status": "available",
            "message": "Coqui TTS is ready to use"
        }
    except ImportError:
        return {
            "status": "not_installed",
            "message": "Coqui TTS not installed. Run: pip install TTS"
        }
