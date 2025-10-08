export interface POV {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TRR {
  id: string;
  povId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}