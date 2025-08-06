"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Volume2,
  VolumeX,
  Clock,
  Thermometer,
  Shield
} from 'lucide-react';

interface NotificationSettings {
  email: {
    enabled: boolean;
    criticalAlerts: boolean;
    warningAlerts: boolean;
    systemUpdates: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  sms: {
    enabled: boolean;
    criticalAlerts: boolean;
    warningAlerts: boolean;
  };
  push: {
    enabled: boolean;
    criticalAlerts: boolean;
    warningAlerts: boolean;
    systemUpdates: boolean;
  };
  sound: {
    enabled: boolean;
    criticalAlerts: boolean;
    warningAlerts: boolean;
  };
  thresholds: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
    alertDelay: number;
  };
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      criticalAlerts: true,
      warningAlerts: true,
      systemUpdates: true,
      dailyReports: false,
      weeklyReports: true
    },
    sms: {
      enabled: false,
      criticalAlerts: false,
      warningAlerts: false
    },
    push: {
      enabled: true,
      criticalAlerts: true,
      warningAlerts: false,
      systemUpdates: false
    },
    sound: {
      enabled: true,
      criticalAlerts: true,
      warningAlerts: false
    },
    thresholds: {
      temperatureMin: 2,
      temperatureMax: 8,
      humidityMin: 35,
      humidityMax: 75,
      alertDelay: 5
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/notifications');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err: any) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      setSuccess('Notification settings saved successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (category: keyof NotificationSettings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleThresholdChange = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [field]: value
      }
    }));
  };

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure how and when you receive alerts and notifications
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Enable Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.enabled}
                onChange={() => handleToggle('email', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.email.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Critical Temperature Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.email.criticalAlerts}
                  onChange={() => handleToggle('email', 'criticalAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Warning Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.email.warningAlerts}
                  onChange={() => handleToggle('email', 'warningAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">System Updates</span>
                <input
                  type="checkbox"
                  checked={settings.email.systemUpdates}
                  onChange={() => handleToggle('email', 'systemUpdates')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Daily Reports</span>
                <input
                  type="checkbox"
                  checked={settings.email.dailyReports}
                  onChange={() => handleToggle('email', 'dailyReports')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Reports</span>
                <input
                  type="checkbox"
                  checked={settings.email.weeklyReports}
                  onChange={() => handleToggle('email', 'weeklyReports')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Smartphone className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SMS Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Enable SMS Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive critical alerts via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sms.enabled}
                onChange={() => handleToggle('sms', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.sms.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Critical Temperature Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.sms.criticalAlerts}
                  onChange={() => handleToggle('sms', 'criticalAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Warning Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.sms.warningAlerts}
                  onChange={() => handleToggle('sms', 'warningAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Push Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Enable Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.push.enabled}
                onChange={() => handleToggle('push', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.push.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Critical Temperature Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.push.criticalAlerts}
                  onChange={() => handleToggle('push', 'criticalAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Warning Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.push.warningAlerts}
                  onChange={() => handleToggle('push', 'warningAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">System Updates</span>
                <input
                  type="checkbox"
                  checked={settings.push.systemUpdates}
                  onChange={() => handleToggle('push', 'systemUpdates')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sound Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Volume2 className="h-6 w-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sound Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Enable Sound Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Play sound for critical alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sound.enabled}
                onChange={() => handleToggle('sound', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.sound.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Critical Temperature Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.sound.criticalAlerts}
                  onChange={() => handleToggle('sound', 'criticalAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Warning Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.sound.warningAlerts}
                  onChange={() => handleToggle('sound', 'warningAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Thermometer className="h-6 w-6 text-red-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Alert Thresholds</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature Min (°C)
            </label>
            <input
              type="number"
              value={settings.thresholds.temperatureMin}
              onChange={(e) => handleThresholdChange('temperatureMin', parseFloat(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature Max (°C)
            </label>
            <input
              type="number"
              value={settings.thresholds.temperatureMax}
              onChange={(e) => handleThresholdChange('temperatureMax', parseFloat(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Humidity Min (%)
            </label>
            <input
              type="number"
              value={settings.thresholds.humidityMin}
              onChange={(e) => handleThresholdChange('humidityMin', parseFloat(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Humidity Max (%)
            </label>
            <input
              type="number"
              value={settings.thresholds.humidityMax}
              onChange={(e) => handleThresholdChange('humidityMax', parseFloat(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alert Delay (minutes)
            </label>
            <input
              type="number"
              value={settings.thresholds.alertDelay}
              onChange={(e) => handleThresholdChange('alertDelay', parseInt(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Time to wait before sending alert after threshold breach
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}