/**
 * Cortex DC Connector - API Client
 * GUID: 2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e
 */

import { requestUrl, RequestUrlParam } from 'obsidian';
import { UploadRequest, UploadResponse, ProcessingStatus } from './types';

export class CortexApiClient {
	private apiUrl: string;
	private apiKey: string;

	constructor(apiUrl: string, apiKey: string) {
		this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
		this.apiKey = apiKey;
	}

	updateCredentials(apiUrl: string, apiKey: string) {
		this.apiUrl = apiUrl.replace(/\/$/, '');
		this.apiKey = apiKey;
	}

	private async request<T>(
		endpoint: string,
		options: Partial<RequestUrlParam> = {}
	): Promise<T> {
		const url = `${this.apiUrl}${endpoint}`;

		const requestOptions: RequestUrlParam = {
			url,
			method: options.method || 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.apiKey}`,
				...options.headers,
			},
			body: options.body,
			throw: false,
		};

		const response = await requestUrl(requestOptions);

		if (response.status >= 400) {
			throw new Error(
				`API request failed: ${response.status} ${response.text}`
			);
		}

		return response.json as T;
	}

	/**
	 * Test connection to Cortex DC Platform
	 */
	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await this.request<{ status: string }>(
				'/api/health'
			);
			return {
				success: response.status === 'ok',
				message: 'Successfully connected to Cortex DC Platform',
			};
		} catch (error) {
			return {
				success: false,
				message: `Connection failed: ${error.message}`,
			};
		}
	}

	/**
	 * Upload a note to the platform
	 */
	async uploadNote(request: UploadRequest): Promise<UploadResponse> {
		try {
			const response = await this.request<UploadResponse>(
				'/api/notes/upload',
				{
					method: 'POST',
					body: JSON.stringify(request),
				}
			);
			return response;
		} catch (error) {
			return {
				success: false,
				guid: request.guid || '',
				documentId: '',
				message: `Upload failed: ${error.message}`,
				processingStatus: 'failed',
			};
		}
	}

	/**
	 * Upload multiple notes in batch
	 */
	async uploadBatch(
		requests: UploadRequest[]
	): Promise<UploadResponse[]> {
		try {
			const response = await this.request<{ results: UploadResponse[] }>(
				'/api/notes/upload/batch',
				{
					method: 'POST',
					body: JSON.stringify({ notes: requests }),
				}
			);
			return response.results;
		} catch (error) {
			// Return failed responses for all notes
			return requests.map((req) => ({
				success: false,
				guid: req.guid || '',
				documentId: '',
				message: `Batch upload failed: ${error.message}`,
				processingStatus: 'failed' as const,
			}));
		}
	}

	/**
	 * Get processing status for a note
	 */
	async getProcessingStatus(guid: string): Promise<ProcessingStatus> {
		try {
			const response = await this.request<ProcessingStatus>(
				`/api/notes/status/${guid}`
			);
			return response;
		} catch (error) {
			return {
				guid,
				status: 'failed',
				progress: 0,
				error: error.message,
			};
		}
	}

	/**
	 * Search the knowledge base
	 */
	async search(query: string, limit: number = 10): Promise<any[]> {
		try {
			const response = await this.request<{ results: any[] }>(
				`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
			);
			return response.results;
		} catch (error) {
			console.error('Search failed:', error);
			return [];
		}
	}
}
