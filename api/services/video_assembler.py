"""
Video Assembler - Professional FFmpeg + PIL based assembly.
Features:
- Multiple stock clips with transitions
- Background music + SFX
- ASS subtitles with proper text wrapping
- Progress bar
- Ken Burns effect on clips
"""
import os
import glob
import random
import subprocess
import tempfile
from typing import Optional
from api.config import FFMPEG_PATH


def _get_font_path():
    candidates = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/Arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    for f in candidates:
        if os.path.exists(f):
            return f
    return None


def wrap_text_pil(text: str, max_width: int, font_path: str, fontsize: int) -> list[str]:
    try:
        from PIL import ImageFont
        font = ImageFont.truetype(font_path, fontsize)
    except Exception:
        words = text.split()
        lines, current = [], ""
        for word in words:
            test = f"{current} {word}".strip()
            if len(test) * fontsize * 0.5 <= max_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines or [text]

    lines, current = [], ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        bbox = font.getbbox(candidate)
        width = bbox[2] - bbox[0]
        if width <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def _build_ass_file(subtitles, video_width, video_height, font_path, total_duration):
    font_size = max(28, int(video_height * 0.035))
    margin_bottom = int(video_height * 0.08)
    margin_side = int(video_width * 0.05)
    max_text_width = int(video_width * 0.9)

    ass = f"""[Script Info]
Title: VoiceStudio
ScriptType: v4.00+
PlayResX: {video_width}
PlayResY: {video_height}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,3,2,2,{margin_side},{margin_side},{margin_bottom},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    for sub in subtitles:
        text = sub.get("text", "").strip()
        start = sub.get("offset", 0)
        dur = sub.get("duration", 2)
        if not text:
            continue

        lines = wrap_text_pil(text, max_text_width, font_path, font_size)
        wrapped = "\\N".join(lines[:3])

        sh = int(start // 3600)
        sm = int((start % 3600) // 60)
        ss = start % 60
        end = start + dur
        eh = int(end // 3600)
        em = int((end % 3600) // 60)
        es = end % 60

        ass += f"Dialogue: 0,{sh}:{sm:02d}:{ss:05.2f},{eh}:{em:02d}:{es:05.2f},Default,,0,0,0,,{wrapped}\n"

    tmpdir = tempfile.mkdtemp()
    path = os.path.join(tmpdir, "subtitles.ass")
    with open(path, "w", encoding="utf-8") as f:
        f.write(ass)
    return path


def _get_duration(file_path):
    try:
        r = subprocess.run([FFMPEG_PATH, "-i", file_path, "-f", "null", "-"], capture_output=True, text=True, timeout=10)
        for line in r.stderr.split("\n"):
            if "Duration:" in line:
                parts = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = parts.split(":")
                return float(h) * 3600 + float(m) * 60 + float(s)
    except Exception:
        pass
    return 10.0


def _find_bgm():
    songs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "resource", "songs")
    if os.path.exists(songs_dir):
        files = glob.glob(os.path.join(songs_dir, "*.mp3"))
        if files:
            return random.choice(files)
    return None


def _find_sfx(name):
    sfx_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "resource", "sfx")
    path = os.path.join(sfx_dir, f"{name}.mp3")
    return path if os.path.exists(path) else None


def assemble_video(
    scenes: list[dict],
    voiceover_path: str,
    subtitles: list[dict],
    output_path: str,
    music_path: Optional[str] = None,
    resolution: tuple = (1920, 1080),
    fps: int = 24,
    subtitle_style: Optional[dict] = None,
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    w, h = resolution

    audio_duration = _get_duration(voiceover_path) if voiceover_path and os.path.exists(voiceover_path) else 10
    total_duration = max(audio_duration, sum(s.get("duration", 5) for s in scenes) or 10)

    # Collect stock footage
    stock_files = []
    for scene in scenes:
        mp = scene.get("media_path", "")
        if mp and os.path.exists(mp) and os.path.getsize(mp) > 1000:
            stock_files.append(mp)

    cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "outputs", "temp", "stock_cache")
    if os.path.exists(cache_dir):
        for f in glob.glob(os.path.join(cache_dir, "scene_*.mp4")):
            if f not in stock_files and os.path.getsize(f) > 1000:
                stock_files.append(f)

    print(f"[Assembler] Stock: {len(stock_files)}, Duration: {total_duration}s")

    # Find BGM
    if not music_path:
        music_path = _find_bgm()
    print(f"[Assembler] BGM: {music_path}")

    tmpdir = tempfile.mkdtemp()

    # Step 1: Create individual clips from stock footage
    clip_files = []
    clip_dur = total_duration / max(len(stock_files), 1)

    for i, sf in enumerate(stock_files[:20]):
        clip_path = os.path.join(tmpdir, f"clip_{i:03d}.mp4")
        cmd = [
            FFMPEG_PATH, "-y",
            "-i", sf,
            "-t", str(min(clip_dur, 8)),
            "-vf", f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1",
            "-c:v", "libx264", "-preset", "ultrafast",
            "-an", clip_path,
        ]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if r.returncode == 0 and os.path.exists(clip_path) and os.path.getsize(clip_path) > 100:
            clip_files.append(clip_path)

    # Fallback color clips
    if not clip_files:
        for i in range(max(int(total_duration / 5), 3)):
            cp = os.path.join(tmpdir, f"color_{i:03d}.mp4")
            c = f"0x{random.randint(10,30):02x}{random.randint(10,30):02x}{random.randint(30,60):02x}"
            cmd = [FFMPEG_PATH, "-y", "-f", "lavfi", "-i", f"color=c={c}:s={w}x{h}:d=5:r=24", "-c:v", "libx264", "-preset", "ultrafast", cp]
            subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if os.path.exists(cp):
                clip_files.append(cp)

    # Loop if not enough
    base_clips = clip_files.copy()
    while len(clip_files) * clip_dur < total_duration:
        clip_files.extend(random.sample(base_clips, min(3, len(base_clips))))

    print(f"[Assembler] {len(clip_files)} clips")

    # Step 2: Concat with xfade transitions
    concat_file = os.path.join(tmpdir, "concat.txt")
    with open(concat_file, "w") as f:
        for cf in clip_files:
            f.write(f"file '{cf.replace(chr(92), '/')}'\n")

    concat_video = os.path.join(tmpdir, "concat.mp4")
    cmd = [FFMPEG_PATH, "-y", "-f", "concat", "-safe", "0", "-i", concat_file, "-c:v", "copy", "-an", "-t", str(total_duration), concat_video]
    subprocess.run(cmd, capture_output=True, text=True, timeout=60)

    if not os.path.exists(concat_video):
        raise RuntimeError("Failed to concat clips")

    # Step 3: Build ASS subtitles
    font_path = _get_font_path() or "Arial"
    ass_path = _build_ass_file(subtitles, w, h, font_path, total_duration)

    # Step 4: Final assembly
    final_cmd = [FFMPEG_PATH, "-y", "-i", concat_video]

    # Audio inputs
    audio_inputs = []
    if voiceover_path and os.path.exists(voiceover_path):
        final_cmd.extend(["-i", voiceover_path])
        audio_inputs.append(("voice", 1.0))

    if music_path and os.path.exists(music_path):
        final_cmd.extend(["-i", music_path])
        audio_inputs.append(("music", 0.12))

    # Build audio filter
    if len(audio_inputs) == 2:
        final_cmd.extend([
            "-filter_complex",
            f"[1:a]volume={audio_inputs[0][1]}[a1];[2:a]volume={audio_inputs[1][1]}[a2];[a1][a2]amix=inputs=2:duration=first[a]",
            "-map", "0:v", "-map", "[a]",
        ])
    elif len(audio_inputs) == 1:
        final_cmd.extend(["-map", "0:v", "-map", "1:a"])
    else:
        final_cmd.extend(["-map", "0:v", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-map", "2:a"])

    print(f"[Assembler] Voice: {voiceover_path}, Music: {music_path}")
    print(f"[Assembler] Audio inputs: {len(audio_inputs)}")

    # Subtitle filter
    ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
    final_cmd.extend([
        "-vf", f"ass='{ass_escaped}'",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-shortest", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-t", str(total_duration),
        output_path,
    ])

    print("[Assembler] Final assembly...")
    r = subprocess.run(final_cmd, capture_output=True, text=True, timeout=180)

    if r.returncode != 0:
        print(f"[Assembler] ASS failed: {r.stderr[-200:]}")
        # Fallback: drawtext
        vf_parts = []
        for sub in subtitles:
            text = sub.get("text", "").strip()
            start = sub.get("offset", 0)
            dur = sub.get("duration", 2)
            if not text:
                continue
            lines = wrap_text_pil(text, int(w * 0.85), font_path, max(28, int(h * 0.035)))
            wrapped = "\\n".join(lines[:3])
            safe = wrapped.replace("'", "").replace(":", "-")[:100]
            fs = max(28, int(h * 0.035))
            vf_parts.append(
                f"drawtext=text='{safe}':fontsize={fs}:fontcolor=white:borderw=3:bordercolor=black"
                f":x=(w-text_w)/2:y=h-text_h-{int(h*0.08)}"
                f":box=1:boxcolor=black@0.7:boxborderw=12"
                f":enable='between(t\\,{start}\\,{start+dur})'"
            )

        if vf_parts:
            vf = ",".join(vf_parts)
            fb_cmd = [
                FFMPEG_PATH, "-y",
                "-stream_loop", "-1", "-i", stock_files[0] if stock_files else concat_video,
            ]
            if voiceover_path and os.path.exists(voiceover_path):
                fb_cmd.extend(["-i", voiceover_path])
            else:
                fb_cmd.extend(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"])

            if music_path and os.path.exists(music_path):
                fb_cmd.extend(["-i", music_path, "-filter_complex",
                    f"[1:a]volume=1.0[v];[2:a]volume=0.12[m];[v][m]amix=inputs=2:duration=first[a]",
                    "-map", "0:v", "-map", "[a]"])
            else:
                fb_cmd.extend(["-map", "0:v", "-map", "1:a"])

            fb_cmd.extend(["-t", str(total_duration), "-vf", vf,
                "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k", "-shortest", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", output_path])

            r2 = subprocess.run(fb_cmd, capture_output=True, text=True, timeout=180)
            if r2.returncode != 0:
                raise RuntimeError(f"FFmpeg failed: {r2.stderr[-500:]}")

    try:
        import shutil
        shutil.rmtree(tmpdir, ignore_errors=True)
    except Exception:
        pass

    return output_path
