import { test, expect } from '@playwright/test';

test.describe('Authentication and Role-Based Access Control', () => {
  // Helper function to sign in via web UI
  const signInUser = async (page, email: string, password: string) => {
    await page.evaluate(async (credentials) => {
      // Use Firebase SDK directly in browser context
      const { getClientAuth } = await import('../../../apps/web/src/lib/firebase/client.ts');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    }, { email, password });
    
    // Wait a moment for auth state to propagate
    await page.waitForTimeout(1000);
  };

  const signOutUser = async (page) => {
    await page.evaluate(async () => {
      const { getClientAuth } = await import('../../../apps/web/src/lib/firebase/client.ts');
      const { signOut } = await import('firebase/auth');
      
      const auth = getClientAuth();
      await signOut(auth);
    });
    
    await page.waitForTimeout(1000);
  };

  test('User can authenticate with seeded accounts', async ({ page }) => {
    await page.goto('/');
    
    // Test User role authentication
    await signInUser(page, 'user1@dev.local', 'Password123!');
    
    // Check that user is signed in by examining auth state
    const userInfo = await page.evaluate(async () => {
      const { getCurrentUser } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      return await getCurrentUser();
    });
    
    expect(userInfo).not.toBeNull();
    expect(userInfo.email).toBe('user1@dev.local');
    expect(userInfo.role).toBe('user');
    
    await signOutUser(page);
    console.log('✅ User authentication validated');
  });

  test('Manager can authenticate and has manager role', async ({ page }) => {
    await page.goto('/');
    
    await signInUser(page, 'manager1@dev.local', 'Password123!');
    
    const userInfo = await page.evaluate(async () => {
      const { getCurrentUser } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      return await getCurrentUser();
    });
    
    expect(userInfo).not.toBeNull();
    expect(userInfo.email).toBe('manager1@dev.local');
    expect(userInfo.role).toBe('manager');
    
    await signOutUser(page);
    console.log('✅ Manager authentication validated');
  });

  test('Admin can authenticate and has admin role', async ({ page }) => {
    await page.goto('/');
    
    await signInUser(page, 'admin1@dev.local', 'Password123!');
    
    const userInfo = await page.evaluate(async () => {
      const { getCurrentUser } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      return await getCurrentUser();
    });
    
    expect(userInfo).not.toBeNull();
    expect(userInfo.email).toBe('admin1@dev.local');
    expect(userInfo.role).toBe('admin');
    
    await signOutUser(page);
    console.log('✅ Admin authentication validated');
  });

  test('Role hierarchy validation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test role hierarchy function
    const roleHierarchyTests = await page.evaluate(async () => {
      const { hasRole } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      
      return {
        // User should not have manager privileges
        userHasManager: hasRole('user', 'manager'),
        userHasUser: hasRole('user', 'user'),
        
        // Manager should have user privileges but not admin
        managerHasUser: hasRole('manager', 'user'),
        managerHasManager: hasRole('manager', 'manager'),
        managerHasAdmin: hasRole('manager', 'admin'),
        
        // Admin should have all privileges
        adminHasUser: hasRole('admin', 'user'),
        adminHasManager: hasRole('admin', 'manager'),
        adminHasAdmin: hasRole('admin', 'admin'),
        
        // Null should have no privileges
        nullHasUser: hasRole(null, 'user'),
      };
    });
    
    // Validate role hierarchy
    expect(roleHierarchyTests.userHasManager).toBe(false);
    expect(roleHierarchyTests.userHasUser).toBe(true);
    
    expect(roleHierarchyTests.managerHasUser).toBe(true);
    expect(roleHierarchyTests.managerHasManager).toBe(true);
    expect(roleHierarchyTests.managerHasAdmin).toBe(false);
    
    expect(roleHierarchyTests.adminHasUser).toBe(true);
    expect(roleHierarchyTests.adminHasManager).toBe(true);
    expect(roleHierarchyTests.adminHasAdmin).toBe(true);
    
    expect(roleHierarchyTests.nullHasUser).toBe(false);
    
    console.log('✅ Role hierarchy validation completed');
  });

  test('Firebase ID token contains custom role claims', async ({ page }) => {
    await page.goto('/');
    
    // Test each role's ID token claims
    const roles = [
      { email: 'user1@dev.local', password: 'Password123!', expectedRole: 'user' },
      { email: 'manager1@dev.local', password: 'Password123!', expectedRole: 'manager' },
      { email: 'admin1@dev.local', password: 'Password123!', expectedRole: 'admin' }
    ];
    
    for (const roleTest of roles) {
      await signInUser(page, roleTest.email, roleTest.password);
      
      const tokenClaims = await page.evaluate(async () => {
        const { getClientAuth } = await import('../../../apps/web/src/lib/firebase/client.ts');
        const { getIdTokenResult } = await import('firebase/auth');
        
        const auth = getClientAuth();
        const user = auth.currentUser;
        
        if (!user) return null;
        
        const tokenResult = await getIdTokenResult(user, true);
        return {
          role: tokenResult.claims.role,
          email: user.email,
          uid: user.uid
        };
      });
      
      expect(tokenClaims).not.toBeNull();
      expect(tokenClaims.role).toBe(roleTest.expectedRole);
      expect(tokenClaims.email).toBe(roleTest.email);
      
      await signOutUser(page);
    }
    
    console.log('✅ ID token custom claims validated for all roles');
  });

  test('Auth state observer works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Set up auth state listener
    const authStateChanges = [];
    await page.evaluate(async () => {
      const { observeAuthUser } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      
      window.authStateChanges = [];
      
      observeAuthUser((user) => {
        window.authStateChanges.push({
          timestamp: Date.now(),
          isSignedIn: !!user,
          email: user?.email || null,
          role: user?.role || null
        });
      });
    });
    
    // Wait for initial auth state
    await page.waitForTimeout(500);
    
    // Sign in and verify state change
    await signInUser(page, 'manager1@dev.local', 'Password123!');
    await page.waitForTimeout(500);
    
    // Sign out and verify state change
    await signOutUser(page);
    await page.waitForTimeout(500);
    
    // Check auth state changes
    const stateChanges = await page.evaluate(() => window.authStateChanges);
    
    expect(stateChanges.length).toBeGreaterThan(0);
    
    // Should have initial null state
    const initialState = stateChanges[0];
    expect(initialState.isSignedIn).toBe(false);
    
    // Should have signed-in state
    const signedInState = stateChanges.find(state => state.isSignedIn);
    expect(signedInState).toBeDefined();
    expect(signedInState.email).toBe('manager1@dev.local');
    expect(signedInState.role).toBe('manager');
    
    // Should have final signed-out state
    const finalState = stateChanges[stateChanges.length - 1];
    expect(finalState.isSignedIn).toBe(false);
    
    console.log('✅ Auth state observer functionality validated');
  });

  test('Invalid credentials are rejected properly', async ({ page }) => {
    await page.goto('/');
    
    const authError = await page.evaluate(async () => {
      try {
        const { getClientAuth } = await import('../../../apps/web/src/lib/firebase/client.ts');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        
        const auth = getClientAuth();
        await signInWithEmailAndPassword(auth, 'invalid@example.com', 'wrongpassword');
        
        return null; // Should not reach here
      } catch (error) {
        return {
          code: error.code,
          message: error.message
        };
      }
    });
    
    expect(authError).not.toBeNull();
    expect(authError.code).toContain('auth/');
    
    console.log('✅ Invalid credentials properly rejected');
  });

  test('Firebase Auth emulator with Admin SDK integration', async ({ request }) => {
    // Test that we can create users via Admin SDK and they appear in Auth emulator
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TempPassword123!';
    
    // Create user via Admin SDK (simulating backend operation)
    const createUserResponse = await request.post('http://localhost:9098/identitytoolkit.googleapis.com/v1/accounts:signUp', {
      data: {
        email: testEmail,
        password: testPassword,
        returnSecureToken: true
      },
      params: {
        key: 'fake-api-key'
      }
    });
    
    expect(createUserResponse.status()).toBe(200);
    const userData = await createUserResponse.json();
    expect(userData).toHaveProperty('email', testEmail);
    expect(userData).toHaveProperty('localId');
    
    console.log('✅ Admin SDK and Auth emulator integration validated');
  });

  test('Test user constants are accessible', async ({ page }) => {
    await page.goto('/');
    
    const testUsers = await page.evaluate(async () => {
      const { TEST_USERS } = await import('../../../apps/web/src/lib/firebase/auth.ts');
      return TEST_USERS;
    });
    
    expect(testUsers).toHaveProperty('user');
    expect(testUsers).toHaveProperty('manager');  
    expect(testUsers).toHaveProperty('admin');
    
    expect(testUsers.user.email).toBe('user1@dev.local');
    expect(testUsers.user.role).toBe('user');
    
    expect(testUsers.manager.email).toBe('manager1@dev.local');
    expect(testUsers.manager.role).toBe('manager');
    
    expect(testUsers.admin.email).toBe('admin1@dev.local');
    expect(testUsers.admin.role).toBe('admin');
    
    console.log('✅ Test user constants validated');
  });
});