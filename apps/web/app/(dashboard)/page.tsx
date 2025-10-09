import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard';
import { TeamDashboard } from '@/components/dashboard/TeamDashboard'; 
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@cortex/db/types/auth';

/**
 * Main Dashboard Route
 * Renders different dashboard experiences based on user role:
 * - User: Personal Dashboard with POV/TRR focus
 * - Manager: Team Dashboard with oversight capabilities  
 * - Admin: Admin Dashboard with platform analytics
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

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