import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(
        <EmptyState
          title="No results found"
          description="Try adjusting your search"
        />
      );
      
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const Icon = () => <span data-testid="empty-icon">📭</span>;
      render(
        <EmptyState
          icon={<Icon />}
          title="No messages"
          description="Your inbox is empty"
        />
      );
      
      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('should hide icon aria from screen readers', () => {
      const Icon = () => <span data-testid="empty-icon">📭</span>;
      render(
        <EmptyState
          icon={<Icon />}
          title="No messages"
          description="Your inbox is empty"
        />
      );
      
      const iconWrapper = screen.getByTestId('empty-icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Actions', () => {
    it('should render primary action button', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No items"
          description="Get started by creating one"
          action={{
            label: 'Create Item',
            onClick: handleAction,
          }}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
    });

    it('should call action onClick', async () => {
      const handleAction = vi.fn();
      const { user } = render(
        <EmptyState
          title="No items"
          description="Get started by creating one"
          action={{
            label: 'Create Item',
            onClick: handleAction,
          }}
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'Create Item' }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should render action with icon', () => {
      const ActionIcon = () => <span data-testid="action-icon">+</span>;
      render(
        <EmptyState
          title="No items"
          description="Create your first item"
          action={{
            label: 'Create',
            onClick: () => {},
            icon: <ActionIcon />,
          }}
        />
      );
      
      expect(screen.getByTestId('action-icon')).toBeInTheDocument();
    });

    it('should render secondary action button', () => {
      const handleSecondary = vi.fn();
      render(
        <EmptyState
          title="No items"
          description="Create or import items"
          action={{
            label: 'Create Item',
            onClick: () => {},
          }}
          secondaryAction={{
            label: 'Import Items',
            onClick: handleSecondary,
          }}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Import Items' })).toBeInTheDocument();
    });

    it('should call secondary action onClick', async () => {
      const handleSecondary = vi.fn();
      const { user } = render(
        <EmptyState
          title="No items"
          description="Create or import items"
          action={{
            label: 'Create Item',
            onClick: () => {},
          }}
          secondaryAction={{
            label: 'Import Items',
            onClick: handleSecondary,
          }}
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'Import Items' }));
      expect(handleSecondary).toHaveBeenCalledTimes(1);
    });

    it('should render without actions', () => {
      render(
        <EmptyState
          title="Loading..."
          description="Please wait"
        />
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(
        <EmptyState
          variant="default"
          title="Empty"
          description="No data"
        />
      );
      
      const container = screen.getByRole('status');
      expect(container).toHaveClass('border-2');
      expect(container).toHaveClass('border-dashed');
      expect(container).toHaveClass('rounded-xl');
    });

    it('should apply minimal variant styles', () => {
      render(
        <EmptyState
          variant="minimal"
          title="Empty"
          description="No data"
        />
      );
      
      const container = screen.getByRole('status');
      expect(container).not.toHaveClass('border-2');
      expect(container).toHaveClass('py-12');
    });
  });

  describe('Accessibility', () => {
    it('should have status role', () => {
      render(
        <EmptyState
          title="No results"
          description="Try again"
        />
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live attribute', () => {
      render(
        <EmptyState
          title="No results"
          description="Try again"
        />
      );
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <EmptyState
          title="No results"
          description="Try again"
        />
      );
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('No results');
      expect(heading.tagName).toBe('H3');
    });

    it('should be keyboard accessible for actions', async () => {
      const handleAction = vi.fn();
      const { user } = render(
        <EmptyState
          title="No items"
          description="Create one"
          action={{
            label: 'Create',
            onClick: handleAction,
          }}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Create' });
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    it('should merge custom className', () => {
      render(
        <EmptyState
          className="custom-empty"
          title="Custom"
          description="Styled"
        />
      );
      
      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-empty');
      expect(container).toHaveClass('flex'); // Base class
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles', () => {
      render(
        <EmptyState
          title="Empty"
          description="No data"
        />,
        { theme: 'dark' }
      );
      
      const container = screen.getByRole('status');
      expect(container).toHaveClass('dark:border-gray-700');
      expect(container).toHaveClass('dark:bg-gray-800/50');
    });
  });

  describe('Use Cases', () => {
    it('should work for empty search results', () => {
      render(
        <EmptyState
          title="No results found"
          description="Try different keywords or filters"
          action={{
            label: 'Clear Filters',
            onClick: () => {},
          }}
        />
      );
      
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
    });

    it('should work for empty list state', () => {
      render(
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started"
          action={{
            label: 'New Project',
            onClick: () => {},
          }}
        />
      );
      
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument();
    });

    it('should work for error state', () => {
      render(
        <EmptyState
          title="Something went wrong"
          description="We couldn't load your data. Please try again."
          action={{
            label: 'Retry',
            onClick: () => {},
          }}
          secondaryAction={{
            label: 'Contact Support',
            onClick: () => {},
          }}
        />
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact Support' })).toBeInTheDocument();
    });
  });
});
