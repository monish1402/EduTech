import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.listCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(parseInt(req.params.id));
    if (!course) return res.sendStatus(404);
    res.json(course);
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    if (!req.user.isEducator) {
      return res.status(403).json({ message: "Only educators can create courses" });
    }

    try {
      const parsed = insertCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      const course = await storage.createCourse({
        ...parsed.data,
        educatorId: req.user.id,
      });

      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.get("/api/progress/:courseId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const progress = await storage.getProgress(
      req.user.id,
      parseInt(req.params.courseId)
    );
    if (!progress) return res.sendStatus(404);
    res.json(progress);
  });

  app.post("/api/progress/:courseId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const progress = await storage.updateProgress({
      id: req.user.id,
      userId: req.user.id,
      courseId: parseInt(req.params.courseId),
      ...req.body,
    });
    res.json(progress);
  });

  app.get("/api/analytics/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userProgress = await storage.getProgressByUserId(req.user.id);
      res.json(userProgress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}