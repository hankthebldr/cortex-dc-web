/**
 * Cortex DC Connector - UI Modals
 * GUID: 4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a
 */

import { App, Modal, Setting, TFile } from 'obsidian';
import { PIPELINES, PipelineType } from './types';

export class PipelineSelectionModal extends Modal {
	private selectedPipeline: PipelineType;
	private onSubmit: (pipeline: PipelineType) => void;
	private defaultPipeline: PipelineType;

	constructor(
		app: App,
		defaultPipeline: PipelineType,
		onSubmit: (pipeline: PipelineType) => void
	) {
		super(app);
		this.selectedPipeline = defaultPipeline;
		this.defaultPipeline = defaultPipeline;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Select Processing Pipeline' });

		contentEl.createEl('p', {
			text: 'Choose which pipeline to send this note to:',
			cls: 'cortex-modal-description',
		});

		// Create pipeline selection buttons
		const pipelineContainer = contentEl.createDiv({
			cls: 'cortex-pipeline-container',
		});

		PIPELINES.forEach((pipeline) => {
			const button = pipelineContainer.createEl('button', {
				cls: 'cortex-pipeline-button',
			});

			if (pipeline.id === this.defaultPipeline) {
				button.addClass('cortex-pipeline-selected');
			}

			const icon = button.createEl('span', {
				text: pipeline.icon,
				cls: 'cortex-pipeline-icon',
			});

			const content = button.createDiv({ cls: 'cortex-pipeline-content' });
			content.createEl('div', {
				text: pipeline.name,
				cls: 'cortex-pipeline-name',
			});
			content.createEl('div', {
				text: pipeline.description,
				cls: 'cortex-pipeline-desc',
			});

			button.addEventListener('click', () => {
				// Remove selected class from all buttons
				pipelineContainer
					.querySelectorAll('.cortex-pipeline-button')
					.forEach((btn) => {
						btn.removeClass('cortex-pipeline-selected');
					});

				// Add selected class to clicked button
				button.addClass('cortex-pipeline-selected');
				this.selectedPipeline = pipeline.id;
			});
		});

		// Action buttons
		const buttonContainer = contentEl.createDiv({
			cls: 'cortex-modal-buttons',
		});

		const submitButton = buttonContainer.createEl('button', {
			text: 'Upload',
			cls: 'mod-cta',
		});
		submitButton.addEventListener('click', () => {
			this.onSubmit(this.selectedPipeline);
			this.close();
		});

		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
		});
		cancelButton.addEventListener('click', () => {
			this.close();
		});

		// Add custom CSS
		this.addStyles(contentEl);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private addStyles(containerEl: HTMLElement) {
		const style = containerEl.createEl('style');
		style.textContent = `
			.cortex-modal-description {
				margin-bottom: 1.5em;
				color: var(--text-muted);
			}

			.cortex-pipeline-container {
				display: flex;
				flex-direction: column;
				gap: 0.75em;
				margin-bottom: 1.5em;
			}

			.cortex-pipeline-button {
				display: flex;
				align-items: center;
				gap: 1em;
				padding: 1em;
				border: 2px solid var(--background-modifier-border);
				border-radius: 8px;
				background-color: var(--background-primary);
				cursor: pointer;
				transition: all 0.2s;
				text-align: left;
			}

			.cortex-pipeline-button:hover {
				border-color: var(--interactive-accent);
				background-color: var(--background-secondary);
			}

			.cortex-pipeline-selected {
				border-color: var(--interactive-accent);
				background-color: var(--background-secondary);
			}

			.cortex-pipeline-icon {
				font-size: 2em;
				flex-shrink: 0;
			}

			.cortex-pipeline-content {
				flex: 1;
			}

			.cortex-pipeline-name {
				font-weight: 600;
				margin-bottom: 0.25em;
			}

			.cortex-pipeline-desc {
				font-size: 0.9em;
				color: var(--text-muted);
			}

			.cortex-modal-buttons {
				display: flex;
				justify-content: flex-end;
				gap: 0.5em;
			}

			.cortex-modal-buttons button {
				padding: 0.5em 1.5em;
			}
		`;
	}
}

export class BatchUploadModal extends Modal {
	private files: TFile[];
	private selectedPipeline: PipelineType;
	private onSubmit: (pipeline: PipelineType) => void;
	private defaultPipeline: PipelineType;

	constructor(
		app: App,
		files: TFile[],
		defaultPipeline: PipelineType,
		onSubmit: (pipeline: PipelineType) => void
	) {
		super(app);
		this.files = files;
		this.selectedPipeline = defaultPipeline;
		this.defaultPipeline = defaultPipeline;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Batch Upload to Cortex' });

		contentEl.createEl('p', {
			text: `Uploading ${this.files.length} file(s) to the platform.`,
			cls: 'cortex-modal-description',
		});

		// File list
		const fileList = contentEl.createDiv({ cls: 'cortex-file-list' });
		this.files.slice(0, 10).forEach((file) => {
			fileList.createEl('div', {
				text: `📄 ${file.basename}`,
				cls: 'cortex-file-item',
			});
		});

		if (this.files.length > 10) {
			fileList.createEl('div', {
				text: `... and ${this.files.length - 10} more`,
				cls: 'cortex-file-item cortex-file-more',
			});
		}

		// Pipeline selection
		new Setting(contentEl)
			.setName('Pipeline')
			.setDesc('Select the processing pipeline')
			.addDropdown((dropdown) => {
				PIPELINES.forEach((pipeline) => {
					dropdown.addOption(pipeline.id, `${pipeline.icon} ${pipeline.name}`);
				});
				dropdown.setValue(this.defaultPipeline).onChange((value) => {
					this.selectedPipeline = value as PipelineType;
				});
			});

		// Action buttons
		const buttonContainer = contentEl.createDiv({
			cls: 'cortex-modal-buttons',
		});

		const submitButton = buttonContainer.createEl('button', {
			text: 'Upload All',
			cls: 'mod-cta',
		});
		submitButton.addEventListener('click', () => {
			this.onSubmit(this.selectedPipeline);
			this.close();
		});

		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
		});
		cancelButton.addEventListener('click', () => {
			this.close();
		});

		// Add custom CSS
		this.addStyles(contentEl);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private addStyles(containerEl: HTMLElement) {
		const style = containerEl.createEl('style');
		style.textContent = `
			.cortex-file-list {
				max-height: 200px;
				overflow-y: auto;
				margin: 1em 0;
				padding: 1em;
				background-color: var(--background-secondary);
				border-radius: 5px;
			}

			.cortex-file-item {
				padding: 0.25em 0;
				font-size: 0.9em;
			}

			.cortex-file-more {
				color: var(--text-muted);
				font-style: italic;
			}

			.cortex-modal-buttons {
				display: flex;
				justify-content: flex-end;
				gap: 0.5em;
				margin-top: 1.5em;
			}

			.cortex-modal-buttons button {
				padding: 0.5em 1.5em;
			}
		`;
	}
}
