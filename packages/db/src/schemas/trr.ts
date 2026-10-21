import { z } from 'zod';

/**
 * TRR (Technical Resource Request) Schema with Zod Validation
 * Enterprise-grade validation for TRR CRUD operations
 */

// Status enum
export const TRRStatusEnum = z.enum([
  'draft',
  'pending',
  'in-progress',
  'in_review',
  'validated',
  'approved',
  'rejected',
  'completed',
  'failed'
]);

// Priority enum
export const TRRPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);

// Base TRR Schema for database
export const TRRSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  projectId: z.string().optional(),
  povId: z.string().optional(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional(),
  status: TRRStatusEnum.default('draft'),
  priority: TRRPriorityEnum.default('medium'),
  assignedTo: z.array(z.string()).optional(),
  reviewers: z.array(z.string()).default([]),
  scope: z.array(z.string()).default([]),
  technicalRequirements: z.array(z.string()).default([]),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().min(1, 'Created by is required'),
  lastModifiedBy: z.string().optional()
});

// Type inference from schema
export type TRRSchemaType = z.infer<typeof TRRSchema>;

// Create TRR Schema (for POST requests)
export const CreateTRRSchema = TRRSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  completedAt: true
}).extend({
  // Make certain fields required for creation
  title: z.string().min(1, 'Title is required').max(200),
  organizationId: z.string().min(1, 'Organization ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export type CreateTRRInput = z.infer<typeof CreateTRRSchema>;

// Update TRR Schema (for PUT/PATCH requests)
export const UpdateTRRSchema = TRRSchema.omit({
  id: true,
  createdAt: true,
  createdBy: true,
  organizationId: true
}).partial().extend({
  // Automatically update timestamp
  updatedAt: z.date().optional()
});

export type UpdateTRRInput = z.infer<typeof UpdateTRRSchema>;

// Collection name constant
export const TRR_COLLECTION = 'trrs';

// Validation helper functions
export const validateTRR = (data: unknown) => {
  return TRRSchema.safeParse(data);
};

export const validateCreateTRR = (data: unknown) => {
  return CreateTRRSchema.safeParse(data);
};

export const validateUpdateTRR = (data: unknown) => {
  return UpdateTRRSchema.safeParse(data);
};

// Legacy validation rules (for backward compatibility)
export const TRRValidationRules = {
  required: ['organizationId', 'userId', 'title'],
  maxTitleLength: 200,
  maxDescriptionLength: 2000,
  validStatuses: ['draft', 'pending', 'in-progress', 'in_review', 'validated', 'approved', 'rejected', 'completed', 'failed'] as const,
  validPriorities: ['low', 'medium', 'high', 'critical'] as const,
};