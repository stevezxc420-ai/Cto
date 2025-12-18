import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../hooks/useTheme';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  // State definitions
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
  });

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    costSpikes: true,
  });

  const [billing, setBilling] = useState({
    cardNumber: '**** **** **** 4242',
    expiryDate: '12/24',
  });

  const [apiSettings, setApiSettings] = useState({
    rateLimit: 1000,
  });

  const [localization, setLocalization] = useState({
    language: 'en',
    timezone: 'UTC',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setApiSettings({ ...apiSettings, [e.target.name]: parseInt(e.target.value) });
  };

  const handleLocalizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalization({ ...localization, [e.target.name]: e.target.value });
  };

  const toggleDarkMode = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      // In a real app, we would persist this data
      setTimeout(() => setMessage(null), 3000);
    }, 800);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
        profile,
        notifications,
        billing,
        apiSettings,
        localization,
        theme
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'settings_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your application preferences and configuration.
            </p>
            </div>
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="btn-primary flex items-center"
            >
                {isSaving ? (
                   <span className="mr-2">Saving...</span> 
                ) : (
                    <span className="mr-2">Save Changes</span>
                )}
            </button>
        </div>
        
        {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {message.text}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile
              </h3>
              <div className="flex items-start space-x-6">
                <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
                />
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleProfileChange}
                            className="input"
                        />
                    </div>
                </div>
              </div>
            </div>

            {/* Notification Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications for important updates</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive daily summaries via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Cost Spikes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get alerted when costs exceed average by 10%</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('costSpikes')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.costSpikes ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.costSpikes ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Section */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Billing Settings
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Card Number
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={billing.cardNumber}
                            onChange={handleBillingChange}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={billing.expiryDate}
                            onChange={handleBillingChange}
                            className="input w-1/3"
                            placeholder="MM/YY"
                        />
                    </div>
                </div>
            </div>
            
            {/* API Settings Section */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    API Rate Limits
                </h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Max Requests per Minute
                        </label>
                        <select
                            name="rateLimit"
                            value={apiSettings.rateLimit}
                            onChange={handleApiChange}
                            className="input"
                        >
                            <option value="500">500</option>
                            <option value="1000">1000</option>
                            <option value="5000">5000</option>
                            <option value="10000">10000</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Higher limits may incur additional costs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Localization Section */}
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
                    name="language"
                    value={localization.language}
                    onChange={handleLocalizationChange}
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
                    name="timezone"
                    value={localization.timezone}
                    onChange={handleLocalizationChange}
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

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Appearance */}
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
                      onClick={() => toggleDarkMode(false)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        theme === 'light'
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => toggleDarkMode(true)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        theme === 'dark'
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

            {/* Account Security */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Security
              </h3>
              <div className="space-y-3">
                 <button className="w-full btn-secondary text-left flex justify-center">
                    Change Password
                 </button>
                 <button className="w-full btn-secondary text-left flex justify-center">
                    Enable 2FA
                 </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                    onClick={handleExportData}
                    className="w-full btn-secondary"
                >
                  Export Data
                </button>
              </div>
            </div>

             {/* Danger Zone */}
            <div className="card p-6 border-red-200 dark:border-red-900">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="w-full btn-danger">
                Delete Account
              </button>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>App Version:</strong> {process.env.REACT_APP_VERSION || '1.0.0'}</p>
                <p><strong>Build Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
