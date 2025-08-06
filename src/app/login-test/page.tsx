'use client';

import { useState } from 'react';

export default function LoginTestPage() {
  const [email, setEmail] = useState('admin@georgiesrx.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      console.log('🧪 Testing login with:', { email, password });
      
      const response = await fetch('/api/debug-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🧪 Debug response:', data);
      
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('🧪 Test error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testActualLogin = async () => {
    setLoading(true);
    setResult('Testing actual login...');

    try {
      console.log('🔐 Testing actual login with:', { email, password });
      
      const response = await fetch('/api/manual-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 Actual login response:', data);
      
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('🔐 Actual login error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login Debug Test</h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Debug Login'}
            </button>
            
            <button
              onClick={testActualLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Actual Login'}
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Result:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
              {result || 'Click a button to test...'}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Quick Test Credentials:</h3>
            <div className="text-xs text-yellow-800 space-y-1">
              <div><strong>Admin:</strong> admin@georgiesrx.com / admin123</div>
              <div><strong>Manager:</strong> manager@georgiesrx.com / manager123</div>
              <div><strong>Staff:</strong> staff@georgiesrx.com / staff123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}