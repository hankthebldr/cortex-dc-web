import {
  auth
} from "./chunk-EBK3PWYE.mjs";

// src/adapters/firebase-auth.adapter.ts
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
  updateProfile
} from "firebase/auth";
var FirebaseAuthAdapter = class {
  constructor() {
    this.initialized = false;
    this.googleProvider = new GoogleAuthProvider();
  }
  async initialize() {
    this.initialized = true;
  }
  isInitialized() {
    return this.initialized;
  }
  mapFirebaseUser(firebaseUser, tokenResult) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: tokenResult?.claims?.role,
      customClaims: tokenResult?.claims
    };
  }
  async signIn(credentials) {
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
      refreshToken: userCredential.user.refreshToken
    };
  }
  async signUp(credentials) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    if (credentials.displayName) {
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName
      });
    }
    const tokenResult = await userCredential.user.getIdTokenResult();
    const token = await userCredential.user.getIdToken();
    return {
      user: this.mapFirebaseUser(userCredential.user, tokenResult),
      token,
      refreshToken: userCredential.user.refreshToken
    };
  }
  async signOut() {
    await firebaseSignOut(auth);
  }
  async signInWithGoogle() {
    const userCredential = await signInWithPopup(auth, this.googleProvider);
    const tokenResult = await userCredential.user.getIdTokenResult();
    const token = await userCredential.user.getIdToken();
    return {
      user: this.mapFirebaseUser(userCredential.user, tokenResult),
      token,
      refreshToken: userCredential.user.refreshToken
    };
  }
  async getCurrentUser() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    const tokenResult = await currentUser.getIdTokenResult();
    return this.mapFirebaseUser(currentUser, tokenResult);
  }
  async getUserById(uid) {
    throw new Error("getUserById not supported in Firebase client SDK");
  }
  async updateUserProfile(uid, data) {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error("Can only update current user profile");
    }
    await updateProfile(currentUser, {
      displayName: data.displayName || void 0,
      photoURL: data.photoURL || void 0
    });
    const tokenResult = await currentUser.getIdTokenResult();
    return this.mapFirebaseUser(currentUser, tokenResult);
  }
  async deleteUser(uid) {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error("Can only delete current user");
    }
    await currentUser.delete();
  }
  async getIdToken(forceRefresh = false) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken(forceRefresh);
  }
  async verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const payload = JSON.parse(atob(parts[1]));
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      ...payload
    };
  }
  async sendPasswordResetEmail(email) {
    await firebaseSendPasswordResetEmail(auth, email);
  }
  async confirmPasswordReset(code, newPassword) {
    await firebaseConfirmPasswordReset(auth, code, newPassword);
  }
  async updatePassword(newPassword) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }
    await firebaseUpdatePassword(currentUser, newPassword);
  }
  async sendEmailVerification() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }
    await firebaseSendEmailVerification(currentUser);
  }
  onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        callback(this.mapFirebaseUser(firebaseUser, tokenResult));
      } else {
        callback(null);
      }
    });
  }
};
var firebaseAuthInstance = null;
function getFirebaseAuthAdapter() {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = new FirebaseAuthAdapter();
  }
  return firebaseAuthInstance;
}

