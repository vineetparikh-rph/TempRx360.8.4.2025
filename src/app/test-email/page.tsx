'use client';

import { useState, useEffect } from 'react';

interface EmailConfig {
  configured: boolean;
  config: {
    host: string;
    port: string;
    from: string;
    user: string;
    pass: string;
  };
  status: string;
}

export default function TestEmailPage() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      setEmailConfig(data);
    } catch (error) {
      console.error('Failed to fetch email config:', error);
      setError('Failed to fetch email configuration');
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setError('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Configuration Test</h1>

          {/* Email Configuration Status */}
          {emailConfig && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Configuration Status</h2>
              <div className={`p-4 rounded-md ${emailConfig.configured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${emailConfig.configured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={`font-medium ${emailConfig.configured ? 'text-green-800' : 'text-yellow-800'}`}>
                    {emailConfig.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div><strong>Host:</strong> {emailConfig.config.host}</div>
                <div><strong>Port:</strong> {emailConfig.config.port}</div>
                <div><strong>From:</strong> {emailConfig.config.from}</div>
                <div><strong>User:</strong> {emailConfig.config.user}</div>
                <div><strong>Password:</strong> {emailConfig.config.pass}</div>
              </div>
            </div>
          )}

          {/* Test Email Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Test Email Address
              </label>
              <input
                type="email"
                id="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email to test"
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Setup Instructions */}
          {emailConfig && !emailConfig.configured && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>To enable email functionality, add these environment variables:</p>
                <div className="bg-blue-100 p-3 rounded font-mono text-xs">
                  <div>SMTP_HOST=smtp.gmail.com</div>
                  <div>SMTP_PORT=587</div>
                  <div>SMTP_USER=your-email@gmail.com</div>
                  <div>SMTP_PASS=your-app-password</div>
                  <div>SMTP_FROM=TempRx360 &lt;your-email@gmail.com&gt;</div>
                </div>
                <p className="text-xs">
                  <strong>Note:</strong> For Gmail, you need to enable 2FA and create an App Password.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}