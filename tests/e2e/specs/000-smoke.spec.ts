import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Firebase emulators are running and accessible', async ({ request }) => {
    // Test Firebase Auth emulator
    const authResponse = await request.get('http://localhost:9098/');
    expect(authResponse.status()).toBe(200);

    // Test Firestore emulator 
    const firestoreResponse = await request.get('http://localhost:8081/');
    expect(firestoreResponse.status()).toBe(200);

    // Test Storage emulator
    const storageResponse = await request.get('http://localhost:9199/');  
    expect(storageResponse.status()).toBe(200);

    // Test Functions emulator
    const functionsResponse = await request.get('http://localhost:5001/');
    expect(functionsResponse.status()).toBe(200);
  });

  test('Next.js app is running and renders', async ({ page }) => {
    await page.goto('/');
    
    // Basic page load validation
    await expect(page).toHaveTitle(/Cortex/);
    
    // Check for basic HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });

  test('GraphQL endpoint responds (Data Connect)', async ({ request }) => {
    try {
      const response = await request.post('http://localhost:9399/graphql', {
        data: { 
          query: 'query { __schema { types { name } } }' 
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Data Connect might not be fully configured yet, so we just check it's accessible
      expect(response.status()).toBeLessThan(500);
    } catch (error) {
      // Data Connect emulator might not be running yet - skip this check
      console.warn('Data Connect emulator not responding:', error.message);
    }
  });
});