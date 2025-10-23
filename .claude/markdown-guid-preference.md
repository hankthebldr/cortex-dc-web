# Markdown Generation Preference
<!-- GUID: 7a8c9d2e-4f1b-4c3a-9e2d-8f7a6b5c4d3e -->

## Overview
This document establishes the standard practice for generating markdown files within the Cortex DC Platform ecosystem.

## GUID Assignment Standard

### Requirement
**All markdown files generated for code documentation, notes, and consolidation efforts MUST include a GUID (Globally Unique Identifier) in the frontmatter.**

### Purpose
1. **Direct Note Mapping** - Enable precise cross-referencing between markdown files and system records
2. **Markdown Consolidation** - Facilitate automated merging and deduplication of documentation
3. **Version Tracking** - Track document evolution across updates and migrations
4. **API Integration** - Allow external systems (Obsidian plugins, etc.) to reference specific documents

### Implementation

#### Frontmatter Format
```yaml
---
guid: 550e8400-e29b-41d4-a716-446655440000
title: Document Title
created: 2025-10-23T00:00:00Z
updated: 2025-10-23T00:00:00Z
tags: [documentation, system]
---
```

#### Alternative: HTML Comment Format
For documents where frontmatter is not appropriate:
```html
<!-- GUID: 550e8400-e29b-41d4-a716-446655440000 -->
```

### GUID Generation

**Tools:**
- Node.js: `crypto.randomUUID()` (built-in, no dependencies)
- CLI: `uuidgen` (available on most Unix systems)
- JavaScript: `crypto.randomUUID()` (browser/Node.js 18+)

**Example Code:**
```typescript
// TypeScript/JavaScript
const guid = crypto.randomUUID();
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

```bash
# Command line
uuidgen
# Returns: 550E8400-E29B-41D4-A716-446655440000
```

### Mandatory Usage

GUIDs are **REQUIRED** for:
- ✅ All generated documentation (API docs, component docs, architecture diagrams)
- ✅ Knowledge base articles
- ✅ POV/TRR reports exported to markdown
- ✅ Obsidian notes synced to the platform
- ✅ System-generated notes and templates

GUIDs are **OPTIONAL** for:
- ❌ User-created notes (unless they choose to add them)
- ❌ Temporary/scratch files
- ❌ Build artifacts

### Benefits

1. **Bidirectional Sync** - Obsidian ↔️ Platform
   - Platform knows which note in Obsidian vault corresponds to DB record
   - Updates can be pushed/pulled based on GUID matching

2. **Conflict Resolution**
   - When same note is edited in multiple places, GUID enables intelligent merging

3. **Audit Trail**
   - Track document lineage through system

4. **Search & Discovery**
   - Query by GUID for exact match
   - No ambiguity with similar titles

### Database Schema Considerations

When storing markdown content in the database, include GUID field:

```typescript
interface MarkdownDocument {
  id: string;                    // Database ID
  guid: string;                  // Markdown GUID (from frontmatter)
  title: string;
  content: string;               // Full markdown content
  frontmatter: Record<string, any>;
  created: Date;
  updated: Date;
}
```

### Migration Strategy

For existing markdown files without GUIDs:
1. Generate GUID for each file
2. Add to frontmatter or as HTML comment
3. Update database records with new GUID
4. Log mapping in migration audit file

### Validation

CI/CD pipeline should validate:
- ✅ All generated markdown includes valid GUID
- ✅ GUID format is RFC 4122 compliant (UUID v4)
- ✅ No duplicate GUIDs exist in codebase

**Validation Script Location:** `scripts/validation/validate-markdown-guids.ts`

---

**Adopted:** 2025-10-23
**Status:** Active
**Applies To:** All markdown generation in Cortex DC Platform
**Review Cycle:** Quarterly
