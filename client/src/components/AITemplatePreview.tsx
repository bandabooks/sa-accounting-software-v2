/**
 * AI-Powered Interactive Template Preview Component
 * Advanced template preview with AI customization, real-time editing, and smart suggestions
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Eye, 
  Edit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Lightbulb,
  Zap,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

interface AITemplatePreviewProps {
  template: any;
  onClose: () => void;
  onUseTemplate: (template: any) => void;
}

interface ClientDetails {
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  specificRequirements: string;
}

const AITemplatePreview: React.FC<AITemplatePreviewProps> = ({ template, onClose, onUseTemplate }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('preview');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizedContent, setCustomizedContent] = useState(template.templateContent);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    industry: '',
    size: 'small',
    specificRequirements: ''
  });
  const [customizationPrompt, setCustomizationPrompt] = useState('');
  const [complianceLevel, setComplianceLevel] = useState<'basic' | 'standard' | 'comprehensive'>('standard');

  // AI Customization Mutation
  const customizeTemplateMutation = useMutation({
    mutationFn: async (customizationData: any) => {
      return apiRequest('/api/engagement-letter-templates/ai/customize', 'POST', customizationData);
    },
    onSuccess: (data) => {
      setCustomizedContent(data.customizedContent);
      setActiveTab('preview');
      toast({
        title: 'Template Customized',
        description: 'AI has successfully customized your template with smart improvements.'
      });
      setIsCustomizing(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Customization Failed',
        description: error.message || 'Failed to customize template with AI',
        variant: 'destructive'
      });
      setIsCustomizing(false);
    }
  });

  // Template Analysis Query
  const { data: analysis, isLoading: analyzing } = useQuery({
    queryKey: ['template-analysis', template.id],
    queryFn: () => apiRequest('/api/engagement-letter-templates/ai/analyze', 'POST', {
      templateContent: customizedContent,
      serviceType: template.serviceType
    }),
    enabled: !!template.id
  });

  // Fee Estimation Query
  const { data: feeEstimate } = useQuery({
    queryKey: ['fee-estimate', template.serviceType, clientDetails],
    queryFn: () => apiRequest('/api/engagement-letter-templates/ai/estimate-fees', 'POST', {
      serviceType: template.serviceType,
      clientDetails,
      complexity: complianceLevel
    }),
    enabled: !!clientDetails.name
  });

  const handleCustomizeWithAI = () => {
    setIsCustomizing(true);
    customizeTemplateMutation.mutate({
      templateContent: template.templateContent,
      serviceType: template.serviceType,
      clientDetails,
      customizationPrompt,
      complianceLevel
    });
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(customizedContent);
    toast({
      title: 'Copied to Clipboard',
      description: 'Template content has been copied to your clipboard.'
    });
  };

  const getComplianceBadges = (template: any) => {
    const badges = [];
    if (template.saicaCompliant) badges.push({ label: 'SAICA', color: 'bg-blue-100 text-blue-800' });
    if (template.saipaCompliant) badges.push({ label: 'SAIPA', color: 'bg-green-100 text-green-800' });
    if (template.irbaCompliant) badges.push({ label: 'IRBA', color: 'bg-purple-100 text-purple-800' });
    return badges;
  };

  const serviceTypeLabels: Record<string, string> = {
    bookkeeping: 'Bookkeeping Services',
    tax: 'Tax Services',
    vat: 'VAT Services',
    payroll: 'Payroll Services',
    audit: 'Audit Engagements',
    review: 'Independent Reviews',
    compilation: 'Compilation Services',
    cipc: 'CIPC & Company Secretarial',
    management_accounts: 'Management Accounts',
    advisory: 'Business Advisory'
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Template Preview: {template.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Customize
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Template Metadata */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Service Type</Label>
                    <p className="text-sm font-medium">{serviceTypeLabels[template.serviceType]}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Compliance Standards</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getComplianceBadges(template).map((badge, index) => (
                        <Badge key={index} variant="outline" className={badge.color}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {analysis && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Compliance Score</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={analysis.complianceScore} className="flex-1" />
                        <span className="text-sm font-medium">{analysis.complianceScore}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Template Content */}
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Template Content</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyContent}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {customizedContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Customize Tab */}
          <TabsContent value="customize" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Customization Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                    AI Customization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={clientDetails.name}
                        onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                        placeholder="Enter client company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={clientDetails.industry} onValueChange={(value) => setClientDetails({ ...clientDetails, industry: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail & Commerce</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="professional">Professional Services</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="businessSize">Business Size</Label>
                      <Select value={clientDetails.size} onValueChange={(value: any) => setClientDetails({ ...clientDetails, size: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small Business (1-20 employees)</SelectItem>
                          <SelectItem value="medium">Medium Business (21-100 employees)</SelectItem>
                          <SelectItem value="large">Large Business (100+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="complianceLevel">Compliance Level</Label>
                      <Select value={complianceLevel} onValueChange={(value: any) => setComplianceLevel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Compliance</SelectItem>
                          <SelectItem value="standard">Standard Compliance</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="customizationPrompt">Custom Instructions</Label>
                      <Textarea
                        id="customizationPrompt"
                        value={customizationPrompt}
                        onChange={(e) => setCustomizationPrompt(e.target.value)}
                        placeholder="Enter specific customization instructions..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleCustomizeWithAI} 
                      disabled={isCustomizing}
                      className="w-full"
                    >
                      {isCustomizing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Customizing with AI...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Customize with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {customizedContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Analyzing template...</span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Compliance Score</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={analysis.complianceScore} className="flex-1" />
                          <span className="text-sm font-medium">{analysis.complianceScore}%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Risk Level</Label>
                        <Badge variant={analysis.riskLevel === 'low' ? 'default' : analysis.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                          {analysis.riskLevel}
                        </Badge>
                      </div>
                    </div>
                    
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">AI Suggestions</Label>
                        <ul className="mt-2 space-y-2">
                          {analysis.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span className="text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Estimation</CardTitle>
              </CardHeader>
              <CardContent>
                {feeEstimate ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Estimated Fee Range</Label>
                        <p className="text-2xl font-bold">
                          R {feeEstimate.minFee.toLocaleString()} - R {feeEstimate.maxFee.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Recommended Fee</Label>
                        <p className="text-2xl font-bold text-green-600">
                          R {feeEstimate.recommendedFee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {feeEstimate.breakdown && (
                      <div>
                        <Label className="text-sm font-medium">Fee Breakdown</Label>
                        <div className="mt-2 space-y-2">
                          {Object.entries(feeEstimate.breakdown).map(([item, amount]: [string, any]) => (
                            <div key={item} className="flex justify-between">
                              <span className="text-sm">{item}</span>
                              <span className="text-sm font-medium">R {amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Enter client details to get fee estimation</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onUseTemplate(template)}>
              Use Original Template
            </Button>
            <Button onClick={() => onUseTemplate({ ...template, templateContent: customizedContent })}>
              <Zap className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITemplatePreview;