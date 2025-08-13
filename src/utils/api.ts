/**
 * Utility functions for making authenticated API calls using bearer tokens
 */

interface ApiOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

/**
 * Makes an authenticated API call using the bearer token from cookies
 * This function should be used for server-side API calls
 */
export async function fetchWithAuth(
  url: string,
  options: ApiOptions = {}
): Promise<Response> {
  const { includeAuth = true, headers = {}, ...restOptions } = options;
  
  let authHeaders: Record<string, string> = { ...headers };
  
  if (includeAuth) {
    // Get the access token from the API endpoint
    const tokenResponse = await fetch('/api/auth/token');
    
    if (tokenResponse.ok) {
      const { access_token } = await tokenResponse.json();
      authHeaders['Authorization'] = `Bearer ${access_token}`;
    } else {
      // Try to refresh the token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST'
      });
      
      if (refreshResponse.ok) {
        // Retry getting the token
        const retryTokenResponse = await fetch('/api/auth/token');
        if (retryTokenResponse.ok) {
          const { access_token } = await retryTokenResponse.json();
          authHeaders['Authorization'] = `Bearer ${access_token}`;
        } else {
          throw new Error('Unable to get access token after refresh');
        }
      } else {
        throw new Error('Authentication required');
      }
    }
  }
  
  return fetch(url, {
    ...restOptions,
    headers: authHeaders
  });
}

/**
 * Helper function to make GET requests with authentication
 */
export async function getWithAuth<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'GET'
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper function to make POST requests with authentication
 */
export async function postWithAuth<T = any>(
  url: string,
  data?: any
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper function to make PUT requests with authentication
 */
export async function putWithAuth<T = any>(
  url: string,
  data?: any
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper function to make DELETE requests with authentication
 */
export async function deleteWithAuth<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Server-side function to get bearer token from cookies
 * This should only be used in server components or API routes
 */
export async function getServerSideToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    throw new Error('getServerSideToken can only be used on the server side');
  }
  
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  return accessToken || null;
}

/**
 * Example usage in a component:
 * 
 * import { useSSO } from '@/hooks/useSSO';
 * 
 * function MyComponent() {
 *   const { makeAuthenticatedRequest } = useSSO();
 *   
 *   const fetchUserData = async () => {
 *     try {
 *       const response = await makeAuthenticatedRequest('https://api.example.com/user');
 *       const data = await response.json();
 *       console.log('User data:', data);
 *     } catch (error) {
 *       console.error('Failed to fetch user data:', error);
 *     }
 *   };
 * }
 * 
 * Example usage in an API route:
 * 
 * import { getServerSideToken } from '@/utils/api';
 * 
 * export async function GET() {
 *   const token = await getServerSideToken();
 *   
 *   if (!token) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   const response = await fetch('https://api.example.com/data', {
 *     headers: {
 *       'Authorization': `Bearer ${token}`
 *     }
 *   });
 *   
 *   const data = await response.json();
 *   return NextResponse.json(data);
 * }
 */