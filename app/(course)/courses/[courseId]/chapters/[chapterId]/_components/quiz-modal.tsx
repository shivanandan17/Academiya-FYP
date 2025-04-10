"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import axios from "axios"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface QuizModalProps {
  data: any
  isCompleted: boolean
  courseId: string
  chapterId: string
  selectedPowers: string[]
  onClose: () => void
}

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
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
    hint: "This Italian polymath was also known for his inventions.",
  },
]

export default function QuizModal({ data, courseId, chapterId, isCompleted, selectedPowers, onClose }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [availablePowers, setAvailablePowers] = useState<string[]>(selectedPowers)
  const [activePower, setActivePower] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [isTimeFrozen, setIsTimeFrozen] = useState(false)
  const [secondChanceUsed, setSecondChanceUsed] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = data?.questions[currentQuestionIndex] || quizQuestions[currentQuestionIndex]
  
  // Timer effect
  useEffect(() => {
    if (quizCompleted) return

    const timer = setInterval(() => {
      if (!isTimeFrozen) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up for this question
            handleTimeUp()
            return 0
          }
          return prev - 1
        })

        setTotalTimeElapsed((prev) => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimeFrozen, quizCompleted])

  const handleTimeUp = () => {
    // Deduct 5 points for timeout
    setScore((prev) => prev - 5)
    moveToNextQuestion()
  }

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return // Already answered

    setSelectedOption(option)
    const correct = option === currentQuestion.correctAnswer
    setIsCorrect(correct)

    // Calculate score based on power usage
    if (activePower === "double-points") {
      if (correct) {
        setScore((prev) => prev + 50 * 2)
      } else {
        setScore((prev) => prev - 15)
      }
    } else if (activePower === "skip-negative") {
      if (correct) {
        setScore((prev) => prev + 40)
      }
      // No deduction for wrong answer
    } else if (activePower === "two-chance" && !correct && !secondChanceUsed) {
      // First wrong attempt with two-chance power
      setSecondChanceUsed(true)
      setSelectedOption(null)
      setIsCorrect(null)
      return // Don't proceed to next question yet
    } else if (activePower) {
      // Any other power active
      if (correct) {
        setScore((prev) => prev + 40)
      } else {
        setScore((prev) => prev - 15)
      }
    } else {
      // No power active
      if (correct) {
        setScore((prev) => prev + 50)
      } else {
        setScore((prev) => prev - 10)
      }
    }

    // Wait 1.5 seconds before moving to next question
    setTimeout(async () => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        moveToNextQuestion()
      } else {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: isCompleted,
            quizScore: score,
            timeTaken: totalTimeElapsed,
            isQuizCompleted: true,
          }
        );
  
        alert(`Quiz completed! Your score: ${score}/${data.questions.length}`);
        onClose();
        setQuizCompleted(true)
      }
    }, 1500)
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      resetQuestionState()
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuestionState = () => {
    setTimeLeft(60)
    setSelectedOption(null)
    setIsCorrect(null)
    setActivePower(null)
    setShowHint(false)
    setFilteredOptions([])
    setIsTimeFrozen(false)
    setSecondChanceUsed(false)
  }

  const activatePower = (powerId: string) => {
    if (selectedOption !== null) return // Can't use power after answering

    setActivePower(powerId)
    setAvailablePowers((prev) => prev.filter((p) => p !== powerId))

    // Apply power effects
    if (powerId === "fifty-fifty") {
      // Keep correct answer and one random wrong answer
      const wrongOptions = currentQuestion.options.filter((opt) => opt !== currentQuestion.correctAnswer)
      const randomWrongOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
      setFilteredOptions([currentQuestion.correctAnswer, randomWrongOption].sort(() => Math.random() - 0.5))
    } else if (powerId === "time-freeze") {
      setIsTimeFrozen(true)
    } else if (powerId === "hint-reveal") {
      setShowHint(true)
    } else if (powerId === "skip-question") {
      // Skip without penalty
      moveToNextQuestion()
    }
  }

  const displayOptions =
    filteredOptions.length > 0
      ? currentQuestion.options.filter((opt) => filteredOptions.includes(opt))
      : currentQuestion.options

  if (quizCompleted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Quiz Completed!</DialogTitle>
          </DialogHeader>

          <div className="py-8 text-center">
            <div className="text-6xl font-bold mb-4">{score}</div>
            <p className="text-lg">Your final score</p>

            <div className="mt-8">
              <Button onClick={onClose} size="lg">
                Finish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium">Question {currentQuestionIndex + 1}/5</span>
              <Progress value={(currentQuestionIndex + 1) * 20} className="w-24" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  Total: {Math.floor(totalTimeElapsed / 60)}:{(totalTimeElapsed % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${timeLeft <= 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
              >
                <Clock className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>

            {showHint && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700">Hint:</span>
                </div>
                <p className="text-yellow-700 mt-1">{currentQuestion.hint}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 mt-4">
              {displayOptions.map((option) => (
                <Button
                  key={option}
                  variant={selectedOption === option ? (isCorrect ? "success" : "destructive") : "outline"}
                  className={`justify-start text-left h-auto py-3 px-4 ${
                    selectedOption && selectedOption !== option && "opacity-50"
                  }`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={selectedOption !== null}
                >
                  {selectedOption === option &&
                    (isCorrect ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />)}
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium mb-2">Score: {score}</div>
              {secondChanceUsed && <div className="text-sm text-amber-600">Second chance active! Try again.</div>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availablePowers.map((powerId) => {
                const power = selectedPowers.includes(powerId) ? { id: powerId, name: getPowerName(powerId) } : null

                if (!power) return null

                return (
                  <Button
                    key={powerId}
                    variant="outline"
                    size="sm"
                    className="h-auto py-1 px-3"
                    onClick={() => activatePower(powerId)}
                    disabled={activePower !== null || selectedOption !== null}
                  >
                    {power.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {selectedOption !== null && currentQuestionIndex < quizQuestions.length - 1 && (
          <div className="flex justify-end">
            <Button onClick={moveToNextQuestion}>Next Question</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function getPowerName(powerId: string): string {
  switch (powerId) {
    case "fifty-fifty":
      return "50-50"
    case "time-freeze":
      return "Time Freeze"
    case "two-chance":
      return "Two-Chance"
    case "hint-reveal":
      return "Hint-Reveal"
    case "skip-negative":
      return "Skip Negative"
    case "skip-question":
      return "Skip Question"
    case "double-points":
      return "Double Points"
    default:
      return powerId
  }
}
