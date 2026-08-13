import subprocess, os
from api.config import FFMPEG_PATH

songs_dir = "D:/talk clone/resource/songs"
os.makedirs(songs_dir, exist_ok=True)

tracks = [
    {"name": "ambient_calm.mp3", "freq": "220", "desc": "Calm ambient"},
    {"name": "ambient_energetic.mp3", "freq": "440", "desc": "Energetic ambient"},
    {"name": "ambient_deep.mp3", "freq": "110", "desc": "Deep ambient"},
]

for track in tracks:
    path = os.path.join(songs_dir, track["name"])
    cmd = [
        FFMPEG_PATH, "-y",
        "-f", "lavfi", "-i",
        f"sine=frequency={track['freq']}:duration=60:sample_rate=44100",
        "-af", "aecho=0.8:0.88:60:0.4,lowpass=f=2000,volume=0.3",
        "-c:a", "libmp3lame", "-b:a", "128k",
        path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    exists = os.path.exists(path)
    size = os.path.getsize(path) // 1024 if exists else 0
    print(f"{track['desc']}: {exists}, {size}KB")

# Also generate SFX
sfx_dir = "D:/talk clone/resource/sfx"
os.makedirs(sfx_dir, exist_ok=True)

sfx = [
    {"name": "whoosh.mp3", "cmd": ["anoisesrc=d=0.5:c=pink:r=44100:a=0.3", "afade=t=in:st=0:d=0.1,afade=t=out:st=0.3:d=0.2,highpass=f=500"]},
    {"name": "transition.mp3", "cmd": ["sine=frequency=800:duration=0.3:sample_rate=44100", "afade=t=in:st=0:d=0.05,afade=t=out:st=0.1:d=0.2,volume=0.2"]},
    {"name": "click.mp3", "cmd": ["sine=frequency=1200:duration=0.1:sample_rate=44100", "afade=t=out:st=0:d=0.1,volume=0.15"]},
]

for s in sfx:
    path = os.path.join(sfx_dir, s["name"])
    cmd = [FFMPEG_PATH, "-y", "-f", "lavfi", "-i", s["cmd"][0], "-af", s["cmd"][1], "-c:a", "libmp3lame", path]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
    exists = os.path.exists(path)
    size = os.path.getsize(path) // 1024 if exists else 0
    print(f"SFX {s['name']}: {exists}, {size}KB")

print("All done!")
