import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../hooks/useTheme';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: theme === 'dark',
    language: 'en',
    timezone: 'UTC',
  });

  useEffect(() => {
    document.title = 'Settings - API Analytics Platform';
  }, []);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));

    if (key === 'darkMode') {
      setTheme(value === true ? 'dark' : 'light');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your application preferences and configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSettingChange('darkMode', false)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        !settings.darkMode
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleSettingChange('darkMode', true)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        settings.darkMode
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailAlerts', !settings.emailAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailAlerts ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Localization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="input"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Export Data
                </button>
                <button className="w-full btn-secondary">
                  Import Settings
                </button>
                <button className="w-full btn-danger">
                  Reset to Defaults
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>App Version:</strong> {process.env.REACT_APP_VERSION || '1.0.0'}</p>
                <p><strong>Build Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not configured'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button className="btn-secondary">Cancel</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;