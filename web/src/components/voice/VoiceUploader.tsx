"use client"

import { useState, useCallback } from "react"
import { Upload, Music, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ALLOWED_AUDIO_FORMATS, MAX_UPLOAD_SIZE } from "@/lib/constants"

interface VoiceUploaderProps {
  onUpload: (file: File, name: string) => Promise<void>
  isProcessing?: boolean
}

export function VoiceUploader({ onUpload, isProcessing }: VoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  const validateFile = (f: File): boolean => {
    const ext = f.name.split(".").pop()?.toLowerCase()
    if (!ext || !ALLOWED_AUDIO_FORMATS.includes(ext)) {
      setError(`Invalid format. Allowed: ${ALLOWED_AUDIO_FORMATS.join(", ")}`)
      return false
    }
    if (f.size > MAX_UPLOAD_SIZE) {
      setError("File too large. Max: 50MB")
      return false
    }
    setError("")
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) {
      setFile(f)
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ""))
    }
  }, [name])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) {
      setFile(f)
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async () => {
    if (!file || !name) return
    setProgress(30)
    try {
      await onUpload(file, name)
      setProgress(100)
    } catch {
      setError("Upload failed")
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
          dragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/20 bg-white/5 hover:border-white/40"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="mb-4 h-12 w-12 text-gray-500" />
            <p className="mb-2 text-sm text-gray-400">
              Drag & drop your voice file here
            </p>
            <p className="mb-4 text-xs text-gray-500">
              WAV, MP3, M4A • 5-30 seconds • Max 50MB
            </p>
            <label className="cursor-pointer inline-flex">
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
              <input
                type="file"
                accept=".wav,.mp3,.m4a"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      {/* Voice name */}
      {file && (
        <div className="space-y-2">
          <Label>Voice Name</Label>
          <Input
            placeholder="e.g. My Voice, Narrator..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Cloning voice...</span>
            <span className="text-purple-400">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Submit */}
      {file && name && !isProcessing && (
        <Button onClick={handleSubmit} className="w-full">
          Clone Voice
        </Button>
      )}
    </div>
  )
}
