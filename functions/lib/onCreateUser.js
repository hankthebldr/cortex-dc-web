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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCreateUser = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
// Initialize the Firebase Admin SDK to interact with Firestore
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Cloud Function: onCreateUser
 * * Triggered automatically every time a new user is created in Firebase Authentication.
 * This function creates a corresponding user document in the 'users' collection
 * in Cloud Firestore with initial data.
 */
exports.onCreateUser = functions.auth.user().onCreate(async (user) => {
    // 1. Get the new user's data from the Authentication event
    const uid = user.uid;
    const email = user.email || 'N/A';
    const displayName = user.displayName || 'Anonymous User';
    const photoURL = user.photoURL || null;
    // 2. Define the initial data structure for the Firestore document
    const userData = {
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        createdAt: firestore_1.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        role: 'user', // Default role for new users
        lastActive: firestore_1.FieldValue.serverTimestamp()
    };
    // 3. Write the document to the 'users' collection using the user's UID as the document ID
    functions.logger.info(`Creating profile for new user: ${uid}`);
    try {
        await db.collection('users').doc(uid).set(userData);
        functions.logger.info(`Successfully created user profile document for UID: ${uid}`);
        return null; // Function completed successfully
    }
    catch (error) {
        functions.logger.error(`Error creating user profile for UID: ${uid}`, error);
        // Important: You might want to log this error and handle potential failure cases
        return null;
    }
});
//# sourceMappingURL=onCreateUser.js.map