"use client";

import { useState, useEffect } from 'react';

export default function DebugAuthPage() {
  const [email, setEmail] = useState('admin@georgiesrx.com');
  const [password, setPassword] = useState('Maya@102$$');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dbState, setDbState] = useState(null);
  const [error, setError] = useState('');

  // Load database state on mount
  useEffect(() => {
    loadDatabaseState();
  }, []);

  const loadDatabaseState = async () => {
    try {
      const response = await fetch('/api/debug-auth');
      const data = await response.json();
      setDbState(data);
    } catch (err) {
      console.error('Failed to load database state:', err);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/debug-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setResult(data);
      
      if (!response.ok) {
        setError(data.error || 'Authentication test failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fixAdmin = async () => {
    setLoading(true);
    setError('');

    try {
      // Use the restore original admin API
      const response = await fetch('/api/restore-original-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix admin');
      }

      alert('✅ Admin user fixed! Now test the authentication.');
      await loadDatabaseState();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-900 mb-8">
          🔍 AUTHENTICATION DEBUG TOOL
        </h1>
        
        {/* Database State */}
        {dbState && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Current Database State</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Admin User Status:</h3>
                {dbState.adminUser ? (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Email:</strong> {dbState.adminUser.email}</p>
                    <p><strong>Role:</strong> {dbState.adminUser.role}</p>
                    <p><strong>Approved:</strong> {dbState.adminUser.isApproved ? '✅ YES' : '❌ NO'}</p>
                    <p><strong>Status:</strong> {dbState.adminUser.approvalStatus}</p>
                    <p><strong>Has Password:</strong> {dbState.adminUser.hasPassword ? '✅ YES' : '❌ NO'}</p>
                    <p><strong>Pharmacies:</strong> {dbState.adminUser.pharmacyCount}</p>
                    <p><strong>Created:</strong> {new Date(dbState.adminUser.createdAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                    ❌ Admin user not found!
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">All Users ({dbState.totalUsers}):</h3>
                <div className="bg-gray-50 p-3 rounded text-sm max-h-48 overflow-y-auto">
                  {dbState.users.map((user, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                      <p><strong>{user.email}</strong> - {user.role}</p>
                      <p className="text-xs text-gray-600">
                        {user.isApproved ? '✅' : '❌'} {user.approvalStatus} | 
                        {user.hasPassword ? ' 🔑' : ' ❌'} | 
                        {user.pharmacyCount} pharmacies
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Authentication */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔐 Test Authentication</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Testing...' : '🔍 TEST AUTHENTICATION'}
            </button>
            
            <button
              onClick={fixAdmin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Fixing...' : '🔧 FIX ADMIN USER'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Test Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {result.success ? '✅ Authentication Test Results' : '❌ Authentication Test Failed'}
            </h2>
            
            {result.debug && (
              <div className="space-y-4">
                {/* User Details */}
                {result.debug.userDetails && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">User Details:</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>ID:</strong> {result.debug.userDetails.id}</p>
                      <p><strong>Email:</strong> {result.debug.userDetails.email}</p>
                      <p><strong>Name:</strong> {result.debug.userDetails.name}</p>
                      <p><strong>Role:</strong> {result.debug.userDetails.role}</p>
                      <p><strong>Approved:</strong> {result.debug.userDetails.isApproved ? 'YES' : 'NO'}</p>
                      <p><strong>Status:</strong> {result.debug.userDetails.approvalStatus}</p>
                      <p><strong>Active:</strong> {result.debug.userDetails.isActive ? 'YES' : 'NO'}</p>
                      <p><strong>Has Password:</strong> {result.debug.userDetails.hasPassword ? 'YES' : 'NO'}</p>
                      <p><strong>Pharmacies:</strong> {result.debug.userDetails.pharmacyCount}</p>
                    </div>
                  </div>
                )}
                
                {/* Authentication Flow */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Authentication Flow:</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {result.debug.authFlow.map((step, index) => (
                      <p key={index} className={step.includes('FAILED') ? 'text-red-600' : step.includes('SUCCESS') ? 'text-green-600' : ''}>
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* Password Test */}
                {result.debug.passwordTest && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Password Test:</h3>
                    <div className={`p-3 rounded text-sm ${result.debug.passwordTest === 'VALID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      Password: {result.debug.passwordTest}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}