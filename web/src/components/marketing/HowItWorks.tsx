"use client"

import { Pen, Mic, Download, ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Pen,
    title: "Write Your Script",
    description: "Type or paste any text you want to convert to speech. Use special tags like [laughs] or [music] for emotion.",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "02",
    icon: Mic,
    title: "Choose Voice & Style",
    description: "Select from 100+ AI voices across 13 languages. Pick a speaking style that matches your content.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "03",
    icon: Download,
    title: "Generate & Download",
    description: "Click generate and get high-quality audio in seconds. Download as WAV or MP3 for your projects.",
    color: "from-green-500 to-emerald-500",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white/5">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            How It
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Three simple steps to create professional AI-generated speech.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-full bg-gradient-to-r from-white/20 to-transparent md:block" />
              )}

              <div className="relative rounded-2xl border border-white/10 bg-black/50 p-8 text-center">
                {/* Step Number */}
                <div className="mb-4 text-5xl font-bold text-white/10">{step.step}</div>
                
                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.color}`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                  <ArrowRight className="h-8 w-8 text-purple-500/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
