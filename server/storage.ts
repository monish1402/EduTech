import { User, Course, Progress, InsertUser, Submission, Certificate } from "@shared/schema";
import session from "express-session";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, courses, progress, submissions, certificates } from "@shared/schema";
import pkg from "pg";
const { Client } = pkg;
import connectPg from "connect-pg-simple";
import { eq, and } from 'drizzle-orm';

const PostgresStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCourse(id: number): Promise<Course | undefined>;
  listCourses(): Promise<Course[]>;
  createCourse(course: Omit<Course, "id">): Promise<Course>;

  getProgress(userId: number, courseId: number): Promise<Progress | undefined>;
  updateProgress(progress: Progress): Promise<Progress>;

  // New methods for submissions and certificates
  createSubmission(submission: Omit<Submission, "id" | "submittedAt" | "similarityScore" | "plagiarismDetected" | "matchedSubmissionIds">): Promise<Submission>;
  getSubmissionsByUserId(userId: number): Promise<Submission[]>;
  getSubmissionsByCourseId(courseId: number): Promise<Submission[]>;
  updateSubmissionPlagiarismStatus(id: number, similarityScore: number, isPlagiarized: boolean, matchedIds: number[]): Promise<Submission>;

  createCertificate(certificate: Omit<Certificate, "id" | "issuedAt">): Promise<Certificate>;
  getCertificateByVerificationCode(code: string): Promise<Certificate | undefined>;
  getCertificatesByUserId(userId: number): Promise<Certificate[]>;
  updateCertificateStatus(id: number, status: string): Promise<Certificate>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  sessionStore: session.Store;
  private client: pkg.Client;

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    this.client.connect();
    this.db = drizzle(this.client);

    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await this.db.insert(users).values(insertUser).returning();
    return results[0];
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const results = await this.db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return results[0];
  }

  async listCourses(): Promise<Course[]> {
    return await this.db.select().from(courses);
  }

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    const results = await this.db.insert(courses).values(course).returning();
    return results[0];
  }

  async getProgress(userId: number, courseId: number): Promise<Progress | undefined> {
    const results = await this.db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)))
      .limit(1);
    return results[0];
  }

  async updateProgress(progressData: Progress): Promise<Progress> {
    const results = await this.db
      .insert(progress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: progressData,
      })
      .returning();
    return results[0];
  }

  async createSubmission(submission: Omit<Submission, "id" | "submittedAt" | "similarityScore" | "plagiarismDetected" | "matchedSubmissionIds">): Promise<Submission> {
    const results = await this.db.insert(submissions).values(submission).returning();
    return results[0];
  }

  async getSubmissionsByUserId(userId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId));
  }

  async getSubmissionsByCourseId(courseId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.courseId, courseId));
  }

  async updateSubmissionPlagiarismStatus(
    id: number,
    similarityScore: number,
    isPlagiarized: boolean,
    matchedIds: number[]
  ): Promise<Submission> {
    const results = await this.db
      .update(submissions)
      .set({
        similarityScore,
        plagiarismDetected: isPlagiarized,
        matchedSubmissionIds: matchedIds,
      })
      .where(eq(submissions.id, id))
      .returning();
    return results[0];
  }

  async createCertificate(certificate: Omit<Certificate, "id" | "issuedAt">): Promise<Certificate> {
    const results = await this.db.insert(certificates).values(certificate).returning();
    return results[0];
  }

  async getCertificateByVerificationCode(code: string): Promise<Certificate | undefined> {
    const results = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.verificationCode, code))
      .limit(1);
    return results[0];
  }

  async getCertificatesByUserId(userId: number): Promise<Certificate[]> {
    return await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId));
  }

  async updateCertificateStatus(id: number, status: string): Promise<Certificate> {
    const results = await this.db
      .update(certificates)
      .set({ status })
      .where(eq(certificates.id, id))
      .returning();
    return results[0];
  }
}

export const storage = new DatabaseStorage();