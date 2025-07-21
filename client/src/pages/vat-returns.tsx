import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, Calendar, BarChart3 } from 'lucide-react';

const VATReturns: React.FC = () => {
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatReports } = useQuery({
    queryKey: ["/api/vat-reports"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Returns (VAT201)</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage VAT returns and submissions to SARS</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            VAT Returns (VAT201)
          </CardTitle>
          <CardDescription>
            Manage VAT returns and submissions to SARS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vatSettings?.isVatRegistered ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">VAT Registration Required</h3>
              <p className="text-red-700 mb-4">
                VAT returns are only available for VAT-registered companies.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/vat-settings'}>
                Configure VAT Registration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">VAT Returns Available</span>
                </div>
                <p className="text-sm text-green-700">
                  Your company is VAT registered. VAT returns and VAT201 submissions are now available.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Current Period</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {vatSettings.vatPeriodMonths === 1 ? "Monthly" : 
                     vatSettings.vatPeriodMonths === 2 ? "Bi-Monthly" : "Bi-Annual"} VAT Return
                  </p>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prepare VAT201
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Previous Returns</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    View and manage previously submitted VAT returns
                  </p>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">VAT Return Information</h3>
                <div className="grid gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">VAT Registration Number</span>
                      <Badge variant="outline">{vatSettings.vatRegistrationNumber || 'Not Set'}</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Submission Frequency</span>
                      <Badge variant="secondary">
                        {vatSettings.vatPeriodMonths === 1 ? "Monthly" : 
                         vatSettings.vatPeriodMonths === 2 ? "Bi-Monthly" : "Bi-Annual"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Submission Day</span>
                      <Badge variant="outline">{vatSettings.vatSubmissionDay || 25}th of month</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VATReturns;