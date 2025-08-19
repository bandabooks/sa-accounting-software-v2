import { storage } from './storage';
import type { 
  ComplianceTracker, 
  InsertComplianceTracker,
  ComplianceAchievement,
  ComplianceUserAchievement,
  InsertComplianceUserAchievement,
  ComplianceMilestone,
  ComplianceUserMilestone,
  InsertComplianceUserMilestone,
  ComplianceActivity,
  InsertComplianceActivity
} from '@shared/schema';

// Experience points and level calculation
const POINTS_PER_LEVEL = 1000;
const MAX_LEVEL = 10;

// Activity point values
export const ACTIVITY_POINTS = {
  VAT_RETURN_SUBMITTED: 150,
  PAYROLL_PROCESSED: 100,
  INVOICE_CREATED: 10,
  EXPENSE_RECORDED: 5,
  BANK_RECONCILED: 50,
  QUARTERLY_REVIEW: 200,
  SARS_SUBMISSION: 300,
  STREAK_MAINTAINED: 25,
  FIRST_TIME_BONUS: 50,
};

// Achievement definitions
export const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'first_vat_return',
    name: 'VAT Virgin No More',
    description: 'Submit your first VAT return',
    category: 'vat',
    criteria: { vat_returns_submitted: 1 },
    pointsReward: 200,
    badgeIcon: 'file-text',
    badgeColor: 'green',
    tier: 'bronze',
    difficulty: 1,
  },
  {
    code: 'vat_master',
    name: 'VAT Master',
    description: 'Submit 12 consecutive VAT returns on time',
    category: 'vat',
    criteria: { consecutive_vat_returns: 12, on_time: true },
    pointsReward: 1000,
    badgeIcon: 'crown',
    badgeColor: 'gold',
    tier: 'gold',
    difficulty: 4,
  },
  {
    code: 'streak_starter',
    name: 'Getting Into The Groove',
    description: 'Maintain a 7-day compliance streak',
    category: 'streak',
    criteria: { streak_days: 7 },
    pointsReward: 100,
    badgeIcon: 'flame',
    badgeColor: 'orange',
    tier: 'bronze',
    difficulty: 1,
  },
  {
    code: 'streak_hero',
    name: 'Compliance Hero',
    description: 'Maintain a 30-day compliance streak',
    category: 'streak',
    criteria: { streak_days: 30 },
    pointsReward: 500,
    badgeIcon: 'shield',
    badgeColor: 'blue',
    tier: 'silver',
    difficulty: 3,
  },
  {
    code: 'streak_legend',
    name: 'Tax Compliance Legend',
    description: 'Maintain a 90-day compliance streak',
    category: 'streak',
    criteria: { streak_days: 90 },
    pointsReward: 1500,
    badgeIcon: 'medal',
    badgeColor: 'purple',
    tier: 'platinum',
    difficulty: 5,
  },
  {
    code: 'early_bird',
    name: 'Early Bird',
    description: 'Submit 3 returns early (before due date)',
    category: 'general',
    criteria: { early_submissions: 3 },
    pointsReward: 300,
    badgeIcon: 'sunrise',
    badgeColor: 'yellow',
    tier: 'silver',
    difficulty: 2,
  },
  {
    code: 'payroll_pro',
    name: 'Payroll Pro',
    description: 'Process 6 months of payroll without errors',
    category: 'payroll',
    criteria: { payroll_months: 6, error_free: true },
    pointsReward: 800,
    badgeIcon: 'users',
    badgeColor: 'teal',
    tier: 'gold',
    difficulty: 3,
  },
  {
    code: 'sars_connector',
    name: 'SARS Connected',
    description: 'Successfully connect to SARS eFiling',
    category: 'general',
    criteria: { sars_connected: true },
    pointsReward: 150,
    badgeIcon: 'link',
    badgeColor: 'blue',
    tier: 'bronze',
    difficulty: 1,
  },
  {
    code: 'invoice_machine',
    name: 'Invoice Machine',
    description: 'Create 100 invoices',
    category: 'general',
    criteria: { invoices_created: 100 },
    pointsReward: 400,
    badgeIcon: 'receipt',
    badgeColor: 'green',
    tier: 'silver',
    difficulty: 2,
  },
  {
    code: 'perfect_quarter',
    name: 'Perfect Quarter',
    description: 'Complete all quarterly requirements on time',
    category: 'general',
    criteria: { quarter_completion: 100, on_time: true },
    pointsReward: 1000,
    badgeIcon: 'star',
    badgeColor: 'gold',
    tier: 'gold',
    difficulty: 4,
  },
];

