"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-64"}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
