'use client';

import { useState, useEffect } from 'react';

interface SystemInfo {
  environment: string;
  database: string;
  nextAuthUrl: string;
  emailConfigured: boolean;
  userCount: number;
}

export default function DevToolsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      // Check email configuration
      const emailResponse = await fetch('/api/test-email');
      const emailData = await emailResponse.json();

      // Get user count
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();

      setSystemInfo({
        environment: process.env.NODE_ENV || 'unknown',
        database: 'Neon PostgreSQL',
        nextAuthUrl: window.location.origin,
        emailConfigured: emailData.configured || false,
        userCount: usersData.users?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFeature = async (feature: string) => {
    console.log(`Testing ${feature}...`);
    // Add specific test functions here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading development tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">🚧</div>
            <div>
              <h1 className="text-xl font-bold text-yellow-800">Development Tools</h1>
              <p className="text-yellow-700">Safe environment for testing new features</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="font-medium">Environment:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  systemInfo?.environment === 'development' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {systemInfo?.environment}
                </span>
              </div>
              <div>
                <span className="font-medium">Database:</span>
                <span className="ml-2">{systemInfo?.database}</span>
              </div>
              <div>
                <span className="font-medium">NextAuth URL:</span>
                <span className="ml-2 text-sm text-gray-600">{systemInfo?.nextAuthUrl}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Email Configured:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  systemInfo?.emailConfigured 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemInfo?.emailConfigured ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">User Count:</span>
                <span className="ml-2">{systemInfo?.userCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/test-email', '_blank')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Test Email</div>
              <div className="text-sm text-gray-600">Verify email configuration</div>
            </button>
            
            <button
              onClick={() => window.open('/admin/check-users', '_blank')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Check Users</div>
              <div className="text-sm text-gray-600">Verify user accounts</div>
            </button>
            
            <button
              onClick={() => window.open('/health-check', '_blank')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Health Check</div>
              <div className="text-sm text-gray-600">System status check</div>
            </button>
          </div>
        </div>

        {/* Development Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Development Links</h2>
          <div className="space-y-2">
            <a href="/signin" className="block text-blue-600 hover:text-blue-800">
              → Sign In Page
            </a>
            <a href="/admin" className="block text-blue-600 hover:text-blue-800">
              → Admin Dashboard
            </a>
            <a href="/api/test-db-connection" className="block text-blue-600 hover:text-blue-800">
              → Test Database Connection
            </a>
            <a href="/forgot-password" className="block text-blue-600 hover:text-blue-800">
              → Password Reset Page
            </a>
          </div>
        </div>

        {/* Environment Warning */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900">Development Environment</h3>
              <p className="text-blue-800 text-sm mt-1">
                This is a safe environment for testing. Changes made here won't affect the production system.
                When ready, merge changes to the main branch to deploy to production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}