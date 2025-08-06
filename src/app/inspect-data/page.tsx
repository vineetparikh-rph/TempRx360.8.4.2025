"use client";

import { useState, useEffect } from 'react';

export default function InspectDataPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inspect-data');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading database data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-600 text-xl font-semibold">Error</div>
              <p className="mt-2 text-gray-600">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Database Data Inspection</h1>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>

          {data && (
            <>
              {/* Summary */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">Database Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.summary.totalRecords}</div>
                    <div className="text-sm text-blue-800">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.summary.counts.users}</div>
                    <div className="text-sm text-green-800">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.summary.counts.pharmacies}</div>
                    <div className="text-sm text-purple-800">Pharmacies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{data.summary.counts.sensors}</div>
                    <div className="text-sm text-orange-800">Sensors</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{data.summary.counts.activeAlerts}</div>
                    <div className="text-sm text-red-800">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{data.summary.counts.readings}</div>
                    <div className="text-sm text-indigo-800">Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{data.summary.counts.sensorAssignments}</div>
                    <div className="text-sm text-teal-800">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{data.summary.counts.policies}</div>
                    <div className="text-sm text-gray-800">Policies</div>
                  </div>
                </div>
              </div>

              {/* Data Sections */}
              <div className="space-y-8">
                {/* Users */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Users ({data.data.users.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.users.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Pharmacies */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Pharmacies ({data.data.pharmacies.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.pharmacies.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Sensors */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensors ({data.data.sensors.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.sensors.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Sensor Assignments */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensor Assignments ({data.data.sensorAssignments.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.sensorAssignments.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Recent Readings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Readings ({data.data.recentReadings.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.recentReadings.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Active Alerts */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Alerts ({data.data.activeAlerts.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.activeAlerts.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Temperature Policies ({data.data.policies.count})</h2>
                  <div className="overflow-x-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.data.policies.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-8 text-center text-sm text-gray-500">
                Data retrieved at: {new Date(data.timestamp).toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}