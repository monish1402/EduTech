import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import CourseCard from "@/components/course-card";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Available Courses
          </h1>
          {user?.isEducator && (
            <Link href="/create-course">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          )}
        </div>

        {courses?.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No courses available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
