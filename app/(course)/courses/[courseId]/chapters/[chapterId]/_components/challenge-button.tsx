"use client";

import { CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { QuizModal } from "./quiz-modal";
import { cn } from "@/lib/utils";

interface ChallengeButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  title?: string;
  isQuizCompleted?: boolean;
  quizScore?: number;
}

export const ChallengeButton = ({
  courseId,
  chapterId,
  isCompleted,
  isQuizCompleted,
  quizScore,
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

  const Icon = loading ? Loader : CheckCircle;

  return (
    <>
      <Button
        onClick={onClick}
        disabled={loading} // Add isQuizCompleted once done with functionality
        type="button"
        className={cn(
          "w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 border",
          isQuizCompleted && "bg-white border-rose-700 text-rose-700"
        )}
      >
        {isQuizCompleted
          ? "Quiz Already Taken"
          : loading
          ? "Loading..."
          : "Take the Challenge"}
        <Icon className="h-4 w-4 ml-2" />
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {quizData && (
        <QuizModal
          data={quizData}
          quizScore={quizScore}
          isQuizCompleted={isQuizCompleted}
          isCompleted={isCompleted}
          courseId={courseId}
          chapterId={chapterId}
          onClose={() => setQuizData(null)}
        />
      )}
    </>
  );
};
