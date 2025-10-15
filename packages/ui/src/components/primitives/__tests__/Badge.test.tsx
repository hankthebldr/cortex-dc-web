import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Badge } from '../Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByRole('status')).toHaveTextContent('Active');
    });

    it('should apply variant styles', () => {
      const { rerender } = render(<Badge variant="default">Default</Badge>);
      let badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-gray-100');

      rerender(<Badge variant="success">Success</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-100');

      rerender(<Badge variant="warning">Warning</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-yellow-100');

      rerender(<Badge variant="error">Error</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-red-100');

      rerender(<Badge variant="info">Info</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-blue-100');

      rerender(<Badge variant="primary">Primary</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-primary-100');
    });

    it('should apply size styles', () => {
      const { rerender } = render(<Badge size="sm">Small</Badge>);
      let badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-xs');

      rerender(<Badge size="md">Medium</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-sm');

      rerender(<Badge size="lg">Large</Badge>);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Dot Indicator', () => {
    it('should render dot when dot prop is true', () => {
      render(<Badge dot>With Dot</Badge>);
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('.h-1\\.5');
      
      expect(dot).toBeInTheDocument();
    });

    it('should not render dot by default', () => {
      render(<Badge>Without Dot</Badge>);
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('.h-1\\.5');
      
      expect(dot).not.toBeInTheDocument();
    });

    it('should hide dot when icon is present', () => {
      const Icon = () => <span data-testid="icon">✓</span>;
      render(<Badge dot icon={<Icon />}>With Icon</Badge>);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('.h-1\\.5');
      expect(dot).not.toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const Icon = () => <span data-testid="badge-icon">★</span>;
      render(<Badge icon={<Icon />}>Starred</Badge>);
      
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
      expect(screen.getByText('Starred')).toBeInTheDocument();
    });

    it('should hide icon aria from screen readers', () => {
      const Icon = () => <span data-testid="badge-icon">★</span>;
      render(<Badge icon={<Icon />}>Starred</Badge>);
      
      const iconWrapper = screen.getByTestId('badge-icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles', () => {
      render(<Badge variant="success">Active</Badge>, { theme: 'dark' });
      const badge = screen.getByRole('status');
      
      // Dark mode classes should be present
      expect(badge).toHaveClass('dark:bg-green-900/30');
      expect(badge).toHaveClass('dark:text-green-300');
    });
  });

  describe('Accessibility', () => {
    it('should have status role', () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should support custom HTML attributes', () => {
      render(<Badge data-testid="custom-badge">Custom</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('should be keyboard accessible as part of parent', () => {
      render(
        <button>
          <Badge>1</Badge> Notification
        </button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('1 Notification');
    });
  });

  describe('Custom Styling', () => {
    it('should merge custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('custom-badge');
      expect(badge).toHaveClass('inline-flex'); // Base class
    });
  });

  describe('Semantic Usage', () => {
    it('should work as status indicator', () => {
      render(<Badge variant="success">Online</Badge>);
      expect(screen.getByRole('status')).toHaveTextContent('Online');
    });

    it('should work as count indicator', () => {
      render(<Badge variant="error">99+</Badge>);
      expect(screen.getByRole('status')).toHaveTextContent('99+');
    });

    it('should work as tag/label', () => {
      render(<Badge variant="info">New Feature</Badge>);
      expect(screen.getByRole('status')).toHaveTextContent('New Feature');
    });
  });
});
