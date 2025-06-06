/**
 * Profile Population Script
 * 
 * This script handles:
 * 1. Identifying and populating null/empty profile fields
 * 2. Automatically setting currentPosition and currentCompany from the most recent experience
 * 3. Validating and cleaning profile data
 * 4. Providing comprehensive error handling and logging
 * 
 * Usage:
 * - Can be run as a standalone script for bulk operations
 * - Can be integrated into profile update workflows
 * - Provides both automated and manual population modes
 */

import apiService from '../services/api/apiService';

/**
 * Profile field mapping and validation rules
 */
const PROFILE_FIELD_CONFIG = {
  // Required fields that should be populated
  required: [
    'firstName',
    'lastName',
    'email',
    'title', // currentPosition fallback
  ],
  
  // Optional fields that can be auto-populated
  optional: [
    'bio',
    'phone',
    'dateOfBirth',
    'gender',
    'nationality',
    'currentPosition',
    'currentCompany',
    'website',
    'github',
    'linkedin',
    'availability',
    'hourlyRate',
    'location.city',
    'location.country',
  ],
  
  // Fields that can be derived from other data
  derivable: {
    'currentPosition': 'experience.position',
    'currentCompany': 'experience.company',
    'title': 'currentPosition',
    'bio': 'auto-generate',
    'yearsOfExperience': 'experience.calculate',
  },
  
  // Default values for common fields
  defaults: {
    nationality: 'Kenyan',
    availability: 'available',
    gender: null, // Don't set default for sensitive fields
    'location.country': 'Kenya',
  }
};

/**
 * ProfilePopulator Class
 * Handles all profile population and validation operations
 */
