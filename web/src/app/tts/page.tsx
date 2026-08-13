"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, Music, Globe, Mic, Upload, Zap, Brain, Mic2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { AudioPlayer } from "@/components/audio/AudioPlayer"
import { api } from "@/lib/api"

type TTSEngine = "bark" | "coqui" | "gpt-sovits"

interface EngineConfig {
  id: TTSEngine
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  features: string[]
}

const engines: EngineConfig[] = [
  {
    id: "bark",
    name: "Bark (Suno)",
    description: "100+ voices, 13 languages, music & effects",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    features: ["100+ voices", "13 languages", "Music generation", "Sound effects", "Emotion tags"],
  },
  {
    id: "coqui",
    name: "Coqui TTS",
    description: "1100+ languages, voice cloning, XTTS v2",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    features: ["1100+ languages", "Voice cloning", "XTTS v2", "High quality", "Multiple models"],
  },
  {
    id: "gpt-sovits",
    name: "GPT-SoVITS",
    description: "Few-shot voice cloning, Chinese/English/Japanese",
    icon: Mic2,
    color: "from-green-500 to-emerald-500",
    features: ["Few-shot cloning", "Chinese support", "Fast inference", "High quality", "Custom voices"],
  },
]

export default function TTSPage() {
  const [selectedEngine, setSelectedEngine] = useState<TTSEngine>("bark")
  const [script, setScript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; file_path: string; duration?: number } | null>(null)

  // Bark states
  const [barkVoices, setBarkVoices] = useState<Array<{ id: string; name: string; gender: string }>>([])
  const [barkStyles, setBarkStyles] = useState<Array<{ id: string; name: string }>>([])
  const [selectedBarkVoice, setSelectedBarkVoice] = useState("v2/en_speaker_6")
  const [selectedBarkStyle, setSelectedBarkStyle] = useState("neutral")
  const [barkLanguage, setBarkLanguage] = useState("en")
  const [temperature, setTemperature] = useState([0.7])

  // Coqui states
  const [coquiModels, setCoquiModels] = useState<Array<{ id: string; name: string }>>([])
  const [coquiLanguages, setCoquiLanguages] = useState<Array<{ code: string; name: string }>>([])
  const [selectedCoquiModel, setSelectedCoquiModel] = useState("tts_models/multilingual/multi-dataset/xtts_v2")
  const [selectedCoquiLanguage, setSelectedCoquiLanguage] = useState("en")
  const [coquiSpeed, setCoquiSpeed] = useState([1.0])
  const [coquiRefAudio, setCoquiRefAudio] = useState<File | null>(null)

  // GPT-SoVITS states
  const [gptPresets, setGptPresets] = useState<Array<{ id: string; name: string; description: string }>>([])
  const [gptLanguages, setGptLanguages] = useState<Array<{ code: string; name: string }>>([])
  const [selectedGptPreset, setSelectedGptPreset] = useState("default")
  const [selectedGptLanguage, setSelectedGptLanguage] = useState("zh")
  const [gptRefAudio, setGptRefAudio] = useState<File | null>(null)
  const [gptRefText, setGptRefText] = useState("")

  useEffect(() => {
    const loadEngineData = async () => {
      try {
        if (selectedEngine === "bark") {
          const [voices, styles] = await Promise.all([
            api.getBarkVoices(barkLanguage),
            api.getBarkStyles(),
          ])
          setBarkVoices(voices)
          setBarkStyles(styles)
        } else if (selectedEngine === "coqui") {
          const [models, languages] = await Promise.all([
            api.getCoquiModels(),
            api.getCoquiLanguages(),
          ])
          setCoquiModels(models)
          setCoquiLanguages(languages)
        } else if (selectedEngine === "gpt-sovits") {
          const [presets, languages] = await Promise.all([
            api.getGPTSoVITSPresets(),
            api.getGPTSoVITSLanguages(),
          ])
          setGptPresets(presets)
          setGptLanguages(languages)
        }
      } catch (err) {
        console.error("Failed to load engine data:", err)
      }
    }
    loadEngineData()
  }, [selectedEngine, barkLanguage])

  const handleGenerate = async () => {
    if (!script) return
    setIsGenerating(true)
    try {
      if (selectedEngine === "bark") {
        const res = await api.generateBarkSpeech({
          script,
          voice_preset: selectedBarkVoice,
          style: selectedBarkStyle,
          temperature: temperature[0],
        })
        setResult(res)
      } else if (selectedEngine === "coqui") {
        if (coquiRefAudio) {
          const res = await api.cloneCoquiVoice(script, selectedCoquiLanguage, coquiRefAudio)
          setResult(res)
        } else {
          const res = await api.generateCoquiSpeech({
            script,
            model_name: selectedCoquiModel,
            language: selectedCoquiLanguage,
            speed: coquiSpeed[0],
            temperature: temperature[0],
          })
          setResult(res)
        }
      } else if (selectedEngine === "gpt-sovits") {
        if (gptRefAudio) {
          const res = await api.cloneGPTSoVITSVoice(
            script,
            gptRefText,
            selectedGptLanguage,
            selectedGptPreset,
            gptRefAudio
          )
          setResult(res)
        } else {
          const res = await api.generateGPTSoVITSSpeech({
            script,
            language: selectedGptLanguage,
            preset: selectedGptPreset,
          })
          setResult(res)
        }
      }
    } catch (err) {
      console.error("Generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Voice Studio</h1>
          <p className="mt-1 text-gray-400">Generate ultra-realistic speech with multiple AI engines</p>
        </div>
      </div>

      {/* Engine Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {engines.map((engine) => (
          <Card
            key={engine.id}
            className={`cursor-pointer transition-all ${
              selectedEngine === engine.id
                ? "border-purple-500 bg-purple-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => setSelectedEngine(engine.id)}
          >
            <CardContent className="p-6">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${engine.color}`}>
                <engine.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{engine.name}</h3>
              <p className="text-sm text-gray-400">{engine.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {engine.features.slice(0, 3).map((feature) => (
                  <span key={feature} className="rounded bg-white/10 px-2 py-1 text-xs text-gray-400">
                    {feature}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Script Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your script here..."
                className="min-h-[200px] text-sm"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{script.length} characters</span>
                <span>{script.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {result && result.success && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-green-400" />
                  Generated Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer
                  src={api.getAudioUrl(result.file_path)}
                  onDownload={() => window.open(api.getAudioUrl(result.file_path))}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Duration: {result.duration?.toFixed(1)}s | Engine: {selectedEngine.toUpperCase()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Engine-Specific Controls */}
        <div className="space-y-4">
          {/* Bark Controls */}
          {selectedEngine === "bark" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={barkLanguage}
                    onChange={(e) => setBarkLanguage(e.target.value)}
                  >
                    <option value="en" className="bg-gray-900">English</option>
                    <option value="hi" className="bg-gray-900">Hindi</option>
                    <option value="es" className="bg-gray-900">Spanish</option>
                    <option value="fr" className="bg-gray-900">French</option>
                    <option value="de" className="bg-gray-900">German</option>
                    <option value="ja" className="bg-gray-900">Japanese</option>
                    <option value="ko" className="bg-gray-900">Korean</option>
                    <option value="zh" className="bg-gray-900">Chinese</option>
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-pink-400" />
                    Voice ({barkVoices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {barkVoices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedBarkVoice(voice.id)}
                        className={`w-full flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-all ${
                          selectedBarkVoice === voice.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span>{voice.gender === "male" ? "👨" : "👩"}</span>
                        <span className="text-white">{voice.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[150px] overflow-y-auto space-y-2">
                    {barkStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedBarkStyle(style.id)}
                        className={`w-full flex items-center justify-between rounded-lg border p-2 text-left text-sm transition-all ${
                          selectedBarkStyle === style.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="text-white">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Coqui Controls */}
          {selectedEngine === "coqui" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={selectedCoquiModel}
                    onChange={(e) => setSelectedCoquiModel(e.target.value)}
                  >
                    {coquiModels.map((model) => (
                      <option key={model.id} value={model.id} className="bg-gray-900">
                        {model.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-400" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={selectedCoquiLanguage}
                    onChange={(e) => setSelectedCoquiLanguage(e.target.value)}
                  >
                    {coquiLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-900">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Speed: {coquiSpeed[0]}x</CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider value={coquiSpeed} onValueChange={setCoquiSpeed} min={0.5} max={2.0} step={0.1} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-orange-400" />
                    Voice Cloning (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setCoquiRefAudio(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-400"
                  />
                  <p className="mt-2 text-xs text-gray-500">Upload reference audio for voice cloning</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* GPT-SoVITS Controls */}
          {selectedEngine === "gpt-sovits" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={selectedGptLanguage}
                    onChange={(e) => setSelectedGptLanguage(e.target.value)}
                  >
                    {gptLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-900">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Preset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gptPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedGptPreset(preset.id)}
                        className={`w-full flex items-center justify-between rounded-lg border p-2 text-left text-sm transition-all ${
                          selectedGptPreset === preset.id
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="text-white">{preset.name}</span>
                        <span className="text-xs text-gray-500">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-orange-400" />
                    Reference Audio (Required)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setGptRefAudio(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-400"
                  />
                  <Textarea
                    placeholder="Reference audio transcript..."
                    className="min-h-[80px] text-sm"
                    value={gptRefText}
                    onChange={(e) => setGptRefText(e.target.value)}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Temperature (for Bark and Coqui) */}
          {selectedEngine !== "gpt-sovits" && (
            <Card>
              <CardHeader>
                <CardTitle>Temperature: {temperature[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <Slider value={temperature} onValueChange={setTemperature} min={0.1} max={1.5} step={0.1} />
                <p className="mt-2 text-xs text-gray-500">
                  Lower = predictable, Higher = creative
                </p>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!script || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Speech
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
