"use client"

import { useState, useEffect, useRef } from "react"
import {
  Loader2, Download, Sparkles, Globe, Mic,
  Film, Type, Music, CheckCircle, AlertCircle, Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
]

const voices: Record<string, string[]> = {
  en: ["Aria (Female)", "Guy (Male)", "Jenny (Female)", "Christopher (Male)"],
  hi: ["Swara (Female)", "Madhur (Male)"],
  es: ["Elvira (Female)", "Alvaro (Male)"],
  fr: ["Denise (Female)", "Henri (Male)"],
  de: ["Katja (Female)", "Conrad (Male)"],
  ja: ["Nanami (Female)", "Keita (Male)"],
  ko: ["SunHi (Female)", "InJoon (Male)"],
  zh: ["Xiaoxiao (Female)", "Yunxi (Male)"],
  pt: ["Francisca (Female)", "Antonio (Male)"],
  ar: ["Zariyah (Female)", "Hamed (Male)"],
}

interface VideoTask {
  id: string
  status: string
  step: string
  progress: number
  detail: string
  output_filename?: string
  error?: string
}

export default function GeneratePage() {
  const [script, setScript] = useState("")
  const [language, setLanguage] = useState("en")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTask, setCurrentTask] = useState<VideoTask | null>(null)
  const [videos, setVideos] = useState<VideoTask[]>([])
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    api.listVideos().then((data) => setVideos(data.videos || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (currentTask && currentTask.status === "processing") {
      pollRef.current = setInterval(async () => {
        try {
          const status = await api.getVideoStatus(currentTask.id)
          setCurrentTask(status)
          if (status.status === "completed" || status.status === "failed") {
            clearInterval(pollRef.current!)
            setIsGenerating(false)
            api.listVideos().then((data) => setVideos(data.videos || [])).catch(() => {})
          }
        } catch { /* keep polling */ }
      }, 1000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask?.status])

  const handleGenerate = async () => {
    if (!script.trim()) return
    setIsGenerating(true)
    try {
      const res = await api.generateVideo({
        script,
        language,
        voice: selectedVoice || undefined,
        orientation,
      })
      setCurrentTask({
        id: res.task_id,
        status: "processing",
        step: "starting",
        progress: 0,
        detail: "Initializing...",
      })
    } catch (err) {
      setIsGenerating(false)
      alert(err instanceof Error ? err.message : "Generation failed")
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await api.deleteVideo(taskId)
      setVideos((prev) => prev.filter((v) => v.id !== taskId))
    } catch { /* ignore */ }
  }

  const wordCount = script.split(/\s+/).filter(Boolean).length
  const estimatedDuration = Math.max(5, Math.round(wordCount * 0.4))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/40 via-black to-purple-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Video Generator</h1>
            <p className="mt-1 text-gray-400">Paste your script and get a full video with voiceover, visuals, and subtitles</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Film className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-white">100% Free</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Script Input */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-violet-400" />
                Your Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste or type your video script here... Each sentence will become a scene with matching stock footage and voiceover."
                className="min-h-[250px] text-sm"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{wordCount} words</span>
                <span>~{estimatedDuration}s estimated video</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {currentTask && (
            <Card className={
              currentTask.status === "completed" ? "border-green-500/30" :
              currentTask.status === "failed" ? "border-red-500/30" : "border-violet-500/30"
            }>
              <CardContent className="p-6">
                {currentTask.status === "completed" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-lg font-semibold text-white">Video Ready!</p>
                        <p className="text-sm text-gray-400">Your video has been generated successfully</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a href={api.downloadVideo(currentTask.id)} download className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors">
                        <Download className="h-4 w-4" /> Download Video
                      </a>
                      <Button variant="outline" onClick={() => setCurrentTask(null)}>Generate Another</Button>
                    </div>
                  </div>
                ) : currentTask.status === "failed" ? (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <div>
                      <p className="text-lg font-semibold text-white">Generation Failed</p>
                      <p className="text-sm text-red-400">{currentTask.error || "Unknown error"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                        <span className="text-sm font-medium text-white">{currentTask.detail}</span>
                      </div>
                      <span className="text-sm font-bold text-violet-400">{currentTask.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${currentTask.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {["parsing", "fetching", "tts", "subtitles", "assembly", "done"].map((step) => {
                        const steps = ["parsing", "fetching", "tts", "subtitles", "assembly", "done"]
                        const currentIdx = steps.indexOf(currentTask.step)
                        const stepIdx = steps.indexOf(step)
                        return (
                          <span key={step} className={
                            stepIdx < currentIdx ? "text-green-400" :
                            stepIdx === currentIdx ? "text-violet-400" : ""
                          }>
                            {stepIdx < currentIdx ? "✓" : stepIdx === currentIdx ? "●" : "○"} {step}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {!currentTask && (
            <Button
              onClick={handleGenerate}
              disabled={!script.trim() || isGenerating || wordCount < 5}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Generate Video</>
              )}
            </Button>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Orientation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Video Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    orientation === "portrait"
                      ? "border-violet-500 bg-violet-500/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="h-16 w-10 rounded-lg border-2 border-current" />
                  <span className="text-xs font-medium">9:16 Portrait</span>
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    orientation === "landscape"
                      ? "border-violet-500 bg-violet-500/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="h-10 w-16 rounded-lg border-2 border-current" />
                  <span className="text-xs font-medium">16:9 Landscape</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" /> Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setSelectedVoice("") }}
                    className={`flex items-center gap-1.5 rounded-lg p-2 text-left text-xs transition-all ${
                      language === lang.code
                        ? "bg-violet-500/20 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mic className="h-4 w-4" /> Voice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {(voices[language] || voices.en).map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={`w-full rounded-lg p-2.5 text-left text-xs transition-all ${
                      selectedVoice === v
                        ? "bg-violet-500/20 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border-white/5">
            <CardContent className="p-4">
              <div className="space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-violet-400" /> Stock footage from Pexels (free)</p>
                <p className="flex items-center gap-2"><Mic className="h-3 w-3 text-violet-400" /> Voiceover via Edge TTS (free)</p>
                <p className="flex items-center gap-2"><Type className="h-3 w-3 text-violet-400" /> Auto-subtitles included</p>
                <p className="flex items-center gap-2"><Music className="h-3 w-3 text-violet-400" /> Background music added</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Videos */}
      {videos.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Videos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <Card key={v.id} className="hover:border-white/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        v.status === "completed" ? "bg-green-500/20" :
                        v.status === "failed" ? "bg-red-500/20" : "bg-violet-500/20"
                      }`}>
                        {v.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                         v.status === "failed" ? <AlertCircle className="h-5 w-5 text-red-400" /> :
                         <Loader2 className="h-5 w-5 animate-spin text-violet-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {v.status === "completed" ? "Ready" : v.status === "failed" ? "Failed" : v.detail}
                        </p>
                        <p className="text-xs text-gray-500">
                          {v.status === "completed" ? v.output_filename : `Step: ${v.step}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {v.status === "completed" && (
                        <a href={api.downloadVideo(v.id)} download className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
