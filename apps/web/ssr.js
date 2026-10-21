import { onRequest } from 'firebase-functions/v2/https';
import { handle } from 'firebase-frameworks/next';

export const ssrcortexdcweb = onRequest({ region: 'us-central1' }, handle);
