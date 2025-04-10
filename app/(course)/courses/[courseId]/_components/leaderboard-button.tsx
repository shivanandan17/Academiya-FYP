"use client"

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { useState } from "react"
import { LeaderboardModal } from "./leaderboard-modal"

interface LeaderboardEntry {
  userId: string
  rank: number
  totalScore: number
  avgTime: number
  perfectRuns: number
  perfectRunPercentage: number
  badges: string[]
}

interface LeaderboardButtonProps {
  courseId: string
  courseTitle?: string
}

export const LeaderboardButton = ({ courseId, courseTitle }: LeaderboardButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/leaderboard?courseId=${courseId}`)
      const data = await res.json()
      setLeaderboardData(data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button className="mt-7 bg-yellow-500 hover:bg-yellow-600" onClick={onClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Leaderboard"} <Crown className="h-4 w-4 ml-2" />
      </Button>

      <LeaderboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaderboardData={leaderboardData}
        courseTitle={courseTitle}
      />
    </>
  )
}
