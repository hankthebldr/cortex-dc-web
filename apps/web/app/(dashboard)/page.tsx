import { Suspense } from 'react';
import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard';

/**
 * Main Dashboard Route
 * Currently uses PersonalDashboard for all users
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <PersonalDashboard />
        </Suspense>
      </div>
    </div>
  );
}
