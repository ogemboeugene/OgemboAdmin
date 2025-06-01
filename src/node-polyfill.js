// This file provides Node.js polyfills for the browser environment
globalThis.process = {
  env: {}
};

if (!globalThis.global) {
  globalThis.global = globalThis;
}

export {};
