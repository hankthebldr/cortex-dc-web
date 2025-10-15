"use strict";
/**
 * Health Check Handler
 * Pure Express handler - no Firebase dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckHandler = healthCheckHandler;
const logger_adapter_1 = require("../adapters/logger.adapter");
const logger = (0, logger_adapter_1.getLogger)();
/**
 * Health check endpoint for Kubernetes probes
 * Returns 200 OK with system status
 */
async function healthCheckHandler(req, res) {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    const payload = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || 'dev',
        deployment: process.env.DEPLOYMENT_MODE || 'standalone',
    };
    logger.debug('Health check ping', payload);
    res.status(200).json(payload);
}
//# sourceMappingURL=health.handler.js.map