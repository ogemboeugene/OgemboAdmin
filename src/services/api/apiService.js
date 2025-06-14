import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../../utils/tokenUtils';

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

/**
 * Normalize task data to handle different input formats
 * Supports both JSON API format and form-based format
 */
const normalizeTaskData = (taskData) => {
  console.log('🔍 Normalizing task data:', taskData);
  
  // Handle different input formats
  const normalized = {
    // Handle project identification
    projectId: taskData.projectId || taskData.project_id || null,
    
    // Handle basic task information
    title: taskData.title ? taskData.title.trim() : null,
    description: taskData.description ? taskData.description.trim() : null,
    
    // Handle status normalization
    status: normalizeTaskStatus(taskData.status),
    
    // Handle priority normalization
    priority: normalizeTaskPriority(taskData.priority),
    
    // Handle assignee identification
    assigneeId: taskData.assigneeId || taskData.assignee_id || taskData.assigned_to || null,
    createdBy: taskData.createdBy || taskData.created_by || null,
    
    // Handle dates
    dueDate: taskData.dueDate || taskData.due_date || null,
    startDate: taskData.startDate || taskData.start_date || null,
    completedAt: taskData.completedAt || taskData.completed_at || null,
    
    // Handle hours and progress
    estimatedHours: taskData.estimatedHours || taskData.estimated_hours || null,
    actualHours: taskData.actualHours || taskData.actual_hours || null,
    progress: taskData.progress || 0,
    
    // Handle tags - flexible format support
    tags: normalizeTags(taskData.tags),
    
    // Handle category
    category: taskData.category || 'General',
    
    // Handle subtasks and dependencies
    parentTaskId: taskData.parentTaskId || taskData.parent_task_id || null,
    dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
    blockedBy: Array.isArray(taskData.blockedBy) ? taskData.blockedBy : [],
    
    // Handle additional fields
    notes: taskData.notes || null,
    attachments: Array.isArray(taskData.attachments) ? taskData.attachments : [],
    
    // Metadata
    createdAt: taskData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Remove null/undefined values for cleaner API calls
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === null || normalized[key] === undefined || normalized[key] === '') {
      delete normalized[key];
    }
  });
  
  console.log('✅ Normalized task data:', normalized);
  return normalized;
};

/**
 * Normalize task status to match backend expectations
 */
const normalizeTaskStatus = (status) => {
  if (!status) return 'pending';
  
  const statusMap = {
    'todo': 'pending',
    'pending': 'pending',
    'in-progress': 'in-progress',
    'in_progress': 'in-progress',
    'inprogress': 'in-progress',
    'doing': 'in-progress',
    'completed': 'completed',
    'done': 'completed',
    'finished': 'completed',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'on-hold': 'on-hold',
    'onhold': 'on-hold',
    'blocked': 'blocked'
  };
  
  const lowerStatus = status.toLowerCase();
  return statusMap[lowerStatus] || status;
};

/**
 * Normalize task priority levels
 */
const normalizeTaskPriority = (priority) => {
  if (!priority) return 'medium';
  
  const priorityMap = {
    'lowest': 'low',
    'low': 'low',
    'normal': 'medium',
    'medium': 'medium',
    'high': 'high',
    'highest': 'urgent',
    'urgent': 'urgent',
    'critical': 'urgent',
    '1': 'low',
    '2': 'medium', 
    '3': 'high',
    '4': 'urgent'
  };
  
  const lowerPriority = priority.toString().toLowerCase();
  return priorityMap[lowerPriority] || priority;
};

/**
 * Normalize tags to array format
 */
const normalizeTags = (tags) => {
  if (!tags) return [];
  
  // If already an array, return as is (filter out empty strings)
  if (Array.isArray(tags)) {
    return tags.filter(tag => tag && tag.trim()).map(tag => tag.trim());
  }
  
  // If string, try to parse or split
  if (typeof tags === 'string') {
    // Handle JSON string
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.filter(tag => tag && tag.trim()).map(tag => tag.trim());
      }    } catch (e) {
      // Not JSON, try comma-separated or space-separated
      return tags.split(/[,;\s]+/)
        .filter(tag => tag && tag.trim())
        .map(tag => tag.trim());
    }
  }
  
  // Default fallback
  return [];
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
      // Get token using utility function
      const token = getAccessToken();
      
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
        
        // Check if token is expired and warn
        if (isTokenExpired(token)) {
          console.warn('⚠️ Token appears to be expired, refresh mechanism will handle this');
        }
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

