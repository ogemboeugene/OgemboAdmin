// Comprehensive crypto polyfill for Vite build process
import { webcrypto } from 'node:crypto';

// Set up crypto for Node.js environment (Vite build process)
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Ensure getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = function(array) {
    return webcrypto.getRandomValues(array);
  };
}

export {};
