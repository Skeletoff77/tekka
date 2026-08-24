/**
 * Converts raw Firebase Auth error codes into clean, user-friendly messages.
 */
export function getFirebaseAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error?.code || (typeof error === 'string' ? error : '');

  switch (code) {
    // Sign in / credential errors
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.';

    // Sign up errors
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled. Please contact support.';

    // Google / Popup Auth errors
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Another authentication popup is already active.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using a different sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations in Firebase.';

    // Network and system errors
    case 'auth/network-request-failed':
      return 'Unable to connect. Please check your internet connection and try again.';
    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please try again.';

    default:
      if (error?.message && !error.message.includes('Firebase:')) {
        return error.message;
      }
      return 'Authentication failed. Please check your credentials and try again.';
  }
}
