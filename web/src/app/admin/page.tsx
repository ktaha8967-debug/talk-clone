"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Users, Shield, Search,
  UserPlus, Trash2, Ban, Check, RefreshCw, Loader2,
  BarChart3, AlertTriangle, Eye, EyeOff,
  ArrowLeft, ShieldCheck, UserX, Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { api, getUser } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  tier: string
  monthly_usage: number
  usage_limit: number
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface Stats {
  total_users: number
  active_users: number
  suspended_users: number
  admin_users: number
  tier_distribution: Record<string, number>
  total_generations: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", tier: "starter" })

  // Check if already logged in as admin
  useEffect(() => {
    const user = getUser()
    if (user?.is_admin) {
      setIsAuthenticated(true)
      setShowLogin(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const res = await api.login(email, password)
      if (!res.user?.is_admin) {
        setLoginError("This account does not have admin access")
        setLoginLoading(false)
        return
      }
      localStorage.setItem("token", res.access_token)
      localStorage.setItem("user", JSON.stringify(res.user))
      setIsAuthenticated(true)
      setShowLogin(false)
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoginLoading(false)
    }
  }

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats()
      setStats(data)
    } catch { /* ignore */ }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAdminUsers(currentPage, search || undefined, filterTier || undefined, filterStatus || undefined)
      setUsers(data.users)
      setTotalPages(data.pages)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [currentPage, search, filterTier, filterStatus])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
      loadUsers()
    }
  }, [isAuthenticated, loadStats, loadUsers])

  const handleUpdateUser = async (userId: number, data: { tier?: string; is_active?: boolean; is_admin?: boolean }) => {
    setActionLoading(userId)
    try {
      await api.adminUpdateUser(userId, data)
      loadUsers()
      loadStats()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Delete this user permanently?")) return
    setActionLoading(userId)
    try {
      await api.adminDeleteUser(userId)
      loadUsers()
      loadStats()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.adminCreateUser(newUser)
      setShowCreateModal(false)
      setNewUser({ username: "", email: "", password: "", tier: "starter" })
      loadUsers()
      loadStats()
    } catch { /* ignore */ }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise": return "text-orange-400 bg-orange-500/20"
      case "pro": return "text-yellow-400 bg-yellow-500/20"
      default: return "text-gray-400 bg-gray-500/20"
    }
  }

  // Login Screen
  if (showLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative z-10 w-full max-w-md">
          <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400">Secure administrator login</p>
          </div>
          <Card>
            <CardContent className="p-8">
              {loginError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="admin@voicestudio.ai"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 py-3 font-semibold text-white hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  {loginLoading ? "Authenticating..." : "Sign In to Admin"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">Manage users, subscriptions, and platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadStats(); loadUsers() }}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="hover:border-purple-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-green-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active_users}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/20">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-red-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Suspended</p>
                  <p className="text-2xl font-bold text-red-400">{stats.suspended_users}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/20">
                  <UserX className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-amber-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Admins</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.admin_users}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-blue-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Generations</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.total_generations}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tier Distribution */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              Subscription Distribution
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {["starter", "pro", "enterprise"].map((tier) => {
                const count = stats.tier_distribution[tier] || 0
                const pct = stats.total_users > 0 ? (count / stats.total_users) * 100 : 0
                return (
                  <div key={tier} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 capitalize">{tier}</span>
                      <span className="text-lg font-bold text-white">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          tier === "enterprise" ? "bg-orange-500" :
                          tier === "pro" ? "bg-yellow-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{pct.toFixed(0)}% of users</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters + Table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search users..."
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => { setFilterTier(e.target.value); setCurrentPage(1) }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
            >
              <option value="" className="bg-gray-900">All Tiers</option>
              <option value="starter" className="bg-gray-900">Starter</option>
              <option value="pro" className="bg-gray-900">Pro</option>
              <option value="enterprise" className="bg-gray-900">Enterprise</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
            >
              <option value="" className="bg-gray-900">All Status</option>
              <option value="active" className="bg-gray-900">Active</option>
              <option value="suspended" className="bg-gray-900">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-sm font-medium text-purple-400">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">User</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.tier}
                          onChange={(e) => handleUpdateUser(user.id, { tier: e.target.value })}
                          disabled={actionLoading === user.id}
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${getTierColor(user.tier)} border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer`}
                        >
                          <option value="starter" className="bg-gray-900">Starter</option>
                          <option value="pro" className="bg-gray-900">Pro</option>
                          <option value="enterprise" className="bg-gray-900">Enterprise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs text-white">{user.monthly_usage}/{user.usage_limit === -1 ? "∞" : user.usage_limit}</p>
                          <div className="mt-1 h-1 w-16 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                              style={{ width: `${Math.min(100, (user.monthly_usage / (user.usage_limit || 500)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                            disabled={actionLoading === user.id}
                            className={`rounded-lg p-1.5 transition-colors ${
                              user.is_active
                                ? "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                                : "text-gray-400 hover:bg-green-500/20 hover:text-green-400"
                            }`}
                            title={user.is_active ? "Suspend" : "Activate"}
                          >
                            {user.is_active ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleUpdateUser(user.id, { is_admin: !user.is_admin })}
                            disabled={actionLoading === user.id}
                            className={`rounded-lg p-1.5 transition-colors ${
                              user.is_admin
                                ? "text-amber-400 hover:bg-amber-500/20"
                                : "text-gray-400 hover:bg-amber-500/20 hover:text-amber-400"
                            }`}
                            title={user.is_admin ? "Remove Admin" : "Make Admin"}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Tier</label>
                <select
                  value={newUser.tier}
                  onChange={(e) => setNewUser({ ...newUser, tier: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white"
                >
                  <option value="starter" className="bg-gray-900">Starter</option>
                  <option value="pro" className="bg-gray-900">Pro</option>
                  <option value="enterprise" className="bg-gray-900">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 font-medium text-white hover:from-purple-500 hover:to-blue-500 transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
