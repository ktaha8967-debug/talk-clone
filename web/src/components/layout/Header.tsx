"use client"

import { Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">AI Voice Studio</h1>
        <p className="text-xs text-gray-500">Clone voices, generate speech, transcribe audio</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
