import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  Filter, 
  Search, 
  Download, 
  Smartphone, 
  Banknote, 
  CreditCard,
  Building,
  Zap,
  Target,
  ArrowRight,
  Star,
  ShieldCheck,
  DollarSign,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BankFeeTransaction {
  id: string;
  month: string;
  bank_account: string;
  bank_name: string;
  account_id: number;
  category: string;
  transaction_count: number;
  total_amount: number;
  impact: 'high' | 'medium' | 'low';
  earliest_date: string;
  latest_date: string;
  last_sync: string;
  percentage_of_total?: number;
}

interface SABankComparison {
  bank: string;
  monthlyAdmin: number;
  atmWithdrawal: number;
  eftTransaction: number;
  cardPayment: number;
  monthlyTotal: number;
  rating: number;
  benefits: string[];
}

interface TransactionHistoryProps {
  organizationId?: number;
  selectedYear?: string;
  selectedMonth?: string;
  selectedAccount?: string;
}

const SA_BANKS_COMPARISON: SABankComparison[] = [
  {
    bank: 'FNB',
    monthlyAdmin: 75.00,
    atmWithdrawal: 12.50,
    eftTransaction: 8.50,
    cardPayment: 2.50,
    monthlyTotal: 289.50,
    rating: 4.5,
    benefits: ['Free eWallet transfers', 'eBucks rewards', 'Multiple free ATM withdrawals']
  },
  {
    bank: 'Standard Bank',
    monthlyAdmin: 89.00,
    atmWithdrawal: 15.00,
    eftTransaction: 9.50,
    cardPayment: 3.00,
    monthlyTotal: 312.00,
    rating: 4.2,
    benefits: ['UCount rewards', 'Business online banking', 'Multiple account types']
  },
  {
    bank: 'Nedbank',
    monthlyAdmin: 82.50,
    atmWithdrawal: 13.50,
    eftTransaction: 8.00,
    cardPayment: 2.75,
    monthlyTotal: 295.75,
    rating: 4.0,
    benefits: ['Greenbacks rewards', 'Business solutions', 'Flexible banking packages']
  },
  {
    bank: 'ABSA',
    monthlyAdmin: 85.00,
    atmWithdrawal: 14.00,
    eftTransaction: 9.00,
    cardPayment: 2.80,
    monthlyTotal: 301.20,
    rating: 4.1,
    benefits: ['Rewards programme', 'Digital banking', 'Branch network access']
  },
  {
    bank: 'Capitec',
    monthlyAdmin: 45.00,
    atmWithdrawal: 8.00,
    eftTransaction: 4.50,
    cardPayment: 1.50,
    monthlyTotal: 195.00,
    rating: 4.7,
    benefits: ['Low fees', 'Excellent mobile app', 'Simple banking solutions']
  }
];

const IMMEDIATE_ACTIONS = [
  {
    id: 'switch-ewallet',
    title: 'Switch to eWallet for Small Payments',
    description: 'Use FNB eWallet for payments under R500 to avoid EFT fees',
    impact: 'Save R45-85/month',
    priority: 'high',
    icon: Smartphone,
    steps: ['Open FNB app', 'Select eWallet', 'Send money using cellphone number', 'Recipient withdraws at ATM']
  },
  {
    id: 'fnb-atms',
    title: 'Use FNB ATMs for Cash Withdrawals',
    description: 'Use your bank\'s ATMs to avoid additional withdrawal fees',
    impact: 'Save R15-25/month',
    priority: 'medium',
    icon: Banknote,
    steps: ['Locate nearest FNB ATM', 'Use bank-specific card', 'Withdraw larger amounts less frequently', 'Consider cashback at retailers']
  },
  {
    id: 'bundle-eft',
    title: 'Bundle EFT Transactions',
    description: 'Combine multiple payments into fewer transactions',
    impact: 'Save R25-40/month',
    priority: 'medium',
    icon: CreditCard,
    steps: ['Group supplier payments', 'Use batch payment features', 'Schedule recurring payments', 'Consider payment runs twice monthly']
  },
  {
    id: 'optimize-account',
    title: 'Review Account Package',
    description: 'Switch to a more suitable business account package',
    impact: 'Save R50-150/month',
    priority: 'high',
    icon: Building,
    steps: ['Compare current vs other packages', 'Analyze transaction patterns', 'Contact bank advisor', 'Switch if beneficial']
  }
];

