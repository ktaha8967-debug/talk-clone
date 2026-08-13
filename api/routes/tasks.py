from fastapi import APIRouter
from api.workers.celery_app import celery_app

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/{task_id}")
def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)

    if task.state == "PENDING":
        return {"status": "pending", "progress": 0}
    elif task.state == "PROGRESS":
        return {
            "status": "processing",
            "progress": task.info.get("progress", 0),
            "step": task.info.get("step"),
        }
    elif task.state == "SUCCESS":
        return {"status": "completed", "result": task.result}
    else:
        return {"status": "failed", "error": str(task.info)}
