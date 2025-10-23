# Cortex DC Connector - Development Guide
<!-- GUID: 2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c -->

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Obsidian v1.0.0+
- A running Cortex DC Platform instance

### Initial Setup

1. **Clone and navigate to plugin directory**
   ```bash
   cd cortex-dc-web/obsidian-cortex-plugin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Link to your Obsidian vault for testing**
   ```bash
   # Create symlink to your vault's plugin directory
   ln -s "$(pwd)" "/path/to/your/vault/.obsidian/plugins/cortex-dc-connector"
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

This will:
- Watch for file changes
- Rebuild automatically
- Output to `main.js`

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **esbuild automatically rebuilds** the plugin
3. **Reload the plugin** in Obsidian:
   - Open Command Palette (`Cmd/Ctrl + P`)
   - Type "Reload app without saving"
   - Or restart Obsidian

### Testing

#### Manual Testing Checklist

- [ ] Single note upload works
- [ ] Batch folder upload works
- [ ] Pipeline selection modal displays correctly
- [ ] GUID is added to frontmatter (when enabled)
- [ ] Existing GUID is preserved
- [ ] Settings save correctly
- [ ] Connection test succeeds
- [ ] Error messages are user-friendly
- [ ] UI matches Obsidian theme

#### Test with Different Note Types

Create test notes with:
- No frontmatter
- Existing frontmatter without GUID
- Existing frontmatter with GUID
- Invalid YAML in frontmatter
- Large notes (10KB+)
- Notes with special characters
- Empty notes

#### Test API Integration

1. **Start Cortex platform locally**
   ```bash
   cd cortex-dc-web
   pnpm dev
   ```

2. **Configure plugin**
   - API URL: `http://localhost:3000`
   - Generate test API key from platform

3. **Test uploads**
   - Verify notes appear in Cortex
   - Check storage in Firebase/local
   - Verify metadata is correct

### Debugging

#### Enable Developer Tools

1. In Obsidian: View → Toggle Developer Tools
2. Check Console tab for errors
3. Use `console.log()` in your code

#### Common Debug Points

```typescript
// In main.ts
console.log('Plugin loaded');

// In uploader.ts
console.log('Uploading note:', file.basename);
console.log('GUID:', guid);

// In api-client.ts
console.log('API request:', url, options);
console.log('API response:', response);
```

#### Check Plugin State

```typescript
// In Obsidian console
app.plugins.plugins['cortex-dc-connector'].settings
app.plugins.plugins['cortex-dc-connector'].apiClient
```

### Building for Release

1. **Update version**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Build production**
   ```bash
   pnpm run build
   ```

3. **Test production build**
   - Copy `main.js` to test vault
   - Verify all features work
   - No console errors

4. **Create release**
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```

## Architecture

### File Structure

```
src/
├── main.ts          # Plugin entry, commands, menus
├── types.ts         # TypeScript interfaces and types
├── settings.ts      # Settings UI panel
├── api-client.ts    # HTTP client for Cortex API
├── uploader.ts      # Note upload logic, GUID management
└── modals.ts        # UI modals (pipeline selection, batch)
```

### Key Components

#### Plugin Lifecycle (main.ts)

```typescript
export default class CortexPlugin extends Plugin {
  async onload() {
    // Load settings
    // Initialize API client
    // Register commands
    // Add UI elements
  }

  onunload() {
    // Cleanup
  }
}
```

#### Settings Management (settings.ts)

```typescript
class CortexSettingTab extends PluginSettingTab {
  display() {
    // Render settings UI
    // API URL input
    // API key input
    // Pipeline dropdown
    // Toggle switches
    // Test connection button
  }
}
```

#### API Client (api-client.ts)

```typescript
class CortexApiClient {
  async uploadNote(request: UploadRequest): Promise<UploadResponse>
  async uploadBatch(requests: UploadRequest[]): Promise<UploadResponse[]>
  async getProcessingStatus(guid: string): Promise<ProcessingStatus>
  async testConnection(): Promise<{ success: boolean }>
}
```

#### Note Uploader (uploader.ts)

```typescript
class NoteUploader {
  async uploadNote(file: TFile, content: string, pipeline: PipelineType)
  async uploadBatch(files: TFile[], pipeline: PipelineType)
  private parseFrontmatter(content: string)
  private addGuidToContent(content: string)
  private extractGuid(content: string)
}
```

### Data Flow

```
User Action
  ↓
