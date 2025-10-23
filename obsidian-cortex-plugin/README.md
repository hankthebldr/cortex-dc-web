# Cortex DC Connector - Obsidian Plugin
<!-- GUID: 1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b -->

**Seamlessly connect your Obsidian vault to the Cortex Domain Consultant Platform**

## Overview

The Cortex DC Connector is an Obsidian plugin that bridges your note-taking workflow with the Cortex Domain Consultant Platform's powerful processing pipelines. Send notes directly from Obsidian to POV management, TRR workflows, or the knowledge base without leaving your editor.

### Key Features

- 🚀 **One-Click Upload** - Send notes to Cortex with a single click
- 🎯 **Pipeline Selection** - Choose from POV, TRR, Knowledge Base, or Scenario pipelines
- 📁 **Batch Processing** - Upload entire folders at once
- 🔑 **Auto-GUID Management** - Automatically adds GUIDs for bi-directional sync
- ⚡ **Command Palette** - Quick access via Obsidian command palette
- 📊 **Status Tracking** - Monitor upload and processing status
- 🔐 **Secure Authentication** - API key-based authentication
- 🎨 **Beautiful UI** - Native Obsidian-style modals and menus

## Installation

### Method 1: Manual Installation (Recommended for Testing)

1. **Download the plugin**
   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone https://github.com/hankthebldr/cortex-dc-web.git cortex-dc-connector
   cd cortex-dc-connector/obsidian-cortex-plugin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   # or
   pnpm build
   ```

4. **Copy files to your vault**
   ```bash
   cp main.js manifest.json /path/to/your/vault/.obsidian/plugins/cortex-dc-connector/
   ```

5. **Enable the plugin**
   - Open Obsidian
   - Go to Settings → Community Plugins
   - Disable "Safe Mode" if enabled
   - Click "Reload plugins"
   - Find "Cortex DC Connector" and enable it

### Method 2: Development Installation

For active development and testing:

1. **Link the plugin to your vault**
   ```bash
   cd /path/to/cortex-dc-web/obsidian-cortex-plugin
   pnpm install
   pnpm run dev  # Starts development build with hot reload
   ```

2. **Create symlink**
   ```bash
   ln -s /path/to/cortex-dc-web/obsidian-cortex-plugin /path/to/your/vault/.obsidian/plugins/cortex-dc-connector
   ```

3. **Reload Obsidian** or reload the plugin from Settings

## Configuration

### 1. Get Your API Key

Before using the plugin, you need an API key from your Cortex DC Platform instance:

1. Log in to your Cortex DC Platform
2. Go to **Settings → API Keys**
3. Click **Generate New API Key**
4. Copy the key (you'll only see it once!)

### 2. Configure the Plugin

1. Open Obsidian Settings
2. Navigate to **Community Plugins → Cortex DC Connector**
3. Enter your configuration:

   | Setting | Description | Example |
   |---------|-------------|---------|
   | **API URL** | URL of your Cortex instance | `http://localhost:3000` or `https://cortex.yourcompany.com` |
   | **API Key** | Your authentication token | `your-api-key-here` |
   | **Default Pipeline** | Default pipeline for uploads | `Knowledge Base` |
   | **Auto-add GUID** | Automatically add GUID to notes | ✓ Enabled (recommended) |
   | **Sync on Save** | Auto-sync when saving notes | ✗ Disabled (experimental) |

4. Click **Test Connection** to verify your setup

## Usage

### Upload a Single Note

#### Method 1: Ribbon Icon
1. Open a note
2. Click the cloud upload icon in the left ribbon
3. Select your desired pipeline
4. Click "Upload"

#### Method 2: Command Palette
1. Open a note
2. Press `Cmd/Ctrl + P` to open command palette
3. Type "Cortex" to filter commands
4. Select your desired upload command:
   - "Upload current note" (shows pipeline selector)
   - "Upload to POV pipeline"
   - "Upload to TRR pipeline"
   - "Upload to Knowledge Base"
   - "Upload to Scenario pipeline"

