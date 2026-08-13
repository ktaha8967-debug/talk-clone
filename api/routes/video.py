"""
Video Routes - API endpoints for video generation.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional
from api.deps import get_current_user
from api.models.user import User
from api.services import video_engine
import os


router = APIRouter(prefix="/api/video", tags=["video"])


class VideoGenerateRequest(BaseModel):
    script: str = Field(..., min_length=10, max_length=5000)
    language: str = Field(default="en")
    voice: Optional[str] = None
    orientation: str = Field(default="portrait")
    resolution: str = Field(default="1080p")
    subtitle_style: Optional[dict] = None


@router.post("/generate")
async def generate_video(req: VideoGenerateRequest, user: User = Depends(get_current_user)):
    task_id = video_engine.start_generation({
        "script": req.script,
        "language": req.language,
        "voice": req.voice,
        "orientation": req.orientation,
        "resolution": req.resolution,
        "subtitle_style": req.subtitle_style,
        "user_id": user.id,
    })
    return {"task_id": task_id, "status": "processing"}


@router.get("/status/{task_id}")
async def get_status(task_id: str, user: User = Depends(get_current_user)):
    status = video_engine.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": status["id"],
        "status": status["status"],
        "step": status["step"],
        "progress": status["progress"],
        "detail": status["detail"],
        "output_filename": status.get("output_filename"),
        "error": status.get("error"),
    }


@router.get("/download/{task_id}")
async def download_video(task_id: str, user: User = Depends(get_current_user)):
    status = video_engine.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready yet")

    output_path = video_engine.get_task_output_path(task_id)
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=status.get("output_filename", f"{task_id}.mp4"),
    )


@router.get("/list")
async def list_videos(user: User = Depends(get_current_user)):
    videos = []
    with video_engine._lock:
        for task_id, task in video_engine._tasks.items():
            if task.get("config", {}).get("user_id") == user.id:
                videos.append({
                    "id": task["id"],
                    "status": task["status"],
                    "step": task["step"],
                    "progress": task["progress"],
                    "detail": task["detail"],
                    "output_filename": task.get("output_filename"),
                    "created_at": task.get("created_at"),
                })
    videos.sort(key=lambda v: v.get("created_at", 0), reverse=True)
    return {"videos": videos}


@router.delete("/{task_id}")
async def delete_video(task_id: str, user: User = Depends(get_current_user)):
    status = video_engine.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")

    output_path = video_engine.get_task_output_path(task_id)
    if output_path and os.path.exists(output_path):
        try:
            os.remove(output_path)
        except Exception:
            pass

    with video_engine._lock:
        video_engine._tasks.pop(task_id, None)

    return {"success": True, "message": "Video deleted"}
