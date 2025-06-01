/**
 * Simple crypto polyfill for Vite
 * This provides a basic implementation of getRandomValues to fix the error
 */
export default {
  getRandomValues: function(arr) {
    // Simple polyfill for getRandomValues
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};
