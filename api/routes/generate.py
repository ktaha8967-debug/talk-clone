from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from api.schemas.generate import GenerateRequest, GenerateResponse
from api.services.generate_service import create_generation, create_project
from api.workers.generate_tasks import generate_speech_task

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
async def generate_speech(req: GenerateRequest, db: Session = Depends(get_db)):
    project = create_project(
        db, user_id=1, name=f"Generate: {req.script[:50]}...",
        script=req.script, voice_id=req.voice_id,
    )
    gen = create_generation(
        db=db, project_id=project.id, script=req.script,
        voice_id=req.voice_id,
        settings={"speed": req.speed, "pitch": req.pitch,
                  "temperature": req.temperature, "emotion": req.emotion},
        file_format=req.output_format,
    )

    task = generate_speech_task.delay(
        gen.id, req.script, req.voice_id,
        {"speed": req.speed, "pitch": req.pitch,
         "temperature": req.temperature, "emotion": req.emotion},
    )

    return GenerateResponse(
        task_id=task.id,
        generation_id=gen.id,
        status="processing",
    )
