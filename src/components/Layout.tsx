import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { isAuthenticated } from '../lib/token';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const authenticated = isAuthenticated();
  const shouldShowSidebar = showSidebar && authenticated;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        {shouldShowSidebar && <Sidebar />}
        <main className={`flex-1 ${shouldShowSidebar ? '' : 'w-full'}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;