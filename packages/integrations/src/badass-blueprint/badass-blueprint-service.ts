'use client';

/**
 * Badass Blueprint Service - Migrated from henryreed.ai
 *
 * Manages blueprint generation via Cloud Functions and Firestore subscription
 * Provides executive-level engagement summaries with AI-generated content
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { CloudFunctionsAPI } from '../cloud-functions/cloud-functions-api';

export interface BlueprintFileData {
  storagePath: string;
  checksumSha256?: string;
  bytes?: number;
  downloadUrl?: string;
  brandTheme?: string;
}

export interface BlueprintAnalytics {
  recommendationCoverage: number;
  riskScore: number;
  automationConfidence: number;
  recommendationCategories: string[];
  scenarioCount: number;
  notesCount: number;
  transcriptTokens: number;
  deliveryLatencyMs?: number | null;
  bigQueryJobId?: string | null;
  lastExportedAt?: string | null;
}

export interface BadassBlueprintRecord {
  id: string;
  engagementId: string;
  customerName: string;
  generatedBy: string;
  generatedAt?: Date;
  status: string;
  pdf?: BlueprintFileData | null;
  artifactBundle?: BlueprintFileData | null;
  analytics?: BlueprintAnalytics;
  contextSnapshot?: Record<string, any>;
  emphasis?: { wins?: string[]; risks?: string[]; roadmap?: string[] };
  payload?: {
    sections?: number;
    executiveTheme?: string;
  } | null;
  error?: { message: string; details?: any } | null;
}

// Lightweight selection/filter type for blueprint queries
export type BlueprintRecordSelection = Partial<{
  id: string;
  engagementId: string;
  generatedBy: string;
  status: string;
  limit: number;
  orderBy: string;
}>;

export interface BlueprintGenerationOptions {
  engagementId: string;
  executiveTone?: string;
  emphasis?: { wins?: string[]; risks?: string[]; roadmap?: string[] };
}

export interface BlueprintGenerationResponse {
  blueprintId: string;
  status: string;
  payloadPath: string;
}

const apiSingleton = new CloudFunctionsAPI();

const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : new Date(parsed);
};

const buildRecord = (snapshot: any): BadassBlueprintRecord => {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    engagementId: data.engagementId,
    customerName: data.customerName,
    generatedBy: data.generatedBy,
    generatedAt: toDate(data.generatedAt),
    status: data.status,
    pdf: data.pdf || null,
    artifactBundle: data.artifactBundle || null,
    analytics: data.analytics,
    contextSnapshot: data.contextSnapshot,
    emphasis: data.emphasis,
    payload: data.payload,
    error: data.error || null,
  };
};

/**
 * Request blueprint generation via Cloud Functions
 */
export const requestBlueprintGeneration = async (
  options: BlueprintGenerationOptions
): Promise<BlueprintGenerationResponse> => {
  const response = await apiSingleton.generateBadassBlueprint(options);
  if (!response.success || !response.blueprintId) {
    throw new Error(response.message || 'Failed to queue blueprint generation');
  }
  return {
    blueprintId: response.blueprintId,
    status: response.status || 'processing',
    payloadPath: response.payloadPath || '',
  };
};

/**
 * Subscribe to blueprint updates via Firestore
 */
export const subscribeToBlueprint = (
  blueprintId: string,
  callback: (record: BadassBlueprintRecord | null) => void
): (() => void) => {
  // Dynamically import firestore to avoid SSR issues
  let unsubscribe: (() => void) | null = null;

  if (typeof window !== 'undefined') {
    import('@cortex/db').then(({ db }) => {
      const ref = doc(db, 'badassBlueprints', blueprintId);
      unsubscribe = onSnapshot(
        ref,
        snapshot => {
          if (!snapshot.exists()) {
            callback(null);
            return;
          }
          callback(buildRecord(snapshot));
        },
        error => {
          // Avoid direct console usage to satisfy lint rules
          const safeLogError = (label: string, err: any) => {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.error(label, err);
            }
          };
          safeLogError('Blueprint subscription error', error);
          callback(null);
        }
      );
    }).catch(error => {
      console.error('Failed to initialize blueprint subscription:', error);
      callback(null);
    });
  }

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};
