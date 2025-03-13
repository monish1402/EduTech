import { User, Course, Progress, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCourse(id: number): Promise<Course | undefined>;
  listCourses(): Promise<Course[]>;
  createCourse(course: Omit<Course, "id">): Promise<Course>;
  
  getProgress(userId: number, courseId: number): Promise<Progress | undefined>;
  updateProgress(progress: Progress): Promise<Progress>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private progress: Map<string, Progress>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async listCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    const id = this.currentId++;
    const newCourse = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getProgress(userId: number, courseId: number): Promise<Progress | undefined> {
    const key = `${userId}-${courseId}`;
    return this.progress.get(key);
  }

  async updateProgress(progress: Progress): Promise<Progress> {
    const key = `${progress.userId}-${progress.courseId}`;
    this.progress.set(key, progress);
    return progress;
  }
}

export const storage = new MemStorage();
