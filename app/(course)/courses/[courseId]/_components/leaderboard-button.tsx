"use client";

import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardButtonProps {
  courseId: string;
}

export const LeaderboardButton = ({ courseId }: LeaderboardButtonProps) => {
  const onClick = async () => {
    const res = await fetch(`/api/leaderboard?courseId=${courseId}`);
    const data = await res.json();
    console.log(data); // or open a modal here
  };

  return (
    <Button
      className="mt-7 bg-yellow-500 hover:bg-yellow-600"
      onClick={onClick}
    >
      Leaderboard <Crown className="h-4 w-4 ml-2" />
    </Button>
  );
};
