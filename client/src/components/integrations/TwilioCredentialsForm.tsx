import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, RefreshCw, Eye, EyeOff, ExternalLink } from "lucide-react";

export function TwilioCredentialsForm({ 
  onSave, 
  isLoading 
}: { 
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [credentials, setCredentials] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    testMode: false
  });
  
  const [showAuthToken, setShowAuthToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send non-empty fields
    const dataToSend = Object.entries(credentials).reduce((acc, [key, value]) => {
      if ((typeof value === 'string' && value.trim() !== '') || typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>Twilio Account Required:</strong> Sign up for a Twilio account to enable SMS notifications. Get your credentials from the Twilio Console.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input
            id="accountSid"
            value={credentials.accountSid}
            onChange={(e) => setCredentials(prev => ({ ...prev, accountSid: e.target.value }))}
            placeholder="AC..."
          />
          <p className="text-sm text-gray-600">Your Twilio Account SID from the Console Dashboard</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authToken">Auth Token</Label>
          <div className="relative">
            <Input
              id="authToken"
              type={showAuthToken ? "text" : "password"}
              value={credentials.authToken}
              onChange={(e) => setCredentials(prev => ({ ...prev, authToken: e.target.value }))}
              placeholder="Enter your Auth Token"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowAuthToken(!showAuthToken)}
            >
              {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your Twilio Auth Token for API authentication</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
          <Input
            id="phoneNumber"
            value={credentials.phoneNumber}
            onChange={(e) => setCredentials(prev => ({ ...prev, phoneNumber: e.target.value }))}
            placeholder="+1234567890"
          />
          <p className="text-sm text-gray-600">Your Twilio phone number for sending SMS</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testMode">Test Mode</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="testMode"
              checked={credentials.testMode}
              onCheckedChange={(checked) => setCredentials(prev => ({ ...prev, testMode: checked }))}
            />
            <span className="text-sm text-gray-600">Use test credentials (no actual SMS sent)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <ExternalLink className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">Need Twilio Credentials?</p>
          <p className="text-sm text-blue-700">
            Visit{' '}
            <a 
              href="https://console.twilio.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Twilio Console
            </a>
            {' '}to get your Account SID, Auth Token, and purchase a phone number.
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
              <MessageSquare className="h-4 w-4 mr-2" />
              Save Twilio Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}