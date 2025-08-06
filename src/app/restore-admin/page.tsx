"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RestoreAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const restoreAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/restore-admin', {
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
        password: 'admin123',
        redirect: false
      });

      if (result?.error) {
        setError('Login still failed: ' + result.error);
      } else if (result?.ok) {
        alert('✅ ADMIN LOGIN RESTORED! Redirecting to admin dashboard...');
        router.push('/admin');
      }
    } catch (err) {
      setError('Login test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
          🔄 RESTORE ADMIN LOGIN
        </h1>
        <p className="mt-2 text-center text-sm text-blue-600">
          Restore admin@georgiesrx.com to original working state
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg border-2 border-blue-200 sm:rounded-lg sm:px-10">
          
          {/* Original Credentials Display */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              📋 Original Working Credentials:
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> admin@georgiesrx.com</p>
              <p><strong>Password:</strong> admin123</p>
              <p><strong>Role:</strong> admin</p>
              <p><strong>Status:</strong> approved</p>
            </div>
          </div>

          {/* Restore Button */}
          <div className="mb-6">
            <button
              onClick={restoreAdmin}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? '🔄 Restoring Admin...' : '🔄 RESTORE ADMIN TO ORIGINAL STATE'}
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
                {loading ? '🔄 Testing Login...' : '✅ TEST ORIGINAL LOGIN'}
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
                ✅ Admin Restored Successfully!
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Email:</strong> {result.originalCredentials.email}</p>
                <p><strong>Password:</strong> {result.originalCredentials.password}</p>
                <p><strong>Role:</strong> {result.admin.role}</p>
                <p><strong>Status:</strong> {result.admin.approvalStatus}</p>
                <p><strong>Password Test:</strong> {result.admin.passwordTest}</p>
                <p><strong>Pharmacies:</strong> {result.admin.pharmacyCount}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              📋 What This Does:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Restores admin@georgiesrx.com to original working state</li>
              <li>Sets password back to original: admin123</li>
              <li>Ensures admin role and approved status</li>
              <li>Assigns access to all pharmacies</li>
              <li>Does NOT change any other users or data</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>After restore:</strong> Go to <a href="/signin" className="underline">/signin</a> and use the original credentials above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}