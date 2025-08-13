import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw, Eye, EyeOff, ExternalLink } from "lucide-react";

export function SendGridCredentialsForm({ 
  onSave, 
  isLoading 
}: { 
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [credentials, setCredentials] = useState({
    apiKey: '',
    fromEmail: '',
    fromName: '',
    replyToEmail: ''
  });
  
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send non-empty fields
    const dataToSend = Object.entries(credentials).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>SendGrid Account Required:</strong> Sign up for a SendGrid account to enable email notifications. Get your API key from the SendGrid Dashboard.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={credentials.apiKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="SG...."
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your SendGrid API key with full access permissions</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            value={credentials.fromEmail}
            onChange={(e) => setCredentials(prev => ({ ...prev, fromEmail: e.target.value }))}
            placeholder="noreply@yourdomain.com"
          />
          <p className="text-sm text-gray-600">Verified sender email address</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromName">From Name</Label>
          <Input
            id="fromName"
            value={credentials.fromName}
            onChange={(e) => setCredentials(prev => ({ ...prev, fromName: e.target.value }))}
            placeholder="Your Company Name"
          />
          <p className="text-sm text-gray-600">Display name for sent emails</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="replyToEmail">Reply-To Email</Label>
          <Input
            id="replyToEmail"
            type="email"
            value={credentials.replyToEmail}
            onChange={(e) => setCredentials(prev => ({ ...prev, replyToEmail: e.target.value }))}
            placeholder="support@yourdomain.com"
          />
          <p className="text-sm text-gray-600">Email address for replies (optional)</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <ExternalLink className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">Need SendGrid Credentials?</p>
          <p className="text-sm text-green-700">
            Visit{' '}
            <a 
              href="https://app.sendgrid.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              SendGrid Dashboard
            </a>
            {' '}to create an API key and verify your sender domain.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Save SendGrid Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}