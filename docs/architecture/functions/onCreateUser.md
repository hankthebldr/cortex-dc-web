# Architecture: onCreateUser Cloud Function

## 1. Purpose

The `onCreateUser` Cloud Function is an event-driven function that automatically creates a profile document in Firestore when a new user signs up through Firebase Authentication. This ensures that every user has a corresponding data record for storing application-specific information, such as roles, preferences, or activity history.

## 2. Trigger

- **Service:** Firebase Authentication
- **Event Type:** User creation (`onAuthUserCreated`)

The function is invoked asynchronously whenever a new user record is created in Firebase Authentication, whether through email/password, a social provider (Google, etc.), or custom auth.

## 3. Flow Diagram

```mermaid
graph TD
    A[Firebase Auth: User Created] --> B[Cloud Function: onCreateUser Triggered];
    B --> C{Check for Existing Document};
    C -->|No| D[Create New Document in `users/{uid}`];
    C -->|Yes| E[Merge and Update Existing Document];
    D --> F[Log Creation Event];
    E --> G[Log Update Event];
    F & G --> H[Web Application Reads `users/{uid}`];
```

## 4. Data Schema

The function creates or updates documents in the `users` collection in Firestore.

- **Collection:** `users`
- **Document ID:** `{uid}` (The Firebase Auth User ID)

**Schema:**

| Field         | Type      | Description                                                 |
|---------------|-----------|-------------------------------------------------------------|
| `uid`         | `string`  | The user's unique Firebase Authentication ID.               |
| `email`       | `string`  | The user's primary email address. Nullable.                 |
| `displayName` | `string`  | The user's display name. Nullable.                          |
| `photoURL`    | `string`  | A URL to the user's profile picture. Nullable.              |
| `providerIds` | `array`   | A list of provider IDs (e.g., `password`, `google.com`).      |
| `createdAt`   | `timestamp`| The server timestamp when the Firestore document was created. |
| `updatedAt`   | `timestamp`| The server timestamp when the document was last updated.    |

## 5. Implementation Details

- **Idempotency:** The function is designed to be idempotent. If a document for the user already exists, it will merge the new information, preferring existing data to avoid overwriting application-specific fields. This handles retry scenarios and race conditions gracefully.
- **Error Handling:** Errors are logged to Cloud Logging for monitoring and debugging. The function will throw an error to signal a failure, which can be retried by the Cloud Functions service.

## 6. Integration Points

- **Web Application:** The web application can securely read the `users/{uid}` document to get profile information, relying on Firestore Security Rules to enforce access control.
- **Security Rules:** Firestore rules should be configured to allow users to read their own profile, while restricting write access to server-side processes (like this Cloud Function).
- **Analytics:** The creation of a user profile can be a key event for analytics, and this function provides a reliable trigger for such tracking.

## 7. Rollback Plan

- **Immediate:** If the function causes issues, it can be disabled by commenting out its export in `functions/src/index.ts` and redeploying (`firebase deploy --only functions`).
- **Hotfix:** A hotfix can be deployed to correct any faulty logic. The idempotent design ensures that a corrected function can safely run on existing user records.