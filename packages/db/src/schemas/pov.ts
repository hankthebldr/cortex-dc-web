export interface POVSchema {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'active' | 'archived';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const POV_COLLECTION = 'povs';

// TODO: Add Firestore schema validation rules
export const POVValidationRules = {
  required: ['organizationId', 'userId', 'title'],
  maxTitleLength: 200,
  maxDescriptionLength: 2000,
  maxTags: 20,
  validStatuses: ['draft', 'active', 'archived'],
};
