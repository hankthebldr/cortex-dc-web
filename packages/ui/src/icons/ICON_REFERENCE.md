# Icon Reference Guide

This project uses **Lucide React** for all icons. Lucide provides 1000+ beautiful, consistent SVG icons.

## Installation

```bash
pnpm add lucide-react
```

## Usage

```tsx
import { Icon Name } from 'lucide-react';

<IconName className="w-4 h-4" />
```

## Commonly Used Icons

### Navigation & UI
- `Menu` - Hamburger menu
- `X` - Close/dismiss
- `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown` - Arrows
- `ChevronsLeft`, `ChevronsRight`, `ChevronsUp`, `ChevronsDown` - Double arrows
- `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` - Navigation arrows
- `Home` - Home icon
- `Settings` - Settings gear
- `Search` - Search/magnifying glass
- `Filter` - Filter funnel
- `MoreVertical`, `MoreHorizontal` - More options (three dots)

### Actions
- `Plus` - Add/create
- `Minus` - Remove/subtract
- `Edit`, `Edit2`, `Edit3` - Edit/pencil icons
- `Trash`, `Trash2` - Delete
- `Save` - Save/floppy disk
- `Download` - Download
- `Upload` - Upload
- `Copy` - Copy to clipboard
- `Check` - Checkmark
- `CheckCircle`, `CheckCircle2` - Success/complete
- `RefreshCw` - Refresh/reload
- `RotateCw`, `RotateCcw` - Rotate
- `Maximize`, `Minimize` - Maximize/minimize
- `ZoomIn`, `ZoomOut` - Zoom controls

### Status & Feedback
- `AlertCircle` - Alert/error
- `AlertTriangle` - Warning
- `Info` - Information
- `HelpCircle` - Help/question
- `CheckCircle2` - Success
- `XCircle` - Error/close
- `Loader`, `Loader2` - Loading spinner
- `Clock` - Time/pending
- `Calendar` - Date/calendar
- `Bell` - Notifications

### Files & Documents
- `File`, `FileText` - Document
- `Folder`, `FolderOpen` - Folder
- `FileCode` - Code file
- `FileJson` - JSON file
- `FileSpreadsheet` - Spreadsheet
- `Image` - Image file
- `FileVideo` - Video file
- `FileAudio` - Audio file
- `Paperclip` - Attachment

### Communication
- `Mail` - Email
- `Send` - Send message
- `MessageSquare`, `MessageCircle` - Chat/message
- `Phone` - Phone call
- `Video` - Video call

### Users & Teams
- `User` - Single user
- `Users` - Multiple users
- `UserPlus` - Add user
- `UserMinus` - Remove user
- `UserCheck` - Verified user
- `UserX` - Blocked user

### Data & Analytics
- `BarChart`, `BarChart2`, `BarChart3` - Bar charts
- `LineChart` - Line chart
- `PieChart` - Pie chart
- `TrendingUp`, `TrendingDown` - Trends
- `Activity` - Activity/pulse
- `Database` - Database

### Business & Finance
- `DollarSign` - Currency
- `CreditCard` - Payment
- `ShoppingCart` - Shopping
- `Package` - Product/package
- `Truck` - Shipping
- `Receipt` - Receipt/invoice

### Media & Content
- `Play`, `Pause` - Media controls
- `SkipBack`, `SkipForward` - Skip
- `Volume`, `Volume1`, `Volume2`, `VolumeX` - Volume controls
- `Camera` - Camera/photo
- `Mic`, `MicOff` - Microphone

### Layout & Positioning
- `Layout` - Layout grid
- `Grid` - Grid view
- `List` - List view
- `Columns` - Columns
- `Sidebar` - Sidebar
- `AlignLeft`, `AlignCenter`, `AlignRight` - Text alignment
- `AlignJustify` - Justify text

### Security & Privacy
- `Lock` - Locked
- `Unlock` - Unlocked
- `Key` - Key/password
- `Eye`, `EyeOff` - Visibility toggle
- `Shield`, `ShieldCheck` - Security/protection

### Connectivity
- `Wifi`, `WifiOff` - WiFi status
- `Bluetooth` - Bluetooth
- `Link`, `Link2` - Hyperlink
- `Unlink` - Unlink
- `Globe` - Web/internet
- `Cloud`, `CloudOff` - Cloud storage

### Development & Code
- `Code`, `Code2` - Code blocks
- `Terminal` - Terminal/console
- `GitBranch`, `GitCommit`, `GitMerge`, `GitPullRequest` - Git operations
- `Command` - Command key
- `Bug` - Bug/debugging

### Organization & Planning
- `Calendar` - Calendar
- `CalendarDays` - Multiple days
- `Clock` - Time
- `Timer` - Timer/stopwatch
- `Flag` - Flag/milestone
- `Target` - Goal/target
- `Bookmark` - Bookmark
- `Tag` - Tag/label
- `Hash` - Hashtag

### Directional & Movement
- `Move` - Move (4-way arrows)
- `MoveHorizontal`, `MoveVertical` - Directional movement
- `Maximize2` - Expand
- `Minimize2` - Collapse
- `ExternalLink` - Open in new window

## Icon Sizing

```tsx
// Extra small
<Icon className="w-3 h-3" />

// Small
<Icon className="w-4 h-4" />

// Medium (default)
<Icon className="w-5 h-5" />

// Large
<Icon className="w-6 h-6" />

// Extra large
<Icon className="w-8 h-8" />
```

## Icon Colors

Use Tailwind color classes:

```tsx
// Primary
<Icon className="text-primary-600" />

// Success
<Icon className="text-success-600" />

// Error
<Icon className="text-error-600" />

// Warning
<Icon className="text-warning-600" />

// Gray
<Icon className="text-gray-600" />
```

## Icon Accessibility

Always include `aria-label` for standalone icons:

```tsx
<Icon className="w-5 h-5" aria-label="Search" />
```

## Animation

Lucide icons work great with Tailwind animations:

```tsx
// Spin
<Loader2 className="w-5 h-5 animate-spin" />

// Pulse
<Bell className="w-5 h-5 animate-pulse" />

// Bounce
<ArrowDown className="w-5 h-5 animate-bounce" />
```

## Complete Icon List

View all available icons at: https://lucide.dev/icons/

## Import Pattern

```tsx
// Import specific icons
import {
  CheckCircle2,
  AlertCircle,
  User,
  Settings
} from 'lucide-react';

// Use in component
function MyComponent() {
  return (
    <div>
      <CheckCircle2 className="w-5 h-5 text-success-600" />
      <AlertCircle className="w-5 h-5 text-error-600" />
    </div>
  );
}
```

## Best Practices

1. **Consistent Sizing**: Use consistent icon sizes throughout your app
2. **Color Scheme**: Match icon colors to your design system
3. **Accessibility**: Always provide labels for screen readers
4. **Performance**: Import only the icons you need (tree-shaking friendly)
5. **Stroke Width**: Default is 2, but can be adjusted with `strokeWidth` prop
6. **Semantic Usage**: Use icons that match their semantic meaning

## Custom Styling

```tsx
<Icon
  className="w-6 h-6 text-primary-600"
  strokeWidth={1.5}
  absoluteStrokeWidth
/>
```
