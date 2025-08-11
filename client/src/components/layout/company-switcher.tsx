import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronDown, Check, ArrowRight, Plus, Sparkles, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";

interface Company {
  id: number;
  name: string;
  displayName?: string;
  industry?: string;
  logo?: string;
}

interface UserCompany {
  id: number;
  companyId: number;
  userId: number;
  role: string;
  company: Company;
}

export default function CompanySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Company creation form state
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

  // Track manual edits to prevent overwriting user changes
  const [manuallyEdited, setManuallyEdited] = useState({
    displayName: false,
    slug: false,
  });

  // Generate URL slug from text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Check if slug already exists (basic validation)
  const [slugValidation, setSlugValidation] = useState({ isValid: true, message: '' });

  // Get user's companies
  const { data: userCompanies = [], isLoading: companiesLoading } = useQuery<UserCompany[]>({
    queryKey: ["/api/companies/my"],
  });

  // Get active company
  const { data: activeCompany, isLoading: activeCompanyLoading } = useQuery<Company>({
    queryKey: ["/api/companies/active"],
  });

  // Filter companies based on search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return userCompanies;
    
    const query = searchQuery.toLowerCase();
    return userCompanies.filter(userCompany => {
      const company = userCompany.company;
      return (
        company.name.toLowerCase().includes(query) ||
        (company.displayName && company.displayName.toLowerCase().includes(query)) ||
        (company.industry && company.industry.toLowerCase().includes(query)) ||
        userCompany.role.toLowerCase().includes(query)
      );
    });
  }, [userCompanies, searchQuery]);

  // Switch company mutation
  const switchCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiRequest("/api/companies/switch", "POST", { companyId });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all queries to refresh data for new company
      queryClient.invalidateQueries();
      
      toast({
        title: "Company switched",
        description: `Now viewing ${data.company.name}`,
      });
      
      setIsOpen(false);
      
      // Force page reload to ensure all data is fresh
      window.location.reload();
    },
    onError: (error: any) => {
      console.error("Company switch error:", error);
      toast({
        title: "Failed to switch company",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCompanySchema>) => {
      const response = await apiRequest("/api/companies", "POST", data);
      return response.json();
    },
    onSuccess: (newCompany) => {
      toast({
        title: "Success",
        description: `${newCompany.name} created successfully!`,
      });
      
      // Invalidate companies query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      
      // Switch to the new company immediately - pass companyId object
      switchCompanyMutation.mutate(newCompany.id);
      
      // Reset form and close dialogs
      resetForm();
      setIsCreateDialogOpen(false);
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const handleSwitchCompany = async (companyId: number) => {
    if (companyId === activeCompany?.id) {
      setIsOpen(false);
      return;
    }
    
    await switchCompanyMutation.mutateAsync(companyId);
  };

  // Form handling functions
  const resetForm = () => {
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
    setManuallyEdited({
      displayName: false,
      slug: false,
    });
    setSlugValidation({ isValid: true, message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-fill logic when company name changes
      if (field === 'name') {
        // Auto-fill Display Name if not manually edited
        if (!manuallyEdited.displayName) {
          newData.displayName = value;
        }

        // Auto-generate URL Slug if not manually edited
        if (!manuallyEdited.slug) {
          newData.slug = generateSlug(value);
        }
      }

      return newData;
    });

    // Mark fields as manually edited when user directly modifies them
    if (field === 'displayName') {
      setManuallyEdited(prev => ({ ...prev, displayName: true }));
      
      // Reset flag if user clears the field
      if (value === '') {
        setManuallyEdited(prev => ({ ...prev, displayName: false }));
      }
    }

    if (field === 'slug') {
      setManuallyEdited(prev => ({ ...prev, slug: true }));
      
      // Reset flag if user clears the field
      if (value === '') {
        setManuallyEdited(prev => ({ ...prev, slug: false }));
      }

      // Validate slug format
      const isValidFormat = /^[a-z0-9-]*$/.test(value) && !value.startsWith('-') && !value.endsWith('-');
      
      let message = '';
      let isValid = true;
      
      if (value === '') {
        isValid = true;
      } else if (!isValidFormat) {
        isValid = false;
        message = 'Only lowercase letters, numbers, and hyphens allowed. Cannot start or end with hyphens.';
      }
      
      setSlugValidation({ isValid, message });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createCompanyMutation.mutate(formData);
  };

  const handleCreateCompanyClick = () => {
    setIsOpen(false); // Close the dropdown
    setSearchQuery(""); // Clear search
    setIsCreateDialogOpen(true); // Open the create dialog
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery(""); // Clear search when closing
    }
  };

  // Industry options
  const industryOptions = [
    { value: 'general', label: 'General Business' },
    { value: 'retail', label: 'Retail & Trading' },
    { value: 'services', label: 'Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing & Production' },
    { value: 'construction', label: 'Construction & Contracting' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'nonprofit', label: 'Non-Profit Organizations' },
  ];

  if (companiesLoading || activeCompanyLoading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!activeCompany || userCompanies.length === 0) {
    return null;
  }

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accountant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'employee':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-3 bg-white hover:bg-gray-50 border-gray-200 shadow-sm h-12 px-4 min-w-[240px] justify-between ring-1 ring-green-200"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium">
                {getCompanyInitials(activeCompany.displayName || activeCompany.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                  {activeCompany.displayName || activeCompany.name}
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5 font-medium"
                >
                  Active
                </Badge>
              </div>
              {activeCompany.industry && (
                <div className="text-xs text-gray-500 truncate max-w-[140px]">
                  {activeCompany.industry}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
        {/* Search Input */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white"
              autoFocus={false}
            />
          </div>
        </div>

        {/* Create Company Option - Prominent at top */}
        <div className="p-1">
          <DropdownMenuItem
            className="flex items-center space-x-3 p-3 cursor-pointer rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-200"
            onClick={handleCreateCompanyClick}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-800">Create New Company</span>
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-blue-600">Set up your business in minutes</span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuLabel className="font-semibold text-gray-900 flex items-center justify-between">
          <span>Your Companies ({filteredCompanies.length})</span>
          {searchQuery && (
            <span className="text-xs text-gray-500 font-normal">
              {filteredCompanies.length} of {userCompanies.length} shown
            </span>
          )}
        </DropdownMenuLabel>
        
        <div className="space-y-1 p-1">
          {filteredCompanies.length === 0 && searchQuery ? (
            <div className="p-3 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No companies found for "{searchQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredCompanies.map((userCompany) => {
            const company = userCompany.company;
            const isActive = company.id === activeCompany.id;
            
            return (
              <DropdownMenuItem
                key={company.id}
                className={cn(
                  "flex items-center space-x-3 p-3 cursor-pointer rounded-md transition-colors",
                  isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-gray-50"
                )}
                onClick={() => handleSwitchCompany(company.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      "text-sm font-medium",
                      isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      {getCompanyInitials(company.displayName || company.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "font-medium truncate",
                        isActive ? "text-primary" : "text-gray-900"
                      )}>
                        {company.displayName || company.name}
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5 font-medium"
                          >
                            Active
                          </Badge>
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getRoleColor(userCompany.role))}
                      >
                        {userCompany.role}
                      </Badge>
                      {company.companyId && (
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {company.companyId}
                        </span>
                      )}
                      {company.industry && (
                        <span className="text-xs text-gray-500 truncate">
                          {company.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isActive && (
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          }))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Company Creation Dialog */}
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Create New Company
          </DialogTitle>
          <DialogDescription>
            Set up your new company quickly. All essential configurations will be initialized automatically.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Business"
                required 
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="displayName" className="flex items-center gap-2">
                Display Name *
                {!manuallyEdited.displayName && formData.name && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Auto-filled</span>
                )}
              </Label>
              <Input 
                id="displayName" 
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="My Business"
                required 
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="flex items-center gap-2">
                URL Slug *
                {!manuallyEdited.slug && formData.name && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Auto-generated</span>
                )}
              </Label>
              <Input 
                id="slug" 
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="my-business"
                required 
                className={`w-full ${!slugValidation.isValid ? 'border-red-500' : ''}`}
              />
              {!slugValidation.isValid && (
                <p className="text-xs text-red-600 mt-1">{slugValidation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@mycompany.com"
                required 
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCompanyMutation.isPending || !slugValidation.isValid || !formData.name || !formData.email}
              className="flex items-center gap-2"
            >
              {createCompanyMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>
  );
}