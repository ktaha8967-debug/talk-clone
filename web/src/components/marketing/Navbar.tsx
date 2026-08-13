"use client"

import Link from "next/link"
import { Mic, Menu, X, MessageCircle } from "lucide-react"
import { useState } from "react"

const WHATSAPP_NUMBER = "+923283224277"

function getWhatsAppUrl() {
  const message = encodeURIComponent(
    "Hi! I want to purchase VoiceStudio AI. Please share the pricing details."
  )
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${message}`
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">VoiceStudio<span className="text-purple-400">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-green-500/50 px-4 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-blue-500 transition-all">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="#features" className="text-gray-400 hover:text-white">Features</Link>
            <Link href="#how-it-works" className="text-gray-400 hover:text-white">How it Works</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link>
            <Link href="#faq" className="text-gray-400 hover:text-white">FAQ</Link>
            <hr className="border-white/10" />
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-green-500/50 px-4 py-2 text-green-400 hover:bg-green-500/10"
            >
              <MessageCircle className="h-4 w-4" />
              Contact on WhatsApp
            </a>
            <Link href="/login" className="text-gray-400 hover:text-white">Login</Link>
            <Link href="/register" className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-center font-medium text-white">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
