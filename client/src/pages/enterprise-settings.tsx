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

// NotificationSettings.tsx
import { useEffect, useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/api";

type Props = {
  notificationSettings?:
    | {
        systemUpdates: boolean; // <- give each toggle its own key
        emailAlerts: boolean;
        smsAlerts: boolean;
        pushNotifications: boolean;
      }
    | undefined;
  systemConfig?: any;
};

export default function NotificationSettings({ notificationSettings }: Props) {
  const q = useQueryClient();
  // local copy so one toggle doesn't rewrite the others
  const [local, setLocal] = useState({
    systemUpdates: false,
    emailAlerts: false,
    smsAlerts: false,
    pushNotifications: false,
  });

  useEffect(() => {
    if (notificationSettings)
      setLocal((p) => ({ ...p, ...notificationSettings }));
  }, [notificationSettings]);

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<typeof local>) =>
      apiRequest("/api/notifications/settings", "PUT", patch),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({ title: "Saved", description: "Notification settings updated." });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Could not save settings.",
        variant: "destructive",
      });
    },
  });

  // one handler that flips a single key
  const toggle = (key: keyof typeof local) => (checked: boolean) => {
    setLocal((prev) => {
      const next = { ...prev, [key]: checked };
      // save only the changed key so we don't clobber others
      saveMutation.mutate({ [key]: checked });
      return next;
    });
  };

  // unique ids (avoid duplicate htmlFor/ids)
  const idSys = useId();
  const idEmail = useId();
  const idSms = useId();
  const idPush = useId();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor={idSys}>System updates</Label>
        <Switch
          id={idSys}
          checked={local.systemUpdates}
          onCheckedChange={toggle("systemUpdates")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor={idEmail}>Email alerts</Label>
        <Switch
          id={idEmail}
          checked={local.emailAlerts}
          onCheckedChange={toggle("emailAlerts")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor={idSms}>SMS alerts</Label>
        <Switch
          id={idSms}
          checked={local.smsAlerts}
          onCheckedChange={toggle("smsAlerts")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor={idPush}>Push notifications</Label>
        <Switch
          id={idPush}
          checked={local.pushNotifications}
          onCheckedChange={toggle("pushNotifications")}
        />
      </div>
    </div>
  );
}

