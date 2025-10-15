/**
 * Authentication Adapter Interface
 * Provides abstraction layer for both Firebase Auth and Keycloak
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: string;
  customClaims?: Record<string, any>;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface TokenPayload {
  uid: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  displayName?: string;
}

export interface AuthAdapter {
  // Sign In / Sign Up
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signOut(): Promise<void>;

  // OAuth / Social Sign In
  signInWithGoogle(): Promise<AuthResult>;
  signInWithMicrosoft?(): Promise<AuthResult>;

  // User Management
  getCurrentUser(): Promise<AuthUser | null>;
  getUserById(uid: string): Promise<AuthUser | null>;
  updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<AuthUser>;
  deleteUser(uid: string): Promise<void>;

  // Token Management
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
  verifyToken(token: string): Promise<TokenPayload>;
  refreshToken?(refreshToken: string): Promise<AuthResult>;

  // Password Management
  sendPasswordResetEmail(email: string): Promise<void>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;

  // Email Verification
  sendEmailVerification?(): Promise<void>;
  verifyEmail?(code: string): Promise<void>;

  // Custom Claims / Roles
  setCustomClaims?(uid: string, claims: Record<string, any>): Promise<void>;
  getCustomClaims?(uid: string): Promise<Record<string, any>>;

  // Auth State
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;

  // Connection
  initialize(): Promise<void>;
  isInitialized(): boolean;
}
