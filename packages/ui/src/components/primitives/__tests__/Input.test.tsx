import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { Input } from '../Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input field', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input label="Email" placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    });

    it('should render helper text', () => {
      render(<Input label="Email" helperText="We'll never share your email" />);
      expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument();
    });
  });

  describe('Label Association', () => {
    it('should associate label with input using htmlFor', () => {
      render(<Input label="Username" />);
      const input = screen.getByLabelText(/username/i);
      const label = screen.getByText(/username/i);
      
      expect(label).toHaveAttribute('for', input.id);
    });

    it('should generate unique IDs for multiple inputs', () => {
      render(
        <>
          <Input label="First Name" />
          <Input label="Last Name" />
        </>
      );
      
      const firstName = screen.getByLabelText(/first name/i);
      const lastName = screen.getByLabelText(/last name/i);
      
      expect(firstName.id).not.toBe(lastName.id);
    });

    it('should use provided id if specified', () => {
      render(<Input label="Email" id="custom-id" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(<Input label="Email" error="Invalid email address" />);
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email address/i);
    });

    it('should apply error styles', () => {
      render(<Input label="Email" error="Error" />);
      const input = screen.getByLabelText(/email/i);
      
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with input', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByLabelText(/email/i);
      const errorId = input.getAttribute('aria-describedby');
      
      expect(errorId).toBeTruthy();
      expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
    });

    it('should hide helper text when error is present', () => {
      const { rerender } = render(
        <Input label="Email" helperText="Helper text" />
      );
      
      expect(screen.getByText(/helper text/i)).toBeInTheDocument();
      
      rerender(<Input label="Email" helperText="Helper text" error="Error message" />);
      
      expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(/error message/i);
    });
  });

  describe('Required Field', () => {
    it('should show asterisk for required fields', () => {
      render(<Input label="Email" required />);
      const asterisk = screen.getByLabelText(/required/i);
      
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500');
    });
  });

  describe('Addons', () => {
    it('should render left addon', () => {
      const LeftAddon = () => <span data-testid="left-addon">@</span>;
      render(<Input label="Username" leftAddon={<LeftAddon />} />);
      
      expect(screen.getByTestId('left-addon')).toBeInTheDocument();
    });

    it('should render right addon', () => {
      const RightAddon = () => <span data-testid="right-addon">.com</span>;
      render(<Input label="Domain" rightAddon={<RightAddon />} />);
      
      expect(screen.getByTestId('right-addon')).toBeInTheDocument();
    });

    it('should apply padding when left addon is present', () => {
      const LeftAddon = () => <span>$</span>;
      render(<Input label="Price" leftAddon={<LeftAddon />} />);
      
      const input = screen.getByLabelText(/price/i);
      expect(input).toHaveClass('pl-10');
    });

    it('should apply padding when right addon is present', () => {
      const RightAddon = () => <span>%</span>;
      render(<Input label="Percentage" rightAddon={<RightAddon />} />);
      
      const input = screen.getByLabelText(/percentage/i);
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('Full Width', () => {
    it('should apply full width styles', () => {
      render(<Input label="Email" fullWidth />);
      const container = screen.getByLabelText(/email/i).parentElement?.parentElement;
      
      expect(container).not.toHaveClass('max-w-sm');
    });

    it('should have max-width by default', () => {
      render(<Input label="Email" />);
      const container = screen.getByLabelText(/email/i).parentElement?.parentElement;
      
      expect(container).toHaveClass('max-w-sm');
    });
  });

  describe('User Interactions', () => {
    it('should accept user input', async () => {
      const { user } = render(<Input label="Name" />);
      const input = screen.getByLabelText(/name/i);
      
      await user.type(input, 'John Doe');
      expect(input).toHaveValue('John Doe');
    });

    it('should call onChange handler', async () => {
      const handleChange = vi.fn();
      const { user } = render(<Input label="Email" onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: expect.any(String) }),
        })
      );
    });

    it('should call onBlur handler', async () => {
      const handleBlur = vi.fn();
      const { user } = render(<Input label="Email" onBlur={handleBlur} />);
      
      const input = screen.getByLabelText(/email/i);
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should disable input', () => {
      render(<Input label="Email" disabled />);
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Input label="Email" disabled />);
      const input = screen.getByLabelText(/email/i);
      
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Input Types', () => {
    it('should support different input types', () => {
      const { rerender } = render(<Input label="Text" type="text" />);
      expect(screen.getByLabelText(/text/i)).toHaveAttribute('type', 'text');

      rerender(<Input label="Email" type="email" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');

      rerender(<Input label="Password" type="password" />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Input label="Email" helperText="Enter your email" />);
      const input = screen.getByLabelText(/email/i);
      
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should set aria-invalid when error exists', () => {
      render(<Input label="Email" error="Invalid" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('should be keyboard navigable', async () => {
      const { user } = render(
        <>
          <Input label="First Name" />
          <Input label="Last Name" />
        </>
      );
      
      const firstName = screen.getByLabelText(/first name/i);
      const lastName = screen.getByLabelText(/last name/i);
      
      firstName.focus();
      expect(firstName).toHaveFocus();
      
      await user.tab();
      expect(lastName).toHaveFocus();
    });
  });

  describe('ForwardRef', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn();
      render(<Input label="Email" ref={ref} />);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });
});
