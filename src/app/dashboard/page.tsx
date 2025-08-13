'use client';

import { useSSO } from '@/hooks/useSSO';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOutLocal } = useSSO();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Protected Dashboard</h1>
          <button
            onClick={signOutLocal}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
          <p className="text-lg mb-4">Hello, <span className="font-medium text-blue-600">{user?.email || user?.name || 'User'}</span>!</p>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-blue-800">
              This is a protected page that requires authentication to access. 
              You can safely access your secure content here.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">User Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt>
                <dd className="font-medium">{user?.email || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">User ID:</dt>
                <dd className="font-mono text-sm">{user?.sub || 'N/A'}</dd>
              </div>
              {user?.name && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Name:</dt>
                  <dd className="font-medium">{user.name}</dd>
                </div>
              )}
              {user?.phone_number && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Phone:</dt>
                  <dd className="font-medium">{user.phone_number}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Session Status:</dt>
                <dd className="text-green-600 font-medium">Active</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                View Authentication Details
              </Link>
              <button
                onClick={() => alert('Profile settings coming soon!')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Profile Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 