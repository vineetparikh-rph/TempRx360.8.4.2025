"use client";

import { useState } from 'react';

export default function FixPostgresSchemaPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const performAction = async (action: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/fix-postgres-schema', {
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
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-900 mb-8">
          🔧 FIX POSTGRESQL SCHEMA & CREATE ADMIN
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🎯 Problem Identified: Schema Mismatch
          </h2>
          <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
            <p className="text-red-800">
              <strong>Issue:</strong> The PostgreSQL database schema is missing the <code>isActive</code> column and possibly other columns that our current Prisma schema expects.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-blue-800">
              <strong>Current State:</strong><br/>
              • PostgreSQL database: ✅ Connected<br/>
              • Users: ❌ 0 (no admin user)<br/>
              • Pharmacies: ✅ 4 (Georgies Family, Outpatient, Parlin, etc.)<br/>
              • Schema: ❌ Missing columns (isActive, mustChangePassword, etc.)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Schema Fix & Admin Creation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => performAction('check-schema')}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Checking...' : '🔍 Check Schema'}
            </button>
            
            <button
              onClick={() => performAction('fix-schema')}
              disabled={loading}
              className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Fixing...' : '🔧 Fix Schema'}
            </button>
            
            <button
              onClick={() => performAction('create-admin-safe')}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Creating...' : '✅ Create Admin (Safe)'}
            </button>
            
            <button
              onClick={() => performAction('test-admin-login')}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Testing...' : '🔐 Test Admin Login'}
            </button>
            
            <button
              onClick={() => performAction('list-pharmacies')}
              disabled={loading}
              className="px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? '🔄 Loading...' : '🏪 List Pharmacies'}
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

            {/* Schema Check Results */}
            {result.schema && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">🔍 Schema Analysis:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>User Table:</strong> {result.schema.userTableExists ? '✅ EXISTS' : '❌ MISSING'}</p>
                      <p><strong>Pharmacy Table:</strong> {result.schema.pharmacyTableExists ? '✅ EXISTS' : '❌ MISSING'}</p>
                    </div>
                    <div>
                      <p><strong>User Columns:</strong> {result.schema.userColumns?.length || 0}</p>
                      <p><strong>Pharmacy Columns:</strong> {result.schema.pharmacyColumns?.length || 0}</p>
                    </div>
                  </div>
                  
                  {result.schema.userColumns && result.schema.userColumns.length > 0 && (
                    <div className="mt-4">
                      <p><strong>User Table Columns:</strong></p>
                      <div className="text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                        {result.schema.userColumns.map((col, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{col.column_name}</span>
                            <span className="text-gray-500">{col.data_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.schema.schemaIssues && result.schema.schemaIssues.length > 0 && (
                    <div className="mt-4">
                      <p><strong>Schema Issues:</strong></p>
                      <ul className="list-disc list-inside text-red-600">
                        {result.schema.schemaIssues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schema Fixes */}
            {result.fixes && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">🔧 Schema Fixes Applied:</h4>
                <div className="bg-green-50 p-4 rounded">
                  <ul className="list-disc list-inside">
                    {result.fixes.map((fix, index) => (
                      <li key={index} className="text-green-700">{fix}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Admin User Details */}
            {result.adminUser && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">👤 Admin User Created:</h4>
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
                      <p><strong>Active:</strong> {result.adminUser.isActive ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Has Password:</strong> {result.adminUser.hasPassword ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Password Test:</strong> {result.adminUser.passwordTest ? '✅ VALID' : '❌ INVALID'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pharmacies List */}
            {result.pharmacies && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">🏪 Available Pharmacies ({result.pharmacies.length}):</h4>
                <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                  {result.pharmacies.map((pharmacy, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                      <p><strong>{pharmacy.name}</strong> ({pharmacy.code})</p>
                      {pharmacy.address && (
                        <p className="text-sm text-gray-600">{pharmacy.address}</p>
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

        {/* Step-by-Step Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Step-by-Step Fix Process</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">1</span>
              <span><strong>Check Schema</strong> - See what columns are missing</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">2</span>
              <span><strong>Fix Schema</strong> - Add missing columns (isActive, mustChangePassword, etc.)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">3</span>
              <span><strong>Create Admin (Safe)</strong> - Create admin user with proper schema</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">4</span>
              <span><strong>Test Login</strong> - Verify admin@georgiesrx.com with Maya@102$$</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">5</span>
              <span><strong>Try Application</strong> - Go to /signin and test the login</span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4 flex-wrap">
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