"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { primaryNav, secondaryNav } from "@/lib/navigation"
import Container from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import ThemeModeToggle from "@/components/ui/theme-mode-toggle"
import MobileNav from "@/components/layout/mobile-nav"
import { cn } from "@/lib/utils"

export default function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 12)
    }
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex w-full flex-col">
      <div
        className={cn(
          "relative mx-auto mt-4 w-[min(94%,_1120px)] border border-border bg-background/95 px-4 py-3 backdrop-blur-sm transition-all duration-300 ease-out rounded-2xl",
          scrolled && "shadow-md scale-[0.99]"
        )}
      >
        <Container className="relative z-10 flex items-center justify-between gap-4 px-0">
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm font-semibold text-foreground"
            aria-label="AI Learn home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 dark:bg-primary/20 transition-all duration-200 group-hover:bg-primary/15 dark:group-hover:bg-primary/25">
              <Image src="/logo.svg" alt="AI Learn logo" fill className="object-contain p-2" priority />
            </span>
            <span className="text-lg font-bold text-primary dark:text-primary tracking-tight">AI Learn</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  pathname === link.href 
                    ? "text-primary dark:text-primary bg-primary/10 dark:bg-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
                {link.badge ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 dark:bg-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeModeToggle />
            {secondaryNav.map((action) => (
              <Button
                key={action.href}
                variant={action.intent === "primary" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-lg px-5 text-sm font-semibold transition-all duration-200",
                  action.intent === "primary"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                    : "hover:bg-muted dark:hover:bg-muted hover:text-foreground"
                )}
                asChild
              >
                <Link href={action.href}>
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>

          <MobileNav />
        </Container>
      </div>
    </header>
  )
}