import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronDown, ArrowRight, Plus, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import CompanyCreationForm from "@/components/forms/CompanyCreationForm";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { companyId, switchCompany, isLoading: companyLoading } = useCompany();
  const queryClient = useQueryClient();

  // Get user's companies
  const { data: userCompanies = [], isLoading: companiesLoading } = useQuery<UserCompany[]>({
    queryKey: ["/api/companies/my"],
  });

  // Get active company based on context companyId
  const activeCompany = useMemo(() => {
    if (!userCompanies.length || !companyId) return null;
    const userCompany = userCompanies.find(uc => uc.company.id === companyId);
    return userCompany?.company || null;
  }, [userCompanies, companyId]);

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

  const handleSwitchCompany = async (targetCompanyId: number) => {
    if (targetCompanyId === companyId) {
      setIsOpen(false);
      return;
    }
    
    // Close dropdown immediately for better UX
    setIsOpen(false);
    setSearchQuery(""); // Clear search when switching
    
    try {
      // Switch company with optimistic UI update
      await switchCompany(targetCompanyId);
    } catch (error) {
      console.error('Failed to switch company:', error);
      // Error handling is done in switchCompany function
    }
  };

  const handleCreateCompanyClick = () => {
    setIsOpen(false); // Close the dropdown
    setSearchQuery(""); // Clear search
    setIsCreateDialogOpen(true); // Open the creation dialog directly
  };

  const handleCreationSuccess = () => {
    // Refresh companies list after successful creation
    queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery(""); // Clear search when closing
    }
  };

  if (companiesLoading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!activeCompany || userCompanies.length === 0) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'accountant':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-3 h-auto p-2 hover:bg-white/20 bg-white/10 border border-white/20 rounded-lg min-w-0 backdrop-blur-sm"
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-white text-sm font-medium">
              {getCompanyInitials(activeCompany.displayName || activeCompany.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium text-white truncate text-sm">
              {activeCompany.displayName || activeCompany.name}
            </div>
            {activeCompany.industry && (
              <div className="text-xs text-gray-300 truncate max-w-[140px]">
                {activeCompany.industry}
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-white/70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-96 max-h-[600px] overflow-hidden shadow-xl border-0">
        {/* Search Input - First */}
        <div className="p-3 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-gray-200 focus:bg-white text-sm"
              autoFocus={false}
            />
          </div>
        </div>

        {/* Create Company Option - Second */}
        <div className="p-3 border-b border-gray-100 bg-white">
          <DropdownMenuItem
            className="flex items-center space-x-3 p-4 cursor-pointer rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 bg-blue-50/30"
            onClick={handleCreateCompanyClick}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-blue-800 text-sm">Create New Company</span>
              <p className="text-xs text-blue-600 mt-0.5">Set up your business in minutes</p>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuLabel className="px-4 py-3 font-medium text-gray-700 text-sm bg-white flex items-center justify-between border-b border-gray-100">
          <span>Available Companies</span>
          {searchQuery && (
            <span className="text-xs text-gray-400 font-normal">
              {filteredCompanies.length} results
            </span>
          )}
        </DropdownMenuLabel>
        
        <div className="max-h-80 overflow-y-auto bg-white">
          {filteredCompanies.length === 0 && searchQuery ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No organizations found for "{searchQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredCompanies.map((userCompany) => {
            const company = userCompany.company;
            const isActive = company.id === companyId;
            
            return (
              <DropdownMenuItem
                key={company.id}
                className={cn(
                  "flex items-center space-x-3 p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 hover:bg-gray-50",
                  isActive ? "bg-blue-50 border-blue-100" : ""
                )}
                onClick={() => handleSwitchCompany(company.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Company Avatar with initials or icon */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        "text-sm font-medium border-2",
                        isActive 
                          ? "bg-blue-600 text-white border-blue-200" 
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {getCompanyInitials(company.displayName || company.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium text-sm truncate",
                        isActive ? "text-blue-800" : "text-gray-900"
                      )}>
                        {company.displayName || company.name}
                      </span>
                      {isActive && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-medium px-2 py-0.5",
                          userCompany.role === 'owner' ? "bg-purple-100 text-purple-700" :
                          userCompany.role === 'admin' ? "bg-blue-100 text-blue-700" :
                          userCompany.role === 'manager' ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        )}
                      >
                        {userCompany.role}
                      </Badge>
                      <span className="text-xs text-gray-500 truncate">
                        {company.industry || "General Business"}
                      </span>
                    </div>
                    
                    {/* Company ID - Consistent format */}
                    <div className="text-xs text-gray-400 mt-1">
                      Company ID: {904886369 + company.id}
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

    {/* Company Creation Form Dialog */}
    <CompanyCreationForm 
      isOpen={isCreateDialogOpen}
      onClose={() => setIsCreateDialogOpen(false)}
      onSuccess={handleCreationSuccess}
    />
  </>
  );
}