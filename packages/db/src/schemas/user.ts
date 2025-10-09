export interface UserSchema {
  id: string;
  email: string;
  name?: string;
  organizationId?: string;
  role: 'admin' | 'user' | 'viewer';
  profile?: {
    avatar?: string;
    bio?: string;
    preferences?: Record<string, any>;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const USER_COLLECTION = 'users';

// TODO: Add Firestore schema validation rules
export const UserValidationRules = {
  required: ['email', 'role'],
  maxNameLength: 100,
  maxBioLength: 500,
  validRoles: ['admin', 'user', 'viewer'],
};

import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof UserSchema>;