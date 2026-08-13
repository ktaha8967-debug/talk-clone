import subprocess
import json
from pathlib import Path
from pydub import AudioSegment


def get_audio_duration(file_path: str) -> float:
    audio = AudioSegment.from_file(file_path)
    return len(audio) / 1000.0


def convert_to_wav(input_path: str, output_path: str) -> str:
    audio = AudioSegment.from_file(input_path)
    audio.export(output_path, format="wav")
    return output_path


def convert_to_mp3(input_path: str, output_path: str) -> str:
    audio = AudioSegment.from_file(input_path)
    audio.export(output_path, format="mp3", bitrate="192k")
    return output_path


def extract_waveform_data(file_path: str, num_points: int = 100) -> list[float]:
    audio = AudioSegment.from_file(file_path)
    samples = audio.get_array_of_samples()
    chunk_size = max(1, len(samples) // num_points)
    waveform = []
    for i in range(0, len(samples), chunk_size):
        chunk = samples[i:i + chunk_size]
        rms = (sum(s ** 2 for s in chunk) / len(chunk)) ** 0.5
        waveform.append(rms)
    max_rms = max(waveform) if waveform else 1
    return [w / max_rms for w in waveform]
