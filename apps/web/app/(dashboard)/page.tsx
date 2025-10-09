import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50\">
      <div className=\"max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8\">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard user={user} />
        </Suspense>
      </div>
    </div>
  );
}
