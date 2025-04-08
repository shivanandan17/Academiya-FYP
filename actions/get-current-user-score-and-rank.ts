import { db } from "@/lib/db";

export const getCurrentUserScoreAndRank = async (
  courseId: string,
  userId: string
) => {
  // Step 1: Get all published chapters for the course
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        select: { id: true },
      },
    },
  });

  const chapterIds = course?.chapters.map((c) => c.id) || [];
  if (chapterIds.length === 0) return null;

  // Step 2: Get all user progress for quiz-completed attempts
  const allProgress = await db.userProgress.findMany({
    where: {
      chapterId: { in: chapterIds },
      isQuizCompleted: true,
    },
    select: {
      userId: true,
      quizScore: true,
      timeTaken: true,
    },
  });

  // Step 3: Aggregate user data
  const userMap: Record<
    string,
    { totalScore: number; timeSum: number; attempts: number }
  > = {};

  for (const progress of allProgress) {
    if (!userMap[progress.userId]) {
      userMap[progress.userId] = {
        totalScore: 0,
        timeSum: 0,
        attempts: 0,
      };
    }

    const user = userMap[progress.userId];
    user.totalScore += progress.quizScore;
    user.timeSum += progress.timeTaken;
    user.attempts += 1;
  }

  // Step 4: Sort users by score desc, time asc
  const sorted = Object.entries(userMap)
    .map(([uid, data]) => ({
      userId: uid,
      totalScore: data.totalScore,
      avgTime: data.timeSum / data.attempts,
    }))
    .sort((a, b) => {
      if (b.totalScore === a.totalScore) {
        return a.avgTime - b.avgTime;
      }
      return b.totalScore - a.totalScore;
    });

  // Step 5: Find current user's score and rank
  const userIndex = sorted.findIndex((entry) => entry.userId === userId);
  if (userIndex === -1) return null;

  const currentUserData = sorted[userIndex];

  return {
    rank: userIndex + 1,
    totalScore: currentUserData.totalScore,
    avgTime: Number(currentUserData.avgTime.toFixed(2)),
  };
};
