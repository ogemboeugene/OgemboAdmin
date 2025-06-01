import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * 
 * @param {string} url - URL to fetch data from
 * @param {object} options - Fetch options
 * @returns {object} - data, loading, error, and refetch function
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For refetching
  const [refetchIndex, setRefetchIndex] = useState(0);
  
  // Function to trigger a refetch
  const refetch = useCallback(() => {
    setRefetchIndex(prevRefetchIndex => prevRefetchIndex + 1);
  }, []);
  
  useEffect(() => {
    // Create AbortController for cleanup
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Reset states
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        // Merge options with signal
        const fetchOptions = {
          ...options,
          signal,
        };
        
        const response = await fetch(url, fetchOptions);
        
        // Check if request was aborted
        if (signal.aborted) return;
        
        // Handle HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Check if request was aborted during json parsing
        if (signal.aborted) return;
        
        setData(result);
        setLoading(false);
      } catch (err) {
        // Ignore aborted errors
        if (err.name === 'AbortError') return;
        
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };
    
    // Only fetch if we have a URL
    if (url) {
      fetchData();
    } else {
      setLoading(false);
    }
    
    // Cleanup: abort fetch on unmount or refetch
    return () => {
      controller.abort();
    };
  }, [url, refetchIndex, JSON.stringify(options)]);
  
  return { data, loading, error, refetch };
};

export default useFetch; 