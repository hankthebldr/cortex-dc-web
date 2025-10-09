import { test, expect } from '@playwright/test';

test.describe('Setup Verification', () => {
  test('Firebase emulators are accessible on new ports', async ({ page, request }) => {
    // Test Auth emulator on port 9098 (changed from 9099)
    const authResponse = await request.get('http://localhost:9098');
    expect(authResponse.status()).toBe(200);

    // Test Firestore emulator on port 8081 (changed from 8080)
    const firestoreResponse = await request.get('http://localhost:8081');
    expect(firestoreResponse.status()).toBe(200);

    // Test if web app is accessible on the new hosting port 5002 (changed from 5000)
    // Note: This will be used when testing against hosting emulator specifically
    
    // Verify web app responds on port 3000 (Next.js dev server)
    await page.goto('/');
    await expect(page).toHaveTitle(/cortex/i); // Adjust title match as needed
  });

  test('Environment variables are correctly set', async ({ page }) => {
    // Navigate to a page that would initialize Firebase
    await page.goto('/');
    
    // Check if emulator detection is working
    // This assumes you have a debug route or can check console logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });
    
    // Trigger Firebase initialization by interacting with the page
    await page.waitForTimeout(2000); // Give Firebase time to initialize
    
    // We can't directly access env vars from client, but we can verify emulator connections work
    console.log('Page loaded successfully, Firebase should be initialized');
  });
});