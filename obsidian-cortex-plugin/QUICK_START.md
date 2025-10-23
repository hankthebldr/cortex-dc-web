# Quick Start Guide - Cortex DC Connector
<!-- GUID: 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d -->

## Installation for Testing

Since you have the codebase and an Obsidian vault ready, here's the fastest way to get started:

### 1. Build the Plugin

```bash
cd /home/user/cortex-dc-web/obsidian-cortex-plugin
pnpm install
pnpm run build
```

### 2. Link to Your Obsidian Vault

**Option A: Symlink (Recommended for Development)**
```bash
ln -s /home/user/cortex-dc-web/obsidian-cortex-plugin /path/to/your/vault/.obsidian/plugins/cortex-dc-connector
```

**Option B: Copy Files**
```bash
mkdir -p /path/to/your/vault/.obsidian/plugins/cortex-dc-connector
cp main.js manifest.json /path/to/your/vault/.obsidian/plugins/cortex-dc-connector/
```

### 3. Enable in Obsidian

1. Open Obsidian
2. Settings → Community Plugins
3. Disable "Safe Mode" (if enabled)
4. Click "Reload plugins"
5. Find "Cortex DC Connector" and toggle it ON

### 4. Configure Plugin

1. Settings → Community Plugins → Cortex DC Connector
2. Enter your settings:
   - **API URL**: `http://localhost:3000` (or your deployment URL)
   - **API Key**: Generate one from your Cortex platform
3. Click "Test Connection" to verify

### 5. Test Upload

1. Open any note in your vault
2. Click the cloud upload icon in the ribbon (left sidebar)
3. Select "Knowledge Base" pipeline
4. Click "Upload"

You should see a success notification!

## Development Mode

For active development with hot reload:

```bash
cd /home/user/cortex-dc-web/obsidian-cortex-plugin
pnpm run dev  # Starts esbuild in watch mode
```

This will automatically rebuild when you make changes. Just reload the plugin in Obsidian to see updates.

## Testing with Your Vault

### Test Scenarios

1. **Single Note Upload**
   - Create a test note
   - Upload via ribbon icon
   - Verify it appears in Cortex platform

2. **Batch Upload**
   - Create a folder with 3-5 test notes
   - Right-click folder → "Upload folder to Cortex"
   - Verify all notes uploaded

3. **GUID Management**
   - Create a note without frontmatter
   - Upload with "Auto-add GUID" enabled
   - Check that GUID was added to frontmatter

4. **Different Pipelines**
   - Test upload to POV pipeline
   - Test upload to TRR pipeline
   - Test upload to Scenario pipeline

## Common Issues

### Plugin Not Showing Up

```bash
# Check files are in the right place
ls -la /path/to/your/vault/.obsidian/plugins/cortex-dc-connector/

# Should see:
# - main.js
# - manifest.json
```

### API Connection Failed

1. Verify Cortex platform is running: `http://localhost:3000/api/health`
2. Check API key is valid
3. Look for CORS issues in browser console

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules
pnpm install
pnpm run build
```

## Next Steps

- Read the full [README.md](./README.md) for all features
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
- Try different pipelines and features
- Test with your actual notes

## Support

Questions or issues? Check the logs:
- Obsidian: View → Toggle Developer Tools → Console tab
- Plugin errors will appear there with stack traces
