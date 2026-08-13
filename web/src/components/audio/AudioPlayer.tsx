"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Download, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioPlayerProps {
  src: string
  onDownload?: () => void
}

export function AudioPlayer({ src, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setCurrentTime(Number(e.target.value))
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = Number(e.target.value)
    setVolume(Number(e.target.value))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform placeholder */}
      <div className="mb-4 flex h-16 items-center justify-center gap-[2px]">
        {Array.from({ length: 50 }).map((_, i) => {
          const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10
          const progress = duration > 0 ? currentTime / duration : 0
          const isActive = i / 50 <= progress
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                isActive ? "bg-purple-500" : "bg-white/20"
              }`}
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <span className="text-xs text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolume}
            className="w-20 cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500"
          />
        </div>

        <Button variant="ghost" size="icon" onClick={onDownload}>
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
