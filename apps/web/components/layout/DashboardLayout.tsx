'use client';

import React from 'react';
import { Navigation } from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function DashboardLayout({ children, showNav = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {showNav && <Navigation />}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
