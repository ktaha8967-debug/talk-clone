import requests, time, os, subprocess
from api.config import FFMPEG_PATH

API = "http://localhost:8000"
r = requests.post(f"{API}/api/auth/login", json={"email": "admin@voicestudio.ai", "password": "admin123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

script = "Did you know that the human brain can process images in just 13 milliseconds? That is faster than the blink of an eye. Scientists have discovered that we see about 24 images every second without even realizing it. Our eyes capture light, send signals to the brain, and within moments we understand what we are looking at."
print(f"Script: {len(script.split())} words")

r = requests.post(f"{API}/api/video/generate", headers=headers, json={"script": script, "language": "en", "orientation": "portrait"})
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
    except:
        pass

outfile = f"D:/talk clone/outputs/videos/video_{task_id}.mp4"
if os.path.exists(outfile):
    size = os.path.getsize(outfile)
    r = subprocess.run([FFMPEG_PATH, "-i", outfile], capture_output=True, text=True, timeout=5)
    print(f"\nVideo: {size // 1024}KB")
    for l in r.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())
    # Extract frame to verify content
    subprocess.run([FFMPEG_PATH, "-y", "-i", outfile, "-ss", "3", "-vframes", "1", "D:/talk clone/outputs/temp/verify_frame.png"], capture_output=True, timeout=10)
    if os.path.exists("D:/talk clone/outputs/temp/verify_frame.png"):
        print(f"Frame extracted: {os.path.getsize('D:/talk clone/outputs/temp/verify_frame.png') // 1024}KB")
