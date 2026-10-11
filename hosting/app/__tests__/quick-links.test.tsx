/// <reference types="vitest" />

import { render } from '@testing-library/react';

import Page from '../page';

const quickLinkTargets = [
  { id: 'investigation', description: 'Investigation Workbench' },
  { id: 'ai-insights', description: 'Genkit AI Analyst' },
  { id: 'automation', description: 'Automation Designer' },
  { id: 'detection', description: 'Detection Catalog' },
  { id: 'intel', description: 'Intel Research Hub' },
] as const;

describe('Quick link targets', () => {
  it('renders each anchor target and keeps it visible', () => {
    render(<Page />);

    for (const { id, description } of quickLinkTargets) {
      const element = document.getElementById(id);
      expect(element).not.toBeNull();
      if (!element) {
        throw new Error(`Expected section for ${description} to render with id \"${id}\"`);
      }

      expect(element).toBeVisible();
    }
  });
});
