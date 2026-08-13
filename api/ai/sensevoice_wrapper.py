import os
import torch
from api.config import SENSEVOICE_MODEL_PATH


class SenseVoiceWrapper:
    def __init__(self):
        self.model_path = SENSEVOICE_MODEL_PATH
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load_model(self):
        if self.model is None:
            try:
                from funasr import AutoModel
                self.model = AutoModel(
                    model=self.model_path,
                    device=self.device,
                    trust_remote_code=True,
                )
            except ImportError:
                raise RuntimeError(
                    "SenseVoice not installed. Install from: "
                    "https://github.com/FunAudioLLM/SenseVoice"
                )
        return self.model

    def transcribe(
        self,
        audio_path: str,
        language: str = "auto",
        use_timestamps: bool = True,
    ) -> dict:
        model = self._load_model()

        result = model.generate(
            input=audio_path,
            language=language if language != "auto" else "auto",
            use_timestamps=use_timestamps,
        )

        text = result[0]["text"]
        detected_language = result[0].get("language", language)
        emotion = result[0].get("emotion", "neutral")

        segments = []
        if use_timestamps and "timestamp" in result[0]:
            for ts in result[0]["timestamp"]:
                segments.append({
                    "start": ts[0] / 1000,
                    "end": ts[1] / 1000,
                    "text": text,
                })

        return {
            "text": text,
            "language": detected_language,
            "emotion": emotion,
            "segments": segments,
        }
