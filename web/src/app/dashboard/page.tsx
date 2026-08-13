"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Mic, Music, FileText, Sparkles, ArrowRight, Clock,
  Zap, Brain, Mic2, Crown, TrendingUp, Play, Star, Film,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

interface UserData {
  username?: string
  email?: string
  tier?: string
  monthly_usage?: number
  usage_limit?: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState({ voices: 0, generations: 0 })
  const [recentHistory, setRecentHistory] = useState<Array<{ id: number; script?: string; created_at: string; status: string }>>([])

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    api.getVoices().then((v) => setStats((s) => ({ ...s, voices: v.length || 0 }))).catch(() => {})
    api.getHistory(1, 5).then((h) => setRecentHistory(h || [])).catch(() => {})
  }, [])

  const usagePercent = user
    ? Math.min(100, ((user.monthly_usage ?? 0) / ((user.usage_limit ?? 500) === -1 ? 100 : (user.usage_limit ?? 500))) * 100)
    : 0

  const tierLabel = user?.tier === "enterprise" ? "Enterprise" : user?.tier === "pro" ? "Pro" : "Starter"
  const tierColor = user?.tier === "enterprise" ? "text-orange-400 bg-orange-500/20 border-orange-500/30"
    : user?.tier === "pro" ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
    : "text-purple-400 bg-purple-500/20 border-purple-500/30"

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back{user?.username ? `, ${user.username}` : ""} 👋
              </h1>
              <p className="mt-2 text-gray-400">Your AI voice studio at a glance</p>
            </div>
            {user && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tierColor}`}>
                <Crown className="h-3.5 w-3.5" />
                {tierLabel} Plan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Usage Section */}
      {user && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Monthly Usage</h2>
              <span className="text-xs text-gray-500">
                Resets every month
              </span>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-3xl font-bold text-white">
                {user.monthly_usage ?? 0}
              </div>
              <div className="mb-1 text-sm text-gray-400">
                / {user.usage_limit === -1 ? "Unlimited" : user.usage_limit} generations
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{Math.round(usagePercent)}% used</span>
              <span>{user.usage_limit === -1 ? "Unlimited" : `${(user.usage_limit ?? 500) - (user.monthly_usage ?? 0)} remaining`}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Voice Library</p>
                <p className="text-2xl font-bold text-white">{stats.voices}</p>
                <p className="mt-1 text-xs text-gray-500">Cloned voices</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Music className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Generations</p>
                <p className="text-2xl font-bold text-white">{stats.generations}</p>
                <p className="mt-1 text-xs text-gray-500">Audio created</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-green-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Languages</p>
                <p className="text-2xl font-bold text-white">13+</p>
                <p className="mt-1 text-xs text-gray-500">Supported languages</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <Star className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-orange-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Voice Styles</p>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="mt-1 text-xs text-gray-500">Speaking styles</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <Sparkles className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/generate">
            <Card className="group cursor-pointer border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5 hover:border-violet-500/50 hover:from-violet-500/10 hover:to-purple-500/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20">
                  <Film className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Generate Video</h3>
                <p className="mt-1 text-xs text-gray-500">Create videos from text scripts</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Creating <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tts">
            <Card className="group cursor-pointer border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:border-purple-500/50 hover:from-purple-500/10 hover:to-pink-500/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Voice Studio</h3>
                <p className="mt-1 text-xs text-gray-500">Generate ultra-realistic speech</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Studio <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/upload">
            <Card className="group cursor-pointer border-white/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-green-500/50 hover:from-green-500/10 hover:to-emerald-500/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/20">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Clone a Voice</h3>
                <p className="mt-1 text-xs text-gray-500">Upload reference audio to clone</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Upload Now <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/transcribe">
            <Card className="group cursor-pointer border-white/10 bg-gradient-to-br from-orange-500/5 to-red-500/5 hover:border-orange-500/50 hover:from-orange-500/10 hover:to-red-500/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Transcribe Audio</h3>
                <p className="mt-1 text-xs text-gray-500">Convert speech to text</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Transcribing <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/voices">
            <Card className="group cursor-pointer border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-blue-500/50 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Voice Library</h3>
                <p className="mt-1 text-xs text-gray-500">Manage your cloned voices</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Library <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Two Column: Engines + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Available Engines */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-white">Voice Engines</h2>
          <div className="space-y-3">
            <Link href="/tts">
              <Card className="group cursor-pointer border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">100+ Voices</p>
                    <p className="text-xs text-gray-500">13 languages, music & effects</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/tts">
              <Card className="group cursor-pointer border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">1100+ Languages</p>
                    <p className="text-xs text-gray-500">Voice cloning, high quality</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/tts">
              <Card className="group cursor-pointer border-white/10 hover:border-green-500/50 hover:bg-white/5 transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Mic2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Few-Shot Cloning</p>
                    <p className="text-xs text-gray-500">Fast inference, custom voices</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-green-400 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            {recentHistory.length > 0 && (
              <Link href="/history" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View All →
              </Link>
            )}
          </div>
          <Card>
            <CardContent className="p-6">
              {recentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <Play className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium">No generations yet</p>
                  <p className="mt-1 text-sm text-gray-500">Create your first voice to get started</p>
                  <Link
                    href="/tts"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-blue-500 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Start Generating
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentHistory.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-white">{item.script?.slice(0, 80)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "completed" ? "bg-green-500/20 text-green-400" :
                        item.status === "processing" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
