import { useQuery } from "@tanstack/react-query";
import { Banknote, AlertTriangle, ArrowRight, Building2, FileCheck } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils-invoice";

interface BankAccount {
  accountName: string;
  accountNumber: string;
  balance: string;
}

interface ComplianceAlert {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  action: string;
}

interface BankComplianceCardProps {
  bankBalances?: BankAccount[];
  complianceAlerts?: ComplianceAlert[];
}

export default function BankComplianceCard({ bankBalances = [], complianceAlerts = [] }: BankComplianceCardProps) {
  // Check if banking integration is enabled (has bank accounts)
  const hasBankingIntegration = bankBalances && bankBalances.length > 0;

  if (hasBankingIntegration) {
    // Show Bank Accounts card
    const totalBalance = bankBalances.reduce((total, account) => {
      return total + parseFloat(account.balance || '0');
    }, 0);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Banknote className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Accounts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected accounts overview</p>
            </div>
          </div>
          <Link href="/banking">
            <ArrowRight className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
          </Link>
        </div>

        {/* Total Balance */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalBalance.toString())}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total across all accounts</p>
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {bankBalances.slice(0, 3).map((account, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.accountName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">...{account.accountNumber.slice(-4)}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(account.balance)}
              </span>
            </div>
          ))}
          
          {bankBalances.length > 3 && (
            <div className="text-center pt-2">
              <Link href="/banking">
                <span className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                  View all {bankBalances.length} accounts
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Link href="/banking/reconciliation" className="flex-1">
              <button className="w-full px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                Reconcile
              </button>
            </Link>
            <Link href="/payments/new" className="flex-1">
              <button className="w-full px-3 py-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                Record Payment
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show only real compliance alerts - no demo data
  const alertsToShow = complianceAlerts;
  const highPriorityAlerts = alertsToShow.filter(alert => alert.severity === 'high');
  const urgentAlerts = alertsToShow.slice(0, 4); // Show max 4 alerts

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            highPriorityAlerts.length > 0 
              ? 'bg-red-100 dark:bg-red-900/20' 
              : 'bg-amber-100 dark:bg-amber-900/20'
          }`}>
            <AlertTriangle className={`${
              highPriorityAlerts.length > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`} size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Urgent tasks & deadlines</p>
          </div>
        </div>
        <Link href="/compliance">
          <ArrowRight className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
        </Link>
      </div>

      {/* Alerts Summary */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          {highPriorityAlerts.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {highPriorityAlerts.length} urgent
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {alertsToShow.length} total alerts
            </span>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {urgentAlerts.map((alert, index) => (
          <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${
            alert.severity === 'high' 
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' 
              : alert.severity === 'medium'
              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
          }`}>
            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
              alert.severity === 'high' ? 'bg-red-500' : 
              alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {alert.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {alert.type === 'vat' ? 'VAT Return' : 
                 alert.type === 'overdue' ? 'Overdue Invoices' : 
                 alert.type === 'stock' ? 'Inventory Alert' : 'Compliance'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/vat-management">
            <button className="w-full px-3 py-2 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              VAT Returns
            </button>
          </Link>
          <Link href="/reports">
            <button className="w-full px-3 py-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center space-x-1">
              <FileCheck className="w-3 h-3" />
              <span>Reports</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}