// Milestone definitions
export const DEFAULT_MILESTONES = [
  {
    name: 'Compliance Rookie',
    description: 'Welcome to your compliance journey!',
    requiredScore: 0,
    requiredLevel: 1,
    rewardPoints: 0,
    rewardTitle: 'Tax Newbie',
    icon: 'baby',
    color: 'gray',
    celebrationMessage: 'Welcome to your tax compliance journey!',
    sortOrder: 1,
  },
  {
    name: 'Rising Star',
    description: 'You\'re making great progress!',
    requiredScore: 500,
    requiredLevel: 2,
    rewardPoints: 100,
    rewardTitle: 'Rising Compliance Star',
    icon: 'trending-up',
    color: 'blue',
    celebrationMessage: 'Excellent progress! Keep up the great work!',
    sortOrder: 2,
  },
  {
    name: 'Compliance Champion',
    description: 'You\'ve mastered the basics!',
    requiredScore: 1500,
    requiredLevel: 4,
    rewardPoints: 200,
    rewardTitle: 'Compliance Champion',
    icon: 'trophy',
    color: 'gold',
    celebrationMessage: 'Congratulations! You\'re now a Compliance Champion!',
    sortOrder: 3,
  },
  {
    name: 'Tax Master',
    description: 'You\'re a true tax compliance expert!',
    requiredScore: 3500,
    requiredLevel: 7,
    rewardPoints: 500,
    rewardTitle: 'Tax Compliance Master',
    icon: 'crown',
    color: 'purple',
    celebrationMessage: 'Amazing! You\'ve reached Tax Master status!',
    sortOrder: 4,
  },
  {
    name: 'Compliance Guru',
    description: 'The ultimate level of tax compliance mastery!',
    requiredScore: 7500,
    requiredLevel: 10,
    rewardPoints: 1000,
    rewardTitle: 'Supreme Compliance Guru',
    icon: 'zap',
    color: 'rainbow',
    celebrationMessage: 'Incredible! You are now a Supreme Compliance Guru!',
    sortOrder: 5,
  },
];

export class ComplianceGamificationService {
  
  /**
   * Initialize compliance tracking for a company
   */
  async initializeComplianceTracker(companyId: number): Promise<ComplianceTracker> {
    const currentDate = new Date();
    const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const currentYear = currentDate.getFullYear();
    const currentPeriod = `${currentYear}-Q${currentQuarter}`;
    
    // Calculate quarter start and end dates
    const quarterStartMonth = (currentQuarter - 1) * 3;
    const periodStartDate = new Date(currentYear, quarterStartMonth, 1);
    const periodEndDate = new Date(currentYear, quarterStartMonth + 3, 0);
    
    const trackerData: InsertComplianceTracker = {
      companyId,
      overallScore: 0,
      level: 1,
      experiencePoints: 0,
      totalTasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentPeriod,
      periodStartDate: periodStartDate.toISOString().split('T')[0],
      periodEndDate: periodEndDate.toISOString().split('T')[0],
      periodScore: 0,
      lastActivityDate: currentDate.toISOString().split('T')[0],
      completedAchievements: [],
      unlockedBadges: [],
      milestoneRewards: [],
    };

    return await storage.createComplianceTracker(trackerData);
  }

  /**
   * Record a compliance activity and update progress
   */
  async recordActivity(
    companyId: number, 
    userId: number, 
    activityType: string,
    activityName: string,
    description?: string,
    relatedRecordType?: string,
    relatedRecordId?: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const pointsEarned = ACTIVITY_POINTS[activityType as keyof typeof ACTIVITY_POINTS] || 10;
    const experienceGained = pointsEarned;

    // Record the activity
    const activity: InsertComplianceActivity = {
      companyId,
      userId,
      activityType,
      activityName,
      description,
      pointsEarned,
      experienceGained,
      relatedRecordType,
      relatedRecordId,
      metadata,
    };

    await storage.createComplianceActivity(activity);

    // Update compliance tracker
    await this.updateComplianceProgress(companyId, pointsEarned, experienceGained);

    // Check for new achievements
    await this.checkAchievements(companyId, userId, activityType, metadata);

    // Update streak if applicable
    await this.updateStreak(companyId);
  }

