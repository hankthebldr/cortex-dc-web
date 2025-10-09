'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type Functions,
} from 'firebase/functions';

type ActionPayload = {
  eventName: string;
  context?: Record<string, unknown>;
};

type ActionResponse = {
  acknowledged: boolean;
  recordedAt: string;
};

let cachedApp: FirebaseApp | undefined;
let cachedFunctions: Functions | undefined;

function createFirebaseApp(): FirebaseApp {
  if (cachedApp) {
    return cachedApp;
  }

  if (getApps().length) {
    cachedApp = getApp();
    return cachedApp;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  };

  cachedApp = initializeApp(firebaseConfig);
  return cachedApp;
}

function createFunctions(): Functions {
  if (cachedFunctions) {
    return cachedFunctions;
  }

  const app = createFirebaseApp();
  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? undefined;
  cachedFunctions = getFunctions(app, region);

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST ?? 'localhost';
    const port = Number.parseInt(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_PORT ?? '5001', 10);
    connectFunctionsEmulator(cachedFunctions, host, port);
  }

  return cachedFunctions;
}

export async function sendActionEvent(eventName: string, context?: Record<string, unknown>) {
  const functions = createFunctions();
  const callable = httpsCallable<ActionPayload, ActionResponse>(functions, 'recordUiEvent');

  const payload: ActionPayload = {
    eventName,
    context,
  };

  await callable(payload);
}
