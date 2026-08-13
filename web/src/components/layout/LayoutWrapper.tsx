"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"

const marketingRoutes = ["/", "/login", "/register", "/pricing"]
const adminRoutes = ["/admin"]

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMarketing = marketingRoutes.includes(pathname)
  const isAdmin = adminRoutes.some(route => pathname.startsWith(route))

  if (isMarketing || isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </>
  )
}
