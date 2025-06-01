import axios from 'axios';

// Define base API URL - using local backend running on port 3000
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Normalize team member data to handle different input formats
 * Supports both JSON API format and form-based format
 */
const normalizeTeamMemberData = (memberData) => {
  console.log('🔍 Normalizing team member data:', memberData);
  
  // Handle different input formats
  const normalized = {
    // Handle user identification
    userId: memberData.userId || memberData.user_id || null,
    
    // Handle name fields
    name: memberData.name || (memberData.firstName && memberData.lastName 
      ? `${memberData.firstName} ${memberData.lastName}`.trim() 
      : null),
    firstName: memberData.firstName || (memberData.name ? memberData.name.split(' ')[0] : null),
    lastName: memberData.lastName || (memberData.name ? memberData.name.split(' ').slice(1).join(' ') : null),
    
    // Handle email
    email: memberData.email || null,
    
    // Handle role - normalize common variations
    role: normalizeRole(memberData.role),
    
    // Handle permissions - flexible format support
    permissions: normalizePermissions(memberData.permissions),
    
    // Handle dates
    joinDate: memberData.joinDate || memberData.join_date || memberData.joinedAt || new Date().toISOString(),
    
    // Handle additional fields
    responsibilities: memberData.responsibilities || memberData.description || null,
    department: memberData.department || null,
    hourlyRate: memberData.hourlyRate || memberData.hourly_rate || null,
    
    // Handle status
    status: memberData.status || 'active',
    
    // Handle external user flag
    isExternal: memberData.isExternal || memberData.is_external || false,
    
    // Handle skills
    skills: Array.isArray(memberData.skills) ? memberData.skills : 
           (typeof memberData.skills === 'string' ? memberData.skills.split(',').map(s => s.trim()) : []),
    
    // Handle portfolio/social links
    portfolio: memberData.portfolio || null,
    linkedin: memberData.linkedin || null,
    github: memberData.github || null,
    
    // Metadata
    createdAt: memberData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Remove null/undefined values
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === null || normalized[key] === undefined) {
      delete normalized[key];
    }
  });
  
  console.log('✅ Normalized team member data:', normalized);
  return normalized;
};

/**
 * Normalize role names to standard format
 */
const normalizeRole = (role) => {
  if (!role) return 'Member';
  
  const roleMap = {
    'owner': 'Project Lead',
    'admin': 'Project Manager', 
    'manager': 'Project Manager',
    'member': 'Member',
    'developer': 'Developer',
    'designer': 'Designer',
    'tester': 'QA Tester',
    'qa': 'QA Tester',
    'analyst': 'Business Analyst',
    'consultant': 'Consultant'
  };
  
  const lowerRole = role.toLowerCase();
  return roleMap[lowerRole] || role;
};

/**
 * Normalize permissions to array format
 */
