import { UserRole } from '@cortex/db/types/auth';
import { User } from 'next-auth';
import { sidebarLinks } from '@/lib/sidebar-links';

interface DashboardSidebarProps {
  user: User & { role: UserRole };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const filteredLinks = sidebarLinks.filter(link => link.roles.includes(user.role));

  return (
    <aside className=\"w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700\">
      <div className=\"p-4\">
        <h2 className=\"text-lg font-semibold text-gray-900 dark:text-white\">Menu</h2>
        <nav className=\"mt-4\">
          <ul>
            {filteredLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className=\"block py-2 px-4 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors\">{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
