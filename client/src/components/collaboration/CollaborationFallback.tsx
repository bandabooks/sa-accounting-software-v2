import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface CollaborationFallbackProps {
  hasError?: boolean;
  isConnecting?: boolean;
}

export function CollaborationFallback({ hasError, isConnecting }: CollaborationFallbackProps) {
  if (hasError) {
    return (
      <Card className="mb-6 border-l-4 border-l-amber-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Collaboration temporarily unavailable - working in single-user mode
            </span>
            <Badge variant="outline" className="text-xs">
              Offline
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnecting) {
    return (
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-blue-700">
              Connecting to collaboration system...
            </span>
            <Badge variant="outline" className="text-xs">
              Connecting
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-gray-300">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            Single user session - collaboration features disabled
          </span>
          <Badge variant="outline" className="text-xs">
            Solo Mode
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}