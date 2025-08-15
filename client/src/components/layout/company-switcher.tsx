import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface Company {
  id: number;
  companyId?: string;
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
  const { companyId, switchCompany, isLoading: companyLoading } = useCompany();

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

  const handleSwitchCompany = async (targetCompanyId: number) => {
    if (targetCompanyId === companyId) {
      setIsOpen(false);
      return;
    }
    
    try {
      await switchCompany(targetCompanyId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  const handleCreateCompanyClick = () => {
    setIsOpen(false); // Close the dropdown
    setSearchQuery(""); // Clear search
    // Navigate to companies page where the main creation form exists with subscription dropdown
    window.location.href = '/companies?create=true';
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery(""); // Clear search when closing
    }
  };

  if (companiesLoading || activeCompanyLoading) {
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
          className="flex items-center space-x-3 h-auto p-2 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-w-0"
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-white text-sm font-medium">
              {getCompanyInitials(activeCompany.displayName || activeCompany.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
              {activeCompany.displayName || activeCompany.name}
            </div>
            {activeCompany.industry && (
              <div className="text-xs text-gray-500 truncate max-w-[140px]">
                {activeCompany.industry}
              </div>
            )}
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
                      {isActive && <span className="text-xs text-primary">Active</span>}
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
  </>
  );
}