"use client"

import { Mic, Globe, Music, Zap, Brain, Shield, Gauge, Layers } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Bark TTS",
    description: "100+ voices across 13 languages. Generate music, sound effects, and emotional speech with MIT-licensed open-source AI.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "Coqui TTS",
    description: "1100+ languages supported. Clone any voice with just a few seconds of audio using XTTS v2 technology.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Mic,
    title: "GPT-SoVITS",
    description: "Few-shot voice cloning. Create custom voices from just 1 minute of reference audio. Perfect for Chinese, English, and Japanese.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "13+ Languages",
    description: "English, Hindi, Spanish, French, German, Japanese, Korean, Chinese, and more. Each with native-quality voices.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Music,
    title: "Voice Cloning",
    description: "Upload a reference audio and clone any voice. Create personalized AI voices for your content.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "100% Open Source",
    description: "No API keys needed. No vendor lock-in. Run locally or on your own server. Your data stays private.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Gauge,
    title: "Fast Generation",
    description: "GPU-accelerated inference. Generate 10+ seconds of audio in under 5 seconds with optimized models.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Layers,
    title: "Multiple Engines",
    description: "Choose the best engine for your use case. Bark for variety, Coqui for quality, GPT-SoVITS for cloning.",
    color: "from-teal-500 to-cyan-500",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Everything You Need for
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Voice AI</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Three powerful open-source TTS engines, 100+ voices, and unlimited possibilities.
            All running on your own infrastructure.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color}`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
