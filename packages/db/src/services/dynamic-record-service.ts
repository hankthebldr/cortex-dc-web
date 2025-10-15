/**
 * Dynamic Record Population Service
 * Automatically creates and populates records as user flows progress
 * Handles lifecycle management for POVs, TRRs, Projects, and Scenarios
 */

import { getDatabase } from '../adapters/database.factory';
import { relationshipManagementService } from './relationship-management-service';
import type { POV, TRR, Project } from '../types/projects';

export interface RecordCreationOptions {
  autoPopulateDefaults?: boolean;
  createRelationships?: boolean;
  userId?: string;
}

export interface LifecycleTransition {
  recordId: string;
  recordType: 'pov' | 'trr' | 'project' | 'scenario';
  from: string;
  to: string;
  triggeredBy: string;
  timestamp: Date;
  metadata?: any;
}

export class DynamicRecordService {
  /**
   * Create a new POV with defaults and relationships
   */
  async createPOV(
    data: Partial<POV>,
    projectId: string,
    options: RecordCreationOptions = {}
  ): Promise<{ success: boolean; povId?: string; error?: string }> {
    const db = getDatabase();
    const userId = options.userId || 'system';

    try {
      // Validate project exists
      const project = await db.findOne('projects', projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Generate ID
      const povId = data.id || `pov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Build POV with defaults
      const povData: any = {
        id: povId,
        projectId,
        title: data.title || 'New POV',
        description: data.description || '',
        status: data.status || 'planning',
        priority: data.priority || 'medium',
        objectives: data.objectives || [],
        testPlan: data.testPlan || {
          scenarios: [],
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            milestones: [],
          },
          resources: [],
        },
        successMetrics: data.successMetrics || {},
        phases: data.phases || [
          {
            id: 'phase-1',
            name: 'Planning',
            description: 'Initial planning and scoping',
            startDate: new Date(),
            status: 'in_progress',
            tasks: [],
          },
          {
            id: 'phase-2',
            name: 'Execution',
            description: 'Execute POV plan',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'todo',
            tasks: [],
          },
          {
            id: 'phase-3',
            name: 'Validation',
            description: 'Validate results',
            startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            status: 'todo',
            tasks: [],
          },
        ],
        owner: data.owner || userId,
        team: data.team || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        lastModifiedBy: userId,
      };

      // Create POV
      await db.create('povs', povData);

      // Create relationship with project
      if (options.createRelationships !== false) {
        await relationshipManagementService.associatePOVWithProject(povId, projectId);
      }

      // Log creation
      await this.logLifecycleEvent({
        recordId: povId,
        recordType: 'pov',
        from: 'none',
        to: 'planning',
        triggeredBy: userId,
        timestamp: new Date(),
        metadata: { projectId, title: povData.title },
      });

      // Create initial activity log
      await this.logActivity({
        userId,
        action: 'create',
        entityType: 'pov',
        entityId: povId,
        entityTitle: povData.title,
        details: { projectId },
      });

      return { success: true, povId };
    } catch (error) {
      console.error('Error creating POV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create POV',
      };
    }
  }

  /**
   * Create a new TRR with defaults and relationships
   */
  async createTRR(
    data: Partial<TRR>,
    projectId: string,
    povId?: string,
    options: RecordCreationOptions = {}
  ): Promise<{ success: boolean; trrId?: string; error?: string }> {
    const db = getDatabase();
    const userId = options.userId || 'system';

    try {
      // Validate project exists
      const project = await db.findOne('projects', projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Validate POV if provided
      if (povId) {
        const pov = await db.findOne('povs', povId);
        if (!pov) {
          return { success: false, error: 'POV not found' };
        }
        if ((pov as any).projectId !== projectId) {
          return { success: false, error: 'POV and Project mismatch' };
        }
      }

      // Generate ID
      const trrId = data.id || `trr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Build TRR with defaults
      const trrData: any = {
        id: trrId,
        projectId,
        povId: povId || null,
        title: data.title || 'New Technical Risk Review',
        description: data.description || '',
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        riskAssessment: data.riskAssessment || {
          overall_score: 5,
          categories: [
            {
              category: 'Technical Feasibility',
              score: 5,
              description: 'Pending assessment',
              mitigation: '',
              evidence: [],
            },
            {
              category: 'Security',
              score: 5,
              description: 'Pending assessment',
              mitigation: '',
              evidence: [],
            },
            {
              category: 'Performance',
              score: 5,
              description: 'Pending assessment',
              mitigation: '',
              evidence: [],
            },
            {
              category: 'Scalability',
              score: 5,
              description: 'Pending assessment',
              mitigation: '',
              evidence: [],
            },
          ],
        },
        findings: data.findings || [],
        validation: data.validation || {},
        signoff: data.signoff || {},
        owner: data.owner || userId,
        reviewers: data.reviewers || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        lastModifiedBy: userId,
      };

      // Create TRR
      await db.create('trrs', trrData);

      // Create relationships
      if (options.createRelationships !== false) {
        await relationshipManagementService.associateTRRWithProject(trrId, projectId);
        if (povId) {
          await relationshipManagementService.associateTRRWithPOV(trrId, povId);
        }
      }

      // Log creation
      await this.logLifecycleEvent({
        recordId: trrId,
        recordType: 'trr',
        from: 'none',
        to: 'draft',
        triggeredBy: userId,
        timestamp: new Date(),
        metadata: { projectId, povId, title: trrData.title },
      });

      // Create initial activity log
      await this.logActivity({
        userId,
        action: 'create',
        entityType: 'trr',
        entityId: trrId,
        entityTitle: trrData.title,
        details: { projectId, povId },
      });

      return { success: true, trrId };
    } catch (error) {
      console.error('Error creating TRR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create TRR',
      };
    }
  }

  /**
   * Create a new Demo Scenario
   */
  async createScenario(
    data: any,
    povId?: string,
    options: RecordCreationOptions = {}
  ): Promise<{ success: boolean; scenarioId?: string; error?: string }> {
    const db = getDatabase();
    const userId = options.userId || 'system';

    try {
      // Validate POV if provided
      let projectId = data.projectId;
      if (povId) {
        const pov = await db.findOne('povs', povId);
        if (!pov) {
          return { success: false, error: 'POV not found' };
        }
        projectId = (pov as any).projectId;
      }

      // Generate ID
      const scenarioId = data.id || `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Build Scenario with defaults
      const scenarioData: any = {
        id: scenarioId,
        projectId,
        povId: povId || null,
        title: data.title || 'New Demo Scenario',
        description: data.description || '',
        type: data.type || 'demo',
        status: data.status || 'draft',
        steps: data.steps || [],
        expectedOutcomes: data.expectedOutcomes || [],
        actualOutcomes: data.actualOutcomes || [],
        testData: data.testData || {},
        environment: data.environment || 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        lastModifiedBy: userId,
      };

      // Create Scenario
      await db.create('scenarios', scenarioData);

      // Create relationship with POV
      if (povId && options.createRelationships !== false) {
        await relationshipManagementService.associatePOVWithScenario(povId, scenarioId);
      }

      // Log creation
      await this.logActivity({
        userId,
        action: 'create',
        entityType: 'scenario',
        entityId: scenarioId,
        entityTitle: scenarioData.title,
        details: { projectId, povId },
      });

      return { success: true, scenarioId };
    } catch (error) {
      console.error('Error creating Scenario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Scenario',
      };
    }
  }

  /**
   * Transition POV to next phase
   */
  async transitionPOVPhase(
    povId: string,
    userId: string
  ): Promise<{ success: boolean; nextPhase?: string; error?: string }> {
    const db = getDatabase();

    try {
      const pov = await db.findOne('povs', povId);
      if (!pov) {
        return { success: false, error: 'POV not found' };
      }

      const povData = pov as any;

      // Find current phase
      const currentPhaseIndex = povData.phases.findIndex((p: any) => p.status === 'in_progress');
      if (currentPhaseIndex === -1) {
        return { success: false, error: 'No active phase found' };
      }

      const currentPhase = povData.phases[currentPhaseIndex];

      // Complete current phase
      povData.phases[currentPhaseIndex].status = 'done';
      povData.phases[currentPhaseIndex].endDate = new Date();

      // Start next phase if available
      if (currentPhaseIndex < povData.phases.length - 1) {
        povData.phases[currentPhaseIndex + 1].status = 'in_progress';
        povData.phases[currentPhaseIndex + 1].startDate = new Date();
      } else {
        // All phases complete - update POV status
        povData.status = 'completed';
      }

      // Update POV
      await db.update('povs', povId, {
        phases: povData.phases,
        status: povData.status,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      // Log transition
      await this.logLifecycleEvent({
        recordId: povId,
        recordType: 'pov',
        from: currentPhase.name,
        to: povData.phases[currentPhaseIndex + 1]?.name || 'completed',
        triggeredBy: userId,
        timestamp: new Date(),
        metadata: { phaseIndex: currentPhaseIndex + 1 },
      });

      // Log activity
      await this.logActivity({
        userId,
        action: 'phase_transition',
        entityType: 'pov',
        entityId: povId,
        entityTitle: povData.title,
        details: {
          from: currentPhase.name,
          to: povData.phases[currentPhaseIndex + 1]?.name || 'completed',
        },
      });

      return {
        success: true,
        nextPhase: povData.phases[currentPhaseIndex + 1]?.name || 'completed',
      };
    } catch (error) {
      console.error('Error transitioning POV phase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Phase transition failed',
      };
    }
  }

  /**
   * Transition TRR through workflow
   */
  async transitionTRRStatus(
    trrId: string,
    newStatus: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();

    try {
      const trr = await db.findOne('trrs', trrId);
      if (!trr) {
        return { success: false, error: 'TRR not found' };
      }

      const trrData = trr as any;
      const oldStatus = trrData.status;

      // Update TRR status
      await db.update('trrs', trrId, {
        status: newStatus,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      // Log transition
      await this.logLifecycleEvent({
        recordId: trrId,
        recordType: 'trr',
        from: oldStatus,
        to: newStatus,
        triggeredBy: userId,
        timestamp: new Date(),
      });

      // Log activity
      await this.logActivity({
        userId,
        action: 'status_change',
        entityType: 'trr',
        entityId: trrId,
        entityTitle: trrData.title,
        details: {
          from: oldStatus,
          to: newStatus,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error transitioning TRR status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status transition failed',
      };
    }
  }

  /**
   * Log lifecycle event
   */
  private async logLifecycleEvent(event: LifecycleTransition): Promise<void> {
    const db = getDatabase();

    try {
      await db.create('lifecycleEvents', {
        id: `lifecycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...event,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging lifecycle event:', error);
    }
  }

  /**
   * Log user activity
   */
  private async logActivity(activity: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    entityTitle: string;
    details?: any;
  }): Promise<void> {
    const db = getDatabase();

    try {
      await db.create('activityLogs', {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...activity,
        timestamp: new Date(),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Auto-populate related records when creating a POV
   */
  async autoPopulatePOVRecords(
    povId: string,
    userId: string
  ): Promise<{ created: string[]; errors: string[] }> {
    const created: string[] = [];
    const errors: string[] = [];

    try {
      const pov = await this.getDatabase().findOne('povs', povId);
      if (!pov) {
        errors.push('POV not found');
        return { created, errors };
      }

      const povData = pov as any;

      // Create default TRR for this POV
      const trrResult = await this.createTRR(
        {
          title: `TRR for ${povData.title}`,
          description: `Technical Risk Review for POV: ${povData.title}`,
        },
        povData.projectId,
        povId,
        { userId, createRelationships: true }
      );

      if (trrResult.success && trrResult.trrId) {
        created.push(`TRR: ${trrResult.trrId}`);
      } else if (trrResult.error) {
        errors.push(`TRR creation failed: ${trrResult.error}`);
      }

      // Create default demo scenario
      const scenarioResult = await this.createScenario(
        {
          title: `Demo Scenario for ${povData.title}`,
          description: `Demo scenario for POV: ${povData.title}`,
          type: 'demo',
        },
        povId,
        { userId, createRelationships: true }
      );

      if (scenarioResult.success && scenarioResult.scenarioId) {
        created.push(`Scenario: ${scenarioResult.scenarioId}`);
      } else if (scenarioResult.error) {
        errors.push(`Scenario creation failed: ${scenarioResult.error}`);
      }

      return { created, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Auto-population failed');
      return { created, errors };
    }
  }

  private getDatabase() {
    return getDatabase();
  }
}

// Export singleton instance
export const dynamicRecordService = new DynamicRecordService();
export default dynamicRecordService;
