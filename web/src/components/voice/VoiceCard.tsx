"use client"

import { Star, Play, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceCardProps {
  voice: {
    id: number
    name: string
    reference_file: string
    duration_seconds: number
    language?: string
    is_favorite: boolean
    created_at: string
  }
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
  onSelect?: (voice: { id: number; name: string }) => void
}

export function VoiceCard({ voice, onToggleFavorite, onDelete, onSelect }: VoiceCardProps) {

  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-white/10">
      {/* Waveform visual */}
      <div className="mb-3 flex h-12 items-end gap-[2px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-purple-500/50"
            style={{ height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 20}%` }}
          />
        ))}
      </div>

      {/* Info */}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white">{voice.name}</h3>
        <p className="text-xs text-gray-500">
          {voice.duration_seconds.toFixed(1)}s
          {voice.language && ` • ${voice.language}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSelect?.(voice)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleFavorite(voice.id)}
          >
            <Star
              className={`h-4 w-4 ${voice.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-gray-500"}`}
            />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-500"
          onClick={() => onDelete(voice.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
