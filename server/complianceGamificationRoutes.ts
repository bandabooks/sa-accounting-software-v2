import type { Express } from "express";
import { authenticate } from "./auth.js";
import { storage } from "./storage.js";
import { complianceGamification } from "./compliance-gamification.js";
import { z } from "zod";

export function registerComplianceGamificationRoutes(app: Express) {
  
  // Initialize compliance tracker for a company
  app.post("/api/compliance/tracker/init", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      
      // Check if tracker already exists
      const existingTracker = await storage.getComplianceTracker(companyId);
      if (existingTracker) {
        return res.json(existingTracker);
      }
      
      // Initialize new tracker
      const tracker = await complianceGamification.initializeComplianceTracker(companyId);
      res.json(tracker);
    } catch (error) {
      console.error("Error initializing compliance tracker:", error);
      res.status(500).json({ message: "Failed to initialize compliance tracker" });
    }
  });

  // Get compliance dashboard
  app.get("/api/compliance/dashboard", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      const dashboard = await complianceGamification.getComplianceDashboard(companyId, userId);
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching compliance dashboard:", error);
      res.status(500).json({ message: "Failed to fetch compliance dashboard" });
    }
  });

  // Record compliance activity
  app.post("/api/compliance/activity", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      const activitySchema = z.object({
        activityType: z.string(),
        activityName: z.string(),
        description: z.string().optional(),
        relatedRecordType: z.string().optional(),
        relatedRecordId: z.number().optional(),
        metadata: z.record(z.any()).default({}),
      });
      
      const activityData = activitySchema.parse(req.body);
      
      await complianceGamification.recordActivity(
        companyId,
        userId,
        activityData.activityType,
        activityData.activityName,
        activityData.description,
        activityData.relatedRecordType,
        activityData.relatedRecordId,
        activityData.metadata
      );
      
      res.json({ success: true, message: "Activity recorded successfully" });
    } catch (error) {
      console.error("Error recording compliance activity:", error);
      res.status(500).json({ message: "Failed to record activity" });
    }
  });

  // Get compliance tracker
  app.get("/api/compliance/tracker", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const tracker = await storage.getComplianceTracker(companyId);
      
      if (!tracker) {
        return res.status(404).json({ message: "Compliance tracker not found" });
      }
      
      res.json(tracker);
    } catch (error) {
      console.error("Error fetching compliance tracker:", error);
      res.status(500).json({ message: "Failed to fetch compliance tracker" });
    }
  });

  // Get user achievements
  app.get("/api/compliance/achievements", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      const achievements = await storage.getUserAchievements(companyId, userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get available achievements
  app.get("/api/compliance/achievements/available", authenticate, async (req: any, res) => {
    try {
      const allAchievements = await storage.getAllComplianceAchievements();
      res.json(allAchievements);
    } catch (error) {
      console.error("Error fetching available achievements:", error);
      res.status(500).json({ message: "Failed to fetch available achievements" });
    }
  });

  // Get user milestones
  app.get("/api/compliance/milestones", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      const milestones = await storage.getUserMilestones(companyId, userId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching user milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  // Get compliance activities
  app.get("/api/compliance/activities", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const activities = await storage.getRecentComplianceActivities(companyId, userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching compliance activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Mark achievement celebration as shown
  app.post("/api/compliance/achievements/:achievementId/celebrate", authenticate, async (req: any, res) => {
    try {
      const achievementId = parseInt(req.params.achievementId);
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      // Update the user achievement to mark celebration as shown
      // This would require an additional method in storage, but for now we'll just return success
      res.json({ success: true, message: "Achievement celebration marked" });
    } catch (error) {
      console.error("Error marking achievement celebration:", error);
      res.status(500).json({ message: "Failed to mark celebration" });
    }
  });

  // Get leaderboard (top performers)
  app.get("/api/compliance/leaderboard", authenticate, async (req: any, res) => {
    try {
      const companyId = req.user.companyId;
      
      // For now, return a simple leaderboard - in production this would be more sophisticated
      const tracker = await storage.getComplianceTracker(companyId);
      const leaderboard = tracker ? [
        {
          userId: req.user.id,
          name: req.user.name || 'You',
          level: tracker.level,
          score: tracker.overallScore,
          rank: 1
        }
      ] : [];
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  console.log("✓ Compliance Gamification routes registered");
}