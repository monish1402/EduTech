import { Link } from "wouter";
import { Course } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {course.description}
        </p>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1507679799987-c73779587ccf" />
            <AvatarFallback>ED</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">Educator</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/courses/${course.id}`}>
          <Button className="w-full">Start Learning</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
