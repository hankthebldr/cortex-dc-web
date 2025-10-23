/**
 * API Route: Batch Upload Notes from Obsidian Plugin
 * GUID: 7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@cortex/db';
import { getStorage } from '@cortex/db';

interface UploadRequest {
	filename: string;
	content: string;
	frontmatter?: Record<string, any>;
	pipeline: 'pov' | 'trr' | 'knowledge-base' | 'scenario';
	guid?: string;
}

interface BatchUploadRequest {
	notes: UploadRequest[];
}

interface UploadResponse {
	success: boolean;
	guid: string;
	documentId: string;
	message: string;
	processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as BatchUploadRequest;

		if (!body.notes || !Array.isArray(body.notes) || body.notes.length === 0) {
			return NextResponse.json(
				{
					results: [],
					message: 'No notes provided for upload',
				},
				{ status: 400 }
			);
		}

		const db = getDatabase();
		const storage = getStorage();
		const results: UploadResponse[] = [];

		// Process each note
		for (const note of body.notes) {
			try {
				// Validate note
				if (!note.filename || !note.content || !note.pipeline) {
					results.push({
						success: false,
						guid: note.guid || '',
						documentId: '',
						message: 'Missing required fields',
						processingStatus: 'failed',
					});
					continue;
				}

				// Generate IDs
				const guid = note.guid || crypto.randomUUID();
				const documentId = crypto.randomUUID();

				// Upload to storage
				const storagePath = `content-hub/notes/${guid}.md`;
				const buffer = Buffer.from(note.content, 'utf-8');

				const uploadResult = await storage.uploadFile(storagePath, buffer, {
					contentType: 'text/markdown',
					metadata: {
						filename: note.filename,
						pipeline: note.pipeline,
						guid,
						uploadedAt: new Date().toISOString(),
					},
				});

				// Create database record
				const noteRecord = {
					id: documentId,
					guid,
					filename: note.filename,
					storagePath,
					downloadUrl: uploadResult.downloadUrl,
					pipeline: note.pipeline,
					frontmatter: note.frontmatter || {},
					uploadedAt: new Date(),
					processingStatus: 'queued' as const,
					source: 'obsidian-plugin',
				};

				await db.create('notes', noteRecord);

				results.push({
					success: true,
					guid,
					documentId,
					message: `Uploaded successfully`,
					processingStatus: 'queued',
				});
			} catch (error: any) {
				results.push({
					success: false,
					guid: note.guid || '',
					documentId: '',
					message: `Upload failed: ${error.message}`,
					processingStatus: 'failed',
				});
			}
		}

		const successCount = results.filter(r => r.success).length;
		const failedCount = results.filter(r => !r.success).length;

		return NextResponse.json(
			{
				results,
				summary: {
					total: body.notes.length,
					success: successCount,
					failed: failedCount,
				},
				message: `Batch upload complete: ${successCount} succeeded, ${failedCount} failed`,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error('Batch upload error:', error);
		return NextResponse.json(
			{
				results: [],
				message: `Batch upload failed: ${error.message}`,
			},
			{ status: 500 }
		);
	}
}
