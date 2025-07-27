import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Globe, TrendingUp } from 'lucide-react';

interface ComplianceDashboardProps {
  companyId: number;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ companyId }) => {
  const complianceScore = 88; // Overall compliance score
  
  const complianceChecks = [
    {
      category: "VAT Registration",
      status: "compliant",
      score: 100,
      items: [
        { check: "VAT Number Valid", status: "pass" },
        { check: "Registration Current", status: "pass" },
        { check: "SARS Profile Updated", status: "pass" }
      ]
    },
    {
      category: "VAT Returns",
      status: "warning",
      score: 85,
      items: [
        { check: "Returns Submitted On Time", status: "pass" },
        { check: "All Periods Covered", status: "warning" },
        { check: "No Outstanding Returns", status: "pass" }
      ]
    },
    {
      category: "Record Keeping",
      status: "compliant",
      score: 92,
      items: [
        { check: "Invoice Numbering Sequential", status: "pass" },
        { check: "VAT Invoices Compliant", status: "pass" },
        { check: "Supporting Documents", status: "pass" }
      ]
    },
    {
      category: "Payment Compliance",
      status: "critical",
      score: 70,
      items: [
        { check: "VAT Payments Current", status: "fail" },
        { check: "No Outstanding Penalties", status: "warning" },
        { check: "Interest Up to Date", status: "pass" }
      ]
    }
  ];

  const upcomingDeadlines = [
    {
      description: "VAT201 Return - Feb 2025",
      dueDate: "2025-03-25",
      daysLeft: 28,
      priority: "high"
    },
    {
      description: "VAT Payment - Jan 2025",
      dueDate: "2025-02-25",
      daysLeft: -2,
      priority: "critical"
    },
    {
      description: "Quarterly VAT Review",
      dueDate: "2025-04-30",
      daysLeft: 95,
      priority: "medium"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'pass':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'fail':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'pass':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'fail':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT Compliance Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor your VAT compliance status and upcoming requirements</p>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-blue-600">{complianceScore}%</p>
              <p className="text-sm text-gray-600">Good compliance standing</p>
            </div>
            <div className="text-right">
              <Badge className={complianceScore >= 90 ? 'bg-green-100 text-green-800' : complianceScore >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                {complianceScore >= 90 ? 'Excellent' : complianceScore >= 75 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
          <Progress value={complianceScore} className="w-full" />
          <p className="text-xs text-gray-500 mt-2">
            Based on VAT registration, returns submission, record keeping, and payment compliance
          </p>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complianceChecks.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(category.status)}
                  {category.category}
                </span>
                <Badge className={getStatusColor(category.status)}>
                  {category.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm">{item.check}</span>
                    <Badge size="sm" className={getStatusColor(item.status)}>
                      {item.status === 'pass' ? 'Pass' : item.status === 'warning' ? 'Warning' : 'Fail'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Compliance Deadlines
          </CardTitle>
          <CardDescription>
            Important VAT-related deadlines and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    deadline.daysLeft < 0 ? 'bg-red-500' : 
                    deadline.daysLeft <= 7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{deadline.description}</p>
                    <p className="text-sm text-gray-600">Due: {deadline.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    deadline.daysLeft < 0 ? 'text-red-600' : 
                    deadline.daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {deadline.daysLeft < 0 ? 
                      `${Math.abs(deadline.daysLeft)} days overdue` : 
                      `${deadline.daysLeft} days left`
                    }
                  </p>
                  <Badge size="sm" className={
                    deadline.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    deadline.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {deadline.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-semibold mb-2">Generate Compliance Report</h3>
              <Button size="sm" className="w-full">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Globe className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-semibold mb-2">Check SARS Status</h3>
              <Button size="sm" variant="outline" className="w-full">
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-semibold mb-2">Improve Score</h3>
              <Button size="sm" variant="outline" className="w-full">
                View Tips
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {upcomingDeadlines.some(d => d.daysLeft < 0 || d.priority === 'critical') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgent Action Required:</strong> You have overdue VAT obligations that require immediate attention. 
            Contact your tax advisor or SARS directly to resolve outstanding issues and avoid additional penalties.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ComplianceDashboard;