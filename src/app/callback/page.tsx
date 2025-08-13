'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors in the URL parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const errorParam = searchParams.get('error');
      const errorDescParam = searchParams.get('error_description');
      
      if (errorParam) {
        setError(errorParam);
        setErrorDescription(errorDescParam);
        console.error('Authentication error:', errorParam, errorDescParam);
      } else {
        // If no error, the server-side callback should have already redirected
        // This page is only shown if there's an error
        console.log('No error found, redirecting to home...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    }
  }, [router]);

  // Display error if present
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          <p className="text-gray-600 mb-2">Error: {error}</p>
          {errorDescription && (
            <p className="text-gray-600 mb-4">Details: {errorDescription}</p>
          )}
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Sign In...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Please wait while we complete your authentication.</p>
        <p className="text-sm text-gray-500 mt-2">If you're not redirected automatically, <a href="/" className="text-blue-500 underline">click here</a>.</p>
      </div>
    </div>
  );
} 