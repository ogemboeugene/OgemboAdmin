import { useState, useEffect } from 'react';

/**
 * A hook that provides a way to use localStorage with React state.
 * 
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if localStorage is empty
 * @returns {[any, function]} - State value and setter function
 */
const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initialValue
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };
  
  // Set state with initial value
  const [storedValue, setStoredValue] = useState(readValue);
  
  // Update localStorage when state changes
  const setValue = (value) => {
    if (typeof window === 'undefined') {
      console.warn(`Can't set localStorage key "${key}" when not in browser`);
      return;
    }
    
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch event for other tabs/windows
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Listen for changes to this localStorage value in other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Handle storage change events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);
  
  return [storedValue, setValue];
};

export default useLocalStorage;