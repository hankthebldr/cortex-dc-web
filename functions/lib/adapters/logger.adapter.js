"use strict";
/**
 * Logger Adapter
 * Supports both Firebase Functions logger and standard console logging
 *
 * DEPLOYMENT_MODE=firebase → Use firebase-functions/logger
 * DEPLOYMENT_MODE=standalone → Use console (Winston-style format)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = getLogger;
exports.resetLogger = resetLogger;
/**
 * Standard Console Logger (for standalone mode)
 * Formats output similar to Winston
 */
class ConsoleLogger {
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const msg = typeof message === 'object' ? JSON.stringify(message) : message;
        const extra = args.length > 0 ? ' ' + JSON.stringify(args) : '';
        return `${timestamp} [${level.toUpperCase()}] ${msg}${extra}`;
    }
    info(message, ...args) {
        console.log(this.formatMessage('info', message, ...args));
    }
    warn(message, ...args) {
        console.warn(this.formatMessage('warn', message, ...args));
    }
    error(message, ...args) {
        console.error(this.formatMessage('error', message, ...args));
    }
    debug(message, ...args) {
        if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('debug', message, ...args));
        }
    }
}
/**
 * Firebase Functions Logger (for Firebase mode)
 * Uses firebase-functions/logger
 */
class FirebaseLogger {
    constructor() {
        try {
            // Dynamic import to avoid errors if firebase-functions not installed
            this.logger = require('firebase-functions/logger');
        }
        catch (error) {
            console.warn('firebase-functions/logger not available, falling back to console');
            this.logger = null;
        }
    }
    info(message, ...args) {
        if (this.logger) {
            this.logger.info(message, ...args);
        }
        else {
            console.log('[INFO]', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.logger) {
            this.logger.warn(message, ...args);
        }
        else {
            console.warn('[WARN]', message, ...args);
        }
    }
    error(message, ...args) {
        if (this.logger) {
            this.logger.error(message, ...args);
        }
        else {
            console.error('[ERROR]', message, ...args);
        }
    }
    debug(message, ...args) {
        if (this.logger) {
            this.logger.debug(message, ...args);
        }
        else {
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
let loggerInstance = null;
function getLogger() {
    if (loggerInstance) {
        return loggerInstance;
    }
    const mode = process.env.DEPLOYMENT_MODE;
    if (mode === 'firebase') {
        loggerInstance = new FirebaseLogger();
    }
    else {
        // Default to console logger for standalone mode
        loggerInstance = new ConsoleLogger();
    }
    return loggerInstance;
}
/**
 * Reset logger instance (for testing)
 */
function resetLogger() {
    loggerInstance = null;
}
//# sourceMappingURL=logger.adapter.js.map