Command/Menu Handler (main.ts)
  ↓
Modal for Pipeline Selection (modals.ts)
  ↓
Note Uploader (uploader.ts)
  ├─→ Parse Frontmatter
  ├─→ Extract/Generate GUID
  └─→ Build Upload Request
      ↓
API Client (api-client.ts)
  ↓
HTTP Request to Cortex Platform
  ↓
Response
  ↓
User Notification (Notice)
```

## API Reference

### Types

See `src/types.ts` for complete type definitions.

#### Key Types

```typescript
interface CortexSettings {
  apiUrl: string;
  apiKey: string;
  defaultPipeline: PipelineType;
  autoAddGuid: boolean;
  syncOnSave: boolean;
}

type PipelineType = 'pov' | 'trr' | 'knowledge-base' | 'scenario';

interface UploadRequest {
  filename: string;
  content: string;
  frontmatter?: Record<string, any>;
  pipeline: PipelineType;
  guid?: string;
}

interface UploadResponse {
  success: boolean;
  guid: string;
  documentId: string;
  message: string;
  processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}
```

## Adding New Features

### Example: Add a New Command

1. **Define command in main.ts**
   ```typescript
   this.addCommand({
     id: 'my-new-command',
     name: 'My New Command',
     callback: () => {
       this.myNewFeature();
     },
   });
   ```

2. **Implement feature**
   ```typescript
   private async myNewFeature() {
     const activeFile = this.app.workspace.getActiveFile();
     // Your logic here
     new Notice('Feature executed!');
   }
   ```

3. **Test thoroughly**
4. **Update README** with new command

### Example: Add a New Pipeline

1. **Add to types.ts**
   ```typescript
   export const PIPELINES: Pipeline[] = [
     // ... existing pipelines
     {
       id: 'my-pipeline',
       name: 'My Pipeline',
       description: 'Description here',
       icon: '🎨',
     },
   ];
   ```

2. **Update PipelineType**
   ```typescript
   export type PipelineType = 'pov' | 'trr' | 'knowledge-base' | 'scenario' | 'my-pipeline';
   ```

3. **Add command in main.ts**
   ```typescript
   this.addCommand({
     id: 'upload-to-my-pipeline',
     name: 'Upload to My Pipeline',
     editorCallback: () => {
       this.uploadNoteDirectly('my-pipeline');
     },
   });
   ```

## Best Practices

### Code Style

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use async/await instead of promises
- Handle errors gracefully
- Provide user-friendly error messages

### Error Handling

```typescript
try {
  const result = await this.apiClient.uploadNote(request);
  if (result.success) {
    new Notice(`✓ Upload successful`);
  } else {
    new Notice(`✗ Upload failed: ${result.message}`);
  }
} catch (error) {
  console.error('Upload error:', error);
  new Notice(`✗ Error: ${error.message}`);
}
```

### User Feedback

- Always provide feedback for user actions
- Use Notice for status messages
- Use icons (✓, ✗, ⏳) for visual clarity
- Keep messages concise

### Performance

- Batch API calls when possible
- Cache settings in memory
- Don't block the UI thread
- Use async operations

### Security

- Never log API keys
- Validate all user input
- Use HTTPS for production
- Rate limit API requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

Example:
```
feat: add batch upload progress indicator
fix: prevent duplicate GUID generation
docs: update README with new commands
```

## Troubleshooting Development Issues

### Build Errors

**Problem:** `esbuild` errors

**Solution:**
```bash
rm -rf node_modules
pnpm install
pnpm run build
```

### Plugin Not Reloading

**Problem:** Changes don't appear

**Solution:**
1. Check esbuild is running (`pnpm run dev`)
2. Reload Obsidian completely
3. Check symlink is correct
4. Verify `main.js` is being updated

### Type Errors

**Problem:** TypeScript compilation errors

**Solution:**
```bash
pnpm run type-check
# Fix reported errors
```

## Resources

- [Obsidian Plugin API Docs](https://docs.obsidian.md/Plugins)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Cortex DC Platform](https://github.com/hankthebldr/cortex-dc-web)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
