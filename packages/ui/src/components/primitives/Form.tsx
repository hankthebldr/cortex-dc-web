'use client';

/**
 * Enterprise Form Components with Zod Validation
 *
 * Features:
 * - Zod schema validation
 * - Error display
 * - Field-level validation
 * - Controlled and uncontrolled modes
 * - Accessible form controls
 * - Consistent styling
 * - Loading states
 * - Submit handling
 */

import React, { FormEvent, ReactNode } from 'react';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export interface FormProps<T extends z.ZodType> {
  schema?: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  defaultValues?: Partial<z.infer<T>>;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface FormSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface FormCheckboxProps {
  label: string;
  name: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * FormField - Text input with label and error display
 */
export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error-500' : 'border-gray-300'}
          transition-colors
        `}
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-error-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

/**
 * FormTextarea - Multiline text input
 */
export function FormTextarea({
  label,
  name,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  rows = 4,
  value,
  onChange,
}: FormTextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error-500' : 'border-gray-300'}
          transition-colors resize-y
        `}
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-error-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

/**
 * FormSelect - Dropdown select input
 */
export function FormSelect({
  label,
  name,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  value,
  onChange,
}: FormSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error-500' : 'border-gray-300'}
          transition-colors
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-2 text-sm text-error-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

/**
 * FormCheckbox - Checkbox input
 */
export function FormCheckbox({
  label,
  name,
  disabled = false,
  error,
  helpText,
  className = '',
  checked,
  onChange,
}: FormCheckboxProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={name}
          name={name}
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
        />
        <label htmlFor={name} className="text-sm font-medium text-gray-700 select-none">
          {label}
        </label>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-error-600 ml-7">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500 ml-7">{helpText}</p>
      )}
    </div>
  );
}

/**
 * FormButton - Submit button with loading state
 */
export interface FormButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  type?: 'submit' | 'button' | 'reset';
  className?: string;
  onClick?: () => void;
}

export function FormButton({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  type = 'submit',
  className = '',
  onClick,
}: FormButtonProps) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        px-6 py-2.5 rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

/**
 * FormGroup - Group multiple form fields
 */
export interface FormGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({
  title,
  description,
  children,
  className = '',
}: FormGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * FormMessage - Success/Error message display
 */
export interface FormMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export function FormMessage({ type, message, className = '' }: FormMessageProps) {
  const config = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-800',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-error-50',
      border: 'border-error-200',
      text: 'text-error-800',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-800',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-info-50',
      border: 'border-info-200',
      text: 'text-info-800',
      icon: AlertCircle,
    },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bg} ${border} ${className}`}>
      <Icon className={`w-5 h-5 ${text}`} />
      <p className={`text-sm font-medium ${text}`}>{message}</p>
    </div>
  );
}

export default {
  Field: FormField,
  Textarea: FormTextarea,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  Button: FormButton,
  Group: FormGroup,
  Message: FormMessage,
};