#### Method 3: Right-Click Menu
1. Right-click on a note in the file explorer
2. Select "Upload to Cortex"
3. Choose your pipeline

#### Method 4: Editor Menu
1. Open a note
2. Right-click in the editor
3. Select "Upload to Cortex"

### Upload Multiple Notes (Batch)

1. Right-click on a **folder** in the file explorer
2. Select "Upload folder to Cortex"
3. Review the list of files
4. Select your pipeline
5. Click "Upload All"

The plugin will:
- Recursively find all `.md` files in the folder
- Add GUIDs if missing (when auto-add is enabled)
- Upload all files in a batch request
- Show progress and results

### Understanding Pipelines

| Pipeline | Icon | Purpose | Use Case |
|----------|------|---------|----------|
| **POV** | 🎯 | Proof of Value | Project proposals, POV plans, success criteria |
| **TRR** | 🔍 | Technical Risk Review | Risk assessments, findings, validation reports |
| **Knowledge Base** | 📚 | Searchable Documentation | General documentation, guides, references |
| **Scenario** | 🚀 | Deployment Scenarios | Infrastructure scenarios, deployment configs |

### GUID Management

The plugin supports automatic GUID management:

**When Auto-add GUID is enabled:**
- Plugin checks if note has a GUID in frontmatter
- If missing, generates a new UUID v4
- Adds to frontmatter in this format:
  ```yaml
  ---
  guid: 550e8400-e29b-41d4-a716-446655440000
  created: 2025-10-23T00:00:00Z
  updated: 2025-10-23T00:00:00Z
  ---
  ```
- Updates the file before uploading

**Why GUIDs matter:**
- Enable bi-directional sync between Obsidian ↔️ Cortex
- Prevent duplicate uploads
- Track note versions across systems
- Allow precise cross-referencing

## Commands

All available commands in the command palette:

| Command | Shortcut | Description |
|---------|----------|-------------|
| `Cortex: Upload current note` | - | Upload with pipeline selection |
| `Cortex: Upload to POV pipeline` | - | Direct upload to POV |
| `Cortex: Upload to TRR pipeline` | - | Direct upload to TRR |
| `Cortex: Upload to Knowledge Base` | - | Direct upload to KB |
| `Cortex: Upload to Scenario pipeline` | - | Direct upload to Scenario |
| `Cortex: Upload folder to Cortex` | - | Batch upload current folder |

You can assign custom hotkeys to any command in Settings → Hotkeys.

## Frontmatter Support

The plugin respects and preserves your note frontmatter:

```yaml
---
guid: 550e8400-e29b-41d4-a716-446655440000
title: Customer Engagement Plan
tags: [pov, customer-success, q4-2025]
created: 2025-10-23
updated: 2025-10-23
pipeline: pov
priority: high
---

# Your note content here
```

All frontmatter is sent to Cortex and can be used for:
- Filtering and search
- Automated routing
- Metadata enrichment
- Analytics and reporting

## API Integration

### Authentication

The plugin uses Bearer token authentication:

```http
Authorization: Bearer your-api-key-here
```

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Test connection |
| `/api/notes/upload` | POST | Upload single note |
| `/api/notes/upload/batch` | POST | Upload multiple notes |
| `/api/notes/status/:guid` | GET | Check processing status |
| `/api/search` | GET | Search knowledge base |

### Request Format

**Single Upload:**
```json
{
  "filename": "My Note.md",
  "content": "---\nguid: ...\n---\n\n# Content",
  "frontmatter": {
    "guid": "550e8400-...",
    "title": "My Note"
  },
  "pipeline": "knowledge-base",
  "guid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Batch Upload:**
```json
{
  "notes": [
    {
      "filename": "Note 1.md",
      "content": "...",
      "pipeline": "pov"
    },
    {
      "filename": "Note 2.md",
      "content": "...",
      "pipeline": "trr"
    }
  ]
}
```

## Troubleshooting

### Connection Issues

**Problem:** "Connection failed" error

**Solutions:**
1. Verify API URL is correct (include `http://` or `https://`)
2. Check if Cortex platform is running
3. Verify network connectivity
4. Check for firewall/proxy issues
5. Try the connection test in settings

