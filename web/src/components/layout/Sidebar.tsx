"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Mic, Music, FileText, History,
  Sparkles, LogOut, Shield, Film,
} from "lucide-react"
import { useEffect, useState } from "react"

interface UserData {
  username?: string
  email?: string
  tier?: string
  monthly_usage?: number
  usage_limit?: number
  is_admin?: boolean
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate Video", icon: Film },
  { href: "/tts", label: "Voice Studio", icon: Sparkles },
  { href: "/upload", label: "Clone Voice", icon: Mic },
  { href: "/voices", label: "Voice Library", icon: Music },
  { href: "/transcribe", label: "Transcribe", icon: FileText },
  { href: "/history", label: "History", icon: History },
]

const adminItems = [
  { href: "/admin", label: "Admin Panel", icon: Shield },
]

export function Sidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapse?.(next)
  }

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const usagePercent = user
    ? Math.min(100, ((user.monthly_usage ?? 0) / ((user.usage_limit ?? 500) === -1 ? 100 : (user.usage_limit ?? 500))) * 100)
    : 0

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
            <Mic className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              Voice<span className="text-purple-400">Studio</span>
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className="ml-auto rounded p-1 text-gray-500 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              }
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2">
            {!collapsed && <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Main</p>}
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white shadow-lg shadow-purple-500/10"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-purple-400")} />
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </div>

          {user?.is_admin && (
            <div className="mt-4">
              {!collapsed && <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Administration</p>}
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-white shadow-lg shadow-amber-500/10"
                        : "text-amber-400/70 hover:bg-white/5 hover:text-amber-400"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-amber-400")} />
                    {!collapsed && item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Usage Bar */}
        {user && !collapsed && (
          <div className="mx-3 mb-3 rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400">Usage</span>
              <span className="text-gray-500">
                {user.monthly_usage ?? 0}/{user.usage_limit === -1 ? "∞" : user.usage_limit}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="border-t border-white/10 p-3">
          {user ? (
            <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
              {!collapsed && (
                <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600">
                    <span className="text-xs font-medium text-white">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] font-medium capitalize",
                        user.tier === "pro" ? "text-yellow-400" :
                        user.tier === "enterprise" ? "text-orange-400" :
                        "text-gray-500"
                      )}>
                        {user.tier}
                      </span>
                      {user.is_admin && (
                        <span className="text-[10px] font-medium text-amber-400">Admin</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 mx-auto">
                  <span className="text-xs font-medium text-white">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? "Sign Out" : undefined}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && "Sign Out"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              {!collapsed ? "Sign In" : <Mic className="h-4 w-4" />}
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
