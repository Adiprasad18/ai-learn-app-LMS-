import React from "react"

import { cn } from "@/lib/utils"

const sizeMap = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-[92rem]",
}

export default function Container({
  as: Component = "div",
  size = "default",
  className,
  children,
  ...rest
}) {
  const maxWidth = sizeMap[size] ?? sizeMap.default
  return (
    <Component
      className={cn(
        "layout-shell w-full px-6 py-0 md:px-10 lg:px-12",
        maxWidth,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}