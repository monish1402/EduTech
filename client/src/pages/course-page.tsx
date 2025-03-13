import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Course, Progress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import VideoPlayer from "@/components/video-player";
import QuizForm from "@/components/quiz-form";
import Certificate from "@/components/certificate";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PASS_THRESHOLD = 70;

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<Progress>({
    queryKey: [`/api/progress/${id}`],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: Partial<Progress>) => {
      const res = await apiRequest("POST", `/api/progress/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${id}`] });
      toast({
        title: "Progress updated",
        description: "Your progress has been saved successfully.",
      });
    },
  });

  if (courseLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <VideoPlayer videoUrl={course.videoUrl} />
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Course Description</h2>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          {progress?.completed && progress.quizScore >= PASS_THRESHOLD && !progress.certificateIssued && (
            <div className="mt-6">
              <Certificate course={course} />
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Course Quiz</h2>
              {progress?.completed ? (
                <div>
                  <p className="text-muted-foreground mb-2">
                    Quiz completed with score: {progress.quizScore}%
                  </p>
                  {progress.quizScore < PASS_THRESHOLD && (
                    <div className="mt-4">
                      <p className="text-sm text-red-600 mb-2">
                        Your score is below the required {PASS_THRESHOLD}% to earn a certificate.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => updateProgressMutation.mutate({ completed: false })}
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <QuizForm
                  quiz={course.quiz}
                  onSubmit={async (score) => {
                    await updateProgressMutation.mutateAsync({
                      completed: true,
                      quizScore: score,
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}