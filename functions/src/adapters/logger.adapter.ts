/**
 * Logger Adapter
 * Supports both Firebase Functions logger and standard console logging
 *
 * DEPLOYMENT_MODE=firebase → Use firebase-functions/logger
 * DEPLOYMENT_MODE=standalone → Use console (Winston-style format)
 */

export interface Logger {
  info(message: string | object, ...args: any[]): void;
  warn(message: string | object, ...args: any[]): void;
  error(message: string | object, ...args: any[]): void;
  debug(message: string | object, ...args: any[]): void;
}

/**
 * Standard Console Logger (for standalone mode)
 * Formats output similar to Winston
 */
class ConsoleLogger implements Logger {
  private formatMessage(level: string, message: string | object, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    const extra = args.length > 0 ? ' ' + JSON.stringify(args) : '';
    return `${timestamp} [${level.toUpperCase()}] ${msg}${extra}`;
  }

  info(message: string | object, ...args: any[]) {
    console.log(this.formatMessage('info', message, ...args));
  }

  warn(message: string | object, ...args: any[]) {
    console.warn(this.formatMessage('warn', message, ...args));
  }

  error(message: string | object, ...args: any[]) {
    console.error(this.formatMessage('error', message, ...args));
  }

  debug(message: string | object, ...args: any[]) {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }
}

/**
 * Firebase Functions Logger (for Firebase mode)
 * Uses firebase-functions/logger
 */
class FirebaseLogger implements Logger {
  private logger: any;

  constructor() {
    try {
      // Dynamic import to avoid errors if firebase-functions not installed
      this.logger = require('firebase-functions/logger');
    } catch (error) {
      console.warn('firebase-functions/logger not available, falling back to console');
      this.logger = null;
    }
  }

  info(message: string | object, ...args: any[]) {
    if (this.logger) {
      this.logger.info(message, ...args);
    } else {
      console.log('[INFO]', message, ...args);
    }
  }

  warn(message: string | object, ...args: any[]) {
    if (this.logger) {
      this.logger.warn(message, ...args);
    } else {
      console.warn('[WARN]', message, ...args);
    }
  }

  error(message: string | object, ...args: any[]) {
    if (this.logger) {
      this.logger.error(message, ...args);
    } else {
      console.error('[ERROR]', message, ...args);
    }
  }

  debug(message: string | object, ...args: any[]) {
    if (this.logger) {
      this.logger.debug(message, ...args);
    } else {
      if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
        console.debug('[DEBUG]', message, ...args);
      }
    }
  }
}

/**
 * Logger Factory
 * Returns appropriate logger based on DEPLOYMENT_MODE
 */
let loggerInstance: Logger | null = null;

export function getLogger(): Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const mode = process.env.DEPLOYMENT_MODE;

  if (mode === 'firebase') {
    loggerInstance = new FirebaseLogger();
  } else {
    // Default to console logger for standalone mode
    loggerInstance = new ConsoleLogger();
  }

  return loggerInstance;
}

/**
 * Reset logger instance (for testing)
 */
export function resetLogger(): void {
  loggerInstance = null;
}
