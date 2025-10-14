/**
 * Test Data Factories
 * Factory functions for creating mock data in tests
 */

/**
 * Mock POV object for testing
 */
export interface MockPOV {
  id: string;
  name: string;
  customerName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  scope: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a mock POV with optional overrides
 */
export const createMockPOV = (overrides?: Partial<MockPOV>): MockPOV => ({
  id: '1',
  name: 'Test POV',
  customerName: 'Test Customer',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  scope: ['Threat Detection', 'Incident Response'],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

/**
 * Mock User object for testing
 */
export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user' | 'viewer';
  photoURL?: string;
  emailVerified: boolean;
}

/**
 * Create a mock user with optional overrides
 */
export const createMockUser = (overrides?: Partial<MockUser>): MockUser => ({
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'user',
  emailVerified: true,
  ...overrides,
});

/**
 * Mock Document object for testing
 */
export interface MockDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Create a mock document with optional overrides
 */
export const createMockDocument = (overrides?: Partial<MockDocument>): MockDocument => ({
  id: '1',
  name: 'test-document.pdf',
  type: 'application/pdf',
  size: 1024 * 100, // 100KB
  uploadedAt: new Date('2025-01-15'),
  uploadedBy: 'user-1',
  ...overrides,
});

/**
 * Create multiple mock POVs
 */
export const createMockPOVList = (count: number): MockPOV[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPOV({
      id: `pov-${index + 1}`,
      name: `POV ${index + 1}`,
      customerName: `Customer ${index + 1}`,
    })
  );
};

/**
 * Create multiple mock users
 */
export const createMockUserList = (count: number): MockUser[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index + 1}`,
      email: `user${index + 1}@example.com`,
      displayName: `User ${index + 1}`,
    })
  );
};
