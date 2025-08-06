"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
// Using standard HTML elements instead of UI components
import { CheckCircle, AlertTriangle, Users, Database, Settings } from 'lucide-react';

export default function FixAllUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';

  const fixAllUsers = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/admin/fix-all-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix users');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSensorAssignments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/create-sensor-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sensor assignments');
      }

      alert(`Created ${data.assignments?.length || 0} sensor assignments`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const migrateUserStatus = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/migrate-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to migrate user status');
      }

      alert(`Successfully updated ${data.updatedCount} users to active status`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Admin access required to use this tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fix All Users & Assignments
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fix User Assignments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Fix User Assignments</span>
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Assign all users to appropriate pharmacies</li>
              <li>• Update user roles (admin/user)</li>
              <li>• Ensure proper dashboard access</li>
              <li>• Fix "Pharmacy User" vs "Admin Panel" display</li>
            </ul>
            
            <button 
              onClick={fixAllUsers} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Fixing Users...' : 'Fix All User Assignments'}
            </button>
          </div>
        </div>

        {/* Create Sensor Assignments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Create Sensor Assignments</span>
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Create sensor assignments for all pharmacies</li>
              <li>• Enable real API data instead of fallback</li>
              <li>• Assign multiple sensors per pharmacy</li>
              <li>• Fix dashboard data loading issues</li>
            </ul>
            
            <button 
              onClick={createSensorAssignments} 
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-md border border-gray-300 transition-colors"
            >
              {loading ? 'Creating Assignments...' : 'Create Sensor Assignments'}
            </button>
          </div>
        </div>

        {/* Migrate User Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Fix User Status</span>
            </h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Set all users as "Active" in admin panel</li>
              <li>• Approve all pending users</li>
              <li>• Fix "Inactive" status display issue</li>
              <li>• Add missing database columns if needed</li>
            </ul>
            
            <button 
              onClick={migrateUserStatus} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Fixing Status...' : 'Fix User Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Fix Results</span>
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.usersProcessed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Users Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.assignmentsCreated}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Assignments Created</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.rolesUpdated}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Roles Updated</div>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-2">
              <h3 className="font-semibold">User Assignments:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.userDetails?.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Role: {user.role} | Pharmacies: {user.assignmentCount}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {user.pharmaciesAssigned.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {results.errors?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-600">Errors:</h3>
                <div className="space-y-1">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      {error.user}: {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Instructions</h3>
        </div>
        <div className="px-6 py-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><strong>First:</strong> Click "Fix User Status" to set all users as active and approved</li>
            <li><strong>Second:</strong> Click "Fix All User Assignments" to assign users to pharmacies and update roles</li>
            <li><strong>Third:</strong> Click "Create Sensor Assignments" to enable real sensor data for all pharmacies</li>
            <li>Users will now see "Pharmacy User" instead of "Admin Panel" (except actual admins)</li>
            <li>All users will show as "Active" in the admin user management panel</li>
            <li>All users will be able to pull API data into their dashboards</li>
            <li>Test by logging in as different users to verify the fixes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}