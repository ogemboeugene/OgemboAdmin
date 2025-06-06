// This file provides Node.js polyfills for the browser environment

// Set up global polyfills
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

// Create a simple process polyfill
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {},
    browser: true,
    version: '',
    versions: {
      node: ''
    },
    nextTick: function(callback) {
      setTimeout(callback, 0);
    }  };
}

// Buffer and other polyfills are handled by NodeGlobalsPolyfillPlugin

// More robust crypto polyfill that covers all use cases
if (!globalThis.crypto) {
  globalThis.crypto = {};
}

// Crypto polyfill specifically for getRandomValues
if (!globalThis.crypto.getRandomValues) {
  // Use proper secure random if available, fallback to Math.random
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues = window.crypto.getRandomValues.bind(window.crypto);
  } else if (typeof require !== 'undefined') {
    try {
      const nodeCrypto = require('crypto');
      globalThis.crypto.getRandomValues = function(array) {
        const buffer = nodeCrypto.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = buffer[i];
        }
        return array;
      };
    } catch (e) {
      // Fallback implementation
      globalThis.crypto.getRandomValues = fallbackGetRandomValues;
    }
  } else {
    // Browser fallback using Math.random
    globalThis.crypto.getRandomValues = fallbackGetRandomValues;
  }
}

function fallbackGetRandomValues(array) {
  if (array instanceof Uint8Array || array instanceof Int8Array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  } else if (array instanceof Uint16Array || array instanceof Int16Array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 65536);
    }
  } else if (array instanceof Uint32Array || array instanceof Int32Array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 4294967296);
    }
  } else {
    throw new Error('Unsupported array type for getRandomValues');
  }
  return array;
}

export {};
