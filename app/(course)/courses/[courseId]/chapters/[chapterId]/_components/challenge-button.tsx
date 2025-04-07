"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { QuizModal } from "./quiz-modal";

interface ChallengeButtonProps {
  isCompleted?: boolean;
  title?: string;
}

export const ChallengeButton = ({
  isCompleted,
  title,
}: ChallengeButtonProps) => {
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("/api/questions", { title });
      console.log(Object.keys(data).length);
      if (Object.keys(data.questions).length === 5) {
        setQuizData(data);
      } else {
        console.log(data);
        setError("Not enough questions received.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching questions.");
    } finally {
      setLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <>
      <Button
        onClick={onClick}
        disabled={!isCompleted || loading}
        type="button"
        className="w-full md:w-auto bg-yellow-500"
      >
        {loading ? "Loading..." : "Challenge"}
        <Icon className="h-4 w-4 ml-2" />
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {quizData && (
        <QuizModal data={quizData} onClose={() => setQuizData(null)} />
      )}
    </>
  );
};
