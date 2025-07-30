import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored authentication data and set initial state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('userData');

    if (token && sessionToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Verify authentication with server
  const { data: currentUser, isLoading: queryLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (!token || !sessionToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Session-Token': sessionToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Clear invalid tokens on authentication failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
        throw new Error('Authentication failed');
      }

      return response.json();
    },
    enabled: !!localStorage.getItem('authToken') && !!localStorage.getItem('sessionToken'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user data when query succeeds
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
      // Update stored user data
      localStorage.setItem('userData', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      // Clear authentication data on error
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [error]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super Administrators and Production Administrator have unrestricted access to ALL permissions
    if (user.role === 'super_admin' || user.role === 'Admin' || 
        user.username === 'sysadmin_7f3a2b8e' || 
        user.email === 'accounts@thinkmybiz.com') {
      return true;
    }
    
    if (!user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const sessionToken = localStorage.getItem('sessionToken');

      if (token && sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Session-Token': sessionToken,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || queryLoading,
    hasPermission,
    hasRole,
    logout,
  };
}