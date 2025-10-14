'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard';
import { TeamDashboard } from '@/components/dashboard/TeamDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UserRole } from '@cortex/db';

/**
 * Main Dashboard Route
 * Renders different dashboard experiences based on user role:
 * - User: Personal Dashboard with POV/TRR focus
 * - Manager: Team Dashboard with oversight capabilities
 * - Admin: Admin Dashboard with platform analytics
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isLoading } = useAuth();

  // Show loading skeleton while fetching user
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const DashboardComponent = getDashboardComponent(user.role as UserRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardComponent user={user as any} />
        </Suspense>
      </div>
    </div>
  );
}

function getDashboardComponent(role: UserRole | string | undefined) {
  switch (role) {
    case UserRole.ADMIN:
    case 'admin':
      return AdminDashboard;
    case UserRole.MANAGER:
    case 'manager':
      return TeamDashboard;
    case UserRole.USER:
    case 'user':
    default:
      return PersonalDashboard;
  }
}
