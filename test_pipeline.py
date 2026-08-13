import requests, time, os, subprocess
from api.config import FFMPEG_PATH

API = "http://localhost:8000"

r = requests.post(f"{API}/api/auth/login", json={"email": "admin@voicestudio.ai", "password": "admin123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

script = """Did you know that the human brain can process images in just 13 milliseconds? That is faster than the blink of an eye. Scientists have discovered that we see about 24 images every second without even realizing it. Our eyes capture light, send signals to the brain, and within moments we understand what we are looking at. This incredible ability is what makes humans unique. From ancient cave paintings to modern masterpieces, our visual perception has evolved over thousands of years. The future of visual technology is even more exciting. Virtual reality, augmented reality, and artificial intelligence are changing how we see the world. Soon, we will experience things that were once only possible in science fiction movies. The human eye is truly a marvel of nature."""

print(f"Script: {len(script.split())} words")

r = requests.post(f"{API}/api/video/generate", headers=headers, json={
    "script": script, "language": "en", "orientation": "portrait",
})
task_id = r.json()["task_id"]
print(f"Task: {task_id}")

for i in range(100):
    time.sleep(3)
    try:
        s = requests.get(f"{API}/api/video/status/{task_id}", headers=headers).json()
        print(f"[{s['progress']}%] {s['detail']}")
        if s["status"] in ("completed", "failed"):
            if s.get("error"):
                print(f"ERROR: {s['error']}")
            break
    except Exception:
        pass

outfile = f"D:/talk clone/outputs/videos/video_{task_id}.mp4"
if os.path.exists(outfile):
    size = os.path.getsize(outfile)
    r = subprocess.run([FFMPEG_PATH, "-i", outfile], capture_output=True, text=True, timeout=5)
    print(f"\nVideo: {size // 1024}KB")
    for l in r.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())
else:
    print("File not found!")
