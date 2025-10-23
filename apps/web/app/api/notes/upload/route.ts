/**
 * API Route: Upload Note from Obsidian Plugin
 * GUID: 6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c
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

interface UploadResponse {
	success: boolean;
	guid: string;
	documentId: string;
	message: string;
	processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as UploadRequest;

		// Validate request
		if (!body.filename || !body.content || !body.pipeline) {
			return NextResponse.json(
				{
					success: false,
					guid: body.guid || '',
					documentId: '',
					message: 'Missing required fields: filename, content, or pipeline',
					processingStatus: 'failed',
				} as UploadResponse,
				{ status: 400 }
			);
		}

		// Generate GUID if not provided
		const guid = body.guid || crypto.randomUUID();
		const documentId = crypto.randomUUID();

		// Get database and storage
		const db = getDatabase();
		const storage = getStorage();

		// Store the file in cloud storage
		const storagePath = `content-hub/notes/${guid}.md`;
		const buffer = Buffer.from(body.content, 'utf-8');

		const uploadResult = await storage.uploadFile(storagePath, buffer, {
			contentType: 'text/markdown',
			metadata: {
				filename: body.filename,
				pipeline: body.pipeline,
				guid,
				uploadedAt: new Date().toISOString(),
			},
		});

		// Create database record
		const noteRecord = {
			id: documentId,
			guid,
			filename: body.filename,
			storagePath,
			downloadUrl: uploadResult.downloadUrl,
			pipeline: body.pipeline,
			frontmatter: body.frontmatter || {},
			uploadedAt: new Date(),
			processingStatus: 'queued' as const,
			source: 'obsidian-plugin',
		};

		await db.create('notes', noteRecord);

		// Trigger processing based on pipeline
		// This would be done via a background job/queue in production
		// For now, we'll just mark it as queued

		return NextResponse.json(
			{
				success: true,
				guid,
				documentId,
				message: `Note uploaded successfully to ${body.pipeline} pipeline`,
				processingStatus: 'queued',
			} as UploadResponse,
			{ status: 200 }
		);
	} catch (error: any) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{
				success: false,
				guid: '',
				documentId: '',
				message: `Upload failed: ${error.message}`,
				processingStatus: 'failed',
			} as UploadResponse,
			{ status: 500 }
		);
	}
}