// src/adapters/keycloak-auth.adapter.ts
var KeycloakAuthAdapter = class {
  constructor() {
    this.initialized = false;
    this.keycloak = null;
    // Will be Keycloak instance
    this.currentUser = null;
    const config = {
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8180",
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "cortex",
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web"
    };
    console.log("[KeycloakAuthAdapter] Configuration:", config);
  }
  async initialize() {
    this.initialized = true;
  }
  isInitialized() {
    return this.initialized;
  }
  parseToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const payload = JSON.parse(atob(parts[1]));
    return {
      uid: payload.sub,
      email: payload.email || null,
      displayName: payload.name || payload.preferred_username || null,
      photoURL: null,
      emailVerified: payload.email_verified || false,
      role: payload.role || payload.realm_access?.roles?.[0],
      customClaims: payload
    };
  }
  async signIn(credentials) {
    const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
        grant_type: "password",
        username: credentials.email,
        password: credentials.password
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || "Authentication failed");
    }
    const data = await response.json();
    const user = this.parseToken(data.access_token);
    this.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("keycloak_access_token", data.access_token);
      localStorage.setItem("keycloak_refresh_token", data.refresh_token);
    }
    return {
      user,
      token: data.access_token,
      refreshToken: data.refresh_token
    };
  }
  async signUp(credentials) {
    const registrationUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/registrations`;
    throw new Error(`Please complete registration at: ${registrationUrl}`);
  }
  async signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("keycloak_access_token");
      localStorage.removeItem("keycloak_refresh_token");
    }
    this.currentUser = null;
    const logoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`;
  }
  async signInWithGoogle() {
    const authUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`;
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: `${window.location.origin}/auth/callback`,
      kc_idp_hint: "google"
    });
    window.location.href = `${authUrl}?${params.toString()}`;
    return new Promise(() => {
    });
  }
  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    const token = await this.getIdToken();
    if (token) {
      this.currentUser = this.parseToken(token);
      return this.currentUser;
    }
    return null;
  }
  async getUserById(uid) {
    throw new Error("getUserById requires admin access");
  }
  async updateUserProfile(uid, data) {
    throw new Error("Profile updates should be done through Keycloak Account Console");
  }
  async deleteUser(uid) {
    throw new Error("User deletion requires admin access");
  }
  async getIdToken(forceRefresh = false) {
    if (typeof window === "undefined") {
      return null;
    }
    let token = localStorage.getItem("keycloak_access_token");
    if (!token) {
      return null;
    }
    if (forceRefresh) {
      const refreshToken = localStorage.getItem("keycloak_refresh_token");
      if (refreshToken) {
        try {
          const result = await this.refreshToken(refreshToken);
          token = result.token;
        } catch (error) {
          return null;
        }
      }
    }
    return token;
  }
  async verifyToken(token) {
    return this.parseToken(token);
  }
  async refreshToken(refreshToken) {
    const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });
    if (!response.ok) {
      throw new Error("Token refresh failed");
    }
    const data = await response.json();
    const user = this.parseToken(data.access_token);
    this.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("keycloak_access_token", data.access_token);
      localStorage.setItem("keycloak_refresh_token", data.refresh_token);
    }
    return {
      user,
      token: data.access_token,
      refreshToken: data.refresh_token
    };
  }
  async sendPasswordResetEmail(email) {
    const resetUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/login-actions/reset-credentials`;
    console.log(`Password reset: ${resetUrl}`);
  }
  async confirmPasswordReset(code, newPassword) {
    throw new Error("Password reset handled by Keycloak");
  }
  async updatePassword(newPassword) {
    throw new Error("Password updates should be done through Keycloak Account Console");
  }
  onAuthStateChanged(callback) {
    let intervalId;
    if (typeof window !== "undefined") {
      intervalId = setInterval(async () => {
        const user = await this.getCurrentUser();
        callback(user);
      }, 5e3);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
};
var keycloakAuthInstance = null;
function getKeycloakAuthAdapter() {
  if (!keycloakAuthInstance) {
    keycloakAuthInstance = new KeycloakAuthAdapter();
  }
  return keycloakAuthInstance;
}

// src/adapters/auth.factory.ts
var AuthFactory = class {
  /**
   * Get the configured auth adapter
   */
  static getAdapter() {
    if (!this.instance) {
      this.instance = this.createAdapter();
    }
    return this.instance;
  }
  /**
   * Create a new adapter based on environment configuration
   */
  static createAdapter() {
    const mode = this.getMode();
    console.log(`[AuthFactory] Initializing ${mode} adapter`);
    if (mode === "keycloak") {
      return getKeycloakAuthAdapter();
    } else {
      return getFirebaseAuthAdapter();
    }
  }
  /**
   * Determine which auth mode to use
   */
  static getMode() {
    if (this.mode) {
      return this.mode;
    }
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (deploymentMode === "self-hosted") {
      this.mode = "keycloak";
      return "keycloak";
    }
    if (process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_URL) {
      this.mode = "keycloak";
      return "keycloak";
    }
    this.mode = "firebase";
    return "firebase";
  }
  /**
   * Manually set the auth mode (useful for testing)
   */
  static setMode(mode) {
    this.mode = mode;
    this.instance = null;
  }
  /**
   * Reset the factory (useful for testing)
   */
  static reset() {
    this.instance = null;
    this.mode = null;
  }
  /**
   * Initialize the auth adapter
   */
  static async initialize() {
    const adapter = this.getAdapter();
    await adapter.initialize();
  }
};
AuthFactory.instance = null;
AuthFactory.mode = null;
function getAuth() {
  return AuthFactory.getAdapter();
}

export {
  AuthFactory,
  getAuth
};
