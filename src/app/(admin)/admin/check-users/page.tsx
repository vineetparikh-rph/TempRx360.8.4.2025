"use client";

import { useState } from 'react';
import { Users, CheckCircle, XCircle, UserPlus, AlertCircle } from 'lucide-react';

export default function CheckUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const checkSpecificUsers = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/check-specific-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check users');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <span>Check Specific Users</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Check and create specific users: familyrx, parlinrx@gmail.com, rosemarwa, specialtyrx@stgeorgesrx.com
          </p>
        </div>
      </div>

      {/* Check Users Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Check & Create Users</span>
          </h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Users to Check:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>familyrx</strong> → Georgies Family Pharmacy</li>
              <li>• <strong>parlinrx@gmail.com</strong> → Georgies Parlin Pharmacy</li>
              <li>• <strong>rosemarwa</strong> → All Pharmacies Access</li>
              <li>• <strong>specialtyrx@stgeorgesrx.com</strong> → Georgies Specialty Pharmacy</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will check if these users exist and:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
            <li>• Create them if they don't exist (with default passwords)</li>
            <li>• Set them as active and approved</li>
            <li>• Assign them to appropriate pharmacies</li>
            <li>• Show their current status and login credentials</li>
          </ul>
          
          <button 
            onClick={checkSpecificUsers} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Checking Users...' : 'Check & Create Users'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Users Check Complete!
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Checked: {result.results.usersChecked} users</p>
                  <p>Created: {result.results.usersCreated} users</p>
                  <p>Updated: {result.results.usersUpdated} users</p>
                  <p>Errors: {result.results.errors.length} errors</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          {result.results.userDetails.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  User Details
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {result.results.userDetails.map((user, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.email}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.action === 'created' ? 'bg-green-100 text-green-800' :
                          user.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.action}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Name:</strong> {user.name}</p>
                          <p><strong>Role:</strong> {user.role}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          <p><strong>Approved:</strong> 
                            <span className={`ml-1 ${user.isApproved ? 'text-green-600' : 'text-red-600'}`}>
                              {user.isApproved ? 'Yes' : 'No'}
                            </span>
                          </p>
                        </div>
                        
                        <div>
                          <p><strong>Default Password:</strong> 
                            <code className="ml-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {user.defaultPassword}
                            </code>
                          </p>
                          <p><strong>Pharmacies:</strong></p>
                          <ul className="ml-2 text-xs">
                            {user.pharmacies.map((pharmacy, idx) => (
                              <li key={idx}>• {pharmacy.name}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.results.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Errors Encountered:
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {result.results.errors.map((error, index) => (
                      <p key={index}>
                        <strong>{error.email}:</strong> {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Instructions</h3>
        </div>
        <div className="px-6 py-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Click "Check & Create Users" to process the specific users</li>
            <li>Review the results to see which users were created or updated</li>
            <li>Note the default passwords for any newly created users</li>
            <li>Users can login with their email and default password</li>
            <li>Recommend users change their passwords after first login</li>
            <li>All users will be set as active and approved automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}