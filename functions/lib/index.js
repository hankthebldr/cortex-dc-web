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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.trackAnalytics = exports.createTRR = exports.createPOV = exports.generateAIResponse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize CORS
const corsHandler = (0, cors_1.default)({ origin: true });
// Example Vertex AI integration function
exports.generateAIResponse = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        try {
            const { prompt } = request.body;
            if (!prompt) {
                response.status(400).json({ error: 'Prompt is required' });
                return;
            }
            // TODO: Integrate with Vertex AI
            // For now, return a placeholder response
            const aiResponse = `AI Response to: ${prompt}`;
            response.json({ response: aiResponse });
        }
        catch (error) {
            functions.logger.error('Error generating AI response:', error);
            response.status(500).json({ error: 'Internal server error' });
        }
    });
});
// Example POV management function
exports.createPOV = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        try {
            const { title, description, organizationId, userId } = request.body;
            if (!title || !organizationId || !userId) {
                response.status(400).json({ error: 'Required fields missing' });
                return;
            }
            const povData = {
                title,
                description: description || '',
                organizationId,
                userId,
                status: 'draft',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            const docRef = await admin.firestore().collection('povs').add(povData);
            response.json({
                id: docRef.id,
                message: 'POV created successfully',
                data: povData
            });
        }
        catch (error) {
            functions.logger.error('Error creating POV:', error);
            response.status(500).json({ error: 'Internal server error' });
        }
    });
});
// Example TRR management function  
exports.createTRR = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        try {
            const { title, description, povId, organizationId, userId, priority } = request.body;
            if (!title || !povId || !organizationId || !userId) {
                response.status(400).json({ error: 'Required fields missing' });
                return;
            }
            const trrData = {
                title,
                description: description || '',
                povId,
                organizationId,
                userId,
                status: 'pending',
                priority: priority || 'medium',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            const docRef = await admin.firestore().collection('trrs').add(trrData);
            response.json({
                id: docRef.id,
                message: 'TRR created successfully',
                data: trrData
            });
        }
        catch (error) {
            functions.logger.error('Error creating TRR:', error);
            response.status(500).json({ error: 'Internal server error' });
        }
    });
});
// Analytics function for tracking user interactions
exports.trackAnalytics = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        try {
            const { event, userId, organizationId, metadata } = request.body;
            if (!event || !userId) {
                response.status(400).json({ error: 'Event and userId are required' });
                return;
            }
            const analyticsData = {
                event,
                userId,
                organizationId: organizationId || null,
                metadata: metadata || {},
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            };
            await admin.firestore().collection('analytics').add(analyticsData);
            response.json({ message: 'Analytics tracked successfully' });
        }
        catch (error) {
            functions.logger.error('Error tracking analytics:', error);
            response.status(500).json({ error: 'Internal server error' });
        }
    });
});
// Health check function
exports.healthCheck = functions.https.onRequest((request, response) => {
    response.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0'
    });
});
//# sourceMappingURL=index.js.map