import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isEducator: boolean("is_educator").notNull().default(false),
  profileImage: text("profile_image"),
  bio: text("bio")
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  educatorId: integer("educator_id").notNull(),
  videoUrl: text("video_url").notNull(),
  quiz: json("quiz").notNull().$type<{
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
  }>()
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  quizScore: integer("quiz_score"),
  certificateIssued: boolean("certificate_issued").notNull().default(false),
  lastAccessed: timestamp("last_accessed").notNull().defaultNow()
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  similarityScore: integer("similarity_score"),
  plagiarismDetected: boolean("plagiarism_detected").notNull().default(false),
  matchedSubmissionIds: integer("matched_submission_ids").array(),
  verificationHash: text("verification_hash").notNull(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  verificationCode: text("verification_code").notNull().unique(),
  status: text("status").notNull().default('valid'),
  metadata: json("metadata").$type<{
    grade: string;
    completionDate: string;
    plagiarismScore: number;
  }>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isEducator: true,
  profileImage: true,
  bio: true
});

export const insertCourseSchema = createInsertSchema(courses);
export const insertProgressSchema = createInsertSchema(progress);

export const insertSubmissionSchema = createInsertSchema(submissions).omit({ 
  id: true,
  submittedAt: true,
  similarityScore: true,
  plagiarismDetected: true,
  matchedSubmissionIds: true
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;