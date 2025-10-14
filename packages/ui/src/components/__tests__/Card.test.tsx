/**
 * Card Component Tests
 * Testing the Card component and its sub-components
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card Component Suite', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/rounded-lg/);
      expect(card.className).toMatch(/border/);
      expect(card.className).toMatch(/shadow-sm/);
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/custom-class/);
      expect(card.className).toMatch(/rounded-lg/); // Still has base styles
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });

    it('passes through HTML div attributes', () => {
      render(
        <Card data-testid="test-card" aria-label="Test card">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('aria-label', 'Test card');
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardHeader>
            <p>Header content</p>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies header styles', () => {
      const { container } = render(
        <CardHeader>
          <p>Header</p>
        </CardHeader>
      );
      const header = container.firstChild as HTMLElement;
      expect(header.className).toMatch(/flex/);
      expect(header.className).toMatch(/flex-col/);
      expect(header.className).toMatch(/space-y-1.5/);
      expect(header.className).toMatch(/p-6/);
    });

    it('accepts custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header">Header</CardHeader>
      );
      const header = container.firstChild as HTMLElement;
      expect(header.className).toMatch(/custom-header/);
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Test Title</CardTitle>);
      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H3');
    });

    it('applies title styles', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.firstChild as HTMLElement;
      expect(title.className).toMatch(/text-2xl/);
      expect(title.className).toMatch(/font-semibold/);
      expect(title.className).toMatch(/leading-none/);
    });

    it('renders text content', () => {
      render(<CardTitle>My Card Title</CardTitle>);
      expect(screen.getByText('My Card Title')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders as paragraph element', () => {
      render(<CardDescription>Test description</CardDescription>);
      const description = screen.getByText('Test description');
      expect(description.tagName).toBe('P');
    });

    it('applies description styles', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.firstChild as HTMLElement;
      expect(description.className).toMatch(/text-sm/);
      expect(description.className).toMatch(/text-muted-foreground/);
    });

    it('renders text content', () => {
      render(<CardDescription>This is a description</CardDescription>);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(
        <CardContent>
          <p>Content area</p>
        </CardContent>
      );
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.firstChild as HTMLElement;
      expect(content.className).toMatch(/p-6/);
      expect(content.className).toMatch(/pt-0/);
    });

    it('accepts custom className', () => {
      const { container } = render(
        <CardContent className="custom-content">Content</CardContent>
      );
      const content = container.firstChild as HTMLElement;
      expect(content.className).toMatch(/custom-content/);
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('applies footer styles', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer.className).toMatch(/flex/);
      expect(footer.className).toMatch(/items-center/);
      expect(footer.className).toMatch(/p-6/);
      expect(footer.className).toMatch(/pt-0/);
    });

    it('accepts custom className', () => {
      const { container } = render(
        <CardFooter className="custom-footer">Footer</CardFooter>
      );
      const footer = container.firstChild as HTMLElement;
      expect(footer.className).toMatch(/custom-footer/);
    });
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all sub-components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content of the card</p>
          </CardContent>
          <CardFooter>
            <button>Primary Action</button>
            <button>Secondary Action</button>
          </CardFooter>
        </Card>
      );

      // Verify all parts are rendered
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description goes here')).toBeInTheDocument();
      expect(screen.getByText('Main content of the card')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /primary action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /secondary action/i })).toBeInTheDocument();
    });

    it('renders card with only content (no header or footer)', () => {
      render(
        <Card>
          <CardContent>
            <p>Simple card content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Simple card content')).toBeInTheDocument();
    });

    it('renders card with header but no footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic HTML structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      );

      // Title should be an h3
      const title = screen.getByText('Accessible Card');
      expect(title.tagName).toBe('H3');
    });

    it('supports ARIA attributes', () => {
      render(
        <Card aria-label="Product card" role="article">
          <CardContent>Product details</CardContent>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Product card');
    });

    it('allows custom ID for linking', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle id="card-title">Title</CardTitle>
          </CardHeader>
          <CardContent aria-labelledby="card-title">
            Content described by title
          </CardContent>
        </Card>
      );

      const content = screen.getByText('Content described by title');
      expect(content).toHaveAttribute('aria-labelledby', 'card-title');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty card', () => {
      const { container } = render(<Card />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles nested cards', () => {
      render(
        <Card data-testid="outer-card">
          <CardContent>
            <Card data-testid="inner-card">
              <CardContent>Nested content</CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('outer-card')).toBeInTheDocument();
      expect(screen.getByTestId('inner-card')).toBeInTheDocument();
    });

    it('handles multiple CardHeaders', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>First Header</CardTitle>
          </CardHeader>
          <CardHeader>
            <CardTitle>Second Header</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('First Header')).toBeInTheDocument();
      expect(screen.getByText('Second Header')).toBeInTheDocument();
    });

    it('handles rich content in CardContent', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h4>Subtitle</h4>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});
