import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema, insertActivitySchema, insertLearningSkillSchema, insertUserSchema } from "@shared/schema";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all routes with /api
  
  // User Routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: 'Invalid user data' });
    }
  });
  
  app.get('/api/users/:id/children', async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const children = await storage.getChildrenByParentId(parentId);
      
      // Remove passwords from response
      const safeChildren = children.map(child => {
        const { password, ...childWithoutPassword } = child;
        return childWithoutPassword;
      });
      
      res.json(safeChildren);
    } catch (error) {
      console.error('Error getting children:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Progress Routes
  app.get('/api/progress/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getProgressByUserId(userId);
      res.json(progress);
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/progress', async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.saveProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
      res.status(400).json({ message: 'Invalid progress data' });
    }
  });
  
  // Activity Routes
  app.get('/api/activities', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const activities = await storage.getActivities(category);
      res.json(activities);
    } catch (error) {
      console.error('Error getting activities:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/activities/:id', async (req, res) => {
    try {
      const activityId = req.params.id;
      const activity = await storage.getActivityById(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      
      res.json(activity);
    } catch (error) {
      console.error('Error getting activity:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/activities', async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(400).json({ message: 'Invalid activity data' });
    }
  });
  
  // Learning Skills Routes
  app.get('/api/skills/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (error) {
      console.error('Error getting skills:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/skills', async (req, res) => {
    try {
      const skillData = insertLearningSkillSchema.parse(req.body);
      const skill = await storage.saveSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      console.error('Error saving skill:', error);
      res.status(400).json({ message: 'Invalid skill data' });
    }
  });
  
  // Parent Dashboard Summary Route
  app.get('/api/dashboard/summary/:childId', async (req, res) => {
    try {
      const childId = parseInt(req.params.childId);
      
      // Check if child exists
      const child = await storage.getUser(childId);
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }
      
      // Get progress data
      const progress = await storage.getProgressByUserId(childId);
      
      // Get skill data
      const skills = await storage.getSkillsByUserId(childId);
      
      // Calculate summary stats
      const totalActivities = progress.length;
      const completedActivities = progress.filter(p => p.completed).length;
      
      // Calculate scores
      const scores = progress
        .filter(p => p.score !== null && p.score !== undefined)
        .map(p => p.score as number);
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
      
      // Get recent progress
      const recentProgress = [...progress]
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      
      // Group progress by category
      const categories = ['alphabet', 'numbers', 'shapes', 'colors', 'animals'];
      const categoryProgress: Record<string, { total: number, completed: number, percentage: number }> = {};
      
      categories.forEach(category => {
        const categoryItems = progress.filter(p => p.activityCategory === category);
        const completedItems = categoryItems.filter(p => p.completed).length;
        const percentage = categoryItems.length > 0 
          ? (completedItems / categoryItems.length) * 100 
          : 0;
          
        categoryProgress[category] = {
          total: categoryItems.length,
          completed: completedItems,
          percentage
        };
      });
      
      // Build response
      const dashboardData = {
        childInfo: {
          id: child.id,
          name: child.displayName || child.username,
          age: child.age,
        },
        summary: {
          totalActivities,
          completedActivities,
          averageScore,
          mostRecentActivity: recentProgress.length > 0 ? recentProgress[0] : null,
          timeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0), // in seconds
        },
        categoryProgress,
        skills: skills.map(skill => ({
          name: skill.skillName,
          category: skill.category,
          mastery: skill.masteryLevel,
          lastPracticed: skill.lastPracticed
        })),
        recentActivities: recentProgress
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Serve static audio files if they exist
  app.use('/audio', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'public', 'audio', req.path);
    res.sendFile(filePath, err => {
      if (err) {
        // If file doesn't exist, continue to next handler
        next();
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
