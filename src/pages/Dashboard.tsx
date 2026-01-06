import React from 'react';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const user = {
    name: 'John Doe',
    company: 'Acme Corporation'
  };

  const costStats = [
    {
      title: 'Total Costs',
      value: '$2,847.50',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: '💰'
    },
    {
      title: 'This Month',
      value: '$423.75',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: '📅'
    },
    {
      title: 'Providers',
      value: '7',
      change: '+2',
      changeType: 'positive' as const,
      icon: '🏢'
    },
    {
      title: 'API Calls',
      value: '847,234',
      change: '-5.1%',
      changeType: 'negative' as const,
      icon: '🔌'
    }
  ];

  const costOverview = [
    {
      provider: 'AWS',
      cost: '$1,234.50',
      percentage: 43.4,
      color: 'bg-orange-500'
    },
    {
      provider: 'Google Cloud',
      cost: '$892.25',
      percentage: 31.3,
      color: 'bg-blue-500'
    },
    {
      provider: 'Azure',
      cost: '$456.75',
      percentage: 16.0,
      color: 'bg-green-500'
    },
    {
      provider: 'Others',
      cost: '$264.00',
      percentage: 9.3,
      color: 'bg-gray-500'
    }
  ];

  const recentActivities = [
    {
      type: 'alert',
      message: 'API usage spike detected on AWS Lambda',
      time: '5 minutes ago',
      priority: 'high'
    },
    {
      type: 'deployment',
      message: 'New API v2.1 deployed to production',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      type: 'cost',
      message: 'Monthly cost threshold reached',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user.name}!
              </h1>
              <p className="text-blue-100 mt-2">
                Here's an overview of your {user.company} cloud costs and API usage
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-blue-100">Last updated</p>
                <p className="text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {costStats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className="text-3xl opacity-80">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Overview Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Overview by Provider */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cost Overview by Provider
            </h3>
            <div className="space-y-4">
              {costOverview.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.provider}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.cost}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                {costOverview.map((item, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    activity.priority === 'high' ? 'bg-red-400' :
                    activity.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium">
                View all activities →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-primary justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Provider
            </button>
            <button className="btn-secondary justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Generate Cost Report
            </button>
            <button className="btn-secondary justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cost Alerts
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;