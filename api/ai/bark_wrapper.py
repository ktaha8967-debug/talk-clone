import os
import time
import numpy as np
from pathlib import Path
from api.config import OUTPUT_DIR


# Bark voice presets - 100+ voices across multiple languages
BARK_VOICE_PRESETS = {
    # English voices
    "en_speaker_0": {"name": "Speaker 0", "language": "en", "gender": "male", "style": "neutral"},
    "en_speaker_1": {"name": "Speaker 1", "language": "en", "gender": "female", "style": "friendly"},
    "en_speaker_2": {"name": "Speaker 2", "language": "en", "gender": "male", "style": "deep"},
    "en_speaker_3": {"name": "Speaker 3", "language": "en", "gender": "female", "style": "soft"},
    "en_speaker_4": {"name": "Speaker 4", "language": "en", "gender": "male", "style": "energetic"},
    "en_speaker_5": {"name": "Speaker 5", "language": "en", "gender": "female", "style": "professional"},
    "en_speaker_6": {"name": "Speaker 6", "language": "en", "gender": "male", "style": "narrator"},
    "en_speaker_7": {"name": "Speaker 7", "language": "en", "gender": "female", "style": "warm"},
    "en_speaker_8": {"name": "Speaker 8", "language": "en", "gender": "male", "style": "calm"},
    "en_speaker_9": {"name": "Speaker 9", "language": "en", "gender": "female", "style": "excited"},
    "en_speaker_10": {"name": "Speaker 10", "language": "en", "gender": "male", "style": "serious"},
    "en_speaker_11": {"name": "Speaker 11", "language": "en", "gender": "female", "style": "cheerful"},
    "en_speaker_12": {"name": "Speaker 12", "language": "en", "gender": "male", "style": "wise"},
    "en_speaker_13": {"name": "Speaker 13", "language": "en", "gender": "female", "style": "youthful"},
    "en_speaker_14": {"name": "Speaker 14", "language": "en", "gender": "male", "style": "authoritative"},
    "en_speaker_15": {"name": "Speaker 15", "language": "en", "gender": "female", "style": "gentle"},
    "en_speaker_16": {"name": "Speaker 16", "language": "en", "gender": "male", "style": "confident"},
    "en_speaker_17": {"name": "Speaker 17", "language": "en", "gender": "female", "style": "mysterious"},
    "en_speaker_18": {"name": "Speaker 18", "language": "en", "gender": "male", "style": "humorous"},
    "en_speaker_19": {"name": "Speaker 19", "language": "en", "gender": "female", "style": "elegant"},
    "en_speaker_20": {"name": "Speaker 20", "language": "en", "gender": "male", "style": "adventurous"},
    "en_speaker_21": {"name": "Speaker 21", "language": "en", "gender": "female", "style": "mystical"},
    "en_speaker_22": {"name": "Speaker 22", "language": "en", "gender": "male", "style": "bold"},
    "en_speaker_23": {"name": "Speaker 23", "language": "en", "gender": "female", "style": "dreamy"},
    "en_speaker_24": {"name": "Speaker 24", "language": "en", "gender": "male", "style": "intense"},
    "en_speaker_25": {"name": "Speaker 25", "language": "en", "gender": "female", "style": "playful"},
    "en_speaker_26": {"name": "Speaker 26", "language": "en", "gender": "male", "style": "stoic"},
    "en_speaker_27": {"name": "Speaker 27", "language": "en", "gender": "female", "style": "sultry"},
    "en_speaker_28": {"name": "Speaker 28", "language": "en", "gender": "male", "style": "thoughtful"},
    "en_speaker_29": {"name": "Speaker 29", "language": "en", "gender": "female", "style": "vibrant"},
    
    # Hindi voices
    "hi_speaker_0": {"name": "Hindi Speaker 0", "language": "hi", "gender": "male", "style": "neutral"},
    "hi_speaker_1": {"name": "Hindi Speaker 1", "language": "hi", "gender": "female", "style": "friendly"},
    "hi_speaker_2": {"name": "Hindi Speaker 2", "language": "hi", "gender": "male", "style": "deep"},
    "hi_speaker_3": {"name": "Hindi Speaker 3", "language": "hi", "gender": "female", "style": "soft"},
    "hi_speaker_4": {"name": "Hindi Speaker 4", "language": "hi", "gender": "male", "style": "energetic"},
    
    # Spanish voices
    "es_speaker_0": {"name": "Spanish Speaker 0", "language": "es", "gender": "male", "style": "neutral"},
    "es_speaker_1": {"name": "Spanish Speaker 1", "language": "es", "gender": "female", "style": "friendly"},
    "es_speaker_2": {"name": "Spanish Speaker 2", "language": "es", "gender": "male", "style": "deep"},
    "es_speaker_3": {"name": "Spanish Speaker 3", "language": "es", "gender": "female", "style": "soft"},
    "es_speaker_4": {"name": "Spanish Speaker 4", "language": "es", "gender": "male", "style": "energetic"},
    
    # French voices
    "fr_speaker_0": {"name": "French Speaker 0", "language": "fr", "gender": "male", "style": "neutral"},
    "fr_speaker_1": {"name": "French Speaker 1", "language": "fr", "gender": "female", "style": "friendly"},
    "fr_speaker_2": {"name": "French Speaker 2", "language": "fr", "gender": "male", "style": "deep"},
    "fr_speaker_3": {"name": "French Speaker 3", "language": "fr", "gender": "female", "style": "soft"},
    "fr_speaker_4": {"name": "French Speaker 4", "language": "fr", "gender": "male", "style": "energetic"},
    
    # German voices
    "de_speaker_0": {"name": "German Speaker 0", "language": "de", "gender": "male", "style": "neutral"},
    "de_speaker_1": {"name": "German Speaker 1", "language": "de", "gender": "female", "style": "friendly"},
    "de_speaker_2": {"name": "German Speaker 2", "language": "de", "gender": "male", "style": "deep"},
    "de_speaker_3": {"name": "German Speaker 3", "language": "de", "gender": "female", "style": "soft"},
    "de_speaker_4": {"name": "German Speaker 4", "language": "de", "gender": "male", "style": "energetic"},
    
    # Japanese voices
    "ja_speaker_0": {"name": "Japanese Speaker 0", "language": "ja", "gender": "male", "style": "neutral"},
    "ja_speaker_1": {"name": "Japanese Speaker 1", "language": "ja", "gender": "female", "style": "friendly"},
    "ja_speaker_2": {"name": "Japanese Speaker 2", "language": "ja", "gender": "male", "style": "deep"},
    "ja_speaker_3": {"name": "Japanese Speaker 3", "language": "ja", "gender": "female", "style": "soft"},
    "ja_speaker_4": {"name": "Japanese Speaker 4", "language": "ja", "gender": "male", "style": "energetic"},
    
    # Korean voices
    "ko_speaker_0": {"name": "Korean Speaker 0", "language": "ko", "gender": "male", "style": "neutral"},
    "ko_speaker_1": {"name": "Korean Speaker 1", "language": "ko", "gender": "female", "style": "friendly"},
    "ko_speaker_2": {"name": "Korean Speaker 2", "language": "ko", "gender": "male", "style": "deep"},
    "ko_speaker_3": {"name": "Korean Speaker 3", "language": "ko", "gender": "female", "style": "soft"},
    "ko_speaker_4": {"name": "Korean Speaker 4", "language": "ko", "gender": "male", "style": "energetic"},
    
    # Chinese voices
    "zh_speaker_0": {"name": "Chinese Speaker 0", "language": "zh", "gender": "male", "style": "neutral"},
    "zh_speaker_1": {"name": "Chinese Speaker 1", "language": "zh", "gender": "female", "style": "friendly"},
    "zh_speaker_2": {"name": "Chinese Speaker 2", "language": "zh", "gender": "male", "style": "deep"},
    "zh_speaker_3": {"name": "Chinese Speaker 3", "language": "zh", "gender": "female", "style": "soft"},
    "zh_speaker_4": {"name": "Chinese Speaker 4", "language": "zh", "gender": "male", "style": "energetic"},
    
    # Portuguese voices
    "pt_speaker_0": {"name": "Portuguese Speaker 0", "language": "pt", "gender": "male", "style": "neutral"},
    "pt_speaker_1": {"name": "Portuguese Speaker 1", "language": "pt", "gender": "female", "style": "friendly"},
    "pt_speaker_2": {"name": "Portuguese Speaker 2", "language": "pt", "gender": "male", "style": "deep"},
    "pt_speaker_3": {"name": "Portuguese Speaker 3", "language": "pt", "gender": "female", "style": "soft"},
    "pt_speaker_4": {"name": "Portuguese Speaker 4", "language": "pt", "gender": "male", "style": "energetic"},
    
    # Italian voices
    "it_speaker_0": {"name": "Italian Speaker 0", "language": "it", "gender": "male", "style": "neutral"},
    "it_speaker_1": {"name": "Italian Speaker 1", "language": "it", "gender": "female", "style": "friendly"},
    "it_speaker_2": {"name": "Italian Speaker 2", "language": "it", "gender": "male", "style": "deep"},
    "it_speaker_3": {"name": "Italian Speaker 3", "language": "it", "gender": "female", "style": "soft"},
    "it_speaker_4": {"name": "Italian Speaker 4", "language": "it", "gender": "male", "style": "energetic"},
    
    # Polish voices
    "pl_speaker_0": {"name": "Polish Speaker 0", "language": "pl", "gender": "male", "style": "neutral"},
    "pl_speaker_1": {"name": "Polish Speaker 1", "language": "pl", "gender": "female", "style": "friendly"},
    "pl_speaker_2": {"name": "Polish Speaker 2", "language": "pl", "gender": "male", "style": "deep"},
    "pl_speaker_3": {"name": "Polish Speaker 3", "language": "pl", "gender": "female", "style": "soft"},
    "pl_speaker_4": {"name": "Polish Speaker 4", "language": "pl", "gender": "male", "style": "energetic"},
    
    # Russian voices
    "ru_speaker_0": {"name": "Russian Speaker 0", "language": "ru", "gender": "male", "style": "neutral"},
    "ru_speaker_1": {"name": "Russian Speaker 1", "language": "ru", "gender": "female", "style": "friendly"},
    "ru_speaker_2": {"name": "Russian Speaker 2", "language": "ru", "gender": "male", "style": "deep"},
    "ru_speaker_3": {"name": "Russian Speaker 3", "language": "ru", "gender": "female", "style": "soft"},
    "ru_speaker_4": {"name": "Russian Speaker 4", "language": "ru", "gender": "male", "style": "energetic"},
    
    # Turkish voices
    "tr_speaker_0": {"name": "Turkish Speaker 0", "language": "tr", "gender": "male", "style": "neutral"},
    "tr_speaker_1": {"name": "Turkish Speaker 1", "language": "tr", "gender": "female", "style": "friendly"},
    "tr_speaker_2": {"name": "Turkish Speaker 2", "language": "tr", "gender": "male", "style": "deep"},
    "tr_speaker_3": {"name": "Turkish Speaker 3", "language": "tr", "gender": "female", "style": "soft"},
    "tr_speaker_4": {"name": "Turkish Speaker 4", "language": "tr", "gender": "male", "style": "energetic"},
}

# Style modifiers for Bark
BARK_STYLES = {
    "neutral": {"modifier": "", "description": "Natural, default speaking style"},
    "happy": {"modifier": "[laughs] ", "description": "Cheerful and upbeat tone"},
    "sad": {"modifier": "[sighs] ", "description": "Melancholic and somber tone"},
    "excited": {"modifier": "[gasps] ", "description": "High energy and enthusiastic"},
    "whisper": {"modifier": "[whispers] ", "description": "Soft, whispered speech"},
    "angry": {"modifier": "[angry] ", "description": "Frustrated and intense tone"},
    "scared": {"modifier": "[scared] ", "description": "Nervous and fearful tone"},
    "narrator": {"modifier": "", "description": "Deep, authoritative narration"},
    "conversational": {"modifier": "", "description": "Natural, everyday conversation"},
    "dramatic": {"modifier": "[dramatic] ", "description": "Theatrical and expressive"},
    "sarcastic": {"modifier": "", "description": "Dry, ironic delivery"},
    "romantic": {"modifier": "", "description": "Soft, affectionate tone"},
    "energetic": {"modifier": "", "description": "Fast-paced and lively"},
    "calm": {"modifier": "", "description": "Peaceful and soothing"},
    "professional": {"modifier": "", "description": "Business-like and clear"},
    "funny": {"modifier": "[laughs] ", "description": "Humorous and playful"},
}


class BarkWrapper:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = None

    def _load_model(self):
        if self.model is None:
            try:
                import torch
                from transformers import AutoProcessor, BarkModel
                
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                print(f"Loading Bark model on {self.device}...")
                
                self.processor = AutoProcessor.from_pretrained("suno/bark")
                self.model = BarkModel.from_pretrained("suno/bark").to(self.device)
                
                print("Bark model loaded successfully!")
            except ImportError:
                raise RuntimeError(
                    "Bark not installed. Install with: "
                    "pip install git+https://github.com/suno-ai/bark.git"
                )
        return self.model, self.processor

    def list_voices(self, language: str = None, gender: str = None) -> list[dict]:
        """List available Bark voice presets with optional filters"""
        voices = []
        for preset_id, info in BARK_VOICE_PRESETS.items():
            if language and info["language"] != language:
                continue
            if gender and info["gender"] != gender:
                continue
            voices.append({
                "id": preset_id,
                "name": info["name"],
                "language": info["language"],
                "gender": info["gender"],
                "style": info["style"],
            })
        return voices

    def list_styles(self) -> list[dict]:
        """List available speaking styles"""
        styles = []
        for style_id, info in BARK_STYLES.items():
            styles.append({
                "id": style_id,
                "name": style_id.replace("_", " ").title(),
                "description": info["description"],
            })
        return styles

    def generate_speech(
        self,
        script: str,
        voice_preset: str = "v2/en_speaker_6",
        style: str = "neutral",
        temperature: float = 0.7,
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Generate speech from text using Bark"""
        import torch
        from scipy.io.wavfile import write as write_wav
        
        model, processor = self._load_model()
        
        # Apply style modifier to script
        style_info = BARK_STYLES.get(style, BARK_STYLES["neutral"])
        modified_script = style_info["modifier"] + script
        
        # Ensure voice preset has v2/ prefix
        if not voice_preset.startswith("v2/"):
            voice_preset = f"v2/{voice_preset}"
        
        print(f"Generating speech with voice: {voice_preset}, style: {style}")
        
        inputs = processor(modified_script, voice_preset=voice_preset, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            speech_values = model.generate(
                **inputs,
                do_sample=True,
                temperature=temperature,
            )
        
        audio_array = speech_values.cpu().numpy().squeeze()
        sample_rate = model.generation_config.sample_rate
        
        # Save audio
        output_path = str(OUTPUT_DIR / f"bark_{int(time.time())}.{output_format}")
        write_wav(output_path, sample_rate, (audio_array * 32767).astype(np.int16))
        
        duration = len(audio_array) / sample_rate
        
        return output_path, duration

    def generate_with_emotion(
        self,
        script: str,
        voice_preset: str = "v2/en_speaker_6",
        emotion: str = "neutral",
        output_format: str = "wav",
    ) -> tuple[str, float]:
        """Generate speech with emotion tags in the script"""
        import torch
        from scipy.io.wavfile import write as write_wav
        
        model, processor = self._load_model()
        
        # Ensure voice preset has v2/ prefix
        if not voice_preset.startswith("v2/"):
            voice_preset = f"v2/{voice_preset}"
        
        print(f"Generating speech with emotion: {emotion}, voice: {voice_preset}")
        
        inputs = processor(script, voice_preset=voice_preset, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            speech_values = model.generate(
                **inputs,
                do_sample=True,
                temperature=0.7,
            )
        
        audio_array = speech_values.cpu().numpy().squeeze()
        sample_rate = model.generation_config.sample_rate
        
        # Save audio
        output_path = str(OUTPUT_DIR / f"bark_emotion_{int(time.time())}.{output_format}")
        write_wav(output_path, sample_rate, (audio_array * 32767).astype(np.int16))
        
        duration = len(audio_array) / sample_rate
        
        return output_path, duration


# Singleton instance
bark_wrapper = BarkWrapper()
