import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# FFmpeg - try bundled first, then system
try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")

os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG_PATH

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/voice_studio")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

COSYVOICE_MODEL_PATH = os.getenv("COSYVOICE_MODEL_PATH", "pretrained_models/CosyVoice2-0.5B")
SENSEVOICE_MODEL_PATH = os.getenv("SENSEVOICE_MODEL_PATH", "pretrained_models/SenseVoiceSmall")

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# JWT Settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "72"))

UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
OUTPUT_DIR = BASE_DIR / os.getenv("OUTPUT_DIR", "outputs")
VOICE_DIR = BASE_DIR / os.getenv("VOICE_DIR", "voices")

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_AUDIO_FORMATS = ["wav", "mp3", "m4a"]
MIN_VOICE_DURATION = 5   # seconds
MAX_VOICE_DURATION = 30  # seconds

# Rate limiting per tier
TIER_LIMITS = {
    "starter": 500,
    "pro": 1500,
    "enterprise": -1,  # unlimited
}

for d in [UPLOAD_DIR, OUTPUT_DIR, VOICE_DIR]:
    d.mkdir(exist_ok=True)
