import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';

export default defineConfig({
  testDir: './smoke-tests',
  timeout: 120 * 1000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start -- --hostname 0.0.0.0 --port ' + PORT,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
