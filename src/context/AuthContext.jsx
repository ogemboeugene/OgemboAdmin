import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/api/apiService';
import { useNotification } from './NotificationContext';

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
  const { success, error: showError } = useNotification();  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setIsLoggedIn(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // In a production environment, we should verify the token's validity
        // by making an API call to a profile or verify-token endpoint
        try {
          // Example: Get current user profile using the stored token
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
          } else {
            throw new Error('Invalid token');
          }
        } catch (apiError) {
          console.error('Token validation failed:', apiError);
          
          // If the token is expired, try to refresh it
          if (apiError.response && apiError.response.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
              if (refreshToken) {
              try {
                const refreshResponse = await apiService.auth.refreshToken(refreshToken);
                
                if (refreshResponse.data && refreshResponse.data.success) {
                  const { access_token } = refreshResponse.data.data;
                  
                  // Save new token
                  localStorage.setItem('access_token', access_token);
                  
                  // Try to get user profile again with new token
                  const retryResponse = await apiService.profile.get();
                  
                  if (retryResponse.data && retryResponse.data.success) {
                    const userData = retryResponse.data.data.user;
                    
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
                    return;
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }
          }
          
          // If we got here, authentication failed
          throw new Error('Authentication failed');
        }
      } catch (error) {        console.error('Auth check failed:', error);
        setError('Authentication failed. Please log in again.');
        // Clear stored tokens if validation fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the real API endpoint
      const response = await apiService.auth.login(credentials);
      
      // Handle successful login based on expected response format
      if (response.data && response.data.success) {
        const { user, access_token, refresh_token } = response.data.data;
          // Save tokens to localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
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
    
    // Clear all possible token storage locations
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear session storage as well
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Reset all auth state
    setUser(null);
    setIsLoggedIn(false);
    setIsLoading(false);
    setError(null);
    
    console.log('🧹 Force logout completed - all data cleared');
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚪 Starting logout process...');
      
      // First, clear local data immediately for security
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('authToken'); // Clean up any legacy tokens
      localStorage.removeItem('token'); // Clean up any other token variants
      localStorage.removeItem('user'); // Clear user data
      
      // Clear session storage as well
      sessionStorage.clear();
      
      console.log('🧹 Local storage cleared');
      
      // Reset auth state immediately
      setUser(null);
      setIsLoggedIn(false);
      
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
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiService.auth.refresh(refreshToken);
      
      if (response.data && response.data.success) {
        const { access_token } = response.data.data;
        
        // Update stored token
        localStorage.setItem('access_token', access_token);
        
        return { success: true, message: 'Token refreshed successfully' };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens and logout user
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsLoggedIn(false);
      
      const errorMessage = 'Session expired. Please log in again.';
      setError(errorMessage);
      showError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
    // Context value
  const value = {
    user,
    isLoggedIn,
    isLoading,    error,
    login,
    signup,
    logout,
    forceLogout,
    updateProfile,
    refreshTokens,
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