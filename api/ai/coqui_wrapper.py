import os
import time
import torch
from pathlib import Path
from api.config import OUTPUT_DIR


# Coqui TTS available models with descriptions
COQUI_MODELS = {
    "tts_models/multilingual/multi-dataset/xtts_v2": {
        "name": "XTTS v2",
        "description": "Multi-lingual voice cloning model (16 languages)",
        "languages": ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh", "ja", "ko", "hu"],
        "type": "voice_cloning",
        "quality": "high",
    },
    "tts_models/multilingual/multi-dataset/your_tts": {
        "name": "YourTTS",
        "description": "Voice cloning with custom voices",
        "languages": ["en", "fr", "pt"],
        "type": "voice_cloning",
        "quality": "medium",
    },
    "tts_models/en/ljspeech/tacotron2-DDC": {
        "name": "Tacotron2 DDC",
        "description": "Single speaker English model",
        "languages": ["en"],
        "type": "single_speaker",
        "quality": "medium",
    },
    "tts_models/en/ljspeech/glow-tts": {
        "name": "Glow-TTS",
        "description": "Fast English TTS model",
        "languages": ["en"],
        "type": "single_speaker",
        "quality": "medium",
    },
    "tts_models/en/vctk/vits": {
        "name": "VITS VCTK",
        "description": "Multi-speaker English model (109 speakers)",
        "languages": ["en"],
        "type": "multi_speaker",
        "quality": "high",
    },
    "tts_models/de/thorsten/tacotron2-DDC": {
        "name": "Tacotron2 German",
        "description": "German TTS model",
        "languages": ["de"],
        "type": "single_speaker",
        "quality": "medium",
    },
    "tts_models/zh-CN/baker/tacotron2-DDC": {
        "name": "Tacotron2 Chinese",
        "description": "Chinese TTS model",
        "languages": ["zh"],
        "type": "single_speaker",
        "quality": "medium",
    },
    "tts_models/ja/kokoro/tacotron2-DDC": {
        "name": "Tacotron2 Japanese",
        "description": "Japanese TTS model",
        "languages": ["ja"],
        "type": "single_speaker",
        "quality": "medium",
    },
}

# Supported languages for XTTS v2
XTTS_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "pl": "Polish",
    "tr": "Turkish",
    "ru": "Russian",
    "nl": "Dutch",
    "cs": "Czech",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "hu": "Hungarian",
}


class CoquiWrapper:
    def __init__(self):
        self.model = None
        self.current_model_name = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load_model(self, model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2"):
        if self.model is None or self.current_model_name != model_name:
            try:
                from TTS.api import TTS
                
                print(f"Loading Coqui TTS model: {model_name} on {self.device}...")
                self.model = TTS(model_name).to(self.device)
                self.current_model_name = model_name
                print("Coqui TTS model loaded successfully!")
            except ImportError:
                raise RuntimeError(
                    "Coqui TTS not installed. Install with: pip install TTS"
                )
        return self.model

    def list_models(self) -> list[dict]:
        """List available Coqui TTS models"""
        models = []
        for model_id, info in COQUI_MODELS.items():
            models.append({
                "id": model_id,
                "name": info["name"],
                "description": info["description"],
                "languages": info["languages"],
                "type": info["type"],
                "quality": info["quality"],
            })
        return models

    def list_languages(self) -> list[dict]:
        """List supported languages"""
        languages = []
        for code, name in XTTS_LANGUAGES.items():
            languages.append({
                "code": code,
                "name": name,
            })
        return languages

    def generate_speech(
        self,
        script: str,
        model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2",
        language: str = "en",
        speaker_wav: str = None,
        speed: float = 1.0,
        temperature: float = 0.7,
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Generate speech from text using Coqui TTS"""
        model = self._load_model(model_name)
        
        output_path = str(OUTPUT_DIR / f"coqui_{int(time.time())}.{output_format}")
        
        print(f"Generating speech with model: {model_name}, language: {language}")
        
        # Generate speech
        if speaker_wav and os.path.exists(speaker_wav):
            # Voice cloning mode
            model.tts_to_file(
                text=script,
                speaker_wav=speaker_wav,
                language=language,
                file_path=output_path,
                speed=speed,
            )
        else:
            # Default speaker mode
            model.tts_to_file(
                text=script,
                language=language,
                file_path=output_path,
                speed=speed,
            )
        
        # Get duration
        import librosa
        duration = librosa.get_duration(path=output_path)
        
        return output_path, duration

    def clone_and_generate(
        self,
        script: str,
        reference_audio: str,
        language: str = "en",
        model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2",
        speed: float = 1.0,
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Clone voice from reference audio and generate speech"""
        model = self._load_model(model_name)
        
        output_path = str(OUTPUT_DIR / f"coqui_clone_{int(time.time())}.{output_format}")
        
        print(f"Cloning voice from: {reference_audio}")
        
        model.tts_to_file(
            text=script,
            speaker_wav=reference_audio,
            language=language,
            file_path=output_path,
            speed=speed,
        )
        
        import librosa
        duration = librosa.get_duration(path=output_path)
        
        return output_path, duration


# Singleton instance
coqui_wrapper = CoquiWrapper()
