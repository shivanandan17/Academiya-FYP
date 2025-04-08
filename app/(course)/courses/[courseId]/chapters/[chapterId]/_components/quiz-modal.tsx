"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

interface QuizModalProps {
  data: {
    questions: Array<{
      question: string;
      answer: string;
      option1: string;
      option2: string;
      option3: string;
      option4: string;
    }>;
  };
  quizScore?: number;
  isQuizCompleted?: boolean;
  chapterId?: string;
  courseId?: string;
  onClose: () => void;
}

export const QuizModal = ({
  data,
  onClose,
  quizScore,
  isQuizCompleted,
  chapterId,
  courseId,
}: QuizModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime, setTotalTime] = useState(0);

  const currentQuestion = data.questions[currentQuestionIndex];

  useEffect(() => {
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    setSelectedOption(null);
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      console.log(
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            quizScore: score,
            isQuizCompleted: true,
          }
        )
      );
      alert(`Quiz completed! Your score: ${score}/${data.questions.length}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl h-auto overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Quiz Time!</h2>

        <p className="text-sm text-gray-600 mb-2">
          Time Left: {timeLeft}s | Total Time: {Math.floor(totalTime / 60)}m{" "}
          {totalTime % 60}s
        </p>

        <p className="font-semibold text-lg mb-3">{`${
          currentQuestionIndex + 1
        }. ${currentQuestion.question}`}</p>

        <ul className="list-none space-y-3">
          {[
            currentQuestion.option1,
            currentQuestion.option2,
            currentQuestion.option3,
            currentQuestion.option4,
          ].map((option, index) => (
            <li key={index}>
              <Button
                onClick={() => handleOptionClick(option)}
                className={`w-full py-2 px-4 text-left rounded-md flex items-center justify-between transition-all duration-300 ${
                  selectedOption
                    ? option === currentQuestion.answer
                      ? "bg-green-900 text-white" // Correct answer (darker green)
                      : option === selectedOption
                      ? "bg-red-900 text-white" // Incorrect selection (darker red)
                      : "bg-gray-900 text-white" // Disabled (darker gray)
                    : "bg-gray-900 text-white" // Default for unselected options (darker gray)
                }`}
                disabled={!!selectedOption}
              >
                <span>{option}</span>
                {selectedOption && (
                  <span className="ml-2">
                    {option === currentQuestion.answer ? (
                      <CheckCircle className="text-green-500" />
                    ) : option === selectedOption ? (
                      <XCircle className="text-red-500" />
                    ) : null}
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between">
          <Button onClick={handleNext} className="bg-blue-900 text-white">
            {currentQuestionIndex < data.questions.length - 1
              ? "Next"
              : "Finish"}
          </Button>
          <Button onClick={onClose} className="bg-red-900 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
