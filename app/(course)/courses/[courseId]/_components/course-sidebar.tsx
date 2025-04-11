import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import type { Chapter, Course, UserProgress } from "@prisma/client"
import { Award, Check, Clock, Medal, Sparkles, Star, Trophy } from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"

import { CourseProgress } from "@/components/course-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CourseSidebarItem } from "./course-sidebar-item"
import { LeaderboardButton } from "./leaderboard-button"

type Badge = "Speedster" | "Quiz Master" | "Consistent" | "Late Bloomer" | "Perfect Run"

interface UserRankData {
  rank: number
  totalScore: number
  avgTime: number
  badges: string[]
}

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null
    })[]
  }
  progressCount: number
  userProgressSummary: UserRankData | null
}

const allBadges: { name: Badge; image: string; description: string }[] = [
  {
    name: "Consistent",
    image: "/consistency-badge.png",
    description: "Completed lessons on a regular schedule",
  },
  {
    name: "Late Bloomer",
    image: "/late-bloomer-badge.png",
    description: "Made significant progress after a slow start",
  },
  {
    name: "Perfect Run",
    image: "/perfect-run-badge.png",
    description: "Completed all chapters with perfect scores",
  },
  {
    name: "Quiz Master",
    image: "/quiz-master-badge.png",
    description: "Achieved high scores on all quizzes",
  },
  {
    name: "Speedster",
    image: "/speedster-badge.png",
    description: "Completed lessons faster than average",
  },
]

export const CourseSidebar = async ({ course, progressCount, userProgressSummary }: CourseSidebarProps) => {
  const { userId } = auth()

  if (!userId) {
    return redirect("/")
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  })

  const earnedBadges = userProgressSummary?.badges || []

  const sortedBadges = allBadges.sort((a, b) => {
    const aEarned = earnedBadges.includes(a.name)
    const bEarned = earnedBadges.includes(b.name)
    return Number(bEarned) - Number(aEarned) // Earned badges first
  })

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <>
            <div className="mt-10">
              <CourseProgress variant="success" value={progressCount} />
            </div>

            {/* Enhanced Ranking and Score Section with unique background */}
            {userProgressSummary && (
              <div className="mt-7 relative">
                {/* Catchy heading */}
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-purple-500" />
                  <h2 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Learning Mastery
                  </h2>
                </div>

                {/* Decorative background elements */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl -z-10" />
                <div className="absolute -inset-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl -z-10" />
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-2xl -z-10" />
                <div className="absolute bottom-0 left-0 h-16 w-16 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-xl -z-10" />

                {/* Sparkle decorations */}
                <span className="absolute top-2 right-4 text-yellow-400 animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="absolute bottom-3 left-6 text-purple-400 animate-pulse delay-300">
                  <Sparkles className="h-3 w-3" />
                </span>

                <div className="p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center transition-all hover:shadow-md hover:bg-white dark:hover:bg-slate-800 border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mb-2">
                        <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">Rank</p>
                      <p className="text-2xl font-bold">{userProgressSummary.rank || "N/A"}</p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center transition-all hover:shadow-md hover:bg-white dark:hover:bg-slate-800 border border-pink-100 dark:border-pink-900/30">
                      <div className="flex items-center justify-center bg-pink-100 dark:bg-pink-900/30 p-2 rounded-full mb-2">
                        <Star className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold">{userProgressSummary.totalScore}</p>
                    </div>

                    {userProgressSummary.avgTime > 0 && (
                      <div className="col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between transition-all hover:shadow-md hover:bg-white dark:hover:bg-slate-800 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-sm text-muted-foreground">Avg. Time</p>
                        </div>
                        <p className="text-lg font-semibold">{Math.round(userProgressSummary.avgTime)}s</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Badges Section */}
            <div className="mt-7 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl -z-10" />
              <div className="absolute -inset-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl -z-10" />
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-full blur-xl -z-10" />

              <div className="p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Medal className="h-5 w-5 text-amber-500" />
                  <h2 className="font-bold text-base bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                    Your Achievements
                  </h2>
                </div>

                <TooltipProvider delayDuration={300}>
                  <div className="grid grid-cols-5 gap-2">
                    {sortedBadges.map((badge) => {
                      const isEarned = earnedBadges.includes(badge.name)
                      return (
                        <Tooltip key={badge.name}>
                          <TooltipTrigger asChild>
                            <div className={`relative group flex items-center justify-center`}>
                              <div
                                className={`absolute inset-0 rounded-full ${isEarned ? "bg-amber-500/20 animate-pulse" : ""}`}
                              />
                              <div
                                className={`
                                relative overflow-hidden rounded-full p-1
                                ${
                                  isEarned
                                    ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background"
                                    : "opacity-40 grayscale"
                                }
                              `}
                              >
                                <Image
                                  src={badge.image || "/placeholder.svg"}
                                  width={40}
                                  height={40}
                                  alt={badge.name}
                                  draggable={false}
                                  className={`object-cover transition-all duration-300 ${
                                    isEarned ? "scale-100 hover:scale-110" : "scale-90"
                                  }`}
                                />
                              </div>
                              {isEarned && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950">
                                  <Check className="h-3 w-3 text-white" />
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[200px]">
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{badge.name}</p>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                              {!isEarned && <p className="text-xs italic mt-1">Not yet earned</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </TooltipProvider>
              </div>
            </div>

            <LeaderboardButton courseId={course.id} />
          </>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}
