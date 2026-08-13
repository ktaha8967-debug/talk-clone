from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.database import engine, Base
from api.config import OUTPUT_DIR, UPLOAD_DIR
from api.routes import upload, transcribe, clone, generate, voices, history, tasks, bark, coqui, gpt_sovits, auth, admin, video
from api.middleware.security import SecurityMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoiceStudio AI", version="1.0.0")

# Security middleware
app.add_middleware(SecurityMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(transcribe.router)
app.include_router(clone.router)
app.include_router(generate.router)
app.include_router(voices.router)
app.include_router(history.router)
app.include_router(tasks.router)
app.include_router(bark.router)
app.include_router(coqui.router)
app.include_router(gpt_sovits.router)
app.include_router(admin.router)
app.include_router(video.router)

# Static files
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "VoiceStudio AI"}
