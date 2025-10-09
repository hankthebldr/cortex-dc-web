import { UserRole } from '@cortex/db/types/auth';

export const sidebarLinks = [
  {
    label: 'POV Management',
    href: '/pov',
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    label: 'TRR Management',
    href: '/trr',
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    label: 'Content Hub',
    href: '/content',
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    label: 'Integration Hub',
    href: '/integrations',
    roles: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    label: 'Administration',
    href: '/admin',
    roles: [UserRole.ADMIN],
  },
];
