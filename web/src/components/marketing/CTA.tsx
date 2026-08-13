"use client"

import { ArrowRight, Sparkles, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "+923283224277"

function getWhatsAppUrl() {
  const message = encodeURIComponent(
    "Hi! I want to learn more about VoiceStudio AI and purchase a plan. Please share the details."
  )
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${message}`
}

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 via-black to-blue-900/50 p-12 md:p-16">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />

          <div className="relative z-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300">Start generating in seconds</span>
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Ready to Create
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Amazing Voice Content?
              </span>
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
              Join thousands of creators using VoiceStudio AI to generate professional
              voiceovers, podcasts, audiobooks, and more.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-500 hover:to-green-400 hover:shadow-green-500/40 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Contact on WhatsApp
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#pricing"
                className="rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/5 transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
