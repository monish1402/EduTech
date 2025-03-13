import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizFormProps {
  quiz: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
  };
  onSubmit: (score: number) => void;
}

const PASS_THRESHOLD = 70;

export default function QuizForm({ quiz, onSubmit }: QuizFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      const correctAnswers = newAnswers.filter(
        (answer, index) => answer === quiz.questions[index].correctAnswer
      );
      const finalScore = Math.round(
        (correctAnswers.length / quiz.questions.length) * 100
      );
      setScore(finalScore);
      setShowResult(true);
      onSubmit(finalScore);
    }
  };

  const question = quiz.questions[currentQuestion];

  if (showResult) {
    const passed = score >= PASS_THRESHOLD;
    return (
      <div className="space-y-6">
        <Alert className={passed ? "bg-green-50" : "bg-red-50"}>
          <div className="flex items-center gap-2">
            {passed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription className={passed ? "text-green-600" : "text-red-600"}>
              {passed
                ? "Congratulations! You've passed the quiz."
                : "You didn't meet the minimum score requirement."}
            </AlertDescription>
          </div>
          <p className="mt-2 font-medium">Your score: {score}%</p>
          {!passed && (
            <p className="mt-2 text-sm text-gray-600">
              Required score: {PASS_THRESHOLD}%. Please try again.
            </p>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </h3>
        <p className="mb-4">{question.question}</p>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => setSelectedOption(parseInt(value))}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        onClick={handleNext}
        disabled={selectedOption === null}
        className="w-full"
      >
        {currentQuestion === quiz.questions.length - 1 ? "Submit" : "Next"}
      </Button>
    </div>
  );
}