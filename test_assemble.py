import os, subprocess, glob
from api.config import FFMPEG_PATH

temp_dir = "D:/talk clone/outputs/temp/stock_cache"
files = glob.glob(os.path.join(temp_dir, "*.mp4"))
print(f"Stock files found: {len(files)}")

if len(files) >= 2:
    concat_file = os.path.join(temp_dir, "concat_test.txt")
    with open(concat_file, "w") as fh:
        for f in files[:2]:
            fh.write(f"file '{f}'\n")

    out = os.path.join(temp_dir, "concat_test.mp4")
    cmd = [FFMPEG_PATH, "-y", "-f", "concat", "-safe", "0", "-i", concat_file, "-c", "copy", out]
    print("Running concat...")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    print(f"Concat return: {r.returncode}")
    if r.returncode != 0:
        print(f"Error: {r.stderr[:300]}")
    else:
        print(f"Concat size: {os.path.getsize(out)//1024}KB")

    audios = glob.glob("D:/talk clone/outputs/temp/voiceover_*.mp3")
    if audios:
        audio = audios[0]
        final = os.path.join(temp_dir, "final_test.mp4")
        cmd2 = [
            FFMPEG_PATH, "-y",
            "-i", out,
            "-i", audio,
            "-vf", "drawtext=text=Hello:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-80",
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac", "-shortest",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            final,
        ]
        print("Running final assembly...")
        r2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=60)
        print(f"Final return: {r2.returncode}")
        if r2.returncode != 0:
            print(f"Error: {r2.stderr[:500]}")
        else:
            print(f"Final size: {os.path.getsize(final)//1024}KB")
    else:
        print("No audio files found")
else:
    print("Not enough stock files")
    for f in files:
        print(f"  {os.path.basename(f)}: {os.path.getsize(f)//1024}KB")
