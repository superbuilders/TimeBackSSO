'use client';

import { useAuth } from '@/components/AuthProvider';

export function useSSO() {
  const auth = useAuth();

  // Helper function to make authenticated API calls with bearer token
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await auth.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  };

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    error: auth.error,
    signIn: auth.signIn,
    signOut: auth.signOut,
    signOutLocal: auth.signOutLocal,
    signOutSSO: auth.signOutSSO,
    refreshToken: auth.refreshToken,
    getAccessToken: auth.getAccessToken,
    makeAuthenticatedRequest,
  };
} 