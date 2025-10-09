import { UserRole, UserStatus } from '@cortex/db';

// Mock auth function for build purposes
// TODO: Replace with actual Firebase auth implementation
export async function getCurrentUser() {
  // Return a mock user for development
  return {
    uid: 'mock-user-id',
    email: 'mock@example.com',
    displayName: 'Mock User',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    teams: [],
    preferences: {
      theme: 'system' as const,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as const
      }
    },
    permissions: {
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
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
