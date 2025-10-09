import { z } from 'zod';

/**
 * User Role Definitions
 * Hierarchical access control system for Domain Consultant platform
 */
export enum UserRole {
  USER = 'user',
  MANAGER = 'manager', 
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

/**
 * User Profile Schema
 */
export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  department: z.string().optional(),
  title: z.string().optional(),
  manager: z.string().optional(), // uid of manager
  teams: z.array(z.string()).default([]), // team IDs
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.object({
      email: z.boolean().default(true),
      inApp: z.boolean().default(true),
      desktop: z.boolean().default(false)
    }).default({}),
    dashboard: z.object({
      layout: z.enum(['grid', 'list']).default('grid'),
      defaultView: z.string().optional()
    }).default({})
  }).default({}),
  permissions: z.object({
    povManagement: z.object({
      create: z.boolean().default(true),
      edit: z.boolean().default(true),
      delete: z.boolean().default(false),
      viewAll: z.boolean().default(false)
    }).default({}),
    trrManagement: z.object({
      create: z.boolean().default(true),
      edit: z.boolean().default(true),
      delete: z.boolean().default(false),
      approve: z.boolean().default(false),
      viewAll: z.boolean().default(false)
    }).default({}),
    contentHub: z.object({
      create: z.boolean().default(true),
      edit: z.boolean().default(true),
      publish: z.boolean().default(false),
      moderate: z.boolean().default(false)
    }).default({}),
    scenarioEngine: z.object({
      execute: z.boolean().default(true),
      create: z.boolean().default(false),
      modify: z.boolean().default(false)
    }).default({}),
    terminal: z.object({
      basic: z.boolean().default(true),
      advanced: z.boolean().default(false),
      admin: z.boolean().default(false)
    }).default({}),
    analytics: z.object({
      view: z.boolean().default(true),
      export: z.boolean().default(false),
      detailed: z.boolean().default(false)
    }).default({}),
    userManagement: z.object({
      view: z.boolean().default(false),
      edit: z.boolean().default(false),
      create: z.boolean().default(false),
      delete: z.boolean().default(false)
    }).default({})
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Team Schema
 */
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  manager: z.string(), // uid of team manager
  members: z.array(z.string()), // array of user uids
  region: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Team = z.infer<typeof TeamSchema>;

/**
 * Permission Groups
 * Define what each role can access by default
 */
export const ROLE_PERMISSIONS: Record<UserRole, Partial<UserProfile['permissions']>> = {
  [UserRole.USER]: {
    povManagement: {
      create: true,
      edit: true,
      delete: false,
      viewAll: false
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: false,
      approve: false,
      viewAll: false
    },
    contentHub: {
      create: true,
      edit: true,
      publish: false,
      moderate: false
    },
    scenarioEngine: {
      execute: true,
      create: false,
      modify: false
    },
    terminal: {
      basic: true,
      advanced: false,
      admin: false
    },
    analytics: {
      view: true,
      export: false,
      detailed: false
    },
    userManagement: {
      view: false,
      edit: false,
      create: false,
      delete: false
    }
  },
  [UserRole.MANAGER]: {
    povManagement: {
      create: true,
      edit: true,
      delete: true,
      viewAll: true
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: true,
      approve: true,
      viewAll: true
    },
    contentHub: {
      create: true,
      edit: true,
      publish: true,
      moderate: true
    },
    scenarioEngine: {
      execute: true,
      create: true,
      modify: true
    },
    terminal: {
      basic: true,
      advanced: true,
      admin: false
    },
    analytics: {
      view: true,
      export: true,
      detailed: true
    },
    userManagement: {
      view: true,
      edit: false,
      create: false,
      delete: false
    }
  },
  [UserRole.ADMIN]: {
    povManagement: {
      create: true,
      edit: true,
      delete: true,
      viewAll: true
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: true,
      approve: true,
      viewAll: true
    },
    contentHub: {
      create: true,
      edit: true,
      publish: true,
      moderate: true
    },
    scenarioEngine: {
      execute: true,
      create: true,
      modify: true
    },
    terminal: {
      basic: true,
      advanced: true,
      admin: true
    },
    analytics: {
      view: true,
      export: true,
      detailed: true
    },
    userManagement: {
      view: true,
      edit: true,
      create: true,
      delete: true
    }
  }
};

/**
 * Navigation permissions based on role
 */
export const ROLE_NAVIGATION: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    '/dashboard',
    '/pov',
    '/trr', 
    '/content',
    '/scenarios',
    '/docs',
    '/terminal',
    '/preferences',
    '/escalation'
  ],
  [UserRole.MANAGER]: [
    '/dashboard',
    '/team',
    '/pov',
    '/trr',
    '/activity',
    '/content',
    '/scenarios', 
    '/docs',
    '/terminal',
    '/settings',
    '/preferences',
    '/escalation'
  ],
  [UserRole.ADMIN]: [
    '/dashboard',
    '/admin',
    '/users',
    '/teams',
    '/pov',
    '/trr',
    '/activity',
    '/content',
    '/scenarios',
    '/docs', 
    '/terminal',
    '/analytics',
    '/settings',
    '/preferences',
    '/escalation'
  ]
};

/**
 * Utility functions
 */
export const hasPermission = (
  userProfile: UserProfile,
  resource: keyof UserProfile['permissions'],
  action: string
): boolean => {
  const resourcePermissions = userProfile.permissions[resource] as Record<string, boolean>;
  return resourcePermissions?.[action] ?? false;
};

export const canAccessRoute = (userProfile: UserProfile, route: string): boolean => {
  return ROLE_NAVIGATION[userProfile.role].includes(route);
};

export const getDefaultPermissions = (role: UserRole): UserProfile['permissions'] => {
  return ROLE_PERMISSIONS[role] as UserProfile['permissions'];
};