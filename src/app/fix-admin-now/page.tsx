"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FixAdminNowPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const fixAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/fix-admin-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix admin');
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
        setError('Login failed: ' + result.error);
      } else if (result?.ok) {
        alert('✅ Login successful! Redirecting to admin dashboard...');
        router.push('/admin');
      }
    } catch (err) {
      setError('Login test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-red-900">
          🚨 FIX ADMIN LOGIN
        </h1>
        <p className="mt-2 text-center text-sm text-red-600">
          Emergency admin login recovery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg border-2 border-red-200 sm:rounded-lg sm:px-10">
          
          {/* Fix Admin Button */}
          <div className="mb-6">
            <button
              onClick={fixAdmin}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
            >
              {loading ? '🔄 Fixing Admin...' : '🚨 FIX ADMIN LOGIN NOW'}
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
                {loading ? '🔄 Testing Login...' : '✅ TEST LOGIN & GO TO ADMIN'}
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
                ✅ Admin Fixed Successfully!
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Email:</strong> {result.credentials.email}</p>
                <p><strong>Password:</strong> {result.credentials.password}</p>
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
              📋 Instructions:
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click "FIX ADMIN LOGIN NOW"</li>
              <li>Wait for success message</li>
              <li>Click "TEST LOGIN & GO TO ADMIN"</li>
              <li>You'll be logged in and redirected to admin dashboard</li>
            </ol>
            
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Manual Login:</strong> Go to <a href="/signin" className="underline">/signin</a>
                <br />
                Email: admin@georgiesrx.com
                <br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}