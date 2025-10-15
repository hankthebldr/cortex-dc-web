"use strict";
/**
 * Firebase Functions Entry Point
 * Wraps Express handlers for Firebase Functions deployment
 *
 * This file maintains backward compatibility with Firebase Functions.
 * The actual logic is in standalone Express handlers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentSummary = exports.echo = exports.healthCheck = void 0;
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
const health_handler_1 = require("./handlers/health.handler");
const echo_handler_1 = require("./handlers/echo.handler");
const environment_handler_1 = require("./handlers/environment.handler");
// Set deployment mode for logger adapter
process.env.DEPLOYMENT_MODE = 'firebase';
// Configure Firebase Functions
(0, options_1.setGlobalOptions)({
    region: 'us-central1',
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 60,
});
/**
 * Health Check Function
 * Used by monitoring systems and Kubernetes health probes
 */
exports.healthCheck = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 10,
}, health_handler_1.healthCheckHandler);
/**
 * Echo Function
 * Returns request details for testing and debugging
 */
exports.echo = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 30,
}, echo_handler_1.echoHandler);
/**
 * Environment Summary Function
 * Returns configuration and environment details
 */
exports.environmentSummary = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 10,
}, environment_handler_1.environmentHandler);
//# sourceMappingURL=index.js.map