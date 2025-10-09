import { ClassValue } from 'clsx';
import * as class_variance_authority_types from 'class-variance-authority/types';
import * as React from 'react';
import React__default from 'react';
import { VariantProps } from 'class-variance-authority';

/**
 * Combines class names using clsx and merges Tailwind classes using twMerge
 */
declare function cn(...inputs: ClassValue[]): string;
/**
 * Format bytes as human-readable text
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format currency values
 */
declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
/**
 * Format percentage values
 */
declare function formatPercentage(value: number, decimals?: number, locale?: string): string;
/**
 * Debounce function calls
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function calls
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Generate a random ID
 */
declare function generateId(length?: number): string;
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
declare function isEmpty(value: any): boolean;
/**
 * Deep merge objects
 */
declare function deepMerge(target: any, ...sources: any[]): any;
/**
 * Capitalize first letter of string
 */
declare function capitalize(str: string): string;
/**
 * Convert camelCase to Title Case
 */
declare function camelToTitle(str: string): string;
/**
 * Truncate string with ellipsis
 */
declare function truncate(str: string, length: number): string;
/**
 * Format relative time (e.g., "2 hours ago")
 */
declare function formatRelativeTime(date: Date): string;
/**
 * Sleep utility for async operations
 */
declare function sleep(ms: number): Promise<void>;
/**
 * Get contrasting text color for background
 */
declare function getContrastingColor(hexColor: string): string;
/**
 * Validate email format
 */
declare function isValidEmail(email: string): boolean;
/**
 * Validate URL format
 */
declare function isValidUrl(url: string): boolean;
/**
 * Copy text to clipboard
 */
declare function copyToClipboard(text: string): Promise<boolean>;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "cortex" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

declare const Card: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    helperText?: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
    helperText?: string;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | "cortex" | "success" | "warning" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;

declare const spinnerVariants: (props?: ({
    size?: "sm" | "lg" | "md" | "xl" | null | undefined;
    color?: "default" | "secondary" | "cortex" | "primary" | "muted" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof spinnerVariants> {
    label?: string;
}
declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLDivElement>>;

interface AppShellProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}
declare const AppShell: React.ForwardRefExoticComponent<AppShellProps & React.RefAttributes<HTMLDivElement>>;

interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href: string;
    badge?: string | number;
    roles: ('user' | 'management' | 'admin')[];
    children?: NavigationItem[];
}
interface NavigationProps {
    currentPath: string;
    userRole: 'user' | 'management' | 'admin';
    onNavigate: (href: string) => void;
    className?: string;
}
declare const Navigation: React.ForwardRefExoticComponent<NavigationProps & React.RefAttributes<HTMLDivElement>>;

interface TerminalProps {
    output?: string[];
    className?: string;
}
declare const Terminal: React__default.FC<TerminalProps>;

interface POVCardProps {
    title: string;
    description?: string;
    className?: string;
}
declare const POVCard: React__default.FC<POVCardProps>;

interface TRRStatusProps {
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    className?: string;
}
declare const TRRStatus: React__default.FC<TRRStatusProps>;

interface TerminalState {
    output: string[];
    isLoading: boolean;
    error: string | null;
}
interface UseTerminalReturn extends TerminalState {
    addLine: (line: string) => void;
    clear: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}
declare const useTerminal: () => UseTerminalReturn;

interface POV {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
interface TRR {
    id: string;
    povId: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Organization {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface User {
    id: string;
    email: string;
    name?: string;
    organizationId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export { AppShell, Badge, type BadgeProps, Button, type ButtonProps, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, type InputProps, Navigation, type NavigationItem, type Organization, type POV, POVCard, Spinner, type SpinnerProps, type TRR, TRRStatus, Terminal, type TerminalState, Textarea, type TextareaProps, type UseTerminalReturn, type User, badgeVariants, buttonVariants, camelToTitle, capitalize, cn, copyToClipboard, debounce, deepMerge, formatBytes, formatCurrency, formatPercentage, formatRelativeTime, generateId, getContrastingColor, isEmpty, isValidEmail, isValidUrl, sleep, spinnerVariants, throttle, truncate, useTerminal };
