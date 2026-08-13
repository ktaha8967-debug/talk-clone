"use client"

import Link from "next/link"
import { Mic, Globe, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "+923283224277"

function getWhatsAppUrl() {
  const message = encodeURIComponent(
    "Hi! I need support for VoiceStudio AI."
  )
  return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${message}`
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VoiceStudio<span className="text-purple-400">AI</span></span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              AI-powered voice generation platform. Open-source, privacy-first.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="https://voicestudio.ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-sm text-gray-400 hover:text-white">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="/login" className="text-sm text-gray-400 hover:text-white">Login</Link></li>
              <li><Link href="/register" className="text-sm text-gray-400 hover:text-white">Sign Up</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">API Reference</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Voice Library</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Support
                </a>
              </li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Email Us</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="/admin" className="text-sm text-gray-400 hover:text-purple-400">Admin Panel</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} VoiceStudio AI. All rights reserved. Built with open-source AI.
          </p>
        </div>
      </div>
    </footer>
  )
}
