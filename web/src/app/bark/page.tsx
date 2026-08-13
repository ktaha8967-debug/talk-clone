"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, Music, Globe, Mic } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { AudioPlayer } from "@/components/audio/AudioPlayer"
import { api } from "@/lib/api"

interface VoicePreset {
  id: string
  name: string
  language: string
  gender: string
  style: string
}

interface StyleOption {
  id: string
  name: string
  description: string
}

const languageOptions = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pl", label: "Polish", flag: "🇵🇱" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "tr", label: "Turkish", flag: "🇹🇷" },
]

const genderOptions = [
  { value: "male", label: "Male", icon: "👨" },
  { value: "female", label: "Female", icon: "👩" },
]

export default function BarkPage() {
  const [voices, setVoices] = useState<VoicePreset[]>([])
  const [styles, setStyles] = useState<StyleOption[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [selectedGender, setSelectedGender] = useState<string>("")
  const [selectedVoice, setSelectedVoice] = useState<string>("v2/en_speaker_6")
  const [selectedStyle, setSelectedStyle] = useState("neutral")
  const [script, setScript] = useState("")
  const [temperature, setTemperature] = useState([0.7])
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; file_path: string; duration?: number; voice_preset: string; style: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVoicesAndStyles = async () => {
      try {
        setIsLoading(true)
        const [voicesData, stylesData] = await Promise.all([
          api.getBarkVoices(selectedLanguage, selectedGender || undefined),
          api.getBarkStyles(),
        ])
        setVoices(voicesData)
        setStyles(stylesData)
        if (voicesData.length > 0 && !voicesData.find((v: VoicePreset) => v.id === selectedVoice)) {
          setSelectedVoice(voicesData[0].id)
        }
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadVoicesAndStyles()
  }, [selectedLanguage, selectedGender, selectedVoice])

  const handleGenerate = async () => {
    if (!script) return
    setIsGenerating(true)
    try {
      const res = await api.generateBarkSpeech({
        script,
        voice_preset: selectedVoice,
        style: selectedStyle,
        temperature: temperature[0],
      })
      setResult(res)
    } catch (err) {
      console.error("Generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const getVoiceGenderIcon = (gender: string) => {
    return gender === "male" ? "👨" : "👩"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-black to-cyan-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Multi-Language Studio</h1>
          <p className="mt-1 text-gray-400">Generate speech with 100+ voices across 13 languages</p>
        </div>
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
                placeholder="Type your script here... You can also use special tags like [laughs], [sighs], [music], ♪ for songs, CAPS for emphasis..."
                className="min-h-[200px] text-sm"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{script.length} characters</span>
                <span>{script.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              
              {/* Script Tips */}
              <div className="mt-4 rounded-lg bg-white/5 p-3">
                <p className="text-xs font-medium text-gray-400 mb-2">Special Tags:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">[laughs]</span>
                  <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">[sighs]</span>
                  <span className="rounded bg-green-500/20 px-2 py-1 text-green-300">[music]</span>
                  <span className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-300">♪ for songs</span>
                  <span className="rounded bg-red-500/20 px-2 py-1 text-red-300">CAPS for emphasis</span>
                  <span className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">... for hesitations</span>
                </div>
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
                  Duration: {result.duration?.toFixed(1)}s | Voice: {result.voice_preset} | Style: {result.style}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-all ${
                      selectedLanguage === lang.value
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gender Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-pink-400" />
                Gender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedGender("")}
                  className={`flex-1 rounded-lg border p-2 text-center text-sm transition-all ${
                    selectedGender === ""
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  All
                </button>
                {genderOptions.map((gender) => (
                  <button
                    key={gender.value}
                    onClick={() => setSelectedGender(gender.value)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-2 text-sm transition-all ${
                      selectedGender === gender.value
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <span>{gender.icon}</span>
                    <span>{gender.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-green-400" />
                Voice ({voices.length} available)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        selectedVoice === voice.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-lg">{getVoiceGenderIcon(voice.gender)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{voice.name}</p>
                        <p className="text-xs text-gray-500 truncate">{voice.style}</p>
                      </div>
                      {selectedVoice === voice.id && (
                        <div className="h-2 w-2 rounded-full bg-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Speaking Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`w-full flex items-center justify-between rounded-lg border p-2 text-left transition-all ${
                      selectedStyle === style.id
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm text-white">{style.name}</span>
                    {selectedStyle === style.id && (
                      <div className="h-2 w-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature: {temperature[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider value={temperature} onValueChange={setTemperature} min={0.1} max={1.5} step={0.1} />
              <p className="mt-2 text-xs text-gray-500">
                Lower = more predictable, Higher = more creative
              </p>
            </CardContent>
          </Card>

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
