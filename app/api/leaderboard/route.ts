import { NextResponse } from "next/server";
import { getLeaderboardByCourse } from "@/actions/get-leaderboard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  const leaderboard = await getLeaderboardByCourse(courseId);
  return NextResponse.json(leaderboard);
}
