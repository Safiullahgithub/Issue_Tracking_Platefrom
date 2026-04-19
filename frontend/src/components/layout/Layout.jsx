import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/issues': 'Issues',
  '/issues/new': 'New Issue',
  '/users': 'User Management',
  '/profile': 'Profile',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path) && path !== '/issues' || location.pathname === path
  )?.[1] || 'TrackShield';

  const pageTitle = location.pathname.includes('/issues/') && !location.pathname.includes('/new')
    ? location.pathname.includes('/edit') ? 'Edit Issue' : 'Issue Detail'
    : title;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900 text-lg">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
              <BellIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
