import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building, Plus, Users, Settings, Crown, Shield, User, UserPlus } from "lucide-react";
import { insertCompanySchema, type Company, type CompanyUser } from "@shared/schema";
import { z } from "zod";

export default function Companies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch user's companies
  const { data: userCompanies, isLoading } = useQuery({
    queryKey: ["/api/companies/my"],
  });

  // Fetch active company
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
  });

  // Fetch company users when a company is selected
  const { data: companyUsers } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "users"],
    enabled: !!selectedCompany,
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCompanySchema>) => {
      return await apiRequest("POST", "/api/companies", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      setIsCreateDialogOpen(false);
      // Reset form
      setFormData({
        name: '',
        displayName: '',
        slug: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'South Africa',
        vatNumber: '',
        registrationNumber: '',
        industry: 'general',
        industryTemplate: 'general',
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  // Set active company mutation
  const setActiveCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return await apiRequest("POST", `/api/companies/${companyId}/set-active`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Active company updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/active"] });
      // Refresh page to update all data with new company context
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to set active company",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    vatNumber: '',
    registrationNumber: '',
    industry: 'general',
    industryTemplate: 'general',
  });

  // Industry options
  const industryOptions = [
    { value: 'general', label: 'General Business', description: 'Default template suitable for most businesses' },
    { value: 'retail', label: 'Retail & Trading', description: 'Businesses focused on buying and selling merchandise' },
    { value: 'services', label: 'Professional Services', description: 'Service-based businesses including consulting, professional services' },
    { value: 'manufacturing', label: 'Manufacturing & Production', description: 'Businesses involved in manufacturing and production' },
    { value: 'construction', label: 'Construction & Contracting', description: 'Construction companies and contractors' },
    { value: 'technology', label: 'Technology & Software', description: 'Technology companies, software development, IT services' },
    { value: 'healthcare', label: 'Healthcare & Medical', description: 'Medical practices, healthcare providers' },
    { value: 'nonprofit', label: 'Non-Profit Organizations', description: 'Charitable organizations, NGOs, foundations' },
    { value: 'agriculture', label: 'Agriculture & Farming', description: 'Farming, agriculture, livestock businesses' },
    { value: 'hospitality', label: 'Hospitality & Tourism', description: 'Hotels, restaurants, tourism businesses' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createCompanyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin": return <Shield className="h-4 w-4 text-blue-500" />;
      case "manager": return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: "bg-yellow-100 text-yellow-800",
      admin: "bg-blue-100 text-blue-800", 
      manager: "bg-green-100 text-green-800",
      accountant: "bg-purple-100 text-purple-800",
      employee: "bg-gray-100 text-gray-800",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.employee}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-2">Manage your companies and switch between them</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="touch-button">
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Enter the details for your new company. You will be the owner with full access.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input 
                    id="displayName" 
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input 
                  id="slug" 
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="my-company" 
                  required 
                />
                <p className="text-sm text-gray-500 mt-1">Used in URLs (lowercase, no spaces)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                      <SelectItem value="Botswana">Botswana</SelectItem>
                      <SelectItem value="Namibia">Namibia</SelectItem>
                      <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input 
                    id="vatNumber" 
                    value={formData.vatNumber}
                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input 
                    id="registrationNumber" 
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => {
                    handleInputChange('industry', value);
                    handleInputChange('industryTemplate', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  This determines which Chart of Accounts will be activated for your company
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Company */}
      {activeCompany && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Active Company: {activeCompany.displayName}
            </CardTitle>
            <CardDescription>
              All operations will be performed under this company
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Company List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Companies</h2>
          <div className="space-y-4">
            {userCompanies?.map((companyUser: CompanyUser & { company: Company }) => (
              <Card 
                key={companyUser.company.id} 
                className={`cursor-pointer transition-all hover:shadow-md mobile-tap-area ${
                  activeCompany?.id === companyUser.company.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCompany(companyUser.company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{companyUser.company.displayName}</h3>
                        {getRoleIcon(companyUser.role)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{companyUser.company.email}</p>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(companyUser.role)}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          companyUser.company.subscriptionStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {companyUser.company.subscriptionPlan}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {activeCompany?.id !== companyUser.company.id && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCompanyMutation.mutate(companyUser.company.id);
                          }}
                          disabled={setActiveCompanyMutation.isPending}
                        >
                          Switch To
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompany(companyUser.company);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Details */}
        {selectedCompany && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Company Details</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {selectedCompany.displayName}
                </CardTitle>
                <CardDescription>{selectedCompany.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Email:</strong> {selectedCompany.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedCompany.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Country:</strong> {selectedCompany.country}
                  </div>
                  <div>
                    <strong>Currency:</strong> {selectedCompany.currency}
                  </div>
                  <div>
                    <strong>VAT Number:</strong> {selectedCompany.vatNumber || 'N/A'}
                  </div>
                  <div>
                    <strong>Registration:</strong> {selectedCompany.registrationNumber || 'N/A'}
                  </div>
                </div>

                {companyUsers && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members ({companyUsers.length})
                    </h4>
                    <div className="space-y-2">
                      {companyUsers.map((user: CompanyUser & { user: any }) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span className="font-medium">{user.user.name}</span>
                            <span className="text-sm text-gray-600">({user.user.email})</span>
                          </div>
                          {getRoleBadge(user.role)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}