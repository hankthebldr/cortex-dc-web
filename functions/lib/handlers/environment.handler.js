"use strict";
/**
 * Environment Handler
 * Pure Express handler - no Firebase dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentHandler = environmentHandler;
const logger_adapter_1 = require("../adapters/logger.adapter");
const logger = (0, logger_adapter_1.getLogger)();
/**
 * Environment summary endpoint
 * Returns configuration and environment details
 */
async function environmentHandler(req, res) {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({
            error: 'Method Not Allowed',
            allowed: ['GET'],
            received: req.method,
        });
        return;
    }
    const payload = {
        environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
        message: process.env.PUBLIC_HELLO_MESSAGE || 'Welcome to Cortex Data Connect!',
        version: process.env.APP_VERSION || 'dev',
        deployment: process.env.DEPLOYMENT_MODE || 'standalone',
        nodeVersion: process.version,
    };
    logger.info('Environment summary requested', {
        environment: payload.environment,
        deployment: payload.deployment,
    });
    res.status(200).json(payload);
}
//# sourceMappingURL=environment.handler.js.map