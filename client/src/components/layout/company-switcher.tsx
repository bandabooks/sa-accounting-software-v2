import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronDown, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's companies
  const { data: userCompanies = [], isLoading: companiesLoading } = useQuery<UserCompany[]>({
    queryKey: ["/api/companies/my"],
  });

  // Get active company
  const { data: activeCompany, isLoading: activeCompanyLoading } = useQuery<Company>({
    queryKey: ["/api/companies/active"],
  });

  // Switch company mutation
  const switchCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiRequest("POST", "/api/companies/switch", { companyId });
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
      toast({
        title: "Failed to switch company",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSwitchCompany = async (companyId: number) => {
    if (companyId === activeCompany?.id) {
      setIsOpen(false);
      return;
    }
    
    await switchCompanyMutation.mutateAsync(companyId);
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-3 bg-white hover:bg-gray-50 border-gray-200 shadow-sm h-12 px-4 min-w-[200px] justify-between"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-sm font-medium">
                {getCompanyInitials(activeCompany.displayName || activeCompany.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {activeCompany.displayName || activeCompany.name}
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
        <DropdownMenuLabel className="font-semibold text-gray-900">
          Switch Company ({userCompanies.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="space-y-1 p-1">
          {userCompanies.map((userCompany) => {
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
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getRoleColor(userCompany.role))}
                      >
                        {userCompany.role}
                      </Badge>
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
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}