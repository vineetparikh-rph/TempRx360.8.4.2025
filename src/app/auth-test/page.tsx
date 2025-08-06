"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthTest() {
  const [email, setEmail] = useState('admin@georgies.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Testing login with:', { email, password });
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      console.log('📊 Login result:', result);
      setResult(result);
    } catch (error) {
      console.error('❌ Login error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">Test Credentials:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Admin:</strong> admin@georgies.com / admin123</li>
            <li><strong>Manager:</strong> manager@georgies.com / manager123</li>
            <li><strong>Staff:</strong> staff@georgies.com / staff123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}