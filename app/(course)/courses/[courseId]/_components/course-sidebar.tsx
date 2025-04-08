import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chapter, Course, UserProgress } from "@prisma/client";
import Image from "next/image";

import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { LeaderboardButton } from "./leaderboard-button";

type Badge =
  | "Speedster"
  | "Quiz Master"
  | "Consistent"
  | "Late Bloomer"
  | "Perfect Run";

interface UserRankData {
  rank: number;
  totalScore: number;
  avgTime: number;
  badges: string[];
}

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  userProgressSummary: UserRankData | null;
}

const allBadges: { name: Badge; image: string }[] = [
  { name: "Consistent", image: "/consistency-badge.png" },
  { name: "Late Bloomer", image: "/late-bloomer-badge.png" },
  { name: "Perfect Run", image: "/perfect-run-badge.png" },
  { name: "Quiz Master", image: "/quiz-master-badge.png" },
  { name: "Speedster", image: "/speedster-badge.png" },
];

export const CourseSidebar = async ({
  course,
  progressCount,
  userProgressSummary,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  const earnedBadges = userProgressSummary?.badges || [];

  const sortedBadges = allBadges.sort((a, b) => {
    const aEarned = earnedBadges.includes(a.name);
    const bEarned = earnedBadges.includes(b.name);
    return Number(bEarned) - Number(aEarned); // Earned badges first
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <>
            <div className="mt-10">
              <CourseProgress variant="success" value={progressCount} />
            </div>
            <div className="mt-7">
              <h2 className="font-semibold">
                Your Ranking: {userProgressSummary?.rank ?? "N/A"}
              </h2>
              <h2 className="font-semibold">
                Your Score: {userProgressSummary?.totalScore ?? 0}
              </h2>
            </div>
            <div className="flex gap-3 mt-7">
              {sortedBadges.map((badge) => {
                const isEarned = earnedBadges.includes(badge.name);
                return (
                  <Image
                    key={badge.name}
                    src={badge.image}
                    width={40}
                    height={40}
                    alt={badge.name}
                    title={badge.name} // <-- Tooltip on hover
                    draggable={false}
                    className={`object-cover transition ${
                      isEarned
                        ? ""
                        : "brightness-50 grayscale opacity-60 cursor-not-allowed"
                    }`}
                  />
                );
              })}
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
  );
};
