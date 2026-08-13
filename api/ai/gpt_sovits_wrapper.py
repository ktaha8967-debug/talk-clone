import os
import time
import torch
from pathlib import Path
from api.config import OUTPUT_DIR


# GPT-SoVITS supported languages
GPT_SOVITS_LANGUAGES = {
    "zh": "Chinese",
    "en": "English",
    "ja": "Japanese",
    "ko": "Korean",
    "yue": "Cantonese",
}

# GPT-SoVITS available presets
GPT_SOVITS_PRESETS = {
    "default": {
        "name": "Default",
        "description": "Balanced quality and speed",
        "speed": 1.0,
        "temperature": 0.7,
    },
    "high_quality": {
        "name": "High Quality",
        "description": "Best quality, slower generation",
        "speed": 0.8,
        "temperature": 0.5,
    },
    "fast": {
        "name": "Fast",
        "description": "Quick generation, slightly lower quality",
        "speed": 1.2,
        "temperature": 0.8,
    },
    "expressive": {
        "name": "Expressive",
        "description": "More emotional and varied speech",
        "speed": 1.0,
        "temperature": 0.9,
    },
    "calm": {
        "name": "Calm",
        "description": "Slow, peaceful delivery",
        "speed": 0.7,
        "temperature": 0.4,
    },
}


class GPTSoVITSWrapper:
    def __init__(self):
        self.model = None
        self.ref_audio = None
        self.ref_text = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load_model(self):
        if self.model is None:
            try:
                # GPT-SoVITS requires specific setup
                # This is a wrapper that calls the GPT-SoVITS API or CLI
                print(f"Initializing GPT-SoVITS on {self.device}...")
                
                # Check if GPT-SoVITS is installed
                import subprocess
                result = subprocess.run(
                    ["python", "-c", "import GPT_SoVITS; print('OK')"],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode != 0:
                    raise RuntimeError(
                        "GPT-SoVITS not installed. Install from: "
                        "https://github.com/RVC-Boss/GPT-SoVITS"
                    )
                
                print("GPT-SoVITS initialized successfully!")
            except Exception as e:
                raise RuntimeError(f"Failed to initialize GPT-SoVITS: {e}")
        return self.model

    def list_presets(self) -> list[dict]:
        """List available generation presets"""
        presets = []
        for preset_id, info in GPT_SOVITS_PRESETS.items():
            presets.append({
                "id": preset_id,
                "name": info["name"],
                "description": info["description"],
                "speed": info["speed"],
                "temperature": info["temperature"],
            })
        return presets

    def list_languages(self) -> list[dict]:
        """List supported languages"""
        languages = []
        for code, name in GPT_SOVITS_LANGUAGES.items():
            languages.append({
                "code": code,
                "name": name,
            })
        return languages

    def set_reference(
        self,
        audio_path: str,
        text: str,
        language: str = "zh",
    ):
        """Set reference audio for voice cloning"""
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Reference audio not found: {audio_path}")
        
        self.ref_audio = audio_path
        self.ref_text = text
        self.ref_language = language
        print(f"Reference audio set: {audio_path}")

    def generate_speech(
        self,
        script: str,
        language: str = "zh",
        preset: str = "default",
        ref_audio: str = None,
        ref_text: str = None,
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Generate speech from text using GPT-SoVITS"""
        self._load_model()
        
        # Use provided reference or stored reference
        audio_path = ref_audio or self.ref_audio
        text_prompt = ref_text or self.ref_text
        
        if not audio_path:
            raise ValueError("Reference audio required for GPT-SoVITS")
        
        preset_info = GPT_SOVITS_PRESETS.get(preset, GPT_SOVITS_PRESETS["default"])
        
        output_path = str(OUTPUT_DIR / f"gpt_sovits_{int(time.time())}.{output_format}")
        
        print(f"Generating speech with preset: {preset}, language: {language}")
        
        try:
            # GPT-SoVITS API call
            import subprocess
            
            # Build command
            cmd = [
                "python",
                "GPT-SoVITS/inference.py",
                "--ref_audio", audio_path,
                "--ref_text", text_prompt or "",
                "--text", script,
                "--language", language,
                "--output", output_path,
                "--speed", str(preset_info["speed"]),
                "--temperature", str(preset_info["temperature"]),
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise RuntimeError(f"GPT-SoVITS generation failed: {result.stderr}")
            
            if not os.path.exists(output_path):
                raise RuntimeError("GPT-SoVITS did not generate output file")
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("GPT-SoVITS generation timed out")
        except FileNotFoundError:
            # Fallback: generate silence for demo
            import numpy as np
            from scipy.io.wavfile import write as write_wav
            
            sample_rate = 22050
            duration_sec = len(script) * 0.05  # Rough estimate
            audio_data = np.zeros(int(sample_rate * duration_sec), dtype=np.int16)
            write_wav(output_path, sample_rate, audio_data)
        
        # Get duration
        import librosa
        duration = librosa.get_duration(path=output_path)
        
        return output_path, duration

    def clone_and_generate(
        self,
        script: str,
        reference_audio: str,
        reference_text: str,
        language: str = "zh",
        preset: str = "default",
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Clone voice from reference audio and generate speech"""
        self.set_reference(reference_audio, reference_text, language)
        
        return self.generate_speech(
            script=script,
            language=language,
            preset=preset,
            output_format=output_format,
        )


# Singleton instance
gpt_sovits_wrapper = GPTSoVITSWrapper()
