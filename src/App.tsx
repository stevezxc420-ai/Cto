import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';

// Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';

import './index.css';

// Placeholder components for new pages
const APIs: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">APIs</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">API Management dashboard coming soon</p>
    </div>
  </div>
);

const Analytics: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Analytics dashboard coming soon</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="myapp-theme">
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apis" element={<APIs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;