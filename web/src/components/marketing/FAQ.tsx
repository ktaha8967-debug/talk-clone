"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What AI models do you use?",
    answer: "We use three powerful open-source TTS models: Bark (by Suno), Coqui TTS, and GPT-SoVITS. All models are free to use and run on our infrastructure.",
  },
  {
    question: "Do I need my own GPU?",
    answer: "No! All processing happens on our servers. You just need a web browser to use VoiceStudio AI. We handle all the GPU compute for you.",
  },
  {
    question: "How many voices are available?",
    answer: "We offer 100+ AI voices across 13 languages including English, Hindi, Spanish, French, German, Japanese, Korean, Chinese, and more.",
  },
  {
    question: "Can I clone my own voice?",
    answer: "Yes! With our Pro plan, you can upload a reference audio (just 30 seconds) and clone any voice. Our GPT-SoVITS and Coqui engines support voice cloning.",
  },
  {
    question: "What languages are supported?",
    answer: "We support 13+ languages: English, Hindi, Spanish, French, German, Japanese, Korean, Chinese, Portuguese, Italian, Polish, Russian, and Turkish.",
  },
  {
    question: "Is there an API available?",
    answer: "Yes! Pro and Enterprise plans include full API access. Integrate voice generation into your apps, websites, or workflows.",
  },
  {
    question: "Can I use the generated audio commercially?",
    answer: "Yes! All our TTS engines are open-source with permissive licenses (MIT, MPL-2.0). You own the generated audio and can use it commercially.",
  },
  {
    question: "What's the quality like?",
    answer: "Our AI models generate ultra-realistic speech that's nearly indistinguishable from human voices. Quality varies by engine - Bark for variety, Coqui for naturalness, GPT-SoVITS for cloning accuracy.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-white/5">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Frequently Asked
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-gray-400">
            Everything you need to know about VoiceStudio AI.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-black/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
