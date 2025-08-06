"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  UserCheck, 
  Building2, 
  AlertCircle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function QuickFixUserPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixUserPharmacyAssignment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-user-pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix user assignment');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quick Fix User Assignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fix pharmacy assignment for vinitbparikh@gmail.com
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Issue Detected
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  User <code>vinitbparikh@gmail.com</code> is not assigned to any pharmacy, 
                  causing "Failed to fetch data" errors on the dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Solution
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  This will automatically assign the user to "Georgies Specialty Pharmacy" 
                  and create the necessary database records.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fixUserPharmacyAssignment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Fixing Assignment...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Fix User Assignment</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Success!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {result.message}
                  </p>
                  {result.user && result.pharmacy && (
                    <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                      <p><strong>User:</strong> {result.user.email}</p>
                      <p><strong>Assigned to:</strong> {result.pharmacy.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            After fixing, the user should be able to see pharmacy data on their dashboard.
            They may need to refresh their browser or sign out and back in.
          </p>
        </div>
      </div>
    </div>
  );
}