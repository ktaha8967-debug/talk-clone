"use client"

import { Check, Zap, Crown, Building2, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "+923283224277"

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individuals getting started",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    features: [
      "500 generations/month",
      "Bark TTS engine",
      "100+ AI voices",
      "13 languages",
      "WAV download",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For content creators and professionals",
    icon: Crown,
    color: "from-purple-500 to-blue-500",
    features: [
      "1,500 generations/month",
      "All 3 TTS engines",
      "Voice cloning",
      "Priority generation",
      "WAV + MP3 download",
      "API access",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    description: "For teams and businesses",
    icon: Building2,
    color: "from-orange-500 to-red-500",
    features: [
      "Unlimited generations",
      "All 3 TTS engines",
      "Advanced voice cloning",
      "5 concurrent requests",
      "All export formats",
      "Full API access",
      "Custom voice training",
      "Dedicated support",
      "White-label option",
    ],
    popular: false,
  },
]

function getWhatsAppUrl(planName: string) {
  const message = encodeURIComponent(
    `Hi! I want to purchase the ${planName} plan for VoiceStudio AI. Please share the payment details.`
  )
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${message}`
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Simple
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Choose the plan that fits your needs. Contact us on WhatsApp to get started.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? "border-purple-500 bg-gradient-to-b from-purple-500/10 to-transparent scale-105"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${plan.color}`}>
                <plan.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>

              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* WhatsApp CTA Button */}
              <a
                href={getWhatsAppUrl(plan.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 flex items-center justify-center gap-2 w-full rounded-xl py-3 font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/25"
                    : "border border-green-500/50 text-green-400 hover:bg-green-500/10"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                Contact on WhatsApp to Buy
              </a>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Instant activation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
