import { useMemo } from "react"
import { useReducedMotion } from "framer-motion"

export function useMotionPreferences() {
  const prefersReducedMotion = useReducedMotion()

  return useMemo(
    () => ({
      prefersReducedMotion,
      maybeReduce: (variants) => {
        if (!prefersReducedMotion) return variants

        if (!variants) {
          return {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }
        }

        if (typeof variants === "function") {
          const resolved = variants({ delay: 0 })
          return {
            ...resolved,
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }
        }

        if (typeof variants.visible === "function") {
          return {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }
        }

        return {
          ...variants,
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }
      },
    }),
    [prefersReducedMotion]
  )
}