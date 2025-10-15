"use strict";
/**
 * Express Server for Cortex Functions
 * Pure Express server with no Firebase dependencies
 * Supports both standalone and Firebase deployment modes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_adapter_1 = require("./adapters/logger.adapter");
const health_handler_1 = require("./handlers/health.handler");
const echo_handler_1 = require("./handlers/echo.handler");
const environment_handler_1 = require("./handlers/environment.handler");
const logger = (0, logger_adapter_1.getLogger)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
});
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});
// Health check endpoints (Kubernetes readiness/liveness probes)
app.get('/health', health_handler_1.healthCheckHandler);
app.get('/healthz', health_handler_1.healthCheckHandler);
app.get('/readyz', health_handler_1.healthCheckHandler);
// Function endpoints
app.post('/echo', echo_handler_1.echoHandler);
app.get('/environment', environment_handler_1.environmentHandler);
// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`
# HELP functions_up Service is up and running
# TYPE functions_up gauge
functions_up 1

# HELP functions_deployment_mode Current deployment mode
# TYPE functions_deployment_mode gauge
functions_deployment_mode{mode="${process.env.DEPLOYMENT_MODE || 'standalone'}"} 1

# HELP functions_version Service version
# TYPE functions_version info
functions_version{version="${process.env.APP_VERSION || 'dev'}"} 1
  `.trim());
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /health',
            'GET /healthz',
            'GET /readyz',
            'POST /echo',
            'GET /environment',
            'GET /metrics',
        ],
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        timestamp: new Date().toISOString(),
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Functions microservice running on ${HOST}:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Deployment Mode: ${process.env.DEPLOYMENT_MODE || 'standalone'}`);
    logger.info(`Version: ${process.env.APP_VERSION || 'dev'}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map