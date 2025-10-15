"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentSummary = exports.echo = exports.healthCheck = void 0;
const options_1 = require("firebase-functions/v2/options");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
(0, options_1.setGlobalOptions)({
    region: "us-central1",
    maxInstances: 10,
});
const APP_VERSION = (_a = process.env.APP_VERSION) !== null && _a !== void 0 ? _a : "dev";
const allowCors = (res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};
exports.healthCheck = (0, https_1.onRequest)((request, response) => {
    allowCors(response);
    const payload = {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
    };
    logger.debug("Health check ping", payload);
    response.status(200).json(payload);
});
exports.echo = (0, https_1.onRequest)((request, response) => {
    allowCors(response);
    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }
    if (request.method !== "POST") {
        response.status(405).json({
            error: "Method Not Allowed",
            allowed: ["POST"],
        });
        return;
    }
    const payload = {
        receivedAt: new Date().toISOString(),
        method: request.method,
        query: request.query,
        body: request.body,
    };
    logger.info("Echo payload", payload);
    response.status(200).json(payload);
});
exports.environmentSummary = (0, https_1.onRequest)((request, response) => {
    var _a, _b;
    allowCors(response);
    if (request.method !== "GET") {
        response.status(405).json({
            error: "Method Not Allowed",
            allowed: ["GET"],
        });
        return;
    }
    const payload = {
        environment: (_a = process.env.APP_ENV) !== null && _a !== void 0 ? _a : "development",
        message: (_b = process.env.PUBLIC_HELLO_MESSAGE) !== null && _b !== void 0 ? _b : "Welcome to Cortex Data Connect!",
        version: APP_VERSION,
    };
    logger.info("Environment summary requested", payload);
    response.status(200).json(payload);
});
//# sourceMappingURL=index.firebase-legacy.js.map