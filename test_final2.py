import os, glob, subprocess, shutil
from api.config import FFMPEG_PATH

stock_dir = "D:/talk clone/outputs/temp/stock_cache"

# Pick smallest stock file (fastest to process)
all_stock = glob.glob(os.path.join(stock_dir, "scene_*.mp4"))
best = min(all_stock, key=os.path.getsize)
print(f"Stock: {os.path.basename(best)} ({os.path.getsize(best) // 1024}KB)")

# Audio
audio_files = sorted(glob.glob("D:/talk clone/outputs/temp/voiceover_*.mp3"), key=os.path.getmtime)
audio = audio_files[-1]

r = subprocess.run([FFMPEG_PATH, "-i", audio, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
audio_dur = "30"
for line in r.stderr.split("\n"):
    if "Duration:" in line:
        audio_dur = line.split("Duration:")[1].split(",")[0].strip()
        break
parts = audio_dur.split(":")
total_secs = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
print(f"Audio: {total_secs}s")

# Subtitles
subs = [
    (0, 4, "The human brain can process images"),
    (4, 7, "in just 13 milliseconds"),
    (7, 11, "Faster than the blink of an eye"),
    (11, 15, "We see 24 images every second"),
    (15, 19, "without even realizing it"),
    (19, 23, "Our eyes capture light and send signals"),
    (23, 26, "to the brain within moments"),
    (26, 30, "This ability makes humans unique"),
    (30, 34, "From cave paintings to modern art"),
    (34, 38, "Visual perception evolved over thousands"),
    (38, 42, "The future of visual tech is exciting"),
    (42, 46, "Virtual reality and AI changing everything"),
    (46, 50, "Science fiction is becoming reality"),
    (50, 55, "The human eye is a marvel of nature"),
]

filters = []
for start, end, text in subs:
    safe = text.replace("'", "").replace(":", "-")
    filters.append(
        f"drawtext=text='{safe}'"
        f":fontsize=36:fontcolor=white:borderw=3:bordercolor=black"
        f":x=(w-text_w)/2:y=h-text_h-100"
        f":box=1:boxcolor=black@0.6:boxborderw=10"
        f":enable='between(t\\,{start}\\,{end})'"
    )
filters.append(f"drawbox=x=0:y=h-6:w='iw*t/{total_secs}':h=6:color=0x8B5CF6:t=fill")
vf = ",".join(filters)

final_out = os.path.join(stock_dir, "final_result.mp4")
cmd = [
    FFMPEG_PATH, "-y",
    "-stream_loop", "-1", "-i", best,
    "-i", audio,
    "-t", str(total_secs),
    "-vf", vf,
    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    final_out,
]
print("Assembling...")
r2 = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
print(f"Return: {r2.returncode}")

if r2.returncode != 0:
    print(f"Error: {r2.stderr[-500:]}")
else:
    size = os.path.getsize(final_out)
    print(f"Size: {size // 1024}KB")
    r3 = subprocess.run([FFMPEG_PATH, "-i", final_out], capture_output=True, text=True, timeout=5)
    for l in r3.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())
    shutil.copy2(final_out, "D:/talk clone/outputs/videos/final_styled_video.mp4")
    print("Done! Saved to outputs/videos/final_styled_video.mp4")
