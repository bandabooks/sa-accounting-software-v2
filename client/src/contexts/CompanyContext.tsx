import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CompanyContextType {
  companyId: number | null;
  switchCompany: (newCompanyId: number) => Promise<void>;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// AbortController for canceling in-flight requests
let abortController: AbortController | null = null;

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial company from localStorage or API
  useEffect(() => {
    const loadCompany = async () => {
      try {
        // Check localStorage first
        const storedCompanyId = localStorage.getItem('activeCompanyId');
        if (storedCompanyId) {
          setCompanyId(parseInt(storedCompanyId));
        } else {
          // Fetch from API
          const response = await fetch('/api/companies/active', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'X-Session-Token': localStorage.getItem('sessionToken') || '',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setCompanyId(data.id);
            localStorage.setItem('activeCompanyId', data.id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to load active company:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompany();
  }, []);

  const switchCompany = useCallback(async (newCompanyId: number) => {
    if (newCompanyId === companyId) return;

    setIsLoading(true);

    try {
      // 1. Update local state immediately for instant UI feedback
      setCompanyId(newCompanyId);
      localStorage.setItem('activeCompanyId', newCompanyId.toString());

      // 2. Update company in backend (parallel with cache operations)
      const backendUpdatePromise = fetch('/api/companies/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Session-Token': localStorage.getItem('sessionToken') || '',
          'X-Company-ID': newCompanyId.toString(),
        },
        body: JSON.stringify({ companyId: newCompanyId }),
      });

      // 3. Complete cache invalidation - clear ALL company-specific queries
      queryClient.invalidateQueries();
      queryClient.clear();

      // 4. Update URL with company parameter (non-blocking) - Remove this as it's causing issues
      // const url = new URL(window.location.href);
      // url.searchParams.set('co', newCompanyId.toString());
      // window.history.pushState({}, '', url.toString());

      // 5. WebSocket reconnection (non-blocking)
      if (window.wsConnection) {
        window.wsConnection.send(JSON.stringify({
          type: 'switch_company',
          oldCompanyId: companyId,
          newCompanyId: newCompanyId,
        }));
      }

      // 6. Wait for backend update to complete
      const response = await backendUpdatePromise;
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Company switch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          companyId: newCompanyId
        });
        throw new Error(`Failed to switch company: ${response.status} - ${errorData}`);
      }

      // 7. Get response data and update UI
      const data = await response.json();
      
      // 8. Force refresh of company-specific data with the new company context
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/companies/active'] }),
        queryClient.refetchQueries({ queryKey: ['/api/companies/active'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/companies/my'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/expenses'] })
      ]);
      
      toast({
        title: "Company switched",
        description: `Now viewing ${data.company.name}`,
      });

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to switch company:', error);
        toast({
          title: "Error",
          description: "Failed to switch company",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  return (
    <CompanyContext.Provider value={{ companyId, switchCompany, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

// Helper to get company ID for query keys
export function getCompanyId(): number {
  const storedId = localStorage.getItem('activeCompanyId');
  return storedId ? parseInt(storedId) : 0;
}

// Extend window type for WebSocket connection
declare global {
  interface Window {
    wsConnection?: WebSocket;
  }
}