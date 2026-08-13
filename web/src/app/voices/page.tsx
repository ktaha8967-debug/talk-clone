"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Music, Star, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VoiceCard } from "@/components/voice/VoiceCard"
import { api } from "@/lib/api"

export default function VoicesPage() {
  const [voices, setVoices] = useState<Array<{ id: number; name: string; reference_file: string; duration_seconds: number; language?: string; is_favorite: boolean; created_at: string }>>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "favorites">("all")

  const loadVoices = useCallback(() => {
    api
      .getVoices(filter === "favorites", search || undefined)
      .then(setVoices)
      .catch(() => setVoices([]))
  }, [filter, search])

  useEffect(() => {
    loadVoices()
  }, [loadVoices])

  const handleToggleFavorite = async (id: number) => {
    const voice = voices.find((v) => v.id === id)
    if (voice) {
      await api.updateVoice(id, { is_favorite: !voice.is_favorite })
      loadVoices()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Delete this voice?")) {
      await api.deleteVoice(id)
      loadVoices()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-black to-purple-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Voice Library</h1>
            <p className="mt-1 text-gray-400">Manage your cloned voices</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Music className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{voices.length} voice{voices.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search voices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("favorites")}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" />
            Favorites
          </Button>
        </div>
      </div>

      {/* Voice Grid */}
      {voices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Sparkles className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-400">
              {filter === "favorites" ? "No favorite voices" : "No voices yet"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "favorites"
                ? "Star voices to add them to favorites"
                : "Upload a reference audio to clone a voice"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {voices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
