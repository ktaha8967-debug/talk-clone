import os
import time
import torch
from pathlib import Path
from api.config import COSYVOICE_MODEL_PATH, VOICE_DIR, OUTPUT_DIR


class CosyVoiceWrapper:
    def __init__(self):
        self.model_path = COSYVOICE_MODEL_PATH
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load_model(self):
        if self.model is None:
            try:
                from cosyvoice.cli.cosyvoice import CosyVoice2
                self.model = CosyVoice2(self.model_path, device=self.device)
            except ImportError:
                raise RuntimeError(
                    "CosyVoice2 not installed. Install from: "
                    "https://github.com/FunAudioLLM/CosyVoice2"
                )
        return self.model

    def extract_embedding(self, audio_path: str, language: str = "auto") -> str:
        model = self._load_model()
        from cosyvoice.utils.file_utils import load_wav

        speech = load_wav(audio_path, 16000)
        embedding = model.extract_speech_embedding(speech)

        embedding_path = str(VOICE_DIR / f"embedding_{int(time.time())}.pt")
        torch.save(embedding, embedding_path)
        return embedding_path

    def generate_speech(
        self,
        script: str,
        embedding_path: str = None,
        speed: float = 1.0,
        pitch: int = 0,
        temperature: float = 0.7,
        emotion: str = "neutral",
        output_format: str = "wav",
    ) -> tuple[str, float]:
        model = self._load_model()

        speaker_embedding = None
        if embedding_path and os.path.exists(embedding_path):
            speaker_embedding = torch.load(embedding_path)

        output = model.inference_sft(tts_text=script, speed=speed)

        output_path = str(OUTPUT_DIR / f"gen_{int(time.time())}.{output_format}")
        import torchaudio
        torchaudio.save(output_path, output["tts_speech"], 22050)

        import librosa
        duration = librosa.get_duration(path=output_path)

        return output_path, duration


DEFAULT_VOICES = {
    "male": {"name": "Default Male", "description": "Clear, professional male voice"},
    "female": {"name": "Default Female", "description": "Warm, friendly female voice"},
    "soft": {"name": "Soft Speaker", "description": "Gentle, calming voice"},
    "narrator": {"name": "Narrator", "description": "Deep, authoritative narrator voice"},
    "podcast": {"name": "Podcast Host", "description": "Conversational podcast style"},
}
