import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Shield, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export default function LabourCompliance() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labour Compliance</h1>
          <p className="text-gray-600 mt-1">
            Manage Department of Employment and Labour compliance requirements
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Shield className="h-4 w-4 mr-2" />
          New Labour Filing
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-700">Active Employees</p>
                <p className="text-xl font-bold text-blue-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-700">Compliant</p>
                <p className="text-xl font-bold text-green-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-700">Renewals Due</p>
                <p className="text-xl font-bold text-orange-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-700">Non-Compliant</p>
                <p className="text-xl font-bold text-red-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labour Compliance Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Employment Equity
            </CardTitle>
            <CardDescription>
              EE-1 to EE-9 employment equity reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">15 Jan 2025</Badge>
              </div>
              <Button className="w-full">Manage EE Reports</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Skills Development
            </CardTitle>
            <CardDescription>
              WSP-ATR and mandatory grants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">30 Apr 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage Skills Dev</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Work Permits & Visas
            </CardTitle>
            <CardDescription>
              Foreign worker documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Expiring Soon:</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage Permits</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-orange-600" />
              Health & Safety
            </CardTitle>
            <CardDescription>
              OHS Act compliance and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Inspection:</span>
                <Badge variant="outline">Mar 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage OHS</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Labour Relations
            </CardTitle>
            <CardDescription>
              CCMA cases and labour disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Open Cases:</span>
                <Badge variant="outline">2</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage Cases</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-600" />
              Bargaining Councils
            </CardTitle>
            <CardDescription>
              Industry-specific council registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Registered:</span>
                <Badge variant="outline">3 Councils</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage Councils</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}