import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema } from "@shared/schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const COURSE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2",
  "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c",
  "https://images.unsplash.com/photo-1557804483-ef3ae78eca57",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
  "https://images.unsplash.com/photo-1526676537331-7747bf8278fc",
  "https://images.unsplash.com/photo-1521312639858-5b042542f2a5",
];

export default function CreateCourse() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnail: COURSE_THUMBNAILS[0],
      quiz: {
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ],
      },
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course created",
        description: "Your course has been created successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createCourseMutation.mutate(data)
              )}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="YouTube or Vimeo URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <div className="grid grid-cols-3 gap-4">
                      {COURSE_THUMBNAILS.map((url) => (
                        <div
                          key={url}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                            field.value === url ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => field.onChange(url)}
                        >
                          <img src={url} alt="Thumbnail option" className="w-full h-24 object-cover" />
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quiz.questions.0.question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Question</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your question" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {[0, 1, 2, 3].map((optionIndex) => (
                <FormField
                  key={optionIndex}
                  control={form.control}
                  name={`quiz.questions.0.options.${optionIndex}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option {optionIndex + 1}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={`Enter option ${optionIndex + 1}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="quiz.questions.0.correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer (0-3)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="3" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createCourseMutation.isPending}
              >
                Create Course
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}