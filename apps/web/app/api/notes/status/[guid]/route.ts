/**
 * API Route: Get Note Processing Status
 * GUID: 8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@cortex/db';

interface ProcessingStatus {
	guid: string;
	status: 'queued' | 'processing' | 'completed' | 'failed';
	progress: number;
	message?: string;
	error?: string;
	completedAt?: string;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { guid: string } }
) {
	try {
		const { guid } = params;

		if (!guid) {
			return NextResponse.json(
				{
					guid: '',
					status: 'failed',
					progress: 0,
					error: 'GUID is required',
				} as ProcessingStatus,
				{ status: 400 }
			);
		}

		const db = getDatabase();

		// Find the note by GUID
		const notes = await db.findMany('notes', {
			where: { guid },
			limit: 1,
		});

		if (!notes || notes.length === 0) {
			return NextResponse.json(
				{
					guid,
					status: 'failed',
					progress: 0,
					error: 'Note not found',
				} as ProcessingStatus,
				{ status: 404 }
			);
		}

		const note = notes[0];

		// Calculate progress based on status
		let progress = 0;
		switch (note.processingStatus) {
			case 'queued':
				progress = 25;
				break;
			case 'processing':
				progress = 50;
				break;
			case 'completed':
				progress = 100;
				break;
			case 'failed':
				progress = 0;
				break;
		}

		return NextResponse.json(
			{
				guid,
				status: note.processingStatus,
				progress,
				message: note.processingMessage,
				error: note.processingError,
				completedAt: note.completedAt?.toISOString(),
			} as ProcessingStatus,
			{ status: 200 }
		);
	} catch (error: any) {
		console.error('Status check error:', error);
		return NextResponse.json(
			{
				guid: params.guid,
				status: 'failed',
				progress: 0,
				error: `Status check failed: ${error.message}`,
			} as ProcessingStatus,
			{ status: 500 }
		);
	}
}
