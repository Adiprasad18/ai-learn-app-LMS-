"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

import { useMotionPreferences } from "@/lib/motion/preferences"
import { floatingPillAnimation } from "@/lib/motion/floating-pill"
import { heroVariants } from "@/lib/motion/variants"

const DEFAULT_VIEWPORT = Object.freeze({ once: true, margin: "-120px" })

/**
 * Motion wrappers for the landing hero section.
 * Consumed by `app/page.js` to keep layout markup clean.
 */
export function HeroMotionContainer({ delay = 0, children, className }) {
  const { maybeReduce } = useMotionPreferences()
  const variants = useMemo(
    () => maybeReduce(heroVariants.container),
    [maybeReduce]
  )

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={DEFAULT_VIEWPORT}
      custom={delay}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HeroMotionItem({ delay = 0, children, className }) {
  const { maybeReduce } = useMotionPreferences()
  const variants = useMemo(() => maybeReduce(heroVariants.child), [maybeReduce])

  return (
    <motion.div custom={delay} variants={variants} className={className}>
      {children}
    </motion.div>
  )
}

export function HeroMediaMotion({ delay = 0, children, className }) {
  const { maybeReduce } = useMotionPreferences()
  const variants = useMemo(() => maybeReduce(heroVariants.media), [maybeReduce])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={DEFAULT_VIEWPORT}
      custom={delay}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FloatingPillMotion({ children, className }) {
  const { prefersReducedMotion } = useMotionPreferences()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      {...floatingPillAnimation}
      className={className}
    >
      {children}
    </motion.div>
  )
}