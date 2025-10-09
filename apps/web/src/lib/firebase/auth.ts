import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  getIdTokenResult,
  type User,
  type UserCredential 
} from 'firebase/auth';
import { getClientAuth } from './client';

export type UserRole = 'user' | 'manager' | 'admin';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  const auth = getClientAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  const auth = getClientAuth();
  return signOut(auth);
}

/**
 * Get user role from custom claims
 */
export async function getUserRole(user: User): Promise<UserRole | null> {
  try {
    const tokenResult = await getIdTokenResult(user, true);
    return (tokenResult.claims.role as UserRole) || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Convert Firebase User to AuthUser with role information
 */
export async function toAuthUser(user: User): Promise<AuthUser> {
  const role = await getUserRole(user);
  
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    role
  };
}

/**
 * Subscribe to auth state changes with role information
 */
export function observeAuthUser(callback: (user: AuthUser | null) => void): () => void {
  const auth = getClientAuth();
  
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const authUser = await toAuthUser(firebaseUser);
      callback(authUser);
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to role changes only
 */
export function observeRole(callback: (role: UserRole | null) => void): () => void {
  return observeAuthUser((user) => {
    callback(user?.role || null);
  });
}

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    manager: 2, 
    admin: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        const authUser = await toAuthUser(firebaseUser);
        resolve(authUser);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Test users for development/testing
 */
export const TEST_USERS = {
  user: {
    email: 'user1@dev.local',
    password: 'Password123!',
    role: 'user' as UserRole
  },
  manager: {
    email: 'manager1@dev.local',
    password: 'Password123!',
    role: 'manager' as UserRole
  },
  admin: {
    email: 'admin1@dev.local',
    password: 'Password123!',
    role: 'admin' as UserRole
  }
} as const;