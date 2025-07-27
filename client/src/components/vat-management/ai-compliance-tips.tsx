import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VATTip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'compliance' | 'optimization' | 'risk';
}

interface AIComplianceTipsProps {
  companyId: number;
  vatSettings?: any;
  transactionData?: any;
}

const AIComplianceTips: React.FC<AIComplianceTipsProps> = ({ 
  companyId, 
  vatSettings, 
  transactionData 
}) => {
  const [tips, setTips] = useState<VATTip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTips = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/api/vat/ai-compliance-tips', 'POST', {
        companyId,
        vatSettings,
        transactionData
      });
      setTips(data.tips || []);
      
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.tips?.length || 0} personalized VAT compliance tips`,
      });
    } catch (error) {
      console.error('Error generating AI tips:', error);
      setError('Failed to generate AI compliance tips. Please try again.');
      
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI tips at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'optimization': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'risk': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI-Powered VAT Compliance Tips</CardTitle>
          </div>
          <Button 
            onClick={generateTips} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Get AI Tips
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Get personalized VAT compliance recommendations based on your business context and South African tax regulations.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tips.length === 0 && !isLoading && !error && (
          <Alert className="text-center">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Click "Get AI Tips" to receive personalized VAT compliance recommendations based on your current business setup.
            </AlertDescription>
          </Alert>
        )}

        {tips.length > 0 && (
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{tip.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(tip.priority)}>
                        {tip.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(tip.category)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(tip.category)}
                          {tip.category}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tips.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                AI Analysis Summary
              </span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Generated {tips.length} personalized recommendations based on your VAT registration status, 
              transaction patterns, and South African tax compliance requirements. 
              Please consult with a qualified tax professional for complex situations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIComplianceTips;