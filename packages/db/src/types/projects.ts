import { z } from 'zod';

/**
 * Project Management Schema
 * Core backbone for Domain Consultant engagement tracking
 */

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum POVStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  AT_RISK = 'at_risk',
  CANCELLED = 'cancelled'
}

export enum TRRStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  BLOCKED = 'blocked'
}

/**
 * Base Project Schema
 * Central entity that ties together POVs, TRRs, and other activities
 */
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  customer: z.object({
    name: z.string(),
    industry: z.string().optional(),
    size: z.enum(['startup', 'small', 'medium', 'enterprise']).optional(),
    region: z.string().optional(),
    contact: z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.string().optional(),
      phone: z.string().optional()
    }).optional()
  }),
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(Priority),
  owner: z.string(), // uid of project owner
  team: z.array(z.string()), // array of user uids
  startDate: z.date(),
  endDate: z.date().optional(),
  estimatedValue: z.number().optional(),
  actualValue: z.number().optional(),
  tags: z.array(z.string()).default([]),
  // Relations to other entities
  povIds: z.array(z.string()).default([]),
  trrIds: z.array(z.string()).default([]),
  scenarioIds: z.array(z.string()).default([]),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * POV (Proof of Value) Schema
 */
export const POVSchema = z.object({
  id: z.string(),
  projectId: z.string(), // reference to parent project
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(POVStatus),
  priority: z.nativeEnum(Priority),
  // POV Specific Fields
  objectives: z.array(z.object({
    id: z.string(),
    description: z.string(),
    success_criteria: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
    weight: z.number().min(0).max(100).default(100) // percentage weight
  })).default([]),
  testPlan: z.object({
    scenarios: z.array(z.string()), // scenario IDs
    environment: z.string().optional(),
    timeline: z.object({
      start: z.date(),
      end: z.date(),
      milestones: z.array(z.object({
        id: z.string(),
        title: z.string(),
        date: z.date(),
        status: z.enum(['upcoming', 'in_progress', 'completed', 'overdue'])
      }))
    }),
    resources: z.array(z.object({
      type: z.enum(['personnel', 'equipment', 'software', 'budget']),
      description: z.string(),
      quantity: z.number().optional(),
      cost: z.number().optional()
    })).default([])
  }).optional(),
  // Success Metrics
  successMetrics: z.object({
    businessValue: z.object({
      roi: z.number().optional(),
      costSavings: z.number().optional(),
      riskReduction: z.string().optional(),
      efficiency_gains: z.string().optional()
    }).optional(),
    technicalMetrics: z.object({
      performance: z.record(z.number()).optional(),
      reliability: z.number().optional(), // percentage
      security_score: z.number().optional()
    }).optional()
  }).default({}),
  // Timeline tracking
  phases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    status: z.nativeEnum(TaskStatus),
    tasks: z.array(z.string()).default([]) // task IDs
  })).default([]),
  // Assignment
  owner: z.string(), // uid of POV owner
  team: z.array(z.string()).default([]),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

export type POV = z.infer<typeof POVSchema>;

/**
 * TRR (Technical Risk Review) Schema
 */
export const TRRSchema = z.object({
  id: z.string(),
  projectId: z.string(), // reference to parent project
  povId: z.string().optional(), // optional reference to related POV
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(TRRStatus),
  priority: z.nativeEnum(Priority),
  // TRR Specific Fields
  riskAssessment: z.object({
    overall_score: z.number().min(0).max(10),
    categories: z.array(z.object({
      category: z.string(),
      score: z.number().min(0).max(10),
      description: z.string(),
      mitigation: z.string().optional(),
      evidence: z.array(z.string()).default([]) // file URLs or references
    }))
  }),
  findings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    category: z.string(),
    evidence: z.array(z.object({
      type: z.enum(['screenshot', 'log', 'document', 'test_result']),
      url: z.string(),
      description: z.string().optional()
    })).default([]),
    recommendation: z.string().optional(),
    status: z.enum(['open', 'addressed', 'accepted_risk', 'false_positive'])
  })).default([]),
  // Validation and Approval
  validation: z.object({
    validator: z.string().optional(), // uid of validator
    validatedAt: z.date().optional(),
    validationNotes: z.string().optional(),
    approved: z.boolean().optional()
  }).optional(),
  signoff: z.object({
    approver: z.string().optional(), // uid of approver
    approvedAt: z.date().optional(),
    signoffNotes: z.string().optional(),
    digitalSignature: z.string().optional()
  }).optional(),
  // Assignment
  owner: z.string(), // uid of TRR owner
  reviewers: z.array(z.string()).default([]),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

export type TRR = z.infer<typeof TRRSchema>;

/**
 * Task Schema
 * Granular tasks within projects, POVs, or TRRs
 */
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(Priority),
  // Relations
  projectId: z.string().optional(),
  povId: z.string().optional(),
  trrId: z.string().optional(),
  parentTaskId: z.string().optional(),
  dependencies: z.array(z.string()).default([]), // task IDs this task depends on
  // Assignment and timing
  assignee: z.string().optional(), // uid of assignee
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  // Task details
  labels: z.array(z.string()).default([]),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean().default(false)
  })).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number().optional()
  })).default([]),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Note Schema
 * Notes and documentation attached to any entity
 */
export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  type: z.enum(['note', 'meeting', 'decision', 'action_item', 'issue']).default('note'),
  // Relations - at least one must be specified
  projectId: z.string().optional(),
  povId: z.string().optional(),
  trrId: z.string().optional(),
  taskId: z.string().optional(),
  // Classification
  tags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  // Rich content
  mentions: z.array(z.string()).default([]), // user IDs mentioned in note
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).default([]),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

export type Note = z.infer<typeof NoteSchema>;

/**
 * Timeline Event Schema
 * Tracks all significant events across projects
 */
export const TimelineEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'project_created', 'project_updated', 'project_completed',
    'pov_created', 'pov_phase_completed', 'pov_completed',
    'trr_created', 'trr_submitted', 'trr_approved',
    'task_created', 'task_completed', 'milestone_reached',
    'note_added', 'team_member_added', 'status_changed'
  ]),
  title: z.string(),
  description: z.string().optional(),
  // Relations
  projectId: z.string().optional(),
  povId: z.string().optional(),
  trrId: z.string().optional(),
  taskId: z.string().optional(),
  // Event details
  actor: z.string(), // uid of user who triggered the event
  metadata: z.record(z.unknown()).optional(), // additional event data
  // Timing
  timestamp: z.date(),
  createdAt: z.date()
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

/**
 * Utility functions for project management
 */
export const calculatePOVProgress = (pov: POV): number => {
  if (pov.phases.length === 0) return 0;
  
  const completedPhases = pov.phases.filter(phase => phase.status === TaskStatus.DONE).length;
  return Math.round((completedPhases / pov.phases.length) * 100);
};

export const calculateProjectHealth = (project: Project, povs: POV[], trrs: TRR[]): {
  health: 'good' | 'warning' | 'at_risk';
  score: number;
  factors: string[];
} => {
  let score = 100;
  const factors: string[] = [];

  // Check if project is overdue
  if (project.endDate && project.endDate < new Date() && project.status !== ProjectStatus.COMPLETED) {
    score -= 30;
    factors.push('Project overdue');
  }

  // Check POV status
  const atRiskPOVs = povs.filter(pov => pov.status === POVStatus.AT_RISK);
  if (atRiskPOVs.length > 0) {
    score -= 20 * atRiskPOVs.length;
    factors.push(`${atRiskPOVs.length} POV(s) at risk`);
  }

  // Check TRR findings
  const highSeverityFindings = trrs.flatMap(trr => 
    trr.findings.filter(finding => finding.severity === 'high' || finding.severity === 'critical')
  );
  if (highSeverityFindings.length > 0) {
    score -= 15 * highSeverityFindings.length;
    factors.push(`${highSeverityFindings.length} high severity finding(s)`);
  }

  score = Math.max(0, Math.min(100, score));

  let health: 'good' | 'warning' | 'at_risk';
  if (score >= 80) health = 'good';
  else if (score >= 60) health = 'warning';
  else health = 'at_risk';

  return { health, score, factors };
};

export const getProjectTimeline = (
  project: Project,
  povs: POV[],
  trrs: TRR[],
  tasks: Task[]
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Add project milestones
  events.push({
    id: `${project.id}-created`,
    type: 'project_created',
    title: 'Project Created',
    projectId: project.id,
    actor: project.createdBy,
    timestamp: project.createdAt,
    createdAt: project.createdAt
  });

  // Add POV milestones
  povs.forEach(pov => {
    events.push({
      id: `${pov.id}-created`,
      type: 'pov_created',
      title: `POV Created: ${pov.title}`,
      projectId: project.id,
      povId: pov.id,
      actor: pov.createdBy,
      timestamp: pov.createdAt,
      createdAt: pov.createdAt
    });

    // Add phase completions
    pov.phases
      .filter(phase => phase.status === TaskStatus.DONE)
      .forEach(phase => {
        if (phase.endDate) {
          events.push({
            id: `${pov.id}-phase-${phase.id}`,
            type: 'pov_phase_completed',
            title: `POV Phase Completed: ${phase.name}`,
            projectId: project.id,
            povId: pov.id,
            actor: pov.lastModifiedBy,
            timestamp: phase.endDate,
            createdAt: phase.endDate
          });
        }
      });
  });

  // Add TRR milestones
  trrs.forEach(trr => {
    events.push({
      id: `${trr.id}-created`,
      type: 'trr_created',
      title: `TRR Created: ${trr.title}`,
      projectId: project.id,
      trrId: trr.id,
      actor: trr.createdBy,
      timestamp: trr.createdAt,
      createdAt: trr.createdAt
    });

    if (trr.signoff?.approvedAt) {
      events.push({
        id: `${trr.id}-approved`,
        type: 'trr_approved',
        title: `TRR Approved: ${trr.title}`,
        projectId: project.id,
        trrId: trr.id,
        actor: trr.signoff.approver!,
        timestamp: trr.signoff.approvedAt,
        createdAt: trr.signoff.approvedAt
      });
    }
  });

  // Sort by timestamp
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};