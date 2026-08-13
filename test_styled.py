import os, glob, subprocess
from api.config import FFMPEG_PATH

stock_dir = "D:/talk clone/outputs/temp/stock_cache"

# Find stock files
files = sorted(glob.glob(os.path.join(stock_dir, "scene_vid_1783857351005_*.mp4")))
print(f"Stock files: {len(files)}")
for f in files:
    print(f"  {os.path.basename(f)}: {os.path.getsize(f) // 1024}KB")

if len(files) < 2:
    print("Not enough stock files, using all available")
    files = sorted(glob.glob(os.path.join(stock_dir, "*.mp4")))
    files = [f for f in files if "concat" not in f and "final" not in f and "test" not in f]
    print(f"Using {len(files)} stock files")

# Step 1: Concat stock footage
concat_file = os.path.join(stock_dir, "concat_final.txt")
with open(concat_file, "w") as fh:
    for f in files[:4]:
        fh.write(f"file '{f}'\n")

concat_out = os.path.join(stock_dir, "concat_final.mp4")
cmd = [FFMPEG_PATH, "-y", "-f", "concat", "-safe", "0", "-i", concat_file, "-c", "copy", concat_out]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print(f"Concat: return={r.returncode}, size={os.path.getsize(concat_out) // 1024 if os.path.exists(concat_out) else 0}KB")

# Step 2: Get duration
r2 = subprocess.run([FFMPEG_PATH, "-i", concat_out, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
dur = "10"
for line in r2.stderr.split("\n"):
    if "Duration:" in line:
        dur = line.split("Duration:")[1].split(",")[0].strip()
        break
print(f"Stock footage duration: {dur}")

# Step 3: Find audio
audio_files = sorted(glob.glob("D:/talk clone/outputs/temp/voiceover_*.mp3"), key=os.path.getmtime)
if not audio_files:
    print("No audio files found!")
    exit()
audio = audio_files[-1]
print(f"Audio: {os.path.basename(audio)}")

# Step 4: Get audio duration
r3 = subprocess.run([FFMPEG_PATH, "-i", audio, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
audio_dur = "10"
for line in r3.stderr.split("\n"):
    if "Duration:" in line:
        audio_dur = line.split("Duration:")[1].split(",")[0].strip()
        break
print(f"Audio duration: {audio_dur}")

# Step 5: Calculate total duration
parts = audio_dur.split(":")
total_secs = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
print(f"Total seconds: {total_secs}")

# Step 6: Loop stock footage to match audio duration
looped_out = os.path.join(stock_dir, "looped.mp4")
r_loop = subprocess.run([FFMPEG_PATH, "-y", "-stream_loop", "-1", "-i", concat_out, "-t", str(total_secs), "-c:v", "libx264", "-preset", "fast", "-an", looped_out], capture_output=True, text=True, timeout=60)
print(f"Loop: return={r_loop.returncode}, size={os.path.getsize(looped_out) // 1024 if os.path.exists(looped_out) else 0}KB")

# Step 7: Final assembly with styled subtitles
final_out = os.path.join(stock_dir, "final_styled.mp4")

# Build subtitle filter with proper styling
text_lines = [
    ("The human brain can process images", 0, 5),
    ("in just 13 milliseconds", 5, 8),
    ("That is faster than the blink of an eye", 8, 12),
    ("Scientists discovered we see 24 images", 12, 16),
    ("every second without realizing it", 16, 20),
    ("Our eyes capture light and send signals", 20, 24),
    ("to the brain within moments", 24, 27),
    ("This ability makes humans unique", 27, 31),
    ("From cave paintings to modern art", 31, 35),
    ("Visual perception evolved over thousands", 35, 39),
    ("The future of visual tech is exciting", 39, 43),
    ("Virtual reality and AI changing everything", 43, 47),
    ("We will experience science fiction soon", 47, 51),
    ("The human eye is a marvel of nature", 51, 55),
]

filters = []
for text, start, end in text_lines:
    safe = text.replace("'", "'\\''").replace(":", "\\:")
    filters.append(
        f"drawtext=text='{safe}':"
        f"fontsize=38:fontcolor=white:"
        f"borderw=3:bordercolor=black:"
        f"x=(w-text_w)/2:"
        f"y=h-text_h-100:"
        f"box=1:boxcolor=black@0.6:boxborderw=12:"
        f"enable='between(t,{start},{end})'"
    )

# Add progress bar at bottom
filters.append("drawbox=x=0:y=h-6:w='iw*t/{0}':h=6:color=0x8B5CF6:t=fill".format(total_secs))

vf = ";".join(filters)

cmd_final = [
    FFMPEG_PATH, "-y",
    "-i", looped_out,
    "-i", audio,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    final_out,
]

print("Running final assembly...")
r_final = subprocess.run(cmd_final, capture_output=True, text=True, timeout=120)
print(f"Final: return={r_final.returncode}")
if r_final.returncode != 0:
    print(f"Error: {r_final.stderr[:500]}")
else:
    size = os.path.getsize(final_out)
    print(f"Final size: {size // 1024}KB ({size // 1024 // 1024}MB)")
    r_info = subprocess.run([FFMPEG_PATH, "-i", final_out], capture_output=True, text=True, timeout=5)
    for l in r_info.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())

    # Copy to outputs/videos
    import shutil
    dest = "D:/talk clone/outputs/videos/final_styled_video.mp4"
    shutil.copy2(final_out, dest)
    print(f"\nSaved to: {dest}")
