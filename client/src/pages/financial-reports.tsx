import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp, 
  Activity,
  FileBarChart,
  Receipt,
  PiggyBank,
  Building,
  ShieldCheck,
  FolderOpen,
  BarChart3,
  Calculator,
  BookOpen,
  Target,
  Settings,
  Filter,
  ChevronRight,
  Eye,
  Users,
  Clock,
  X,
  Printer,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingDown,
  DollarSign,
  Percent
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

interface ReportData {
  id: string;
  title: string;
  data: any;
  lastGenerated: string;
  summary?: {
    totalAssets?: number;
    totalLiabilities?: number;
    equity?: number;
    revenue?: number;
    expenses?: number;
    netIncome?: number;
    cashInflow?: number;
    cashOutflow?: number;
    netCashFlow?: number;
  };
}

export default function FinancialReports() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [modalReport, setModalReport] = useState<ReportData | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Mock data queries - replace with real API calls
  const { data: reportData } = useQuery({
    queryKey: ["/api/reports/summary", dateFrom, dateTo],
    queryFn: () => apiRequest(`/api/reports/summary?from=${dateFrom}&to=${dateTo}`, "GET"),
    select: (data) => ({
      balanceSheet: {
        id: "balance-sheet",
        title: "Balance Sheet",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          totalAssets: 2500000,
          totalLiabilities: 1200000,
          equity: 1300000
        },
        data: {
          assets: {
            current: [
              { account: "Cash and Cash Equivalents", amount: 450000 },
              { account: "Accounts Receivable", amount: 320000 },
              { account: "Inventory", amount: 180000 },
              { account: "Prepaid Expenses", amount: 25000 }
            ],
            nonCurrent: [
              { account: "Property, Plant & Equipment", amount: 1200000 },
              { account: "Intangible Assets", amount: 185000 },
              { account: "Long-term Investments", amount: 140000 }
            ]
          },
          liabilities: {
            current: [
              { account: "Accounts Payable", amount: 280000 },
              { account: "Short-term Debt", amount: 150000 },
              { account: "Accrued Expenses", amount: 95000 }
            ],
            nonCurrent: [
              { account: "Long-term Debt", amount: 525000 },
              { account: "Deferred Tax Liabilities", amount: 150000 }
            ]
          },
          equity: [
            { account: "Share Capital", amount: 800000 },
            { account: "Retained Earnings", amount: 500000 }
          ]
        }
      },
      profitLoss: {
        id: "profit-loss",
        title: "Profit & Loss Statement",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          revenue: 1850000,
          expenses: 1420000,
          netIncome: 430000
        },
        data: {
          revenue: [
            { account: "Sales Revenue", amount: 1600000 },
            { account: "Service Revenue", amount: 250000 }
          ],
          expenses: [
            { account: "Cost of Goods Sold", amount: 680000 },
            { account: "Operating Expenses", amount: 520000 },
            { account: "Administrative Expenses", amount: 220000 }
          ]
        }
      },
      cashFlow: {
        id: "cash-flow",
        title: "Cash Flow Statement",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          cashInflow: 1950000,
          cashOutflow: 1680000,
          netCashFlow: 270000
        },
        data: {
          operating: [
            { activity: "Net Income", amount: 430000 },
            { activity: "Depreciation", amount: 120000 },
            { activity: "Changes in Working Capital", amount: -85000 }
          ],
          investing: [
            { activity: "Purchase of Equipment", amount: -180000 },
            { activity: "Sale of Investments", amount: 65000 }
          ],
          financing: [
            { activity: "Loan Proceeds", amount: 200000 },
            { activity: "Dividends Paid", amount: -120000 }
          ]
        }
      },
      trialBalance: {
        id: "trial-balance",
        title: "Trial Balance",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        data: {
          accounts: [
            { account: "Cash", debit: 450000, credit: 0 },
            { account: "Accounts Receivable", debit: 320000, credit: 0 },
            { account: "Inventory", debit: 180000, credit: 0 },
            { account: "Equipment", debit: 1200000, credit: 0 },
            { account: "Accounts Payable", debit: 0, credit: 280000 },
            { account: "Long-term Debt", debit: 0, credit: 525000 },
            { account: "Share Capital", debit: 0, credit: 800000 },
            { account: "Retained Earnings", debit: 0, credit: 500000 },
            { account: "Sales Revenue", debit: 0, credit: 1600000 },
            { account: "Cost of Goods Sold", debit: 680000, credit: 0 }
          ]
        }
      }
    })
  });

  const reportCategories = [
    {
      id: "core-reports",
      title: "Core Financial Reports",
      description: "Essential financial statements and analysis",
      icon: BarChart3,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      gradient: "from-blue-600 via-indigo-700 to-purple-800",
      count: 4,
      reports: [
        { 
          id: "balance-sheet", 
          title: "Balance Sheet", 
          icon: FileText, 
          description: "Assets, liabilities & equity as at specific date",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.balanceSheet
        },
        { 
          id: "profit-loss", 
          title: "Profit & Loss Statement", 
          icon: TrendingUp, 
          description: "Revenue, expenses and net income analysis",
          lastGenerated: "2025-01-27", 
          frequency: "Monthly",
          data: reportData?.profitLoss
        },
        { 
          id: "cash-flow", 
          title: "Cash Flow Statement", 
          icon: Activity, 
          description: "Operating, investing & financing activities",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.cashFlow
        },
        { 
          id: "trial-balance", 
          title: "Trial Balance", 
          icon: Calculator, 
          description: "Account balance verification and summary",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.trialBalance
        }
      ]
    },
    {
      id: "analytical-reports", 
      title: "Analytical & Detail Reports",
      description: "Detailed analysis and operational insights",
      icon: Target,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      gradient: "from-emerald-600 via-green-700 to-teal-800",
      count: 4,
      reports: [
        { 
          id: "general-ledger", 
          title: "General Ledger", 
          icon: BookOpen, 
          description: "Detailed transaction history by account",
          lastGenerated: "2025-01-27",
          frequency: "Weekly",
          data: {
            id: "general-ledger",
            title: "General Ledger",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            data: {
              entries: [
                { date: "2025-01-27", account: "Cash", reference: "PV001", debit: 50000, credit: 0, balance: 50000 },
                { date: "2025-01-27", account: "Sales Revenue", reference: "INV001", debit: 0, credit: 50000, balance: 50000 },
                { date: "2025-01-26", account: "Office Expenses", reference: "EXP001", debit: 2500, credit: 0, balance: 2500 },
                { date: "2025-01-26", account: "Cash", reference: "EXP001", debit: 0, credit: 2500, balance: 47500 }
              ]
            }
          }
        },
        { 
          id: "aged-receivables", 
          title: "Aged Receivables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding customer balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly",
          data: {
            id: "aged-receivables",
            title: "Aged Receivables Analysis",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              total: 485000,
              current: 320000,
              overdue30: 95000,
              overdue60: 45000,
              overdue90: 25000
            },
            data: {
              customers: [
                { name: "ABC Corp", current: 120000, days30: 25000, days60: 0, days90: 0, total: 145000 },
                { name: "XYZ Ltd", current: 85000, days30: 35000, days60: 15000, days90: 10000, total: 145000 },
                { name: "DEF Industries", current: 115000, days30: 35000, days60: 30000, days90: 15000, total: 195000 }
              ]
            }
          }
        },
        { 
          id: "aged-payables", 
          title: "Aged Payables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding supplier balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly",
          data: {
            id: "aged-payables",
            title: "Aged Payables Analysis",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              total: 285000,
              current: 180000,
              overdue30: 65000,
              overdue60: 25000,
              overdue90: 15000
            },
            data: {
              suppliers: [
                { name: "Office Supplies Co", current: 45000, days30: 15000, days60: 0, days90: 0, total: 60000 },
                { name: "Tech Equipment Ltd", current: 85000, days30: 25000, days60: 15000, days90: 10000, total: 135000 },
                { name: "Utilities Provider", current: 50000, days30: 25000, days60: 10000, days90: 5000, total: 90000 }
              ]
            }
          }
        },
        { 
          id: "expense-report", 
          title: "Expense Analysis Report", 
          icon: FolderOpen, 
          description: "Categorized expense breakdown and trends",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: {
            id: "expense-report",
            title: "Expense Analysis Report",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              totalExpenses: 1420000,
              operatingExpenses: 520000,
              adminExpenses: 220000,
              costOfSales: 680000
            },
            data: {
              categories: [
                { category: "Cost of Goods Sold", amount: 680000, percentage: 47.9 },
                { category: "Operating Expenses", amount: 520000, percentage: 36.6 },
                { category: "Administrative Expenses", amount: 220000, percentage: 15.5 }
              ],
              monthlyTrend: [
                { month: "Jan", amount: 485000 },
                { month: "Feb", amount: 465000 },
                { month: "Mar", amount: 470000 }
              ]
            }
          }
        }
      ]
    },
    {
      id: "tax-compliance",
      title: "Tax & Compliance Reports",
      description: "VAT, tax and regulatory compliance",
      icon: ShieldCheck,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      gradient: "from-purple-600 via-indigo-700 to-blue-800",
      count: 3,
      reports: [
        { 
          id: "vat-summary", 
          title: "VAT Summary Report", 
          icon: Receipt, 
          description: "VAT calculations and compliance summary",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: {
            id: "vat-summary",
            title: "VAT Summary Report",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              vatInput: 145000,
              vatOutput: 285000,
              vatPayable: 140000,
              vatRate: 15
            },
            data: {
              vatInput: [
                { description: "Office Equipment Purchase", vatAmount: 45000, netAmount: 300000 },
                { description: "Professional Services", vatAmount: 15000, netAmount: 100000 },
                { description: "Office Supplies", vatAmount: 85000, netAmount: 566667 }
              ],
              vatOutput: [
                { description: "Product Sales", vatAmount: 180000, netAmount: 1200000 },
                { description: "Service Revenue", vatAmount: 105000, netAmount: 700000 }
              ]
            }
          }
        },
        { 
          id: "tax-summary", 
          title: "Tax Summary Report", 
          icon: Building, 
          description: "Comprehensive tax liability analysis",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly",
          data: {
            id: "tax-summary",
            title: "Tax Summary Report",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              incomeTax: 129000,
              vatPayable: 140000,
              paye: 85000,
              totalTaxLiability: 354000
            },
            data: {
              taxes: [
                { type: "Income Tax", amount: 129000, dueDate: "2025-02-28", status: "Pending" },
                { type: "VAT", amount: 140000, dueDate: "2025-02-25", status: "Pending" },
                { type: "PAYE", amount: 85000, dueDate: "2025-02-07", status: "Overdue" }
              ]
            }
          }
        },
        { 
          id: "bank-reconciliation", 
          title: "Bank Reconciliation", 
          icon: PiggyBank, 
          description: "Bank statement to ledger reconciliation",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: {
            id: "bank-reconciliation",
            title: "Bank Reconciliation",
            lastGenerated: format(new Date(), "yyyy-MM-dd"),
            summary: {
              bookBalance: 485000,
              bankBalance: 495000,
              reconcileItems: 3,
              unreconciled: 10000
            },
            data: {
              reconcileItems: [
                { date: "2025-01-27", description: "Outstanding Cheque #1001", amount: -15000, type: "outstanding" },
                { date: "2025-01-26", description: "Bank Charges", amount: -500, type: "bank_charges" },
                { date: "2025-01-25", description: "Deposit in Transit", amount: 25500, type: "deposit_transit" }
              ]
            }
          }
        }
      ]
    }
  ];

  const handleReportClick = (report: any) => {
    if (report.data) {
      setModalReport(report.data);
    } else {
      // For reports without data, show expanded view
      setSelectedReport(report.id);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handlePrint = () => {
    if (!modalReport) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate clean HTML for printing
    const printContent = generatePrintableHTML(modalReport);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const generatePrintableHTML = (report: ReportData) => {
    const companyName = "Taxnify - Unified Business, Accounting, Compliance Platform | South Africa";
    const currentDate = new Date().toLocaleString();
    
    let reportContent = "";

    if (report.id === 'trial-balance') {
      const totalDebits = report.data?.accounts?.reduce((sum: number, account: any) => sum + (account.debit || 0), 0) || 0;
      const totalCredits = report.data?.accounts?.reduce((sum: number, account: any) => sum + (account.credit || 0), 0) || 0;
      
      reportContent = `
        <div class="report-content">
          <h2>${report.title}</h2>
          <p class="period">Account balances as at ${report.lastGenerated}</p>
          
          <table class="financial-table">
            <thead>
              <tr>
                <th style="text-align: left;">ACCOUNT</th>
                <th style="text-align: right;">DEBIT</th>
                <th style="text-align: right;">CREDIT</th>
              </tr>
            </thead>
            <tbody>
              ${report.data?.accounts?.map((account: any) => `
                <tr>
                  <td>${account.account}</td>
                  <td style="text-align: right;">${account.debit > 0 ? formatCurrency(account.debit) : '-'}</td>
                  <td style="text-align: right;">${account.credit > 0 ? formatCurrency(account.credit) : '-'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td style="font-weight: bold;">TOTAL</td>
                <td style="text-align: right; font-weight: bold;">${formatCurrency(totalDebits)}</td>
                <td style="text-align: right; font-weight: bold;">${formatCurrency(totalCredits)}</td>
              </tr>
              ${totalDebits !== totalCredits ? `
                <tr>
                  <td colspan="3" style="text-align: center; color: #dc2626; background-color: #fef2f2; padding: 8px;">
                    ⚠️ Trial Balance does not balance: Difference of ${formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </td>
                </tr>
              ` : ''}
            </tfoot>
          </table>
        </div>
      `;
    } else if (report.id === 'profit-loss') {
      reportContent = `
        <div class="report-content">
          <h2>${report.title}</h2>
          <p class="period">Period: ${dateFrom} to ${dateTo} | Generated: ${report.lastGenerated}</p>
          
          <div class="summary-section">
            <div class="summary-item">
              <span class="label">Total Revenue:</span>
              <span class="amount revenue">${formatCurrency(report.summary?.revenue || 0)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Expenses:</span>
              <span class="amount expense">${formatCurrency(report.summary?.expenses || 0)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Net Income:</span>
              <span class="amount net-income">${formatCurrency(report.summary?.netIncome || 0)}</span>
            </div>
          </div>

          <div class="detailed-section">
            <div class="revenue-section">
              <h3>📈 Revenue</h3>
              <table class="financial-table">
                ${report.data?.revenue?.map((item: any) => `
                  <tr>
                    <td>${item.account}</td>
                    <td style="text-align: right; color: #059669;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
            </div>

            <div class="expenses-section">
              <h3>📉 Expenses</h3>
              <table class="financial-table">
                ${report.data?.expenses?.map((item: any) => `
                  <tr>
                    <td>${item.account}</td>
                    <td style="text-align: right; color: #dc2626;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (report.id === 'balance-sheet') {
      reportContent = `
        <div class="report-content">
          <h2>${report.title}</h2>
          <p class="period">As at ${report.lastGenerated}</p>
          
          <div class="summary-section">
            <div class="summary-item">
              <span class="label">Total Assets:</span>
              <span class="amount">${formatCurrency(report.summary?.totalAssets || 0)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Liabilities:</span>
              <span class="amount">${formatCurrency(report.summary?.totalLiabilities || 0)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Equity:</span>
              <span class="amount">${formatCurrency(report.summary?.equity || 0)}</span>
            </div>
          </div>

          <div class="balance-sheet-sections">
            <div class="assets-section">
              <h3>ASSETS</h3>
              <h4>Current Assets</h4>
              <table class="financial-table">
                ${report.data?.assets?.current?.map((asset: any) => `
                  <tr>
                    <td>${asset.account}</td>
                    <td style="text-align: right;">${formatCurrency(asset.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
              
              <h4>Non-Current Assets</h4>
              <table class="financial-table">
                ${report.data?.assets?.nonCurrent?.map((asset: any) => `
                  <tr>
                    <td>${asset.account}</td>
                    <td style="text-align: right;">${formatCurrency(asset.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
            </div>

            <div class="liabilities-section">
              <h3>LIABILITIES</h3>
              <h4>Current Liabilities</h4>
              <table class="financial-table">
                ${report.data?.liabilities?.current?.map((liability: any) => `
                  <tr>
                    <td>${liability.account}</td>
                    <td style="text-align: right;">${formatCurrency(liability.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
              
              <h4>Non-Current Liabilities</h4>
              <table class="financial-table">
                ${report.data?.liabilities?.nonCurrent?.map((liability: any) => `
                  <tr>
                    <td>${liability.account}</td>
                    <td style="text-align: right;">${formatCurrency(liability.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
            </div>

            <div class="equity-section">
              <h3>EQUITY</h3>
              <table class="financial-table">
                ${report.data?.equity?.map((equity: any) => `
                  <tr>
                    <td>${equity.account}</td>
                    <td style="text-align: right;">${formatCurrency(equity.amount)}</td>
                  </tr>
                `).join('') || ''}
              </table>
            </div>
          </div>
        </div>
      `;
    } else {
      // Generic format for other reports
      reportContent = `
        <div class="report-content">
          <h2>${report.title}</h2>
          <p class="period">Period: ${dateFrom} to ${dateTo} | Generated: ${report.lastGenerated}</p>
          <p class="description">${report.description}</p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title} - Print</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 30px;
          }
          
          .header-left {
            font-size: 10px;
            color: #666;
          }
          
          .header-right {
            font-size: 10px;
            color: #666;
            text-align: right;
          }
          
          .report-content h2 {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .period, .description {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          
          .summary-section {
            margin-bottom: 30px;
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 200px;
            padding: 12px 16px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          
          .summary-item .label {
            font-weight: 600;
            color: #374151;
          }
          
          .summary-item .amount {
            font-weight: bold;
            font-size: 16px;
          }
          
          .amount.revenue { color: #059669; }
          .amount.expense { color: #dc2626; }
          .amount.net-income { color: #3b82f6; }
          
          .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .financial-table th,
          .financial-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          
          .financial-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #d1d5db;
          }
          
          .financial-table tbody tr:hover {
            background-color: #f9fafb;
          }
          
          .total-row {
            border-top: 2px solid #374151;
            background-color: #f3f4f6;
          }
          
          .total-row td {
            font-weight: bold;
            color: #1f2937;
          }
          
          .detailed-section {
            display: flex;
            gap: 40px;
            margin-top: 30px;
          }
          
          .revenue-section,
          .expenses-section {
            flex: 1;
          }
          
          .balance-sheet-sections {
            margin-top: 20px;
          }
          
          .assets-section,
          .liabilities-section,
          .equity-section {
            margin-bottom: 30px;
          }
          
          h3 {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          h4 {
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            margin: 15px 0 8px 0;
          }
          
          .footer {
            position: fixed;
            bottom: 1cm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          
          @media print {
            .header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: white;
              z-index: 1000;
            }
            
            .report-content {
              margin-top: 80px;
            }
            
            .financial-table {
              page-break-inside: avoid;
            }
            
            .summary-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">${currentDate}</div>
          <div class="header-right">${companyName}</div>
        </div>
        
        ${reportContent}
        
        <div class="footer">
          Page 1 of 1 | Generated by Taxnify Financial Reporting System
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    if (!modalReport) return;
    
    // Create a hidden iframe for PDF generation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    document.body.appendChild(iframe);
    
    const printContent = generatePrintableHTML(modalReport);
    
    if (iframe.contentDocument) {
      iframe.contentDocument.open();
      iframe.contentDocument.write(printContent);
      iframe.contentDocument.close();
      
      // Wait for content to load
      iframe.onload = () => {
        if (iframe.contentWindow) {
          // Trigger print dialog which will show "Save as PDF" option
          iframe.contentWindow.print();
        }
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  };

  const handleEmailReport = () => {
    // Implementation for email functionality
    console.log("Emailing report...");
  };

  const handleDownloadExcel = () => {
    if (!modalReport) return;

    // Create Excel-compatible CSV data
    let csvContent = "";
    
    // Add header
    csvContent += `${modalReport.title}\n`;
    csvContent += `Period: ${dateFrom} to ${dateTo}\n`;
    csvContent += `Generated: ${modalReport.lastGenerated}\n\n`;

    if (modalReport.id === 'trial-balance') {
      // Trial Balance format
      csvContent += "Account,Debit,Credit\n";
      modalReport.data?.accounts?.forEach((account: any) => {
        csvContent += `"${account.account}",${account.debit || 0},${account.credit || 0}\n`;
      });
      
      // Add totals
      const totalDebits = modalReport.data?.accounts?.reduce((sum: number, account: any) => sum + (account.debit || 0), 0) || 0;
      const totalCredits = modalReport.data?.accounts?.reduce((sum: number, account: any) => sum + (account.credit || 0), 0) || 0;
      csvContent += `"TOTAL",${totalDebits},${totalCredits}\n`;
      
    } else if (modalReport.id === 'balance-sheet') {
      // Balance Sheet format
      csvContent += "Account,Amount\n";
      csvContent += "ASSETS\n";
      modalReport.data?.assets?.current?.forEach((asset: any) => {
        csvContent += `"${asset.account}",${asset.amount}\n`;
      });
      modalReport.data?.assets?.nonCurrent?.forEach((asset: any) => {
        csvContent += `"${asset.account}",${asset.amount}\n`;
      });
      
      csvContent += "LIABILITIES\n";
      modalReport.data?.liabilities?.current?.forEach((liability: any) => {
        csvContent += `"${liability.account}",${liability.amount}\n`;
      });
      modalReport.data?.liabilities?.nonCurrent?.forEach((liability: any) => {
        csvContent += `"${liability.account}",${liability.amount}\n`;
      });
      
      csvContent += "EQUITY\n";
      modalReport.data?.equity?.forEach((equity: any) => {
        csvContent += `"${equity.account}",${equity.amount}\n`;
      });
      
    } else if (modalReport.id === 'profit-loss') {
      // P&L format
      csvContent += "Account,Amount\n";
      csvContent += "REVENUE\n";
      modalReport.data?.revenue?.forEach((item: any) => {
        csvContent += `"${item.account}",${item.amount}\n`;
      });
      
      csvContent += "EXPENSES\n";
      modalReport.data?.expenses?.forEach((item: any) => {
        csvContent += `"${item.account}",${item.amount}\n`;
      });
      
    } else if (modalReport.id === 'aged-receivables') {
      // Aged Receivables format
      csvContent += "Customer,Current,30 Days,60 Days,90+ Days,Total\n";
      modalReport.data?.customers?.forEach((customer: any) => {
        csvContent += `"${customer.name}",${customer.current},${customer.days30},${customer.days60},${customer.days90},${customer.total}\n`;
      });
      
    } else if (modalReport.id === 'aged-payables') {
      // Aged Payables format
      csvContent += "Supplier,Current,30 Days,60 Days,90+ Days,Total\n";
      modalReport.data?.suppliers?.forEach((supplier: any) => {
        csvContent += `"${supplier.name}",${supplier.current},${supplier.days30},${supplier.days60},${supplier.days90},${supplier.total}\n`;
      });
      
    } else {
      // Generic format for other reports
      csvContent += "Description,Value\n";
      csvContent += `"Report Type","${modalReport.title}"\n`;
      csvContent += `"Generated","${modalReport.lastGenerated}"\n`;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${modalReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderReportContent = (reportData: ReportData) => {
    switch (reportData.id) {
      case "balance-sheet":
        return renderBalanceSheet(reportData);
      case "profit-loss":
        return renderProfitLoss(reportData);
      case "cash-flow":
        return renderCashFlow(reportData);
      case "trial-balance":
        return renderTrialBalance(reportData);
      case "general-ledger":
        return renderGeneralLedger(reportData);
      case "aged-receivables":
        return renderAgedReceivables(reportData);
      case "aged-payables":
        return renderAgedPayables(reportData);
      case "expense-report":
        return renderExpenseReport(reportData);
      case "vat-summary":
        return renderVATSummary(reportData);
      case "tax-summary":
        return renderTaxSummary(reportData);
      case "bank-reconciliation":
        return renderBankReconciliation(reportData);
      default:
        return <div>Report content not available</div>;
    }
  };

  const renderBalanceSheet = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalAssets || 0)}</div>
            <div className="text-blue-100 text-sm">Total Assets</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalLiabilities || 0)}</div>
            <div className="text-red-100 text-sm">Total Liabilities</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.equity || 0)}</div>
            <div className="text-green-100 text-sm">Total Equity</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Current Assets</h4>
                <div className="space-y-2">
                  {reportData.data?.assets?.current?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Non-Current Assets</h4>
                <div className="space-y-2">
                  {reportData.data?.assets?.nonCurrent?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Current Liabilities</h4>
                <div className="space-y-2">
                  {reportData.data?.liabilities?.current?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Non-Current Liabilities</h4>
                <div className="space-y-2">
                  {reportData.data?.liabilities?.nonCurrent?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Equity</h4>
                <div className="space-y-2">
                  {reportData.data?.equity?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfitLoss = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.revenue || 0)}</div>
            <div className="text-green-100 text-sm">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.expenses || 0)}</div>
            <div className="text-red-100 text-sm">Total Expenses</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.netIncome || 0)}</div>
            <div className="text-blue-100 text-sm">Net Income</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.revenue?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.account}</span>
                  <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.expenses?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.account}</span>
                  <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCashFlow = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.cashInflow || 0)}</div>
            <div className="text-green-100 text-sm">Cash Inflow</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.cashOutflow || 0)}</div>
            <div className="text-red-100 text-sm">Cash Outflow</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.netCashFlow || 0)}</div>
            <div className="text-blue-100 text-sm">Net Cash Flow</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Activities */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Operating Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.operating?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Investing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.investing?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Financing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.financing?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrialBalance = (reportData: ReportData) => {
    // Calculate totals
    const totalDebits = reportData.data?.accounts?.reduce((sum: number, account: any) => sum + (account.debit || 0), 0) || 0;
    const totalCredits = reportData.data?.accounts?.reduce((sum: number, account: any) => sum + (account.credit || 0), 0) || 0;

    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Trial Balance</CardTitle>
            <CardDescription>Account balances as at {reportData.lastGenerated}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.data?.accounts?.map((account: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{account.account}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">
                      {formatCurrency(totalCredits)}
                    </td>
                  </tr>
                  {totalDebits !== totalCredits && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-red-600 font-medium bg-red-50">
                        ⚠️ Trial Balance does not balance: Difference of {formatCurrency(Math.abs(totalDebits - totalCredits))}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGeneralLedger = (reportData: ReportData) => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">General Ledger</CardTitle>
          <CardDescription>Detailed transaction history by account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.entries?.map((entry: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{entry.account}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{entry.reference}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgedReceivables = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.total || 0)}</div>
            <div className="text-blue-100 text-sm">Total Receivables</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.current || 0)}</div>
            <div className="text-green-100 text-sm">Current</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency((reportData.summary?.overdue30 || 0) + (reportData.summary?.overdue60 || 0))}</div>
            <div className="text-orange-100 text-sm">30-60 Days</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.overdue90 || 0)}</div>
            <div className="text-red-100 text-sm">90+ Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Customer Aging Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">30 Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">60 Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">90+ Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.customers?.map((customer: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(customer.current)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{formatCurrency(customer.days30)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-700">{formatCurrency(customer.days60)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(customer.days90)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(customer.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgedPayables = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.total || 0)}</div>
            <div className="text-blue-100 text-sm">Total Payables</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.current || 0)}</div>
            <div className="text-green-100 text-sm">Current</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency((reportData.summary?.overdue30 || 0) + (reportData.summary?.overdue60 || 0))}</div>
            <div className="text-orange-100 text-sm">30-60 Days</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.overdue90 || 0)}</div>
            <div className="text-red-100 text-sm">90+ Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Supplier Aging Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">30 Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">60 Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">90+ Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.suppliers?.map((supplier: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(supplier.current)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{formatCurrency(supplier.days30)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-700">{formatCurrency(supplier.days60)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(supplier.days90)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(supplier.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpenseReport = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalExpenses || 0)}</div>
            <div className="text-red-100 text-sm">Total Expenses</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.operatingExpenses || 0)}</div>
            <div className="text-orange-100 text-sm">Operating Expenses</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.costOfSales || 0)}</div>
            <div className="text-purple-100 text-sm">Cost of Sales</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.data?.categories?.map((category: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{category.category}</span>
                  <span className="text-sm text-gray-600 ml-2">({category.percentage}%)</span>
                </div>
                <span className="font-semibold text-lg">{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVATSummary = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.vatInput || 0)}</div>
            <div className="text-green-100 text-sm">VAT Input</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.vatOutput || 0)}</div>
            <div className="text-blue-100 text-sm">VAT Output</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.vatPayable || 0)}</div>
            <div className="text-red-100 text-sm">VAT Payable</div>
          </CardContent>
        </Card>
      </div>

      {/* VAT Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">VAT Input Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.vatInput?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.description}</span>
                  <span className="font-semibold text-green-600">{formatCurrency(item.vatAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">VAT Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.vatOutput?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.description}</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(item.vatAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTaxSummary = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalTaxLiability || 0)}</div>
            <div className="text-red-100 text-sm">Total Tax Liability</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.incomeTax || 0)}</div>
            <div className="text-blue-100 text-sm">Income Tax</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.vatPayable || 0)}</div>
            <div className="text-purple-100 text-sm">VAT Payable</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.paye || 0)}</div>
            <div className="text-orange-100 text-sm">PAYE</div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Tax Obligations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tax Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.taxes?.map((tax: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{tax.type}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(tax.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tax.dueDate}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={tax.status === 'Overdue' ? 'destructive' : 'outline'}>
                        {tax.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBankReconciliation = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.bookBalance || 0)}</div>
            <div className="text-blue-100 text-sm">Book Balance</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.bankBalance || 0)}</div>
            <div className="text-green-100 text-sm">Bank Balance</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-red-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{reportData.summary?.reconcileItems || 0}</div>
            <div className="text-orange-100 text-sm">Reconcile Items</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.unreconciled || 0)}</div>
            <div className="text-red-100 text-sm">Unreconciled</div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Items */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Reconciliation Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.reconcileItems?.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-4 lg:p-6 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-purple-100 text-sm font-medium">Financial Reporting</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Financial Reports
                </h1>
                <p className="text-purple-100 text-sm">
                  Complete financial statements and analysis dashboard
                </p>
              </div>

              {/* Date Range Selector - Horizontal Layout */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 lg:min-w-[320px]">
                <h3 className="text-white font-semibold mb-2 text-sm">Report Parameters</h3>
                <div className="flex flex-col sm:flex-row items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="dateFrom" className="text-purple-100 text-xs">From Date</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder-purple-200 text-sm h-8"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="dateTo" className="text-purple-100 text-xs">To Date</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder-purple-200 text-sm h-8"
                    />
                  </div>
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 text-sm h-8 px-3 shrink-0">
                    <Filter className="h-3 w-3 mr-1" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="space-y-6">
          {reportCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <Card className={`border-0 shadow-xl bg-gradient-to-r ${category.gradient} text-white transform hover:scale-[1.01] transition-all duration-300`}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">{category.title}</CardTitle>
                        <CardDescription className="text-white/80">{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {category.count} reports
                      </Badge>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="h-5 w-5 text-white" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Category Reports */}
              <Collapsible open={expandedCategory === category.id}>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pl-4">
                    {category.reports.map((report) => (
                      <Card 
                        key={report.id} 
                        className="group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleReportClick(report)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.gradient}`}>
                              <report.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xs font-semibold text-gray-800 group-hover:text-purple-600 transition-colors leading-tight">
                                {report.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1.5 pt-0">
                          <p className="text-xs text-gray-600 line-clamp-1">{report.description}</p>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="truncate">Last: {report.lastGenerated}</span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-1">
                              {report.frequency}
                            </Badge>
                          </div>

                          {/* Summary Preview */}
                          {report.data?.summary && (
                            <div className="mt-1 p-1 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {report.id === 'balance-sheet' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Assets:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.totalAssets || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Equity:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.equity || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'profit-loss' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Revenue:</span>
                                      <span className="font-semibold text-green-600">{formatCurrency(report.data.summary.revenue || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Net Income:</span>
                                      <span className="font-semibold text-blue-600">{formatCurrency(report.data.summary.netIncome || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'cash-flow' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Inflow:</span>
                                      <span className="font-semibold text-green-600">{formatCurrency(report.data.summary.cashInflow || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Net Flow:</span>
                                      <span className="font-semibold text-blue-600">{formatCurrency(report.data.summary.netCashFlow || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'aged-receivables' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.total || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Overdue:</span>
                                      <span className="font-semibold text-red-600">{formatCurrency((report.data.summary.overdue30 || 0) + (report.data.summary.overdue60 || 0) + (report.data.summary.overdue90 || 0))}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'aged-payables' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.total || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Overdue:</span>
                                      <span className="font-semibold text-red-600">{formatCurrency((report.data.summary.overdue30 || 0) + (report.data.summary.overdue60 || 0) + (report.data.summary.overdue90 || 0))}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'vat-summary' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">VAT Input:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.vatInput || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">VAT Payable:</span>
                                      <span className="font-semibold text-red-600">{formatCurrency(report.data.summary.vatPayable || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'tax-summary' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Tax:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.totalTaxLiability || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Income Tax:</span>
                                      <span className="font-semibold text-red-600">{formatCurrency(report.data.summary.incomeTax || 0)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <Button 
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-1 text-xs mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReportClick(report);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>

        {/* Report Modal */}
        <Dialog open={modalReport !== null} onOpenChange={() => setModalReport(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    {modalReport?.title}
                  </DialogTitle>
                  <DialogDescription>
                    Period: {dateFrom} to {dateTo} | Generated: {modalReport?.lastGenerated}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={handleEmailReport} className="bg-green-600 hover:bg-green-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="mt-6">
              {modalReport && renderReportContent(modalReport)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}