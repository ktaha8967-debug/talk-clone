import os
import uuid
from pathlib import Path
from api.config import ALLOWED_AUDIO_FORMATS, MAX_UPLOAD_SIZE


def sanitize_filename(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    safe_name = f"{uuid.uuid4().hex}{ext}"
    return safe_name


def validate_audio_file(filename: str, file_size: int) -> tuple[bool, str]:
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED_AUDIO_FORMATS:
        return False, f"Invalid format. Allowed: {', '.join(ALLOWED_AUDIO_FORMATS)}"
    if file_size > MAX_UPLOAD_SIZE:
        return False, f"File too large. Max: {MAX_UPLOAD_SIZE // (1024*1024)}MB"
    return True, ""


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower().lstrip(".")
