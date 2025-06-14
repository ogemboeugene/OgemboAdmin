import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/api/apiService';
import sessionTracker from '../services/sessionTracker';
import { useNotification } from './NotificationContext';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../utils/tokenUtils';
import useTokenRefresh from '../hooks/useTokenRefresh';

// Create the Authentication Context
const AuthContext = createContext();

/**
 * AuthProvider component that manages authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: showError } = useNotification();
  const { startTokenMonitoring, stopTokenMonitoring } = useTokenRefresh();// Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check for token using utility function
        const token = getAccessToken();
        
        if (!token) {
          setIsLoggedIn(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.warn('🔄 Access token is expired, attempting refresh...');
          
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            console.error('🚨 No refresh token available');
            clearTokens();
            setIsLoggedIn(false);
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          try {
            const refreshResponse = await apiService.auth.refreshToken(refreshToken);
            
            if (refreshResponse.data && refreshResponse.data.success) {
              const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data;
              
              // Update tokens using utility function
              setTokens(access_token, newRefreshToken);
              
              console.log('✅ Token refreshed successfully during auth check');
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed during auth check:', refreshError);
            clearTokens();
            setIsLoggedIn(false);
            setUser(null);
            setIsLoading(false);
            return;
          }
        }
        
        // Now try to get user profile with valid token
        try {
          const response = await apiService.profile.get();
          
          if (response.data && response.data.success) {
            const userData = response.data.data.user;
            
            // Format user data for our context
            const formattedUser = {
              id: userData.id,
              email: userData.email,
              name: userData.profile ? `${userData.profile.firstName} ${userData.profile.lastName}` : userData.name,
              role: userData.role || 'user',
              avatar: userData.profile?.avatar,
              profile: userData.profile,
              settings: userData.settings
            };
              setUser(formattedUser);
            setIsLoggedIn(true);
            
            // Start token monitoring when valid user is detected
            startTokenMonitoring();
          } else {
            throw new Error('Invalid token response');
          }
        } catch (apiError) {
          console.error('❌ Profile fetch failed during auth check:', apiError);
          
          // If we get another 401, the refresh didn't work or token is still invalid
          if (apiError.response && apiError.response.status === 401) {
            console.error('🚨 Profile fetch returned 401 - clearing tokens');
            clearTokens();
          }
          
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setError('Authentication failed. Please log in again.');
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get session information before login
      console.log('🔍 Creating session data before login...');
      const sessionData = await sessionTracker.createSessionData();
      
      // Call the login API endpoint
      const response = await apiService.auth.login(credentials);
        
      // Handle successful login based on expected response format
      if (response.data && response.data.success) {
        const { user, access_token, refresh_token } = response.data.data;
          
        // Save tokens using utility function
        setTokens(access_token, refresh_token);
        
        // Create session after successful login
        try {
          console.log('🔐 Creating session after successful login...');
          const sessionResponse = await apiService.sessions.create(sessionData);
          
          if (sessionResponse.data && sessionResponse.data.success) {
            const session = sessionResponse.data.data.session;
            localStorage.setItem('sessionId', session.id);
            sessionTracker.sessionInfo.sessionId = session.id;
            console.log('✅ Session created successfully:', session.id);
          }
        } catch (sessionError) {
          console.warn('⚠️ Session creation failed, but login succeeded:', sessionError);
          // Don't fail login if session creation fails
        }
        
        // Format user data for our context if needed
        const formattedUser = {
          id: user.id,
          email: user.email,
          name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.name,
          role: user.role || 'user',
          avatar: user.profile?.avatar,
          profile: user.profile,
          settings: user.settings
        };
          
        // Update auth context state
        setUser(formattedUser);
        setIsLoggedIn(true);
        
        // Start token monitoring and activity tracking
        startTokenMonitoring();
        startActivityMonitoring();
        
        // Return success result
        return { 
          success: true, 
          message: response.data.message,
          user: formattedUser 
        };
      } else {
        throw new Error(response.data?.message || 'Login failed - unexpected response format');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid login data. Please check your input.';
            break;
          case 401:
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 403:
            errorMessage = 'Your account is locked. Please contact an administrator.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred during login.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  // Signup function
  const signup = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract first and last name from full name
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare data for backend
      const signupData = {
        email: userData.email,
        password: userData.password,
        first_name: firstName,
        last_name: lastName
      };
      
      // Call the real API
      const response = await apiService.auth.register(signupData);
      
      // Handle successful registration based on expected response format
      if (response.data && response.data.success) {
        const { access_token, user } = response.data.data;
        
        // Save token to localStorage
        localStorage.setItem('authToken', access_token);
        
        // Format user data for our context
        const formattedUser = {
          id: user.id,
          email: user.email,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          role: 'user', // Default role
          avatar: user.profile.avatar,
          profile: user.profile,
          settings: user.settings
        };
        
        setUser(formattedUser);
        setIsLoggedIn(true);
        return { 
          success: true, 
          message: response.data.message,
          user: formattedUser 
        };
      } else {
        throw new Error('Registration failed - unexpected response format');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Please check your input data and try again.';
            break;
          case 409:
            errorMessage = 'A user with this email already exists. Please try logging in instead.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred during registration.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };  // Force logout function (clears everything locally without server call)
  const forceLogout = () => {
    console.log('🚨 Force logout initiated');
    
    // Stop activity monitoring
    stopActivityMonitoring();
    
    // Clear all tokens using utility function
    clearTokens();
    
    // Clear other possible storage locations
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    sessionStorage.clear();
    
    // Reset session tracker
    sessionTracker.reset();
    
  // Reset all auth state
    setUser(null);
    setIsLoggedIn(false);
    setIsLoading(false);
    setError(null);
    
    // Stop token monitoring
    stopTokenMonitoring();
      console.log('🧹 Force logout completed - all data cleared');
  };

  // Activity monitoring functions
  const startActivityMonitoring = () => {
    console.log('🔄 Starting activity monitoring...');
    
    // Update activity every 5 minutes
    const activityInterval = setInterval(async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId && isLoggedIn) {
        try {
          sessionTracker.updateLastActivity();
          await apiService.sessions.updateActivity(sessionId);
          console.log('⏰ Session activity updated');
        } catch (error) {
          console.warn('Failed to update session activity:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Monitor user activity (mouse, keyboard, scroll, touch)
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const activityHandler = () => {
      sessionTracker.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Store interval ID and events for cleanup
    window.activityInterval = activityInterval;
    window.activityEvents = { events, handler: activityHandler };
    
    console.log('✅ Activity monitoring started');
  };

  const stopActivityMonitoring = () => {
    console.log('🛑 Stopping activity monitoring...');
    
    // Clear activity interval
    if (window.activityInterval) {
      clearInterval(window.activityInterval);
      window.activityInterval = null;
    }
    
    // Remove activity event listeners
    if (window.activityEvents) {
      window.activityEvents.events.forEach(event => {
        document.removeEventListener(event, window.activityEvents.handler, true);
      });
      window.activityEvents = null;
    }
    
    console.log('✅ Activity monitoring stopped');
  };
  // Logout function
  const logout = async () => {
    setIsLoading(true);
      try {
      console.log('🚪 Starting logout process...');
      
      // Get session ID before clearing
      const sessionId = localStorage.getItem('sessionId');
      
      // Terminate current session first
      if (sessionId) {
        try {
          console.log('🔐 Terminating session:', sessionId);
          await apiService.sessions.terminate(sessionId);
          console.log('✅ Session terminated successfully');
        } catch (sessionError) {
          console.warn('⚠️ Session termination failed:', sessionError);
        }
      }
      
      // Stop activity monitoring
      stopActivityMonitoring();
      
      // Clear local data for security using utility function
      clearTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Reset session tracker
      sessionTracker.reset();
      
      console.log('🧹 Local storage cleared');
        
      // Reset auth state immediately
      setUser(null);
      setIsLoggedIn(false);
      
      // Stop token monitoring
      stopTokenMonitoring();
      
      console.log('🔄 Auth state reset');
      
      try {
        // Try to call the logout endpoint (non-blocking)
        const response = await apiService.auth.logout();
        
        if (response.data && response.data.success) {
          console.log('✅ Server logout successful');
          success('Logout successful');
        } else {
          console.log('⚠️ Server logout failed but local logout completed');
        }
      } catch (serverError) {
        // Don't fail the logout if server call fails
        console.log('⚠️ Server logout failed but local logout completed:', serverError.message);
      }
      
      return { success: true, message: 'Logged out successfully' };
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Ensure local data is cleared even on error
      forceLogout();
      
      showError('Logged out locally due to error');
      
      return { success: true, message: 'Logged out locally' }; // Return success since local logout completed
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, call API
      // const response = await apiService.profile.update(userData);
      // const updatedUser = response.data;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user state with new data
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }  };
  // Manual refresh token function
  const refreshTokens = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('🔄 Manual token refresh requested');
      const response = await apiService.auth.refreshToken(refreshToken);
      
      if (response.data && response.data.success) {
        const { access_token, refresh_token: newRefreshToken } = response.data.data;
        
        // Update stored tokens using utility function
        setTokens(access_token, newRefreshToken);
        
        console.log('✅ Manual token refresh successful');
        return { success: true, message: 'Token refreshed successfully' };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      
      // Clear tokens and logout user using utility function
      clearTokens();
      setUser(null);
      setIsLoggedIn(false);
      stopTokenMonitoring();
      
      const errorMessage = 'Session expired. Please log in again.';
      setError(errorMessage);
      showError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };  // Verify token validity and refresh if needed
  const verifyToken = async (enforceRefresh = false) => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        return { valid: false, message: 'No token found' };
      }
      
      // Check if token is expired or enforce refresh is true
      if (isTokenExpired(token) || enforceRefresh) {
        console.log('🔍 Token verification: Token needs refresh');
        const result = await refreshTokens();
        return { 
          valid: result.success, 
          refreshed: result.success,
          message: result.message || result.error
        };
      }
      
      return { valid: true, refreshed: false, message: 'Token is valid' };
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return { valid: false, refreshed: false, message: error.message };
    }
  };
    
  // Context value
  const value = {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    signup,
    logout,
    forceLogout,
    updateProfile,
    refreshTokens,
    verifyToken,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;