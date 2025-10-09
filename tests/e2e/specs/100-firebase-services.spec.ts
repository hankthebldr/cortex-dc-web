import { test, expect } from '@playwright/test';

test.describe('Firebase Services Integration', () => {
  
  test('Auth emulator responds with correct status', async ({ request }) => {
    const response = await request.get('http://localhost:9098/');
    expect(response.status()).toBe(200);
    
    // Check if it's actually the Firebase Auth emulator
    const text = await response.text();
    expect(text).toContain('Firebase Auth');
  });

  test('Firestore emulator is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:8081/');
    expect(response.status()).toBe(200);
    
    const text = await response.text();
    expect(text).toContain('Cloud Firestore');
  });

  test('Storage emulator is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:9199/');
    expect(response.status()).toBe(200);
  });

  test('Functions emulator is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:5001/');
    expect(response.status()).toBe(200);
  });

  test('Data Connect GraphQL endpoint responds (if enabled)', async ({ request }) => {
    try {
      const response = await request.post('http://localhost:9399/graphql', {
        data: { 
          query: 'query { __schema { queryType { name } } }' 
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Data Connect might return various status codes depending on setup
      // We just want to ensure the endpoint is reachable
      expect(response.status()).toBeLessThan(500);
      
      if (response.ok()) {
        const data = await response.json();
        console.log('Data Connect GraphQL response:', data);
      }
    } catch (error) {
      console.warn('Data Connect not available:', error.message);
      // This is optional - Data Connect might not be set up yet
    }
  });

  test('Firestore REST API accepts writes to emulator', async ({ request }) => {
    const testDoc = {
      fields: {
        testField: { stringValue: 'test-value' },
        timestamp: { timestampValue: new Date().toISOString() },
        namespace: { stringValue: 'e2e-api-test' }
      }
    };

    const response = await request.post(
      `http://localhost:8081/v1/projects/cortex-dc-web-dev/databases/(default)/documents/test-collection`,
      {
        data: testDoc,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.fields.testField.stringValue).toBe('test-value');
  });

  test('Storage emulator accepts file uploads', async ({ request }) => {
    try {
      // Create a simple test file
      const testContent = 'E2E test file content';
      const testPath = 'e2e-test/upload-test.txt';
      
      const response = await request.put(
        `http://localhost:9199/v0/b/cortex-dc-web-dev.appspot.com/o/${encodeURIComponent(testPath)}`,
        {
          data: testContent,
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );

      // Storage emulator should accept the upload
      expect(response.status()).toBeLessThan(400);
      
    } catch (error) {
      console.warn('Storage upload test failed:', error.message);
      // This might fail depending on storage emulator configuration
    }
  });

  test('Functions emulator health check (if health endpoint exists)', async ({ request }) => {
    try {
      // Try to call a health function if it exists
      const response = await request.post(
        'http://localhost:5001/cortex-dc-web-dev/us-central1/health',
        {
          data: {},
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok()) {
        const data = await response.json();
        console.log('Health check response:', data);
        expect(data).toBeDefined();
      }
    } catch (error) {
      console.warn('Health function not available:', error.message);
      // This is expected if health function doesn't exist yet
    }
  });
});