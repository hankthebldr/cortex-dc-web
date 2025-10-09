import { User } from 'next-auth';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className=\"flex items-center justify-between px-4 py-2 text-white cortex-brand-gradient\">
      <h1 className=\"text-xl font-semibold\">Dashboard</h1>
      <div>
        <span>{user.name}</span>
      </div>
    </header>
  );
}
