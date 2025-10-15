"use strict";
/**
 * Echo Handler
 * Pure Express handler - no Firebase dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.echoHandler = echoHandler;
const logger_adapter_1 = require("../adapters/logger.adapter");
const logger = (0, logger_adapter_1.getLogger)();
/**
 * Echo endpoint - returns request details
 * Useful for testing and debugging
 */
async function echoHandler(req, res) {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method Not Allowed',
            allowed: ['POST'],
            received: req.method,
        });
        return;
    }
    const payload = {
        receivedAt: new Date().toISOString(),
        method: req.method,
        query: req.query,
        body: req.body,
    };
    // Include headers in debug mode
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
        payload.headers = req.headers;
    }
    logger.info('Echo request received', {
        method: payload.method,
        query: payload.query,
        bodySize: JSON.stringify(payload.body).length,
    });
    res.status(200).json(payload);
}
//# sourceMappingURL=echo.handler.js.map