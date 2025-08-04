"use client";

import { useState } from 'react';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🌱 Database Seeder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Initialize the database with sample data and user accounts
          </p>
        </div>

        {!result && !error && (
          <div className="text-center">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSeeding ? 'Seeding Database...' : 'Seed Database'}
            </button>
          </div>
        )}

        {isSeeding && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Creating users, pharmacy, and sample data...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <div className="text-red-600 dark:text-red-400 font-medium">
                ❌ Seeding Failed
              </div>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                handleSeed();
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                ✅ Database Seeded Successfully!
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Login Credentials:
                </h3>
                <div className="space-y-2">
                  {result.users?.map((user: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.role}:
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-300">
                            {user.email}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Password: <code className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {user.password}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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