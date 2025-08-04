"use client";

import { useState, useEffect } from 'react';

export default function PopulatePharmaciesPage() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Populate Pharmacies - TempRx360";
  }, []);

  const handlePopulate = async () => {
    setIsPopulating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/populate-pharmacies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        throw new Error(data.error || 'Failed to populate pharmacies');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🏥 Populate Pharmacy Database
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This will populate the pharmacy database with enhanced information including display names, 
            descriptions, contact details, and operational information to make pharmacy identification easier.
          </p>
        </div>

        {!result && !error && (
          <div className="text-center">
            <button
              onClick={handlePopulate}
              disabled={isPopulating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              {isPopulating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Populating Pharmacies...
                </span>
              ) : (
                'Populate Pharmacy Database'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Population Failed
                </h3>
              </div>
            </div>
            <div className="text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setError(null);
                }}
                className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {result && result.success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Pharmacies Populated Successfully!
                </h3>
              </div>
            </div>
            
            <div className="text-green-700 dark:text-green-300 mb-4">
              <p className="mb-2">{result.message}</p>
              <div className="space-y-1">
                {result.results.map((item: string, index: number) => (
                  <div key={index} className="text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {result.pharmacies && result.pharmacies.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-green-800 dark:text-green-200 mb-3">
                  Updated Pharmacies:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.pharmacies.map((pharmacy: any) => (
                    <div key={pharmacy.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {pharmacy.displayName}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pharmacy.code} • {pharmacy.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pharmacy.location}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pharmacy.phone} • {pharmacy.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {pharmacy.operatingHours}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href="/admin/pharmacies"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
              >
                View Pharmacy Management
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}