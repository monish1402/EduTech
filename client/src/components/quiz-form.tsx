import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

export default function QuizForm({ quiz, onSubmit }: QuizFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
      const score = Math.round(
        (correctAnswers.length / quiz.questions.length) * 100
      );
      onSubmit(score);
    }
  };

  const question = quiz.questions[currentQuestion];

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
