'use client';

import { useSSO } from '@/hooks/useSSO';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoginButton, LoginButtonPrimary } from '@/components/LoginButton';

export function AuthUI() {
  const { isLoading, isAuthenticated, user, error, signIn, signOutLocal, signOutSSO } = useSSO();
  const [authStatus, setAuthStatus] = useState<any>(null);

  // Fetch authentication status
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => setAuthStatus(data))
        .catch(err => console.error('Failed to fetch auth status:', err));
    }
  }, [isAuthenticated]);

  // Helper to check if a value exists
  const hasValue = (value: any) => value !== null && value !== undefined && value !== '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Encountering error... {error.message}
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Authentication Dashboard</h1>
          <button 
            onClick={signOutLocal}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
        
        {/* Authentication Status */}
        <div className="bg-green-50 border border-green-300 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-semibold">Authenticated</span>
          </div>
          <p className="text-sm text-green-700 mt-2">Session is active</p>
        </div>

        <div className="space-y-4">
          {/* User Information */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-3 flex items-center">
              User Information
              {user && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Available</span>}
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <div className="flex items-center">
                  {hasValue(user?.email) ? (
                    <>
                      <span className="text-sm mr-2">{user?.email}</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-500 mr-2">Not available</span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User ID:</span>
                <div className="flex items-center">
                  {hasValue(user?.sub) ? (
                    <>
                      <span className="text-sm mr-2 font-mono text-xs">{user?.sub}</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-500 mr-2">Not available</span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phone:</span>
                <div className="flex items-center">
                  {hasValue(user?.phone_number) ? (
                    <>
                      <span className="text-sm mr-2">{user?.phone_number}</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-500 mr-2">Not available</span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <Link 
              href="/dashboard"
              className="text-blue-700 hover:text-blue-800 font-semibold underline"
            >
              Go to Protected Dashboard →
            </Link>
          </div>

          {/* Token Status */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Token Status</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ID Token:</span>
                <div className="flex items-center">
                  {authStatus?.hasIdToken ? (
                    <>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Present</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mr-2">Missing</span>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Access Token:</span>
                <div className="flex items-center">
                  {authStatus?.hasAccessToken ? (
                    <>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Present</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mr-2">Missing</span>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Refresh Token:</span>
                <div className="flex items-center">
                  {authStatus?.hasRefreshToken ? (
                    <>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Present</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">Not provided</span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Token Information (Collapsible) */}
          {authStatus?.tokenInfo && (
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">Token Information (Click to expand)</summary>
              
              <div className="mt-4 space-y-2">
                {authStatus.tokenInfo.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Token Expires At:</span>
                    <span className="text-sm">{new Date(authStatus.tokenInfo.expiresAt).toLocaleString()}</span>
                  </div>
                )}
                {authStatus.tokenInfo.issuedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Token Issued At:</span>
                    <span className="text-sm">{new Date(authStatus.tokenInfo.issuedAt).toLocaleString()}</span>
                  </div>
                )}
                {authStatus.tokenInfo.scope && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scope:</span>
                    <span className="text-sm">{authStatus.tokenInfo.scope}</span>
                  </div>
                )}
                {authStatus.tokenInfo.tokenUse && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Token Use:</span>
                    <span className="text-sm">{authStatus.tokenInfo.tokenUse}</span>
                  </div>
                )}
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Tokens are securely stored in httpOnly cookies and cannot be accessed via JavaScript for security reasons.
                  </p>
                </div>
              </div>
            </details>
          )}

          {/* Additional User Profile Data */}
          {user && Object.keys(user).length > 0 && (
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">All User Data (Click to expand)</summary>
              <div className="mt-4">
                <pre className="text-xs overflow-x-auto bg-white p-2 rounded border">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </details>
          )}

          {/* Session Info */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Session Information</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session State:</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              {authStatus?.tokenInfo?.expiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Expires:</span>
                  <span className="text-sm">{new Date(authStatus.tokenInfo.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
            <h3 className="font-semibold mb-2">Sign Out Options</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign out locally or from SSO provider
            </p>
            <button 
              onClick={signOutLocal}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to SSO Authentication</h1>
        
        {/* Authentication Status - Not Authenticated */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg inline-block">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
            <span className="text-gray-700 font-semibold">Not Authenticated</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <LoginButtonPrimary 
            onClick={signIn}
            loading={isLoading}
          />
          <button 
            onClick={signOutSSO}
            className="mt-4 text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
          >
            Sign out from SSO provider
          </button>
        </div>
      </div>
    </div>
  );
} 