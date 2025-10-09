import * as functions from "firebase-functions/v1";
import {UserRecord} from "firebase-functions/v1/auth";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK to interact with Firestore
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Cloud Function: onCreateUser
 * Triggered automatically when a new user is created in Firebase Auth.
 * This function creates a corresponding user document in the users collection
 * in Cloud Firestore with initial data.
 */
export const onCreateUser = functions.auth.user().onCreate(
  async (user: UserRecord) => {
    // 1. Get the new user's data from the Authentication event
    const uid = user.uid;
    const email = user.email || "N/A";
    const displayName = user.displayName || "Anonymous User";
    const photoURL = user.photoURL || null;

    // 2. Define the initial data structure for the Firestore document
    const userData = {
      email: email,
      displayName: displayName,
      photoURL: photoURL,
      createdAt: FieldValue.serverTimestamp(),
      role: "user", // Default role for new users
      lastActive: FieldValue.serverTimestamp(),
    };

    // 3. Write document to users collection using the user's UID as document ID
    functions.logger.info(`Creating profile for new user: ${uid}`);

    try {
      await db.collection("users").doc(uid).set(userData);
      functions.logger.info(
        `Successfully created user profile document for UID: ${uid}`
      );
      return null; // Function completed successfully
    } catch (error) {
      functions.logger.error(
        `Error creating user profile for UID: ${uid}`, error
      );
      // Important: log error and handle potential failure cases
      return null;
    }
  }
);
