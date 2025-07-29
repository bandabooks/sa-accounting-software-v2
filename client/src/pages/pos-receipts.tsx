import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Receipt, Printer, Mail, Download, Settings, 
  Eye, Copy, Share2, FileText, Smartphone
} from "lucide-react";

interface ReceiptTemplate {
  id: number;
  name: string;
  type: 'standard' | 'thermal' | 'email' | 'mobile';
  header: string;
  footer: string;
  includeCompanyLogo: boolean;
  includeVatDetails: boolean;
  includeLoyaltyPoints: boolean;
  includePromotions: boolean;
  fontSize: number;
  paperWidth: number;
  isDefault: boolean;
  isActive: boolean;
}

interface ReceiptSettings {
  autoPrint: boolean;
  emailReceipts: boolean;
  smsReceipts: boolean;
  printCopies: number;
  defaultTemplate: number;
  companyLogo: string;
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    vatNumber: string;
  };
}

export default function POSReceiptsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'preview'>('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReceiptTemplate | null>(null);
  const [previewSale, setPreviewSale] = useState<any>(null);
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'standard' as const,
    header: '',
    footer: '',
    includeCompanyLogo: true,
    includeVatDetails: true,
    includeLoyaltyPoints: false,
    includePromotions: true,
    fontSize: 12,
    paperWidth: 80
  });

  const [settingsForm, setSettingsForm] = useState<ReceiptSettings>({
    autoPrint: true,
    emailReceipts: false,
    smsReceipts: false,
    printCopies: 1,
    defaultTemplate: 1,
    companyLogo: '',
    companyDetails: {
      name: 'Taxnify Business',
      address: '123 Business Street, Cape Town, 8001',
      phone: '+27 21 123 4567',
      email: 'info@taxnify.com',
      website: 'www.taxnify.com',
      vatNumber: '4123456789'
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch receipt data
  const { data: receiptTemplates = [] } = useQuery<ReceiptTemplate[]>({
    queryKey: ['/api/pos/receipt-templates'],
  });

  const { data: receiptSettings } = useQuery<ReceiptSettings>({
    queryKey: ['/api/pos/receipt-settings'],
  });

  const { data: sampleSales = [] } = useQuery<any[]>({
    queryKey: ['/api/pos/sales'],
  });

  // Create/Update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      if (editingTemplate) {
        return await apiRequest(`/api/pos/receipt-templates/${editingTemplate.id}`, 'PUT', templateData);
      } else {
        return await apiRequest('/api/pos/receipt-templates', 'POST', templateData);
      }
    },
    onSuccess: () => {
      toast({
        title: editingTemplate ? "Template Updated" : "Template Created",
        description: `Receipt template "${templateForm.name}" has been ${editingTemplate ? 'updated' : 'created'} successfully`,
      });
      setShowTemplateModal(false);
      setEditingTemplate(null);
      resetTemplateForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/receipt-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: ReceiptSettings) => {
      return await apiRequest('/api/pos/receipt-settings', 'PUT', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Receipt settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/receipt-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  // Print/Email receipt mutation
  const sendReceiptMutation = useMutation({
    mutationFn: async ({ saleId, method, recipient }: { saleId: number; method: 'print' | 'email' | 'sms'; recipient?: string }) => {
      return await apiRequest('/api/pos/send-receipt', 'POST', { saleId, method, recipient });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Receipt Sent",
        description: `Receipt has been ${variables.method === 'print' ? 'printed' : 'sent'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send receipt",
        variant: "destructive",
      });
    },
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'standard',
      header: '',
      footer: '',
      includeCompanyLogo: true,
      includeVatDetails: true,
      includeLoyaltyPoints: false,
      includePromotions: true,
      fontSize: 12,
      paperWidth: 80
    });
  };

  const handleEditTemplate = (template: ReceiptTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      header: template.header,
      footer: template.footer,
      includeCompanyLogo: template.includeCompanyLogo,
      includeVatDetails: template.includeVatDetails,
      includeLoyaltyPoints: template.includeLoyaltyPoints,
      includePromotions: template.includePromotions,
      fontSize: template.fontSize,
      paperWidth: template.paperWidth
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    saveTemplateMutation.mutate(templateForm);
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settingsForm);
  };

  const generateReceiptPreview = (template: ReceiptTemplate, sale: any) => {
    return `
${template.includeCompanyLogo ? '[COMPANY LOGO]' : ''}
${template.header || settingsForm.companyDetails.name}
${settingsForm.companyDetails.address}
${settingsForm.companyDetails.phone}
${template.includeVatDetails ? `VAT: ${settingsForm.companyDetails.vatNumber}` : ''}

RECEIPT: ${sale.receiptNumber || 'SALE-' + sale.id}
Date: ${new Date(sale.saleDate).toLocaleString()}
Cashier: ${sale.cashierName || 'Staff Member'}
${sale.customerName ? `Customer: ${sale.customerName}` : ''}

${'-'.repeat(template.paperWidth / 2)}
${(sale.items || []).map((item: any) => `
${item.productName}
${item.quantity} x R${item.unitPrice.toFixed(2)} = R${item.totalAmount.toFixed(2)}
`).join('')}
${'-'.repeat(template.paperWidth / 2)}

Subtotal: R${(sale.subtotalAmount || 0).toFixed(2)}
${template.includeVatDetails ? `VAT (15%): R${(sale.vatAmount || 0).toFixed(2)}` : ''}
TOTAL: R${(sale.totalAmount || 0).toFixed(2)}

Payment: ${sale.paymentMethod || 'Cash'}
${sale.paymentMethod === 'cash' && sale.cashTendered ? `Tendered: R${sale.cashTendered.toFixed(2)}` : ''}
${sale.paymentMethod === 'cash' && sale.changeGiven ? `Change: R${sale.changeGiven.toFixed(2)}` : ''}

${template.includeLoyaltyPoints ? 'Loyalty Points Earned: 24' : ''}
${template.includePromotions ? 'Promotions Applied: Summer Sale 10%' : ''}

${template.footer || 'Thank you for your business!'}
${settingsForm.companyDetails.website}
`;
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'thermal': return <Printer className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipt Management</h1>
          <p className="text-gray-600 mt-1">Manage receipt templates and printing settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingTemplate(null); resetTemplateForm(); }}>
                <Receipt className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Receipt Template' : 'Create Receipt Template'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Standard Receipt"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Template Type</Label>
                    <select
                      id="type"
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="standard">Standard Receipt</option>
                      <option value="thermal">Thermal Printer</option>
                      <option value="email">Email Receipt</option>
                      <option value="mobile">Mobile Receipt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="header">Header Text</Label>
                  <Textarea
                    id="header"
                    value={templateForm.header}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, header: e.target.value }))}
                    placeholder="Custom header text (optional)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="footer">Footer Text</Label>
                  <Textarea
                    id="footer"
                    value={templateForm.footer}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, footer: e.target.value }))}
                    placeholder="Thank you for your business!"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      min="8"
                      max="20"
                      value={templateForm.fontSize}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paperWidth">Paper Width (mm)</Label>
                    <Input
                      id="paperWidth"
                      type="number"
                      min="40"
                      max="120"
                      value={templateForm.paperWidth}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, paperWidth: parseInt(e.target.value) || 80 }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Include in Receipt:</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={templateForm.includeCompanyLogo}
                        onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, includeCompanyLogo: checked }))}
                      />
                      <Label>Company Logo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={templateForm.includeVatDetails}
                        onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, includeVatDetails: checked }))}
                      />
                      <Label>VAT Details</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={templateForm.includeLoyaltyPoints}
                        onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, includeLoyaltyPoints: checked }))}
                      />
                      <Label>Loyalty Points</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={templateForm.includePromotions}
                        onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, includePromotions: checked }))}
                      />
                      <Label>Promotions</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowTemplateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveTemplateMutation.isPending}>
                    {saveTemplateMutation.isPending ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'templates', label: 'Templates', icon: Receipt },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Receipt Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receiptTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No receipt templates created yet</p>
                <p className="text-sm">Create your first template to customize receipt formatting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receiptTemplates.map((template) => (
                  <div key={template.id} className={`border rounded-lg p-4 ${template.isDefault ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${template.isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {getTemplateIcon(template.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                            <Badge variant={template.isActive ? "secondary" : "outline"}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{template.type.replace('_', ' ')} Template</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {template.fontSize}pt font
                            </span>
                            <span className="text-xs text-gray-500">
                              {template.paperWidth}mm wide
                            </span>
                            <span className="text-xs text-gray-500">
                              {[
                                template.includeCompanyLogo && 'Logo',
                                template.includeVatDetails && 'VAT',
                                template.includeLoyaltyPoints && 'Loyalty',
                                template.includePromotions && 'Promos'
                              ].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewSale(sampleSales[0] || {})}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Receipt Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Printing Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoPrint">Auto-print after sale</Label>
                      <Switch
                        id="autoPrint"
                        checked={settingsForm.autoPrint}
                        onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, autoPrint: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailReceipts">Send email receipts</Label>
                      <Switch
                        id="emailReceipts"
                        checked={settingsForm.emailReceipts}
                        onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, emailReceipts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsReceipts">Send SMS receipts</Label>
                      <Switch
                        id="smsReceipts"
                        checked={settingsForm.smsReceipts}
                        onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, smsReceipts: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Print Configuration</h3>
                  <div>
                    <Label htmlFor="printCopies">Number of copies</Label>
                    <Input
                      id="printCopies"
                      type="number"
                      min="1"
                      max="5"
                      value={settingsForm.printCopies}
                      onChange={(e) => setSettingsForm(prev => ({ 
                        ...prev, 
                        printCopies: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultTemplate">Default template</Label>
                    <select
                      id="defaultTemplate"
                      value={settingsForm.defaultTemplate}
                      onChange={(e) => setSettingsForm(prev => ({ 
                        ...prev, 
                        defaultTemplate: parseInt(e.target.value) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {receiptTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settingsForm.companyDetails.name}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      companyDetails: { ...prev.companyDetails, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={settingsForm.companyDetails.vatNumber}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      companyDetails: { ...prev.companyDetails, vatNumber: e.target.value }
                    }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={settingsForm.companyDetails.address}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      companyDetails: { ...prev.companyDetails, address: e.target.value }
                    }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settingsForm.companyDetails.phone}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      companyDetails: { ...prev.companyDetails, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settingsForm.companyDetails.email}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      companyDetails: { ...prev.companyDetails, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Sale for Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {sampleSales.length === 0 ? (
                <p className="text-gray-500">No sales available for preview</p>
              ) : (
                <div className="space-y-2">
                  {sampleSales.slice(0, 5).map((sale) => (
                    <div
                      key={sale.id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                        previewSale?.id === sale.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setPreviewSale(sale)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {sale.receiptNumber || `SALE-${sale.id}`}
                        </span>
                        <span>R {(sale.totalAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Receipt Preview
                {previewSale && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!previewSale ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a sale to preview receipt</p>
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    {generateReceiptPreview(
                      receiptTemplates.find(t => t.isDefault) || receiptTemplates[0] || {
                        header: '',
                        footer: '',
                        includeCompanyLogo: true,
                        includeVatDetails: true,
                        includeLoyaltyPoints: false,
                        includePromotions: false,
                        paperWidth: 80
                      } as ReceiptTemplate,
                      previewSale
                    )}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}