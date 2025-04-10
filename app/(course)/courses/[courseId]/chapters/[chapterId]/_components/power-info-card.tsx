"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface PowerInfoCardProps {
  name: string;
  description: string;
  image: string;
}

export default function PowerInfoCard({
  name,
  description,
  image,
}: PowerInfoCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-64 w-48 perspective-1000 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden border rounded-lg bg-white p-4 flex flex-col items-center justify-center shadow">
          <div className="w-16 h-16 mb-3 rounded-full overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-center">{name}</h3>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 border rounded-lg bg-gray-50 p-4 shadow flex items-center justify-center">
          <p className="text-sm text-gray-700 text-center">{description}</p>
        </div>
      </div>
    </div>
  );
}
