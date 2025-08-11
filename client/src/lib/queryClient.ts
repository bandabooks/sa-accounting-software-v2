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
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
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
    },
  },
});
