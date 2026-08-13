"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { AudioPlayer } from "@/components/audio/AudioPlayer"
import { api } from "@/lib/api"

const emotionOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "angry", label: "Angry" },
  { value: "whisper", label: "Whisper" },
]

export default function StudioPage() {
  const [voices, setVoices] = useState<Array<{ id: number; name: string }>>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null)
  const [script, setScript] = useState("")
  const [speed, setSpeed] = useState([1.0])
  const [pitch, setPitch] = useState([0])
  const [temperature, setTemperature] = useState([0.7])
  const [emotion, setEmotion] = useState("neutral")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ file_path: string } | null>(null)

  useEffect(() => {
    api.getVoices().then(setVoices).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!script) return
    setIsGenerating(true)
    setProgress(10)
    try {
      const res = await api.generateSpeech({
        script,
        voice_id: selectedVoiceId || undefined,
        speed: speed[0],
        pitch: pitch[0],
        temperature: temperature[0],
        emotion,
      })
      setProgress(30)

      // Poll task
      const poll = setInterval(async () => {
        try {
          const status = await api.getTaskStatus(res.task_id)
          setProgress(status.progress || 0)
          if (status.status === "completed") {
            clearInterval(poll)
            setResult(status.result)
            setIsGenerating(false)
            setProgress(100)
          } else if (status.status === "failed") {
            clearInterval(poll)
            setIsGenerating(false)
          }
        } catch {}
      }, 2000)
    } catch {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Studio</h1>
        <p className="text-gray-400">Write a script and generate speech</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Script Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Script</CardTitle>
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
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer
                  src={api.getAudioUrl(result.file_path)}
                  onDownload={() => window.open(api.getAudioUrl(result.file_path))}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Voice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Voice</Label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={selectedVoiceId || ""}
                  onChange={(e) => setSelectedVoiceId(Number(e.target.value) || null)}
                >
                  <option value="" className="bg-gray-900">Default AI Voice</option>
                  {voices.map((v) => (
                    <option key={v.id} value={v.id} className="bg-gray-900">{v.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Speed: {speed[0]}x</Label>
                <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2.0} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label>Pitch: {pitch[0]}</Label>
                <Slider value={pitch} onValueChange={setPitch} min={-12} max={12} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Temperature: {temperature[0]}</Label>
                <Slider value={temperature} onValueChange={setTemperature} min={0.1} max={1.0} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label>Emotion</Label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                >
                  {emotionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                  ))}
                </select>
              </div>
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

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Processing...</span>
                <span className="text-purple-400">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
