# VoiceStudio AI - Enterprise Video Generation Platform

## Reference: MoneyPrinterTurbo (96.9k stars)
https://github.com/harry0703/MoneyPrinterTurbo

Architecture studied from MoneyPrinterTurbo:
- Script generation via LLM
- Edge TTS (free, 60+ languages)
- Pexels/Pixabay free stock footage
- MoviePy + FFmpeg video assembly
- Subtitle generation
- Background music

## Our Approach: 100% Free Stack

### What We Use (All Free)

| Component | Tool | Cost | Notes |
|-----------|------|------|-------|
| Script Gen | User provides text OR template-based | Free | No LLM needed - user writes script |
| Stock Video | Pexels API | Free | 200 req/hr, no billing required |
| Stock Images | Pexels/Pixabay API | Free | For scene backgrounds |
| TTS Voiceover | Edge-TTS | Free | 60+ languages, no API key |
| Subtitles | Edge-TTS timestamps | Free | Auto-synced to voiceover |
| Background Music | Local MP3 files | Free | Bundle with app |
| Video Assembly | MoviePy + FFmpeg | Free | Python video editing |
| Frontend | Next.js + Tailwind | Free | Modern UI |
| Backend | FastAPI | Free | Python API |

### NO Paid APIs Required
- No Ollama (user's PC can't handle it)
- No Groq (not 100% free)
- No OpenAI/GPT (paid)
- No ElevenLabs (paid)
- No RunwayML (paid)

## Video Generation Pipeline

```
User Input (script text + preferences)
    |
    v
[1] Parse Script into Scenes          ~0.5s
    - Split by sentences/paragraphs
    - Extract keywords for stock search
    |
    v
[2] Fetch Stock Videos (parallel)      ~3-5s
    - Pexels API: search by keyword
    - Download 5-10 second clips
    - Multiple clips per scene
    |
    v
[3] Generate Voiceover (parallel)      ~2-3s
    - Edge-TTS: text to speech
    - Get word-level timestamps
    - Multiple languages supported
    |
    v
[4] Generate Subtitles                ~0.5s
    - From Edge-TTS timestamps
    - Auto-synced to audio
    |
    v
[5] Assemble Video                    ~5-10s
    - MoviePy: combine clips
    - Ken Burns effect on images
    - Sync with voiceover timing
    - Overlay subtitles
    - Add background music
    - Render final MP4
    |
    v
Final Video (1080p MP4)              ~15-20s total
```

## UI Pages (ElevenLabs-style)

### 1. Landing Page (`/`)
- Hero with gradient animation
- Feature showcase
- Pricing tiers

### 2. Dashboard (`/dashboard`)
- Usage stats
- Recent projects
- Quick actions

### 3. Video Generator (`/generate`) - MAIN PAGE
- Script input (large text area)
- Settings panel:
  - Video format (9:16 portrait / 16:9 landscape)
  - Duration (15s / 30s / 60s)
  - Language selection
  - Voice selection
  - Subtitle style
  - Background music
- Generate button with progress bar
- Progress steps:
  ```
  [1/5] Parsing script... 20%
  [2/5] Fetching stock footage... 40%
  [3/5] Generating voiceover... 60%
  [4/5] Creating subtitles... 80%
  [5/5] Assembling video... 95%
  ✓ Done! 100%
  ```

### 4. Projects (`/projects`)
- Grid of generated videos
- Download/re-generate
- Status indicators

### 5. Settings (`/settings`)
- Voice preferences
- Default video format
- API keys (Pexels - optional)

## Backend Structure

```
api/
├── main.py
├── config.py
├── database.py
├── models/
│   ├── user.py
│   └── video.py
├── routes/
│   ├── auth.py
│   ├── video.py
│   └── admin.py
├── services/
│   ├── script_parser.py    # Parse script into scenes
│   ├── stock_fetcher.py    # Pexels API integration
│   ├── tts_engine.py       # Edge-TTS wrapper
│   ├── subtitle_gen.py     # Subtitle generation
│   ├── video_assembler.py  # MoviePy video assembly
│   └── video_engine.py     # Orchestrator
└── utils/
```

## Key API Endpoints

```
POST /api/video/generate        - Start video generation
GET  /api/video/status/{id}     - Check progress
GET  /api/video/download/{id}   - Download video
GET  /api/video/list            - List all videos
DELETE /api/video/{id}          - Delete video
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Total generation time | < 30 seconds |
| Stock fetch | < 5 seconds |
| TTS generation | < 3 seconds |
| Video assembly | < 10 seconds |
| API response | < 200ms |
| Memory usage | < 2GB |

## Deployment

### Local
- Python 3.11+
- FFmpeg installed
- No GPU required
- No API keys needed (Pexels has free tier without key for basic use)

### VPS
- $5/month VPS
- Docker compose
- Auto-scaling workers

## Implementation Order
1. Backend video pipeline (services)
2. API routes
3. Frontend video generator page
4. Progress tracking
5. Projects page
6. Polish UI