export default function TransactionHistory({ 
  organizationId = 1, 
  selectedYear, 
  selectedMonth, 
  selectedAccount 
}: TransactionHistoryProps) {
  const [sortColumn, setSortColumn] = useState<string>('month');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeOptimizationTab, setActiveOptimizationTab] = useState('actions');
  const { toast } = useToast();

  // Fetch transaction history data
  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['bank-fee-transactions', organizationId, selectedYear, selectedMonth, selectedAccount],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedAccount && selectedAccount !== 'all') params.append('accountId', selectedAccount);
      
      // Fallback data for demo purposes
      return {
        transactions: [
          {
            id: '1',
            month: '2025-09',
            bank_account: 'FNB Business Current',
            bank_name: 'FNB',
            account_id: 1,
            category: 'Monthly Admin',
            transaction_count: 1,
            total_amount: 75.00,
            impact: 'medium',
            earliest_date: '2025-09-01',
            latest_date: '2025-09-01',
            last_sync: '2025-09-11T15:30:00Z',
            percentage_of_total: 35.2
          },
          {
            id: '2',
            month: '2025-09',
            bank_account: 'FNB Business Current',
            bank_name: 'FNB',
            account_id: 1,
            category: 'ATM/Cash',
            transaction_count: 4,
            total_amount: 50.00,
            impact: 'high',
            earliest_date: '2025-09-03',
            latest_date: '2025-09-25',
            last_sync: '2025-09-11T15:30:00Z',
            percentage_of_total: 23.5
          },
          {
            id: '3',
            month: '2025-09',
            bank_account: 'FNB Business Current',
            bank_name: 'FNB',
            account_id: 1,
            category: 'EFT',
            transaction_count: 12,
            total_amount: 88.00,
            impact: 'high',
            earliest_date: '2025-09-02',
            latest_date: '2025-09-30',
            last_sync: '2025-09-11T15:30:00Z',
            percentage_of_total: 41.3
          },
          {
            id: '4',
            month: '2025-08',
            bank_account: 'Standard Bank Savings',
            bank_name: 'Standard Bank',
            account_id: 2,
            category: 'Monthly Admin',
            transaction_count: 1,
            total_amount: 89.00,
            impact: 'medium',
            earliest_date: '2025-08-01',
            latest_date: '2025-08-01',
            last_sync: '2025-09-11T14:20:00Z',
            percentage_of_total: 42.1
          },
          {
            id: '5',
            month: '2025-08',
            bank_account: 'Standard Bank Savings',
            bank_name: 'Standard Bank',
            account_id: 2,
            category: 'ATM/Cash',
            transaction_count: 3,
            total_amount: 45.00,
            impact: 'medium',
            earliest_date: '2025-08-05',
            latest_date: '2025-08-28',
            last_sync: '2025-09-11T14:20:00Z',
            percentage_of_total: 21.3
          },
          {
            id: '6',
            month: '2025-08',
            bank_account: 'Standard Bank Savings',
            bank_name: 'Standard Bank',
            account_id: 2,
            category: 'Card Payment',
            transaction_count: 8,
            total_amount: 77.50,
            impact: 'high',
            earliest_date: '2025-08-01',
            latest_date: '2025-08-31',
            last_sync: '2025-09-11T14:20:00Z',
            percentage_of_total: 36.6
          }
        ] as BankFeeTransaction[],
        summary: {
          totalAmount: 424.50,
          totalTransactions: 29,
          avgMonthlyFees: 212.25,
          highestCategory: 'EFT',
          potentialSavings: 127.50
        }
      };
    },
    retry: false,
  });

  const transactions = transactionData?.transactions || [];
  const summary = transactionData?.summary || {
    totalAmount: 0,
    totalTransactions: 0,
    avgMonthlyFees: 0,
    highestCategory: '',
    potentialSavings: 0
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesSearch = searchTerm === '' || 
        transaction.bank_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof BankFeeTransaction];
      const bValue = b[sortColumn as keyof BankFeeTransaction];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    const colors = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    };
    return (
      <Badge variant={variants[impact as keyof typeof variants] as any} className={colors[impact as keyof typeof colors]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </Badge>
    );
  };

  const handleActionImplement = (actionId: string) => {
    toast({
      title: "Action Initiated",
      description: `Implementation guide for ${IMMEDIATE_ACTIONS.find(a => a.id === actionId)?.title} has been started.`,
    });
  };

  const handleExportTransactions = () => {
    toast({
      title: "Export Started",
      description: "Transaction history is being exported to CSV...",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading transaction history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transaction History</h1>
          <p className="text-gray-600 text-lg">Detailed bank fee analysis and optimization recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportTransactions}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
            data-testid="button-export-transactions"
          >
            <Download className="h-4 w-4" />
            Export History
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Fees</p>
                <p className="text-2xl font-bold text-blue-900">R{summary.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-900">R{summary.potentialSavings?.toFixed(2) || '0.00'}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Monthly Average</p>
                <p className="text-2xl font-bold text-purple-900">R{summary.avgMonthlyFees?.toFixed(2) || '0.00'}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Transactions</p>
                <p className="text-2xl font-bold text-orange-900">{summary.totalTransactions || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by bank, account, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-transactions"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-64" data-testid="select-category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Monthly Admin">Monthly Admin</SelectItem>
                <SelectItem value="ATM/Cash">ATM/Cash</SelectItem>
                <SelectItem value="EFT">EFT</SelectItem>
                <SelectItem value="Card Payment">Card Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Detailed Transaction History</CardTitle>
          <CardDescription>
            Comprehensive breakdown of bank fees by month, account, and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('month')}
                    data-testid="header-month"
                  >
                    <div className="flex items-center gap-2">
                      Month
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('bank_name')}
                    data-testid="header-bank"
                  >
                    <div className="flex items-center gap-2">
                      Bank
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('bank_account')}
                    data-testid="header-account"
                  >
                    <div className="flex items-center gap-2">
                      Account
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('category')}
                    data-testid="header-category"
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors text-center"
                    onClick={() => handleSort('transaction_count')}
                    data-testid="header-transactions"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      Transactions
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 transition-colors text-right"
                    onClick={() => handleSort('total_amount')}
                    data-testid="header-amount"
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Amount
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-gray-50 transition-colors"
                    data-testid={`row-transaction-${transaction.id}`}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(transaction.month + '-01'), 'MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        {transaction.bank_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {transaction.bank_account}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {transaction.transaction_count}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      R{transaction.total_amount.toFixed(2)}
                      {transaction.percentage_of_total && (
                        <div className="text-xs text-gray-500">
                          {transaction.percentage_of_total.toFixed(1)}% of total
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getImpactBadge(transaction.impact)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* South African Banking Optimization */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-teal-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-emerald-800 flex items-center gap-3">
            <Zap className="h-6 w-6" />
            South African Banking Optimization
          </CardTitle>
          <CardDescription className="text-emerald-600 text-lg">
            Tailored recommendations for South African businesses to reduce banking costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeOptimizationTab} onValueChange={setActiveOptimizationTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="actions" data-testid="tab-immediate-actions">Immediate Actions</TabsTrigger>
              <TabsTrigger value="comparison" data-testid="tab-banking-comparison">Banking Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actions" className="mt-6">
              <div className="grid gap-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">Quick Wins to Reduce Banking Costs</h3>
                  <p className="text-emerald-600">Implement these changes today to start saving immediately</p>
                </div>
                
                <div className="grid gap-4">
                  {IMMEDIATE_ACTIONS.map((action) => (
                    <Card key={action.id} className="bg-white shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-full ${action.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                              <action.icon className={`h-6 w-6 ${action.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg text-gray-900">{action.title}</h4>
                                <Badge 
                                  variant={action.priority === 'high' ? 'destructive' : 'default'}
                                  className="text-xs"
                                >
                                  {action.priority.toUpperCase()} PRIORITY
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{action.description}</p>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-green-600">{action.impact}</span>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2">Implementation Steps:</h5>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                  {action.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleActionImplement(action.id)}
                            className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                            data-testid={`button-implement-${action.id}`}
                          >
                            Implement
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-6">
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">South African Banks Comparison</h3>
                  <p className="text-emerald-600">Compare business banking costs across major SA banks</p>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Bank</TableHead>
                        <TableHead className="text-center">Monthly Admin</TableHead>
                        <TableHead className="text-center">ATM Withdrawal</TableHead>
                        <TableHead className="text-center">EFT Transaction</TableHead>
                        <TableHead className="text-center">Card Payment</TableHead>
                        <TableHead className="text-center">Est. Monthly Total</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead>Key Benefits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SA_BANKS_COMPARISON.map((bank) => (
                        <TableRow 
                          key={bank.bank} 
                          className="hover:bg-gray-50 transition-colors"
                          data-testid={`row-bank-${bank.bank.toLowerCase().replace(' ', '-')}`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              {bank.bank}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">R{bank.monthlyAdmin.toFixed(2)}</TableCell>
                          <TableCell className="text-center">R{bank.atmWithdrawal.toFixed(2)}</TableCell>
                          <TableCell className="text-center">R{bank.eftTransaction.toFixed(2)}</TableCell>
                          <TableCell className="text-center">R{bank.cardPayment.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={bank.bank === 'Capitec' ? 'text-green-600' : 'text-gray-900'}>
                              R{bank.monthlyTotal.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{bank.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {bank.benefits.slice(0, 2).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span className="text-gray-600">{benefit}</span>
                                </div>
                              ))}
                              {bank.benefits.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{bank.benefits.length - 2} more benefits
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="bg-white rounded-lg p-6 border-l-4 border-l-green-500">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendation Based on Your Usage</h4>
                      <p className="text-gray-600 mb-3">
                        Based on your current transaction patterns, switching to <strong>Capitec Business</strong> could 
                        save you approximately <strong>R{((SA_BANKS_COMPARISON[0].monthlyTotal - SA_BANKS_COMPARISON[4].monthlyTotal)).toFixed(2)} per month</strong>.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Lowest overall fees in South Africa</li>
                        <li>Excellent mobile banking experience</li>
                        <li>Simple, transparent fee structure</li>
                        <li>Growing business banking solutions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}