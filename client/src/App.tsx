import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NavHeader from "@/components/nav-header";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursePage from "@/pages/course-page";
import CreateCourse from "@/pages/create-course";
import AnalyticsPage from "@/pages/analytics-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <NavHeader />
          <Switch>
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/courses/:id" component={CoursePage} />
            <ProtectedRoute path="/create-course" component={CreateCourse} />
            <ProtectedRoute path="/analytics" component={AnalyticsPage} />
            <Route component={NotFound} />
          </Switch>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;