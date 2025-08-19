import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Activity, TrendingUp, Star, Award, CheckCircle, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ComplianceTracker {
  id: number;
  companyId: number;
  level: number;
  overallScore: number;
  vatScore: number;
  payrollScore: number;
  auditScore: number;
  documentationScore: number;
  currentStreak: number;
  longestStreak: number;
  weeklyTarget: number;
  monthlyTarget: number;
  lastActivityDate: string | null;
  nextMilestone: number;
  totalAchievements: number;
  createdAt: string;
  updatedAt: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  badge: string;
  pointsAwarded: number;
  isActive: boolean;
  unlockedAt?: string;
}

interface Milestone {
  id: number;
  name: string;
  description: string;
  targetScore: number;
  category: string;
  icon: string;
  reward: string;
  isActive: boolean;
  achievedAt?: string;
}

interface ComplianceActivity {
  id: number;
  activityType: string;
  activityName: string;
  description?: string;
  pointsEarned: number;
  activityDate: string;
}

interface ComplianceDashboard {
  tracker: ComplianceTracker;
  achievements: Achievement[];
  milestones: Milestone[];
  recentActivities: ComplianceActivity[];
  nextLevelProgress: {
    current: number;
    required: number;
    percentage: number;
  };
}

export default function ComplianceTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize compliance tracker
  const initTrackerMutation = useMutation({
    mutationFn: () => apiRequest("/api/compliance/tracker/init", "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/dashboard"] });
      toast({
        title: "Compliance Tracker Initialized",
        description: "Your tax compliance journey has begun! Complete tasks to earn points and unlock achievements.",
      });
    },
    onError: (error) => {
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize compliance tracker. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get compliance dashboard data
  const { data: dashboard, isLoading, error } = useQuery<ComplianceDashboard>({
    queryKey: ["/api/compliance/dashboard"],
    retry: false,
  });

  // Record activity mutation
  const recordActivityMutation = useMutation({
    mutationFn: (activity: {
      activityType: string;
      activityName: string;
      description?: string;
      relatedRecordType?: string;
      relatedRecordId?: number;
    }) => apiRequest("/api/compliance/activity", "POST", activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/dashboard"] });
      toast({
        title: "Activity Recorded",
        description: "Points earned! Keep up the great work!",
      });
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, label: "Excellent" };
    if (score >= 80) return { variant: "secondary" as const, label: "Good" };
    if (score >= 60) return { variant: "outline" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Needs Attention" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax Compliance Tracker</h1>
            <p className="text-muted-foreground">
              Gamified tax compliance management with achievements and progress tracking
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax Compliance Tracker</h1>
            <p className="text-muted-foreground">
              Gamified tax compliance management with achievements and progress tracking
            </p>
          </div>
        </div>
        <Card className="text-center p-8">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Start Your Compliance Journey</h2>
          <p className="text-muted-foreground mb-4">
            Initialize your personalized tax compliance tracker to begin earning points, 
            unlocking achievements, and making tax compliance fun and engaging!
          </p>
          <Button 
            onClick={() => initTrackerMutation.mutate()}
            disabled={initTrackerMutation.isPending}
            size="lg"
          >
            {initTrackerMutation.isPending ? "Initializing..." : "Initialize Compliance Tracker"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Compliance Tracker</h1>
          <p className="text-muted-foreground">
            Level {dashboard?.tracker.level} • {dashboard?.tracker.overallScore} Points • {dashboard?.tracker.totalAchievements} Achievements
          </p>
        </div>
        <Button 
          onClick={() => recordActivityMutation.mutate({
            activityType: "manual",
            activityName: "Quick Check",
            description: "Manual compliance check completed"
          })}
          disabled={recordActivityMutation.isPending}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Record Activity
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(dashboard?.tracker.overallScore || 0)}`}>
              {dashboard?.tracker.overallScore || 0}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge {...getScoreBadge(dashboard?.tracker.overallScore || 0)}>
                {getScoreBadge(dashboard?.tracker.overallScore || 0).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboard?.tracker.currentStreak || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {dashboard?.tracker.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Level {dashboard?.tracker.level || 1}
            </div>
            {dashboard?.nextLevelProgress && (
              <>
                <Progress value={dashboard.nextLevelProgress.percentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboard.nextLevelProgress.current} / {dashboard.nextLevelProgress.required}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboard?.tracker.totalAchievements || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unlocked so far
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Categories</CardTitle>
                <CardDescription>Your progress across different tax compliance areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">VAT Compliance</span>
                    <span className={`text-sm ${getScoreColor(dashboard?.tracker.vatScore || 0)}`}>
                      {dashboard?.tracker.vatScore || 0}%
                    </span>
                  </div>
                  <Progress value={dashboard?.tracker.vatScore || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Payroll Compliance</span>
                    <span className={`text-sm ${getScoreColor(dashboard?.tracker.payrollScore || 0)}`}>
                      {dashboard?.tracker.payrollScore || 0}%
                    </span>
                  </div>
                  <Progress value={dashboard?.tracker.payrollScore || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Audit Readiness</span>
                    <span className={`text-sm ${getScoreColor(dashboard?.tracker.auditScore || 0)}`}>
                      {dashboard?.tracker.auditScore || 0}%
                    </span>
                  </div>
                  <Progress value={dashboard?.tracker.auditScore || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Documentation</span>
                    <span className={`text-sm ${getScoreColor(dashboard?.tracker.documentationScore || 0)}`}>
                      {dashboard?.tracker.documentationScore || 0}%
                    </span>
                  </div>
                  <Progress value={dashboard?.tracker.documentationScore || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly & Monthly Targets</CardTitle>
                <CardDescription>Your compliance activity targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Weekly Target</span>
                    <span className="text-sm text-muted-foreground">
                      {dashboard?.tracker.weeklyTarget || 0} points
                    </span>
                  </div>
                  <Progress value={65} />
                  <p className="text-xs text-muted-foreground">65% completed this week</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Target</span>
                    <span className="text-sm text-muted-foreground">
                      {dashboard?.tracker.monthlyTarget || 0} points
                    </span>
                  </div>
                  <Progress value={42} />
                  <p className="text-xs text-muted-foreground">42% completed this month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard?.achievements?.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlockedAt ? "bg-green-50 border-green-200" : "opacity-60"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-sm">{achievement.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    {achievement.unlockedAt && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-600">
                      +{achievement.pointsAwarded} points
                    </span>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-green-600">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                <Award className="h-16 w-16 mx-auto mb-4" />
                <p>Complete compliance tasks to unlock achievements!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard?.milestones?.map((milestone) => (
              <Card key={milestone.id} className={milestone.achievedAt ? "bg-blue-50 border-blue-200" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{milestone.icon}</div>
                      <div>
                        <CardTitle>{milestone.name}</CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </div>
                    </div>
                    {milestone.achievedAt && <CheckCircle className="h-6 w-6 text-blue-600" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Target Score</span>
                    <span className="font-medium">{milestone.targetScore} points</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">Reward</span>
                    <span className="text-sm font-medium text-green-600">{milestone.reward}</span>
                  </div>
                  {!milestone.achievedAt && (
                    <Progress 
                      value={Math.min(100, ((dashboard?.tracker.overallScore || 0) / milestone.targetScore) * 100)} 
                      className="mb-2"
                    />
                  )}
                  {milestone.achievedAt && (
                    <p className="text-sm text-blue-600">
                      Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4" />
                <p>Milestones will appear as you progress!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest compliance activities and points earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.activityName}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.activityDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      +{activity.pointsEarned} pts
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center p-8 text-muted-foreground">
                    <Clock className="h-16 w-16 mx-auto mb-4" />
                    <p>No recent activities. Start completing compliance tasks to see your progress here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}