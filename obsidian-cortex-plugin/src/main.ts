/**
 * Cortex DC Connector - Main Plugin
 * GUID: 5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b
 */

import {
	App,
	Editor,
	MarkdownView,
	Menu,
	Notice,
	Plugin,
	TFile,
	TFolder,
} from 'obsidian';

import { CortexSettings, DEFAULT_SETTINGS, PipelineType } from './types';
import { CortexSettingTab } from './settings';
import { CortexApiClient } from './api-client';
import { NoteUploader } from './uploader';
import { PipelineSelectionModal, BatchUploadModal } from './modals';

export default class CortexPlugin extends Plugin {
	settings: CortexSettings;
	apiClient: CortexApiClient;
	uploader: NoteUploader;

	async onload() {
		await this.loadSettings();

		// Initialize API client and uploader
		this.apiClient = new CortexApiClient(
			this.settings.apiUrl,
			this.settings.apiKey
		);
		this.uploader = new NoteUploader(
			this.apiClient,
			this.settings.autoAddGuid
		);

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon(
			'cloud-upload',
			'Cortex DC Connector',
			(evt: MouseEvent) => {
				this.uploadCurrentNote();
			}
		);
		ribbonIconEl.addClass('cortex-ribbon-icon');

		// Add commands
		this.addCommands();

		// Add file menu items
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile && file.extension === 'md') {
					this.addFileMenuItems(menu, file);
				} else if (file instanceof TFolder) {
					this.addFolderMenuItems(menu, file);
				}
			})
		);

		// Add editor menu items
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
				this.addEditorMenuItems(menu, editor, view);
			})
		);

		// Add settings tab
		this.addSettingTab(new CortexSettingTab(this.app, this));

		console.log('Cortex DC Connector loaded');
	}

	onunload() {
		console.log('Cortex DC Connector unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Update API client and uploader with new settings
		this.apiClient.updateCredentials(
			this.settings.apiUrl,
			this.settings.apiKey
		);
		this.uploader.updateSettings(this.settings.autoAddGuid);
	}

	private addCommands() {
		// Upload current note
		this.addCommand({
			id: 'upload-current-note',
			name: 'Upload current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.uploadCurrentNote();
			},
		});

		// Upload current note to specific pipeline
		this.addCommand({
			id: 'upload-to-pov',
			name: 'Upload to POV pipeline',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.uploadNoteDirectly('pov');
			},
		});

		this.addCommand({
			id: 'upload-to-trr',
			name: 'Upload to TRR pipeline',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.uploadNoteDirectly('trr');
			},
		});

		this.addCommand({
			id: 'upload-to-kb',
			name: 'Upload to Knowledge Base',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.uploadNoteDirectly('knowledge-base');
			},
		});

		this.addCommand({
			id: 'upload-to-scenario',
			name: 'Upload to Scenario pipeline',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.uploadNoteDirectly('scenario');
			},
		});

		// Batch upload folder
		this.addCommand({
			id: 'upload-folder',
			name: 'Upload folder to Cortex',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					const folder = activeFile.parent;
					if (folder) {
						this.uploadFolder(folder);
					}
				}
			},
		});
	}

	private addFileMenuItems(menu: Menu, file: TFile) {
		menu.addItem((item) => {
			item
				.setTitle('Upload to Cortex')
				.setIcon('cloud-upload')
				.onClick(async () => {
					this.uploadFile(file);
				});
		});

		menu.addSeparator();

		menu.addItem((item) => {
			item
				.setTitle('Upload to POV')
				.setIcon('target')
				.onClick(async () => {
					this.uploadFileDirectly(file, 'pov');
				});
		});

		menu.addItem((item) => {
			item
				.setTitle('Upload to TRR')
				.setIcon('search')
				.onClick(async () => {
					this.uploadFileDirectly(file, 'trr');
				});
		});

		menu.addItem((item) => {
			item
				.setTitle('Upload to Knowledge Base')
				.setIcon('book')
				.onClick(async () => {
					this.uploadFileDirectly(file, 'knowledge-base');
				});
		});
	}

	private addFolderMenuItems(menu: Menu, folder: TFolder) {
		menu.addItem((item) => {
			item
				.setTitle('Upload folder to Cortex')
				.setIcon('folder-up')
				.onClick(async () => {
					this.uploadFolder(folder);
				});
		});
	}

	private addEditorMenuItems(
		menu: Menu,
		editor: Editor,
		view: MarkdownView
	) {
		menu.addItem((item) => {
			item
				.setTitle('Upload to Cortex')
				.setIcon('cloud-upload')
				.onClick(async () => {
					this.uploadCurrentNote();
				});
		});
	}

	private async uploadCurrentNote() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file');
			return;
		}

		this.uploadFile(activeFile);
	}

	private async uploadFile(file: TFile) {
		new PipelineSelectionModal(
			this.app,
			this.settings.defaultPipeline,
			async (pipeline) => {
				const content = await this.app.vault.read(file);
				await this.uploader.uploadNote(file, content, pipeline, this.app);
			}
		).open();
	}

	private async uploadNoteDirectly(pipeline: PipelineType) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file');
			return;
		}

		await this.uploadFileDirectly(activeFile, pipeline);
	}

	private async uploadFileDirectly(file: TFile, pipeline: PipelineType) {
		const content = await this.app.vault.read(file);
		await this.uploader.uploadNote(file, content, pipeline, this.app);
	}

	private async uploadFolder(folder: TFolder) {
		const markdownFiles: TFile[] = [];

		// Recursively collect all markdown files
		const collectFiles = (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile && child.extension === 'md') {
					markdownFiles.push(child);
				} else if (child instanceof TFolder) {
					collectFiles(child);
				}
			}
		};

		collectFiles(folder);

		if (markdownFiles.length === 0) {
			new Notice('No markdown files found in folder');
			return;
		}

		new BatchUploadModal(
			this.app,
			markdownFiles,
			this.settings.defaultPipeline,
			async (pipeline) => {
				await this.uploader.uploadBatch(
					markdownFiles,
					pipeline,
					this.app
				);
			}
		).open();
	}
}
