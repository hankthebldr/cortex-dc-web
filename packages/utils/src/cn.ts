import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names conditionally
 * Combines clsx functionality for flexible className handling
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}