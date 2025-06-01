import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaPlus, 
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaLaptopCode,
  FaCogs,
  FaTools,
  FaDatabase,
  FaGlobe
} from 'react-icons/fa';
import Modal from '../ui/Modal';
import apiService from '../../services/api/apiService';

/**
 * AddSkillModal component for adding new skills via modal
 */
const AddSkillModal = ({
  isOpen,
  onClose,
  onSkillAdded,
  existingSkills = {},
  preselectedCategory = null
}) => {  // Form state
  const [formData, setFormData] = useState({
    name: '',
    proficiencyLevel: 2, // intermediate by default
    category: preselectedCategory || 'skills',
    description: '',
    yearsExperience: 1,
    isFeatured: false
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Skill suggestions organized by category
  const skillSuggestions = {
    skills: [
      'Leadership', 'Project Management', 'Problem Solving', 'Communication', 
      'Team Work', 'Critical Thinking', 'Time Management', 'Creativity',
      'Analytical Thinking', 'Decision Making', 'Adaptability', 'Mentoring'
    ],
    languages: [
      'JavaScript', 'Python', 'Java', 'C#', 'TypeScript', 'Go', 'Rust',
      'PHP', 'Ruby', 'Swift', 'Kotlin', 'C++', 'C', 'Scala', 'Dart'
    ],
    frameworks: [
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django',
      'Flask', 'Spring Boot', 'Laravel', '.NET Core', 'Next.js', 'Nuxt.js',
      'React Native', 'Flutter', 'Ionic', 'Svelte', 'Ember.js'
    ],
    tools: [
      'Git', 'Docker', 'Kubernetes', 'Jenkins', 'VS Code', 'IntelliJ IDEA',
      'Postman', 'Figma', 'Adobe XD', 'Slack', 'Jira', 'Confluence',
      'Webpack', 'Babel', 'ESLint', 'Prettier', 'npm', 'yarn'
    ],
    databases: [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
      'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
      'Elasticsearch', 'Neo4j', 'InfluxDB', 'CouchDB'
    ],
    platforms: [
      'AWS', 'Google Cloud', 'Azure', 'Heroku', 'Vercel', 'Netlify',
      'DigitalOcean', 'Linux', 'Windows', 'macOS', 'Android', 'iOS',
      'Shopify', 'WordPress', 'Salesforce'
    ]
  };

  // Category configuration
  const categories = [
    { value: 'skills', label: 'General Skills', icon: <FaStar />, color: '#8b5cf6' },
    { value: 'languages', label: 'Programming Languages', icon: <FaLaptopCode />, color: '#3b82f6' },
    { value: 'frameworks', label: 'Frameworks & Libraries', icon: <FaCogs />, color: '#10b981' },
    { value: 'tools', label: 'Tools & Software', icon: <FaTools />, color: '#f59e0b' },
    { value: 'databases', label: 'Databases', icon: <FaDatabase />, color: '#ef4444' },
    { value: 'platforms', label: 'Platforms & Services', icon: <FaGlobe />, color: '#06b6d4' }
  ];

  // Proficiency level mapping
  const proficiencyLevels = [
    { value: 1, label: 'Beginner', description: 'Basic understanding and limited experience' },
    { value: 2, label: 'Intermediate', description: 'Good understanding with practical experience' },
    { value: 3, label: 'Advanced', description: 'Strong expertise with extensive experience' },
    { value: 4, label: 'Expert', description: 'Exceptional mastery and leadership in this area' }
  ];

  // Get filtered suggestions based on current input and category
  const getFilteredSuggestions = useCallback(() => {
    if (!formData.name.trim() || formData.name.length < 2) return [];
    
    const suggestions = skillSuggestions[formData.category] || [];
    const existingSkillsInCategory = existingSkills[formData.category] || [];
    const existingNames = existingSkillsInCategory.map(skill => skill.name.toLowerCase());
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(formData.name.toLowerCase()) &&
      !existingNames.includes(suggestion.toLowerCase())
    ).slice(0, 5);
  }, [formData.name, formData.category, existingSkills]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);

    // Show suggestions for name field
    if (field === 'name') {
      setShowSuggestions(value.length >= 2);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion
    }));
    setShowSuggestions(false);
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];

    // Validate name
    if (!formData.name.trim()) {
      errors.push('Skill name is required');
    } else if (formData.name.trim().length < 2) {
      errors.push('Skill name must be at least 2 characters long');
    } else if (formData.name.trim().length > 50) {
      errors.push('Skill name must be less than 50 characters');
    }

    // Check for duplicates in the selected category
    const existingSkillsInCategory = existingSkills[formData.category] || [];
    const isDuplicate = existingSkillsInCategory.some(
      skill => skill.name.toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      errors.push(`"${formData.name.trim()}" already exists in ${categories.find(c => c.value === formData.category)?.label}`);
    }

    // Validate years experience
    if (formData.yearsExperience < 0 || formData.yearsExperience > 50) {
      errors.push('Years of experience must be between 0 and 50');
    }

    // Validate description length
    if (formData.description && formData.description.length > 200) {
      errors.push('Description must be less than 200 characters');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare API payload
      const skillPayload = {
        name: formData.name.trim(),
        proficiencyLevel: formData.proficiencyLevel,
        category: formData.category,
        description: formData.description.trim() || null,
        yearsExperience: formData.yearsExperience,
        isFeatured: formData.isFeatured
      };

      console.log('🚀 Creating skill:', skillPayload);

      // Call API to create skill
      const response = await apiService.skills.create(skillPayload);
      
      console.log('✅ Skill created successfully:', response.data);

      // Show success message
      setSuccess('Skill added successfully!');

      // Call the onSkillAdded callback to update parent component
      if (onSkillAdded) {
        onSkillAdded(response.data);
      }

      // Close modal after a brief delay to show success
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ Error creating skill:', error);
      
      let errorMessage = 'Failed to add skill. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'You are not authorized to add skills. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to add skills.';
            break;
          case 422:
            errorMessage = 'Invalid skill data provided. Please check your entries.';
            break;
          case 409:
            errorMessage = 'This skill already exists. Please choose a different name.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      proficiencyLevel: 2,
      category: preselectedCategory || 'skills',
      description: '',
      yearsExperience: 1,
      isFeatured: false
    });
    setError(null);
    setSuccess(null);
    setShowSuggestions(false);
  };

  // Update form when preselected category changes
  React.useEffect(() => {
    if (preselectedCategory && isOpen) {
      setFormData(prev => ({
        ...prev,
        category: preselectedCategory
      }));
    }
  }, [preselectedCategory, isOpen]);

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Get category info for current selection
  const currentCategory = categories.find(cat => cat.value === formData.category);
  const filteredSuggestions = getFilteredSuggestions();

  // Modal footer with actions
  const modalFooter = (
    <div className="add-skill-modal__footer">
      <button
        type="button"
        className="add-skill-modal__btn add-skill-modal__btn--secondary"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="add-skill-form"
        className="add-skill-modal__btn add-skill-modal__btn--primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="add-skill-modal__spinner"></div>
            Adding...
          </>
        ) : (
          <>
            <FaPlus />
            Add Skill
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Skill"
      size="large"
      className="add-skill-modal"
      footer={modalFooter}
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="add-skill-modal__content">
        {/* Success and Error Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="add-skill-modal__alert add-skill-modal__alert--error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationTriangle />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="add-skill-modal__alert-close"
                aria-label="Dismiss error"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="add-skill-modal__alert add-skill-modal__alert--success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FaCheckCircle />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form id="add-skill-form" onSubmit={handleSubmit} className="add-skill-modal__form">
          {/* Skill Name */}
          <div className="add-skill-modal__field">
            <label htmlFor="skill-name" className="add-skill-modal__label">
              Skill Name <span className="add-skill-modal__required">*</span>
            </label>
            <div className="add-skill-modal__input-wrapper">
              <input
                id="skill-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter skill name..."
                className="add-skill-modal__input"
                disabled={isSubmitting}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(formData.name.length >= 2)}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div 
                  className="add-skill-modal__suggestions"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="add-skill-modal__suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            <div className="add-skill-modal__field-help">
              <FaInfoCircle />
              Enter the name of your skill (2-50 characters)
            </div>
          </div>          {/* Category Selection */}
          <div className="add-skill-modal__field">
            <label htmlFor="skill-category" className="add-skill-modal__label">
              Category <span className="add-skill-modal__required">*</span>
              {preselectedCategory && (
                <span className="add-skill-modal__preselected-note">
                  (Pre-selected)
                </span>
              )}
            </label>
            <div className="add-skill-modal__category-grid">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className={`add-skill-modal__category-option ${
                    formData.category === category.value ? 'add-skill-modal__category-option--active' : ''
                  } ${preselectedCategory ? 'add-skill-modal__category-option--disabled' : ''}`}
                  style={{ '--category-color': category.color }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={isSubmitting || !!preselectedCategory}
                    className="add-skill-modal__category-radio"
                  />
                  <div className="add-skill-modal__category-content">
                    <div className="add-skill-modal__category-icon">
                      {category.icon}
                    </div>
                    <span className="add-skill-modal__category-label">
                      {category.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Proficiency Level */}
          <div className="add-skill-modal__field">
            <label htmlFor="skill-proficiency" className="add-skill-modal__label">
              Proficiency Level <span className="add-skill-modal__required">*</span>
            </label>
            <div className="add-skill-modal__proficiency-grid">
              {proficiencyLevels.map((level) => (
                <label
                  key={level.value}
                  className={`add-skill-modal__proficiency-option ${
                    formData.proficiencyLevel === level.value ? 'add-skill-modal__proficiency-option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="proficiencyLevel"
                    value={level.value}
                    checked={formData.proficiencyLevel === level.value}
                    onChange={(e) => handleInputChange('proficiencyLevel', parseInt(e.target.value))}
                    disabled={isSubmitting}
                    className="add-skill-modal__proficiency-radio"
                  />
                  <div className="add-skill-modal__proficiency-content">
                    <div className="add-skill-modal__proficiency-level">
                      {level.label}
                    </div>
                    <div className="add-skill-modal__proficiency-description">
                      {level.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div className="add-skill-modal__field">
            <label htmlFor="skill-years" className="add-skill-modal__label">
              Years of Experience
            </label>
            <input
              id="skill-years"
              type="number"
              min="0"
              max="50"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
              className="add-skill-modal__input add-skill-modal__input--number"
              disabled={isSubmitting}
            />
            <div className="add-skill-modal__field-help">
              <FaInfoCircle />
              Number of years you've been working with this skill (0-50)
            </div>
          </div>

          {/* Description */}
          <div className="add-skill-modal__field">
            <label htmlFor="skill-description" className="add-skill-modal__label">
              Description (Optional)
            </label>
            <textarea
              id="skill-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your experience with this skill..."
              className="add-skill-modal__textarea"
              disabled={isSubmitting}
              rows="3"
              maxLength="200"
            />
            <div className="add-skill-modal__field-help">
              <FaInfoCircle />
              Optional description of your experience (max 200 characters)
              <span className="add-skill-modal__char-count">
                {formData.description.length}/200
              </span>
            </div>
          </div>

          {/* Featured Skill Toggle */}
          <div className="add-skill-modal__field">
            <label className="add-skill-modal__checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                disabled={isSubmitting}
                className="add-skill-modal__checkbox"
              />
              <span className="add-skill-modal__checkbox-custom"></span>
              <span className="add-skill-modal__checkbox-text">
                Featured Skill
                <div className="add-skill-modal__checkbox-help">
                  Mark as a featured skill to highlight it in your profile
                </div>
              </span>
            </label>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* AddSkillModal Styles */
        .add-skill-modal {
          --modal-primary: #3b82f6;
          --modal-primary-dark: #2563eb;
          --modal-success: #10b981;
          --modal-error: #ef4444;
          --modal-warning: #f59e0b;
          --modal-bg: #ffffff;
          --modal-bg-secondary: #f8fafc;
          --modal-text: #1e293b;
          --modal-text-secondary: #64748b;
          --modal-text-muted: #94a3b8;
          --modal-border: #e2e8f0;
          --modal-border-focus: #3b82f6;
          --modal-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --modal-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --modal-radius: 8px;
          --modal-radius-lg: 12px;
        }

        /* Dark mode support */
        [data-theme="dark"] .add-skill-modal {
          --modal-bg: #1e293b;
          --modal-bg-secondary: #334155;
          --modal-text: #f1f5f9;
          --modal-text-secondary: #cbd5e1;
          --modal-text-muted: #94a3b8;
          --modal-border: #334155;
        }

        .add-skill-modal__content {
          max-height: 70vh;
          overflow-y: auto;
          padding: 0;
        }

        /* Alert Messages */
        .add-skill-modal__alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--modal-radius);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .add-skill-modal__alert--error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .add-skill-modal__alert--success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        [data-theme="dark"] .add-skill-modal__alert--error {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.2);
        }

        [data-theme="dark"] .add-skill-modal__alert--success {
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .add-skill-modal__alert-close {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          margin-left: auto;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .add-skill-modal__alert-close:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.1);
        }

        /* Form Styles */
        .add-skill-modal__form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .add-skill-modal__field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .add-skill-modal__label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--modal-text);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .add-skill-modal__required {
          color: var(--modal-error);
        }

        .add-skill-modal__input-wrapper {
          position: relative;
        }

        .add-skill-modal__input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--modal-border);
          border-radius: var(--modal-radius);
          background: var(--modal-bg);
          color: var(--modal-text);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .add-skill-modal__input:focus {
          outline: none;
          border-color: var(--modal-border-focus);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .add-skill-modal__input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .add-skill-modal__input--number {
          max-width: 120px;
        }

        .add-skill-modal__textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--modal-border);
          border-radius: var(--modal-radius);
          background: var(--modal-bg);
          color: var(--modal-text);
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease;
          min-height: 80px;
        }

        .add-skill-modal__textarea:focus {
          outline: none;
          border-color: var(--modal-border-focus);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .add-skill-modal__textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Suggestions Dropdown */
        .add-skill-modal__suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--modal-bg);
          border: 2px solid var(--modal-border);
          border-top: none;
          border-radius: 0 0 var(--modal-radius) var(--modal-radius);
          box-shadow: var(--modal-shadow-lg);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .add-skill-modal__suggestion {
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid var(--modal-border);
          transition: background-color 0.2s ease;
          font-size: 0.875rem;
          color: var(--modal-text);
        }

        .add-skill-modal__suggestion:hover {
          background: var(--modal-bg-secondary);
        }

        .add-skill-modal__suggestion:last-child {
          border-bottom: none;
        }

        /* Category Grid */
        .add-skill-modal__category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .add-skill-modal__category-option {
          position: relative;
          display: block;
          padding: 1rem;
          border: 2px solid var(--modal-border);
          border-radius: var(--modal-radius);
          background: var(--modal-bg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-skill-modal__category-option:hover {
          border-color: var(--category-color);
          transform: translateY(-2px);
          box-shadow: var(--modal-shadow);
        }

        .add-skill-modal__category-option--active {
          border-color: var(--category-color);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: var(--modal-shadow);
        }        [data-theme="dark"] .add-skill-modal__category-option--active {
          background: rgba(59, 130, 246, 0.1);
        }

        .add-skill-modal__category-option--disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .add-skill-modal__category-option--disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .add-skill-modal__preselected-note {
          font-size: 0.75rem;
          color: var(--modal-text-secondary);
          font-weight: normal;
          margin-left: 0.5rem;
        }

        .add-skill-modal__category-radio {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .add-skill-modal__category-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .add-skill-modal__category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--category-color);
          color: white;
          font-size: 1rem;
        }

        .add-skill-modal__category-label {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--modal-text);
        }

        /* Proficiency Grid */
        .add-skill-modal__proficiency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.75rem;
        }

        .add-skill-modal__proficiency-option {
          position: relative;
          display: block;
          padding: 0.875rem;
          border: 2px solid var(--modal-border);
          border-radius: var(--modal-radius);
          background: var(--modal-bg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-skill-modal__proficiency-option:hover {
          border-color: var(--modal-primary);
          transform: translateY(-1px);
          box-shadow: var(--modal-shadow);
        }

        .add-skill-modal__proficiency-option--active {
          border-color: var(--modal-primary);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: var(--modal-shadow);
        }

        [data-theme="dark"] .add-skill-modal__proficiency-option--active {
          background: rgba(59, 130, 246, 0.1);
        }

        .add-skill-modal__proficiency-radio {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .add-skill-modal__proficiency-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .add-skill-modal__proficiency-level {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--modal-text);
        }

        .add-skill-modal__proficiency-description {
          font-size: 0.75rem;
          color: var(--modal-text-secondary);
          line-height: 1.4;
        }

        /* Checkbox Styles */
        .add-skill-modal__checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem;
          border: 2px solid var(--modal-border);
          border-radius: var(--modal-radius);
          background: var(--modal-bg);
          transition: all 0.2s ease;
        }

        .add-skill-modal__checkbox-label:hover {
          border-color: var(--modal-primary);
          background: var(--modal-bg-secondary);
        }

        .add-skill-modal__checkbox {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .add-skill-modal__checkbox-custom {
          position: relative;
          width: 20px;
          height: 20px;
          border: 2px solid var(--modal-border);
          border-radius: 4px;
          background: var(--modal-bg);
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .add-skill-modal__checkbox:checked + .add-skill-modal__checkbox-custom {
          background: var(--modal-primary);
          border-color: var(--modal-primary);
        }

        .add-skill-modal__checkbox:checked + .add-skill-modal__checkbox-custom::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .add-skill-modal__checkbox-text {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--modal-text);
        }

        .add-skill-modal__checkbox-help {
          font-size: 0.75rem;
          color: var(--modal-text-secondary);
          font-weight: normal;
          margin-top: 0.25rem;
        }

        /* Field Help Text */
        .add-skill-modal__field-help {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--modal-text-muted);
          margin-top: 0.25rem;
        }

        .add-skill-modal__char-count {
          margin-left: auto;
          font-weight: 500;
        }

        /* Footer */
        .add-skill-modal__footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1.5rem;
        }

        .add-skill-modal__btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--modal-radius);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .add-skill-modal__btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .add-skill-modal__btn--primary {
          background: var(--modal-primary);
          color: white;
        }

        .add-skill-modal__btn--primary:hover:not(:disabled) {
          background: var(--modal-primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--modal-shadow);
        }

        .add-skill-modal__btn--secondary {
          background: var(--modal-bg-secondary);
          color: var(--modal-text);
          border: 2px solid var(--modal-border);
        }

        .add-skill-modal__btn--secondary:hover:not(:disabled) {
          background: var(--modal-border);
          transform: translateY(-1px);
        }

        /* Loading Spinner */
        .add-skill-modal__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .add-skill-modal__category-grid {
            grid-template-columns: 1fr;
          }

          .add-skill-modal__proficiency-grid {
            grid-template-columns: 1fr;
          }

          .add-skill-modal__footer {
            flex-direction: column;
          }

          .add-skill-modal__btn {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .add-skill-modal__content {
            max-height: 80vh;
          }
        }
      `}</style>
    </Modal>
  );
};

AddSkillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSkillAdded: PropTypes.func,
  existingSkills: PropTypes.object,
  preselectedCategory: PropTypes.string
};

export default AddSkillModal;