import React from 'react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, Users, Building2, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProfessionalIdDisplay from '@/components/professional-ids/ProfessionalIdDisplay';

export default function ProfessionalIdsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const migrationMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      return await apiRequest('/api/admin/migrate-professional-ids', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Migration Completed Successfully",
        description: data.message || "Professional IDs have been assigned to all companies and users",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Invalidate queries to refresh the display
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to migrate professional IDs",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Professional ID Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and assign professional company and user IDs similar to Zoho's system
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Company IDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">904886369+</div>
            <div className="text-sm text-gray-600">Starting range for companies</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              User IDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">905886372+</div>
            <div className="text-sm text-gray-600">Starting range for users</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 mr-2 text-purple-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <div className="text-sm text-gray-600">Professional ID system</div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Control */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Professional ID Migration
          </CardTitle>
          <CardDescription className="text-orange-700">
            Run this migration to assign professional IDs to existing companies and users that don't have them yet.
            This is a one-time process that will update all records in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Migration Process:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Assigns incremental company IDs starting from 904886369</li>
              <li>• Assigns incremental user IDs starting from 905886372</li>
              <li>• Updates existing records without professional IDs</li>
              <li>• Preserves existing professional IDs if already assigned</li>
              <li>• Safe to run multiple times (idempotent operation)</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => migrationMutation.mutate()} 
            disabled={migrationMutation.isPending || isProcessing}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Migration...
              </>
            ) : migrationMutation.isPending ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Starting Migration...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Professional ID Migration
              </>
            )}
          </Button>
          
          {migrationMutation.isSuccess && (
            <div className="flex items-center text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Migration completed successfully! All entities now have professional IDs.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Professional IDs Display */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Professional IDs</h2>
        <ProfessionalIdDisplay companyId={2} showUserInfo={true} />
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional ID System Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Enhanced Professionalism</h4>
              <p className="text-sm text-gray-600">
                Professional incremental IDs provide a more enterprise-like identification system 
                similar to industry leaders like Zoho.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Improved Data Integrity</h4>
              <p className="text-sm text-gray-600">
                Unique, sequential IDs prevent conflicts and provide better data organization 
                across the entire platform.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Better User Experience</h4>
              <p className="text-sm text-gray-600">
                Users can easily reference and communicate about entities using memorable, 
                professional ID numbers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Future-Proof Architecture</h4>
              <p className="text-sm text-gray-600">
                Scalable ID system supports unlimited growth while maintaining consistency 
                and professional appearance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}