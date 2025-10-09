'use client';

import { Suspense, useEffect, useState } from 'react';
import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard';
import { TeamDashboard } from '@/components/dashboard/TeamDashboard'; 
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UserRole, UserStatus } from '@cortex/db';

// Mock user for static deployment
const mockUser = {
  uid: 'demo-user-id',
  email: 'demo@cortex-dc.com',
  displayName: 'Demo User',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  teams: [],
  preferences: {
    theme: 'system' as const,
    notifications: {
      email: true,
      inApp: true,
      desktop: false
    },
    dashboard: {
      layout: 'grid' as const
    }
  },
  permissions: {
    povManagement: {
      create: true,
      edit: true,
      delete: false,
      viewAll: false
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: false,
      approve: false,
      viewAll: false
    },
    contentHub: {
      create: true,
      edit: true,
      publish: false,
      moderate: false
    },
    scenarioEngine: {
      execute: true,
      create: false,
      modify: false
    },
    terminal: {
      basic: true,
      advanced: false,
      admin: false
    },
    analytics: {
      view: true,
      export: false,
      detailed: false
    },
    userManagement: {
      view: false,
      edit: false,
      create: false,
      delete: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Main Dashboard Route
 * Renders different dashboard experiences based on user role:
 * - User: Personal Dashboard with POV/TRR focus
 * - Manager: Team Dashboard with oversight capabilities  
 * - Admin: Admin Dashboard with platform analytics
 */
export default function DashboardPage() {
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  // Route to appropriate dashboard based on user role
  const DashboardComponent = getDashboardComponent(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardComponent user={user} />
        </Suspense>
      </div>
    </div>
  );
}

function getDashboardComponent(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return AdminDashboard;
    case UserRole.MANAGER:
      return TeamDashboard;
    case UserRole.USER:
    default:
      return PersonalDashboard;
  }
}
