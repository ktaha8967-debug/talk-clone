"use client"

import Link from "next/link"
import { Sparkles, Play, ArrowRight, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "+923283224277"

function getWhatsAppUrl() {
  const message = encodeURIComponent(
    "Hi! I want to purchase VoiceStudio AI. Please share the pricing details."
  )
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${message}`
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[128px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-300">Powered by Open-Source AI</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
          AI-Powered Voice
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Generation Studio
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
          Generate ultra-realistic speech with 100+ voices across 13 languages.
          Clone voices, create podcasts, and more — all with open-source AI models.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-500 hover:to-green-400 hover:shadow-green-500/40 transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            Contact on WhatsApp to Buy
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/5 transition-all"
          >
            <Play className="h-5 w-5" />
            Watch Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-16">
          <div>
            <p className="text-4xl font-bold text-white">100+</p>
            <p className="text-gray-400">AI Voices</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">13</p>
            <p className="text-gray-400">Languages</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">3</p>
            <p className="text-gray-400">TTS Engines</p>
          </div>
        </div>
      </div>
    </section>
  )
}
