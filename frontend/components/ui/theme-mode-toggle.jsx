'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export default function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Sun className="h-5 w-5 relative z-10" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl relative group hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 dark:group-hover:from-primary/20 dark:group-hover:to-accent/20 rounded-xl transition-all duration-300" />
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 relative z-10 group-hover:rotate-180 group-hover:scale-110" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 relative z-10 group-hover:-rotate-12 group-hover:scale-110" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}