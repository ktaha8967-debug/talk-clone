import shutil
from pathlib import Path
from fastapi import UploadFile
from api.config import UPLOAD_DIR
from api.utils.file_utils import sanitize_filename, validate_audio_file, get_file_extension
from api.utils.audio_utils import get_audio_duration


async def save_uploaded_file(file: UploadFile) -> dict:
    content = await file.read()
    valid, error = validate_audio_file(file.filename, len(content))
    if not valid:
        raise ValueError(error)

    safe_name = sanitize_filename(file.filename)
    file_path = UPLOAD_DIR / safe_name

    with open(file_path, "wb") as f:
        f.write(content)

    duration = get_audio_duration(str(file_path))
    return {
        "filename": safe_name,
        "original_name": file.filename,
        "file_path": str(file_path),
        "file_size": len(content),
        "duration": duration,
        "format": get_file_extension(file.filename),
    }
