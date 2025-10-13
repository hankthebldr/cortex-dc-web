/**
 * Argument Parser
 * Simple command-line argument parser for terminal commands
 *
 * Migrated from henryreed.ai/hosting/lib/arg-parser.ts
 */

export type ArgType = 'boolean' | 'string' | 'enum';

export interface ArgSpecItem {
  flag: string;          // e.g. --scenario-type
  type: ArgType;
  enumValues?: string[];
  default?: any;
}

export type ArgSpec = ArgSpecItem[];

export interface ParsedArgs {
  _: string[]; // positional
  [key: string]: any;
}

export function parseArgs(spec: ArgSpec, argv: string[]): ParsedArgs {
  const out: ParsedArgs = { _: [] };
  const indexByFlag = new Map(spec.map(s => [s.flag, s] as const));

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const item = indexByFlag.get(token);
    if (!item) {
      out._.push(token);
      continue;
    }

    if (item.type === 'boolean') {
      out[item.flag] = true;
    } else {
      const val = argv[i + 1];
      if (val === undefined || val.startsWith('--')) {
        // missing value, use default or undefined
        out[item.flag] = item.default;
      } else {
        if (item.type === 'enum' && item.enumValues && !item.enumValues.includes(val)) {
          out[item.flag] = item.default ?? item.enumValues[0];
        } else {
          out[item.flag] = val;
        }
        i++;
      }
    }
  }

  // fill defaults
  for (const s of spec) {
    const k = s.flag;
    if (!(k in out) && s.default !== undefined) out[k] = s.default;
  }

  return out;
}

/**
 * Convert parsed args back to command string
 */
export function argsToString(args: ParsedArgs): string {
  const parts: string[] = [];

  // Add positional arguments first
  if (args._.length > 0) {
    parts.push(...args._);
  }

  // Add flag arguments
  for (const [key, value] of Object.entries(args)) {
    if (key === '_') continue;

    if (typeof value === 'boolean' && value) {
      parts.push(key);
    } else if (value !== undefined && value !== null) {
      parts.push(key, String(value));
    }
  }

  return parts.join(' ');
}

/**
 * Validate args against spec
 */
export function validateArgs(args: ParsedArgs, spec: ArgSpec): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of spec) {
    const value = args[item.flag];

    // Check enum values
    if (item.type === 'enum' && value !== undefined && item.enumValues) {
      if (!item.enumValues.includes(value)) {
        errors.push(`Invalid value for ${item.flag}: ${value}. Expected one of: ${item.enumValues.join(', ')}`);
      }
    }

    // Check boolean type
    if (item.type === 'boolean' && value !== undefined && typeof value !== 'boolean') {
      errors.push(`Invalid type for ${item.flag}: expected boolean, got ${typeof value}`);
    }

    // Check string type
    if (item.type === 'string' && value !== undefined && typeof value !== 'string') {
      errors.push(`Invalid type for ${item.flag}: expected string, got ${typeof value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default { parseArgs, argsToString, validateArgs };
