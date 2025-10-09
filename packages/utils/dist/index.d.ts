import { ClassValue } from 'clsx';

/**
 * Utility function to merge class names conditionally
 * Combines clsx functionality for flexible className handling
 */
declare function cn(...inputs: ClassValue[]): string;

declare function formatDate(date: Date): string;
declare function formatRelativeTime(date: Date): string;

declare function generateId(): string;
declare function slugify(text: string): string;

declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;

declare function validateEmail(email: string): boolean;
declare function validatePassword(password: string): boolean;

declare const APP_CONFIG: {
    readonly name: "Cortex DC Web";
    readonly version: "0.1.0";
    readonly description: "Domain Consultant Platform";
};

declare const VALIDATION_RULES: {
    readonly EMAIL_REGEX: RegExp;
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly USERNAME_MIN_LENGTH: 3;
};

interface AppConfig {
    name: string;
    version: string;
    description: string;
}
interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}
interface FormatOptions {
    locale?: string;
    timeZone?: string;
}

export { APP_CONFIG, type AppConfig, type FormatOptions, VALIDATION_RULES, type ValidationResult, cn, debounce, formatDate, formatRelativeTime, generateId, slugify, throttle, validateEmail, validatePassword };
