"""
TTS Engine - Edge-TTS wrapper for free voiceover generation.
Supports 60+ languages, no API key needed.
"""
import asyncio
import os
import edge_tts
from typing import Optional


EDGE_TTS_VOICES = {
    "en": [
        "en-US-AriaNeural", "en-US-GuyNeural", "en-US-JennyNeural",
        "en-US-ChristopherNeural", "en-US-AmberNeural", "en-US-AndrewNeural",
    ],
    "hi": [
        "hi-IN-SwaraNeural", "hi-IN-MadhurNeural",
    ],
    "es": [
        "es-ES-ElviraNeural", "es-ES-AlvaroNeural",
    ],
    "fr": [
        "fr-FR-DeniseNeural", "fr-FR-HenriNeural",
    ],
    "de": [
        "de-DE-KatjaNeural", "de-DE-ConradNeural",
    ],
    "ja": [
        "ja-JP-NanamiNeural", "ja-JP-KeitaNeural",
    ],
    "ko": [
        "ko-KR-SunHiNeural", "ko-KR-InJoonNeural",
    ],
    "zh": [
        "zh-CN-XiaoxiaoNeural", "zh-CN-YunxiNeural",
    ],
    "pt": [
        "pt-BR-FranciscaNeural", "pt-BR-AntonioNeural",
    ],
    "ar": [
        "ar-SA-ZariyahNeural", "ar-SA-HamedNeural",
    ],
}


async def _generate_audio(text: str, voice: str, output_path: str) -> dict:
    communicate = edge_tts.Communicate(text, voice)
    subs = []
    audio_data = b""

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            subs.append({
                "text": chunk["text"],
                "offset": chunk["offset"] / 10_000_000,
                "duration": chunk["duration"] / 10_000_000,
            })

    with open(output_path, "wb") as f:
        f.write(audio_data)

    return {"audio_path": output_path, "subtitles": subs}


def generate_voiceover(
    text: str,
    language: str = "en",
    voice: Optional[str] = None,
    output_dir: str = "outputs/temp",
) -> dict:
    if voice is None:
        voices = EDGE_TTS_VOICES.get(language, EDGE_TTS_VOICES["en"])
        voice = voices[0]

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"voiceover_{hash(text) & 0xFFFFFF:06x}.mp3")

    result = asyncio.run(_generate_audio(text, voice, output_path))
    return result


def get_available_voices(language: str = "en") -> list[str]:
    return EDGE_TTS_VOICES.get(language, EDGE_TTS_VOICES["en"])
