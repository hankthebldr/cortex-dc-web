/**
 * Cortex DC Connector - File Uploader
 * GUID: 3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f
 */

import { Notice, TFile, parseYaml, stringifyYaml } from 'obsidian';
import { CortexApiClient } from './api-client';
import { PipelineType, UploadRequest, MarkdownMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class NoteUploader {
	private apiClient: CortexApiClient;
	private autoAddGuid: boolean;

	constructor(apiClient: CortexApiClient, autoAddGuid: boolean) {
		this.apiClient = apiClient;
		this.autoAddGuid = autoAddGuid;
	}

	/**
	 * Parse frontmatter from markdown content
	 */
	private parseFrontmatter(content: string): {
		frontmatter: MarkdownMetadata | null;
		body: string;
		hasFrontmatter: boolean;
	} {
		const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
		const match = content.match(frontmatterRegex);

		if (match) {
			try {
				const frontmatter = parseYaml(match[1]) as MarkdownMetadata;
				return {
					frontmatter,
					body: match[2],
					hasFrontmatter: true,
				};
			} catch (error) {
				console.error('Failed to parse frontmatter:', error);
				return {
					frontmatter: null,
					body: content,
					hasFrontmatter: false,
				};
			}
		}

		return {
			frontmatter: null,
			body: content,
			hasFrontmatter: false,
		};
	}

	/**
	 * Add or update GUID in frontmatter
	 */
	private addGuidToContent(
		content: string,
		existingGuid?: string
	): { content: string; guid: string } {
		const parsed = this.parseFrontmatter(content);
		const guid = existingGuid || parsed.frontmatter?.guid || uuidv4();

		if (!parsed.hasFrontmatter) {
			// Create new frontmatter
			const frontmatter: MarkdownMetadata = {
				guid,
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
			};
			const frontmatterStr = stringifyYaml(frontmatter);
			return {
				content: `---\n${frontmatterStr}---\n${content}`,
				guid,
			};
		} else {
			// Update existing frontmatter
			const frontmatter = parsed.frontmatter || {};
			frontmatter.guid = guid;
			frontmatter.updated = new Date().toISOString();
			if (!frontmatter.created) {
				frontmatter.created = new Date().toISOString();
			}

			const frontmatterStr = stringifyYaml(frontmatter);
			return {
				content: `---\n${frontmatterStr}---\n${parsed.body}`,
				guid,
			};
		}
	}

	/**
	 * Extract GUID from content (frontmatter or HTML comment)
	 */
	private extractGuid(content: string): string | undefined {
		// Try frontmatter first
		const parsed = this.parseFrontmatter(content);
		if (parsed.frontmatter?.guid) {
			return parsed.frontmatter.guid;
		}

		// Try HTML comment
		const commentRegex = /<!--\s*GUID:\s*([a-f0-9-]+)\s*-->/i;
		const match = content.match(commentRegex);
		if (match) {
			return match[1];
		}

		return undefined;
	}

	/**
	 * Upload a single note
	 */
	async uploadNote(
		file: TFile,
		content: string,
		pipeline: PipelineType,
		app: any
	): Promise<boolean> {
		try {
			// Extract or add GUID
			let finalContent = content;
			let guid = this.extractGuid(content);

			if (!guid && this.autoAddGuid) {
				const result = this.addGuidToContent(content);
				finalContent = result.content;
				guid = result.guid;

				// Update the file with the new content
				await app.vault.modify(file, finalContent);
				new Notice(`Added GUID to ${file.basename}`);
			}

			// Parse frontmatter for metadata
			const parsed = this.parseFrontmatter(finalContent);

			// Create upload request
			const request: UploadRequest = {
				filename: file.basename,
				content: finalContent,
				frontmatter: parsed.frontmatter || undefined,
				pipeline,
				guid,
			};

			// Upload to platform
			const response = await this.apiClient.uploadNote(request);

			if (response.success) {
				new Notice(
					`✓ ${file.basename} uploaded to ${pipeline} pipeline`
				);
				return true;
			} else {
				new Notice(`✗ Upload failed: ${response.message}`);
				return false;
			}
		} catch (error) {
			new Notice(`✗ Error uploading ${file.basename}: ${error.message}`);
			return false;
		}
	}

	/**
	 * Upload multiple notes in batch
	 */
	async uploadBatch(
		files: TFile[],
		pipeline: PipelineType,
		app: any
	): Promise<{ success: number; failed: number }> {
		const requests: UploadRequest[] = [];
		const filesToUpdate: { file: TFile; content: string }[] = [];

		// Prepare all requests
		for (const file of files) {
			const content = await app.vault.read(file);
			let finalContent = content;
			let guid = this.extractGuid(content);

			if (!guid && this.autoAddGuid) {
				const result = this.addGuidToContent(content);
				finalContent = result.content;
				guid = result.guid;
				filesToUpdate.push({ file, content: finalContent });
			}

			const parsed = this.parseFrontmatter(finalContent);

			requests.push({
				filename: file.basename,
				content: finalContent,
				frontmatter: parsed.frontmatter || undefined,
				pipeline,
				guid,
			});
		}

		// Update files with GUIDs
		for (const { file, content } of filesToUpdate) {
			await app.vault.modify(file, content);
		}

		if (filesToUpdate.length > 0) {
			new Notice(`Added GUIDs to ${filesToUpdate.length} file(s)`);
		}

		// Upload batch
		const responses = await this.apiClient.uploadBatch(requests);

		const success = responses.filter((r) => r.success).length;
		const failed = responses.filter((r) => !r.success).length;

		new Notice(
			`Batch upload complete: ${success} succeeded, ${failed} failed`
		);

		return { success, failed };
	}

	updateSettings(autoAddGuid: boolean) {
		this.autoAddGuid = autoAddGuid;
	}
}
