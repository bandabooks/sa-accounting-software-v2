import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, Shield, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalIdDisplayProps {
  companyId?: number;
  showUserInfo?: boolean;
}

export function ProfessionalIdDisplay({ companyId, showUserInfo = true }: ProfessionalIdDisplayProps) {
  const { toast } = useToast();

  // Fetch company professional ID
  const companyQuery = useQuery({
    queryKey: [`/api/companies/${companyId}/professional-id`],
    enabled: !!companyId,
  });

  // Fetch user professional ID
  const userQuery = useQuery({
    queryKey: ['/api/users/me/professional-id'],
    enabled: showUserInfo,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard`,
      });
    });
  };

  const StatusBadge = ({ isValid }: { isValid: boolean }) => (
    <Badge variant={isValid ? "default" : "destructive"} className="ml-2">
      {isValid ? (
        <>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Valid
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-4">
      {/* Company Professional ID */}
      {companyId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Company ID
              {companyQuery.data && (
                <StatusBadge isValid={companyQuery.data.isValid} />
              )}
            </CardTitle>
            <CardDescription>
              Professional company identification number similar to Zoho's system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companyQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Loading company ID...</span>
              </div>
            ) : companyQuery.error ? (
              <div className="text-red-600 text-sm">
                Failed to load company ID
              </div>
            ) : companyQuery.data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-mono text-xl font-bold text-blue-900">
                      {companyQuery.data.companyId || 'Not assigned'}
                    </div>
                    <div className="text-sm text-blue-700">
                      {companyQuery.data.displayName}
                    </div>
                  </div>
                  {companyQuery.data.companyId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(companyQuery.data.companyId, 'Company ID')}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
                {!companyQuery.data.isValid && companyQuery.data.companyId && (
                  <div className="text-amber-600 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    This ID format is not standard. Consider running the professional ID migration.
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* User Professional ID */}
      {showUserInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-green-600" />
              User ID
              {userQuery.data && (
                <StatusBadge isValid={userQuery.data.isValid} />
              )}
            </CardTitle>
            <CardDescription>
              Your professional user identification number
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-500">Loading user ID...</span>
              </div>
            ) : userQuery.error ? (
              <div className="text-red-600 text-sm">
                Failed to load user ID
              </div>
            ) : userQuery.data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-mono text-xl font-bold text-green-900">
                      {userQuery.data.userId || 'Not assigned'}
                    </div>
                    <div className="text-sm text-green-700">
                      {userQuery.data.name} (@{userQuery.data.username})
                    </div>
                  </div>
                  {userQuery.data.userId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(userQuery.data.userId, 'User ID')}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
                {!userQuery.data.isValid && userQuery.data.userId && (
                  <div className="text-amber-600 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    This ID format is not standard. Consider running the professional ID migration.
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">About Professional IDs</p>
              <p>
                These unique incremental IDs are generated automatically for all companies and users, 
                providing a professional identification system similar to Zoho's platform. Company IDs 
                start from 904886369 and User IDs from 905886372.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfessionalIdDisplay;