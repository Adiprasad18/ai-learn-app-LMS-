import { motionTimings } from "./constants"

export const heroVariants = {
  container: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionTimings.duration.sm,
        ease: motionTimings.ease.outExpo,
      },
    },
  },
  child: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionTimings.duration.md,
        ease: motionTimings.ease.emphasized,
      },
    },
  },
  media: {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: motionTimings.duration.lg,
        ease: motionTimings.ease.outExpo,
      },
    },
  },
}