### Authentication Issues

**Problem:** "Unauthorized" or "Invalid API key"

**Solutions:**
1. Regenerate API key in Cortex platform
2. Copy the full key without extra spaces
3. Ensure the key hasn't expired
4. Check user permissions in Cortex

### Upload Failures

**Problem:** Upload fails or times out

**Solutions:**
1. Check note size (very large notes may timeout)
2. Verify note has valid markdown syntax
3. Check frontmatter YAML is valid
4. Try uploading a simple test note first
5. Check Cortex platform logs for errors

### GUID Issues

**Problem:** Duplicate GUIDs or GUID conflicts

**Solutions:**
1. Enable "Auto-add GUID" to let plugin manage them
2. Don't manually edit GUIDs once assigned
3. If you see a conflict, delete the note from Cortex and re-upload

### Plugin Not Loading

**Problem:** Plugin doesn't appear or won't enable

**Solutions:**
1. Check that `main.js` and `manifest.json` are in the plugin folder
2. Disable "Safe Mode" in Obsidian settings
3. Reload Obsidian
4. Check Obsidian console for errors (View → Toggle Developer Tools)
5. Verify you're using Obsidian v1.0.0 or higher

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/hankthebldr/cortex-dc-web.git
cd cortex-dc-web/obsidian-cortex-plugin

# Install dependencies
pnpm install

# Development build (with hot reload)
pnpm run dev

# Production build
pnpm run build
```

### Project Structure

```
obsidian-cortex-plugin/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── settings.ts       # Settings UI
│   ├── api-client.ts     # API client for Cortex
│   ├── uploader.ts       # File upload logic
│   └── modals.ts         # UI modals
├── manifest.json         # Plugin manifest
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── esbuild.config.mjs    # Build configuration
```

### Tech Stack

- **Language:** TypeScript
- **Build Tool:** esbuild
- **Obsidian API:** v1.0.0+
- **Dependencies:** uuid

## Security & Privacy

- **API keys are stored locally** in Obsidian's plugin settings
- **All communication uses HTTPS** (in production)
- **No data is sent to third parties** - only to your Cortex instance
- **Notes are uploaded over secure connections**
- **Rate limiting** prevents abuse (100 requests/minute)

## Support

### Documentation
- [Cortex DC Platform Docs](https://github.com/hankthebldr/cortex-dc-web)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

### Issues & Feature Requests
- [GitHub Issues](https://github.com/hankthebldr/cortex-dc-web/issues)

### Contact
- Email: henry@henryreed.ai
- GitHub: [@hankthebldr](https://github.com/hankthebldr)

## Changelog

### v0.1.0 (2025-10-23)

**Initial Release**
- ✨ Single note upload
- ✨ Batch folder upload
- ✨ Pipeline selection (POV, TRR, Knowledge Base, Scenario)
- ✨ Auto-GUID management
- ✨ Command palette integration
- ✨ Right-click context menus
- ✨ Settings panel with connection test
- ✨ Status tracking

## Roadmap

### v0.2.0 (Planned)
- 🔄 Bi-directional sync (pull changes from Cortex back to Obsidian)
- 📊 Processing status indicator in status bar
- 🔍 Search Cortex knowledge base from Obsidian
- 📝 Template insertion from Cortex

### v0.3.0 (Planned)
- 🤖 AI-powered note suggestions
- 🏷️ Tag-based auto-routing
- 📅 Scheduled sync
- 🔔 Real-time notifications

## License

MIT License - See [LICENSE](../LICENSE) for details

---

**Made with ❤️ by the Cortex DC Team**

⚡ **[Get Started](https://github.com/hankthebldr/cortex-dc-web)** • 📚 **[Documentation](https://github.com/hankthebldr/cortex-dc-web/tree/main/docs)** • 🐛 **[Report Issues](https://github.com/hankthebldr/cortex-dc-web/issues)**
