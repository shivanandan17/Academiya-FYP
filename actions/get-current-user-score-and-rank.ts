import { db } from "@/lib/db";

export const getCurrentUserScoreAndRank = async (
  courseId: string,
  userId: string
) => {
  // Step 1: Get all published chapters
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
  });

  const chapterIds = course?.chapters.map((c) => c.id) || [];
  if (chapterIds.length === 0) return null;

  // Step 2: Get all user progress
  const allProgress = await db.userProgress.findMany({
    where: {
      chapterId: { in: chapterIds },
      isQuizCompleted: true,
    },
    select: {
      userId: true,
      quizScore: true,
      timeTaken: true,
      chapterId: true,
      createdAt: true,
    },
  });

  // Step 3: Aggregate all user data
  const userMap: Record<
    string,
    {
      totalScore: number;
      timeSum: number;
      attempts: number;
      scores: number[];
      times: number[];
      chapterSet: Set<string>;
      perfectRuns: number;
      timeline: { score: number; createdAt: Date }[];
    }
  > = {};

  for (const progress of allProgress) {
    if (!userMap[progress.userId]) {
      userMap[progress.userId] = {
        totalScore: 0,
        timeSum: 0,
        attempts: 0,
        scores: [],
        times: [],
        chapterSet: new Set(),
        perfectRuns: 0,
        timeline: [],
      };
    }

    const user = userMap[progress.userId];
    user.totalScore += progress.quizScore;
    user.timeSum += progress.timeTaken;
    user.attempts += 1;
    user.scores.push(progress.quizScore);
    user.times.push(progress.timeTaken);
    user.timeline.push({
      score: progress.quizScore,
      createdAt: progress.createdAt,
    });
    user.chapterSet.add(progress.chapterId);

    if (progress.quizScore === 5) {
      user.perfectRuns += 1;
    }
  }

  // Step 4: Sort users
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

  // Step 5: Find current user
  const userIndex = sorted.findIndex((entry) => entry.userId === userId);
  if (userIndex === -1) return null;

  const currentUserData = sorted[userIndex];
  const userStats = userMap[userId];

  // Step 6: Badge logic
  const badges: string[] = [];

  const avgTime = userStats.timeSum / userStats.attempts;
  const allAbove175 = userStats.scores.every((score) => score > 175);
  const completedAll = userStats.chapterSet.size === chapterIds.length;
  const improved =
    userStats.timeline.length >= 2 &&
    userStats.timeline
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .at(-1)!.score > userStats.timeline[0].score;

  if (avgTime < 60) badges.push("Speedster");
  if (allAbove175) badges.push("Quiz Master");
  if (completedAll) badges.push("Consistent");
  if (improved) badges.push("Late Bloomer");
  if (userStats.perfectRuns > 0) badges.push("Perfect Run");

  return {
    rank: userIndex + 1,
    totalScore: currentUserData.totalScore,
    avgTime: Number(currentUserData.avgTime.toFixed(2)),
    perfectRuns: userStats.perfectRuns,
    badges,
  };
};
