"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Building2,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Zap,
  Shield,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalPharmacies: number;
    totalSensors: number;
    totalGateways: number;
    activeAlerts: number;
    complianceRate: number;
    avgTemperature: number;
    dataPoints: number;
    uptime: number;
  };
  temperatureTrends: Array<{
    date: string;
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
    compliance: number;
  }>;
  pharmacyPerformance: Array<{
    name: string;
    compliance: number;
    sensors: number;
    alerts: number;
    avgTemp: number;
  }>;
  sensorHealth: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  alertTrends: Array<{
    date: string;
    critical: number;
    warning: number;
    resolved: number;
  }>;
  complianceByHour: Array<{
    hour: string;
    compliance: number;
    readings: number;
  }>;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
      // Generate sample data for demo
      setAnalyticsData(generateSampleAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const generateSampleAnalyticsData = (): AnalyticsData => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Temperature trends
    const temperatureTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      temperatureTrends.push({
        date: date.toISOString().split('T')[0],
        avgTemp: Math.round((Math.random() * 3 + 21) * 10) / 10,
        minTemp: Math.round((Math.random() * 2 + 19) * 10) / 10,
        maxTemp: Math.round((Math.random() * 2 + 24) * 10) / 10,
        compliance: Math.round((Math.random() * 10 + 90) * 10) / 10
      });
    }

    // Pharmacy performance
    const pharmacyPerformance = [
      { name: 'Georgies Specialty Pharmacy', compliance: 98.5, sensors: 2, alerts: 1, avgTemp: 22.1 },
      { name: 'Georgies Family Pharmacy', compliance: 96.2, sensors: 5, alerts: 3, avgTemp: 21.8 },
      { name: 'Georgies Parlin Pharmacy', compliance: 94.8, sensors: 6, alerts: 2, avgTemp: 22.3 },
      { name: 'Georgies Outpatient Pharmacy', compliance: 99.1, sensors: 0, alerts: 0, avgTemp: 21.9 }
    ];

    // Sensor health
    const sensorHealth = [
      { status: 'Online', count: 13, percentage: 86.7 },
      { status: 'Warning', count: 1, percentage: 6.7 },
      { status: 'Offline', count: 1, percentage: 6.7 }
    ];

    // Alert trends
    const alertTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      alertTrends.push({
        date: date.toISOString().split('T')[0],
        critical: Math.floor(Math.random() * 3),
        warning: Math.floor(Math.random() * 5),
        resolved: Math.floor(Math.random() * 8)
      });
    }

    // Compliance by hour
    const complianceByHour = [];
    for (let hour = 0; hour < 24; hour++) {
      complianceByHour.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        compliance: Math.round((Math.random() * 8 + 92) * 10) / 10,
        readings: Math.floor(Math.random() * 50 + 100)
      });
    }

    return {
      overview: {
        totalPharmacies: 4,
        totalSensors: 15,
        totalGateways: 4,
        activeAlerts: 6,
        complianceRate: 97.2,
        avgTemperature: 22.0,
        dataPoints: 12847,
        uptime: 99.8
      },
      temperatureTrends,
      pharmacyPerformance,
      sensorHealth,
      alertTrends,
      complianceByHour
    };
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your temperature monitoring system
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              API not available - showing sample data. {error}
            </span>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pharmacies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalPharmacies}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sensors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalSensors}</p>
            </div>
            <Thermometer className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.complianceRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.activeAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.avgTemperature}°C</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.dataPoints.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.uptime}%</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gateways</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalGateways}</p>
            </div>
            <Cpu className="h-8 w-8 text-cyan-600" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Temperature Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.temperatureTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgTemp" stroke="#3B82F6" name="Avg Temp (°C)" />
              <Line type="monotone" dataKey="minTemp" stroke="#10B981" name="Min Temp (°C)" />
              <Line type="monotone" dataKey="maxTemp" stroke="#EF4444" name="Max Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sensor Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sensor Health Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.sensorHealth}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.sensorHealth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.alertTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#EF4444" name="Critical" />
              <Area type="monotone" dataKey="warning" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Warning" />
              <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10B981" fill="#10B981" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance by Hour */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.complianceByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="compliance" fill="#3B82F6" name="Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pharmacy Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Compliance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sensors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Active Alerts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Temperature
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.pharmacyPerformance.map((pharmacy, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {pharmacy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pharmacy.compliance >= 98 ? 'bg-green-100 text-green-800' :
                        pharmacy.compliance >= 95 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {pharmacy.sensors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pharmacy.alerts === 0 ? 'bg-green-100 text-green-800' :
                      pharmacy.alerts <= 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pharmacy.alerts}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {pharmacy.avgTemp}°C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}