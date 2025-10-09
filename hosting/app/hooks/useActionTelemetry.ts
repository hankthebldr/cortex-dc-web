'use client';

import { useCallback } from 'react';
import { sendActionEvent } from '../lib/firebaseClient';

type ActionContext = Record<string, unknown> | undefined;

type ActionTelemetry = (eventName: string, context?: ActionContext) => Promise<void>;

export function useActionTelemetry(): ActionTelemetry {
  return useCallback(async (eventName: string, context?: ActionContext) => {
    try {
      await sendActionEvent(eventName, context);
    } catch (error) {
      console.error('Failed to record Firebase action event', error);
    }
  }, []);
}
