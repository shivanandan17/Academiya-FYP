"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InstructionModalProps {
  onClose: () => void
  onStartQuiz: () => void
}

export default function InstructionModal({ onClose, onStartQuiz }: InstructionModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Quiz Instructions</DialogTitle>
          <DialogDescription className="text-base">
            Please read the instructions carefully before starting the quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Max Score</p>
              <p className="text-xl font-bold text-green-700">250</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Min Score</p>
              <p className="text-xl font-bold text-red-700">-65</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Total Questions</p>
              <p className="text-xl font-bold text-blue-700">5</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scoring System:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <span className="font-medium">With Power Feature:</span> +40 marks for correct answer, -15 for wrong
                answer
              </li>
              <li>
                <span className="font-medium">Without Power Feature:</span> +50 marks for correct answer, -10 for wrong
                answer
              </li>
              <li>
                <span className="font-medium">Skipped or Time Out:</span> -5 marks will be deducted
              </li>
            </ul>

            <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
              The user must click the power button to activate the power feature before selecting an option for that
              question.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Power Descriptions:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <span className="font-medium">50-50:</span> Disable two wrong option buttons and only one wrong and one
                correct answer is displayed.
              </li>
              <li>
                <span className="font-medium">Time Freeze:</span> Freeze total elapsed time and the 60 second timer for
                that respective question.
              </li>
              <li>
                <span className="font-medium">Two-Chance:</span> If the two-chance power is selected the user will get a
                second chance to choose an option if the answer goes wrong.
              </li>
              <li>
                <span className="font-medium">Hint-Reveal:</span> Displays hint for that respective question.
              </li>
              <li>
                <span className="font-medium">Skip Negative Score:</span> No point will be deducted if the answer goes
                wrong.
              </li>
              <li>
                <span className="font-medium">Skip Question:</span> No points will be deducted on skipping the question.
              </li>
              <li>
                <span className="font-medium">Double Points:</span> Double the point will be provided if the answer
                chosen is right. -15 points will be deducted on wrong answer.
              </li>
            </ul>
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
  )
}
