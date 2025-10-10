import React, { useState, useEffect } from "react"
import Image from "next/image"

import { Skeleton } from "@/components/ui/skeleton"

const optionsConfig = [
  { name: "exam", label: "Exam", icon: "/exam_1.png" },
  { name: "job_interview", label: "Job Interview", icon: "/job.png" },
  { name: "practice", label: "Practice", icon: "/practice.png" },
  { name: "coding", label: "Coding Prep", icon: "/code.png" },
  { name: "other", label: "Other", icon: "/knowledge.png" },
]

function SelectOptions({ value, selectedStudyType, loading }) {
  const [selectedOption, setSelectedOption] = useState(value || null)
  const [isImageLoading, setIsImageLoading] = useState({})

  useEffect(() => {
    setSelectedOption(value || null)
  }, [value])

  const handleSelect = (option) => {
    setSelectedOption(option.name)
    selectedStudyType(option.name)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          What are you preparing for?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the study experience that matches your outcome.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        {optionsConfig.map((option) => {
          const isSelected = option.name === selectedOption
          const imageLoading = isImageLoading[option.name]

          return (
            <button
              key={option.name}
              type="button"
              className={`group relative flex flex-col items-center justify-center rounded-lg border bg-card p-5 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              } ${loading ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => handleSelect(option)}
              aria-pressed={isSelected}
              aria-label={`Select ${option.label}`}
            >
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-primary/10 dark:bg-primary/20">
                {imageLoading && <Skeleton className="h-full w-full" />}
                <Image
                  src={option.icon}
                  alt={option.label}
                  width={64}
                  height={64}
                  className={`transition-opacity ${imageLoading ? "opacity-0" : "opacity-100"}`}
                  onLoadingComplete={() =>
                    setIsImageLoading((prev) => ({ ...prev, [option.name]: false }))
                  }
                  onLoad={() =>
                    setIsImageLoading((prev) => ({ ...prev, [option.name]: true }))
                  }
                />
              </div>
              <span className="mt-3 text-sm font-medium text-foreground">
                {option.label}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {labelHelper(option.name)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function labelHelper(option) {
  switch (option) {
    case "exam":
      return "High-stakes testing";
    case "job_interview":
      return "Interview prep";
    case "practice":
      return "Sharpen skills";
    case "coding":
      return "Hands-on coding";
    default:
      return "Custom learning";
  }
}

export default SelectOptions
