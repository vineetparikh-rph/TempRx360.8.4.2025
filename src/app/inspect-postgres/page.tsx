"use client";

import { useState, useEffect } from 'react';

export default function InspectPostgresPage() {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingAdmin, setTestingAdmin] = useState(false);
  const [adminTest, setAdminTest] = useState(null);

  useEffect(() => {
    inspectDatabase();
  }, []);

  const inspectDatabase = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/inspect-postgres');
      const data = await response.json();
      
      if (!response.ok) {
        setError(`Database inspection failed: ${data.error || 'Unknown error'}`);
      } else {
        setInspection(data);
      }
    } catch (err) {
      setError(`Failed to inspect database: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    setTestingAdmin(true);
    setAdminTest(null);
    
    try {
      const response = await fetch('/api/inspect-postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test-admin-login' })
      });

      const data = await response.json();
      setAdminTest(data);
    } catch (err) {
      setAdminTest({
        success: false,
        error: err.message
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inspecting PostgreSQL database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          🔍 POSTGRESQL DATABASE INSPECTION
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">❌ Inspection Failed</h2>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            <button
              onClick={inspectDatabase}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔄 Retry Inspection
            </button>
          </div>
        )}

        {inspection && (
          <div className="space-y-6">
            {/* Database Status */}
            <div className={`rounded-lg p-6 ${inspection.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className="text-xl font-bold mb-4">
                {inspection.success ? '✅ PostgreSQL Database: CONNECTED' : '❌ PostgreSQL Database: FAILED'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Database Type:</strong> {inspection.database?.databaseType}</p>
                  <p><strong>Connection:</strong> {inspection.database?.connectionStatus}</p>
                  <p><strong>Timestamp:</strong> {new Date(inspection.database?.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Total Users:</strong> {inspection.summary?.totalUsers}</p>
                  <p><strong>Total Pharmacies:</strong> {inspection.summary?.totalPharmacies}</p>
                  <p><strong>Total Sensors:</strong> {inspection.summary?.totalSensors}</p>
                </div>
              </div>
            </div>

            {/* Admin User Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">👤 Admin User Status</h3>
                <button
                  onClick={testAdminLogin}
                  disabled={testingAdmin}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {testingAdmin ? '🔄 Testing...' : '🔐 Test Admin Login'}
                </button>
              </div>
              
              {inspection.adminUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Admin User Details:</h4>
                    <p><strong>Email:</strong> {inspection.adminUser.email}</p>
                    <p><strong>Name:</strong> {inspection.adminUser.name}</p>
                    <p><strong>Role:</strong> {inspection.adminUser.role}</p>
                    <p><strong>ID:</strong> {inspection.adminUser.id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Status:</h4>
                    <p><strong>Approved:</strong> {inspection.adminUser.isApproved ? '✅ YES' : '❌ NO'}</p>
                    <p><strong>Status:</strong> {inspection.adminUser.approvalStatus}</p>
                    <p><strong>Has Password:</strong> {inspection.adminUser.hasPassword ? '✅ YES' : '❌ NO'}</p>
                    <p><strong>Pharmacies:</strong> {inspection.adminUser.pharmacyCount}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded text-red-700">
                  ❌ No admin user found in PostgreSQL database!
                </div>
              )}

              {/* Admin Login Test Results */}
              {adminTest && (
                <div className="mt-4 p-4 rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">🔐 Admin Login Test Results:</h4>
                  {adminTest.success ? (
                    <div className="space-y-1">
                      <p><strong>User Exists:</strong> {adminTest.adminTest.userExists ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Has Password:</strong> {adminTest.adminTest.hasPassword ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Password Valid (Maya@102$$):</strong> {adminTest.adminTest.passwordValid ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Is Approved:</strong> {adminTest.adminTest.isApproved ? '✅ YES' : '❌ NO'}</p>
                      <p><strong>Approval Status:</strong> {adminTest.adminTest.approvalStatus}</p>
                      <p><strong>Role:</strong> {adminTest.adminTest.role}</p>
                      <p><strong>Pharmacies:</strong> {adminTest.adminTest.pharmacyCount}</p>
                    </div>
                  ) : (
                    <p className="text-red-700">❌ {adminTest.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Tables Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Users Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Users Table</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">{inspection.inspection.users.count}</p>
                {inspection.inspection.users.error ? (
                  <p className="text-red-600 text-sm">Error: {inspection.inspection.users.error}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {inspection.inspection.users.data.slice(0, 3).map((user, index) => (
                      <p key={index} className="truncate">
                        {user.email} ({user.role})
                      </p>
                    ))}
                    {inspection.inspection.users.count > 3 && (
                      <p className="text-gray-500">...and {inspection.inspection.users.count - 3} more</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pharmacies Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏪 Pharmacies Table</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">{inspection.inspection.pharmacies.count}</p>
                {inspection.inspection.pharmacies.error ? (
                  <p className="text-red-600 text-sm">Error: {inspection.inspection.pharmacies.error}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {inspection.inspection.pharmacies.data.slice(0, 3).map((pharmacy, index) => (
                      <p key={index} className="truncate">
                        {pharmacy.name} ({pharmacy.code})
                      </p>
                    ))}
                    {inspection.inspection.pharmacies.count > 3 && (
                      <p className="text-gray-500">...and {inspection.inspection.pharmacies.count - 3} more</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sensors Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📡 Sensors Table</h3>
                <p className="text-2xl font-bold text-purple-600 mb-2">{inspection.inspection.sensors.count}</p>
                {inspection.inspection.sensors.error ? (
                  <p className="text-red-600 text-sm">Error: {inspection.inspection.sensors.error}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {inspection.inspection.sensors.data.slice(0, 3).map((sensor, index) => (
                      <p key={index} className="truncate">
                        {sensor.name} ({sensor.status})
                      </p>
                    ))}
                    {inspection.inspection.sensors.count > 3 && (
                      <p className="text-gray-500">...and {inspection.inspection.sensors.count - 3} more</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Data */}
            <details className="bg-white rounded-lg shadow p-6">
              <summary className="text-lg font-semibold text-gray-800 cursor-pointer mb-4">
                📋 Detailed Database Contents
              </summary>
              <div className="space-y-6">
                {/* All Users */}
                {inspection.inspection.users.data.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">All Users:</h4>
                    <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                      {inspection.inspection.users.data.map((user, index) => (
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

                {/* All Pharmacies */}
                {inspection.inspection.pharmacies.data.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">All Pharmacies:</h4>
                    <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                      {inspection.inspection.pharmacies.data.map((pharmacy, index) => (
                        <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                          <p><strong>{pharmacy.name}</strong> ({pharmacy.code})</p>
                          <p className="text-sm text-gray-600">
                            {pharmacy.userCount} users | {pharmacy.sensorCount} sensors
                          </p>
                          {pharmacy.address && (
                            <p className="text-xs text-gray-500">{pharmacy.address}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Actions</h3>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={inspectDatabase}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔄 Refresh Inspection
                </button>
                <a
                  href="/health-check"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  🏥 Health Check
                </a>
                <a
                  href="/signin"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🔐 Try Login
                </a>
                <a
                  href="/debug-auth"
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  🔍 Debug Auth
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}