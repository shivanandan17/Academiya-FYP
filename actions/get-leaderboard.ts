import { db } from "@/lib/db";

// Helper to assign badges
function getBadges({
  avgTime,
  scores,
  totalChapters,
}: {
  avgTime: number;
  scores: number[];
  totalChapters: number;
}) {
  const badges: string[] = [];

  const allAbove90 = scores.every((s) => s >= 90);
  const hasPerfects = scores.filter((s) => s === 100).length;
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (avgTime < 60) badges.push("Speedster");
  if (allAbove90) badges.push("Quiz Master");
  if (scores.length === totalChapters) badges.push("Consistent");
  if (avgScore - scores[0] >= 20) badges.push("Late Bloomer");

  return badges;
}

export const getLeaderboardByCourse = async (courseId: string) => {
  const chapters = await db.chapter.findMany({
    where: { courseId },
    select: { id: true },
  });

  const chapterIds = chapters.map((c) => c.id);
  const totalChapters = chapterIds.length;

  if (totalChapters === 0) return [];

  const progress = await db.userProgress.findMany({
    where: {
      chapterId: { in: chapterIds },
      isQuizCompleted: true,
    },
    select: {
      userId: true,
      quizScore: true,
      timeTaken: true,
      chapterId: true,
    },
  });

  const userMap: Record<
    string,
    {
      totalScore: number;
      timeSum: number;
      attempts: number;
      perfectRuns: number;
      scores: number[];
      completedChapters: Set<string>;
    }
  > = {};

  for (const p of progress) {
    if (!userMap[p.userId]) {
      userMap[p.userId] = {
        totalScore: 0,
        timeSum: 0,
        attempts: 0,
        perfectRuns: 0,
        scores: [],
        completedChapters: new Set(),
      };
    }

    const user = userMap[p.userId];
    user.totalScore += p.quizScore;
    user.timeSum += p.timeTaken;
    user.attempts += 1;
    if (p.quizScore === 100) user.perfectRuns += 1;
    user.scores.push(p.quizScore);
    user.completedChapters.add(p.chapterId);
  }

  let leaderboard = Object.entries(userMap).map(([userId, data]) => {
    const avgTime = data.timeSum / data.attempts;
    const perfectRunPercentage = (data.perfectRuns / data.attempts) * 100;
    const badges = getBadges({
      avgTime,
      scores: data.scores,
      totalChapters,
    });

    return {
      userId,
      totalScore: data.totalScore,
      avgTime,
      perfectRuns: data.perfectRuns,
      perfectRunPercentage: Number(perfectRunPercentage.toFixed(2)),
      badges,
    };
  });

  // Sort by score DESC, then avgTime ASC
  leaderboard.sort((a, b) => {
    if (b.totalScore === a.totalScore) {
      return a.avgTime - b.avgTime;
    }
    return b.totalScore - a.totalScore;
  });

  // Add rank
  leaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  return leaderboard;
};
