import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  Smartphone,
  Brain,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Lock,
  Unlock,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  History,
  Key,
  Zap,
  Globe,
  UserCheck,
  Activity,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SecuritySettings from "@/components/enterprise/SecuritySettings";
import NotificationSettings from "@/components/enterprise/NotificationSettings";
import OAuthSettings from "@/components/enterprise/OAuthSettings";
import AISettings from "@/components/enterprise/AISettings";
import PaymentSettings from "@/components/enterprise/PaymentSettings";
import AuditLogs from "@/components/enterprise/AuditLogs";

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
  secret?: string;
  qrCodeUrl?: string;
}

interface SystemConfiguration {
  features: {
    smtp: boolean;
    sms: boolean;
    googleOAuth: boolean;
    microsoftOAuth: boolean;
    ai: boolean;
  };
  providers: {
    ai: string[];
  };
}

interface AISettings {
  enabled: boolean;
  provider: string;
  contextSharing: boolean;
  conversationHistory: boolean;
  suggestions: boolean;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    invoiceReminders: boolean;
    paymentAlerts: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
  };
  sms: {
    enabled: boolean;
    criticalAlerts: boolean;
    paymentReminders: boolean;
  };
}

interface OAuthStatus {
  google: {
    connected: boolean;
    email?: string;
    connectedAt?: string;
  };
  microsoft: {
    connected: boolean;
    email?: string;
    connectedAt?: string;
  };
}

interface AuditLogEntry {
  id: number;
  action: string;
  resource: string;
  userId: number;
  userName: string;
  timestamp: string;
  details?: any;
}

export default function EnterpriseSettings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enterprise Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure advanced security, notifications, and enterprise features
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="oauth">OAuth</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="oauth">
            <OAuthSettings />
          </TabsContent>

          <TabsContent value="ai">
            <AISettings />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettings />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
