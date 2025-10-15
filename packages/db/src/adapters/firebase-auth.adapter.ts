/**
 * Firebase Authentication Adapter
 * Implements AuthAdapter interface for Firebase Authentication
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  IdTokenResult,
} from 'firebase/auth';
import { auth } from '../legacy/firebase-config';
import {
  AuthAdapter,
  AuthUser,
  AuthResult,
  SignInCredentials,
  SignUpCredentials,
  TokenPayload,
} from './auth.adapter';

export class FirebaseAuthAdapter implements AuthAdapter {
  private initialized: boolean = false;
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser, tokenResult?: IdTokenResult): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: tokenResult?.claims?.role as string | undefined,
      customClaims: tokenResult?.claims,
    };
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const tokenResult = await userCredential.user.getIdTokenResult();
    const token = await userCredential.user.getIdToken();

    return {
      user: this.mapFirebaseUser(userCredential.user, tokenResult),
      token,
      refreshToken: userCredential.user.refreshToken,
    };
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // Update profile if displayName provided
    if (credentials.displayName) {
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName,
      });
    }

    const tokenResult = await userCredential.user.getIdTokenResult();
    const token = await userCredential.user.getIdToken();

    return {
      user: this.mapFirebaseUser(userCredential.user, tokenResult),
      token,
      refreshToken: userCredential.user.refreshToken,
    };
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async signInWithGoogle(): Promise<AuthResult> {
    const userCredential = await signInWithPopup(auth, this.googleProvider);

    const tokenResult = await userCredential.user.getIdTokenResult();
    const token = await userCredential.user.getIdToken();

    return {
      user: this.mapFirebaseUser(userCredential.user, tokenResult),
      token,
      refreshToken: userCredential.user.refreshToken,
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    const tokenResult = await currentUser.getIdTokenResult();
    return this.mapFirebaseUser(currentUser, tokenResult);
  }

  async getUserById(uid: string): Promise<AuthUser | null> {
    // Firebase client SDK doesn't support getting users by ID
    // This would need to be implemented on the server side
    throw new Error('getUserById not supported in Firebase client SDK');
  }

  async updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Can only update current user profile');
    }

    await updateProfile(currentUser, {
      displayName: data.displayName || undefined,
      photoURL: data.photoURL || undefined,
    });

    const tokenResult = await currentUser.getIdTokenResult();
    return this.mapFirebaseUser(currentUser, tokenResult);
  }

  async deleteUser(uid: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Can only delete current user');
    }

    await currentUser.delete();
  }

  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    return await currentUser.getIdToken(forceRefresh);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    // Token verification should be done server-side
    // This is a client-side decode only (not secure!)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(parts[1]));
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      ...payload,
    };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(auth, email);
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    await firebaseConfirmPasswordReset(auth, code, newPassword);
  }

  async updatePassword(newPassword: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    await firebaseUpdatePassword(currentUser, newPassword);
  }

  async sendEmailVerification(): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    await firebaseSendEmailVerification(currentUser);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        callback(this.mapFirebaseUser(firebaseUser, tokenResult));
      } else {
        callback(null);
      }
    });
  }
}

// Singleton instance
let firebaseAuthInstance: FirebaseAuthAdapter | null = null;

export function getFirebaseAuthAdapter(): FirebaseAuthAdapter {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = new FirebaseAuthAdapter();
  }
  return firebaseAuthInstance;
}
