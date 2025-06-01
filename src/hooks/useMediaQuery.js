import { useState, useEffect } from 'react';

/**
 * A hook that returns whether a media query matches.
 * Useful for conditionally rendering components based on screen size.
 * 
 * @param {string} query - CSS media query
 * @returns {boolean} - Whether the query matches
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window exists (for SSR)
    if (typeof window === 'undefined') {
      return;
    }
    
    // Create a media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial match
    setMatches(mediaQuery.matches);
    
    // Create event listener
    const handleChange = (event) => {
      setMatches(event.matches);
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
};

/**
 * Common breakpoints for convenience
 */
export const breakpoints = {
  mobile: '(max-width: 576px)',
  tablet: '(min-width: 577px) and (max-width: 991px)',
  desktop: '(min-width: 992px)',
  largeDesktop: '(min-width: 1200px)',
};

export default useMediaQuery;