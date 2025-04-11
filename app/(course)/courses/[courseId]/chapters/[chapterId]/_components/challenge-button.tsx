"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { CheckCircle, Loader } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ChoosePowerModal from "./choose-power-modal";
import InstructionModal from "./instruction-modal";
import QuizModal from "./quiz-modal";

interface ChallengeButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  title?: string;
  timeTaken?: number;
  isQuizCompleted?: boolean;
  quizScore?: number;
}

export const ChallengeButton = ({
  courseId,
  chapterId,
  isCompleted,
  timeTaken,
  isQuizCompleted,
  quizScore,
  title,
}: ChallengeButtonProps) => {
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    // if (isQuizCompleted) return

    setLoading(true);

    try {
      const { data } = await axios.post("/api/questions", { title });

      if (Object.keys(data.questions).length === 5) {
        setQuizData(data);
        console.log(data);
      } else {
        toast.error("Not enough questions received.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching questions.");
    } finally {
      setLoading(false);
    }
  };

  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showChoosePowerModal, setShowChoosePowerModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);

  const handleStartQuiz = () => {
    setShowInstructionModal(false);
    setShowChoosePowerModal(true);
  };

  const handlePowerSelection = (powers: string[]) => {
    setSelectedPowers(powers);
    setShowChoosePowerModal(false);
    setShowQuizModal(true);
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedPowers([]);
  };

  const Icon = loading ? Loader : isQuizCompleted ? CheckCircle : null;

  return (
    <>
      <Button
        onClick={async () => {
          await onClick();
          setShowInstructionModal(true);
        }}
        disabled={!isCompleted || isQuizCompleted || loading}
        type="button"
        className={cn(
          "w-full md:w-auto",
          isQuizCompleted
            ? "bg-white border-rose-700 text-rose-700 border hover:bg-rose-50"
            : "bg-blue-500 hover:bg-blue-600 border"
        )}
      >
        {isQuizCompleted
          ? "Quiz Already Taken"
          : loading
          ? "Loading..."
          : "Take the Challenge"}
        {Icon && (
          <Icon className={cn("h-4 w-4 ml-2", loading && "animate-spin")} />
        )}
      </Button>

      {quizData && showInstructionModal && (
        <InstructionModal
          onClose={() => {
            setShowInstructionModal(false);
          }}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {quizData && showChoosePowerModal && (
        <ChoosePowerModal
          onClose={() => setShowChoosePowerModal(false)}
          onPowerSelection={handlePowerSelection}
        />
      )}

      {quizData && showQuizModal && (
        <QuizModal
          data={quizData}
          isCompleted={isCompleted}
          courseId={courseId}
          chapterId={chapterId}
          selectedPowers={selectedPowers}
          onClose={handleCloseQuiz}
        />
      )}
    </>
  );
};
