export interface TRRSchema {
  id: string;
  povId: string;
  organizationId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string[];
  dueDate?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const TRR_COLLECTION = 'trrs';

// TODO: Add Firestore schema validation rules
export const TRRValidationRules = {
  required: ['povId', 'organizationId', 'userId', 'title'],
  maxTitleLength: 200,
  maxDescriptionLength: 2000,
  validStatuses: ['pending', 'in-progress', 'completed', 'failed'],
  validPriorities: ['low', 'medium', 'high', 'critical'],
};

export const TRRSchema = {}; // Placeholder