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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  RefreshCw,
  ChevronsUpDown,
  Check,
  Building2,
  User
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

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
  const [customizedContent, setCustomizedContent] = useState(template.bodyMd || template.content || template.templateContent || '');
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    industry: '',
    size: 'small',
    specificRequirements: ''
  });
  const [customizationPrompt, setCustomizationPrompt] = useState('');
  const [complianceLevel, setComplianceLevel] = useState<'basic' | 'standard' | 'comprehensive'>('standard');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [pricingComplexity, setPricingComplexity] = useState<'basic' | 'standard' | 'comprehensive'>('standard');

  // Fetch customers for dropdown
  const { data: customers, isLoading: loadingCustomers } = useQuery<any[]>({
    queryKey: ['/api/customers']
  });

  // AI Customization Mutation
  const customizeTemplateMutation = useMutation({
    mutationFn: async (customizationData: any) => {
      return apiRequest('/api/engagement-letter-templates/ai/customize', 'POST', customizationData);
    },
    onSuccess: (data: any) => {
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
  const { data: analysis, isLoading: analyzing } = useQuery<any>({
    queryKey: ['template-analysis', template.id],
    queryFn: () => apiRequest('/api/engagement-letter-templates/ai/analyze', 'POST', {
      templateContent: customizedContent,
      serviceType: template.serviceType
    }),
    enabled: !!template.id
  });

  // Fee Estimation Query
  const { data: feeEstimate, isLoading: loadingFees, refetch: refetchFees } = useQuery<any>({
    queryKey: ['fee-estimate', template.serviceType, selectedClientId, pricingComplexity],
    queryFn: () => {
      const selectedCustomer = customers?.find((c: any) => c.id === selectedClientId);
      if (!selectedCustomer) return null;
      
      return apiRequest('/api/engagement-letter-templates/ai/estimate-fees', 'POST', {
        serviceType: template.serviceType || template.servicePackage,
        clientDetails: {
          name: selectedCustomer.name,
          industry: selectedCustomer.category || 'professional',
          size: 'medium' // Default size, could be enhanced with actual data
        },
        complexity: pricingComplexity
      });
    },
    enabled: !!selectedClientId && !!customers
  });

  // Handle client selection
  const handleClientSelect = (customerId: number) => {
    setSelectedClientId(customerId);
    const customer = customers?.find((c: any) => c.id === customerId);
    if (customer) {
      setClientDetails({
        name: customer.name,
        industry: customer.category || 'professional',
        size: 'medium',
        specificRequirements: ''
      });
    }
  };

  // Get professional affiliation badge for customer
  const getCustomerBadges = (customer: any) => {
    const badges = [];
    // Check for SAICA/SAIPA based on category or custom logic
    if (customer.category === 'premium' || customer.notes?.includes('SAICA')) {
      badges.push({ label: 'SAICA', color: 'bg-blue-100 text-blue-800', icon: '🎓' });
    }
    if (customer.category === 'wholesale' || customer.notes?.includes('SAIPA')) {
      badges.push({ label: 'SAIPA', color: 'bg-green-100 text-green-800', icon: '📚' });
    }
    return badges;
  };

  const handleCustomizeWithAI = () => {
    setIsCustomizing(true);
    customizeTemplateMutation.mutate({
      templateContent: customizedContent,
      serviceType: template.servicePackage || template.serviceType,
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
    tax_compliance: 'Tax Compliance Services',
    vat_compliance: 'VAT Compliance Services',
    payroll: 'Payroll Services',
    audit_services: 'Audit Services',
    company_secretarial: 'Company Secretarial Services',
    advisory_services: 'Business Advisory Services',
    basic: 'Basic Services',
    standard: 'Standard Services',
    premium: 'Premium Services'
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
                    <p className="text-sm font-medium">{serviceTypeLabels[template.servicePackage] || serviceTypeLabels[template.serviceType] || template.servicePackage || 'Professional Services'}</p>
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
            <div className="grid grid-cols-2 gap-6">
              {/* Client Selection & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Client & Service Details
                  </CardTitle>
                  <CardDescription>
                    Select a client and customize service parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client Selection Dropdown */}
                  <div className="space-y-2">
                    <Label>Select Client</Label>
                    <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientSearchOpen}
                          className="w-full justify-between"
                          data-testid="button-select-client"
                        >
                          {selectedClientId && customers ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{customers.find((c: any) => c.id === selectedClientId)?.name}</span>
                              {getCustomerBadges(customers.find((c: any) => c.id === selectedClientId)).map((badge, idx) => (
                                <Badge key={idx} variant="outline" className={cn(badge.color, 'ml-auto')}>
                                  <span className="mr-1">{badge.icon}</span>
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Select a client...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search clients..." />
                          <CommandEmpty>No clients found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {loadingCustomers ? (
                              <div className="py-2 px-2 text-sm text-muted-foreground">
                                Loading clients...
                              </div>
                            ) : (
                              customers?.map((customer: any) => {
                                const badges = getCustomerBadges(customer);
                                return (
                                  <CommandItem
                                    key={customer.id}
                                    value={customer.name}
                                    onSelect={() => {
                                      handleClientSelect(customer.id);
                                      setClientSearchOpen(false);
                                    }}
                                    className="flex items-center gap-2 py-2"
                                    data-testid={`option-client-${customer.id}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedClientId === customer.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{customer.name}</span>
                                        {badges.map((badge, idx) => (
                                          <Badge key={idx} variant="outline" className={cn(badge.color, 'text-xs')}>
                                            <span className="mr-1 text-xs">{badge.icon}</span>
                                            {badge.label}
                                          </Badge>
                                        ))}
                                      </div>
                                      {customer.email && (
                                        <div className="text-xs text-muted-foreground">
                                          {customer.email} • {customer.category || 'Standard'}
                                        </div>
                                      )}
                                    </div>
                                  </CommandItem>
                                );
                              })
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Complexity Level */}
                  <div className="space-y-2">
                    <Label>Service Complexity</Label>
                    <Select value={pricingComplexity} onValueChange={(value: any) => setPricingComplexity(value)}>
                      <SelectTrigger data-testid="select-complexity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Simple engagement</SelectItem>
                        <SelectItem value="standard">Standard - Regular complexity</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive - High complexity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Type Info */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Service Type</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">
                        {serviceTypeLabels[template.servicePackage] || serviceTypeLabels[template.serviceType] || 'Professional Services'}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {getComplianceBadges(template).map((badge, index) => (
                          <Badge key={index} variant="outline" className={badge.color}>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={() => refetchFees()}
                    disabled={!selectedClientId || loadingFees}
                    className="w-full"
                    data-testid="button-generate-quote"
                  >
                    {loadingFees ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Calculating Fees...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Generate Fee Estimate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Fee Estimation Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fee Estimation
                  </CardTitle>
                  <CardDescription>
                    Professional service fee calculation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feeEstimate ? (
                    <div className="space-y-6">
                      {/* Main Fee Display */}
                      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <Label className="text-sm text-muted-foreground">Recommended Monthly Fee</Label>
                        <p className="text-4xl font-bold text-green-600 mt-2">
                          R {(feeEstimate.monthlyFee || feeEstimate.recommendedFee || 0).toLocaleString('en-ZA')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Annual: R {(feeEstimate.annualFee || (feeEstimate.monthlyFee || feeEstimate.recommendedFee || 0) * 12).toLocaleString('en-ZA')}
                        </p>
                      </div>

                      {/* Fee Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <Label className="text-xs text-muted-foreground">Minimum</Label>
                          <p className="text-xl font-semibold mt-1">
                            R {(feeEstimate.minFee || 0).toLocaleString('en-ZA')}
                          </p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <Label className="text-xs text-muted-foreground">Maximum</Label>
                          <p className="text-xl font-semibold mt-1">
                            R {(feeEstimate.maxFee || 0).toLocaleString('en-ZA')}
                          </p>
                        </div>
                      </div>

                      {/* Fee Breakdown */}
                      {feeEstimate.breakdown && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Fee Breakdown</Label>
                          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            {Object.entries(feeEstimate.breakdown).map(([item, amount]: [string, any]) => (
                              <div key={item} className="flex justify-between items-center">
                                <span className="text-sm">{item}</span>
                                <span className="text-sm font-medium">
                                  R {amount?.toLocaleString('en-ZA')}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 mt-2 border-t flex justify-between items-center">
                              <span className="text-sm font-medium">Total (incl. VAT)</span>
                              <span className="text-lg font-bold text-green-600">
                                R {((feeEstimate.monthlyFee || feeEstimate.recommendedFee || 0) * 1.15).toLocaleString('en-ZA')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `Fee Estimate:\nMonthly: R ${(feeEstimate.monthlyFee || feeEstimate.recommendedFee || 0).toLocaleString('en-ZA')}\nAnnual: R ${(feeEstimate.annualFee || (feeEstimate.monthlyFee || feeEstimate.recommendedFee || 0) * 12).toLocaleString('en-ZA')}`
                            );
                            toast({
                              title: 'Copied to Clipboard',
                              description: 'Fee estimate has been copied.'
                            });
                          }}
                          data-testid="button-copy-estimate"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Estimate
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => onUseTemplate({ ...template, feeEstimate })}
                          data-testid="button-use-with-pricing"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Use with Pricing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {!selectedClientId 
                          ? 'Select a client to generate fee estimation'
                          : 'Click "Generate Fee Estimate" to calculate fees'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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