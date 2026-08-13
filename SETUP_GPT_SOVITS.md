# GPT-SoVITS Setup Guide

GPT-SoVITS requires manual installation due to its complex dependencies.

## Quick Install

```bash
# Clone GPT-SoVITS
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS

# Install dependencies
pip install -r requirements.txt

# Download pretrained models (optional)
python tools/download_models.py
```

## Manual Setup

### 1. Clone Repository
```bash
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS
```

### 2. Install Dependencies
```bash
pip install torch torchvision torchaudio
pip install -r requirements.txt
```

### 3. Download Models
```bash
# Download pretrained models
python tools/download_models.py

# Or manually download from:
# https://huggingface.co/lj1995/GPT-SoVITS
```

### 4. Verify Installation
```bash
python -c "import GPT_SoVITS; print('GPT-SoVITS installed successfully!')"
```

## Usage

### Voice Cloning
1. Prepare reference audio (3-10 seconds recommended)
2. Provide transcript of reference audio
3. Generate speech with cloned voice

### Supported Languages
- Chinese (zh)
- English (en)
- Japanese (ja)
- Korean (ko)
- Cantonese (yue)

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**
   ```bash
   # Use CPU instead
   export CUDA_VISIBLE_DEVICES=""
   ```

2. **Missing Dependencies**
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

3. **Model Download Failed**
   ```bash
   # Manual download from HuggingFace
   huggingface-cli download lj1995/GPT-SoVITS --local-dir ./pretrained_models
   ```

## API Usage

```python
from api.ai.gpt_sovits_wrapper import gpt_sovits_wrapper

# Set reference audio
gpt_sovits_wrapper.set_reference(
    audio_path="reference.wav",
    text="Reference transcript",
    language="zh"
)

# Generate speech
output_path, duration = gpt_sovits_wrapper.generate_speech(
    script="Hello, this is a test!",
    language="en",
    preset="default"
)
```

## Resources

- GitHub: https://github.com/RVC-Boss/GPT-SoVITS
- Documentation: https://github.com/RVC-Boss/GPT-SoVITS/wiki
- HuggingFace: https://huggingface.co/lj1995/GPT-SoVITS
