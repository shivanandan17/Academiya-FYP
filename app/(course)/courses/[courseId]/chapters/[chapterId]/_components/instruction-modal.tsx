"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PowerInfoCard from "./power-info-card"; // Make sure this path is correct

interface InstructionModalProps {
  onClose: () => void;
  onStartQuiz: () => void;
}

const powers = [
  {
    name: "50-50",
    description:
      "Disables two wrong options, showing only one correct and one wrong.",
    image: "/fifty-fifty.png",
  },
  {
    name: "Time Freeze",
    description: "Freezes both the total time and question timer temporarily.",
    image: "/time-freeze.png",
  },
  {
    name: "Two-Chance",
    description: "Gives a second chance if your first answer is wrong.",
    image: "/two-chance.png",
  },
  {
    name: "Hint-Reveal",
    description: "Reveals a helpful hint for the current question.",
    image: "/hint-reveal.png",
  },
  {
    name: "Skip Negative Score",
    description: "No negative marks even if you answer incorrectly.",
    image: "/skip-negative.png",
  },
  {
    name: "Skip Question",
    description: "Skip the question with no score penalty.",
    image: "/skip-question.png",
  },
  {
    name: "Double Points",
    description: "Get double points if the answer is correct. -15 for wrong.",
    image: "/double-points.png",
  },
];

export default function InstructionModal({
  onClose,
  onStartQuiz,
}: InstructionModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Quiz Instructions
          </DialogTitle>
          <DialogDescription className="text-base">
            Please read the instructions carefully before starting the quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Max Score</p>
              <p className="text-2xl font-bold text-green-700">250</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Min Score</p>
              <p className="text-2xl font-bold text-red-700">-65</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Total Questions
              </p>
              <p className="text-2xl font-bold text-blue-700">5</p>
            </div>
          </div>

          {/* Scoring System */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Scoring System:</h3>
            <ul className="space-y-2 list-disc pl-5 text-sm">
              <li>
                <strong>With Power Feature:</strong> +40 marks for correct
                answer, -15 for wrong answer
              </li>
              <li>
                <strong>Without Power Feature:</strong> +50 marks for correct
                answer, -10 for wrong answer
              </li>
              <li>
                <strong>Skipped or Time Out:</strong> -5 marks will be deducted
              </li>
            </ul>

            <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
              The user must click the power button to activate the power feature
              before selecting an option for that question.
            </p>
          </div>

          {/* Power Info Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Power Descriptions:</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {powers.map((power) => (
                <PowerInfoCard
                  key={power.name}
                  name={power.name}
                  description={power.description}
                  image={power.image}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onStartQuiz}>Take the Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
