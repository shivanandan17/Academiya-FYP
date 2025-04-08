import { db } from "@/lib/db";

export const getLeaderboardByCourse = async (courseId: string) => {
  // Step 1: Get all chapter IDs for the given course
  const chapters = await db.chapter.findMany({
    where: { courseId },
    select: { id: true },
  });

  const chapterIds = chapters.map((chapter) => chapter.id);

  if (chapterIds.length === 0) return [];

  // Step 2: Aggregate quiz scores for each user
  const userScores = await db.userProgress.findMany({
    where: {
      chapterId: {
        in: chapterIds,
      },
      isQuizCompleted: true,
    },
    select: {
      userId: true,
      quizScore: true,
    },
  });

  // Step 3: Group and sum manually (since Prisma's groupBy has limitations)
  const userScoreMap: Record<string, number> = {};

  for (const progress of userScores) {
    if (!userScoreMap[progress.userId]) {
      userScoreMap[progress.userId] = 0;
    }
    userScoreMap[progress.userId] += progress.quizScore;
  }

  // Step 4: Convert to array and sort
  const leaderboard = Object.entries(userScoreMap)
    .map(([userId, totalQuizScore]) => ({ userId, totalQuizScore }))
    .sort((a, b) => b.totalQuizScore - a.totalQuizScore);

  return leaderboard;
};
