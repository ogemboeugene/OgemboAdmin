import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken, getRefreshToken, isTokenExpired, getTokenTimeRemaining, setTokens, clearTokens } from '../utils/tokenUtils';
import apiService from '../services/api/apiService';

/**
 * Hook to handle automatic token refresh
 * Monitors token expiration and refreshes tokens proactively
 */
export const useTokenRefresh = () => {
  const refreshIntervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('🔄 Token refresh already in progress');
      return false;
    }

    const accessToken = getAccessToken();
    const refreshTokenValue = getRefreshToken();

    if (!accessToken || !refreshTokenValue) {
      console.log('⚠️ No tokens available for refresh');
      return false;
    }

    // Check if token needs refresh (expires within 5 minutes)
    const timeRemaining = getTokenTimeRemaining(accessToken);
    if (timeRemaining > 5) {
      console.log(`⏰ Token still valid for ${timeRemaining} minutes`);
      return false;
    }

    isRefreshingRef.current = true;

    try {
      console.log('🔄 Proactively refreshing token...');
      
      const response = await apiService.auth.refreshToken(refreshTokenValue);
      
      if (response.data && response.data.success) {
        const { access_token, refresh_token: newRefreshToken } = response.data.data;
        
        // Update tokens
        setTokens(access_token, newRefreshToken);
        
        console.log('✅ Token refresh successful');
        return true;
      } else {
        console.error('❌ Token refresh failed - invalid response');
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // If refresh fails with 401, clear tokens
      if (error.response && error.response.status === 401) {
        console.log('🚨 Refresh token is invalid - clearing tokens');
        clearTokens();
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const startTokenMonitoring = useCallback(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Check token every minute
    refreshIntervalRef.current = setInterval(async () => {
      const token = getAccessToken();
      
      if (!token) {
        console.log('⚠️ No access token found - stopping monitoring');
        clearInterval(refreshIntervalRef.current);
        return;
      }

      if (isTokenExpired(token)) {
        console.log('🚨 Token has expired - attempting refresh');
        await refreshToken();
      } else {
        const timeRemaining = getTokenTimeRemaining(token);
        if (timeRemaining <= 5 && timeRemaining > 0) {
          console.log(`⏰ Token expires in ${timeRemaining} minutes - refreshing proactively`);
          await refreshToken();
        }
      }
    }, 60000); // Check every minute

    console.log('🎯 Token monitoring started');
  }, [refreshToken]);

  const stopTokenMonitoring = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log('⏹️ Token monitoring stopped');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTokenMonitoring();
    };
  }, [stopTokenMonitoring]);

  return {
    refreshToken,
    startTokenMonitoring,
    stopTokenMonitoring
  };
};

export default useTokenRefresh;
