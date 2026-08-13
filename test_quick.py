import os, glob, subprocess
from api.config import FFMPEG_PATH

stock_dir = "D:/talk clone/outputs/temp/stock_cache"

# Pick the biggest stock file (best quality)
all_stock = glob.glob(os.path.join(stock_dir, "scene_*.mp4"))
if not all_stock:
    print("No stock files found!")
    exit()

best = max(all_stock, key=os.path.getsize)
print(f"Using stock: {os.path.basename(best)} ({os.path.getsize(best) // 1024}KB)")

# Find latest audio
audio_files = sorted(glob.glob("D:/talk clone/outputs/temp/voiceover_*.mp3"), key=os.path.getmtime)
audio = audio_files[-1]
print(f"Audio: {os.path.basename(audio)}")

# Get audio duration
r = subprocess.run([FFMPEG_PATH, "-i", audio, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
audio_dur = "30"
for line in r.stderr.split("\n"):
    if "Duration:" in line:
        audio_dur = line.split("Duration:")[1].split(",")[0].strip()
        break
parts = audio_dur.split(":")
total_secs = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
print(f"Audio: {audio_dur} ({total_secs}s)")

# Step 1: Loop single stock clip to match audio duration (fast!)
looped = os.path.join(stock_dir, "quick_looped.mp4")
cmd = [
    FFMPEG_PATH, "-y",
    "-stream_loop", "-1", "-i", best,
    "-t", str(total_secs),
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-an", looped,
]
print("Looping stock footage...")
r1 = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
loop_size = os.path.getsize(looped) // 1024 if os.path.exists(looped) else 0
print(f"Looped: {r1.returncode}, {loop_size}KB")

if r1.returncode != 0 or not os.path.exists(looped):
    print(f"Loop error: {r1.stderr[-300:]}")
    exit()

# Step 2: Build subtitle filter
subs = [
    (0, 4, "The human brain can process images"),
    (4, 7, "in just 13 milliseconds"),
    (7, 11, "Faster than the blink of an eye"),
    (11, 15, "Scientists discovered we see 24 images"),
    (15, 19, "every second without realizing it"),
    (19, 23, "Our eyes capture light and send signals"),
    (23, 26, "to the brain within moments"),
    (26, 30, "This ability makes humans unique"),
    (30, 34, "From cave paintings to modern art"),
    (34, 38, "Visual perception evolved over thousands"),
    (38, 42, "The future of visual tech is exciting"),
    (42, 46, "Virtual reality and AI changing everything"),
    (46, 50, "We will experience science fiction soon"),
    (50, 55, "The human eye is a marvel of nature"),
]

# Build one filter with all subtitles
filters = []
for start, end, text in subs:
    safe = text.replace("'", "").replace(":", "-").replace("\\", "")
    filters.append(
        f"drawtext=text='{safe}'"
        f":fontsize=36:fontcolor=white:borderw=3:bordercolor=black"
        f":x=(w-text_w)/2:y=h-text_h-100"
        f":box=1:boxcolor=black@0.6:boxborderw=10"
        f":enable='between(t\\,{start}\\,{end})'"
    )

# Add progress bar
filters.append(f"drawbox=x=0:y=h-6:w='iw*t/{total_secs}':h=6:color=0x8B5CF6:t=fill")

vf = ",".join(filters)

# Step 3: Final assembly
final_out = os.path.join(stock_dir, "quick_final.mp4")
cmd_final = [
    FFMPEG_PATH, "-y",
    "-i", looped,
    "-i", audio,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    final_out,
]
print("Assembling final video with subtitles...")
r2 = subprocess.run(cmd_final, capture_output=True, text=True, timeout=180)
print(f"Final: {r2.returncode}")

if r2.returncode != 0:
    print(f"Error: {r2.stderr[-500:]}")
else:
    size = os.path.getsize(final_out)
    print(f"Size: {size // 1024}KB ({size // 1024 // 1024}MB)")
    r3 = subprocess.run([FFMPEG_PATH, "-i", final_out], capture_output=True, text=True, timeout=5)
    for l in r3.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())
    import shutil
    shutil.copy2(final_out, "D:/talk clone/outputs/videos/final_styled_video.mp4")
    print("Saved: outputs/videos/final_styled_video.mp4")
