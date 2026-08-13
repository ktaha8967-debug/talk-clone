import os, glob, subprocess
from api.config import FFMPEG_PATH

stock_dir = "D:/talk clone/outputs/temp/stock_cache"

# Find all stock footage files (not test/concat/final files)
all_stock = sorted(glob.glob(os.path.join(stock_dir, "scene_*.mp4")), key=os.path.getmtime, reverse=True)
# Take unique scene files (deduplicate by scene content)
seen = set()
unique_stock = []
for f in all_stock:
    size = os.path.getsize(f)
    key = f"{os.path.basename(f).split('_')[2]}_{size}"
    if key not in seen:
        seen.add(key)
        unique_stock.append(f)

print(f"Unique stock files: {len(unique_stock)}")
for f in unique_stock[:6]:
    print(f"  {os.path.basename(f)}: {os.path.getsize(f) // 1024}KB")

# Step 1: Concat stock footage
concat_file = os.path.join(stock_dir, "test_concat.txt")
with open(concat_file, "w") as fh:
    for f in unique_stock[:6]:
        fh.write(f"file '{f}'\n")

concat_out = os.path.join(stock_dir, "test_concat.mp4")
cmd = [FFMPEG_PATH, "-y", "-f", "concat", "-safe", "0", "-i", concat_file, "-c", "copy", concat_out]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
concat_size = os.path.getsize(concat_out) // 1024 if os.path.exists(concat_out) else 0
print(f"Concat: {r.returncode}, {concat_size}KB")

# Step 2: Find latest audio
audio_files = sorted(glob.glob("D:/talk clone/outputs/temp/voiceover_*.mp3"), key=os.path.getmtime)
audio = audio_files[-1] if audio_files else None
print(f"Audio: {os.path.basename(audio) if audio else 'NONE'}")

# Get audio duration
if audio:
    r2 = subprocess.run([FFMPEG_PATH, "-i", audio, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
    audio_dur = "10"
    for line in r2.stderr.split("\n"):
        if "Duration:" in line:
            audio_dur = line.split("Duration:")[1].split(",")[0].strip()
            break
    parts = audio_dur.split(":")
    total_secs = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    print(f"Audio duration: {audio_dur} ({total_secs}s)")
else:
    total_secs = 30

# Step 3: Loop stock to match audio
looped = os.path.join(stock_dir, "test_looped.mp4")
cmd_loop = [
    FFMPEG_PATH, "-y",
    "-stream_loop", "-1", "-i", concat_out,
    "-t", str(total_secs),
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
    "-c:v", "libx264", "-preset", "fast",
    "-an", looped,
]
r_loop = subprocess.run(cmd_loop, capture_output=True, text=True, timeout=60)
print(f"Loop: {r_loop.returncode}, {os.path.getsize(looped) // 1024 if os.path.exists(looped) else 0}KB")

# Step 4: Add subtitles with proper styling
final_out = os.path.join(stock_dir, "test_final.mp4")

# Subtitle lines with timing
subs = [
    (0, 5, "The human brain can process images"),
    (5, 8, "in just 13 milliseconds"),
    (8, 12, "That is faster than the blink of an eye"),
    (12, 16, "Scientists discovered we see 24 images"),
    (16, 20, "every second without realizing it"),
    (20, 24, "Our eyes capture light and send signals"),
    (24, 27, "to the brain within moments"),
    (27, 31, "This ability makes humans unique"),
    (31, 35, "From cave paintings to modern art"),
    (35, 39, "Visual perception evolved over thousands"),
    (39, 43, "The future of visual tech is exciting"),
    (43, 47, "Virtual reality and AI changing everything"),
    (47, 51, "We will experience science fiction soon"),
    (51, 55, "The human eye is a marvel of nature"),
]

# Build filter - use separate drawtext per subtitle
vf_parts = []
for start, end, text in subs:
    safe = text.replace("'", "").replace(":", "-")
    vf_parts.append(
        f"drawtext=text='{safe}':fontsize=36:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-100:box=1:boxcolor=black@0.6:boxborderw=10:enable='between(t\\,{start}\\,{end})'"
    )

vf = ",".join(vf_parts)

if audio:
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
else:
    cmd_final = [
        FFMPEG_PATH, "-y",
        "-i", looped,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-t", str(total_secs),
        "-movflags", "+faststart",
        final_out,
    ]

print("Running final assembly...")
r_final = subprocess.run(cmd_final, capture_output=True, text=True, timeout=120)
print(f"Final return: {r_final.returncode}")

if r_final.returncode != 0:
    print(f"STDERR: {r_final.stderr[-800:]}")
else:
    size = os.path.getsize(final_out)
    print(f"Final: {size // 1024}KB ({size // 1024 // 1024}MB)")
    r_info = subprocess.run([FFMPEG_PATH, "-i", final_out], capture_output=True, text=True, timeout=5)
    for l in r_info.stderr.split("\n"):
        if "Duration" in l or "Stream" in l:
            print(l.strip())
    import shutil
    shutil.copy2(final_out, "D:/talk clone/outputs/videos/final_styled_video.mp4")
    print("Saved to outputs/videos/final_styled_video.mp4")
