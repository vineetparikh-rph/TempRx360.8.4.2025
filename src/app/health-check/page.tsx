"use client";

import { useState, useEffect } from 'react';

export default function HealthCheckPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/health-check');
      const data = await response.json();
      
      if (!response.ok) {
        setError(`Health check failed: ${data.error || 'Unknown error'}`);
      } else {
        setHealthData(data);
      }
    } catch (err) {
      setError(`Failed to fetch health check: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running health check...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🏥 APPLICATION HEALTH CHECK
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">❌ Health Check Failed</h2>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            <button
              onClick={checkHealth}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔄 Retry Health Check
            </button>
          </div>
        )}

        {healthData && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`rounded-lg p-6 ${healthData.status === 'OK' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className="text-xl font-bold mb-4">
                {healthData.status === 'OK' ? '✅ System Status: HEALTHY' : '❌ System Status: UNHEALTHY'}
              </h2>
              <p className="text-gray-700">{healthData.message}</p>
              <p className="text-sm text-gray-500 mt-2">Last checked: {healthData.environment?.timestamp}</p>
            </div>

            {/* Environment Variables */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌍 Environment Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Node Environment:</strong> {healthData.environment?.nodeEnv}</p>
                  <p><strong>Vercel Environment:</strong> {healthData.environment?.vercelEnv}</p>
                </div>
                <div>
                  <p><strong>Database URL:</strong> {healthData.environment?.databaseUrl}</p>
                  <p><strong>NextAuth URL:</strong> {healthData.environment?.nextauthUrl}</p>
                  <p><strong>NextAuth Secret:</strong> {healthData.environment?.nextauthSecret}</p>
                </div>
              </div>
              {healthData.environment?.databaseUrlPreview && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Database URL Preview:</strong></p>
                  <code className="text-xs text-gray-600">{healthData.environment.databaseUrlPreview}</code>
                </div>
              )}
            </div>

            {/* Database Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🗄️ Database Status</h3>
              <div className="space-y-2">
                <p><strong>Prisma Import:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${healthData.prisma === 'IMPORTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {healthData.prisma}
                  </span>
                </p>
                <p><strong>Database Connection:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${healthData.database === 'CONNECTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {healthData.database}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Actions</h3>
              <div className="flex gap-4">
                <button
                  onClick={checkHealth}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔄 Refresh Health Check
                </button>
                <a
                  href="/signin"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  🔐 Try Login Page
                </a>
                <a
                  href="/debug-auth"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🔍 Debug Authentication
                </a>
              </div>
            </div>

            {/* Raw Data */}
            <details className="bg-white rounded-lg shadow p-6">
              <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                📋 Raw Health Data
              </summary>
              <pre className="mt-4 p-4 bg-gray-50 rounded text-sm overflow-auto">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}