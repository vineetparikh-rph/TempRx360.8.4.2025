"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function EmergencyAdminPage() {
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const resetAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/emergency-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset admin');
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
        password: password,
        redirect: false
      });

      if (result?.error) {
        setError('Login failed: ' + result.error);
      } else if (result?.ok) {
        alert('✅ Admin login successful! Redirecting...');
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-red-900">
          🚨 EMERGENCY ADMIN RESET
        </h2>
        <p className="mt-2 text-center text-sm text-red-600">
          ONLY for admin@georgiesrx.com
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg border-2 border-red-200 sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            
            {/* Warning */}
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>⚠️ EMERGENCY USE ONLY</strong>
              <p className="text-sm mt-1">This will reset admin@georgiesrx.com credentials</p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Admin Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div>
              <button
                onClick={resetAdmin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
              >
                {loading ? '🔄 Resetting...' : '🚨 RESET ADMIN NOW'}
              </button>
            </div>

            {/* Test Login Button */}
            {result && (
              <div>
                <button
                  onClick={testLogin}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {loading ? '🔄 Testing...' : '✅ TEST LOGIN'}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">❌ {error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ✅ Admin Reset Successful!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Email:</strong> {result.credentials.email}</p>
                      <p><strong>Password:</strong> {result.credentials.password}</p>
                      <p><strong>Role:</strong> {result.admin.role}</p>
                      <p><strong>Status:</strong> {result.admin.approvalStatus}</p>
                      <p><strong>Password Test:</strong> {result.admin.passwordTest}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    🔧 Instructions:
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Enter new password for admin@georgiesrx.com</li>
                      <li>Click "RESET ADMIN NOW"</li>
                      <li>Click "TEST LOGIN" to verify</li>
                      <li>Go to <a href="/signin" className="underline">/signin</a> to login</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}