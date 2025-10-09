'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900\">\n      <div className=\"max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8\">\n        <Dashboard user={user} />\n      </div>\n    </div>\n  );\n}
      <div className=\"max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8\">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard user={user} />
        </Suspense>
      </div>
    </div>
  );
}
