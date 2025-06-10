/**
 * Test utility to verify new settings fields are working correctly
 * This file can be temporarily imported to test the new functionality
 */

export const testNewSettingsFields = (formData) => {
  console.log('=== Testing New Settings Fields ===');
  
  // Test notification fields
  console.log('Notification fields:');
  console.log('- Master toggle:', formData.notificationsEnabled);
  console.log('- Tasks notifications:', formData.notifyOnTasks);
  console.log('- Calendar notifications:', formData.notifyOnCalendar);
  console.log('- Security notifications:', formData.notifyOnSecurity);
  console.log('- Email digest:', formData.emailDigest);
  console.log('- Quiet hours enabled:', formData.quietHoursEnabled);
  
  // Test security fields
  console.log('\nSecurity fields:');
  console.log('- Active API keys count:', formData.activeApiKeysCount);
  console.log('- Active sessions count:', formData.activeSessionsCount);
  console.log('- Last active API key:', formData.lastActiveApiKey);
  
  // Test backup fields
  console.log('\nBackup fields:');
  console.log('- Last backup URL:', formData.lastBackupUrl);
  console.log('- Last backup size:', formData.lastBackupSize);
  
  // Test developer fields
  console.log('\nDeveloper fields:');
  console.log('- Code editor:', formData.codeEditor);
  
  console.log('=== End Test ===');
};

export const testSettingsDataMapping = (backendResponse) => {
  console.log('=== Testing Backend Data Mapping ===');
  console.log('Backend response structure:');
  console.log('- settings.notifications:', backendResponse.settings?.notifications);
  console.log('- settings.security:', backendResponse.settings?.security);
  console.log('- settings.backup:', backendResponse.settings?.backup);
  console.log('- settings.developer:', backendResponse.settings?.developer);
  console.log('=== End Mapping Test ===');
};

export const validateNewFields = (formData) => {
  const errors = [];
  
  // Validate quiet hours logic
  if (formData.quietHoursEnabled && formData.quietHoursFrom && formData.quietHoursTo) {
    const fromTime = new Date(`2000-01-01 ${formData.quietHoursFrom}`);
    const toTime = new Date(`2000-01-01 ${formData.quietHoursTo}`);
    if (fromTime >= toTime) {
      errors.push('Quiet hours "from" time must be before "to" time');
    }
  }
  
  // Validate code editor field
  if (formData.codeEditor && formData.codeEditor.trim().length > 100) {
    errors.push('Code editor preference should not exceed 100 characters');
  }
  
  // Validate counts are numbers
  if (formData.activeApiKeysCount && isNaN(Number(formData.activeApiKeysCount))) {
    errors.push('Active API keys count must be a number');
  }
  
  if (formData.activeSessionsCount && isNaN(Number(formData.activeSessionsCount))) {
    errors.push('Active sessions count must be a number');
  }
  
  return errors;
};
