'use client';

import { PersonalDashboard } from './PersonalDashboard';
import { TeamDashboard } from './TeamDashboard';
import { AdminDashboard } from './AdminDashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardContent } from './DashboardContent';
import { UserRole } from '@cortex/db/types/auth';
import { User } from 'next-auth';

interface DashboardProps {
  user: User & { role: UserRole };
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

export function Dashboard({ user }: DashboardProps) {
  const DashboardComponent = getDashboardComponent(user.role);
  return (
    <div className=\"flex h-screen\">
      <DashboardSidebar user={user} />
      <div className=\"flex-1 flex flex-col\">
        <DashboardHeader user={user} />
        <DashboardContent>
          <DashboardComponent user={user} />
        </DashboardContent>
      </div>
    </div>
  );
}
