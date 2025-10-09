import { User } from '@/lib/auth';
import { useAuth } from '@/components/providers/AuthProvider';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className=\"flex items-center justify-between px-4 py-2 text-white cortex-brand-gradient\">\n      <h1 className=\"text-xl font-semibold\">Cortex DC Platform</h1>\n      <div className=\"flex items-center space-x-4\">\n        <span className=\"text-sm\">Welcome, {user.displayName}</span>\n        <span className=\"text-xs bg-white/20 px-2 py-1 rounded capitalize\">{user.role}</span>\n        <button\n          onClick={handleSignOut}\n          className=\"text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors\"\n        >\n          Sign Out\n        </button>\n      </div>\n    </header>\n  );\n}
      <h1 className=\"text-xl font-semibold\">Dashboard</h1>
      <div>
        <span>{user.name}</span>
      </div>
    </header>
  );
}
