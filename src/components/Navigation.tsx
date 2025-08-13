'use client';

import { useSSO } from '@/hooks/useSSO';
import Link from 'next/link';

export function Navigation() {
  const { isAuthenticated, user, signOutLocal } = useSSO();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              SSO App
            </Link>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {user?.profile?.email || 'Logged in'}
                  </span>
                </div>
                
                <button
                  onClick={signOutLocal}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Not authenticated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 