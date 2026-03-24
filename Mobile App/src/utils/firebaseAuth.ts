/**
 * Safe Firebase Auth wrapper that gracefully handles Expo Go
 * where native modules like @react-native-firebase/auth are not available.
 *
 * In Expo Go, this returns a mock that lets the app load without crashes.
 * In a dev build / production build, it uses the real Firebase Auth.
 */

let firebaseAuth: any = null;

try {
  firebaseAuth = require('@react-native-firebase/auth').default;
} catch {
  // Running in Expo Go — native module not available
  console.warn('[firebaseAuth] @react-native-firebase/auth not available (Expo Go). Using mock.');
}

/**
 * Returns the Firebase Auth instance, or null in Expo Go.
 */
export function getAuth() {
  return firebaseAuth?.();
}

/**
 * Sign in with phone number.
 * In Expo Go: shows an alert and returns a mock confirmation that always succeeds with a fake token.
 */
export async function signInWithPhoneNumber(phoneNumber: string) {
  if (!firebaseAuth) {
    // Mock for Expo Go
    console.warn('[firebaseAuth] Mock signInWithPhoneNumber called');
    return {
      confirm: async (_code: string) => {
        console.warn('[firebaseAuth] Mock confirm called');
        return { user: { uid: 'expo-go-mock-uid' } };
      },
    };
  }

  return firebaseAuth().signInWithPhoneNumber(phoneNumber);
}

/**
 * Get the current user's ID token.
 * In Expo Go: returns a mock token.
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  if (!firebaseAuth) {
    console.warn('[firebaseAuth] Mock getCurrentUserIdToken called');
    return 'expo-go-mock-token';
  }

  const currentUser = firebaseAuth().currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

export default firebaseAuth;
