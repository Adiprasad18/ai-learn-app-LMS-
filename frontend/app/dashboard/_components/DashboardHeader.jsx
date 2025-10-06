"use client"

import { UserButton } from '@clerk/nextjs'
import { Menu, Bell, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeModeToggle from '@/components/ui/theme-mode-toggle'
import React, { useState } from 'react'

function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-muted transition-all duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200 rounded-lg h-10"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted transition-all duration-200 rounded-lg"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full"></span>
          </Button>

          <ThemeModeToggle />

          <div className="h-8 w-px bg-border mx-1"></div>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
