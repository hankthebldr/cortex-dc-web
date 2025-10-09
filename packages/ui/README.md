# @cortex-dc/ui

Modern, accessible UI component library for the Cortex Domain Consultant Platform, built with shadcn/ui foundations, Radix UI primitives, and Tailwind CSS.

## 🚀 Features

- **Modern Architecture**: Built on shadcn/ui foundations with Radix UI primitives
- **Fully Accessible**: WCAG 2.1 AA compliant components with proper ARIA support
- **Typescript First**: Full TypeScript support with comprehensive type definitions
- **Themeable**: CSS variables-based theming with dark/light mode support
- **Performance Optimized**: Tree-shakeable exports, minimal bundle size
- **Cortex Branded**: Custom design tokens and branded component variants

## 📦 Components

### Base Components

- **Button**: Versatile button component with variants, sizes, and loading states
- **Input**: Form input with label, error states, and helper text
- **Textarea**: Multiline text input with validation support
- **Badge**: Status indicators with variant support
- **Card**: Flexible card layout with header, content, and footer sections
- **Spinner**: Loading indicators with size and color variants

### Layout Components

- **AppShell**: Application layout wrapper with header, sidebar, and footer support
- **Navigation**: Role-based navigation with collapsible sections and badges

### Advanced Components

- **Terminal**: Interactive terminal component (existing)

## 🎨 Design System

### Color Palette

```css
:root {
  /* Cortex Brand Colors */
  --cortex-50: #f0f9ff;
  --cortex-500: #0ea5e9;
  --cortex-700: #0369a1;
  --cortex-900: #0c4a6e;
  
  /* Semantic Colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --muted: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
}
```

### Typography

- **Font Family**: Inter (system fallback)
- **Mono Font**: JetBrains Mono (terminal/code)

### Spacing & Sizing

Built on Tailwind's spacing scale with custom radius variables.

## 🛠 Usage

### Installation

```bash
pnpm add @cortex-dc/ui
```

### Import Styles

```tsx
// In your app root (layout.tsx or _app.tsx)
import '@cortex-dc/ui/dist/index.css';
```

### Basic Usage

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@cortex-dc/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="cortex" size="lg">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
```

### With Navigation

```tsx
import { AppShell, Navigation } from '@cortex-dc/ui';

function App() {
  return (
    <AppShell
      sidebar={
        <Navigation
          currentPath="/dashboard"
          userRole="user"
          onNavigate={(href) => router.push(href)}
        />
      }
    >
      {/* Your app content */}
    </AppShell>
  );
}
```

## 🎯 Component Variants

### Button Variants

- `default`: Standard button style
- `destructive`: For dangerous actions
- `outline`: Outlined button
- `secondary`: Secondary actions
- `ghost`: Minimal button
- `link`: Link-styled button
- `cortex`: Branded gradient button

### Button Sizes

- `default`: Standard size (h-10)
- `sm`: Small size (h-9)
- `lg`: Large size (h-11)
- `icon`: Square icon button (h-10 w-10)

### Badge Variants

- `default`: Standard badge
- `secondary`: Muted badge
- `destructive`: Error/warning badge
- `outline`: Outlined badge
- `success`: Success indicator
- `warning`: Warning indicator
- `info`: Information badge
- `cortex`: Branded badge

## 🎨 Theming

The library supports custom CSS variables for theming:

```css
.my-theme {
  --primary: 200 100% 50%;
  --primary-foreground: 0 0% 98%;
  --cortex-500: #custom-brand-color;
}
```

## 🔧 Development

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Storybook (Coming Soon)

```bash
pnpm storybook
```

## 🏗 Architecture

```
src/
├── components/
│   ├── base/           # shadcn/ui base components
│   ├── layout/         # Layout components
│   ├── domain/         # Domain-specific components
│   └── terminal/       # Terminal components
├── lib/
│   └── utils.ts        # Utility functions
├── globals.css         # Global styles
└── index.ts           # Main exports
```

## 📋 Roadmap

- [ ] Data visualization components (Tremor integration)
- [ ] Form components with validation
- [ ] Command palette component
- [ ] Date picker components
- [ ] Data table components
- [ ] Storybook documentation
- [ ] Chromatic visual testing
- [ ] Component testing suite

## 🤝 Contributing

This is a private component library for the Cortex DC platform. Please follow the established patterns when adding new components.

### Adding New Components

1. Create component in appropriate directory
2. Follow shadcn/ui patterns
3. Export from main index.ts
4. Add proper TypeScript types
5. Include JSDoc documentation

---

**Built with ❤️ for the Cortex Domain Consultant Platform**