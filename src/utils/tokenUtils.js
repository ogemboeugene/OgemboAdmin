/**
 * JWT Token utility functions
 */

/**
 * Decode JWT token payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Minutes until expiration, negative if expired
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return -1;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;
    return Math.floor(timeRemaining / 60); // Return minutes
  } catch (error) {
    console.error('Error getting token time remaining:', error);
    return -1;
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} The access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('token');
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} The refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * Set tokens in localStorage
 * @param {string} accessToken - The access token
 * @param {string} refreshToken - The refresh token (optional)
 */
export const setTokens = (accessToken, refreshToken = null) => {
  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
    // Remove old token keys for consistency
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
  }
  
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if access token exists
 * @returns {boolean} True if token exists, false otherwise
 */
export const hasAccessToken = () => {
  return !!getAccessToken();
};

/**
 * Check if refresh token exists
 * @returns {boolean} True if refresh token exists, false otherwise
 */
export const hasRefreshToken = () => {
  return !!getRefreshToken();
};

/**
 * Check if token should be refreshed (expires within 5 minutes)
 * @param {string} token - The JWT token
 * @returns {boolean} True if token should be refreshed
 */
export const shouldRefreshToken = (token) => {
  const timeRemaining = getTokenTimeRemaining(token);
  return timeRemaining > 0 && timeRemaining <= 5; // Refresh if expires within 5 minutes
};

/**
 * Get user info from token
 * @param {string} token - The JWT token
 * @returns {object|null} User info from token payload
 */
export const getUserFromToken = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    
    return {
      id: decoded.user_id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      // Add any other fields your token contains
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Format token for Authorization header
 * @param {string} token - The access token
 * @returns {string} Formatted authorization header value
 */
export const formatAuthHeader = (token) => {
  return token ? `Bearer ${token}` : '';
};
