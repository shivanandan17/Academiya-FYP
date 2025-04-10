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
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import PowerCard from "./power-card";

interface ChoosePowerModalProps {
  onClose: () => void;
  onPowerSelection: (powers: string[]) => void;
}

const powers = [
  {
    id: "fifty-fifty",
    name: "50-50",
    description:
      "Disable two wrong option buttons and only one wrong and one correct answer is displayed.",
    image: "/fifty-fifty.png?height=200&width=200",
  },
  {
    id: "time-freeze",
    name: "Time Freeze",
    description:
      "Freeze total elapsed time and the 60 second timer for that respective question.",
    image: "/time-freeze.png?height=100&width=100",
  },
  {
    id: "two-chance",
    name: "Two-Chance",
    description:
      "If the two-chance power is selected the user will get a second chance to choose an option if the answer goes wrong.",
    image: "/two-chance.png?height=100&width=100",
  },
  {
    id: "hint-reveal",
    name: "Hint-Reveal",
    description: "Displays hint for that respective question.",
    image: "/hint-reveal.png?height=100&width=100",
  },
  {
    id: "skip-negative",
    name: "Skip Negative Score",
    description: "No point will be deducted if the answer goes wrong.",
    image: "/skip-negative.png?height=100&width=100",
  },
  {
    id: "skip-question",
    name: "Skip Question",
    description: "No points will be deducted on skipping the question.",
    image: "/skip-question.png?height=100&width=100",
  },
  {
    id: "double-points",
    name: "Double Points",
    description:
      "Double the point will be provided if the answer chosen is right. -15 points will be deducted on wrong answer.",
    image: "/double-points.png?height=100&width=100",
  },
];

export default function ChoosePowerModal({
  onClose,
  onPowerSelection,
}: ChoosePowerModalProps) {
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onPowerSelection(selectedPowers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedPowers, onPowerSelection]);

  const togglePower = (powerId: string) => {
    setSelectedPowers((prev) => {
      if (prev.includes(powerId)) {
        return prev.filter((id) => id !== powerId);
      } else {
        if (prev.length < 3) {
          return [...prev, powerId];
        }
        return prev;
      }
    });
  };

  const isPowerSelected = (powerId: string) => selectedPowers.includes(powerId);
  const isMaxPowersSelected = selectedPowers.length >= 3;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Choose Your Powers
          </DialogTitle>
          <DialogDescription className="text-base">
            Select up to 3 powers to help you during the quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">
              Selected: {selectedPowers.length}/3 powers
            </div>
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600 font-medium">{timeLeft}s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {powers.map((power) => (
              <PowerCard
                key={power.id}
                power={power}
                isSelected={isPowerSelected(power.id)}
                isDisabled={!isPowerSelected(power.id) && isMaxPowersSelected}
                onToggle={() => togglePower(power.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onPowerSelection(selectedPowers)}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
