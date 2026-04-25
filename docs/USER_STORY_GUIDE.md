# User Story & Component Development Guide

## Table of Contents
1. [User Story Development Process](#user-story-development-process)
2. [Component Development Workflow](#component-development-workflow)
3. [Frontend Best Practices](#frontend-best-practices)
4. [Collaboration Guidelines](#collaboration-guidelines)

---

## User Story Development Process

### User Story Template

Use the following template for all new features:

```markdown
## User Story

**As a** [type of user]
**I want** [an action]
**So that** [a benefit/value]

### Acceptance Criteria

Given [context]
When [action]
Then [expected outcome]

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Requirements

- **Data Model**: What entities/fields are needed?
- **API Endpoints**: What endpoints need to be created/modified?
- **UI Components**: What components are involved?
- **State Management**: How will state be managed?
- **Validation**: What validation rules apply?
- **Authorization**: Who can access this feature?

### Test Cases

1. **Happy Path**: [describe]
2. **Edge Cases**: [describe]
3. **Error Handling**: [describe]

### Definition of Done

- [ ] Code written and reviewed
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] Deployed to dev environment
- [ ] PM/Stakeholder approval
```

### Example: TRR Creation Feature

```markdown
## User Story: Create Technical Resource Request

**As a** Domain Consultant
**I want to** create a new Technical Resource Request (TRR)
**So that** I can track technical requirements for my customer engagement

### Acceptance Criteria

**Given** I am an authenticated user
**When** I navigate to the TRR creation page
**Then** I should see a form with the following fields:
- [ ] Title (required, max 200 chars)
- [ ] Description (optional, max 2000 chars)
- [ ] Priority (dropdown: low, medium, high, critical)
- [ ] Status (auto-set to 'draft')
- [ ] Due Date (date picker)
- [ ] Assigned To (user selector)
- [ ] Organization (auto-populated from my org)

**Given** I have filled in required fields
**When** I click "Create TRR"
**Then** the TRR should be saved with my userId as createdBy
**And** I should be redirected to the TRR detail page
**And** I should see a success toast notification

**Given** I try to submit without required fields
**When** I click "Create TRR"
**Then** I should see validation error messages
**And** the form should not submit

### Technical Requirements

**Data Model:**
```typescript
interface TRR {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  organizationId: string;
  userId: string;
  createdBy: string;
  assignedTo?: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**API Endpoints:**
- `POST /api/trrs` - Create new TRR
- Validation: Zod schema
- Authorization: Authenticated user

**UI Components:**
- `FormField` - Title input
- `FormTextarea` - Description
- `FormSelect` - Priority dropdown
- `FormButton` - Submit button
- `Toast` - Success/error notifications

**State Management:**
- Local form state with useState
- SWR mutation for API calls
- Automatic cache revalidation

**Validation:**
- Client-side: Zod schema
- Server-side: Zod schema validation
- Display field-level errors

**Authorization:**
- User must be authenticated
- User must belong to an organization
- TRR automatically scoped to user's organization

### Test Cases

1. **Happy Path:**
   - Fill valid form → Submit → TRR created → Redirected to detail page

2. **Edge Cases:**
   - Very long title (199 chars) → Should accept
   - Title exactly 200 chars → Should accept
   - Title 201 chars → Should reject with error

3. **Error Handling:**
   - Network failure → Show error toast, keep form data
   - Server validation error → Show field errors
   - Unauthorized → Redirect to login

### Definition of Done

- [x] TRR schema created with Zod validation
- [x] POST /api/trrs endpoint with auth + validation
- [x] TRR creation form component
- [x] Success/error toast notifications
- [x] Form validation with error display
- [x] Unit tests for schema validation
- [x] Integration tests for API endpoint
- [x] E2E test for creation flow
- [ ] Documentation in README
- [ ] Demo video recorded
```

---

## Component Development Workflow

### 1. Plan Component Architecture

Before coding, answer these questions:

**Component Type:**
- [ ] Primitive (Button, Input, Badge)
- [ ] Composite (Form, DataTable, Modal)
- [ ] Feature (TRRList, ProjectDashboard)
- [ ] Page (TRRListPage, ProjectDetailPage)

**Component Responsibilities:**
- What is the single purpose of this component?
- What props does it need?
- What state does it manage?
- Does it fetch data?
- Does it mutate data?

**Component Dependencies:**
- What primitives does it use?
- What external packages does it need?
- What services does it call?

### 2. Component File Structure

```
component-name/
├── ComponentName.tsx       # Main component file
├── ComponentName.test.tsx  # Unit tests
├── ComponentName.stories.tsx # Storybook (optional)
├── index.tsx              # Export file
└── types.ts               # Type definitions (if complex)
```

### 3. Component Template

```tsx
'use client';

/**
 * ComponentName - Brief description
 *
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 *
 * Usage:
 * ```tsx
 * <ComponentName prop1="value" prop2={true} />
 * ```
 */

import React from 'react';
import { Icon } from 'lucide-react';

export interface ComponentNameProps {
  /**
   * Description of prop1
   */
  prop1: string;
  /**
   * Description of prop2
   * @default false
   */
  prop2?: boolean;
  /**
   * Optional CSS classes
   */
  className?: string;
  /**
   * Callback when action occurs
   */
  onAction?: () => void;
}

export function ComponentName({
  prop1,
  prop2 = false,
  className = '',
  onAction,
}: ComponentNameProps) {
  // Hooks at the top
  const [state, setState] = React.useState(false);

  // Event handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };

  // Render helpers (if needed)
  const renderContent = () => {
    if (state) return <div>Active</div>;
    return <div>Inactive</div>;
  };

  // Main render
  return (
    <div className={`component-base ${className}`}>
      {renderContent()}
      <button onClick={handleClick}>Action</button>
    </div>
  );
}

export default ComponentName;
```

### 4. Component Checklist

Before marking a component as "done":

**Functionality:**
- [ ] Component renders without errors
- [ ] All props work as documented
- [ ] Default props work correctly
- [ ] Callbacks fire as expected
- [ ] Edge cases handled

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader friendly

**Styling:**
- [ ] Responsive on all screen sizes
- [ ] Follows design system tokens
- [ ] Dark mode support (if applicable)
- [ ] Loading states styled
- [ ] Error states styled

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Expensive operations memoized
- [ ] Large lists virtualized (if applicable)
- [ ] Images optimized

**Testing:**
- [ ] Unit tests written
- [ ] Integration tests (if applicable)
- [ ] Accessibility tests
- [ ] Visual regression tests (if applicable)

**Documentation:**
- [ ] JSDoc comments added
- [ ] Props documented
- [ ] Usage example provided
- [ ] Exported from index.tsx
- [ ] Added to Storybook (optional)

---

## Frontend Best Practices

### 1. Component Organization

**Directory Structure:**
```
packages/ui/src/components/
├── primitives/          # Atomic components
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   └── index.ts
├── forms/               # Form components
│   ├── FormField/
│   ├── FormSelect/
│   └── index.ts
├── data/                # Data display
│   ├── DataTable/
│   ├── Card/
│   └── index.ts
├── feedback/            # User feedback
│   ├── Toast/
│   ├── Modal/
│   └── index.ts
├── trr/                 # Feature-specific
│   ├── TRRList/
│   ├── TRRCard/
│   └── index.ts
└── index.ts             # Main export
```

### 2. State Management Guidelines

**Local State (useState):**
- Use for: UI state, form inputs, toggles
- Example: Modal open/closed, input values

**Server State (SWR):**
- Use for: Data fetching, caching, revalidation
- Example: TRR list, user profile, project details

**URL State (useSearchParams):**
- Use for: Shareable/bookmarkable state
- Example: Filters, pagination, search queries

**Context API:**
- Use for: Global app state
- Example: Auth user, theme, language

**When NOT to use state:**
- Derived values (use useMemo)
- Props (pass down directly)
- Constants (define outside component)

### 3. Performance Optimization

**Code Splitting:**
```tsx
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

**Memoization:**
```tsx
// Memoize expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

**Virtualization:**
```tsx
// For long lists (1000+ items)
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 4. Error Handling

**Try-Catch for Async Operations:**
```tsx
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    await createTRR(data);
    toast.success('TRR created successfully');
    router.push('/trr');
  } catch (err) {
    console.error('Error creating TRR:', err);
    setError(err.message);
    toast.error('Failed to create TRR');
  } finally {
    setLoading(false);
  }
};
```

**Error Boundaries:**
```tsx
// Use Next.js error.tsx for route-level error handling
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 5. TypeScript Best Practices

**Always Define Types:**
```tsx
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// Bad
function UserCard({ user }: { user: any }) {
  return <div>{user.name}</div>;
}
```

**Use Zod for Runtime Validation:**
```tsx
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// Validate at runtime
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

---

## Collaboration Guidelines

### How to Guide Me on Development

#### 1. Start with User Stories

**Good:**
> "As a Domain Consultant, I want to filter TRRs by status so that I can quickly find pending requests. The filter should be a dropdown with options: All, Draft, Pending, In Progress, Completed. It should update the list immediately without page reload."

**Why it's good:**
- Clear user persona
- Specific goal
- Defined UI behavior
- Expected functionality

**Bad:**
> "Add a filter to TRRs"

**Why it's bad:**
- No context
- Unclear requirements
- Missing details

#### 2. Be Specific About Requirements

**Good:**
> "The TRR title field should:
> - Be required
> - Have a max length of 200 characters
> - Show character count
> - Display validation error if empty on submit
> - Trim whitespace before saving"

**Bad:**
> "Add a title field"

#### 3. Provide Examples

**Good:**
> "The status badge should look like this:
> - Draft: gray background, gray text
> - Pending: yellow background, yellow text
> - Completed: green background, white text
> Similar to GitHub PR status badges"

**Bad:**
> "Add status colors"

#### 4. Describe Data Flow

**Good:**
> "When user clicks 'Create TRR':
> 1. Validate form locally
> 2. If valid, show loading spinner on button
> 3. Call POST /api/trrs with form data
> 4. On success: show toast, redirect to /trr/{id}
> 5. On error: show error toast, keep form data"

**Bad:**
> "Make the create button work"

#### 5. Reference Existing Patterns

**Good:**
> "The TRR list should work like the POV list in /pov/page.tsx - same search, filter, and pagination pattern"

**Bad:**
> "Add a list"

### Development Workflow

#### Phase 1: Requirements Gathering
**You provide:**
- User story with acceptance criteria
- Mockups or references (if available)
- Technical constraints
- Priority level

**I will:**
- Ask clarifying questions
- Propose technical approach
- Identify dependencies
- Estimate complexity

#### Phase 2: Planning
**I will:**
- Break down into tasks
- Create component hierarchy
- Design data model
- Plan API endpoints

**You review:**
- Component structure
- Data model
- API design
- Ask questions or request changes

#### Phase 3: Implementation
**I will:**
- Implement features incrementally
- Write tests as I go
- Follow best practices
- Commit frequently with clear messages

**You can:**
- Review code in progress
- Request changes
- Add new requirements (if small)

#### Phase 4: Review & Iterate
**I will:**
- Create PR with description
- Run all tests
- Deploy to dev environment

**You:**
- Test functionality
- Provide feedback
- Approve or request changes

### Quick Reference: What to Tell Me

**For New Features:**
```markdown
1. What: [description]
2. Who: [user type]
3. Why: [business value]
4. Acceptance Criteria: [bullet points]
5. Reference: [similar feature or mockup]
```

**For Bug Fixes:**
```markdown
1. Current Behavior: [what's happening]
2. Expected Behavior: [what should happen]
3. Steps to Reproduce: [numbered list]
4. Screenshots: [if applicable]
```

**For Refactoring:**
```markdown
1. Component/File: [path]
2. Problem: [why it needs refactoring]
3. Goal: [desired outcome]
4. Constraints: [what must stay the same]
```

**For Questions:**
```markdown
1. Context: [what you're trying to do]
2. What you've tried: [approaches attempted]
3. Specific question: [what you need to know]
```

---

## Common Patterns

### Pattern: CRUD Feature

```markdown
## Feature: [Entity] Management

### Create
- Route: /[entity]/new
- Component: [Entity]CreateForm
- API: POST /api/[entity]
- Validation: Zod schema
- Authorization: User must be authenticated

### Read (List)
- Route: /[entity]
- Component: [Entity]List
- API: GET /api/[entity]
- Features: Search, filter, pagination, sort

### Read (Detail)
- Route: /[entity]/[id]
- Component: [Entity]Detail
- API: GET /api/[entity]/[id]
- Features: View, edit, delete actions

### Update
- Route: /[entity]/[id]/edit
- Component: [Entity]EditForm
- API: PUT /api/[entity]/[id]
- Validation: Zod schema
- Authorization: User owns entity

### Delete
- Modal: Confirmation dialog
- API: DELETE /api/[entity]/[id]
- Authorization: User owns entity
- UX: Optimistic update, undo option
```

### Pattern: Filtered List

```markdown
## Feature: [Entity] Filtered List

### UI Components
- Search input (global filter)
- Filter dropdowns (status, priority, etc.)
- Sort selector
- Results count
- Pagination controls

### State Management
- URL search params for filters
- SWR for data fetching
- Debounced search input

### API
- GET /api/[entity]?search=&status=&page=&limit=
- Returns: { data: [], total: number, page: number }

### Features
- Real-time search (debounced)
- Multiple filters (combinable)
- Persistent filters (in URL)
- Loading states
- Empty states
```

---

## Next Steps

1. **Review this guide** and let me know if anything is unclear
2. **Start with a user story** for your next feature
3. **Use the templates** provided above
4. **Iterate** as we build together

Would you like me to:
- Create a specific user story template for TRR features?
- Build a component you have in mind?
- Refactor existing code?
- Add new functionality?

Just follow the patterns above and I'll help you build enterprise-grade features!
