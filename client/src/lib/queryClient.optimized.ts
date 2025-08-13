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

// Optimized React Query configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Reduced stale time - data is fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cache time - keep in cache for 5 minutes after component unmounts
      gcTime: 5 * 60 * 1000,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: 'always',
      // Intelligent retry logic
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        // Don't retry on client errors (4xx)
        if (error?.message && /^4\d{2}:/.test(error.message)) {
          return false;
        }
        // Retry server errors (5xx) up to 2 times with exponential backoff
        return failureCount < 2;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Enable suspense for better loading states
      suspense: false,
      // Network mode - online first with offline fallback
      networkMode: 'online',
    },
    mutations: {
      // Intelligent retry for mutations
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error?.message && /^[4]\d{2}:/.test(error.message)) {
          return false;
        }
        // Retry server errors once
        return failureCount < 1;
      },
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Prefetch helper for critical data
export const prefetchQuery = async (queryKey: string[]) => {
  await queryClient.prefetchQuery({
    queryKey,
    staleTime: 10 * 60 * 1000, // Consider prefetched data fresh for 10 minutes
  });
};

// Batch invalidation helper for related queries
export const invalidateRelatedQueries = (patterns: string[]) => {
  const promises = patterns.map(pattern => 
    queryClient.invalidateQueries({ 
      queryKey: [pattern],
      refetchType: 'active', // Only refetch if component is mounted
    })
  );
  return Promise.all(promises);
};

// Smart cache update helper
export const updateQueryData = <T>(
  queryKey: string[],
  updater: (oldData: T | undefined) => T
) => {
  queryClient.setQueryData(queryKey, updater);
};