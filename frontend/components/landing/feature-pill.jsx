"use client"

import React from "react"
import { motion } from "framer-motion"

import { useMotionPreferences } from "@/lib/motion"

const baseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export default function FeaturePill({ icon, label, delay = 0 }) {
  const { prefersReducedMotion } = useMotionPreferences()

  if (prefersReducedMotion) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 font-medium text-foreground/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        {icon}
        {label}
      </span>
    )
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={baseVariants}
      transition={{ ...baseVariants.visible.transition, delay }}
      className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 font-medium text-foreground/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70"
    >
      {icon}
      {label}
    </motion.span>
  )
}