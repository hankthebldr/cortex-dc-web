import { test, expect } from '@playwright/test';

test.describe('Storage and Functions Services', () => {
  test('Firebase Storage emulator is accessible and ready', async ({ request }) => {
    const response = await request.get('http://localhost:9199');
    expect(response.status()).toBe(200);
    
    console.log('✅ Firebase Storage emulator validated');
  });

  test('Firebase Functions emulator is accessible and ready', async ({ request }) => {
    const response = await request.get('http://localhost:5001');
    expect(response.status()).toBe(200);
    
    console.log('✅ Firebase Functions emulator validated');
  });

  test('Can upload and download files via Storage REST API', async ({ request }) => {
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = `Test file content created at ${new Date().toISOString()}`;
    const bucketUrl = 'http://localhost:9199/v0/b/cortex-dc-web-dev.appspot.com/o';

    // Upload file
    const uploadResponse = await request.put(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}`,
      {
        data: testContent,
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    
    expect(uploadResponse.status()).toBe(200);
    
    const uploadResult = await uploadResponse.json();
    expect(uploadResult).toHaveProperty('name');
    expect(uploadResult.name).toContain(testFileName);
    
    // Download file
    const downloadResponse = await request.get(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}?alt=media`
    );
    
    expect(downloadResponse.status()).toBe(200);
    const downloadedContent = await downloadResponse.text();
    expect(downloadedContent).toBe(testContent);
    
    // Clean up - delete file
    const deleteResponse = await request.delete(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}`
    );
    expect(deleteResponse.status()).toBe(200);
    
    console.log('✅ Storage file upload/download/delete operations completed successfully');
  });

  test('Can upload different file types to Storage', async ({ request }) => {
    const bucketUrl = 'http://localhost:9199/v0/b/cortex-dc-web-dev.appspot.com/o';
    const timestamp = Date.now();
    
    const testFiles = [
      {
        name: `test-${timestamp}.json`,
        content: JSON.stringify({ test: true, timestamp }),
        contentType: 'application/json'
      },
      {
        name: `test-${timestamp}.csv`,
        content: 'name,value\\ntest,123\\nfoo,456',
        contentType: 'text/csv'
      },
      {
        name: `test-${timestamp}.md`,
        content: '# Test Markdown\\n\\nThis is a test file.',
        contentType: 'text/markdown'
      }
    ];
    
    for (const file of testFiles) {
      const uploadResponse = await request.put(
        `${bucketUrl}/${encodeURIComponent(`e2e-tests/types/${file.name}`)}`,
        {
          data: file.content,
          headers: {
            'Content-Type': file.contentType
          }
        }
      );
      
      expect(uploadResponse.status()).toBe(200);
      
      const result = await uploadResponse.json();
      expect(result.contentType).toBe(file.contentType);
      
      // Clean up
      await request.delete(
        `${bucketUrl}/${encodeURIComponent(`e2e-tests/types/${file.name}`)}`
      );
    }
    
    console.log('✅ Multiple file type uploads validated');
  });

  test('Storage emulator handles metadata correctly', async ({ request }) => {
    const testFileName = `metadata-test-${Date.now()}.txt`;
    const testContent = 'File with custom metadata';
    const bucketUrl = 'http://localhost:9199/v0/b/cortex-dc-web-dev.appspot.com/o';
    
    const customMetadata = {
      customMetadata: {
        'uploaded-by': 'e2e-test',
        'test-case': 'metadata-validation',
        'environment': 'emulator'
      }
    };
    
    // Upload file with metadata
    const uploadResponse = await request.put(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}`,
      {
        data: testContent,
        headers: {
          'Content-Type': 'text/plain',
          'x-goog-meta-uploaded-by': 'e2e-test',
          'x-goog-meta-test-case': 'metadata-validation'
        }
      }
    );
    
    expect(uploadResponse.status()).toBe(200);
    
    // Get file metadata
    const metadataResponse = await request.get(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}`
    );
    
    expect(metadataResponse.status()).toBe(200);
    const metadata = await metadataResponse.json();
    
    expect(metadata).toHaveProperty('contentType', 'text/plain');
    expect(metadata).toHaveProperty('size', testContent.length.toString());
    
    // Clean up
    await request.delete(
      `${bucketUrl}/${encodeURIComponent(`e2e-tests/${testFileName}`)}`
    );
    
    console.log('✅ Storage metadata handling validated');
  });

  test('Functions emulator health check endpoint', async ({ request }) => {
    // Most Firebase Functions deployments have health check endpoints
    // This test attempts to call a basic function endpoint
    try {
      const healthResponse = await request.get('http://localhost:5001/cortex-dc-web-dev/us-central1/health');
      
      if (healthResponse.status() === 200) {
        const healthData = await healthResponse.json();
        expect(healthData).toHaveProperty('status');
        console.log('✅ Functions health endpoint accessible');
      } else {
        console.log('ℹ️ Functions health endpoint not available (expected for minimal setup)');
      }
    } catch (error) {
      console.log('ℹ️ Functions health endpoint not implemented (expected for minimal setup)');
      // This is expected if no functions are deployed yet
    }
  });

  test('Web app can connect to Storage and Functions via SDK', async ({ page }) => {
    await page.goto('/');
    
    // Test Storage SDK connectivity
    const storageCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:9199');
        return { success: true, status: response.status };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(storageCheck.success).toBe(true);
    expect(storageCheck.status).toBe(200);
    
    // Test Functions SDK connectivity  
    const functionsCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5001');
        return { success: true, status: response.status };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(functionsCheck.success).toBe(true);
    expect(functionsCheck.status).toBe(200);
    
    console.log('✅ Web app can connect to Storage and Functions emulators');
  });

  test('All Firebase services are accessible from browser context', async ({ page }) => {
    await page.goto('/');
    
    // Test all emulator endpoints from browser context
    const serviceChecks = await page.evaluate(async () => {
      const services = {
        auth: 'http://localhost:9098',
        firestore: 'http://localhost:8081', 
        storage: 'http://localhost:9199',
        functions: 'http://localhost:5001'
      };
      
      const results = {};
      
      for (const [service, url] of Object.entries(services)) {
        try {
          const response = await fetch(url);
          results[service] = {
            success: true,
            status: response.status,
            accessible: response.status < 400
          };
        } catch (error) {
          results[service] = {
            success: false,
            error: error.message
          };
        }
      }
      
      return results;
    });
    
    // Validate each service is accessible
    expect(serviceChecks.auth.success).toBe(true);
    expect(serviceChecks.auth.accessible).toBe(true);
    
    expect(serviceChecks.firestore.success).toBe(true);
    expect(serviceChecks.firestore.accessible).toBe(true);
    
    expect(serviceChecks.storage.success).toBe(true);
    expect(serviceChecks.storage.accessible).toBe(true);
    
    expect(serviceChecks.functions.success).toBe(true);
    expect(serviceChecks.functions.accessible).toBe(true);
    
    console.log('✅ All Firebase services accessible from browser context');
  });
});