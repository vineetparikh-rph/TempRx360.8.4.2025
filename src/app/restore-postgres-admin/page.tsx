"use client";

import { useState } from 'react';

export default function RestorePostgresAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const performAction = async (action: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/restore-postgres-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(`Action failed: ${data.error || 'Unknown error'}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Failed to perform action: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 mb-8">
          🔧 RESTORE POSTGRESQL ADMIN USER
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🎯 Problem Identified: No Admin User in PostgreSQL
          </h2>
          <p className="text-gray-700 mb-4">
            The PostgreSQL database exists but has no admin user. This is why authentication was failing.
            Use the tools below to restore the admin user and fix the login issue.
          </p>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-blue-800">
              <strong>Target Admin User:</strong> admin@georgiesrx.com<br/>
              <strong>Password:</strong> Maya@102$$<br/>
              <strong>Role:</strong> admin<br/>
              <strong>Pharmacy:</strong> St. George's Pharmacy
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Admin Management Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => performAction('check-admin')}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Checking...' : '🔍 Check Admin Status'}
            </button>
            
            <button
              onClick={() => performAction('create-admin')}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Creating...' : '✅ Create Admin User'}
            </button>
            
            <button
              onClick={() => performAction('list-all-users')}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Loading...' : '👥 List All Users'}
            </button>
            
            <button
              onClick={() => performAction('delete-admin')}
              disabled={loading}
              className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Deleting...' : '🗑️ Delete Admin (Test)'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-red-800 mb-4">❌ Error</h3>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {result.success ? '✅ Action Successful' : '❌ Action Failed'}
            </h3>
            
            {result.success && result.message && (
              <div className="bg-green-50 p-4 rounded border border-green-200 mb-4">
                <p className="text-green-800 font-semibold">{result.message}</p>
              </div>
            )}

            {/* Admin User Details */}
            {result.adminUser && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">👤 Admin User Details:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>ID:</strong> {result.adminUser.id}</p>
                      <p><strong>Email:</strong> {result.adminUser.email}</p>
                      <p><strong>Name:</strong> {result.adminUser.name}</p>
                      <p><strong>Role:</strong> {result.adminUser.role}</p>
                    </div>
                    <div>
                      <p><strong>Approved:</strong> {result.adminUser.isApproved ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Status:</strong> {result.adminUser.approvalStatus}</p>
                      <p><strong>Has Password:</strong> {result.adminUser.hasPassword ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Password Test:</strong> {result.adminUser.passwordTest ? '✅ VALID' : '❌ INVALID'}</p>
                    </div>
                  </div>
                  {result.adminUser.pharmacies && result.adminUser.pharmacies.length > 0 && (
                    <div className="mt-4">
                      <p><strong>Pharmacies ({result.adminUser.pharmacyCount}):</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {result.adminUser.pharmacies.map((pharmacy, index) => (
                          <li key={index}>{pharmacy.name} ({pharmacy.code})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pharmacy Details */}
            {result.pharmacy && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">🏪 Pharmacy Details:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>ID:</strong> {result.pharmacy.id}</p>
                  <p><strong>Name:</strong> {result.pharmacy.name}</p>
                  <p><strong>Code:</strong> {result.pharmacy.code}</p>
                </div>
              </div>
            )}

            {/* All Users List */}
            {result.users && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">👥 All Users ({result.userCount}):</h4>
                <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                  {result.users.map((user, index) => (
                    <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
                      <p><strong>{user.email}</strong> - {user.role}</p>
                      <p className="text-sm text-gray-600">
                        {user.isApproved ? '✅' : '❌'} {user.approvalStatus} | 
                        {user.hasPassword ? ' 🔑' : ' ❌'} | 
                        {user.pharmacyCount} pharmacies |
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.pharmacies.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Pharmacies: {user.pharmacies.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Response */}
            <details className="mt-4">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                📋 Raw Response Data
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Next Steps</h3>
          <div className="space-y-2">
            <p>1. <strong>Check Admin Status</strong> - See if admin user exists</p>
            <p>2. <strong>Create Admin User</strong> - If no admin exists, create one</p>
            <p>3. <strong>Test Login</strong> - Go to <a href="/signin" className="text-blue-600 hover:underline">/signin</a> and try logging in</p>
            <p>4. <strong>Verify Access</strong> - Check if you can access the admin dashboard</p>
          </div>
          
          <div className="mt-6 flex gap-4">
            <a
              href="/signin"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🔐 Try Login Page
            </a>
            <a
              href="/inspect-postgres"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔍 Inspect Database
            </a>
            <a
              href="/health-check"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🏥 Health Check
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}