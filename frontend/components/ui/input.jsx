import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border/40 dark:border-border/20 bg-background/50 dark:bg-background/30 backdrop-blur-sm px-4 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:border-primary/50 dark:focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 hover:border-border/60 dark:hover:border-border/30 hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/20",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }