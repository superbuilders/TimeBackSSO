'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: Error | null;
  signIn: () => void;
  signOut: () => Promise<void>;
  signOutLocal: () => Promise<void>;
  signOutSSO: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check authentication status on mount and when cookies change
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if authenticated cookie exists (readable by client)
      const isAuth = document.cookie.includes('authenticated=true');
      
      if (isAuth) {
        // Fetch user information from API
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Token might be expired, try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry fetching user info
            const retryResponse = await fetch('/api/auth/user');
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setUser(data.user);
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setError(err as Error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    const clientId = process.env.NEXT_PUBLIC_PRODUCTION_CLIENT_ID || '';
    const authUrl = process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL || '';
    const redirectUri = process.env.NEXT_PUBLIC_PRODUCTION_AUTH_REDIRECT || '';
    
    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      returnTo: window.location.pathname,
      nonce: Math.random().toString(36).substring(7)
    })).toString('base64');
    
    // Build authorization URL with Google identity provider
    const authorizationUrl = new URL(`${authUrl}/oauth2/authorize`);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('scope', 'email openid phone');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('identity_provider', 'Google');
    
    // Redirect to authorization endpoint
    window.location.href = authorizationUrl.toString();
  };

  const signOutLocal = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to home page
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error during local sign out:', err);
      setError(err as Error);
    }
  };

  const signOutSSO = async () => {
    try {
      const response = await fetch('/api/auth/logout?sso=true', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.redirect) {
          // Redirect to SSO logout
          window.location.href = data.redirect;
        }
      }
    } catch (err) {
      console.error('Error during SSO sign out:', err);
      setError(err as Error);
    }
  };

  const signOut = async () => {
    await signOutSSO();
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST'
      });
      
      if (response.ok) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/token');
      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      }
      
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        const retryResponse = await fetch('/api/auth/token');
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return data.access_token;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error getting access token:', err);
      return null;
    }
  };

  const value: AuthContextType = {
    isLoading,
    isAuthenticated,
    user,
    error,
    signIn,
    signOut,
    signOutLocal,
    signOutSSO,
    refreshToken,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 