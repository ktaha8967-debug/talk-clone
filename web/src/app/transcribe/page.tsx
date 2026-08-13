"use client"

import { useState } from "react"
import { Upload, FileText, Download, Loader2, Sparkles, Languages } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AudioPlayer } from "@/components/audio/AudioPlayer"
import { api } from "@/lib/api"

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState<{ text: string; language?: string; emotion?: string; segments?: Array<{ start: number; end: number; text: string }> } | null>(null)
  const [editedText, setEditedText] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setTranscript(null)
    }
  }

  const handleTranscribe = async () => {
    if (!file) return
    setIsTranscribing(true)
    try {
      const result = await api.transcribeAudio(file)
      setTranscript(result)
      setEditedText(result.text)
    } catch {
      alert("Transcription failed")
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleExportTxt = () => {
    const blob = new Blob([editedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transcript.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportSrt = () => {
    if (!transcript?.segments?.length) return
    let srt = ""
    transcript.segments.forEach((seg, i) => {
      const start = formatSrtTime(seg.start)
      const end = formatSrtTime(seg.end)
      srt += `${i + 1}\n${start} --> ${end}\n${seg.text}\n\n`
    })
    const blob = new Blob([srt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transcript.srt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatSrtTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.round((seconds % 1) * 1000)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-orange-900/40 via-black to-red-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-600/10 blur-[100px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Transcribe</h1>
          <p className="mt-1 text-gray-400">Convert audio to text with AI-powered transcription</p>
        </div>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-400" />
            Upload Audio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition-all hover:border-orange-500/50 cursor-pointer">
            <Upload className="mb-4 h-12 w-12 text-gray-500" />
            <p className="mb-2 text-sm font-medium text-gray-400">
              {file ? file.name : "Click to upload audio"}
            </p>
            <p className="text-xs text-gray-500">WAV, MP3, M4A supported</p>
            <input type="file" accept=".wav,.mp3,.m4a" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <div className="mt-4">
              <AudioPlayer src={URL.createObjectURL(file)} />
            </div>
          )}

          {file && !transcript && (
            <Button onClick={handleTranscribe} disabled={isTranscribing} className="mt-4 w-full" size="lg">
              {isTranscribing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transcribing...</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" /> Transcribe Audio</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              Transcript
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTxt}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> TXT
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSrt}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> SRT
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(transcript.language || transcript.emotion) && (
              <div className="flex items-center gap-2">
                {transcript.language && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-400">
                    <Languages className="h-3 w-3" /> {transcript.language}
                  </span>
                )}
                {transcript.emotion && (
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400">
                    {transcript.emotion}
                  </span>
                )}
              </div>
            )}
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{editedText.split(/\s+/).filter(Boolean).length} words</p>
              <Button onClick={() => window.location.href = `/tts`}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Speech
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
