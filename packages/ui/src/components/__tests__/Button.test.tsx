/**
 * Button Component Tests
 * Testing user-facing behavior of the Button component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('forwards ref to button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      // Attempt to click - should be blocked by disabled state
      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('can be focused and activated with keyboard', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');

      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Press Space to activate
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading prop is true', () => {
      render(<Button loading>Submit</Button>);

      // Loading spinner should be present
      const button = screen.getByRole('button');
      expect(button).toContainHTML('animate-spin');
    });

    it('is disabled when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={handleClick}>
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Attempt to click should not trigger handler
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('still shows button text when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has reduced opacity when disabled', () => {
      const { container } = render(<Button disabled>Click me</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/opacity-50/);
    });
  });

  describe('Variants', () => {
    it('applies default variant styles by default', () => {
      const { container } = render(<Button>Default</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/bg-primary/);
    });

    it('applies destructive variant styles', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/bg-destructive/);
    });

    it('applies outline variant styles', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/border/);
    });

    it('applies secondary variant styles', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/bg-secondary/);
    });

    it('applies ghost variant styles', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/hover:bg-accent/);
    });

    it('applies link variant styles', () => {
      const { container } = render(<Button variant="link">Link</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/underline/);
    });

    it('applies cortex variant styles', () => {
      const { container } = render(<Button variant="cortex">Cortex</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/cortex-gradient/);
    });
  });

  describe('Sizes', () => {
    it('applies default size by default', () => {
      const { container } = render(<Button>Default Size</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/h-10/);
    });

    it('applies small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/h-9/);
    });

    it('applies large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/h-11/);
    });

    it('applies icon size', () => {
      const { container } = render(<Button size="icon">🔍</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/h-10 w-10/);
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/custom-class/);
    });

    it('passes through HTML button attributes', () => {
      render(
        <Button type="submit" aria-label="Submit form" data-testid="submit-btn">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
      expect(button).toHaveAttribute('data-testid', 'submit-btn');
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Accessible Button</Button>);

      // Navigate with Tab
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('maintains focus ring on focus', () => {
      const { container } = render(<Button>Focus me</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/focus-visible:ring/);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined children gracefully', () => {
      render(<Button>{undefined}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('can combine loading and variant props', () => {
      const { container } = render(
        <Button loading variant="destructive">
          Delete
        </Button>
      );
      const button = container.firstChild as HTMLElement;
      expect(button.className).toMatch(/bg-destructive/);
      expect(button).toContainHTML('animate-spin');
    });
  });
});
