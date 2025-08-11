import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const sessionToken = localStorage.getItem('sessionToken');
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (sessionToken) {
    headers["X-Session-Token"] = sessionToken;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle authentication errors
  if (res.status === 401) {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userData');
    
    // Redirect to login
    window.location.href = '/login';
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');
    
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (sessionToken) {
      headers["X-Session-Token"] = sessionToken;
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // Redirect to login
      window.location.href = '/login';
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Optimized stale times for different types of data
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (was cacheTime)
      // Enable background refetching for better UX
      refetchIntervalInBackground: false,
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
          return false;
        }
        // Retry other errors up to 2 times with exponential backoff
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
          return false;
        }
        // Retry other errors once
        return failureCount < 1;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Custom cache configuration for different data types
export const getCacheConfig = (type: 'static' | 'semi-static' | 'dynamic' | 'real-time') => {
  const configs = {
    static: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - for settings, configurations
      gcTime: 1000 * 60 * 60 * 48, // 48 hours
    },
    'semi-static': {
      staleTime: 1000 * 60 * 15, // 15 minutes - for customers, products, suppliers
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    dynamic: {
      staleTime: 1000 * 60 * 5, // 5 minutes - for invoices, expenses
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    'real-time': {
      staleTime: 1000 * 30, // 30 seconds - for dashboard stats, recent activities
      gcTime: 1000 * 60 * 2, // 2 minutes
    },
  };
  
  return configs[type];
};
