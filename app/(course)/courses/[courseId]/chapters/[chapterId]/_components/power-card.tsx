"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Power {
  id: string
  name: string
  description: string
  image: string
}

interface PowerCardProps {
  power: Power
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
}

export default function PowerCard({ power, isSelected, isDisabled, onToggle }: PowerCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className={cn("relative h-[250px] perspective-1000 cursor-pointer", isDisabled && "opacity-50 cursor-not-allowed")}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "absolute w-full h-full transition-all duration-500 transform-style-preserve-3d",
          isFlipped ? "rotate-y-180" : "",
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute w-full h-full backface-hidden border rounded-lg flex flex-col items-center justify-center p-4",
            isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 mb-2 rounded-full flex items-center justify-center",
              isSelected ? "grayscale-0" : "grayscale",
            )}
          >
            <img src={power.image || "/placeholder.svg"} alt={power.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-medium text-center">{power.name}</h3>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="mt-2"
            onClick={(e) => {
              e.stopPropagation()
              if (!isDisabled) onToggle()
            }}
            disabled={isDisabled}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 border rounded-lg bg-gray-50 p-4 flex flex-col">
          <h3 className="font-medium mb-2">{power.name}</h3>
          <p className="text-sm text-gray-600 flex-grow">{power.description}</p>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="mt-2 self-center"
            onClick={(e) => {
              e.stopPropagation()
              if (!isDisabled) onToggle()
            }}
            disabled={isDisabled}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  )
}
