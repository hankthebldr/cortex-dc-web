export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface FormatOptions {
  locale?: string;
  timeZone?: string;
}