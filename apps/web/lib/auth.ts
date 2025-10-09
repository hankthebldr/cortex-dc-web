import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User extends FirebaseUser {
  role: 'user' | 'management' | 'admin';
  displayName: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'management' | 'admin';
  createdAt: any;
  lastActive: any;
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // The onCreateUser function will handle creating the user profile
    // but we can update the displayName here if needed
    if (displayName && result.user) {
      // Update user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName,
        email,
        uid: result.user.uid
      }, { merge: true });
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user with role information
export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe(); // Clean up the listener
      
      if (firebaseUser) {
        try {
          // Get user profile with role information
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            const user: User = {
              ...firebaseUser,
              role: userData.role || 'user',
              displayName: userData.displayName || firebaseUser.displayName || 'User',
              email: userData.email || firebaseUser.email || ''
            };
            resolve(user);
          } else {
            // User document doesn't exist yet, return with default role
            const user: User = {
              ...firebaseUser,
              role: 'user',
              displayName: firebaseUser.displayName || 'User',
              email: firebaseUser.email || ''
            };
            resolve(user);
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Listen to authentication state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          const user: User = {
            ...firebaseUser,
            role: userData.role || 'user',
            displayName: userData.displayName || firebaseUser.displayName || 'User',
            email: userData.email || firebaseUser.email || ''
          };
          callback(user);
        } else {
          const user: User = {
            ...firebaseUser,
            role: 'user',
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || ''
          };
          callback(user);
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};