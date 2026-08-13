"use client"

import { useState } from "react"
import { CheckCircle, Loader2, Mic, Upload, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceUploader } from "@/components/voice/VoiceUploader"
import { api } from "@/lib/api"

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload")

  const handleUpload = async (file: File, name: string) => {
    setIsProcessing(true)
    setStep("processing")
    try {
      const res = await api.cloneVoice(file, name)
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getTaskStatus(res.task_id)
          if (status.status === "completed") {
            clearInterval(pollInterval)
            setIsProcessing(false)
            setStep("done")
          } else if (status.status === "failed") {
            clearInterval(pollInterval)
            setIsProcessing(false)
            setStep("upload")
          }
        } catch { /* keep polling */ }
      }, 2000)
    } catch {
      setIsProcessing(false)
      setStep("upload")
      throw new Error("Upload failed")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-green-900/40 via-black to-emerald-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-600/10 blur-[100px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Clone a Voice</h1>
          <p className="mt-1 text-gray-400">Upload a reference voice (5-30 seconds) to create a clone</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[
          { id: "upload", label: "Upload", icon: Upload },
          { id: "processing", label: "Processing", icon: Loader2 },
          { id: "done", label: "Complete", icon: CheckCircle },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === s.id
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : step === "done" || (step === "processing" && i === 0)
                ? "bg-green-500/20 text-green-400"
                : "bg-white/10 text-gray-500"
            }`}>
              <s.icon className={`h-4 w-4 ${s.id === "processing" && step === "processing" ? "animate-spin" : ""}`} />
            </div>
            <span className={`text-sm ${step === s.id ? "text-white" : "text-gray-500"}`}>{s.label}</span>
            {i < 2 && <ArrowRight className="h-4 w-4 text-gray-600" />}
          </div>
        ))}
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-green-400" />
            Reference Voice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceUploader onUpload={handleUpload} isProcessing={isProcessing} />
        </CardContent>
      </Card>

      {/* Processing */}
      {step === "processing" && (
        <Card className="border-purple-500/30">
          <CardContent className="flex items-center gap-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Cloning voice...</p>
              <p className="text-xs text-gray-500">Extracting speaker embeddings and building the model</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {step === "done" && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Voice cloned successfully!</p>
              <p className="text-xs text-gray-500">You can now use this voice in the Voice Studio</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
