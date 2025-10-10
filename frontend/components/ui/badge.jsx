import * as React from "react"

import { cn } from "@/shared/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        variant === "outline"
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-transparent bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
