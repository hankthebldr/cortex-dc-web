import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

export interface FirestoreConfig {
  app: FirebaseApp;
  useEmulator?: boolean;
  emulatorHost?: string;
  emulatorPort?: number;
}

export class FirestoreClient {
  private db: Firestore;
  private config: FirestoreConfig;

  constructor(config: FirestoreConfig) {
    this.config = config;
    this.db = getFirestore(config.app);
    
    if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
      connectFirestoreEmulator(this.db, config.emulatorHost, config.emulatorPort);
    }
  }

  getDatabase(): Firestore {
    return this.db;
  }

  // TODO: Add common database operations
  async connect(): Promise<void> {
    // Firestore connects automatically
  }

  async disconnect(): Promise<void> {
    // TODO: Implement proper disconnection if needed
  }
}
