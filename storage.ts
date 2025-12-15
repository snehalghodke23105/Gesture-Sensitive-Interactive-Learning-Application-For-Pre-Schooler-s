import { 
  users, type User, type InsertUser,
  progressRecords, type Progress, type InsertProgress, 
  activities, type Activity, type InsertActivity,
  learningSkills, type LearningSkill, type InsertLearningSkill
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChildrenByParentId(parentId: number): Promise<User[]>;
  
  // Progress methods
  getProgressByUserId(userId: number): Promise<Progress[]>;
  saveProgress(progress: InsertProgress): Promise<Progress>;
  
  // Activity methods
  getActivities(category?: string): Promise<Activity[]>;
  getActivityById(activityId: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Learning Skills methods
  getSkillsByUserId(userId: number): Promise<LearningSkill[]>;
  saveSkill(skill: InsertLearningSkill): Promise<LearningSkill>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progressRecords: Map<number, Progress>;
  private activities: Map<number, Activity>;
  private learningSkills: Map<number, LearningSkill>;
  currentUserId: number;
  currentProgressId: number;
  currentActivityId: number;
  currentSkillId: number;

  constructor() {
    this.users = new Map();
    this.progressRecords = new Map();
    this.activities = new Map();
    this.learningSkills = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
    this.currentActivityId = 1;
    this.currentSkillId = 1;
    
    // Initialize sample data
    this.initSampleData();
  }

  // Initialize sample data for testing
  private initSampleData() {
    // Create sample users (parent and child)
    const parentUser: InsertUser = {
      username: 'parent',
      password: 'password123',
      isParent: true,
      childId: 2, // Will be the ID of the child user
      displayName: 'Parent User',
      age: 35
    };
    
    const childUser: InsertUser = {
      username: 'child',
      password: 'password123',
      isParent: false,
      childId: null,
      displayName: 'Child One',
      age: 4
    };
    
    // Create the users and store them
    this.createUser(childUser).then(child => {
      this.createUser(parentUser);
      
      // Create sample activities
      const sampleActivities: InsertActivity[] = [
        {
          activityId: 'alphabet-tracing',
          category: 'alphabet',
          title: 'Alphabet Tracing',
          description: 'Learn to write letters with gesture tracing',
          content: JSON.stringify({
            type: 'tracing',
            letters: ['A', 'B', 'C', 'D', 'E']
          }),
          difficulty: 1,
          ageRange: '3-5',
          thumbnailUrl: '/images/alphabet.svg',
          durationMinutes: 5
        },
        {
          activityId: 'number-counting',
          category: 'numbers',
          title: 'Number Counting',
          description: 'Count objects and learn numbers 1-5',
          content: JSON.stringify({
            type: 'counting',
            numbers: [1, 2, 3, 4, 5]
          }),
          difficulty: 1,
          ageRange: '3-5',
          thumbnailUrl: '/images/numbers.svg',
          durationMinutes: 5
        },
        {
          activityId: 'shape-matching',
          category: 'shapes',
          title: 'Shape Matching',
          description: 'Identify and match common shapes',
          content: JSON.stringify({
            type: 'matching',
            shapes: ['circle', 'square', 'triangle', 'rectangle', 'star']
          }),
          difficulty: 1,
          ageRange: '3-5',
          thumbnailUrl: '/images/shapes.svg',
          durationMinutes: 4
        },
        {
          activityId: 'color-recognition',
          category: 'colors',
          title: 'Color Recognition',
          description: 'Learn to identify basic colors',
          content: JSON.stringify({
            type: 'recognition',
            colors: ['red', 'blue', 'green', 'yellow', 'purple']
          }),
          difficulty: 1,
          ageRange: '3-5',
          thumbnailUrl: '/images/colors.svg',
          durationMinutes: 4
        },
        {
          activityId: 'animal-sounds',
          category: 'animals',
          title: 'Animal Sounds',
          description: 'Match animals with their sounds',
          content: JSON.stringify({
            type: 'sounds',
            animals: ['cat', 'dog', 'cow', 'sheep', 'horse']
          }),
          difficulty: 1,
          ageRange: '3-5',
          thumbnailUrl: '/images/animals.svg',
          durationMinutes: 6
        }
      ];
      
      // Create activities
      sampleActivities.forEach(activity => {
        this.createActivity(activity);
      });
      
      // Create sample progress records for the child
      const sampleProgressRecords: InsertProgress[] = [
        {
          userId: child.id,
          activityCategory: 'alphabet',
          activityId: 'alphabet-tracing',
          activityName: 'Alphabet Tracing',
          completed: true,
          score: 85,
          timeSpent: 240,
          attempts: 2,
          correctAnswers: 4,
          totalQuestions: 5
        },
        {
          userId: child.id,
          activityCategory: 'numbers',
          activityId: 'number-counting',
          activityName: 'Number Counting',
          completed: true,
          score: 90,
          timeSpent: 180,
          attempts: 1,
          correctAnswers: 9,
          totalQuestions: 10
        },
        {
          userId: child.id,
          activityCategory: 'shapes',
          activityId: 'shape-matching',
          activityName: 'Shape Matching',
          completed: true,
          score: 75,
          timeSpent: 300,
          attempts: 2,
          correctAnswers: 6,
          totalQuestions: 8
        },
        {
          userId: child.id,
          activityCategory: 'colors',
          activityId: 'color-recognition',
          activityName: 'Color Recognition',
          completed: false,
          score: 60,
          timeSpent: 150,
          attempts: 1,
          correctAnswers: 3,
          totalQuestions: 5
        }
      ];
      
      // Save progress records
      sampleProgressRecords.forEach(progress => {
        this.saveProgress(progress);
      });
      
      // Create sample learning skills for the child
      const sampleSkills: InsertLearningSkill[] = [
        {
          userId: child.id,
          skillName: 'letter_recognition',
          category: 'alphabet',
          masteryLevel: 85,
          lastPracticed: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          userId: child.id,
          skillName: 'number_counting',
          category: 'numbers',
          masteryLevel: 75,
          lastPracticed: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          userId: child.id,
          skillName: 'shape_identification',
          category: 'shapes',
          masteryLevel: 90,
          lastPracticed: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          userId: child.id,
          skillName: 'color_matching',
          category: 'colors',
          masteryLevel: 65,
          lastPracticed: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
          userId: child.id,
          skillName: 'animal_sounds',
          category: 'animals',
          masteryLevel: 50,
          lastPracticed: new Date(Date.now() - 345600000) // 4 days ago
        }
      ];
      
      // Save skills
      sampleSkills.forEach(skill => {
        this.saveSkill(skill);
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isParent: insertUser.isParent ?? false,
      childId: insertUser.childId ?? null,
      displayName: insertUser.displayName ?? null,
      age: insertUser.age ?? null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async getChildrenByParentId(parentId: number): Promise<User[]> {
    // Get the parent user
    const parent = await this.getUser(parentId);
    if (!parent || !parent.isParent) {
      return [];
    }
    
    // If parent has a specific child ID, return that child
    if (parent.childId) {
      const child = await this.getUser(parent.childId);
      return child ? [child] : [];
    }
    
    // Otherwise find all users linked to this parent
    return Array.from(this.users.values())
      .filter(user => !user.isParent && user.childId === parentId);
  }
  
  // Progress methods
  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return Array.from(this.progressRecords.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // Sort desc by date
      });
  }
  
  async saveProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const now = new Date();
    const progress: Progress = { 
      id, 
      userId: insertProgress.userId ?? null,
      activityCategory: insertProgress.activityCategory,
      activityId: insertProgress.activityId,
      activityName: insertProgress.activityName ?? null,
      completed: insertProgress.completed ?? false,
      score: insertProgress.score ?? null,
      timeSpent: insertProgress.timeSpent ?? null,
      attempts: insertProgress.attempts ?? 1,
      correctAnswers: insertProgress.correctAnswers ?? 0,
      totalQuestions: insertProgress.totalQuestions ?? 0,
      createdAt: now,
      updatedAt: now
    };
    this.progressRecords.set(id, progress);
    return progress;
  }
  
  // Activity methods
  async getActivities(category?: string): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (category) {
      activities = activities.filter(activity => activity.category === category);
    }
    
    return activities;
  }
  
  async getActivityById(activityId: string): Promise<Activity | undefined> {
    return Array.from(this.activities.values())
      .find(activity => activity.activityId === activityId);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { 
      id,
      activityId: insertActivity.activityId,
      category: insertActivity.category,
      title: insertActivity.title,
      description: insertActivity.description ?? null,
      content: insertActivity.content,
      difficulty: insertActivity.difficulty ?? 1,
      ageRange: insertActivity.ageRange ?? null,
      thumbnailUrl: insertActivity.thumbnailUrl ?? null,
      durationMinutes: insertActivity.durationMinutes ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Learning Skills methods
  async getSkillsByUserId(userId: number): Promise<LearningSkill[]> {
    return Array.from(this.learningSkills.values())
      .filter(skill => skill.userId === userId);
  }
  
  async saveSkill(insertSkill: InsertLearningSkill): Promise<LearningSkill> {
    const id = this.currentSkillId++;
    const now = new Date();
    const skill: LearningSkill = {
      id,
      userId: insertSkill.userId,
      skillName: insertSkill.skillName,
      category: insertSkill.category,
      masteryLevel: insertSkill.masteryLevel ?? 0,
      lastPracticed: insertSkill.lastPracticed ?? null,
      updatedAt: now
    };
    this.learningSkills.set(id, skill);
    return skill;
  }
}

export const storage = new MemStorage();
