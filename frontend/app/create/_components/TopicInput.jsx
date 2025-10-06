import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function TopicInput({setTopic, setDifficultyLevel}) {
  return (
    <div className="mt-10 w-full flex flex-col gap-4">
      <h2 className="font-semibold">Enter topic or paste the content for which you need to generate study material</h2>
      <Textarea placeholder="Start writing here" className="mt-2 w-full" onChange={(event)=>setTopic(event.target.value)}/>

      <h2 className="mt-5 mb-3">Select the difficulty level</h2>

      <Select onValueChange={(value)=>setDifficultyLevel(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Difficulty Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default TopicInput
