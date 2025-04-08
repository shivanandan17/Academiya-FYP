import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Chapter, Course, UserProgress } from "@prisma/client";

import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { LeaderboardButton } from "./leaderboard-button";

interface UserRankData {
  rank: number;
  totalScore: number;
  avgTime: number;
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

export const CourseSidebar = async ({
  course,
  progressCount,
  userProgressSummary,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  /*
        In our schema.prisma we created a composite unique constraint
        @@unique([userId, courseId]), you can use userId_courseId to
        query the result (compound identifier or composite key)
    */
  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
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
                Your Ranking: {userProgressSummary?.rank}
              </h2>
              <h2 className="font-semibold">
                Your Score: {userProgressSummary?.totalScore}
              </h2>
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
