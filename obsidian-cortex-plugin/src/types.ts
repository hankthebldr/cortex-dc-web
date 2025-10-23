/**
 * Cortex DC Connector - Type Definitions
 * GUID: 9b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e
 */

export interface CortexSettings {
	apiUrl: string;
	apiKey: string;
	defaultPipeline: PipelineType;
	autoAddGuid: boolean;
	syncOnSave: boolean;
}

export const DEFAULT_SETTINGS: CortexSettings = {
	apiUrl: 'http://localhost:3000',
	apiKey: '',
	defaultPipeline: 'knowledge-base',
	autoAddGuid: true,
	syncOnSave: false,
};

export type PipelineType = 'pov' | 'trr' | 'knowledge-base' | 'scenario';

export interface Pipeline {
	id: PipelineType;
	name: string;
	description: string;
	icon: string;
}

export const PIPELINES: Pipeline[] = [
	{
		id: 'pov',
		name: 'Proof of Value (POV)',
		description: 'Send to POV creation and management pipeline',
		icon: '🎯',
	},
	{
		id: 'trr',
		name: 'Technical Risk Review (TRR)',
		description: 'Send to TRR findings and validation pipeline',
		icon: '🔍',
	},
	{
		id: 'knowledge-base',
		name: 'Knowledge Base',
		description: 'Add to searchable knowledge base',
		icon: '📚',
	},
	{
		id: 'scenario',
		name: 'Scenario Processing',
		description: 'Process as a deployment scenario',
		icon: '🚀',
	},
];

export interface UploadRequest {
	filename: string;
	content: string;
	frontmatter?: Record<string, any>;
	pipeline: PipelineType;
	guid?: string;
}

export interface UploadResponse {
	success: boolean;
	guid: string;
	documentId: string;
	message: string;
	processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface ProcessingStatus {
	guid: string;
	status: 'queued' | 'processing' | 'completed' | 'failed';
	progress: number;
	message?: string;
	error?: string;
	completedAt?: string;
}

export interface MarkdownMetadata {
	guid?: string;
	title?: string;
	created?: string;
	updated?: string;
	tags?: string[];
	pipeline?: PipelineType;
	[key: string]: any;
}
