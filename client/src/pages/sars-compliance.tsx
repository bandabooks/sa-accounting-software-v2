import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

export default function SARSCompliance() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SARS Compliance</h1>
          <p className="text-gray-600 mt-1">
            Manage South African Revenue Service compliance requirements
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileText className="h-4 w-4 mr-2" />
          New SARS Filing
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-700">VAT Returns</p>
                <p className="text-xl font-bold text-blue-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-xl font-bold text-green-900">8</p>
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
                <p className="text-xl font-bold text-orange-900">3</p>
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
                <p className="text-xl font-bold text-red-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SARS Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              VAT Returns (VAT201)
            </CardTitle>
            <CardDescription>
              Monthly/Bi-monthly VAT return submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">28 Feb 2025</Badge>
              </div>
              <Button className="w-full">Manage VAT Returns</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Income Tax Returns
            </CardTitle>
            <CardDescription>
              Annual income tax return filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">31 Jan 2026</Badge>
              </div>
              <Button className="w-full" variant="outline">View Returns</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              PAYE Submissions
            </CardTitle>
            <CardDescription>
              Monthly payroll tax submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">7 Feb 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage PAYE</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              UIF Returns
            </CardTitle>
            <CardDescription>
              Unemployment Insurance Fund returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">7 Feb 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage UIF</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              SDL Returns
            </CardTitle>
            <CardDescription>
              Skills Development Levy submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">7 Feb 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">Manage SDL</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              Provisional Tax
            </CardTitle>
            <CardDescription>
              Bi-annual provisional tax payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next Due:</span>
                <Badge variant="outline">31 Aug 2025</Badge>
              </div>
              <Button className="w-full" variant="outline">View Payments</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}