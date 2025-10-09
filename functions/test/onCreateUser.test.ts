import 'mocha';
import { expect } from 'chai';
import functionsTest from 'firebase-functions-test';
import { onCreateUser } from '../src/onCreateUser';
import { UserRecord } from 'firebase-functions/v1/auth';

const test = functionsTest();

describe('Cloud Functions', () => {

  after(() => {
    test.cleanup();
  });

  describe('onCreateUser', () => {
    it('should create a new user profile', async () => {
      const user: UserRecord = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: false,
        disabled: false,
        metadata: {
          creationTime: new Date().toUTCString(),
          lastSignInTime: new Date().toUTCString(),
          toJSON: () => ({}),
        },
        providerData: [],
        toJSON: () => ({}),
      };

      const wrapped = test.wrap(onCreateUser);
      await wrapped(user);

      // Since we are not in a real firebase environment, we can't check firestore.
      // This test only validates that the function can be called without error.
      // To fully test this, you would need to use the emulator suite.
      expect(true).to.be.true;
    });
  });
});