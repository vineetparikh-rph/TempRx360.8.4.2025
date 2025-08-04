'use client';

import { useState } from 'react';

export default function SetupNeonDB() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-neon-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to setup Neon database', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Neon PostgreSQL Database
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Migrate from SQLite to Neon PostgreSQL for production
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">🚀 PostgreSQL Migration</h3>
            <p className="mt-1 text-sm text-blue-700">
              This will setup your Neon PostgreSQL database with:
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Database schema and tables</li>
              <li>Admin user (admin@georgiesrx.com)</li>
              <li>All Georgies pharmacies</li>
              <li>User-pharmacy assignments</li>
            </ul>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Prerequisites:</strong> Make sure your DATABASE_URL environment variable is set to your Neon PostgreSQL connection string.
              </p>
            </div>
          </div>

          <button
            onClick={setupDatabase}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Setting up Neon Database...' : 'Setup Neon PostgreSQL Database'}
          </button>

          {result && (
            <div className="mt-6">
              <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Success!' : '❌ Error'}
                </h3>
                
                {result.success && (
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Message:</strong> {result.message}</p>
                    <p><strong>Database:</strong> {result.database}</p>
                    <div className="mt-3 p-3 bg-green-100 rounded">
                      <p><strong>🎯 Login Credentials:</strong></p>
                      <p><strong>Email:</strong> {result.credentials.email}</p>
                      <p><strong>Password:</strong> {result.credentials.password}</p>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p><strong>📊 Database Status:</strong></p>
                      <p><strong>Admin ID:</strong> {result.admin.id}</p>
                      <p><strong>Admin Name:</strong> {result.admin.name}</p>
                      <p><strong>Pharmacies:</strong> {result.pharmacies}</p>
                    </div>
                  </div>
                )}

                {result.error && (
                  <div className="mt-2 text-sm text-red-700">
                    <p><strong>Error:</strong> {result.error}</p>
                    {result.details && <p><strong>Details:</strong> {result.details}</p>}
                    {result.suggestion && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p><strong>💡 Suggestion:</strong> {result.suggestion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {result?.success && (
            <div className="mt-6 space-y-3">
              <a
                href="/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}