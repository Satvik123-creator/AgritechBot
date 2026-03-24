import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';

// Prevent re-initialization error if hot-reloading
if (!admin.apps.length) {
  try {
    // Attempt to initialize using GOOGLE_APPLICATION_CREDENTIALS
    // In production (Render, AWS, etc.), set this environment variable
    // to the path of your Firebase Admin SDK service account JSON file.
    
    // Local Dev Default: requires serviceAccountKey.json at the root of Backend directory.
    if (env.NODE_ENV !== 'production') {
      const serviceAccount = require('../../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('Firebase Admin initialized manually with service account JSON');
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      logger.info('Firebase Admin initialized using Default Credentials');
    }
  } catch (error) {
    logger.error(
      { err: error },
      'Firebase admin initialization failed. Make sure you provided the correct credentials.'
    );
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export const firebaseAdmin = admin;
export const authAdmin = admin.auth();
