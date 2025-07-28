import { AlertTriangle, Clock, Package, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  type: 'overdue' | 'stock' | 'vat' | 'compliance';
  message: string;
  severity: 'high' | 'medium' | 'low';
  action: string;
}

interface ComplianceAlertsProps {
  alerts: Alert[];
}

export default function ComplianceAlerts({ alerts }: ComplianceAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return Clock;
      case 'stock':
        return Package;
      case 'vat':
        return FileText;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      'high': { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
      'medium': { label: 'Medium', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' },
      'low': { label: 'Low', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getActionButton = (action: string, severity: string) => {
    const buttonVariant = severity === 'high' ? 'destructive' : severity === 'medium' ? 'default' : 'secondary';
    
    const actionLabels = {
      'review-invoices': 'Review Invoices',
      'review-inventory': 'Check Inventory',
      'prepare-vat-return': 'Prepare VAT Return',
      'review-compliance': 'Review Compliance'
    };

    return (
      <Button 
        variant={buttonVariant} 
        size="sm"
        className="h-8 px-3 text-xs"
      >
        {actionLabels[action as keyof typeof actionLabels] || 'Take Action'}
      </Button>
    );
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance & Alerts</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">All Clear</span>
          </div>
        </div>
        
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 dark:text-green-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No compliance issues detected</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your business is running smoothly</p>
        </div>
      </div>
    );
  }

  // Separate alerts by severity
  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowPriorityAlerts = alerts.filter(alert => alert.severity === 'low');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance & Alerts</h3>
        <div className="flex items-center space-x-2">
          {highPriorityAlerts.length > 0 ? (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {/* High Priority Alerts */}
        {highPriorityAlerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.severity);
          
          return (
            <div key={`high-${index}`} className={`border rounded-lg p-4 ${colorClass}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <IconComponent size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      {alert.message}
                    </p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">
                      Requires immediate attention
                    </p>
                    {getActionButton(alert.action, alert.severity)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Medium Priority Alerts */}
        {mediumPriorityAlerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.severity);
          
          return (
            <div key={`medium-${index}`} className={`border rounded-lg p-4 ${colorClass}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <IconComponent size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      {alert.message}
                    </p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">
                      Should be addressed soon
                    </p>
                    {getActionButton(alert.action, alert.severity)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Low Priority Alerts */}
        {lowPriorityAlerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.severity);
          
          return (
            <div key={`low-${index}`} className={`border rounded-lg p-3 ${colorClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent size={16} />
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">For your information</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(alert.severity)}
                  {getActionButton(alert.action, alert.severity)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {alerts.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View all compliance items
          </button>
        </div>
      )}
    </div>
  );
}