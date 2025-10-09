import { test, expect } from '@playwright/test';

test.describe('Firebase Services Integration', () => {
  test('Firebase Auth emulator provides correct API', async ({ request }) => {
    const response = await request.get('http://localhost:9098');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('authEmulator');
    expect(body.authEmulator).toHaveProperty('ready', true);
    expect(body.authEmulator).toHaveProperty('host');
    expect(body.authEmulator).toHaveProperty('port', 9098);
    
    console.log('✅ Auth emulator API validated');
  });

  test('Firebase Firestore emulator is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:8081');
    expect(response.status()).toBe(200);
    
    // Test basic Firestore REST API
    const firestoreResponse = await request.get(
      'http://localhost:8081/v1/projects/cortex-dc-web-dev/databases/(default)/documents'
    );
    expect(firestoreResponse.status()).toBe(200);
    
    console.log('✅ Firestore emulator REST API validated');
  });

  test('Can create and read test document in Firestore', async ({ request }) => {
    const testDoc = {
      fields: {
        message: { stringValue: "Hello from E2E test" },
        timestamp: { integerValue: Date.now().toString() },
        testFlag: { booleanValue: true }
      }
    };

    // Create document
    const createResponse = await request.post(
      'http://localhost:8081/v1/projects/cortex-dc-web-dev/databases/(default)/documents/e2e-tests',
      {
        data: testDoc
      }
    );
    expect(createResponse.status()).toBe(200);
    
    const created = await createResponse.json();
    expect(created).toHaveProperty('name');
    const docId = created.name.split('/').pop();
    
    // Read document back
    const readResponse = await request.get(
      `http://localhost:8081/v1/projects/cortex-dc-web-dev/databases/(default)/documents/e2e-tests/${docId}`
    );
    expect(readResponse.status()).toBe(200);
    
    const read = await readResponse.json();
    expect(read.fields.message.stringValue).toBe("Hello from E2E test");
    expect(read.fields.testFlag.booleanValue).toBe(true);
    
    console.log('✅ Firestore document CRUD operations validated');
  });

  test('Web app can connect to Firebase SDK', async ({ page }) => {
    await page.goto('/');
    
    // Check for Firebase initialization errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('firebase')) {
        errors.push(msg.text());
      }
    });
    
    // Wait for page to initialize
    await page.waitForTimeout(3000);
    
    // No Firebase errors should occur
    expect(errors).toHaveLength(0);
    
    console.log('✅ Firebase SDK integration with web app validated');
  });
});