import * as React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Play, 
  Folder,
  Terminal as TerminalIcon,
  Settings,
  Users,
  BarChart3,
  Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../base/Badge';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  roles: ('user' | 'management' | 'admin')[];
  children?: NavigationItem[];
}

interface NavigationProps {
  currentPath: string;
  userRole: 'user' | 'management' | 'admin';
  onNavigate: (href: string) => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['user', 'management', 'admin'],
  },
  {
    id: 'pov',
    label: 'POV Management',
    icon: FileText,
    href: '/pov',
    roles: ['user', 'management', 'admin'],
    children: [
      { id: 'pov-active', label: 'Active POVs', icon: FileText, href: '/pov/active', roles: ['user', 'management', 'admin'] },
      { id: 'pov-templates', label: 'Templates', icon: Folder, href: '/pov/templates', roles: ['management', 'admin'] },
      { id: 'pov-analytics', label: 'Analytics', icon: BarChart3, href: '/pov/analytics', roles: ['management', 'admin'] },
    ],
  },
  {
    id: 'trr',
    label: 'TRR Management',
    icon: CheckSquare,
    href: '/trr',
    roles: ['user', 'management', 'admin'],
    children: [
      { id: 'trr-active', label: 'Active TRRs', icon: CheckSquare, href: '/trr/active', roles: ['user', 'management', 'admin'] },
      { id: 'trr-validation', label: 'Validation Queue', icon: Shield, href: '/trr/validation', roles: ['management', 'admin'] },
      { id: 'trr-reports', label: 'Reporting', icon: BarChart3, href: '/trr/reports', roles: ['management', 'admin'] },
    ],
  },
  {
    id: 'scenarios',
    label: 'Scenario Engine',
    icon: Play,
    href: '/scenarios',
    roles: ['user', 'management', 'admin'],
    children: [
      { id: 'scenarios-library', label: 'Scenario Library', icon: Folder, href: '/scenarios/library', roles: ['user', 'management', 'admin'] },
      { id: 'scenarios-monitor', label: 'Execution Monitor', icon: BarChart3, href: '/scenarios/monitor', roles: ['user', 'management', 'admin'] },
      { id: 'scenarios-archive', label: 'Results Archive', icon: FileText, href: '/scenarios/archive', roles: ['management', 'admin'] },
    ],
  },
  {
    id: 'content',
    label: 'Content Hub',
    icon: Folder,
    href: '/content',
    roles: ['user', 'management', 'admin'],
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: TerminalIcon,
    href: '/terminal',
    roles: ['user', 'management', 'admin'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Settings,
    href: '/integrations',
    roles: ['management', 'admin'],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Users,
    href: '/admin',
    roles: ['admin'],
    children: [
      { id: 'admin-users', label: 'User Management', icon: Users, href: '/admin/users', roles: ['admin'] },
      { id: 'admin-analytics', label: 'System Analytics', icon: BarChart3, href: '/admin/analytics', roles: ['admin'] },
      { id: 'admin-config', label: 'Configuration', icon: Settings, href: '/admin/config', roles: ['admin'] },
    ],
  },
];

const Navigation = React.forwardRef<HTMLDivElement, NavigationProps>(
  ({ currentPath, userRole, onNavigate, className }, ref) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      setExpandedItems(newExpanded);
    };

    const isItemVisible = (item: NavigationItem) => {
      return item.roles.indexOf(userRole) !== -1;
    };

    const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
      if (!isItemVisible(item)) return null;

      const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);
      const Icon = item.icon;

      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.id);
              } else {
                onNavigate(item.href);
              }
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground font-medium',
              level > 0 && 'ml-4 pl-6'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <svg
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isExpanded && 'rotate-90'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          {hasChildren && isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <nav
        ref={ref}
        className={cn('flex flex-col space-y-2 p-4', className)}
      >
        <div className="mb-6">
          <h2 className="cortex-gradient-text text-lg font-semibold tracking-tight">
            Cortex DC
          </h2>
          <p className="text-sm text-muted-foreground">
            Domain Consultant Platform
          </p>
        </div>
        
        {navigationItems.map((item) => renderNavigationItem(item))}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

export { Navigation, type NavigationItem };
