import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary-500');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-500');
    });

    it('should apply size styles', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-12');
    });

    it('should apply fullWidth style', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>With Left Icon</Button>);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>With Right Icon</Button>);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('should hide icons when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button loading leftIcon={<LeftIcon />}>Loading</Button>);
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('loading') || expect.anything());
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not trigger onClick when disabled', async () => {
      const handleClick = vi.fn();
      const { user } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const { user } = render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      const { user } = render(<Button onClick={handleClick}>Press me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">Icon only</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="help-text">Action</Button>
          <div id="help-text">This is help text</div>
        </>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('As Child (Composition)', () => {
    it('should render as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/link');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // Base class
    });
  });
});
