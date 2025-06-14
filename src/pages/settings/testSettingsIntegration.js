/**
 * Test utility to verify the Settings component PUT integration is working correctly
 * This file can be temporarily imported to test the new functionality
 */

import { validateForAPI, transformForBackend, detectChanges, createSettingsChangeDetector } from '../../utils/settingsValidation';

export const testSettingsIntegration = () => {
  console.log('=== Testing Settings PUT Integration ===');
  
  // Test 1: Change Detection
  console.log('\n1. Testing Change Detection:');
  const initialSettings = {
    appearance: {
      theme: 'light',
      primary_color: '#3b82f6',
      font_size: 'medium'
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      notification_types: {
        tasks: true,
        calendar: false,
        security: true
      }
    },
    security: {
      session_timeout: 30,
      two_factor_enabled: false
    }
  };
  
  const modifiedSettings = {
    appearance: {
      theme: 'dark', // Changed
      primary_color: '#3b82f6', // Same
      font_size: 'large' // Changed
    },
    notifications: {
      email_notifications: true, // Same
      push_notifications: false, // Changed
      notification_types: {
        tasks: true, // Same
        calendar: true, // Changed
        security: true // Same
      }
    },
    security: {
      session_timeout: 60, // Changed
      two_factor_enabled: false // Same
    }
  };
  
  const changeDetector = createSettingsChangeDetector(initialSettings);
  const changes = changeDetector.detectChanges(modifiedSettings);
  
  console.log('Initial settings:', initialSettings);
  console.log('Modified settings:', modifiedSettings);
  console.log('Detected changes:', changes);
  
  // Test 2: Validation
  console.log('\n2. Testing Validation:');
  const testValidData = {
    appearance: {
      theme: 'dark',
      font_size: 'large'
    },
    security: {
      session_timeout: 60
    }
  };
  
  const testInvalidData = {
    appearance: {
      theme: 'invalid_theme', // Invalid enum value
      font_size: 'large'
    },
    security: {
      session_timeout: 20000 // Invalid range (max 10080)
    }
  };
  
  const validResult = validateForAPI(testValidData);
  const invalidResult = validateForAPI(testInvalidData);
  
  console.log('Valid data test:', validResult);
  console.log('Invalid data test:', invalidResult);
  
  // Test 3: Data Transformation
  console.log('\n3. Testing Data Transformation:');
  const settingsForTransform = {
    appearance: {
      sidebar_collapsed: true,
      animations_enabled: false
    },
    notifications: {
      email_notifications: true,
      notification_types: {
        tasks: false,
        security: true
      }
    }
  };
  
  const transformed = transformForBackend(settingsForTransform);
  console.log('Original:', settingsForTransform);
  console.log('Transformed for backend:', transformed);
  
  // Test 4: Partial Update Payload
  console.log('\n4. Testing Partial Update Payload:');
  const partialChanges = {
    notifications: {
      email_notifications: false,
      notification_types: {
        calendar: true
      }
    }
  };
  
  const validation = validateForAPI(partialChanges);
  if (validation.valid) {
    const payload = transformForBackend(partialChanges);
    console.log('Partial update payload:', payload);
    console.log('Payload size:', JSON.stringify(payload).length, 'bytes');
  } else {
    console.log('Validation failed for partial changes:', validation.errors);
  }
  
  console.log('\n=== Integration Test Complete ===');
  
  return {
    changeDetection: changes,
    validation: { valid: validResult, invalid: invalidResult },
    transformation: transformed,
    partialUpdate: validation.valid ? transformForBackend(partialChanges) : null
  };
};

// Test helper for simulating API responses
export const mockApiResponses = {
  success: {
    data: {
      success: true,
      message: 'Settings updated successfully',
      data: {
        updated_fields: ['notifications.email_notifications', 'appearance.theme'],
        timestamp: new Date().toISOString()
      }
    }
  },
  
  constraintError: {
    response: {
      status: 500,
      data: {
        message: 'CONSTRAINT violation: Invalid enum value for backup_frequency'
      }
    }
  },
  
  validationError: {
    response: {
      status: 400,
      data: {
        message: 'Validation failed',
        errors: {
          'security.session_timeout': 'Value must be between 5 and 10080 minutes'
        }
      }
    }
  }
};

// Test the change detector specifically
export const testChangeDetector = () => {
  console.log('=== Testing Change Detector ===');
  
  const initial = {
    notifications: {
      email_notifications: true,
      push_notifications: false,
      notification_types: {
        tasks: true,
        calendar: false,
        security: true,
        email_digest: false
      },
      quiet_hours: {
        enabled: false,
        from: '22:00',
        to: '07:00'
      }
    },
    security: {
      session_timeout: 30,
      two_factor_enabled: false,
      login_notifications: true
    }
  };
  
  const current = {
    notifications: {
      email_notifications: false, // Changed
      push_notifications: false, // Same
      notification_types: {
        tasks: true, // Same
        calendar: true, // Changed
        security: true, // Same
        email_digest: true // Changed
      },
      quiet_hours: {
        enabled: true, // Changed
        from: '23:00', // Changed
        to: '08:00' // Changed
      }
    },
    security: {
      session_timeout: 60, // Changed
      two_factor_enabled: false, // Same
      login_notifications: true // Same
    }
  };
  
  const detector = createSettingsChangeDetector(initial);
  const changes = detector.detectChanges(current);
  
  console.log('Changes detected:', changes);
  console.log('Changes count:', Object.keys(changes).length);
  
  return changes;
};

export default testSettingsIntegration;
