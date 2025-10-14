'use client';

/**
 * Domain Consultant API Client - Migrated from henryreed.ai
 *
 * Comprehensive API layer for all DC workflows and operations:
 * - Customer and engagement management
 * - POV (Proof of Value) operations
 * - TRR (Technical Readiness Review) management
 * - Solution Design Workbook (SDW) operations
 * - Metrics and analytics
 * - XSIAM health monitoring
 * - Knowledge base integration
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  setDoc,
  type QueryConstraint,
} from 'firebase/firestore';

// Import from other packages (will be resolved by workspace)
// These imports reference types from dc-context-store which will be migrated next

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface DCMetrics {
  customers: {
    active: number;
    total: number;
    byIndustry: Record<string, number>;
    byMaturity: Record<string, number>;
  };
  povs: {
    active: number;
    completed: number;
    successRate: number;
    avgDuration: number;
  };
  trrs: {
    total: number;
    validated: number;
    pending: number;
    completionRate: number;
  };
  performance: {
    weeklyVelocity: number;
    monthlyClosures: number;
    avgTimeToClose: number;
  };
}

export interface XSIAMHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    dataIngestion: 'healthy' | 'warning' | 'critical';
    correlationEngine: 'healthy' | 'warning' | 'critical';
    apiGateway: 'healthy' | 'warning' | 'critical';
    dataLake: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    eventsPerSecond: number;
    alertsGenerated: number;
    responseTime: number;
    uptime: number;
  };
  recommendations: string[];
  lastChecked: string;
}

export interface DataExportConfig {
  scope: 'all' | 'customer' | 'timeframe' | 'type';
  filters: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
    dataTypes?: string[];
  };
  format: 'json' | 'csv' | 'excel' | 'bigquery';
  includeMetadata: boolean;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: 'research' | 'capability' | 'workflow' | 'troubleshooting' | 'best-practice';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  searchable: boolean;
}

export interface UserScopeContext {
  userId: string;
  scope?: 'self' | 'team';
  teamUserIds?: string[];
  targetUserId?: string;
}

/**
 * Main DC API Client
 *
 * Provides comprehensive API access to all DC operations with:
 * - Firestore integration with fallback to local store
 * - Team-based access control
 * - Metrics and analytics
 * - XSIAM health monitoring
 */
export class DCAPIClient {
  private baseUrl: string;
  private apiKey?: string;
  private sdwStorage: Record<string, any> = {};