  /**
   * Update overall compliance progress
   */
  private async updateComplianceProgress(companyId: number, points: number, experience: number): Promise<void> {
    const tracker = await storage.getComplianceTracker(companyId);
    if (!tracker) return;

    const newExperience = tracker.experiencePoints + experience;
    const newLevel = Math.min(Math.floor(newExperience / POINTS_PER_LEVEL) + 1, MAX_LEVEL);
    const newScore = Math.min(tracker.overallScore + points, 10000); // Cap at 10,000

    await storage.updateComplianceTracker(companyId, {
      experiencePoints: newExperience,
      level: newLevel,
      overallScore: newScore,
      totalTasksCompleted: tracker.totalTasksCompleted + 1,
      lastActivityDate: new Date().toISOString().split('T')[0],
    });

    // Check for milestone achievements
    await this.checkMilestones(companyId, 1, newScore, newLevel); // Assuming single user for now
  }

  /**
   * Update compliance streak
   */
  private async updateStreak(companyId: number): Promise<void> {
    const tracker = await storage.getComplianceTracker(companyId);
    if (!tracker) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = tracker.lastActivityDate;

    if (!lastActivity) {
      // First activity
      await storage.updateComplianceTracker(companyId, {
        currentStreak: 1,
        longestStreak: Math.max(1, tracker.longestStreak),
        lastActivityDate: today,
      });
      return;
    }

    const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day - extend streak
      const newStreak = tracker.currentStreak + 1;
      await storage.updateComplianceTracker(companyId, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, tracker.longestStreak),
        lastActivityDate: today,
      });
    } else if (daysDiff > 1) {
      // Streak broken
      await storage.updateComplianceTracker(companyId, {
        currentStreak: 1,
        streakBroken: true,
        lastActivityDate: today,
      });
    }
    // Same day activities don't change streak
  }

  /**
   * Check and award achievements
   */
  private async checkAchievements(
    companyId: number, 
    userId: number, 
    activityType: string, 
    metadata: Record<string, any>
  ): Promise<void> {
    const achievements = await storage.getAllComplianceAchievements();
    const userAchievements = await storage.getUserAchievements(companyId, userId);
    const completedCodes = userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievementId);

    for (const achievement of achievements) {
      if (completedCodes.includes(achievement.id)) continue;

      const isEligible = await this.checkAchievementCriteria(
        companyId, 
        userId, 
        achievement, 
        activityType, 
        metadata
      );

      if (isEligible) {
        await this.awardAchievement(companyId, userId, achievement);
      }
    }
  }

  /**
   * Check if user meets achievement criteria
   */
  private async checkAchievementCriteria(
    companyId: number,
    userId: number,
    achievement: ComplianceAchievement,
    activityType: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    const criteria = achievement.criteria as any;
    const tracker = await storage.getComplianceTracker(companyId);
    const activities = await storage.getComplianceActivities(companyId, userId);

    // Check streak-based achievements
    if (criteria.streak_days) {
      return tracker?.currentStreak >= criteria.streak_days;
    }

    // Check VAT return achievements
    if (criteria.vat_returns_submitted) {
      const vatReturns = activities.filter(a => a.activityType === 'VAT_RETURN_SUBMITTED').length;
      return vatReturns >= criteria.vat_returns_submitted;
    }

    // Check consecutive VAT returns
    if (criteria.consecutive_vat_returns) {
      const vatActivities = activities
        .filter(a => a.activityType === 'VAT_RETURN_SUBMITTED')
        .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());
      
      return vatActivities.length >= criteria.consecutive_vat_returns;
    }

    // Check early submissions
    if (criteria.early_submissions) {
      const earlySubmissions = activities.filter(a => 
        a.metadata && (a.metadata as any).submitted_early === true
      ).length;
      return earlySubmissions >= criteria.early_submissions;
    }

    // Check invoice creation
    if (criteria.invoices_created) {
      const invoices = activities.filter(a => a.activityType === 'INVOICE_CREATED').length;
      return invoices >= criteria.invoices_created;
    }

    // Check SARS connection
    if (criteria.sars_connected && activityType === 'SARS_CONNECTED') {
      return true;
    }

    // Check payroll achievements
    if (criteria.payroll_months) {
      const payrollActivities = activities.filter(a => a.activityType === 'PAYROLL_PROCESSED').length;
      return payrollActivities >= criteria.payroll_months;
    }

    // Check quarter completion
    if (criteria.quarter_completion && activityType === 'QUARTERLY_REVIEW') {
      return (metadata.completion_percentage || 0) >= criteria.quarter_completion;
    }

    return false;
  }

  /**
   * Award achievement to user
   */
  private async awardAchievement(
    companyId: number,
    userId: number,
    achievement: ComplianceAchievement
  ): Promise<void> {
    const userAchievement: InsertComplianceUserAchievement = {
      companyId,
      userId,
      achievementId: achievement.id,
      isCompleted: true,
      progress: {},
    };

    await storage.createUserAchievement(userAchievement);

    // Award points
    if (achievement.pointsReward > 0) {
      await this.updateComplianceProgress(companyId, achievement.pointsReward, achievement.pointsReward);
    }

    console.log(`🏆 Achievement awarded: ${achievement.name} to user ${userId} in company ${companyId}`);
  }

  /**
   * Check and award milestones
   */
  private async checkMilestones(
    companyId: number,
    userId: number,
    score: number,
    level: number
  ): Promise<void> {
    const milestones = await storage.getAllComplianceMilestones();
    const userMilestones = await storage.getUserMilestones(companyId, userId);
    const achievedMilestoneIds = userMilestones.map(um => um.milestoneId);

    for (const milestone of milestones) {
      if (achievedMilestoneIds.includes(milestone.id)) continue;

      const isEligible = score >= milestone.requiredScore && 
                        level >= milestone.requiredLevel;

      if (isEligible) {
        const userMilestone: InsertComplianceUserMilestone = {
          companyId,
          userId,
          milestoneId: milestone.id,
        };

        await storage.createUserMilestone(userMilestone);

        // Award milestone points
        if (milestone.rewardPoints > 0) {
          await this.updateComplianceProgress(companyId, milestone.rewardPoints, milestone.rewardPoints);
        }

        console.log(`🌟 Milestone achieved: ${milestone.name} by user ${userId} in company ${companyId}`);
      }
    }
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(companyId: number, userId: number): Promise<any> {
    const tracker = await storage.getComplianceTracker(companyId);
    const userAchievements = await storage.getUserAchievements(companyId, userId);
    const userMilestones = await storage.getUserMilestones(companyId, userId);
    const recentActivities = await storage.getRecentComplianceActivities(companyId, userId, 10);
    
    // Calculate progress to next level
    const currentLevelExp = (tracker?.level || 1) * POINTS_PER_LEVEL;
    const nextLevelExp = Math.min((tracker?.level || 1) + 1, MAX_LEVEL) * POINTS_PER_LEVEL;
    const progressToNextLevel = tracker?.level === MAX_LEVEL ? 100 : 
      Math.round(((tracker?.experiencePoints || 0) - currentLevelExp) / (nextLevelExp - currentLevelExp) * 100);

    // Get available achievements (not yet completed)
    const allAchievements = await storage.getAllComplianceAchievements();
    const completedAchievementIds = userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievementId);
    const availableAchievements = allAchievements.filter(a => !completedAchievementIds.includes(a.id));

    // Get next milestone
    const allMilestones = await storage.getAllComplianceMilestones();
    const achievedMilestoneIds = userMilestones.map(um => um.milestoneId);
    const nextMilestone = allMilestones
      .filter(m => !achievedMilestoneIds.includes(m.id))
      .sort((a, b) => a.requiredScore - b.requiredScore)[0];

    return {
      tracker,
      level: tracker?.level || 1,
      experiencePoints: tracker?.experiencePoints || 0,
      overallScore: tracker?.overallScore || 0,
      currentStreak: tracker?.currentStreak || 0,
      longestStreak: tracker?.longestStreak || 0,
      progressToNextLevel,
      recentAchievements: userAchievements.filter(ua => ua.isCompleted).slice(0, 5),
      availableAchievements: availableAchievements.slice(0, 10),
      recentActivities,
      nextMilestone,
      milestoneProgress: nextMilestone ? {
        current: tracker?.overallScore || 0,
        required: nextMilestone.requiredScore,
        percentage: Math.min(Math.round(((tracker?.overallScore || 0) / nextMilestone.requiredScore) * 100), 100)
      } : null,
    };
  }

  /**
   * Seed default achievements and milestones
   */
  async seedDefaultData(): Promise<void> {
    // Seed achievements
    const existingAchievements = await storage.getAllComplianceAchievements();
    if (existingAchievements.length === 0) {
      for (const achievement of DEFAULT_ACHIEVEMENTS) {
        await storage.createComplianceAchievement(achievement);
      }
      console.log('✓ Default compliance achievements seeded');
    }

    // Seed milestones
    const existingMilestones = await storage.getAllComplianceMilestones();
    if (existingMilestones.length === 0) {
      for (const milestone of DEFAULT_MILESTONES) {
        await storage.createComplianceMilestone(milestone);
      }
      console.log('✓ Default compliance milestones seeded');
    }
  }
}

export const complianceGamification = new ComplianceGamificationService();