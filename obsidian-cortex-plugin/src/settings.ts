/**
 * Cortex DC Connector - Settings Management
 * GUID: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import CortexPlugin from './main';
import { PIPELINES, PipelineType } from './types';

export class CortexSettingTab extends PluginSettingTab {
	plugin: CortexPlugin;

	constructor(app: App, plugin: CortexPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Cortex DC Connector Settings' });

		// API Configuration Section
		containerEl.createEl('h3', { text: 'API Configuration' });

		new Setting(containerEl)
			.setName('API URL')
			.setDesc('The URL of your Cortex DC Platform instance')
			.addText((text) =>
				text
					.setPlaceholder('http://localhost:3000')
					.setValue(this.plugin.settings.apiUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiUrl = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your Cortex DC Platform API key or authentication token')
			.addText((text) =>
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		// Pipeline Configuration Section
		containerEl.createEl('h3', { text: 'Pipeline Settings' });

		new Setting(containerEl)
			.setName('Default Pipeline')
			.setDesc('The default pipeline to use when uploading notes')
			.addDropdown((dropdown) => {
				PIPELINES.forEach((pipeline) => {
					dropdown.addOption(pipeline.id, `${pipeline.icon} ${pipeline.name}`);
				});
				dropdown
					.setValue(this.plugin.settings.defaultPipeline)
					.onChange(async (value) => {
						this.plugin.settings.defaultPipeline = value as PipelineType;
						await this.plugin.saveSettings();
					});
			});

		// Automation Section
		containerEl.createEl('h3', { text: 'Automation' });

		new Setting(containerEl)
			.setName('Auto-add GUID')
			.setDesc('Automatically add GUID to frontmatter if not present')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoAddGuid)
					.onChange(async (value) => {
						this.plugin.settings.autoAddGuid = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Sync on Save')
			.setDesc('Automatically sync notes to Cortex when saved (experimental)')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.syncOnSave)
					.onChange(async (value) => {
						this.plugin.settings.syncOnSave = value;
						await this.plugin.saveSettings();
					})
			);

		// Connection Test Section
		containerEl.createEl('h3', { text: 'Connection Test' });

		new Setting(containerEl)
			.setName('Test Connection')
			.setDesc('Test the connection to your Cortex DC Platform')
			.addButton((button) =>
				button
					.setButtonText('Test Connection')
					.setCta()
					.onClick(async () => {
						button.setButtonText('Testing...');
						button.setDisabled(true);

						try {
							const result = await this.plugin.apiClient.testConnection();
							if (result.success) {
								button.setButtonText('✓ Connected');
								setTimeout(() => {
									button.setButtonText('Test Connection');
									button.setDisabled(false);
								}, 2000);
							} else {
								button.setButtonText('✗ Failed');
								setTimeout(() => {
									button.setButtonText('Test Connection');
									button.setDisabled(false);
								}, 2000);
							}
						} catch (error) {
							button.setButtonText('✗ Error');
							setTimeout(() => {
								button.setButtonText('Test Connection');
								button.setDisabled(false);
							}, 2000);
						}
					})
			);

		// Help Section
		containerEl.createEl('h3', { text: 'Help & Documentation' });

		const helpDiv = containerEl.createDiv({ cls: 'cortex-help' });
		helpDiv.createEl('p', {
			text: 'For detailed documentation, visit: ',
		});
		helpDiv.createEl('a', {
			text: 'Cortex DC Platform Docs',
			href: 'https://github.com/hankthebldr/cortex-dc-web',
		});

		// Add custom CSS
		const style = containerEl.createEl('style');
		style.textContent = `
			.cortex-help {
				padding: 1em;
				background-color: var(--background-secondary);
				border-radius: 5px;
				margin-top: 1em;
			}
			.cortex-help a {
				color: var(--interactive-accent);
			}
		`;
	}
}
