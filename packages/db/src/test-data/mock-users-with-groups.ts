/**
 * Mock User Data with Group Assignments
 * For testing RBAC and data visibility
 *
 * Organizational Structure:
 * - 3 Departments: Engineering, Sales, Operations
 * - Each department has teams (groups)
 * - Managers assigned to each team
 * - Regular users assigned to teams
 */

import { UserRole, UserProfile } from '../types/auth';
import { Group } from '../services/group-management-service';

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers: Omit<UserProfile, 'id'>[] = [
  // ========== ADMINS ==========
  {
    uid: 'admin-001',
    email: 'admin@cortex.example.com',
    displayName: 'System Admin',
    role: UserRole.ADMIN,
    status: 'active' as any,
    department: 'IT',
    title: 'System Administrator',
    teams: [], // Admins see everything, don't need group membership
    preferences: {
      theme: 'dark' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: true
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any, // Will be populated by service
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== ENGINEERING MANAGERS ==========
  {
    uid: 'manager-eng-001',
    email: 'alice.manager@cortex.example.com',
    displayName: 'Alice Manager',
    role: UserRole.MANAGER,
    status: 'active' as any,
    department: 'Engineering',
    title: 'Engineering Manager',
    teams: ['group-eng-backend', 'group-eng-frontend'],
    preferences: {
      theme: 'light' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== SALES MANAGERS ==========
  {
    uid: 'manager-sales-001',
    email: 'bob.manager@cortex.example.com',
    displayName: 'Bob Manager',
    role: UserRole.MANAGER,
    status: 'active' as any,
    department: 'Sales',
    title: 'Sales Manager',
    manager: 'admin-001',
    teams: ['group-sales-enterprise', 'group-sales-smb'],
    preferences: {
      theme: 'system' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'list' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== OPERATIONS MANAGERS ==========
  {
    uid: 'manager-ops-001',
    email: 'carol.manager@cortex.example.com',
    displayName: 'Carol Manager',
    role: UserRole.MANAGER,
    status: 'active' as any,
    department: 'Operations',
    title: 'Operations Manager',
    manager: 'admin-001',
    teams: ['group-ops-support'],
    preferences: {
      theme: 'light' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== ENGINEERING USERS ==========
  {
    uid: 'user-eng-001',
    email: 'david.engineer@cortex.example.com',
    displayName: 'David Engineer',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Engineering',
    title: 'Backend Engineer',
    manager: 'manager-eng-001',
    teams: ['group-eng-backend'],
    preferences: {
      theme: 'dark' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    uid: 'user-eng-002',
    email: 'eve.engineer@cortex.example.com',
    displayName: 'Eve Engineer',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Engineering',
    title: 'Frontend Engineer',
    manager: 'manager-eng-001',
    teams: ['group-eng-frontend'],
    preferences: {
      theme: 'light' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    uid: 'user-eng-003',
    email: 'frank.engineer@cortex.example.com',
    displayName: 'Frank Engineer',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Engineering',
    title: 'Full Stack Engineer',
    manager: 'manager-eng-001',
    teams: ['group-eng-backend', 'group-eng-frontend'], // In multiple teams
    preferences: {
      theme: 'dark' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== SALES USERS ==========
  {
    uid: 'user-sales-001',
    email: 'grace.sales@cortex.example.com',
    displayName: 'Grace Sales',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Sales',
    title: 'Enterprise Account Executive',
    manager: 'manager-sales-001',
    teams: ['group-sales-enterprise'],
    preferences: {
      theme: 'system' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'list' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    uid: 'user-sales-002',
    email: 'henry.sales@cortex.example.com',
    displayName: 'Henry Sales',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Sales',
    title: 'SMB Account Executive',
    manager: 'manager-sales-001',
    teams: ['group-sales-smb'],
    preferences: {
      theme: 'light' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== OPERATIONS USERS ==========
  {
    uid: 'user-ops-001',
    email: 'iris.support@cortex.example.com',
    displayName: 'Iris Support',
    role: UserRole.USER,
    status: 'active' as any,
    department: 'Operations',
    title: 'Support Engineer',
    manager: 'manager-ops-001',
    teams: ['group-ops-support'],
    preferences: {
      theme: 'system' as any,
      notifications: {
        email: true,
        inApp: true,
        desktop: true
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },

  // ========== ISOLATED USER (No Team) ==========
  {
    uid: 'user-isolated-001',
    email: 'isolated.user@cortex.example.com',
    displayName: 'Isolated User',
    role: UserRole.USER,
    status: 'active' as any,
    department: undefined,
    title: 'Consultant',
    teams: [], // Not in any team - completely isolated
    preferences: {
      theme: 'light' as any,
      notifications: {
        email: false,
        inApp: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid' as any
      }
    },
    permissions: {} as any,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  }
];

// ============================================================================
// MOCK GROUPS
// ============================================================================

export const mockGroups: Omit<Group, 'id'>[] = [
  // ========== ENGINEERING GROUPS ==========
  {
    name: 'Backend Engineering',
    description: 'Backend development team',
    managerId: 'manager-eng-001',
    memberIds: ['user-eng-001', 'user-eng-003'],
    childGroupIds: [],
    organizationId: 'cortex-org',
    department: 'Engineering',
    region: 'US-West',
    tags: ['engineering', 'backend', 'okta-synced'],
    settings: {
      allowMemberInvites: false,
      autoApproveJoins: false,
      visibility: 'organization'
    },
    metadata: {
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      createdBy: 'admin-001',
      memberCount: 2
    }
  },
  {
    name: 'Frontend Engineering',
    description: 'Frontend development team',
    managerId: 'manager-eng-001',
    memberIds: ['user-eng-002', 'user-eng-003'],
    childGroupIds: [],
    organizationId: 'cortex-org',
    department: 'Engineering',
    region: 'US-West',
    tags: ['engineering', 'frontend', 'okta-synced'],
    settings: {
      allowMemberInvites: false,
      autoApproveJoins: false,
      visibility: 'organization'
    },
    metadata: {
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      createdBy: 'admin-001',
      memberCount: 2
    }
  },

  // ========== SALES GROUPS ==========
  {
    name: 'Enterprise Sales',
    description: 'Enterprise account team',
    managerId: 'manager-sales-001',
    memberIds: ['user-sales-001'],
    childGroupIds: [],
    organizationId: 'cortex-org',
    department: 'Sales',
    region: 'US-East',
    tags: ['sales', 'enterprise', 'okta-synced'],
    settings: {
      allowMemberInvites: false,
      autoApproveJoins: false,
      visibility: 'organization'
    },
    metadata: {
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
      createdBy: 'admin-001',
      memberCount: 1
    }
  },
  {
    name: 'SMB Sales',
    description: 'Small & medium business team',
    managerId: 'manager-sales-001',
    memberIds: ['user-sales-002'],
    childGroupIds: [],
    organizationId: 'cortex-org',
    department: 'Sales',
    region: 'US-Central',
    tags: ['sales', 'smb', 'okta-synced'],
    settings: {
      allowMemberInvites: false,
      autoApproveJoins: false,
      visibility: 'organization'
    },
    metadata: {
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
      createdBy: 'admin-001',
      memberCount: 1
    }
  },

  // ========== OPERATIONS GROUPS ==========
  {
    name: 'Customer Support',
    description: 'Customer support team',
    managerId: 'manager-ops-001',
    memberIds: ['user-ops-001'],
    childGroupIds: [],
    organizationId: 'cortex-org',
    department: 'Operations',
    region: 'Global',
    tags: ['operations', 'support', 'okta-synced'],
    settings: {
      allowMemberInvites: false,
      autoApproveJoins: false,
      visibility: 'organization'
    },
    metadata: {
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      createdBy: 'admin-001',
      memberCount: 1
    }
  }
];

// ============================================================================
// GROUP ID MAPPING
// ============================================================================

export const groupIdMap: Record<string, number> = {
  'group-eng-backend': 0,
  'group-eng-frontend': 1,
  'group-sales-enterprise': 2,
  'group-sales-smb': 3,
  'group-ops-support': 4
};

// ============================================================================
// OKTA GROUP MAPPINGS
// ============================================================================

export const oktaGroupMappings = [
  {
    oktaGroupId: 'okta-00backend',
    oktaGroupName: 'Engineering-Backend',
    internalGroupId: 'group-eng-backend',
    managerId: 'manager-eng-001',
    syncEnabled: true
  },
  {
    oktaGroupId: 'okta-00frontend',
    oktaGroupName: 'Engineering-Frontend',
    internalGroupId: 'group-eng-frontend',
    managerId: 'manager-eng-001',
    syncEnabled: true
  },
  {
    oktaGroupId: 'okta-00enterprise',
    oktaGroupName: 'Sales-Enterprise',
    internalGroupId: 'group-sales-enterprise',
    managerId: 'manager-sales-001',
    syncEnabled: true
  },
  {
    oktaGroupId: 'okta-00smb',
    oktaGroupName: 'Sales-SMB',
    internalGroupId: 'group-sales-smb',
    managerId: 'manager-sales-001',
    syncEnabled: true
  },
  {
    oktaGroupId: 'okta-00support',
    oktaGroupName: 'Operations-Support',
    internalGroupId: 'group-ops-support',
    managerId: 'manager-ops-001',
    syncEnabled: true
  }
];

// ============================================================================
// USER SUMMARIES FOR TESTING
// ============================================================================

export const userTestScenarios = {
  admin: {
    userId: 'admin-001',
    expectedAccess: 'ALL data from all users and groups',
    groupCount: 0,
    canSeeUsers: 'ALL users',
    canSeeGroups: 'ALL groups'
  },
  engineeringManager: {
    userId: 'manager-eng-001',
    expectedAccess: 'Own data + Backend team + Frontend team data',
    groupCount: 2,
    canSeeUsers: ['user-eng-001', 'user-eng-002', 'user-eng-003'],
    canSeeGroups: ['group-eng-backend', 'group-eng-frontend']
  },
  salesManager: {
    userId: 'manager-sales-001',
    expectedAccess: 'Own data + Enterprise team + SMB team data',
    groupCount: 2,
    canSeeUsers: ['user-sales-001', 'user-sales-002'],
    canSeeGroups: ['group-sales-enterprise', 'group-sales-smb']
  },
  backendEngineer: {
    userId: 'user-eng-001',
    expectedAccess: 'ONLY own data',
    groupCount: 1,
    canSeeUsers: [],
    canSeeGroups: ['group-eng-backend'] // Member of, but no special access
  },
  isolatedUser: {
    userId: 'user-isolated-001',
    expectedAccess: 'ONLY own data (no team)',
    groupCount: 0,
    canSeeUsers: [],
    canSeeGroups: []
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getUserById(userId: string): Omit<UserProfile, 'id'> | undefined {
  return mockUsers.find(u => u.uid === userId);
}

export function getGroupById(groupKey: string): Omit<Group, 'id'> | undefined {
  const index = groupIdMap[groupKey];
  return mockGroups[index];
}

export function getUsersByRole(role: UserRole): Omit<UserProfile, 'id'>[] {
  return mockUsers.filter(u => u.role === role);
}

export function getUsersByDepartment(department: string): Omit<UserProfile, 'id'>[] {
  return mockUsers.filter(u => u.department === department);
}

export function getManagedUsers(managerId: string): Omit<UserProfile, 'id'>[] {
  return mockUsers.filter(u => u.manager === managerId);
}
