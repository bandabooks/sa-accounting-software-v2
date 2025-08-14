import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global AbortController management
const abortControllers = new Map<string, AbortController>();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get current company ID
function getCurrentCompanyId(): string | null {
  return localStorage.getItem('activeCompanyId');
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
  signal?: AbortSignal,
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const sessionToken = localStorage.getItem('sessionToken');
  const companyId = getCurrentCompanyId();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (sessionToken) {
    headers["X-Session-Token"] = sessionToken;
  }
  
  // Always include company ID in headers for transport-level isolation
  if (companyId) {
    headers["X-Company-ID"] = companyId;
  }
  
  // Create unique key for this request
  const requestKey = `${method}-${url}-${Date.now()}`;
  const controller = new AbortController();
  abortControllers.set(requestKey, controller);
  
  // Use provided signal or create new one
  const finalSignal = signal || controller.signal;
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: finalSignal,
    });

    // Handle authentication errors
    if (res.status === 401) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('activeCompanyId');
      
      // Redirect to login
      window.location.href = '/login';
    }

    await throwIfResNotOk(res);
    return res;
  } finally {
    // Clean up abort controller
    abortControllers.delete(requestKey);
  }
}

// Function to abort all pending requests
export function abortAllRequests() {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const token = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');
    const companyId = getCurrentCompanyId();
    
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (sessionToken) {
      headers["X-Session-Token"] = sessionToken;
    }
    
    // Always include company ID in headers for transport-level isolation
    if (companyId) {
      headers["X-Company-ID"] = companyId;
    }
    
    // Create abort controller for this query
    const requestKey = `query-${queryKey.join('/')}-${Date.now()}`;
    const controller = new AbortController();
    abortControllers.set(requestKey, controller);
    
    try {
      const res = await fetch(queryKey.join("/") as string, {
        headers,
        credentials: "include",
        signal: signal || controller.signal,
      });

      if (res.status === 401) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('activeCompanyId');
        
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        
        // Redirect to login
        window.location.href = '/login';
      }

      await throwIfResNotOk(res);
      return await res.json();
    } finally {
      // Clean up abort controller
      abortControllers.delete(requestKey);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Performance optimizations
      staleTime: 30 * 1000, // Data is fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      refetchOnWindowFocus: true, // Get fresh data when user returns
      refetchOnReconnect: 'always', // Refetch on reconnect
      networkMode: 'online', // Online-first strategy
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        // Don't retry on client errors (4xx)
        if (error?.message && /^4\d{2}:/.test(error.message)) {
          return false;
        }
        // Retry server errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error?.message && /^[4]\d{2}:/.test(error.message)) {
          return false;
        }
        // Retry server errors once
        return failureCount < 1;
      },
      networkMode: 'online',
    },
  },
});
