"""
Video Engine - Main orchestrator for video generation pipeline.
Ties together script parsing, stock fetching, TTS, subtitles, and assembly.
"""
import os
import json
import time
import threading
from typing import Optional


OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "outputs", "videos")
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "outputs", "temp")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

_tasks = {}
_lock = threading.Lock()


def _parse_script(script: str) -> list[dict]:
    sentences = [s.strip() for s in script.replace("\n", " ").split(".") if s.strip()]
    if not sentences:
        sentences = [script.strip()]

    scenes = []
    for i, sentence in enumerate(sentences):
        words = sentence.split()
        keyword = " ".join(words[:3]) if len(words) >= 3 else sentence
        duration = max(3, min(8, len(words) * 0.4))

        scenes.append({
            "index": i,
            "text": sentence + ".",
            "keyword": keyword,
            "duration": round(duration, 1),
        })
    return scenes


def _update_progress(task_id: str, step: str, percent: int, detail: str = ""):
    with _lock:
        if task_id in _tasks:
            _tasks[task_id]["step"] = step
            _tasks[task_id]["progress"] = percent
            _tasks[task_id]["detail"] = detail


def _run_pipeline(task_id: str, config: dict):
    from api.services.stock_fetcher import search_videos, download_file
    from api.services.tts_engine import generate_voiceover
    from api.services.video_assembler import assemble_video

    try:
        script = config["script"]
        language = config.get("language", "en")
        voice = config.get("voice", None)
        resolution_name = config.get("resolution", "1080p")
        orientation = config.get("orientation", "portrait")

        if orientation == "landscape":
            resolution = (1920, 1080)
        else:
            resolution = (1080, 1920)

        music_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "resource", "songs")
        music_files = []
        if os.path.exists(music_dir):
            music_files = [os.path.join(music_dir, f) for f in os.listdir(music_dir) if f.endswith((".mp3", ".wav"))]
        music_path = random.choice(music_files) if music_files else None

        _update_progress(task_id, "parsing", 10, "Parsing script into scenes...")
        scenes = _parse_script(script)
        time.sleep(0.3)

        _update_progress(task_id, "fetching", 20, f"Fetching stock footage for {len(scenes)} scenes...")
        for i, scene in enumerate(scenes):
            try:
                videos = search_videos(scene["keyword"], count=1, orientation=orientation)
                if videos and not videos[0].get("placeholder"):
                    video_path = download_file(videos[0]["url"], f"scene_{task_id}_{i}.mp4")
                    scene["media_path"] = video_path
                else:
                    scene["media_path"] = ""
            except Exception:
                scene["media_path"] = ""
            pct = 20 + int((i + 1) / len(scenes) * 25)
            _update_progress(task_id, "fetching", pct, f"Scene {i+1}/{len(scenes)}...")

        _update_progress(task_id, "tts", 50, "Generating voiceover...")
        full_text = " ".join(s["text"] for s in scenes)
        tts_result = generate_voiceover(full_text, language=language, voice=voice, output_dir=TEMP_DIR)
        voiceover_path = tts_result["audio_path"]
        subtitles = tts_result.get("subtitles", [])

        if not subtitles:
            subtitles = []
            current_time = 0
            for scene in scenes:
                subtitles.append({
                    "text": scene["text"],
                    "offset": current_time,
                    "duration": scene["duration"],
                })
                current_time += scene["duration"]

        _update_progress(task_id, "subtitles", 70, "Generating subtitles...")
        time.sleep(0.2)

        _update_progress(task_id, "assembly", 80, "Assembling video...")
        output_filename = f"video_{task_id}.mp4"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        assemble_video(
            scenes=scenes,
            voiceover_path=voiceover_path,
            subtitles=subtitles,
            output_path=output_path,
            music_path=music_path,
            resolution=resolution,
            fps=24,
        )

        _update_progress(task_id, "done", 100, "Video ready!")
        with _lock:
            _tasks[task_id]["status"] = "completed"
            _tasks[task_id]["output_path"] = output_path
            _tasks[task_id]["output_filename"] = output_filename

    except Exception as e:
        with _lock:
            _tasks[task_id]["status"] = "failed"
            _tasks[task_id]["error"] = str(e)
        _update_progress(task_id, "error", 0, str(e))


import random


def start_generation(config: dict) -> str:
    task_id = f"vid_{int(time.time() * 1000)}"
    with _lock:
        _tasks[task_id] = {
            "id": task_id,
            "status": "processing",
            "step": "starting",
            "progress": 0,
            "detail": "Initializing...",
            "config": config,
            "output_path": None,
            "output_filename": None,
            "error": None,
            "created_at": time.time(),
        }

    thread = threading.Thread(target=_run_pipeline, args=(task_id, config), daemon=True)
    thread.start()
    return task_id


def get_task_status(task_id: str) -> Optional[dict]:
    with _lock:
        return _tasks.get(task_id)


def get_task_output_path(task_id: str) -> Optional[str]:
    with _lock:
        task = _tasks.get(task_id)
        if task and task.get("output_path"):
            return task["output_path"]
    return None


def cleanup_old_tasks(max_age_seconds: int = 3600):
    with _lock:
        now = time.time()
        to_delete = [
            tid for tid, t in _tasks.items()
            if now - t.get("created_at", 0) > max_age_seconds
        ]
        for tid in to_delete:
            task = _tasks.pop(tid, None)
            if task and task.get("output_path") and os.path.exists(task["output_path"]):
                try:
                    os.remove(task["output_path"])
                except Exception:
                    pass
