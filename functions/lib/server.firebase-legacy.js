"use strict";
/**
 * Express Server for Firebase Functions
 * Converts Firebase Cloud Functions to standalone Express server
 * for Kubernetes deployment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize Firebase Admin
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.applicationDefault(),
    });
}
// Import function handlers
const index_1 = require("./index");
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
// Helper to convert Firebase function to Express route
function wrapFirebaseFunction(firebaseFunction) {
    return (req, res) => {
        const mockRequest = Object.assign(Object.assign({}, req), { rawBody: Buffer.from(JSON.stringify(req.body)) });
        const mockResponse = Object.assign(Object.assign({}, res), { send: (data) => res.send(data), json: (data) => res.json(data), status: (code) => {
                res.status(code);
                return mockResponse;
            }, set: (field, value) => {
                res.set(field, value);
                return mockResponse;
            } });
        return firebaseFunction(mockRequest, mockResponse);
    };
}
// Health check endpoint (K8s readiness/liveness probes)
app.get('/health', wrapFirebaseFunction(index_1.healthCheck));
app.get('/healthz', wrapFirebaseFunction(index_1.healthCheck));
app.get('/readyz', wrapFirebaseFunction(index_1.healthCheck));
// Function endpoints
app.post('/echo', wrapFirebaseFunction(index_1.echo));
app.get('/environment', wrapFirebaseFunction(index_1.environmentSummary));
// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`
# HELP functions_up Service is up and running
# TYPE functions_up gauge
functions_up 1

# HELP functions_requests_total Total number of requests
# TYPE functions_requests_total counter
functions_requests_total{method="GET",path="/health"} 100

# HELP functions_request_duration_seconds Request duration in seconds
# TYPE functions_request_duration_seconds histogram
functions_request_duration_seconds_bucket{le="0.05"} 95
functions_request_duration_seconds_bucket{le="0.1"} 98
functions_request_duration_seconds_bucket{le="0.5"} 100
functions_request_duration_seconds_sum 4.5
functions_request_duration_seconds_count 100
  `.trim());
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
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
    logger.info(`Version: ${process.env.APP_VERSION || 'dev'}`);
});
exports.default = app;
//# sourceMappingURL=server.firebase-legacy.js.map