class ProfilePopulator {
  constructor() {
    this.results = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [],
      summary: {}
    };
  }

  /**
   * Main entry point - populate profile for current user
   */
  async populateCurrentUserProfile(options = {}) {
    try {
      console.log('🚀 Starting profile population for current user...');
      
      // Get current user profile
      const profileResponse = await apiService.profile.get();
      if (!profileResponse.data?.success) {
        throw new Error('Failed to fetch current user profile');
      }

      const user = profileResponse.data.data.user;
      console.log('👤 Current user:', user.email);

      // Get user's experience data
      const experienceResponse = await apiService.experience.getAll();
      const experiences = experienceResponse.data?.data?.experiences || [];
      
      // Populate profile
      const updatedProfile = await this.populateUserProfile(user, experiences, options);
      
      // Update profile if changes were made
      if (updatedProfile.hasChanges) {
        await this.updateProfile(updatedProfile.profile);
        console.log('✅ Profile updated successfully');
      } else {
        console.log('ℹ️ No changes needed - profile is already complete');
      }

      return {
        success: true,
        profile: updatedProfile.profile,
        changes: updatedProfile.changes,
        hasChanges: updatedProfile.hasChanges
      };

    } catch (error) {
      console.error('❌ Error populating current user profile:', error);
      this.results.failed++;
      this.results.errors.push({
        type: 'current_user',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bulk populate profiles for multiple users
   */
  async bulkPopulateProfiles(userIds = [], options = {}) {
    console.log(`🔄 Starting bulk profile population for ${userIds.length || 'all'} users...`);
    
    try {
      // If no specific user IDs provided, get all users (admin function)
      let users = [];
      if (userIds.length === 0) {
        // This would require an admin endpoint to get all users
        console.log('⚠️ Bulk operation requires admin privileges and user list');
        throw new Error('Bulk operation not implemented - requires admin access');
      } else {
        // Process specific users
        for (const userId of userIds) {
          try {
            const user = await this.getUserProfile(userId);
            const experiences = await this.getUserExperience(userId);
            users.push({ user, experiences });
          } catch (error) {
            console.warn(`⚠️ Failed to fetch data for user ${userId}:`, error.message);
            this.results.failed++;
          }
        }
      }

      // Process each user
      for (const { user, experiences } of users) {
        try {
          this.results.processed++;
          const result = await this.populateUserProfile(user, experiences, options);
          
          if (result.hasChanges) {
            await this.updateProfile(result.profile, user.id);
            this.results.updated++;
            console.log(`✅ Updated profile for ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process user ${user.email}:`, error.message);
          this.results.failed++;
          this.results.errors.push({
            type: 'user_processing',
            userId: user.id,
            email: user.email,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      return this.results;

    } catch (error) {
      console.error('❌ Bulk operation failed:', error);
      throw error;
    }
  }

  /**
   * Populate a single user's profile
   */
  async populateUserProfile(user, experiences = [], options = {}) {
    const {
      dryRun = false,
      forceUpdate = false,
      autoGenerateBio = true,
      updateCurrentPosition = true
    } = options;

    console.log(`🔍 Analyzing profile for ${user.email}...`);

    const profile = user.profile || {};
    const originalProfile = JSON.parse(JSON.stringify(profile));
    const changes = [];

    // 1. Populate currentPosition and currentCompany from experience
    if (updateCurrentPosition && experiences.length > 0) {
      const currentExperience = this.getCurrentExperience(experiences);
      if (currentExperience) {
        if (!profile.currentPosition || forceUpdate) {
          profile.currentPosition = currentExperience.position;
          changes.push({
            field: 'currentPosition',
            oldValue: originalProfile.currentPosition,
            newValue: currentExperience.position,
            source: 'experience'
          });
        }

        if (!profile.currentCompany || forceUpdate) {
          profile.currentCompany = currentExperience.company;
          changes.push({
            field: 'currentCompany',
            oldValue: originalProfile.currentCompany,
            newValue: currentExperience.company,
            source: 'experience'
          });
        }

        // Update title if not set
        if (!profile.title || forceUpdate) {
          profile.title = currentExperience.position;
          changes.push({
            field: 'title',
            oldValue: originalProfile.title,
            newValue: currentExperience.position,
            source: 'experience'
          });
        }
      }
    }

    // 2. Calculate years of experience
    if (experiences.length > 0) {
      const yearsExperience = this.calculateYearsOfExperience(experiences);
      if (!profile.yearsOfExperience || forceUpdate) {
        profile.yearsOfExperience = yearsExperience;
        changes.push({
          field: 'yearsOfExperience',
          oldValue: originalProfile.yearsOfExperience,
          newValue: yearsExperience,
          source: 'calculated'
        });
      }
    }

    // 3. Auto-generate bio if requested and not present
    if (autoGenerateBio && (!profile.bio || forceUpdate)) {
      const generatedBio = this.generateBio(profile, experiences);
      if (generatedBio) {
        profile.bio = generatedBio;
        changes.push({
          field: 'bio',
          oldValue: originalProfile.bio,
          newValue: generatedBio,
          source: 'auto-generated'
        });
      }
    }

    // 4. Set default values for empty fields
    this.setDefaultValues(profile, changes, originalProfile, forceUpdate);

    // 5. Validate and clean data
    this.validateAndCleanProfile(profile);

    const hasChanges = changes.length > 0;

    if (hasChanges) {
      console.log(`📝 Found ${changes.length} changes for ${user.email}:`);
      changes.forEach(change => {
        console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}" (${change.source})`);
      });
    }

    return {
      profile,
      changes,
      hasChanges,
      originalProfile
    };
  }

  /**
   * Get the most recent/current experience
   */
  getCurrentExperience(experiences) {
    if (!experiences || experiences.length === 0) return null;

    // First, try to find current position (current = true/1)
    const currentPos = experiences.find(exp => exp.current === 1 || exp.current === true);
    if (currentPos) {
      return currentPos;
    }

    // If no current position, get the most recent one
    const sortedExperiences = experiences
      .filter(exp => exp.startDate)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return sortedExperiences[0] || null;
  }

  /**
   * Calculate total years of experience
   */
  calculateYearsOfExperience(experiences) {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;

    experiences.forEach(exp => {
      if (!exp.startDate) return;

      const startDate = new Date(exp.startDate);
      const endDate = (exp.current === 1 || exp.current === true) 
        ? new Date() 
        : new Date(exp.endDate || new Date());

      const diffTime = Math.abs(endDate - startDate);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
      totalMonths += diffMonths;
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Auto-generate a professional bio
   */
  generateBio(profile, experiences) {
    try {
      const firstName = profile.firstName || 'Professional';
      const title = profile.currentPosition || profile.title || 'Software Developer';
      const company = profile.currentCompany || 'the tech industry';
      const yearsExp = profile.yearsOfExperience || this.calculateYearsOfExperience(experiences);

      let bio = `${firstName} is a dedicated ${title}`;
      
      if (company && company !== 'the tech industry') {
        bio += ` currently working at ${company}`;
      }

      if (yearsExp > 0) {
        bio += ` with ${yearsExp === 1 ? '1 year' : `${yearsExp} years`} of professional experience`;
      }

      // Add specializations based on experience
      const technologies = this.extractTechnologiesFromExperience(experiences);
      if (technologies.length > 0) {
        const topTech = technologies.slice(0, 3).join(', ');
        bio += `. Specialized in ${topTech}`;
      }

      bio += '. Passionate about delivering high-quality solutions and continuous learning in the ever-evolving tech landscape.';

      return bio;
    } catch (error) {
      console.warn('⚠️ Failed to generate bio:', error.message);
      return null;
    }
  }

  /**
   * Extract technologies from experience data
   */
  extractTechnologiesFromExperience(experiences) {
    const techCount = {};
    
    experiences.forEach(exp => {
      if (exp.skills && Array.isArray(exp.skills)) {
        exp.skills.forEach(skill => {
          techCount[skill] = (techCount[skill] || 0) + 1;
        });
      }
    });

    return Object.entries(techCount)
      .sort(([,a], [,b]) => b - a)
      .map(([tech]) => tech);
  }

  /**
   * Set default values for empty fields
   */
  setDefaultValues(profile, changes, originalProfile, forceUpdate) {
    Object.entries(PROFILE_FIELD_CONFIG.defaults).forEach(([field, defaultValue]) => {
      if (field.includes('.')) {
        // Handle nested fields like location.country
        const [parent, child] = field.split('.');
        if (!profile[parent]) profile[parent] = {};
        
        if (!profile[parent][child] || forceUpdate) {
          profile[parent][child] = defaultValue;
          changes.push({
            field,
            oldValue: originalProfile[parent]?.[child],
            newValue: defaultValue,
            source: 'default'
          });
        }
      } else {
        if (!profile[field] || forceUpdate) {
          profile[field] = defaultValue;
          changes.push({
            field,
            oldValue: originalProfile[field],
            newValue: defaultValue,
            source: 'default'
          });
        }
      }
    });
  }

  /**
   * Validate and clean profile data
   */
  validateAndCleanProfile(profile) {
    // Clean email
    if (profile.email) {
      profile.email = profile.email.toLowerCase().trim();
    }

    // Validate phone number format
    if (profile.phone) {
      profile.phone = this.cleanPhoneNumber(profile.phone);
    }

    // Validate URLs
    ['website', 'github', 'linkedin'].forEach(field => {
      if (profile[field]) {
        profile[field] = this.validateAndCleanUrl(profile[field]);
      }
    });

    // Validate hourly rate
    if (profile.hourlyRate) {
      profile.hourlyRate = Math.max(0, parseFloat(profile.hourlyRate) || 0);
    }

    // Clean and validate location
    if (profile.location) {
      Object.keys(profile.location).forEach(key => {
        if (profile.location[key]) {
          profile.location[key] = profile.location[key].trim();
        }
      });
    }
  }

  /**
   * Clean phone number
   */
  cleanPhoneNumber(phone) {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add + if missing for international numbers
    if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Validate and clean URL
   */
  validateAndCleanUrl(url) {
    if (!url) return url;
    
    // Add https:// if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      console.warn(`⚠️ Invalid URL: ${url}`);
      return url; // Return original if validation fails
    }
  }

  /**
   * Update profile via API
   */
  async updateProfile(profile, userId = null) {
    try {
      const updateData = {
        ...profile,
        updatedAt: new Date().toISOString()
      };

      if (userId) {
        // Admin update for specific user (requires admin endpoint)
        throw new Error('Admin profile updates not implemented');
      } else {
        // Update current user's profile
        const response = await apiService.profile.update(updateData);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID (admin function)
   */
  async getUserProfile(userId) {
    throw new Error('Admin function not implemented - getUserProfile');
  }

  /**
   * Get user experience by ID (admin function)
   */
  async getUserExperience(userId) {
    throw new Error('Admin function not implemented - getUserExperience');
  }

  /**
   * Generate summary report
   */
  generateReport() {
    const { processed, updated, failed, errors } = this.results;
    
    console.log('\n📊 Profile Population Report:');
    console.log(`Total Processed: ${processed}`);
    console.log(`Successfully Updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.message}`);
      });
    }

    return this.results;
  }
}

/**
 * Utility functions for integration with existing components
 */
export const profileUtils = {
  /**
   * Check if profile needs population
   */
  needsPopulation(profile) {
    const requiredFields = PROFILE_FIELD_CONFIG.required;
    const missingRequired = requiredFields.filter(field => !profile[field]);
    
    const derivableFields = Object.keys(PROFILE_FIELD_CONFIG.derivable);
    const missingDerivable = derivableFields.filter(field => !profile[field]);
    
    return {
      needsUpdate: missingRequired.length > 0 || missingDerivable.length > 0,
      missingRequired,
      missingDerivable,
      completeness: ((requiredFields.length - missingRequired.length) / requiredFields.length) * 100
    };
  },

  /**
   * Auto-populate currentPosition and currentCompany
   */
  async autoPopulateFromExperience() {
    try {
      const populator = new ProfilePopulator();
      const result = await populator.populateCurrentUserProfile({
        updateCurrentPosition: true,
        autoGenerateBio: false,
        forceUpdate: false
      });
      
      return result;
    } catch (error) {
      console.error('❌ Auto-population failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get profile completion percentage
   */
  getProfileCompleteness(profile) {
    const allFields = [...PROFILE_FIELD_CONFIG.required, ...PROFILE_FIELD_CONFIG.optional];
    const completedFields = allFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return profile[parent] && profile[parent][child];
      }
      return profile[field];
    });
    
    return Math.round((completedFields.length / allFields.length) * 100);
  }
};

// Export the main class and utility functions
export default ProfilePopulator;
export { PROFILE_FIELD_CONFIG };

/**
 * CLI Usage Example:
 * 
 * import ProfilePopulator from './profilePopulator.js';
 * 
 * // Populate current user
 * const populator = new ProfilePopulator();
 * const result = await populator.populateCurrentUserProfile({
 *   dryRun: false,
 *   forceUpdate: false,
 *   autoGenerateBio: true
 * });
 * 
 * // Check if profile needs updates
 * import { profileUtils } from './profilePopulator.js';
 * const status = profileUtils.needsPopulation(userProfile);
 * console.log(`Profile completeness: ${status.completeness}%`);
 */
