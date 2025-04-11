"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizModalProps {
  data?: any;
  isCompleted?: boolean;
  courseId?: string;
  chapterId?: string;
  selectedPowers: string[];
  onClose: () => void;
}

// Custom CSS utility classes for 3D card flip effect
const styles = `
  .perspective { perspective: 1000px; }
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .group-hover\\:rotate-y-180:hover { transform: rotateY(180deg); }
`;

// Sample quiz data
const quizQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    hint: "This city is known as the 'City of Light'.",
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    hint: "Named after the Roman god of war.",
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: "Blue Whale",
    hint: "It's an aquatic mammal.",
  },
  {
    id: 4,
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: "Oxygen",
    hint: "We breathe this element.",
  },
  {
    id: 5,
    question: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Michelangelo",
    ],
    correctAnswer: "Leonardo da Vinci",
    hint: "This Italian polymath was also known for his inventions.",
  },
];

export default function QuizModal({
  data,
  courseId,
  chapterId,
  isCompleted,
  selectedPowers,
  onClose,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [availablePowers, setAvailablePowers] =
    useState<string[]>(selectedPowers);
  const [activePower, setActivePower] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
  }>({ correct: 0, incorrect: 0 });

  // Fix: Ensure currentQuestion is always defined with fallback to sample data
  const currentQuestion = data?.questions?.[currentQuestionIndex] ||
    quizQuestions[currentQuestionIndex] || {
      question: "Loading question...",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "",
      hint: "",
    };

  // Timer effect
  useEffect(() => {
    if (quizCompleted) return;

    const timer = setInterval(() => {
      if (!isTimeFrozen) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up for this question
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });

        setTotalTimeElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeFrozen, quizCompleted]);

  const handleTimeUp = () => {
    // Deduct 5 points for timeout
    setScore((prev) => prev - 5);
    // Count as incorrect answer
    setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    moveToNextQuestion();
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return; // Already answered

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    // Update results tracking
    if (correct) {
      setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Calculate score based on power usage
    if (activePower === "double-points") {
      if (correct) {
        setScore((prev) => prev + 50 * 2);
      } else {
        setScore((prev) => prev - 15);
      }
    } else if (activePower === "skip-negative") {
      if (correct) {
        setScore((prev) => prev + 40);
      }
      // No deduction for wrong answer
    } else if (activePower === "two-chance" && !correct && !secondChanceUsed) {
      // First wrong attempt with two-chance power
      setSecondChanceUsed(true);
      setSelectedOption(null);
      setIsCorrect(null);
      return; // Don't proceed to next question yet
    } else if (activePower) {
      // Any other power active
      if (correct) {
        setScore((prev) => prev + 40);
      } else {
        setScore((prev) => prev - 15);
      }
    } else {
      // No power active
      if (correct) {
        setScore((prev) => prev + 50);
      } else {
        setScore((prev) => prev - 10);
      }
    }

    // Wait 1.5 seconds before moving to next question
    setTimeout(async () => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        moveToNextQuestion();
      } else {
        // Calculate final score including the current question's points
        let finalScore = score;

        // Add points for the last question based on the same logic used above
        if (activePower === "double-points") {
          if (isCorrect) {
            finalScore += 50 * 2;
          } else {
            finalScore -= 15;
          }
        } else if (activePower === "skip-negative") {
          if (isCorrect) {
            finalScore += 40;
          }
          // No deduction for wrong answer
        } else if (activePower) {
          // Any other power active
          if (isCorrect) {
            finalScore += 40;
          } else {
            finalScore -= 15;
          }
        } else {
          // No power active
          if (isCorrect) {
            finalScore += 50;
          } else {
            finalScore -= 10;
          }
        }

        // Quiz is completed
        setQuizCompleted(true);
        setScore(finalScore); // Update the score state for display

        // Update the database with the calculated final score
        try {
          await axios.put(
            `/api/courses/${courseId}/chapters/${chapterId}/progress`,
            {
              isCompleted: isCompleted,
              quizScore: finalScore, // Use the calculated final score
              timeTaken: totalTimeElapsed,
              isQuizCompleted: true,
              correctAnswers: results.correct,
              incorrectAnswers: results.incorrect,
            }
          );
        } catch (error) {
          console.error("Failed to update progress:", error);
        }
      }
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (
      currentQuestionIndex <
      (data?.questions?.length || quizQuestions.length) - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuestionState = () => {
    setTimeLeft(60);
    setSelectedOption(null);
    setIsCorrect(null);
    setActivePower(null);
    setShowHint(false);
    setFilteredOptions([]);
    setIsTimeFrozen(false);
    setSecondChanceUsed(false);
  };

  const activatePower = (powerId: string) => {
    if (selectedOption !== null) return; // Can't use power after answering

    setActivePower(powerId);
    setAvailablePowers((prev) => prev.filter((p) => p !== powerId));

    // Apply power effects
    if (powerId === "fifty-fifty") {
      // Keep correct answer and one random wrong answer
      const wrongOptions = currentQuestion.options.filter(
        (opt: string) => opt !== currentQuestion.correctAnswer
      );
      const randomWrongOption =
        wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      setFilteredOptions(
        [currentQuestion.correctAnswer, randomWrongOption].sort(
          () => Math.random() - 0.5
        )
      );
    } else if (powerId === "time-freeze") {
      setIsTimeFrozen(true);
    } else if (powerId === "hint-reveal") {
      setShowHint(true);
    } else if (powerId === "skip-question") {
      // Skip without penalty
      moveToNextQuestion();
    }
  };

  // Fix: Ensure options are always defined
  const displayOptions =
    filteredOptions.length > 0
      ? (currentQuestion.options || []).filter((opt: string) =>
          filteredOptions.includes(opt)
        )
      : currentQuestion.options || [];

  if (quizCompleted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Quiz Completed!
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 text-center">
            <div className="text-6xl font-bold mb-4">{score}</div>
            <p className="text-lg mb-6">Your final score</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {results.correct}
                </div>
                <p className="text-sm text-green-700">Correct Answers</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {results.incorrect}
                </div>
                <p className="text-sm text-red-700">Incorrect Answers</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  Time Taken: {Math.floor(totalTimeElapsed / 60)}:
                  {(totalTimeElapsed % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={onClose} size="lg">
                Finish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <style jsx global>
        {styles}
      </style>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1100px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1}/
                  {data?.questions?.length || quizQuestions.length}
                </span>
                <Progress
                  value={
                    ((currentQuestionIndex + 1) /
                      (data?.questions?.length || quizQuestions.length)) *
                    100
                  }
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Total: {Math.floor(totalTimeElapsed / 60)}:
                    {(totalTimeElapsed % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                    timeLeft <= 10
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6">
            <div className="grid grid-cols-3 gap-8 min-h-[500px]">
              {/* Left side - Question */}
              <div className="col-span-2 flex flex-col">
                <h2 className="text-2xl font-semibold mb-6">
                  {currentQuestion.question}
                </h2>

                {showHint && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Hint:</span>
                    </div>
                    <p className="text-yellow-700 mt-2">
                      {currentQuestion.hint}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 flex-grow">
                  {displayOptions.map((option: string) => (
                    <Button
                      key={option}
                      variant={
                        selectedOption === option
                          ? isCorrect
                            ? "success"
                            : "destructive"
                          : "outline"
                      }
                      className={`justify-start text-left h-auto py-6 px-6 text-lg ${
                        selectedOption &&
                        selectedOption !== option &&
                        "opacity-50"
                      }`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={selectedOption !== null}
                    >
                      {selectedOption === option &&
                        (isCorrect ? (
                          <CheckCircle className="h-6 w-6 mr-3" />
                        ) : (
                          <XCircle className="h-6 w-6 mr-3" />
                        ))}
                      {option}
                    </Button>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-lg font-medium mb-2">Score: {score}</div>
                  {secondChanceUsed && (
                    <div className="text-md text-amber-600">
                      Second chance active! Try again.
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Power Cards */}
              <div className="col-span-1 flex flex-col">
                <h3 className="text-xl font-medium mb-4">Power Cards</h3>
                <div className="grid grid-cols-1 gap-5 flex-grow">
                  {selectedPowers.map((powerId) => {
                    const isAvailable = availablePowers.includes(powerId);
                    const powerInfo = getPowerInfo(powerId);
                    const imagePath = `/${powerId}.png`;

                    return (
                      <div
                        key={powerId}
                        className={`group perspective cursor-pointer h-[140px] ${
                          !isAvailable && "opacity-50 pointer-events-none"
                        }`}
                        onClick={() => isAvailable && activatePower(powerId)}
                      >
                        <div
                          className={`relative transition-all duration-500 preserve-3d h-full ${
                            isAvailable ? "group-hover:rotate-y-180" : ""
                          }`}
                        >
                          {/* Front of card */}
                          <div className="backface-hidden border rounded-lg p-5 bg-white shadow-sm h-full flex items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-[100px] h-[100px] rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={
                                    imagePath ||
                                    "/placeholder.svg?height=100&width=100" ||
                                    "/placeholder.svg"
                                  }
                                  alt={powerInfo.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-lg">
                                  {powerInfo.name}
                                </h4>
                                {!isAvailable && (
                                  <span className="text-sm text-red-500">
                                    Used
                                  </span>
                                )}
                                {isAvailable && (
                                  <span className="text-sm text-green-500">
                                    Click to use
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Back of card (description) */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 border rounded-lg p-5 bg-primary/5 flex items-center justify-center h-full">
                            <p className="text-md">{powerInfo.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedOption !== null &&
              currentQuestionIndex <
                (data?.questions?.length || quizQuestions.length) - 1 && (
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={moveToNextQuestion}
                    size="lg"
                    className="px-8"
                  >
                    Next Question
                  </Button>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getPowerInfo(powerId: string) {
  switch (powerId) {
    case "fifty-fifty":
      return {
        name: "50-50",
        description:
          "Removes two incorrect answers, leaving only two options to choose from.",
      };
    case "time-freeze":
      return {
        name: "Time Freeze",
        description:
          "Stops the timer, giving you unlimited time to answer the current question.",
      };
    case "two-chance":
      return {
        name: "Two-Chance",
        description: "Gives you a second chance if you answer incorrectly.",
      };
    case "hint-reveal":
      return {
        name: "Hint-Reveal",
        description: "Reveals a helpful hint for the current question.",
      };
    case "skip-negative":
      return {
        name: "Skip Negative",
        description: "Wrong answers won't deduct points for this question.",
      };
    case "skip-question":
      return {
        name: "Skip Question",
        description: "Skip the current question without penalty.",
      };
    case "double-points":
      return {
        name: "Double Points",
        description: "Doubles the points awarded for a correct answer.",
      };
    default:
      return {
        name: powerId,
        description: "Special power",
      };
  }
}
