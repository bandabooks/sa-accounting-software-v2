import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [dashboardViewType, setDashboardViewType] = useState<'practitioner' | 'business'>('practitioner');

  const handleViewToggle = () => {
    setDashboardViewType(prev => prev === 'practitioner' ? 'business' : 'practitioner');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pb-8">
        
        {/* Simple Header with View Toggle */}
        <div className="py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dashboardViewType === 'practitioner' ? 'Practice Dashboard' : 'Business Dashboard'}
              </h1>
              <p className="text-gray-600">
                {dashboardViewType === 'practitioner' 
                  ? 'Manage your client portfolio and practice operations'
                  : 'Monitor your business performance and financials'
                }
              </p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex gap-2">
              <Button
                variant={dashboardViewType === 'practitioner' ? 'default' : 'outline'}
                onClick={() => setDashboardViewType('practitioner')}
                className="whitespace-nowrap"
              >
                Practice Dashboard
              </Button>
              <Button
                variant={dashboardViewType === 'business' ? 'default' : 'outline'}
                onClick={() => setDashboardViewType('business')}
                className="whitespace-nowrap"
              >
                Business Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Simple Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dashboardViewType === 'practitioner' ? 'Active Clients' : 'Total Revenue'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardViewType === 'practitioner' ? '25' : 'R 45,231.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dashboardViewType === 'practitioner' ? 'Compliance Rate' : 'Outstanding Invoices'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardViewType === 'practitioner' ? '98%' : 'R 12,450.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardViewType === 'practitioner' ? 'On track' : '3 pending invoices'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dashboardViewType === 'practitioner' ? 'VAT Returns Due' : 'Customers'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardViewType === 'practitioner' ? '3' : '45'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardViewType === 'practitioner' ? 'Next 7 days' : 'Active customers'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dashboardViewType === 'practitioner' ? 'Practice Revenue' : 'Growth Rate'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardViewType === 'practitioner' ? 'R 85,400.00' : '+12.5%'}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {dashboardViewType === 'practitioner' ? 'Client Overview' : 'Business Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {dashboardViewType === 'practitioner' 
                ? 'Welcome to your practice dashboard. Here you can manage multiple client companies, track compliance deadlines, and monitor your practice performance.'
                : 'Welcome to your business dashboard. Monitor your company performance, track revenue, manage customers, and view financial reports.'
              }
            </p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">
                  {dashboardViewType === 'practitioner' ? 'Recent Client Activity' : 'Recent Business Activity'}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• {dashboardViewType === 'practitioner' ? 'ABC Corp VAT return submitted' : 'Invoice #001 sent to customer'}</li>
                  <li>• {dashboardViewType === 'practitioner' ? 'XYZ Ltd annual return filed' : 'Payment received: R 5,500.00'}</li>
                  <li>• {dashboardViewType === 'practitioner' ? 'DEF CC compliance check completed' : 'New customer added: Tech Solutions'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}