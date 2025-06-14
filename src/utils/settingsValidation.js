/**
 * Settings validation utilities for client-side enum validation
 * Prevents 500 errors from database constraint violations
 */

// Enum constraints from database schema
export const ENUM_CONSTRAINTS = {
  appearance: {
    theme: ['light', 'dark', 'system'],
    font_size: ['small', 'medium', 'large'],
    primary_color: /^#[0-9A-F]{6}$/i, // Hex color pattern
  },
  
  notifications: {
    notification_types: {
      project_updates: [true, false, 1, 0],
      comments: [true, false, 1, 0],
      collaborations: [true, false, 1, 0],
      system_updates: [true, false, 1, 0],
      tasks: [true, false, 1, 0],
      calendar: [true, false, 1, 0],
      security: [true, false, 1, 0],
      email_digest: [true, false, 1, 0],
    },
    quiet_hours: {
      time_format: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    }
  },
  
  privacy: {
    portfolio_visibility: ['public', 'private', 'unlisted'],
    social_display: ['all', 'home', 'contact', 'none'],
  },
    security: {
    session_timeout: { min: 5, max: 10080 }, // minutes (5 minutes to 1 week)
    two_factor_methods: ['email', 'sms', 'app'],
  },
  
  localization: {
    language: ['en', 'es', 'fr', 'de', 'pt', 'sw', 'ar'],
    timezone: [
      'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
      'Africa/Cairo', 'Africa/Nairobi', 'America/Sao_Paulo'
    ],
    date_format: ['mdy', 'dmy', 'ymd'], // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
    time_format: ['12', '24'],
  },
    backup: {
    backup_frequency: ['daily', 'weekly', 'monthly', 'never'],
    backup_location: ['cloud', 'local'],
    export_format: ['json', 'csv', 'xml'],
  },
  
  developer: {
    development_environment: ['vscode', 'intellij', 'sublime', 'vim', 'other'],
    code_snippet_theme: ['light', 'dark', 'monokai', 'github', 'vs-code', 'dracula'],
  },
  
  projects: {
    default_sort: ['title', 'created_at', 'updated_at', 'status', 'priority', 'progress'],
    projects_per_page: [5, 6, 9, 10, 12, 18, 24, 100],
  }
};

// Data type conversion utilities
export const convertBooleanToInt = (value) => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (value === 'true' || value === '1' || value === 1) {
    return 1;
  }
  return 0;
};

export const convertIntToBoolean = (value) => {
  return value === 1 || value === '1' || value === true;
};

/**
 * Validates a single field against its enum constraints
 */
export const validateField = (category, field, value) => {
  const constraints = ENUM_CONSTRAINTS[category]?.[field];
  
  if (!constraints) {
    return { valid: true };
  }
  
  // Handle regex patterns
  if (constraints instanceof RegExp) {
    const isValid = constraints.test(value);
    return {
      valid: isValid,
      message: isValid ? null : `Invalid format for ${field}. Expected pattern: ${constraints.source}`
    };
  }
  
  // Handle min/max constraints (for numbers)
  if (typeof constraints === 'object' && constraints.min !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < constraints.min || numValue > constraints.max) {
      return {
        valid: false,
        message: `${field} must be between ${constraints.min} and ${constraints.max}`
      };
    }
    return { valid: true };
  }
  
  // Handle array of allowed values
  if (Array.isArray(constraints)) {
    const isValid = constraints.includes(value);
    return {
      valid: isValid,
      message: isValid ? null : `Invalid value for ${field}. Allowed values: ${constraints.join(', ')}`
    };
  }
  
  // Handle nested object constraints
  if (typeof constraints === 'object' && value && typeof value === 'object') {
    for (const [subField, subValue] of Object.entries(value)) {
      const subResult = validateField(`${category}.${field}`, subField, subValue);
      if (!subResult.valid) {
        return subResult;
      }
    }
    return { valid: true };
  }
  
  return { valid: true };
};

/**
 * Validates entire settings data structure
 */
