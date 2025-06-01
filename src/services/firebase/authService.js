import { auth } from './firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/**
 * Simple authentication service for testing Firebase Storage uploads
 */
class AuthService {
  constructor() {
    this.user = null;
    this.initialized = false;
    this.initAuth();
  }

  async initAuth() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
        this.initialized = true;
        resolve(user);
      });
    });
  }

  async ensureAuthenticated() {
    if (!this.initialized) {
      await this.initAuth();
    }

    if (!this.user) {
      try {
        const userCredential = await signInAnonymously(auth);
        this.user = userCredential.user;
        console.log('Signed in anonymously:', this.user.uid);
        return this.user;
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        throw error;
      }
    }

    return this.user;
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
