import type { FullConfig } from '@playwright/test';
import { globalTeardown as cleanup } from './global-setup.js';

export default async function globalTeardown(config: FullConfig) {
  await cleanup();
}