const normalizePermissions = (permissions) => {
  if (!permissions) return ['read'];
  
  // If already an array, return as is
  if (Array.isArray(permissions)) {
    return permissions;
  }
  
  // If string, try to parse or split
  if (typeof permissions === 'string') {
    // Handle JSON string
    try {
      const parsed = JSON.parse(permissions);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Not JSON, try comma-separated
      return permissions.split(',').map(p => p.trim().toLowerCase());
    }
    
    // Handle single permission or role-based permissions
    const permissionMap = {
      'owner': ['read', 'write', 'admin', 'delete'],
      'admin': ['read', 'write', 'admin'],
      'manager': ['read', 'write', 'admin'],
      'member': ['read', 'write'],
      'viewer': ['read'],
      'read': ['read'],
      'write': ['read', 'write'],
      'full': ['read', 'write', 'admin', 'delete']
    };
    
    return permissionMap[permissions.toLowerCase()] || ['read'];
  }
  
  // Default fallback
  return ['read'];
};

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // List of endpoints that don't require authentication
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    
    // Check if current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isPublicEndpoint) {
      // Get token from localStorage - try multiple keys
      const token = localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('token');
      
      // Debug token information
      console.log('🔍 Request authentication debug:', {
        url: config.url,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
        allLocalStorageKeys: Object.keys(localStorage),
        isPublicEndpoint
      });
      
      // If token exists, add to headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Adding Authorization header to request:', config.url);
        console.log('📋 Request headers:', {
          Authorization: config.headers.Authorization.substring(0, 30) + '...',
          'Content-Type': config.headers['Content-Type'],
          Accept: config.headers.Accept
        });
      } else {
        console.warn('⚠️ No authentication token found for request:', config.url);
        console.warn('🗂️ Available localStorage keys:', Object.keys(localStorage));
      }
    } else {
      console.log('🌐 Public endpoint, skipping auth header:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    // Handle specific error cases
    const { response } = error;
    
    if (response && response.status === 401) {
      console.warn('🔐 401 Unauthorized - Token may be invalid or expired');
      // Handle unauthorized (e.g., token expired)
      localStorage.removeItem('access_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      // Redirect to login or refresh token logic would go here
    } else if (response && response.status === 403) {
      console.warn('🚫 403 Forbidden - Access denied');
      console.warn('🔍 Check if token has proper permissions or if user has access to this resource');
    }
    
    return Promise.reject(error);
  }
);

// API Services
const apiService = {  // Auth services
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { 
      refresh_token: refreshToken || localStorage.getItem('refresh_token') 
    }),
  },
  
  // Profile services
  profile: {
    get: () => apiClient.get('/profile'),
    update: (data) => apiClient.put('/profile', data),
    updateAvatar: (formData) => apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },  // Project services
  projects: {
    getAll: (params = {}) => apiClient.get('/projects', { params }),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (data) => apiClient.post('/projects', data),
    update: (id, data) => apiClient.put(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
    uploadImage: (id, formData) => apiClient.post(`/projects/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
    // Enhanced Team management endpoints with flexible format support
    team: {
      get: (projectId) => apiClient.get(`/projects/${projectId}/team`),
      
      // Flexible add member endpoint - supports multiple formats
      add: (projectId, memberData) => {
        // Normalize the data to handle different input formats
        const normalizedData = normalizeTeamMemberData(memberData);
        console.log('🔄 Adding team member with normalized data:', normalizedData);
        return apiClient.post(`/projects/${projectId}/team`, normalizedData);
      },
      
      update: (projectId, memberId, memberData) => {
        const normalizedData = normalizeTeamMemberData(memberData);
        return apiClient.put(`/projects/${projectId}/team/${memberId}`, normalizedData);
      },
      
      remove: (projectId, userId) => {
        console.log('🗑️ Deleting team member:', { projectId, userId });
        // Primary endpoint: /api/projects/{id}/team/{userId}
        return apiClient.delete(`/projects/${projectId}/team/${userId}`);
      },
      
      // Alternative endpoints for different use cases
      addMember: (projectId, memberData) => {
        return apiClient.post(`/projects/${projectId}/team/members`, normalizeTeamMemberData(memberData));
      },
      
      updateMember: (projectId, memberId, memberData) => {
        return apiClient.put(`/projects/${projectId}/team/members/${memberId}`, normalizeTeamMemberData(memberData));
      },
        removeMember: (projectId, userId) => {
        console.log('🗑️ Alternative: Deleting team member via members endpoint:', { projectId, userId });
        // Alternative endpoint: /api/projects/{id}/team/members/{userId}
        return apiClient.delete(`/projects/${projectId}/team/members/${userId}`);
      }
    },
  },
    // Skills services - Enhanced for categorized skills management
  skills: {
    // Get all skills organized by categories
    getAll: () => apiClient.get('/skills'),
    
    // Get skills for a specific category
    getByCategory: (category) => apiClient.get(`/skills/category/${category}`),
    
    // Create a new skill
    create: (skillData) => apiClient.post('/skills', skillData),
    
    // Update an existing skill
    update: (id, skillData) => apiClient.put(`/skills/${id}`, skillData),
    
    // Delete a skill
    delete: (id) => apiClient.delete(`/skills/${id}`),
    
    // Bulk operations for skills management
    bulkUpdate: (skillsData) => apiClient.put('/skills/bulk', skillsData),
    
    // Update entire skills profile (all categories)
    updateProfile: (profileData) => apiClient.put('/skills/profile', profileData),
    
    // Get skill statistics
    getStats: () => apiClient.get('/skills/stats'),
  },
  
  // Education services
  education: {
    getAll: () => apiClient.get('/education'),
    create: (data) => apiClient.post('/education', data),
    update: (id, data) => apiClient.put(`/education/${id}`, data),
    delete: (id) => apiClient.delete(`/education/${id}`),
  },
  
  // Experience services
  experience: {
    getAll: () => apiClient.get('/experience'),
    create: (data) => apiClient.post('/experience', data),
    update: (id, data) => apiClient.put(`/experience/${id}`, data),
    delete: (id) => apiClient.delete(`/experience/${id}`),
  },  // Dashboard statistics
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
    getRecentProjects: () => apiClient.get('/dashboard/recent-projects'),
    getOverview: () => apiClient.get('/dashboard/overview'),
    getUpcomingDeadlines: (params = {}) => apiClient.get('/dashboard/upcoming-deadlines', { params }),
    getRecentActivity: (params = {}) => apiClient.get('/dashboard/recent-activity', { params }),
  },
};

export default apiService;