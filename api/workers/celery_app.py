from celery import Celery
from api.config import REDIS_URL

celery_app = Celery(
    "voice_studio",
    broker=REDIS_URL,
    backend=REDIS_URL.replace("/0", "/1"),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,
    task_soft_time_limit=300,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=10,
)

celery_app.autodiscover_tasks(["api.workers"])
