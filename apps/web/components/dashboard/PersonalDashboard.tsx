'use client';

import React from 'react';

export const PersonalDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Cortex DC
            </h1>
            <p className="text-gray-600 mt-1">
              Your analytics dashboard is being prepared
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Active POVs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">3</div>
          <div className="text-xs text-green-600 mt-1">+15% from last month</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Pending TRRs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">2</div>
          <div className="text-xs text-orange-600 mt-1">1 high priority</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">89%</div>
          <div className="text-xs text-gray-500 mt-1">Goal: 85%</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Platform Health</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">99.9%</div>
          <div className="text-xs text-green-600 mt-1">All systems operational</div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics Dashboard
        </h2>
        <div className="text-gray-600">
          <p>Analytics components and visualizations will be integrated here.</p>
          <p className="mt-2">This dashboard supports:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Project performance tracking</li>
            <li>POV success metrics</li>
            <li>TRR completion analytics</li>
            <li>Team productivity insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
