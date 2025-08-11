import React from 'react';
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Users, Building2, User, PlayCircle, CheckCircle2, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProfessionalIdDisplay from '@/components/professional-ids/ProfessionalIdDisplay';

export default function ProfessionalIdsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Query to get sample companies with their professional IDs
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/admin/companies-with-ids"],
  });

  // Query to get sample users with their professional IDs
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/super-admin/users-with-ids"],
  });

  // Company ID migration
  const companyMigrationMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      return await apiRequest('/api/admin/migrate-professional-ids', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Company Migration Completed",
        description: data.message || "Professional IDs have been assigned to all companies",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/companies-with-ids'] });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Company Migration Failed",
        description: error.message || "Failed to migrate company professional IDs",
        variant: "destructive",
      });
    },
  });

  // User ID migration
  const userMigrationMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      return await apiRequest('/api/super-admin/migrate-user-ids', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "User Migration Completed",
        description: data.message || "Professional IDs have been assigned to all users",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users-with-ids'] });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "User Migration Failed",
        description: error.message || "Failed to migrate user professional IDs",
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
            <div className="text-sm text-gray-600">Professional company numbering</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-green-600" />
              User IDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">003+</div>
            <div className="text-sm text-gray-600">Simple user numbering</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <div className="text-sm text-gray-600">Professional ID system</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface for Professional ID Management */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company IDs
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User IDs
          </TabsTrigger>
        </TabsList>

        {/* Company ID Management Tab */}
        <TabsContent value="companies" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Company Professional ID Migration
              </CardTitle>
              <CardDescription className="text-orange-700">
                Assign professional IDs to existing companies that don't have them yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">Company Migration Process:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Assigns incremental company IDs starting from 904886369</li>
                  <li>• Updates existing companies without professional IDs</li>
                  <li>• Preserves existing professional IDs if already assigned</li>
                  <li>• Safe to run multiple times (idempotent operation)</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => companyMigrationMutation.mutate()} 
                disabled={companyMigrationMutation.isPending || isProcessing}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Migration...
                  </>
                ) : companyMigrationMutation.isPending ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Starting Migration...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Company ID Migration
                  </>
                )}
              </Button>
              
              {companyMigrationMutation.isSuccess && (
                <div className="flex items-center text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Company migration completed successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Professional IDs Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Company Professional IDs
              </CardTitle>
              <CardDescription>Companies with assigned professional IDs</CardDescription>
            </CardHeader>
            <CardContent>
              {companiesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              ) : companies && companies.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {companies.map((company: any) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-blue-900">{company.companyId || company.company_id}</div>
                        <div className="text-sm text-blue-700">{company.name}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(company.companyId || company.company_id);
                          toast({ title: "Copied!", description: "Company ID copied to clipboard" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No companies found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User ID Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-green-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                User Professional ID Migration
              </CardTitle>
              <CardDescription className="text-green-700">
                Assign simple professional IDs to existing users that don't have them yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">User Migration Process:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Assigns simple user IDs starting from 003</li>
                  <li>• Updates existing users without professional IDs</li>
                  <li>• Uses non-reusable numbering (IDs never reused after deletion)</li>
                  <li>• Independent from company numbering system</li>
                  <li>• Safe to run multiple times (idempotent operation)</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => userMigrationMutation.mutate()} 
                disabled={userMigrationMutation.isPending || isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Migration...
                  </>
                ) : userMigrationMutation.isPending ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Starting Migration...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run User ID Migration
                  </>
                )}
              </Button>
              
              {userMigrationMutation.isSuccess && (
                <div className="flex items-center text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  User migration completed successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Professional IDs Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                User Professional IDs
              </CardTitle>
              <CardDescription>Users with assigned professional IDs</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-green-900">
                          {user.userId || 'Not assigned'}
                          {user.userId && (
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                              ID:{user.userId}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-green-700">
                          {user.name} ({user.username})
                        </div>
                        <div className="text-xs text-green-600">{user.email}</div>
                      </div>
                      {user.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(user.userId);
                            toast({ title: "Copied!", description: "User ID copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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