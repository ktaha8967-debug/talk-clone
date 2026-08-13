"use client"

import { useState, useEffect } from "react"
import { Clock, Play, Download, Trash2, Copy, Music } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio/AudioPlayer"
import { api } from "@/lib/api"

interface HistoryItem {
  id: number
  script: string
  created_at: string
  duration_seconds?: number
  status: string
  file_path: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [playingId, setPlayingId] = useState<number | null>(null)

  const loadHistory = () => {
    api.getHistory().then(setHistory).catch(() => setHistory([]))
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Delete this entry?")) {
      await api.deleteHistory(id)
      loadHistory()
    }
  }

  const handleDuplicate = () => {
    window.location.href = `/tts`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-green-900/40 via-black to-emerald-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-600/10 blur-[100px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">History</h1>
            <p className="mt-1 text-gray-400">Browse your past generations</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">{history.length} item{history.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Music className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-400">No history yet</p>
            <p className="mt-1 text-sm text-gray-500">Generate some audio to see it here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="hover:border-white/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
                    <Music className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.script}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {item.duration_seconds && <span>{item.duration_seconds.toFixed(1)}s</span>}
                      <span className={`rounded-full px-2 py-0.5 font-medium ${
                        item.status === "completed" ? "bg-green-500/20 text-green-400" :
                        item.status === "processing" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDuplicate}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {item.status === "completed" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(api.getAudioUrl(item.file_path))}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {playingId === item.id && item.status === "completed" && (
                  <div className="mt-3">
                    <AudioPlayer
                      src={api.getAudioUrl(item.file_path)}
                      onDownload={() => window.open(api.getAudioUrl(item.file_path))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
