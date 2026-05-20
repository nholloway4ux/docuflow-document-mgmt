"use client"

import { version } from "@/package.json"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useState } from "react"
import Image from "next/image"
import { Upload, Settings, Library, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Library", href: "/admin", icon: Library },
  { label: "Upload", href: "/admin?tab=upload", icon: Upload },
  { label: "Settings", href: "/admin?tab=settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="w-60 shrink-0 bg-sidebar flex flex-col border-r border-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Image
          src="/docuflow-logo.svg"
          alt="DocuFlow"
          width={120}
          height={21}
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin" && !href.includes("?")
              : pathname + (typeof window !== "undefined" ? window.location.search : "") === href

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-secondary-foreground" : "text-muted-foreground"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Version */}
      <div className="px-5 py-3">
        <p className="text-xs text-muted-foreground">version {version}</p>
      </div>

      {/* Bottom — logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isLoggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    </aside>
  )
}
