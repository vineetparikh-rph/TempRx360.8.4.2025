"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  Database,
  Server,
  Shield,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
  Lock,
  Globe
} from 'lucide-react';

interface SystemSettings {
  database: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    compressionEnabled: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    maxConcurrentUsers: number;
    apiRateLimit: number;
  };
  monitoring: {
    errorLogging: boolean;
    performanceMetrics: boolean;
    userActivityTracking: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
    };
  };
}

export default function SystemSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SystemSettings>({
    database: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      compressionEnabled: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorRequired: false,
      ipWhitelist: []
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 3600,
      maxConcurrentUsers: 100,
      apiRateLimit: 1000
    },
    monitoring: {
      errorLogging: true,
      performanceMetrics: true,
      userActivityTracking: true,
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Access control
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access system settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save system settings');
      }

      setSuccess('System settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      setSuccess('Backup created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBackupNow}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Backup Now
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Database Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.database.autoBackup}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  database: { ...prev.database, autoBackup: e.target.checked }
                }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Auto Backup
              </span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Frequency
            </label>
            <select
              value={settings.database.backupFrequency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                database: { ...prev.database, backupFrequency: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Retention Days
            </label>
            <input
              type="number"
              value={settings.database.retentionDays}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                database: { ...prev.database, retentionDays: parseInt(e.target.value) }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.database.compressionEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  database: { ...prev.database, compressionEnabled: e.target.checked }
                }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Compression
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="480"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="3"
              max="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password Expiry (days)
            </label>
            <input
              type="number"
              value={settings.security.passwordExpiry}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="30"
              max="365"
            />
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.twoFactorRequired}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactorRequired: e.target.checked }
                }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require Two-Factor Authentication
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