// Token refresh functionality
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add response interceptor for error handling and automatic token refresh
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
  async (error) => {
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
    
    const originalRequest = error.config;
    const { response } = error;
    
    // Handle 401 Unauthorized with automatic token refresh
    if (response && response.status === 401 && !originalRequest._retry) {
      console.warn('🔐 401 Unauthorized - Attempting automatic token refresh');
        // Check if this is a refresh token request that failed
      if (originalRequest.url.includes('/auth/refresh')) {
        console.error('🚨 Refresh token is invalid - redirecting to login');
        clearTokens();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        console.log('🔄 Token refresh in progress - queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
        const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        console.error('🚨 No refresh token available - redirecting to login');
        clearTokens();
        
        // Process failed queue
        processQueue(error, null);
        isRefreshing = false;
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      try {
        console.log('🔄 Attempting to refresh access token...');
        
        // Make refresh token request
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (refreshResponse.data && refreshResponse.data.success) {
          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data;
          
          console.log('✅ Token refresh successful');
          
          // Update stored tokens using utility function
          setTokens(access_token, newRefreshToken);
          
          // Update the default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Process queued requests
          processQueue(null, access_token);
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed - invalid response');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear all tokens using utility function
        clearTokens();
        
        // Process failed queue
        processQueue(refreshError, null);
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (response && response.status === 403) {
      console.warn('🚫 403 Forbidden - Access denied');
      console.warn('🔍 Check if token has proper permissions or if user has access to this resource');
    }
    
    return Promise.reject(error);
  }
);

// API Services
const apiService = {
  // Auth services
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { 
      refresh_token: refreshToken || localStorage.getItem('refresh_token') 
    }),
    // Validate current token
    validateToken: () => apiClient.get('/auth/validate'),
    // Get current user info
    me: () => apiClient.get('/auth/me'),    // Change password
    changePassword: (passwordData) => apiClient.post('/auth/change-password', passwordData),
  },

  // Session management
  sessions: {
    // Create new session on login
    create: (sessionData) => {
      console.log('🔐 Creating new session:', sessionData);
      return apiClient.post('/sessions', sessionData);
    },
    
    // Get all user sessions
    getAll: () => {
      console.log('📋 Fetching all user sessions');
      return apiClient.get('/sessions');
    },
    
    // Get current session
    getCurrent: () => {
      console.log('🔍 Fetching current session');
      return apiClient.get('/sessions/current');
    },
    
    // Update session activity
    updateActivity: (sessionId) => {
      console.log('⏰ Updating session activity:', sessionId);
      return apiClient.patch(`/sessions/${sessionId}/activity`);
    },
    
    // Terminate specific session
    terminate: (sessionId) => {
      console.log('🚪 Terminating session:', sessionId);
      return apiClient.delete(`/sessions/${sessionId}`);
    },
    
    // Terminate all other sessions
    terminateOthers: () => {
      console.log('🧹 Terminating all other sessions');
      return apiClient.delete('/sessions/others');
    },
    
    // Get session statistics
    getStats: () => {
      console.log('📊 Fetching session statistics');
      return apiClient.get('/sessions/stats');
    },
  },
  // Profile services
  profile: {
    // Get full profile data including user info, education, experience, skills, and settings
    get: () => apiClient.get('/profile'),
    
    // Update profile information
    update: (data) => apiClient.put('/profile', data),
      // Upload profile avatar
    avatar: {
      upload: (avatarData) => apiClient.post('/profile/avatar', avatarData),
      remove: () => apiClient.delete('/profile/avatar'),
    },
      // Resume management
    resume: {
      upload: (resumeData) => apiClient.post('/profile/resume', resumeData),
      deleteItem: (resumeId) => apiClient.delete(`/profile/resume/${resumeId}`),
      setPrimary: (resumeId) => apiClient.put(`/profile/resume/${resumeId}/primary`),
    },
    
    // Profile section specific endpoints
    sections: {
      // Basic information (firstName, lastName, phone, etc.)
      basic: (data) => apiClient.put('/profile/basic', data),
      
      // Professional information (title, bio, yearsOfExperience, etc.)
      professional: (data) => apiClient.put('/profile/professional', data),
      
      // Address information
      address: (data) => apiClient.put('/profile/address', data),
      
      // Social links
      social: (data) => apiClient.put('/profile/social', data),
      
      // Languages
      languages: (data) => apiClient.put('/profile/languages', data),
      
      // Availability and job preferences
      availability: (data) => apiClient.put('/profile/availability', data),
      
      // Profile visibility settings
      visibility: (data) => apiClient.put('/profile/visibility', data),
    },
  },// Project services
  projects: {
    getAll: (params = {}) => apiClient.get('/projects', { params }),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (data) => apiClient.post('/projects', data),
    update: (id, data) => apiClient.put(`/projects/${id}`, data),
    deleteItem: (id) => apiClient.delete(`/projects/${id}`),
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
    deleteItem: (id) => apiClient.delete(`/skills/${id}`),
    
    // Bulk operations for skills management
    bulkUpdate: (skillsData) => apiClient.put('/skills/bulk', skillsData),
    
    // Update entire skills profile (all categories)
    updateProfile: (profileData) => apiClient.put('/skills/profile', profileData),
    
    // Get skill statistics
    getStats: () => apiClient.get('/skills/stats'),
  },    // Education services - Works with both dedicated endpoints and via profile
  education: {
    // Get all education records
    getAll: () => apiClient.get('/education'),
    
    // Get specific education record by ID
    getById: (id) => apiClient.get(`/education/${id}`),
    
    // Create new education record
    create: (data) => apiClient.post('/education', data),
    
    // Update existing education record
    update: (id, data) => apiClient.put(`/education/${id}`, data),
    
    // Delete education record
    deleteItem: (id) => apiClient.delete(`/education/${id}`),
    
    // Education bulk operations
    bulkUpdate: (educationData) => apiClient.put('/education/bulk', educationData),
  },    // Experience services - Works with both dedicated endpoints and via profile
  experience: {
    // Get all work experience records
    getAll: () => apiClient.get('/experience'),
    
    // Get specific work experience by ID
    getById: (id) => apiClient.get(`/experience/${id}`),
    
    // Create new work experience record
    create: (data) => apiClient.post('/experience', data),
    
    // Update existing work experience
    update: (id, data) => apiClient.put(`/experience/${id}`, data),
    
    // Delete work experience record
    deleteItem: (id) => apiClient.delete(`/experience/${id}`),
    
    // Experience bulk operations
    bulkUpdate: (experienceData) => apiClient.put('/experience/bulk', experienceData),
    
    // Toggle current job status
    toggleCurrent: (id) => apiClient.put(`/experience/${id}/toggle-current`),
  },// Dashboard statistics
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
    getRecentProjects: () => apiClient.get('/dashboard/recent-projects'),
    getOverview: () => apiClient.get('/dashboard/overview'),
    getUpcomingDeadlines: (params = {}) => apiClient.get('/dashboard/upcoming-deadlines', { params }),
    getRecentActivity: (params = {}) => apiClient.get('/dashboard/recent-activity', { params }),
    
    // Get user performance metrics
    getPerformance: (params = {}) => {
      console.log('📊 Fetching performance metrics:', params);
      return apiClient.get('/dashboard/performance', { params });
    },
  },    // Tasks services - Enhanced with flexible format support
  tasks: {
    // Get all tasks with optional filtering
    getAll: (params = {}) => apiClient.get('/tasks', { params }),
    
    // Get specific task by ID with full details
    getById: (id) => apiClient.get(`/tasks/${id}`),
    
    // Create new task with data normalization
    create: (data) => {
      const normalizedData = normalizeTaskData(data);
      console.log('🔄 Creating task with normalized data:', normalizedData);
      return apiClient.post('/tasks', normalizedData);
    },
    
    // Update existing task with data normalization
    update: (id, data) => {
      const normalizedData = normalizeTaskData(data);
      console.log('🔄 Updating task with normalized data:', { id, data: normalizedData });
      return apiClient.put(`/tasks/${id}`, normalizedData);
    },
      // Delete task
    deleteItem: (id) => {
      console.log('🗑️ Deleting task:', id);
      return apiClient.delete(`/tasks/${id}`);
    },
    
    // Update task status only
    updateStatus: (id, status) => {
      const normalizedStatus = normalizeTaskStatus(status);
      console.log('🔄 Updating task status:', { id, status: normalizedStatus });
      return apiClient.patch(`/tasks/${id}/status`, { status: normalizedStatus });
    },
    
    // Update task priority only
    updatePriority: (id, priority) => {
      const normalizedPriority = normalizeTaskPriority(priority);
      console.log('🔄 Updating task priority:', { id, priority: normalizedPriority });
      return apiClient.patch(`/tasks/${id}/priority`, { priority: normalizedPriority });
    },
    
    // Update task assignee
    updateAssignee: (id, assigneeId) => {
      console.log('🔄 Updating task assignee:', { id, assigneeId });
      return apiClient.patch(`/tasks/${id}/assignee`, { assigneeId });
    },
    
    // Update task due date
    updateDueDate: (id, dueDate) => {
      console.log('🔄 Updating task due date:', { id, dueDate });
      return apiClient.patch(`/tasks/${id}/due-date`, { dueDate });
    },
    
    // Bulk operations
    bulkUpdate: (taskIds, updateData) => {
      const normalizedData = normalizeTaskData(updateData);
      console.log('🔄 Bulk updating tasks:', { taskIds, data: normalizedData });
      return apiClient.put('/tasks/bulk', { taskIds, ...normalizedData });
    },
    
    bulkDelete: (taskIds) => {
      console.log('🗑️ Bulk deleting tasks:', taskIds);
      return apiClient.delete('/tasks/bulk', { data: { taskIds } });
    },
    
    bulkStatusUpdate: (taskIds, status) => {
      const normalizedStatus = normalizeTaskStatus(status);
      console.log('🔄 Bulk status update:', { taskIds, status: normalizedStatus });
      return apiClient.patch('/tasks/bulk/status', { taskIds, status: normalizedStatus });
    },
    
    // Task dependencies
    dependencies: {
      add: (taskId, dependencyId) => apiClient.post(`/tasks/${taskId}/dependencies`, { dependencyId }),
      remove: (taskId, dependencyId) => apiClient.delete(`/tasks/${taskId}/dependencies/${dependencyId}`),
      get: (taskId) => apiClient.get(`/tasks/${taskId}/dependencies`),
    },
    
    // Task subtasks
    subtasks: {
      getAll: (taskId) => apiClient.get(`/tasks/${taskId}/subtasks`),
      create: (taskId, subtaskData) => {
        const normalizedData = normalizeTaskData({ ...subtaskData, parentTaskId: taskId });
        return apiClient.post(`/tasks/${taskId}/subtasks`, normalizedData);
      },
      update: (taskId, subtaskId, subtaskData) => {
        const normalizedData = normalizeTaskData(subtaskData);
        return apiClient.put(`/tasks/${taskId}/subtasks/${subtaskId}`, normalizedData);
      },
      deleteItem: (taskId, subtaskId) => apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
    },
    
    // Task time tracking
    time: {
      start: (taskId) => apiClient.post(`/tasks/${taskId}/time/start`),
      stop: (taskId) => apiClient.post(`/tasks/${taskId}/time/stop`),
      log: (taskId, hours, description = '') => apiClient.post(`/tasks/${taskId}/time/log`, { hours, description }),
      get: (taskId) => apiClient.get(`/tasks/${taskId}/time`),
    },
    
    // Task comments
    comments: {
      get: (taskId) => apiClient.get(`/tasks/${taskId}/comments`),
      create: (taskId, comment) => apiClient.post(`/tasks/${taskId}/comments`, comment),
      update: (taskId, commentId, comment) => apiClient.put(`/tasks/${taskId}/comments/${commentId}`, comment),
      delete: (taskId, commentId) => apiClient.delete(`/tasks/${taskId}/comments/${commentId}`),
    },
    
    // Task attachments
    attachments: {
      get: (taskId) => apiClient.get(`/tasks/${taskId}/attachments`),
      upload: (taskId, formData) => apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (taskId, attachmentId) => apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
    },
    
    // Task statistics and analytics
    stats: {
      getByProject: (projectId) => apiClient.get(`/tasks/stats/project/${projectId}`),
      getByAssignee: (assigneeId) => apiClient.get(`/tasks/stats/assignee/${assigneeId}`),
      getOverview: () => apiClient.get('/tasks/stats/overview'),
      getProductivity: (params = {}) => apiClient.get('/tasks/stats/productivity', { params }),
    }  },
  // Calendar services
  calendar: {
    // Get all calendar events with optional filtering
    getAll: (params = {}) => apiClient.get('/calendar/events', { params }),
      // Get specific calendar event by ID
    getById: (id) => apiClient.get(`/calendar/events/${id}`),
    
    // Get user availability within a date range
    getAvailability: (startDate, endDate, userIds = null, timezone = null) => {
      console.log('📅 Getting user availability:', { startDate, endDate, userIds, timezone });
      const params = { 
        start_date: startDate, 
        end_date: endDate 
      };
      
      // Add user_ids if provided
      if (userIds && userIds.length > 0) {
        params.user_ids = userIds;
        console.log('📅 Adding user_ids to params:', params.user_ids);
      }
      
      // Add timezone if provided
      if (timezone) {
        params.timezone = timezone;
      }
      
      console.log('📅 Final API request params:', params);
      return apiClient.get('/calendar/availability', { params });
    },
    
    // Create new calendar event
    create: (eventData) => {
      console.log('📅 Creating calendar event:', eventData);
      return apiClient.post('/calendar/events', eventData);
    },
    
    // Update existing calendar event
    update: (id, eventData) => {
      console.log('📅 Updating calendar event:', { id, eventData });
      return apiClient.put(`/calendar/events/${id}`, eventData);
    },
    
    // Delete calendar event
    delete: (id) => {
      console.log('📅 Deleting calendar event:', id);
      return apiClient.delete(`/calendar/events/${id}`);
    },
    
    // Bulk operations for calendar events
    bulkCreate: (eventsData) => {
      console.log('📅 Bulk creating calendar events:', eventsData);
      return apiClient.post('/calendar/events/bulk', { events: eventsData });
    },
    
    bulkUpdate: (eventIds, data) => {
      console.log('📅 Bulk updating calendar events:', { eventIds, data });
      return apiClient.put('/calendar/events/bulk', { eventIds, ...data });
    },
    
    bulkDelete: (eventIds) => {
      console.log('📅 Bulk deleting calendar events:', eventIds);
      return apiClient.delete('/calendar/events/bulk', { data: { eventIds } });
    },
    
    // Get events for specific date range
    getByDateRange: (startDate, endDate, params = {}) => {
      const queryParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...params
      };
      return apiClient.get('/calendar/events/range', { params: queryParams });
    },
    
    // Get events for specific date
    getByDate: (date, params = {}) => {
      const queryParams = {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        ...params
      };
      return apiClient.get('/calendar/events/date', { params: queryParams });
    },
    
    // Get upcoming events
    getUpcoming: (limit = 10, params = {}) => {
      const queryParams = { limit, ...params };
      return apiClient.get('/calendar/events/upcoming', { params: queryParams });
    },
    
    // Toggle event completion status
    toggleCompletion: (id) => {
      console.log('📅 Toggling calendar event completion:', id);
      return apiClient.patch(`/calendar/events/${id}/toggle-completion`);
    },
    
    // Event categories management
    categories: {
      get: () => apiClient.get('/calendar/categories'),
      create: (categoryData) => apiClient.post('/calendar/categories', categoryData),
      update: (id, categoryData) => apiClient.put(`/calendar/categories/${id}`, categoryData),
      delete: (id) => apiClient.delete(`/calendar/categories/${id}`),
    },
    
    // Event recurrence management
    recurrence: {
      create: (eventId, recurrenceData) => apiClient.post(`/calendar/events/${eventId}/recurrence`, recurrenceData),
      update: (eventId, recurrenceData) => apiClient.put(`/calendar/events/${eventId}/recurrence`, recurrenceData),
      delete: (eventId) => apiClient.delete(`/calendar/events/${eventId}/recurrence`),
    },
    
    // Event attendees management
    attendees: {
      get: (eventId) => apiClient.get(`/calendar/events/${eventId}/attendees`),
      add: (eventId, attendeeData) => apiClient.post(`/calendar/events/${eventId}/attendees`, attendeeData),
      update: (eventId, attendeeId, attendeeData) => apiClient.put(`/calendar/events/${eventId}/attendees/${attendeeId}`, attendeeData),
      remove: (eventId, attendeeId) => apiClient.delete(`/calendar/events/${eventId}/attendees/${attendeeId}`),
      updateStatus: (eventId, attendeeId, status) => apiClient.patch(`/calendar/events/${eventId}/attendees/${attendeeId}/status`, { status }),
    },
    
    // Event reminders/notifications
    reminders: {
      get: (eventId) => apiClient.get(`/calendar/events/${eventId}/reminders`),
      create: (eventId, reminderData) => apiClient.post(`/calendar/events/${eventId}/reminders`, reminderData),
      update: (eventId, reminderId, reminderData) => apiClient.put(`/calendar/events/${eventId}/reminders/${reminderId}`, reminderData),
      delete: (eventId, reminderId) => apiClient.delete(`/calendar/events/${eventId}/reminders/${reminderId}`),
    },
    
    // Calendar statistics and analytics
    stats: {
      getOverview: () => apiClient.get('/calendar/stats/overview'),
      getByCategory: (params = {}) => apiClient.get('/calendar/stats/category', { params }),
      getByProject: (projectId) => apiClient.get(`/calendar/stats/project/${projectId}`),
      getProductivity: (params = {}) => apiClient.get('/calendar/stats/productivity', { params }),
    }
  },
  // User settings
  settings: {
    // Get user settings
    get: () => apiClient.get('/settings'),
    
    // Update user settings
    update: (data) => apiClient.put('/settings', data),
    
    // Update theme settings
    updateTheme: (themeData) => apiClient.put('/settings/theme', themeData),
    
    // Update notification preferences
    updateNotifications: (notificationData) => apiClient.put('/settings/notifications', notificationData),
    
    // Update privacy settings
    updatePrivacy: (privacyData) => apiClient.put('/settings/privacy', privacyData),
    
    // Update security settings
    updateSecurity: (securityData) => apiClient.put('/settings/security', securityData),
    
    // Update display preferences
    updateDisplay: (displayData) => apiClient.put('/settings/display', displayData),
    
    // Update developer preferences
    updateDeveloperPrefs: (devData) => apiClient.put('/settings/developer-preferences', devData),
  },
  
  // Users services
  users: {
    // Get all users
    getAll: (params = {}) => apiClient.get('/users', { params }),
    
    // Get specific user by ID
    getById: (id) => apiClient.get(`/users/${id}`),
    
    // Search users
    search: (query) => apiClient.get(`/users/search`, { params: { query } }),
    
    // Get users by department
    getByDepartment: (department) => apiClient.get(`/users/department/${department}`),
    
    // Get users by role
    getByRole: (role) => apiClient.get(`/users/role/${role}`),
  },
  
  // Analytics services
  analytics: {
    // Get developer metrics dashboard
    getDeveloperMetrics: (params = {}) => {
      console.log('📊 Fetching developer metrics:', params);
      return apiClient.get('/analytics/developer-metrics', { params });
    },
    
    // Get real-time charts data
    getChartsData: (params = {}) => {
      console.log('📊 Fetching charts data:', params);
      return apiClient.get('/analytics/charts-data', { params });
    },
    
    // Get project health dashboard
    getProjectHealth: () => {
      console.log('📊 Fetching project health data');
      return apiClient.get('/analytics/project-health');
    },
    
    // Get performance metrics
    getPerformanceMetrics: (params = {}) => {
      console.log('📊 Fetching performance metrics:', params);
      return apiClient.get('/analytics/performance-metrics', { params });
    },
    
    // Get code quality insights
    getCodeQuality: () => {
      console.log('📊 Fetching code quality data');
      return apiClient.get('/analytics/code-quality');
    },

    // Get user engagement analytics
    getUserEngagement: (params = {}) => {
      console.log('📊 Fetching user engagement data:', params);
      return apiClient.get('/analytics/user-engagement', { params });
    },

    // Get filter options for analytics
    getFilterOptions: () => {
      console.log('📊 Fetching analytics filter options');
      return apiClient.get('/analytics/filter-options');
    },

    // Get system status metrics
    getSystemStatus: () => {
      console.log('📊 Fetching system status data');
      return apiClient.get('/analytics/system-status');
    },
  },
};

export default apiService;