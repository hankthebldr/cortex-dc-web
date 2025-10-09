import React from 'react';

interface TeamDashboardProps {
  user: any;
}

export function TeamDashboard({ user }: TeamDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Manager'}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900">Team Overview</h2>
          <p className="text-gray-600 mt-2">Manage your team's engagement activities</p>
        </div>
      </div>
    </div>
  );
}
