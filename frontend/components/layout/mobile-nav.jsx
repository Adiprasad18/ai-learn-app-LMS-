"use client"

import React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { primaryNav, secondaryNav } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import ThemeModeToggle from "@/components/ui/theme-mode-toggle"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const closeMenu = () => setOpen(false)

  React.useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation"
        className="rounded-full border border-transparent bg-white/60 shadow-sm backdrop-blur transition hover:border-foreground/20 hover:bg-white"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-xl transition">
          <div className="flex items-center justify-between px-6 py-6">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              className="rounded-full"
              onClick={closeMenu}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 pb-10">
            <ul className="flex flex-col gap-2">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/70 px-4 py-4 text-base font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/90 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-900/90"
                    onClick={closeMenu}
                  >
                    <span>{link.label}</span>
                    {link.badge ? (
                      <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground shadow-sm">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-3">
              {secondaryNav.map((action) => (
                <Button
                  key={action.href}
                  asChild
                  variant={action.intent === "primary" ? "default" : "ghost"}
                  className={cn(
                    "h-12 rounded-2xl border border-transparent bg-gradient-to-r from-primary/90 to-primary shadow-sm hover:from-primary hover:to-primary/90",
                    action.intent === "primary"
                      ? "text-primary-foreground"
                      : "border-foreground/10 bg-white/75 text-foreground hover:border-primary/30 hover:bg-white"
                  )}
                  onClick={closeMenu}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/70 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div>
                <p className="text-sm font-semibold text-foreground/80">Theme</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark</p>
              </div>
              <ThemeModeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  )
}