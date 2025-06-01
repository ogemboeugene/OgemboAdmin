// This file provides a Vite plugin to fix the crypto issue
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Function to create a polyfill for Node.js built-in modules
export function nodePolyfills() {
  const cryptoPolyfill = `
    if (!globalThis.crypto) {
      globalThis.crypto = {
        getRandomValues(array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }
      };
    }
    if (typeof process === 'undefined') {
      globalThis.process = { env: {} };
    }
    if (typeof global === 'undefined') {
      globalThis.global = globalThis;
    }
  `;

  return {
    name: 'vite-plugin-node-polyfills',
    enforce: 'pre',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: cryptoPolyfill,
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default nodePolyfills;
