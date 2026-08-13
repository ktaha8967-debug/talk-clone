"""
Stock Fetcher - Free stock video/image search via Pexels API.
Pexels: 200 requests/hour free, no billing required.
"""
import os
import requests
import hashlib
from typing import Optional


PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "outputs", "temp", "stock_cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def search_videos(query: str, count: int = 5, orientation: str = "portrait") -> list[dict]:
    if not PEXELS_API_KEY:
        return _generate_placeholder_videos(query, count)

    url = "https://api.pexels.com/videos/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": query, "per_page": count, "orientation": orientation}

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for video in data.get("videos", []):
            files = video.get("video_files", [])
            hd = next((f for f in files if f.get("quality") == "hd"), files[0] if files else None)
            if hd:
                results.append({
                    "id": video["id"],
                    "url": hd["link"],
                    "width": hd.get("width", 1920),
                    "height": hd.get("height", 1080),
                    "duration": video.get("duration", 5),
                })
        return results
    except Exception:
        return _generate_placeholder_videos(query, count)


def search_images(query: str, count: int = 5) -> list[dict]:
    if not PEXELS_API_KEY:
        return _generate_placeholder_images(query, count)

    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": query, "per_page": count, "orientation": "portrait"}

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for photo in data.get("photos", []):
            src = photo.get("src", {})
            results.append({
                "id": photo["id"],
                "url": src.get("large2x") or src.get("large") or src.get("original"),
                "width": photo.get("width", 1920),
                "height": photo.get("height", 1080),
            })
        return results
    except Exception:
        return _generate_placeholder_images(query, count)


def download_file(url: str, filename: Optional[str] = None) -> str:
    if filename is None:
        filename = hashlib.md5(url.encode()).hexdigest() + os.path.splitext(url.split("?")[0])[1]

    filepath = os.path.join(CACHE_DIR, filename)
    if os.path.exists(filepath):
        return filepath

    try:
        resp = requests.get(url, timeout=30, stream=True)
        resp.raise_for_status()
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return filepath
    except Exception:
        return _create_fallback_video(filepath)


def _generate_placeholder_videos(query: str, count: int) -> list[dict]:
    results = []
    for i in range(count):
        results.append({
            "id": f"placeholder_{i}",
            "url": "",
            "width": 1920,
            "height": 1080,
            "duration": 5,
            "placeholder": True,
        })
    return results


def _generate_placeholder_images(query: str, count: int) -> list[dict]:
    results = []
    for i in range(count):
        results.append({
            "id": f"placeholder_{i}",
            "url": "",
            "width": 1920,
            "height": 1080,
            "placeholder": True,
        })
    return results


def _create_fallback_video(filepath: str) -> str:
    try:
        from api.config import FFMPEG_PATH
        import subprocess
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        subprocess.run([
            FFMPEG_PATH, "-y", "-f", "lavfi", "-i",
            "color=c=0x141428:s=1920x1080:d=5:r=24",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            filepath
        ], capture_output=True, timeout=30)
        return filepath
    except Exception:
        return ""
