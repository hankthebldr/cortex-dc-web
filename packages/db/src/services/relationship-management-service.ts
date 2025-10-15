/**
 * Relationship Management Service
 * Manages relationships between TRRs, POVs, Projects, and Demo Scenarios
 * Ensures referential integrity and proper lifecycle management
 */

import { getDatabase } from '../adapters/database.factory';
import type { POV, TRR, Project } from '../types/projects';

export interface RelationshipValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RelationshipGraph {
  projectId: string;
  povs: POV[];
  trrs: TRR[];
  scenarios: any[];
  relationships: {
    povToTRR: Record<string, string[]>; // povId -> trrIds
    povToScenario: Record<string, string[]>; // povId -> scenarioIds
    trrToPOV: Record<string, string>; // trrId -> povId
    scenarioToPOV: Record<string, string>; // scenarioId -> povId
  };
}

export class RelationshipManagementService {
  /**
   * Associate a TRR with a POV
   */
  async associateTRRWithPOV(trrId: string, povId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();

    try {
      // Validate TRR exists
      const trr = await db.findOne('trrs', trrId);
      if (!trr) {
        return { success: false, error: 'TRR not found' };
      }

      // Validate POV exists
      const pov = await db.findOne('povs', povId);
      if (!pov) {
        return { success: false, error: 'POV not found' };
      }

      // Validate they belong to the same project
      if ((trr as any).projectId !== (pov as any).projectId) {
        return { success: false, error: 'TRR and POV must belong to the same project' };
      }

      // Update TRR with POV reference
      await db.update('trrs', trrId, {
        povId,
        lastModifiedBy: 'system', // TODO: Use actual user ID
        updatedAt: new Date(),
      });

      // Log the relationship
      await this.logRelationshipChange('trr_pov_association', {
        trrId,
        povId,
        projectId: (trr as any).projectId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error associating TRR with POV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Association failed',
      };
    }
  }

  /**
   * Associate a POV with a Demo Scenario
   */
  async associatePOVWithScenario(povId: string, scenarioId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();

    try {
      // Validate POV exists
      const pov = await db.findOne('povs', povId);
      if (!pov) {
        return { success: false, error: 'POV not found' };
      }

      // Validate Scenario exists
      const scenario = await db.findOne('scenarios', scenarioId);
      if (!scenario) {
        return { success: false, error: 'Scenario not found' };
      }

      // Update POV test plan to include scenario
      const testPlan = (pov as any).testPlan || { scenarios: [] };
      if (!testPlan.scenarios.includes(scenarioId)) {
        testPlan.scenarios.push(scenarioId);
      }

      await db.update('povs', povId, {
        testPlan,
        lastModifiedBy: 'system', // TODO: Use actual user ID
        updatedAt: new Date(),
      });

      // Update Scenario to reference POV
      await db.update('scenarios', scenarioId, {
        povId,
        updatedAt: new Date(),
      });

      // Log the relationship
      await this.logRelationshipChange('pov_scenario_association', {
        povId,
        scenarioId,
        projectId: (pov as any).projectId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error associating POV with Scenario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Association failed',
      };
    }
  }

  /**
   * Associate POV with Project
   */
  async associatePOVWithProject(povId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();

    try {
      // Validate POV exists
      const pov = await db.findOne('povs', povId);
      if (!pov) {
        return { success: false, error: 'POV not found' };
      }

      // Validate Project exists
      const project = await db.findOne('projects', projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Update POV with project reference
      await db.update('povs', povId, {
        projectId,
        lastModifiedBy: 'system', // TODO: Use actual user ID
        updatedAt: new Date(),
      });

      // Update Project to include POV in povIds array
      const povIds = (project as any).povIds || [];
      if (!povIds.includes(povId)) {
        povIds.push(povId);
        await db.update('projects', projectId, {
          povIds,
          lastModifiedBy: 'system', // TODO: Use actual user ID
          updatedAt: new Date(),
        });
      }

      // Log the relationship
      await this.logRelationshipChange('pov_project_association', {
        povId,
        projectId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error associating POV with Project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Association failed',
      };
    }
  }

  /**
   * Associate TRR with Project
   */
  async associateTRRWithProject(trrId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();

    try {
      // Validate TRR exists
      const trr = await db.findOne('trrs', trrId);
      if (!trr) {
        return { success: false, error: 'TRR not found' };
      }

      // Validate Project exists
      const project = await db.findOne('projects', projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Update TRR with project reference
      await db.update('trrs', trrId, {
        projectId,
        lastModifiedBy: 'system', // TODO: Use actual user ID
        updatedAt: new Date(),
      });

      // Update Project to include TRR in trrIds array
      const trrIds = (project as any).trrIds || [];
      if (!trrIds.includes(trrId)) {
        trrIds.push(trrId);
        await db.update('projects', projectId, {
          trrIds,
          lastModifiedBy: 'system', // TODO: Use actual user ID
          updatedAt: new Date(),
        });
      }

      // Log the relationship
      await this.logRelationshipChange('trr_project_association', {
        trrId,
        projectId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error associating TRR with Project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Association failed',
      };
    }
  }

  /**
   * Get relationship graph for a project
   */
  async getProjectRelationshipGraph(projectId: string): Promise<RelationshipGraph | null> {
    const db = getDatabase();

    try {
      // Get project
      const project = await db.findOne('projects', projectId);
      if (!project) {
        return null;
      }

      // Get all POVs for this project
      const povs = await db.findMany('povs', {
        filters: [{ field: 'projectId', operator: '==', value: projectId }],
      });

      // Get all TRRs for this project
      const trrs = await db.findMany('trrs', {
        filters: [{ field: 'projectId', operator: '==', value: projectId }],
      });

      // Get all scenarios
      const scenarios = await db.findMany('scenarios', {
        filters: [{ field: 'projectId', operator: '==', value: projectId }],
      });

      // Build relationship mappings
      const povToTRR: Record<string, string[]> = {};
      const povToScenario: Record<string, string[]> = {};
      const trrToPOV: Record<string, string> = {};
      const scenarioToPOV: Record<string, string> = {};

      // Map TRRs to POVs
      trrs.forEach((trr: any) => {
        if (trr.povId) {
          trrToPOV[trr.id] = trr.povId;

          if (!povToTRR[trr.povId]) {
            povToTRR[trr.povId] = [];
          }
          povToTRR[trr.povId].push(trr.id);
        }
      });

      // Map Scenarios to POVs
      povs.forEach((pov: any) => {
        if (pov.testPlan?.scenarios) {
          povToScenario[pov.id] = pov.testPlan.scenarios;

          pov.testPlan.scenarios.forEach((scenarioId: string) => {
            scenarioToPOV[scenarioId] = pov.id;
          });
        }
      });

      return {
        projectId,
        povs: povs as any[],
        trrs: trrs as any[],
        scenarios,
        relationships: {
          povToTRR,
          povToScenario,
          trrToPOV,
          scenarioToPOV,
        },
      };
    } catch (error) {
      console.error('Error getting relationship graph:', error);
      return null;
    }
  }

  /**
   * Validate relationships for integrity
   */
  async validateRelationships(projectId: string): Promise<RelationshipValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const graph = await this.getProjectRelationshipGraph(projectId);
      if (!graph) {
        errors.push('Project not found');
        return { valid: false, errors, warnings };
      }

      // Check for orphaned TRRs (TRRs without POV)
      graph.trrs.forEach((trr: any) => {
        if (!trr.povId) {
          warnings.push(`TRR "${trr.title}" (${trr.id}) is not associated with any POV`);
        } else if (!graph.povs.find((pov: any) => pov.id === trr.povId)) {
          errors.push(`TRR "${trr.title}" (${trr.id}) references non-existent POV ${trr.povId}`);
        }
      });

      // Check for orphaned Scenarios
      graph.scenarios.forEach((scenario: any) => {
        if (!scenario.povId) {
          warnings.push(`Scenario "${scenario.title}" (${scenario.id}) is not associated with any POV`);
        } else if (!graph.povs.find((pov: any) => pov.id === scenario.povId)) {
          errors.push(`Scenario "${scenario.title}" (${scenario.id}) references non-existent POV ${scenario.povId}`);
        }
      });

      // Check for invalid scenario references in POVs
      graph.povs.forEach((pov: any) => {
        if (pov.testPlan?.scenarios) {
          pov.testPlan.scenarios.forEach((scenarioId: string) => {
            if (!graph.scenarios.find((s: any) => s.id === scenarioId)) {
              errors.push(`POV "${pov.title}" (${pov.id}) references non-existent scenario ${scenarioId}`);
            }
          });
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Validation failed');
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Automatically fix broken relationships
   */
  async repairRelationships(projectId: string): Promise<{ fixed: number; errors: string[] }> {
    const db = getDatabase();
    let fixed = 0;
    const errors: string[] = [];

    try {
      const graph = await this.getProjectRelationshipGraph(projectId);
      if (!graph) {
        errors.push('Project not found');
        return { fixed, errors };
      }

      // Remove invalid TRR->POV references
      for (const trr of graph.trrs) {
        if (trr.povId && !graph.povs.find((pov: any) => pov.id === trr.povId)) {
          await db.update('trrs', trr.id, {
            povId: null,
            updatedAt: new Date(),
          });
          fixed++;
        }
      }

      // Remove invalid Scenario->POV references
      for (const scenario of graph.scenarios) {
        if (scenario.povId && !graph.povs.find((pov: any) => pov.id === scenario.povId)) {
          await db.update('scenarios', scenario.id, {
            povId: null,
            updatedAt: new Date(),
          });
          fixed++;
        }
      }

      // Clean up invalid scenario references in POVs
      for (const pov of graph.povs) {
        if (pov.testPlan?.scenarios) {
          const validScenarios = pov.testPlan.scenarios.filter((scenarioId: string) =>
            graph.scenarios.find((s: any) => s.id === scenarioId)
          );

          if (validScenarios.length !== pov.testPlan.scenarios.length) {
            await db.update('povs', pov.id, {
              testPlan: {
                ...pov.testPlan,
                scenarios: validScenarios,
              },
              updatedAt: new Date(),
            });
            fixed++;
          }
        }
      }

      return { fixed, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Repair failed');
      return { fixed, errors };
    }
  }

  /**
   * Log relationship changes for audit
   */
  private async logRelationshipChange(type: string, metadata: any): Promise<void> {
    const db = getDatabase();

    try {
      await db.create('relationshipLogs', {
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        metadata,
        timestamp: new Date(),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error logging relationship change:', error);
    }
  }

  /**
   * Get POVs for a TRR
   */
  async getPOVForTRR(trrId: string): Promise<POV | null> {
    const db = getDatabase();

    try {
      const trr = await db.findOne('trrs', trrId);
      if (!trr || !(trr as any).povId) {
        return null;
      }

      return await db.findOne('povs', (trr as any).povId);
    } catch (error) {
      console.error('Error getting POV for TRR:', error);
      return null;
    }
  }

  /**
   * Get TRRs for a POV
   */
  async getTRRsForPOV(povId: string): Promise<TRR[]> {
    const db = getDatabase();

    try {
      return await db.findMany('trrs', {
        filters: [{ field: 'povId', operator: '==', value: povId }],
      });
    } catch (error) {
      console.error('Error getting TRRs for POV:', error);
      return [];
    }
  }

  /**
   * Get Scenarios for a POV
   */
  async getScenariosForPOV(povId: string): Promise<any[]> {
    const db = getDatabase();

    try {
      const pov = await db.findOne('povs', povId);
      if (!pov || !(pov as any).testPlan?.scenarios) {
        return [];
      }

      const scenarios = await Promise.all(
        (pov as any).testPlan.scenarios.map((scenarioId: string) =>
          db.findOne('scenarios', scenarioId)
        )
      );

      return scenarios.filter((s: any) => s !== null);
    } catch (error) {
      console.error('Error getting Scenarios for POV:', error);
      return [];
    }
  }
}

// Export singleton instance
export const relationshipManagementService = new RelationshipManagementService();
export default relationshipManagementService;
