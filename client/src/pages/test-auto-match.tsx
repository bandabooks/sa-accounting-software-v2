import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Comprehensive test transactions covering all common patterns
const TEST_TRANSACTIONS = {
  expenses: [
    { description: "SALARY PAYMENT - JOHN DOE", amount: 25000, expectedAccount: "Employee Costs", expectedVAT: 0 },
    { description: "FNB BANK CHARGES MONTHLY", amount: 150, expectedAccount: "Bank Charges", expectedVAT: 0 },
    { description: "TELKOM INTERNET SERVICES", amount: 899, expectedAccount: "Telephone & Internet", expectedVAT: 15 },
    { description: "ESKOM ELECTRICITY PAYMENT", amount: 2500, expectedAccount: "Utilities", expectedVAT: 15 },
    { description: "OFFICE RENT - DECEMBER", amount: 15000, expectedAccount: "Rent Expense", expectedVAT: 0 },
    { description: "TAKEALOT OFFICE SUPPLIES", amount: 1299, expectedAccount: "Office Supplies", expectedVAT: 15 },
    { description: "UBER TRANSPORT TO CLIENT", amount: 75, expectedAccount: "Transport & Travel", expectedVAT: 15 },
    { description: "ZOOM SUBSCRIPTION", amount: 250, expectedAccount: "Software & Technology", expectedVAT: 15 },
    { description: "SASOL FUEL PAYMENT", amount: 1200, expectedAccount: "Transport & Travel", expectedVAT: 15 },
    { description: "INSURANCE PREMIUM - SANTAM", amount: 3500, expectedAccount: "Insurance", expectedVAT: 0 },
    { description: "PROFESSIONAL ACCOUNTING FEES", amount: 5000, expectedAccount: "Professional Fees", expectedVAT: 15 },
    { description: "MUNICIPAL SERVICES WATER", amount: 850, expectedAccount: "Utilities", expectedVAT: 15 },
    { description: "ADVERTISING FACEBOOK ADS", amount: 2000, expectedAccount: "Marketing & Advertising", expectedVAT: 15 },
    { description: "COMPUTER EQUIPMENT PURCHASE", amount: 15000, expectedAccount: "Equipment", expectedVAT: 15 },
    { description: "MAINTENANCE AND REPAIRS", amount: 3000, expectedAccount: "Repairs & Maintenance", expectedVAT: 15 }
  ],
  income: [
    { description: "PAYMENT FROM CLIENT ABC", amount: 50000, expectedAccount: "Sales Revenue", expectedVAT: 15 },
    { description: "CONSULTING FEE - XYZ CORP", amount: 25000, expectedAccount: "Service Income", expectedVAT: 15 },
    { description: "INTEREST RECEIVED - FNB", amount: 125, expectedAccount: "Interest Income", expectedVAT: 0 },
    { description: "INVOICE #1234 PAYMENT", amount: 15000, expectedAccount: "Sales Revenue", expectedVAT: 15 },
    { description: "SERVICE REVENUE - PROJECT X", amount: 35000, expectedAccount: "Service Income", expectedVAT: 15 }
  ]
};

interface TestResult {
  description: string;
  amount: number;
  expectedAccount: string;
  expectedVAT: number;
  matchedAccount?: string;
  matchedVAT?: number;
  confidence?: number;
  status: 'pending' | 'success' | 'partial' | 'failed';
  message?: string;
}

export default function TestAutoMatch() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    partial: number;
    failed: number;
    successRate: number;
  } | null>(null);
  const { toast } = useToast();

  const runTest = async () => {
    setTesting(true);
    setResults([]);
    setSummary(null);

    try {
      // Prepare all test transactions
      const allTransactions = [
        ...TEST_TRANSACTIONS.expenses.map((t, i) => ({
          id: i,
          description: t.description,
          amount: t.amount,
          type: 'expense' as const,
          ...t
        })),
        ...TEST_TRANSACTIONS.income.map((t, i) => ({
          id: TEST_TRANSACTIONS.expenses.length + i,
          description: t.description,
          amount: t.amount,
          type: 'income' as const,
          ...t
        }))
      ];

      // Send to script matcher
      const response = await apiRequest('/api/script/match-transactions', 'POST', {
        transactions: allTransactions.map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          type: t.type
        }))
      });

      const matches = response.matches || [];
      
      // Process results
      const testResults: TestResult[] = allTransactions.map((transaction) => {
        const match = matches.find((m: any) => m.transactionId === transaction.id);
        
        let status: TestResult['status'] = 'failed';
        let message = '';
        
        if (match) {
          const accountMatched = match.suggestedAccount?.toLowerCase().includes(
            transaction.expectedAccount.toLowerCase().split(' ')[0]
          );
          const vatMatched = match.vatRate === transaction.expectedVAT;
          
          if (accountMatched && vatMatched) {
            status = 'success';
            message = 'Perfect match!';
          } else if (accountMatched || vatMatched) {
            status = 'partial';
            message = accountMatched ? 'VAT rate mismatch' : 'Account mismatch';
          } else {
            status = 'failed';
            message = 'No match or incorrect match';
          }
        } else {
          message = 'No match found';
        }
        
        return {
          description: transaction.description,
          amount: transaction.amount,
          expectedAccount: transaction.expectedAccount,
          expectedVAT: transaction.expectedVAT,
          matchedAccount: match?.suggestedAccount,
          matchedVAT: match?.vatRate,
          confidence: match?.confidence,
          status,
          message
        };
      });
      
      setResults(testResults);
      
      // Calculate summary
      const passed = testResults.filter(r => r.status === 'success').length;
      const partial = testResults.filter(r => r.status === 'partial').length;
      const failed = testResults.filter(r => r.status === 'failed').length;
      
      setSummary({
        total: testResults.length,
        passed,
        partial,
        failed,
        successRate: Math.round((passed / testResults.length) * 100)
      });
      
      toast({
        title: "Test Complete",
        description: `${passed} out of ${testResults.length} transactions matched perfectly`,
        variant: passed === testResults.length ? "success" as any : "default"
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Error running auto-match test",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Auto-Match Testing Suite</CardTitle>
          <p className="text-muted-foreground">
            Comprehensive test to verify transaction matching accuracy
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTest} 
            disabled={testing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Auto-Match Test'
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Total Tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <p className="text-xs text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{summary.partial}</div>
              <p className="text-xs text-muted-foreground">Partial Match</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{summary.successRate}%</div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.description}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Expected</p>
                      <p className="text-sm">Account: {result.expectedAccount}</p>
                      <p className="text-sm">VAT: {result.expectedVAT}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Matched</p>
                      <p className="text-sm">
                        Account: {result.matchedAccount || 'None'}
                        {result.confidence && ` (${Math.round(result.confidence * 100)}%)`}
                      </p>
                      <p className="text-sm">VAT: {result.matchedVAT !== undefined ? `${result.matchedVAT}%` : 'None'}</p>
                    </div>
                  </div>
                  
                  {result.message && (
                    <p className="text-sm mt-2 text-muted-foreground">{result.message}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}