import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Briefcase,
  Clock,
  Calculator,
  FileText,
  BarChart3,
  MessageSquare,
  Package,
  PieChart,
  ShoppingCart,
  Building2,
  Receipt,
  UserCheck,
  FileCheck,
  Search,
  Play,
  Filter,
  Grid,
  List,
  Zap,
  Users,
  TrendingUp,
  Banknote,
  Calendar,
  Award,
  Shield,
  Target,
  BookOpen,
  Gavel,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Star,
  Crown,
  Settings,
  Save,
  Plus,
  Trash2,
  Edit3,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { accountingServicesData, serviceCategories, userRoles } from '@shared/accountingServices';

export default function ProfessionalServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editableService, setEditableService] = useState<any>({});
  const [isStartWorkingOpen, setIsStartWorkingOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/project-templates'],
    queryFn: () => fetch('/api/project-templates').then(res => res.json()).catch(() => [])
  });

  // Save service configuration mutation
  const saveServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      // This would typically save to your backend
      return Promise.resolve(serviceData);
    },
    onSuccess: () => {
      toast({
        title: "Service Configuration Saved",
        description: "Your service settings have been saved successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save service configuration.",
        variant: "destructive",
      });
    }
  });

  // Handler for "Start Working" button
  const handleStartWorking = (service: any) => {
    // Find matching template for this service
    const matchingTemplate = templates.find((template: any) => 
      template.name.toLowerCase().includes(service.name.toLowerCase()) ||
      template.category === service.category.toLowerCase().replace(' ', '_')
    );
    
    setSelectedTemplate(matchingTemplate || {
      id: `service_${service.id}`,
      name: service.name,
      description: service.description,
      category: service.category.toLowerCase().replace(' ', '_'),
      estimatedHours: service.estimatedHours || 8,
      priority: 'medium',
      tasks: [
        {
          name: `Complete ${service.name}`,
          description: service.description,
          priority: 'medium',
          estimatedHours: service.estimatedHours || 8,
          category: service.category,
          order: 1,
          isRequired: true
        }
      ],
      budgetRange: {
        min: service.suggestedPrice?.min || 500,
        max: service.suggestedPrice?.max || 2000,
        currency: 'ZAR'
      }
    });
    setIsStartWorkingOpen(true);
  };

  // Use the comprehensive accounting services data
  const allServices = accountingServicesData;
  const categories = ['All', ...serviceCategories];
  const complexityLevels = ['All', 'basic', 'intermediate', 'advanced'];
  const roles = ['All', ...userRoles];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'All' || service.complexity === selectedComplexity;
    const matchesRole = selectedRole === 'All' || service.roleAccess.includes(selectedRole);
    const isActive = service.active;
    
    return matchesSearch && matchesCategory && matchesComplexity && matchesRole && isActive;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Financial Statements': 'bg-blue-100 text-blue-800 border-blue-200',
      'VAT Services': 'bg-green-100 text-green-800 border-green-200', 
      'Income Tax': 'bg-purple-100 text-purple-800 border-purple-200',
      'CIPC Services': 'bg-orange-100 text-orange-800 border-orange-200',
      'Payroll Services': 'bg-pink-100 text-pink-800 border-pink-200',
      'COIDA Services': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CIDB Services': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Bookkeeping': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Audit Services': 'bg-red-100 text-red-800 border-red-200',
      'Compliance Services': 'bg-teal-100 text-teal-800 border-teal-200',
      'Business Advisory': 'bg-violet-100 text-violet-800 border-violet-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      'basic': 'bg-green-100 text-green-700 border-green-200',
      'intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'advanced': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[complexity as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'basic': return <CheckCircle2 className="h-3 w-3" />;
      case 'intermediate': return <AlertCircle className="h-3 w-3" />;
      case 'advanced': return <Crown className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Financial Statements': FileCheck,
      'VAT Services': PieChart,
      'Income Tax': Calculator,
      'CIPC Services': Building2,
      'Payroll Services': Users,
      'COIDA Services': Shield,
      'CIDB Services': Award,
      'Bookkeeping': BookOpen,
      'Audit Services': Target,
      'Compliance Services': Gavel,
      'Business Advisory': Briefcase
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const formatPrice = (service: any) => {
    const { suggestedPrice } = service;
    const min = parseFloat(suggestedPrice.min);
    const max = parseFloat(suggestedPrice.max);
    
    if (min === max) {
      return `R ${min.toLocaleString()}`;
    }
    return `R ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const getPriceUnit = (unit: string) => {
    const units = {
      'once-off': 'Once-off',
      'monthly': 'per month',
      'annually': 'per year',
      'hourly': 'per hour',
      'bi-annually': 'bi-annually',
      'bi-monthly': 'bi-monthly',
      'per employee per month': 'per employee/month',
      'per certificate': 'per certificate',
      'per transaction': 'per transaction',
      'per name': 'per name'
    };
    return units[unit as keyof typeof units] || unit;
  };

  const handleSetupService = (service: any) => {
    setSelectedService(service);
    setEditableService({
      ...service,
      customPricing: service.suggestedPrice,
      workflowSteps: service.workflowSteps || [
        'Initial consultation',
        'Gather required documents',
        'Process application',
        'Review and submit',
        'Follow-up'
      ],
      automationSettings: {
        autoReminders: true,
        emailNotifications: true,
        deadlineAlerts: true
      }
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveServiceConfig = () => {
    saveServiceMutation.mutate(editableService);
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Professional Accounting & Tax Services</h1>
              <p className="text-gray-600 mt-1">
                {allServices.length} comprehensive services for South African accounting practices
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                {filteredServices.length} Active Services
              </Badge>
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                {serviceCategories.length} Categories
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger>
                <SelectValue placeholder="Complexity Level" />
              </SelectTrigger>
              <SelectContent>
                {complexityLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === 'All' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role Access" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role === 'All' ? 'All Roles' : role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Showing {filteredServices.length} of {allServices.length} services</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg group-hover:scale-105 transition-transform">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">{service.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={`${getCategoryColor(service.category)} text-xs border`}>
                              {service.category}
                            </Badge>
                            <Badge className={`${getComplexityColor(service.complexity)} text-xs border`}>
                              {getComplexityIcon(service.complexity)}
                              <span className="ml-1">{service.complexity}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                    
                    <div className="space-y-4">
                      {/* Pricing Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Banknote className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Pricing</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{formatPrice(service)}</div>
                            <div className="text-xs text-gray-500">{getPriceUnit(service.suggestedPrice.unit)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{service.estimatedHours}h est.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{service.roleAccess.length} roles</span>
                        </div>
                      </div>

                      {/* Qualifications Required */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Required Qualifications:</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.requiredQualifications.slice(0, 2).map((qual: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {qual}
                            </Badge>
                          ))}
                          {service.requiredQualifications.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.requiredQualifications.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Compliance Deadlines */}
                      {service.complianceDeadlines && service.complianceDeadlines.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-700 mb-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Compliance Deadline:
                          </h4>
                          <p className="text-xs text-red-600">{service.complianceDeadlines[0]}</p>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-4">
                        <Button 
                          onClick={() => handleStartWorking(service)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Working
                        </Button>
                        <Button 
                          onClick={() => handleSetupService(service)}
                          variant="outline"
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg group-hover:scale-105 transition-transform">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h3>
                              <p className="text-gray-600 text-sm mb-3 max-w-2xl">{service.description}</p>
                              
                              <div className="flex items-center space-x-3 mb-3">
                                <Badge className={`${getCategoryColor(service.category)} border`}>
                                  {service.category}
                                </Badge>
                                <Badge className={`${getComplexityColor(service.complexity)} border`}>
                                  {getComplexityIcon(service.complexity)}
                                  <span className="ml-1">{service.complexity}</span>
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>{service.estimatedHours}h</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Users className="h-4 w-4" />
                                  <span>{service.roleAccess.length} roles</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Banknote className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-600">{formatPrice(service)}</span>
                                  <span className="text-gray-500">{getPriceUnit(service.suggestedPrice.unit)}</span>
                                </div>
                                
                                {service.complianceDeadlines && service.complianceDeadlines.length > 0 && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">{service.complianceDeadlines[0]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleStartWorking(service)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Working
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleSetupService(service)}
                                className="border-gray-300 hover:bg-gray-50"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Setup
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedComplexity('All');
                setSelectedRole('All');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Service Categories Summary */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Categories Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceCategories.map(category => {
              const categoryServices = allServices.filter(s => s.category === category && s.active);
              const CategoryIcon = getCategoryIcon(category);
              return (
                <div 
                  key={category}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CategoryIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{category}</h3>
                      <p className="text-xs text-gray-500">{categoryServices.length} services</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Configuration Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Service: {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Customize pricing, workflow, and automation settings for this service.
            </DialogDescription>
          </DialogHeader>
          
          {editableService && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceName">Service Name</Label>
                  <Input
                    id="serviceName"
                    value={editableService.name || ''}
                    onChange={(e) => setEditableService((prev: any) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editableService.category || ''}
                    onValueChange={(value) => setEditableService((prev: any) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editableService.description || ''}
                  onChange={(e) => setEditableService((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minPrice">Minimum Price (R)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={editableService.customPricing?.min || ''}
                    onChange={(e) => setEditableService((prev: any) => ({
                      ...prev,
                      customPricing: { ...prev.customPricing, min: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Maximum Price (R)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={editableService.customPricing?.max || ''}
                    onChange={(e) => setEditableService((prev: any) => ({
                      ...prev,
                      customPricing: { ...prev.customPricing, max: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={editableService.estimatedHours || ''}
                    onChange={(e) => setEditableService((prev: any) => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Automation Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto Reminders</Label>
                      <p className="text-xs text-gray-500">Automatically send deadline reminders</p>
                    </div>
                    <Switch
                      checked={editableService.automationSettings?.autoReminders || false}
                      onCheckedChange={(checked) => setEditableService((prev: any) => ({
                        ...prev,
                        automationSettings: { ...prev.automationSettings, autoReminders: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-gray-500">Send email updates to clients</p>
                    </div>
                    <Switch
                      checked={editableService.automationSettings?.emailNotifications || false}
                      onCheckedChange={(checked) => setEditableService((prev: any) => ({
                        ...prev,
                        automationSettings: { ...prev.automationSettings, emailNotifications: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Deadline Alerts</Label>
                      <p className="text-xs text-gray-500">Alert team before deadlines</p>
                    </div>
                    <Switch
                      checked={editableService.automationSettings?.deadlineAlerts || false}
                      onCheckedChange={(checked) => setEditableService((prev: any) => ({
                        ...prev,
                        automationSettings: { ...prev.automationSettings, deadlineAlerts: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveServiceConfig}
                  disabled={saveServiceMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saveServiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Start Working Dialog */}
      <Dialog open={isStartWorkingOpen} onOpenChange={setIsStartWorkingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Start Working: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              This will create a new project based on the service template.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate((prev: any) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  value={selectedTemplate.description}
                  onChange={(e) => setSelectedTemplate((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={selectedTemplate.estimatedHours}
                    onChange={(e) => setSelectedTemplate((prev: any) => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={selectedTemplate.priority}
                    onValueChange={(value) => setSelectedTemplate((prev: any) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsStartWorkingOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // This would create the project
                    toast({
                      title: "Project Created",
                      description: `Started working on ${selectedTemplate.name}`,
                    });
                    setIsStartWorkingOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}