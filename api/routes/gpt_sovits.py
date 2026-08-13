from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
from api.database import get_db
from api.deps import get_current_user
from api.models.user import User
from api.middleware.rate_limiter import get_rate_limiter
from api.ai.gpt_sovits_wrapper import gpt_sovits_wrapper
from api.config import UPLOAD_DIR
import os
import time

router = APIRouter(prefix="/api/gpt-sovits", tags=["gpt-sovits"])


class GPTSoVITSGenerateRequest(BaseModel):
    script: str = Field(..., min_length=1, max_length=10000, description="Text to convert to speech")
    language: str = Field(default="zh", description="Language code")
    preset: str = Field(default="default", description="Generation preset")
    output_format: str = Field(default="wav", description="Output audio format")


class GPTSoVITSGenerateResponse(BaseModel):
    success: bool
    file_path: str
    duration: float
    language: str
    preset: str


class PresetInfo(BaseModel):
    id: str
    name: str
    description: str
    speed: float
    temperature: float


class LanguageInfo(BaseModel):
    code: str
    name: str


@router.get("/presets", response_model=list[PresetInfo])
async def list_gpt_sovits_presets():
    """List available generation presets"""
    presets = gpt_sovits_wrapper.list_presets()
    return presets


@router.get("/languages", response_model=list[LanguageInfo])
async def list_gpt_sovits_languages():
    """List supported languages"""
    languages = gpt_sovits_wrapper.list_languages()
    return languages


@router.post("/generate", response_model=GPTSoVITSGenerateResponse)
async def generate_gpt_sovits_speech(
    req: GPTSoVITSGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate speech using GPT-SoVITS (requires reference audio)"""
    # Check tier (Pro/Enterprise only)
    if current_user.tier == "starter":
        raise HTTPException(status_code=403, detail="GPT-SoVITS requires Pro or Enterprise subscription")
    
    rate_limiter = get_rate_limiter(db)
    rate_limiter.check_and_increment(current_user, "gpt-sovits")
    
    try:
        file_path, duration = gpt_sovits_wrapper.generate_speech(
            script=req.script,
            language=req.language,
            preset=req.preset,
            output_format=req.output_format,
        )
        
        return GPTSoVITSGenerateResponse(
            success=True,
            file_path=file_path,
            duration=duration,
            language=req.language,
            preset=req.preset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clone", response_model=GPTSoVITSGenerateResponse)
async def clone_and_generate_gpt_sovits(
    script: str = Form(...),
    reference_text: str = Form(...),
    language: str = Form("zh"),
    preset: str = Form("default"),
    reference_audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clone voice from reference audio and generate speech"""
    # Check tier (Pro/Enterprise only)
    if current_user.tier == "starter":
        raise HTTPException(status_code=403, detail="Voice cloning requires Pro or Enterprise subscription")
    
    rate_limiter = get_rate_limiter(db)
    rate_limiter.check_and_increment(current_user, "gpt-sovits")
    
    try:
        # Save reference audio
        ref_path = str(UPLOAD_DIR / f"gpt_sovits_ref_{int(time.time())}.wav")
        with open(ref_path, "wb") as f:
            content = await reference_audio.read()
            f.write(content)
        
        file_path, duration = gpt_sovits_wrapper.clone_and_generate(
            script=script,
            reference_audio=ref_path,
            reference_text=reference_text,
            language=language,
            preset=preset,
        )
        
        # Clean up reference file
        os.remove(ref_path)
        
        return GPTSoVITSGenerateResponse(
            success=True,
            file_path=file_path,
            duration=duration,
            language=language,
            preset=preset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def gpt_sovits_health():
    """Check if GPT-SoVITS is available"""
    try:
        import subprocess
        result = subprocess.run(
            ["python", "-c", "import GPT_SoVITS; print('OK')"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            return {
                "status": "available",
                "message": "GPT-SoVITS is ready to use"
            }
        else:
            return {
                "status": "not_installed",
                "message": "GPT-SoVITS not installed. Install from: https://github.com/RVC-Boss/GPT-SoVITS"
            }
    except Exception:
        return {
            "status": "not_installed",
            "message": "GPT-SoVITS not installed. Install from: https://github.com/RVC-Boss/GPT-SoVITS"
        }
