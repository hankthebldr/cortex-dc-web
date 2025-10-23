/**
 * Database Schema: Notes Collection
 * GUID: 9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f
 */

import { z } from 'zod';

/**
 * Processing status for uploaded notes
 */
export enum ProcessingStatus {
	QUEUED = 'queued',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

/**
 * Pipeline types for note processing
 */
export enum PipelineType {
	POV = 'pov',
	TRR = 'trr',
	KNOWLEDGE_BASE = 'knowledge-base',
	SCENARIO = 'scenario',
}

/**
 * Source of the note upload
 */
export enum NoteSource {
	OBSIDIAN_PLUGIN = 'obsidian-plugin',
	WEB_UPLOAD = 'web-upload',
	API = 'api',
	MIGRATION = 'migration',
}

/**
 * Zod schema for Note frontmatter
 */
export const NoteFrontmatterSchema = z.record(z.any()).optional();

/**
 * Zod schema for Note record
 */
export const NoteSchema = z.object({
	id: z.string().uuid(),
	guid: z.string().uuid(),
	filename: z.string().min(1),
	storagePath: z.string(),
	downloadUrl: z.string().url().optional(),
	pipeline: z.nativeEnum(PipelineType),
	frontmatter: NoteFrontmatterSchema,
	uploadedAt: z.date(),
	processingStatus: z.nativeEnum(ProcessingStatus).default(ProcessingStatus.QUEUED),
	processingMessage: z.string().optional(),
	processingError: z.string().optional(),
	completedAt: z.date().optional(),
	source: z.nativeEnum(NoteSource).default(NoteSource.API),
	userId: z.string().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

/**
 * TypeScript type for Note
 */
export type Note = z.infer<typeof NoteSchema>;

/**
 * Type for creating a new Note (omits auto-generated fields)
 */
export type CreateNoteInput = Omit<
	Note,
	'id' | 'createdAt' | 'updatedAt'
> & {
	id?: string;
};

/**
 * Type for updating a Note (all fields optional except id)
 */
export type UpdateNoteInput = Partial<Omit<Note, 'id'>> & {
	id: string;
};

/**
 * Helper function to create a new Note with defaults
 */
export function createNote(input: CreateNoteInput): Note {
	return NoteSchema.parse({
		...input,
		id: input.id || crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
	});
}

/**
 * Helper function to validate Note data
 */
export function validateNote(data: unknown): Note {
	return NoteSchema.parse(data);
}

/**
 * Helper function to validate partial Note data for updates
 */
export function validateNoteUpdate(data: unknown): Partial<Note> {
	return NoteSchema.partial().parse(data);
}
