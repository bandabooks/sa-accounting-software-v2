import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

export default function CIPCCompliance() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CIPC Compliance</h1>
          <p className="text-gray-600 mt-1">
            Manage Companies and Intellectual Property Commission requirements
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          New CIPC Filing
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-700">Annual Returns</p>
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
                <p className="text-sm font-medium text-green-700">Filed</p>
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
                <p className="text-sm font-medium text-orange-700">Due Soon</p>
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
                <p className="text-sm font-medium text-red-700">Overdue</p>
                <p className="text-xl font-bold text-red-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CIPC Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Annual Returns (CoR9)
            </CardTitle>
            <CardDescription>
              Mandatory annual company returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Filing Period:</span>
                <Badge variant="outline">Annually</Badge>
              </div>
              <Button className="w-full">Manage Returns</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-green-600" />
              Company Registrations
            </CardTitle>
            <CardDescription>
              New company registration applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Processing Time:</span>
                <Badge variant="outline">5-10 days</Badge>
              </div>
              <Button className="w-full" variant="outline">New Registration</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Change of Directors
            </CardTitle>
            <CardDescription>
              Director appointment/resignation filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Form:</span>
                <Badge variant="outline">CoR21.1/21.2</Badge>
              </div>
              <Button className="w-full" variant="outline">File Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Share Capital Changes
            </CardTitle>
            <CardDescription>
              Share allotment and transfer filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Form:</span>
                <Badge variant="outline">CoR15.1</Badge>
              </div>
              <Button className="w-full" variant="outline">File Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Notice of Address Change
            </CardTitle>
            <CardDescription>
              Registered office address changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Form:</span>
                <Badge variant="outline">CoR16</Badge>
              </div>
              <Button className="w-full" variant="outline">Update Address</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              Beneficial Ownership
            </CardTitle>
            <CardDescription>
              Beneficial ownership disclosures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Form:</span>
                <Badge variant="outline">CoR25</Badge>
              </div>
              <Button className="w-full" variant="outline">File Disclosure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}