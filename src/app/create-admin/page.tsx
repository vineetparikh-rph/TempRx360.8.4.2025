"use client";

import { useState } from 'react';

export default function CreateAdminPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            👤 Create Admin User
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create the admin user account to access the dashboard
          </p>
        </div>

        {!result && !error && (
          <div className="text-center">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
            </button>
          </div>
        )}

        {isCreating && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Creating admin account...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <div className="text-red-600 dark:text-red-400 font-medium">
                ❌ Creation Failed
              </div>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              {error}
            </p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setError(null);
                  handleCreate();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
              <a
                href="/db-setup"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Setup Database First
              </a>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                ✅ {result.message}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Admin Login Credentials:
                </h3>
                <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">Email:</span>
                      <code className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                        {result.credentials?.email}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">Password:</span>
                      <code className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                        {result.credentials?.password}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {result.note && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    💡 {result.note}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <a
                  href="/signin"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Go to Login Page →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}