"use client"

import "@/lib/safe-storage"
import "./globals.css"
import { AppShell } from "@/components/layout/AppShell"
import { usePathname } from "next/navigation"

const noSidebarPaths = ["/login", "/register", "/"]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showSidebar = !noSidebarPaths.includes(pathname)

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        {showSidebar ? (
          <AppShell>{children}</AppShell>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  )
}
