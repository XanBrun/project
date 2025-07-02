import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Desktop Top Bar */}
        <header className="hidden lg:block bg-white/80 backdrop-blur-sm shadow-lg border-b border-amber-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-900">D&D Companion</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium">Sistema Activo</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pt-4 lg:pt-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;