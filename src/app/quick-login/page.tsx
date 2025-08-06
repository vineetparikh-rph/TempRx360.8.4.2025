'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickLoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const users = [
    { email: 'admin@georgiesrx.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'manager@georgiesrx.com', password: 'manager123', name: 'Manager User', role: 'pharmacist' },
    { email: 'staff@georgiesrx.com', password: 'staff123', name: 'Staff User', role: 'technician' },
    { email: 'itadmin@georgiesrx.com', password: 'admin123', name: 'IT Admin', role: 'pharmacist' },
    { email: 'familyrx@stgeorgesrx.com', password: 'pharmacy123', name: 'Family Pharmacy', role: 'pharmacist' },
    { email: 'parlinrx@gmail.com', password: 'pharmacy123', name: 'Parlin Pharmacy', role: 'pharmacist' },
    { email: 'specialtyrx@stgeorgiesrx.com', password: 'pharmacy123', name: 'Specialty Pharmacy', role: 'pharmacist' },
    { email: 'vinitbparikh@gmail.com', password: 'pharmacy123', name: 'Vineet Parikh', role: 'pharmacist' },
    { email: 'Rose@georgiesrx.com', password: 'pharmacy123', name: 'Rose Marwa', role: 'USER' },
  ];

  const handleQuickLogin = async (user: typeof users[0]) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Quick login for:', user.email);
      
      const response = await fetch('/api/manual-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();
      console.log('📊 Login response:', data);

      if (data.success) {
        setSuccess(`Welcome ${user.name}! Redirecting to dashboard...`);
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Quick login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">TempRx360 Quick Login</h1>
            <p className="text-gray-600 mt-2">Bypass browser security warnings</p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Select User to Login:</h2>
            
            {users.map((user, index) => (
              <button
                key={index}
                onClick={() => handleQuickLogin(user)}
                disabled={loading}
                className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <div className="text-blue-600">
                    {loading ? '⏳' : '→'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <a
                href="/signin"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to regular sign in
              </a>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This page bypasses browser password security warnings. 
              Use this if the regular sign-in page shows password breach notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}