  constructor(baseUrl: string = '/api/dc', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async getFirestore() {
    try {
      const { db } = await import('@cortex/db');
      return db;
    } catch (error) {
      console.warn('Firestore unavailable, using context store fallback:', error);
      return null;
    }
  }

  private async getContextStore() {
    try {
      const { dcContextStore } = await import('@cortex/db');
      return dcContextStore;
    } catch (error) {
      console.warn('Context store unavailable:', error);
      return null;
    }
  }

  private async getAIClient() {
    try {
      const { dcAIClient } = await import('@cortex/ai');
      return dcAIClient;
    } catch (error) {
      console.warn('AI client unavailable:', error);
      return null;
    }
  }

  private resolveUserIds(context: UserScopeContext): string[] {
    const ids = new Set<string>();
    if (context.userId) {
      ids.add(context.userId);
    }
    if (context.scope === 'team' && context.teamUserIds) {
      context.teamUserIds.filter(Boolean).forEach(id => ids.add(id));
    }
    return Array.from(ids);
  }

  private ensureTeamScope(context: UserScopeContext, targetUserId: string) {
    if (targetUserId && targetUserId !== context.userId) {
      if (context.scope !== 'team') {
        throw new Error('Insufficient permissions to modify team member records');
      }
      const allowed = this.resolveUserIds(context);
      if (!allowed.includes(targetUserId)) {
        throw new Error('Target user not within team scope');
      }
    }
  }

  private async syncContextSnapshot(snapshot: any) {
    const store = await this.getContextStore();
    if (!store) return;

    snapshot.customers?.forEach((customer: any) => store.addCustomerEngagement(customer));
    snapshot.povs?.forEach((pov: any) => store.addActivePOV(pov));
    snapshot.trrs?.forEach((trr: any) => store.addTRRRecord(trr));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }

  // Customer Management
  async getCustomers(): Promise<APIResponse<any[]>> {
    const store = await this.getContextStore();
    return {
      success: true,
      data: store?.getAllCustomerEngagements() || [],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async createCustomer(customer: any): Promise<APIResponse<any>> {
    const store = await this.getContextStore();
    const newCustomer: any = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store?.addCustomerEngagement(newCustomer);

    return {
      success: true,
      data: newCustomer,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  async updateCustomer(id: string, updates: any): Promise<APIResponse<any>> {
    const store = await this.getContextStore();
    store?.updateCustomerEngagement(id, updates);
    const updated = store?.getCustomerEngagement(id);

    return {
      success: !!updated,
      data: updated,
      error: updated ? undefined : 'Customer not found',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // POV Management
  async getPOVs(context: UserScopeContext, filters?: { customerId?: string; status?: string }): Promise<APIResponse<any[]>> {
    const firestore = await this.getFirestore();
    const store = await this.getContextStore();

    try {
      const povs: any[] = [];
      const userIds = this.resolveUserIds(context);

      if (firestore) {
        for (const userId of userIds) {
          let povQuery: any = collection(firestore, 'users', userId, 'povs');
          const constraints: QueryConstraint[] = [];

          if (filters?.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
          }
          if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
          }

          if (constraints.length > 0) {
            povQuery = query(povQuery, ...constraints);
          }

          const snapshot = await getDocs(povQuery);
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as any;
            povs.push({ ...data, id: docSnap.id, ownerId: data.ownerId || userId });
            store?.addActivePOV({ ...data, id: docSnap.id, ownerId: data.ownerId || userId });
          });
        }
      } else {
        const stored = store?.getAllActivePOVs() || [];
        const allowedIds = new Set(userIds);
        stored
          .filter((pov: any) => !pov.ownerId || allowedIds.has(pov.ownerId))
          .filter((pov: any) => {
            if (filters?.customerId && pov.customerId !== filters.customerId) return false;
            if (filters?.status && pov.status !== filters.status) return false;
            return true;
          })
          .forEach((pov: any) => povs.push(pov));
      }

      povs.sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());

      return {
        success: true,
        data: povs,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_povs`
      };
    } catch (error: any) {
      console.error('Failed to fetch POVs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch POVs',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_povs_error`
      };
    }
  }

  async createPOV(context: UserScopeContext, pov: any): Promise<APIResponse<any>> {
    try {
      const ownerId = context.targetUserId || context.userId;
      this.ensureTeamScope(context, ownerId);

      const timestamp = new Date().toISOString();
      const newPOV: any = {
        ...pov,
        ownerId,
        id: '',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const firestore = await this.getFirestore();
      const store = await this.getContextStore();

      if (firestore) {
        const docRef = await addDoc(collection(firestore, 'users', ownerId, 'povs'), {
          ...newPOV,
          id: undefined
        });
        newPOV.id = docRef.id;
      } else {
        newPOV.id = `pov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      store?.addActivePOV(newPOV);

      if (firestore && newPOV.id) {
        await updateDoc(doc(firestore, 'users', ownerId, 'povs', newPOV.id), {
          id: newPOV.id
        });
      }

      return {
        success: true,
        data: newPOV,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_create`
      };
    } catch (error: any) {
      console.error('Failed to create POV:', error);
      return {
        success: false,
        error: error.message || 'Failed to create POV',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_create_error`
      };
    }
  }

  async updatePOV(context: UserScopeContext, id: string, updates: any, ownerId?: string): Promise<APIResponse<any>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);

      const firestore = await this.getFirestore();
      const store = await this.getContextStore();
      let updated: any;

      if (firestore) {
        const docRef = doc(firestore, 'users', targetOwnerId, 'povs', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          updated = { ...(snapshot.data() as any), id: snapshot.id, ownerId: targetOwnerId };
          store?.updateActivePOV(id, updated);
        }
      } else {
        store?.updateActivePOV(id, { ...updates, ownerId: targetOwnerId });
        updated = store?.getActivePOV(id);
      }

      return {
        success: !!updated,
        data: updated,
        error: updated ? undefined : 'POV not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_update`
      };
    } catch (error: any) {
      console.error('Failed to update POV:', error);
      return {
        success: false,
        error: error.message || 'Failed to update POV',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_pov_update_error`
      };
    }
  }

  // TRR Management (similar pattern to POV)
  async getTRRs(context: UserScopeContext, filters?: any): Promise<APIResponse<any[]>> {
    const firestore = await this.getFirestore();
    const store = await this.getContextStore();

    try {
      const trrs: any[] = [];
      const userIds = this.resolveUserIds(context);

      if (firestore) {
        for (const userId of userIds) {
          let trrQuery: any = collection(firestore, 'users', userId, 'trrs');
          const constraints: QueryConstraint[] = [];

          if (filters?.customerId) constraints.push(where('customerId', '==', filters.customerId));
          if (filters?.povId) constraints.push(where('povId', '==', filters.povId));
          if (filters?.status) constraints.push(where('status', '==', filters.status));

          if (constraints.length > 0) {
            trrQuery = query(trrQuery, ...constraints);
          }

          const snapshot = await getDocs(trrQuery);
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as any;
            const record = { ...data, id: docSnap.id, ownerId: data.ownerId || userId };
            trrs.push(record);
            store?.addTRRRecord(record);
          });
        }
      } else {
        const stored = store?.getAllTRRRecords() || [];
        const allowed = new Set(userIds);
        stored
          .filter((trr: any) => !trr.ownerId || allowed.has(trr.ownerId))
          .filter((trr: any) => {
            if (filters?.customerId && trr.customerId !== filters.customerId) return false;
            if (filters?.povId && trr.povId !== filters.povId) return false;
            if (filters?.status && trr.status !== filters.status) return false;
            return true;
          })
          .forEach((trr: any) => trrs.push(trr));
      }

      trrs.sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());

      return {
        success: true,
        data: trrs,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trrs`
      };
    } catch (error: any) {
      console.error('Failed to fetch TRRs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch TRRs',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trrs_error`
      };
    }
  }

  async createTRR(context: UserScopeContext, trr: any): Promise<APIResponse<any>> {
    try {
      const ownerId = context.targetUserId || context.userId;
      this.ensureTeamScope(context, ownerId);
      const timestamp = new Date().toISOString();

      const newTRR: any = {
        ...trr,
        ownerId,
        id: '',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const firestore = await this.getFirestore();
      const store = await this.getContextStore();

      if (firestore) {
        const docRef = await addDoc(collection(firestore, 'users', ownerId, 'trrs'), {
          ...newTRR,
          id: undefined
        });
        newTRR.id = docRef.id;
      } else {
        newTRR.id = `trr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      store?.addTRRRecord(newTRR);

      if (firestore && newTRR.id) {
        await updateDoc(doc(firestore, 'users', ownerId, 'trrs', newTRR.id), {
          id: newTRR.id
        });
      }

      return {
        success: true,
        data: newTRR,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_create`
      };
    } catch (error: any) {
      console.error('Failed to create TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to create TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_create_error`
      };
    }
  }

  async updateTRR(context: UserScopeContext, id: string, updates: any, ownerId?: string): Promise<APIResponse<any>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);
      const firestore = await this.getFirestore();
      const store = await this.getContextStore();
      let updated: any;

      if (firestore) {
        const docRef = doc(firestore, 'users', targetOwnerId, 'trrs', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          updated = { ...(snapshot.data() as any), id: snapshot.id, ownerId: targetOwnerId };
          store?.updateTRRRecord(id, updated);
        }
      } else {
        store?.updateTRRRecord(id, { ...updates, ownerId: targetOwnerId });
        updated = store?.getTRRRecord(id);
      }

      return {
        success: !!updated,
        data: updated,
        error: updated ? undefined : 'TRR not found',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_update`
      };
    } catch (error: any) {
      console.error('Failed to update TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to update TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_update_error`
      };
    }
  }

  async validateTRR(context: UserScopeContext, id: string, evidence?: string[], ownerId?: string): Promise<APIResponse<any>> {
    try {
      const targetOwnerId = ownerId || context.targetUserId || context.userId;
      this.ensureTeamScope(context, targetOwnerId);
      const store = await this.getContextStore();

      let trr = store?.getTRRRecord(id);

      if (!trr) {
        const firestore = await this.getFirestore();
        if (firestore) {
          const docRef = doc(firestore, 'users', targetOwnerId, 'trrs', id);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data() as any;
            trr = { ...data, id: snapshot.id, ownerId: targetOwnerId };
            if (trr) {
              store?.addTRRRecord(trr);
            }
          }
        }
      }

      if (!trr) {
        return {
          success: false,
          error: 'TRR not found',
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_trr_validate_missing`
        };
      }

      const updates: any = {
        status: 'validated',
        timeline: {
          ...(trr.timeline || {}),
          actualValidation: new Date().toISOString()
        },
        validationEvidence: evidence || trr.validationEvidence || [],
        updatedAt: new Date().toISOString()
      };

      const updateResult = await this.updateTRR(context, id, updates, (trr as any).ownerId || targetOwnerId);

      if (!updateResult.success || !updateResult.data) {
        return updateResult;
      }

      return {
        success: true,
        data: updateResult.data,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_validate`
      };
    } catch (error: any) {
      console.error('Failed to validate TRR:', error);
      return {
        success: false,
        error: error.message || 'Failed to validate TRR',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_trr_validate_error`
      };
    }
  }

  // Metrics and Analytics
  async getMetrics(): Promise<APIResponse<DCMetrics>> {
    const store = await this.getContextStore();
    const customers = store?.getAllCustomerEngagements() || [];
    const povs = store?.getAllActivePOVs() || [];
    const trrs = store?.getAllTRRRecords() || [];

    const metrics: DCMetrics = {
      customers: {
        active: customers.length,
        total: customers.length,
        byIndustry: customers.reduce((acc: Record<string, number>, c: any) => {
          acc[c.industry] = (acc[c.industry] || 0) + 1;
          return acc;
        }, {}),
        byMaturity: customers.reduce((acc: Record<string, number>, c: any) => {
          acc[c.maturityLevel] = (acc[c.maturityLevel] || 0) + 1;
          return acc;
        }, {})
      },
      povs: {
        active: povs.filter((p: any) => p.status === 'executing').length,
        completed: povs.filter((p: any) => p.status === 'completed').length,
        successRate: povs.length > 0 ? (povs.filter((p: any) => p.status === 'completed' && p.outcomes?.technicalWins?.length > 0).length / povs.length) * 100 : 0,
        avgDuration: 30 // Mock calculation
      },
      trrs: {
        total: trrs.length,
        validated: trrs.filter((t: any) => t.status === 'validated').length,
        pending: trrs.filter((t: any) => t.status === 'pending').length,
        completionRate: trrs.length > 0 ? (trrs.filter((t: any) => t.status === 'validated').length / trrs.length) * 100 : 0
      },
      performance: {
        weeklyVelocity: Math.round(trrs.filter((t: any) => t.status === 'validated').length / 4),
        monthlyClosures: povs.filter((p: any) => p.status === 'completed').length,
        avgTimeToClose: 45
      }
    };

    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // XSIAM Health Checks
  async getXSIAMHealth(customerId?: string): Promise<APIResponse<XSIAMHealthStatus>> {
    // Mock XSIAM health data
    const healthStatus: XSIAMHealthStatus = {
      overall: 'healthy',
      components: {
        dataIngestion: 'healthy',
        correlationEngine: 'warning',
        apiGateway: 'healthy',
        dataLake: 'healthy'
      },
      metrics: {
        eventsPerSecond: 12500,
        alertsGenerated: 45,
        responseTime: 250,
        uptime: 99.9
      },
      recommendations: [
        'Consider increasing correlation engine resources',
        'Review alert tuning for reduced false positives',
        'Optimize data retention policies'
      ],
      lastChecked: new Date().toISOString()
    };

    return {
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Data Export
  async exportData(config: DataExportConfig): Promise<APIResponse<{ downloadUrl: string; expiresAt: string }>> {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      data: {
        downloadUrl: `/api/exports/${exportId}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // Knowledge Base
  async searchKnowledgeBase(query: string, category?: string): Promise<APIResponse<KnowledgeBaseEntry[]>> {
    const mockEntries: KnowledgeBaseEntry[] = [
      {
        id: 'kb_001',
        title: 'TRR Validation Best Practices',
        content: 'Comprehensive guide to technical risk review validation processes...',
        category: 'best-practice',
        tags: ['trr', 'validation', 'best-practices'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Team',
        searchable: true
      },
      {
        id: 'kb_002',
        title: 'POV Scenario Planning Framework',
        content: 'Step-by-step framework for effective POV scenario planning...',
        category: 'workflow',
        tags: ['pov', 'scenarios', 'planning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'DC Team',
        searchable: true
      }
    ];

    const filtered = category
      ? mockEntries.filter(e => e.category === category)
      : mockEntries;

    return {
      success: true,
      data: filtered,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }

  // AI Integration
  async getAIRecommendations(context: any): Promise<APIResponse<string[]>> {
    try {
      const aiClient = await this.getAIClient();
      if (!aiClient) {
        return {
          success: false,
          error: 'AI client unavailable',
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_local`
        };
      }

      const recommendations = await aiClient.getWorkflowGuidance('Generate recommendations', context);
      return {
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI recommendation failed',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_local`
      };
    }
  }

  // Workflow History
  async getWorkflowHistory(filters?: { customerId?: string; workflowType?: string }): Promise<APIResponse<any[]>> {
    const store = await this.getContextStore();
    let history = store?.getWorkflowHistory() || [];

    if (filters) {
      if (filters.customerId) {
        history = history.filter((h: any) => h.context.includes(filters.customerId!));
      }
      if (filters.workflowType) {
        history = history.filter((h: any) => h.action.toLowerCase().includes(filters.workflowType!.toLowerCase()));
      }
    }

    return {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_local`
    };
  }
}

// Export singleton instance
export const dcAPIClient = new DCAPIClient();

// Utility functions for common operations
export const DCOperations = {
  async initializeCustomerPOV(context: UserScopeContext, customerData: any) {
    const customerResponse = await dcAPIClient.createCustomer(customerData);
    if (!customerResponse.success || !customerResponse.data) {
      throw new Error(customerResponse.error || 'Failed to create customer');
    }

    const povData: any = {
      customerId: customerResponse.data.id,
      name: `${customerData.name} Security POV`,
      status: 'planning',
      objectives: customerData.primaryConcerns?.map((concern: string) => `Address ${concern} requirements`) || [],
      scenarios: [],
      timeline: {
        planned: new Date().toISOString(),
        actual: undefined,
        milestones: []
      },
      successMetrics: [],
      resources: {
        dcHours: 40,
        seHours: 20,
        infrastructure: []
      },
      outcomes: {
        technicalWins: [],
        businessImpact: [],
        lessonsLearned: []
      },
      nextSteps: []
    };

    const povResponse = await dcAPIClient.createPOV(context, povData);
    if (!povResponse.success) {
      throw new Error(povResponse.error || 'Failed to create POV');
    }

    return {
      customer: customerResponse.data,
      pov: povResponse.data!
    };
  },

  async generateTRRSet(context: UserScopeContext, customerId: string, povId: string, scenarios: string[]) {
    const trrPromises = scenarios.map(async (scenario, index) => {
      const trrData: any = {
        customerId,
        povId,
        title: `${scenario} Validation`,
        category: 'Technical Validation',
        priority: index === 0 ? 'high' : 'medium',
        status: 'pending',
        description: `Technical requirements validation for ${scenario}`,
        acceptanceCriteria: [`Validate ${scenario}`, 'Document findings', 'Obtain stakeholder approval'],
        validationMethod: 'Technical review and testing',
        validationEvidence: [],
        assignedTo: 'Domain Consultant',
        reviewers: ['Technical Lead'],
        timeline: {
          created: new Date().toISOString(),
          targetValidation: new Date(Date.now() + (7 + index * 3) * 24 * 60 * 60 * 1000).toISOString(),
          actualValidation: undefined
        },
        dependencies: [],
        riskLevel: 'low',
        businessImpact: 'Validates technical capability',
        customerStakeholder: 'Technical Team',
        notes: []
      };

      return dcAPIClient.createTRR(context, trrData);
    });

    const results = await Promise.all(trrPromises);
    return results.map(r => r.data).filter(Boolean);
  }
};
