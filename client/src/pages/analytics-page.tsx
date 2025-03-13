import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: progress, isLoading } = useQuery<Progress[]>({
    queryKey: ["/api/analytics/progress"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Calculate metrics
  const completedCourses = progress?.filter((p) => p.completed).length || 0;
  const totalCourses = progress?.length || 0;
  const averageScore = progress?.reduce((acc, p) => acc + (p.quizScore || 0), 0) / (totalCourses || 1);
  
  // Prepare data for charts
  const scoreDistribution = progress?.reduce((acc, p) => {
    const scoreRange = Math.floor((p.quizScore || 0) / 10) * 10;
    const key = `${scoreRange}-${scoreRange + 9}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scoreData = Object.entries(scoreDistribution || {}).map(([range, count]) => ({
    range,
    count,
  }));

  const progressOverTime = progress?.map((p) => ({
    date: new Date(p.lastAccessed).toLocaleDateString(),
    score: p.quizScore || 0,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Learning Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((completedCourses / totalCourses) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {completedCourses} of {totalCourses} courses completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Quiz Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {progress?.filter((p) => {
                const lastAccess = new Date(p.lastAccessed);
                const today = new Date();
                return today.getTime() - lastAccess.getTime() < 7 * 24 * 60 * 60 * 1000;
              }).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active courses this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
