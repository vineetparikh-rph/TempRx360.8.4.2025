'use client';

import { useEffect, useState } from 'react';

export default function SetupCompletePage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run setup automatically when page loads
    runSetup();
  }, []);

  const runSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public-setup', {
        method: 'POST',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ 
        error: 'Setup failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Setting up your database...</h2>
          <p className="text-gray-600 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        {status?.success ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">🎉 Setup Complete!</h1>
            <p className="text-gray-600 mb-6">{status.message}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Login Credentials</h3>
              <div className="text-left">
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {status.credentials?.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Password:</strong> {status.credentials?.password}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Database Status</h3>
              <div className="text-left text-sm text-gray-700">
                <p>✅ Admin user created</p>
                <p>✅ {status.pharmacies} pharmacies configured</p>
                <p>✅ Database schema deployed</p>
              </div>
            </div>
            
            <a 
              href="/signin" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block text-center"
            >
              Go to Login Page
            </a>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Failed</h1>
            <p className="text-red-600 mb-4">{status?.error || 'Unknown error occurred'}</p>
            
            <button 
              onClick={runSetup}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Retry Setup
            </button>
            
            {status?.details && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}