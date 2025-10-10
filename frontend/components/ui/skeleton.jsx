import * as React from "react"

import { cn } from "@/shared/utils"

const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-neutral-200/70", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
