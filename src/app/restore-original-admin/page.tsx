"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RestoreOriginalAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dbState, setDbState] = useState(null);
  const router = useRouter();

  // Check current database state on load
  useEffect(() => {
    checkDatabaseState();
  }, []);

  const checkDatabaseState = async () => {
    try {
      const response = await fetch('/api/restore-original-admin');
      const data = await response.json();
      setDbState(data);
    } catch (err) {
      console.error('Failed to check database state:', err);
    }
  };

  const restoreAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/restore-original-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore admin');
      }

      setResult(data);
      // Refresh database state
      await checkDatabaseState();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: 'admin@georgiesrx.com',
        password: 'Maya@102$$',
        redirect: false
      });

      if (result?.error) {
        setError('Login still failed: ' + result.error);
      } else if (result?.ok) {
        alert('✅ ADMIN LOGIN RESTORED WITH ORIGINAL PASSWORD! Redirecting...');
        router.push('/admin');
      }
    } catch (err) {
      setError('Login test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-purple-900">
          🔄 RESTORE ORIGINAL ADMIN PASSWORD
        </h1>
        <p className="mt-2 text-center text-sm text-purple-600">
          Restore admin@georgiesrx.com with original password Maya@102$$
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-lg border-2 border-purple-200 sm:rounded-lg sm:px-10">
          
          {/* Current Database State */}
          {dbState && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                📊 Current Database State:
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong>Admin User:</strong> {dbState.admin ? 'EXISTS' : 'NOT FOUND'}
                  {dbState.admin && (
                    <div className="ml-4 mt-1">
                      <p>Role: {dbState.admin.role}</p>
                      <p>Approved: {dbState.admin.isApproved ? 'YES' : 'NO'}</p>
                      <p>Status: {dbState.admin.approvalStatus}</p>
                      <p>Has Password: {dbState.admin.hasPassword ? 'YES' : 'NO'}</p>
                      <p>Pharmacies: {dbState.admin.pharmacyCount}</p>
                    </div>
                  )}
                </div>
                <div>
                  <strong>Total Users:</strong> {dbState.allUsers?.length || 0}
                  {dbState.allUsers && dbState.allUsers.length > 0 && (
                    <div className="ml-4 mt-1 max-h-32 overflow-y-auto">
                      {dbState.allUsers.map((user, index) => (
                        <p key={index} className="text-xs">
                          {user.email} - {user.role} - {user.approvalStatus}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Original Credentials Display */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-2">
              🔑 ORIGINAL Working Credentials:
            </h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p><strong>Email:</strong> admin@georgiesrx.com</p>
              <p><strong>Password:</strong> Maya@102$$</p>
              <p><strong>Role:</strong> admin</p>
              <p><strong>Status:</strong> approved</p>
            </div>
          </div>

          {/* Restore Button */}
          <div className="mb-6">
            <button
              onClick={restoreAdmin}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {loading ? '🔄 Restoring Original Password...' : '🔄 RESTORE ORIGINAL PASSWORD Maya@102$$'}
            </button>
          </div>

          {/* Test Login Button */}
          {result && (
            <div className="mb-6">
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {loading ? '🔄 Testing Original Login...' : '✅ TEST ORIGINAL LOGIN Maya@102$$'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                ✅ Admin Restored with Original Password!
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Email:</strong> {result.originalCredentials.email}</p>
                <p><strong>Password:</strong> {result.originalCredentials.password}</p>
                <p><strong>Role:</strong> {result.admin.role}</p>
                <p><strong>Status:</strong> {result.admin.approvalStatus}</p>
                <p><strong>Password Test:</strong> {result.admin.passwordTest}</p>
                <p><strong>Pharmacies:</strong> {result.admin.pharmacyCount}</p>
              </div>
              
              {result.databaseInfo && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Database Info:</strong> {result.databaseInfo.totalUsers} total users
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🔧 What This Does:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Restores admin@georgiesrx.com with ORIGINAL password Maya@102$$</li>
              <li>Ensures admin role and approved status</li>
              <li>Assigns access to all pharmacies</li>
              <li>Shows current database state to diagnose issues</li>
              <li>Tests password to verify it works</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>After restore:</strong> Go to <a href="/signin" className="underline">/signin</a> and use Maya@102$$ as password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}