export const validateSettings = (settingsData) => {
  const errors = [];
  
  for (const [category, categoryData] of Object.entries(settingsData)) {
    if (typeof categoryData === 'object' && categoryData !== null) {
      for (const [field, value] of Object.entries(categoryData)) {
        const validation = validateField(category, field, value);
        if (!validation.valid) {
          errors.push({
            category,
            field,
            value,
            message: validation.message
          });
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Special validations for complex fields
 */
export const validateSpecialFields = (settingsData) => {
  const errors = [];
  
  // Validate quiet hours logic
  if (settingsData.notifications?.quiet_hours) {
    const { enabled, from, to } = settingsData.notifications.quiet_hours;
    
    if (enabled && from && to) {
      const fromTime = new Date(`2000-01-01 ${from}`);
      const toTime = new Date(`2000-01-01 ${to}`);
      
      if (fromTime >= toTime) {
        errors.push({
          category: 'notifications',
          field: 'quiet_hours',
          message: 'Quiet hours "from" time must be before "to" time'
        });
      }
    }
  }
    // Validate session timeout
  if (settingsData.security?.session_timeout) {
    const timeout = Number(settingsData.security.session_timeout);
    if (isNaN(timeout) || timeout < 5 || timeout > 10080) {
      errors.push({
        category: 'security',
        field: 'session_timeout',
        message: 'Session timeout must be between 5 and 10080 minutes'
      });
    }
  }
  
  // Validate code editor length
  if (settingsData.developer?.code_editor) {
    if (settingsData.developer.code_editor.trim().length > 100) {
      errors.push({
        category: 'developer',
        field: 'code_editor',
        message: 'Code editor preference should not exceed 100 characters'
      });
    }
  }
  
  // Validate primary color format
  if (settingsData.appearance?.primary_color) {
    const colorPattern = /^#[0-9A-F]{6}$/i;
    if (!colorPattern.test(settingsData.appearance.primary_color)) {
      errors.push({
        category: 'appearance',
        field: 'primary_color',
        message: 'Primary color must be a valid hex color (e.g., #2563eb)'
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Transforms frontend values to backend format
 */
export const transformForBackend = (settingsData) => {
  const transformed = JSON.parse(JSON.stringify(settingsData)); // Deep clone
  
  // Convert boolean values to integers for database storage
  const booleanFields = [
    'appearance.sidebar_collapsed',
    'appearance.animations_enabled',
    'notifications.notifications_enabled',
    'notifications.email_notifications',
    'notifications.push_notifications',
    'notifications.project_updates',
    'notifications.messages',
    'notifications.quiet_hours.enabled',
    'privacy.show_code_samples',
    'privacy.show_project_metrics',
    'privacy.allow_project_comments',
    'privacy.show_email',
    'privacy.show_phone',
    'privacy.profile_public',
    'privacy.allow_search_engine_indexing',
    'security.two_factor_enabled',
    'security.login_notifications',
    'backup.auto_backup'
  ];
  
  booleanFields.forEach(fieldPath => {
    const keys = fieldPath.split('.');
    let current = transformed;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] !== undefined) {
      current[lastKey] = convertBooleanToInt(current[lastKey]);
    }
  });
  
  // Convert notification types
  if (transformed.notifications?.notification_types) {
    Object.keys(transformed.notifications.notification_types).forEach(key => {
      transformed.notifications.notification_types[key] = 
        convertBooleanToInt(transformed.notifications.notification_types[key]);
    });
  }
  
  // Ensure projects_per_page is integer
  if (transformed.projects?.projects_per_page) {
    transformed.projects.projects_per_page = parseInt(transformed.projects.projects_per_page);
  }
  
  return transformed;
};

/**
 * Detects which fields have changed for partial updates
 */
export const detectChanges = (originalSettings, newSettings) => {
  const changes = {};
  
  const compareObjects = (original, updated, path = '') => {
    const result = {};
      for (const [key, value] of Object.entries(updated)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedChanges = compareObjects(original?.[key] || {}, value, currentPath);
        if (Object.keys(nestedChanges).length > 0) {
          result[key] = nestedChanges;
        }
      } else {
        // Handle array comparison
        if (Array.isArray(value) && Array.isArray(original?.[key])) {
          // Compare arrays by content, not reference
          if (value.length !== original[key].length || 
              !value.every((item, index) => item === original[key][index])) {
            result[key] = value;
          }
        } else {
          // Compare primitive values
          if (original?.[key] !== value) {
            result[key] = value;
          }
        }
      }
    }
    
    return result;
  };
  
  return compareObjects(originalSettings, newSettings);
};

/**
 * Creates user-friendly error messages for constraint violations
 */
export const formatErrorMessages = (errors) => {
  if (!errors || errors.length === 0) return [];
  
  return errors.map(error => {
    const categoryName = error.category.charAt(0).toUpperCase() + error.category.slice(1);
    const fieldName = error.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      category: error.category,
      field: error.field,
      title: `${categoryName} - ${fieldName}`,
      message: error.message,
      value: error.value
    };
  });
};

/**
 * Validates settings data specifically for API PUT requests
 * Includes constraint validation to prevent 500 errors
 */
export const validateForAPI = (settingsData) => {
  // Run basic validation
  const basicValidation = validateSettings(settingsData);
  const specialValidation = validateSpecialFields(settingsData);
  
  // Additional API-specific validations
  const apiErrors = [];
  
  // Validate critical enum constraints from API spec
  const criticalConstraints = {
    'backup.backup_location': ['cloud', 'local'],
    'backup.backup_frequency': ['daily', 'weekly', 'monthly', 'never'],
    'developer.code_snippet_theme': ['light', 'dark', 'monokai', 'github', 'vs-code', 'dracula'],
    'projects.default_sort': ['title', 'created_at', 'updated_at', 'status', 'priority', 'progress'],
    'localization.time_format': ['12', '24']
  };
  
  for (const [fieldPath, allowedValues] of Object.entries(criticalConstraints)) {
    const [category, field] = fieldPath.split('.');
    const value = settingsData[category]?.[field];
    
    if (value !== undefined && !allowedValues.includes(value)) {
      apiErrors.push({
        category,
        field,
        value,
        message: `Invalid ${field}. Must be one of: ${allowedValues.join(', ')}`
      });
    }
  }
  
  // Validate numeric ranges
  if (settingsData.security?.session_timeout) {
    const timeout = Number(settingsData.security.session_timeout);
    if (isNaN(timeout) || timeout < 5 || timeout > 10080) {
      apiErrors.push({
        category: 'security',
        field: 'session_timeout',
        value: settingsData.security.session_timeout,
        message: 'Session timeout must be between 5 and 10080 minutes'
      });
    }
  }
  
  if (settingsData.projects?.projects_per_page) {
    const perPage = Number(settingsData.projects.projects_per_page);
    if (isNaN(perPage) || perPage < 5 || perPage > 100) {
      apiErrors.push({
        category: 'projects',
        field: 'projects_per_page',
        value: settingsData.projects.projects_per_page,
        message: 'Projects per page must be between 5 and 100'
      });
    }
  }
  
  // Combine all errors
  const allErrors = [
    ...basicValidation.errors,
    ...specialValidation.errors,
    ...apiErrors
  ];
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
};

/**
 * Updates only changed settings for efficient API calls
 * This function creates a reusable settings update utility
 */
export const updateSettings = async (apiService, changedSettings, options = {}) => {
  const { validateBeforeSend = true, transformData = true } = options;
  
  try {
    // Validate data if requested
    if (validateBeforeSend) {
      const validation = validateForAPI(changedSettings);
      if (!validation.valid) {
        const formattedErrors = formatErrorMessages(validation.errors);
        throw new Error(`Validation failed: ${formattedErrors.map(e => e.message).join('; ')}`);
      }
    }
    
    // Transform data for backend if requested
    const dataToSend = transformData ? transformForBackend(changedSettings) : changedSettings;
    
    // Make API call
    const response = await apiService.settings.update(dataToSend);
    
    return {
      success: true,
      data: response.data,
      message: 'Settings updated successfully'
    };
    
  } catch (error) {
    console.error('Settings update failed:', error);
    
    // Handle different error types
    if (error.response?.status === 500 && error.response?.data?.message?.includes('CONSTRAINT')) {
      return {
        success: false,
        error: 'Invalid data format. Please check your inputs and try again.',
        details: error.response.data.message
      };
    }
    
    if (error.response?.status === 400) {
      return {
        success: false,
        error: error.response.data.message || 'Invalid request data',
        details: error.response.data
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to update settings',
      details: error
    };
  }
};

/**
 * Creates change detection for form fields to enable partial updates
 */
export const createSettingsChangeDetector = (initialSettings) => {
  let previousSettings = JSON.parse(JSON.stringify(initialSettings));
  
  return {
    detectChanges: (currentSettings) => {
      const changes = detectChanges(previousSettings, currentSettings);
      return changes;
    },
    
    updateBaseline: (newSettings) => {
      previousSettings = JSON.parse(JSON.stringify(newSettings));
    },
    
    hasChanges: (currentSettings) => {
      const changes = detectChanges(previousSettings, currentSettings);
      return Object.keys(changes).length > 0;
    }
  };
};

export default {
  ENUM_CONSTRAINTS,
  validateField,
  validateSettings,
  validateSpecialFields,
  transformForBackend,
  detectChanges,
  formatErrorMessages,
  convertBooleanToInt,
  convertIntToBoolean,
  validateForAPI,
  updateSettings,
  createSettingsChangeDetector
}