import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaLink, 
  FaPlus, 
  FaTimes, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaArrowLeft,
  FaInfoCircle,
  FaGlobe
} from 'react-icons/fa';
import apiService from '../../services/api/apiService';

const ExperienceForm = ({ editMode = false, readOnly = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
    // Form data state
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    companyUrl: '',
    companyLogo: '',
    employmentType: 'full-time',
    remote: false,
    skills: [],
    achievements: []
  });
    // UI states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(editMode && !!id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [achievementInput, setAchievementInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');  // Fetch experience data if in edit mode
  useEffect(() => {
    // Reset initial form data when switching between create/edit modes
    setInitialFormData(null);
    setIsDirty(false);
    
    if (editMode && id) {
      const fetchExperience = async () => {
        try {
          setIsLoading(true);
          
          const response = await apiService.experience.getById(id);
          const experienceData = response.data?.data?.experience;
            if (experienceData) {
            setFormData({
              company: experienceData.company || '',
              position: experienceData.position || '',
              location: experienceData.location || '',
              startDate: experienceData.startDate || '',
              endDate: experienceData.endDate || '',
              current: experienceData.current === 1,
              description: experienceData.description || '',
              companyUrl: experienceData.companyUrl || '',
              companyLogo: experienceData.companyLogo || '',
              employmentType: experienceData.employmentType || 'full-time',
              remote: experienceData.remote === 1,
              skills: experienceData.skills || [],
              achievements: experienceData.achievements || []
            });
          }
        } catch (error) {
          console.error('Error fetching experience:', error);
          setErrorMessage('Failed to load experience data. Please try again.');
          setShowErrorMessage(true);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchExperience();
    } else {
      // For create mode, set loading to false immediately
      setIsLoading(false);
    }}, [editMode, id]);

  // Track initial form data to compare against for dirty checking
  const [initialFormData, setInitialFormData] = useState(null);

  // Set initial form data after loading is complete
  useEffect(() => {
    if (!isLoading && initialFormData === null) {
      setInitialFormData(JSON.stringify(formData));
    }
  }, [isLoading, formData, initialFormData]);

  // Mark form as dirty when changes are made (compare against initial data)
  useEffect(() => {
    if (initialFormData !== null && !isLoading) {
      const currentFormData = JSON.stringify(formData);
      setIsDirty(currentFormData !== initialFormData);
    }
  }, [formData, initialFormData, isLoading]);
    const validateForm = () => {
    const newErrors = {};
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position title is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.current && !formData.endDate) {
      newErrors.endDate = 'End date is required if not current position';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    
    if (formData.companyUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.companyUrl)) {
      newErrors.companyUrl = 'Website URL is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // If current is checked, clear end date
      if (name === 'current' && checked) {
        setFormData(prev => ({
          ...prev,
          endDate: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const addAchievement = () => {
    if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };
  
  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };
  
  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    setShowErrorMessage(false);
    
    try {
      // Prepare data for API
      const experienceData = {
        ...formData,
        current: formData.current ? 1 : 0,
        endDate: formData.current ? null : formData.endDate
      };
      
      let response;
      if (editMode && id) {
        response = await apiService.experience.update(id, experienceData);
      } else {
        response = await apiService.experience.create(experienceData);
      }
      
      // Show success message
      setShowSuccessMessage(true);
      setIsDirty(false);
      
      // Hide success message and navigate after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/experience');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving experience:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save experience. Please try again.');
      setShowErrorMessage(true);
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    } finally {
      setIsSaving(false);
    }  };
    // Render loading state
  if (isLoading) {
    return (
      <div className="experience-loading">
        <div className="spinner"></div>
        <h3>Loading...</h3>
      </div>
    );
  }

  // Render form view (add/edit)
  return (
    <div className="experience-form-container">
      {/* Header */}
      <div className="experience-form-header">
        <div className="header-left">
          <Link to="/experience" className="back-link">
            <FaArrowLeft /> Back to Experience
          </Link>
          <h1>{editMode ? (readOnly ? 'View Experience' : 'Edit Experience') : 'Add Experience'}</h1>
          <p className="header-description">
            {editMode 
              ? (readOnly ? 'View your professional experience details' : 'Update your professional experience details') 
              : 'Add details about your professional work experience'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <form className="experience-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
            <div className="form-group">
            <label htmlFor="position">Position Title <span className="required">*</span></label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              disabled={readOnly}
              className={errors.position ? 'error' : ''}
              aria-invalid={errors.position ? 'true' : 'false'}
              aria-describedby={errors.position ? 'position-error' : undefined}
            />
            {errors.position && (
              <div id="position-error" className="error-message">
                <FaExclamationCircle /> {errors.position}
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company <span className="required">*</span></label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. TechInnovate Solutions"
                disabled={readOnly}
                className={errors.company ? 'error' : ''}
                aria-invalid={errors.company ? 'true' : 'false'}
                aria-describedby={errors.company ? 'company-error' : undefined}
              />
              {errors.company && (
                <div id="company-error" className="error-message">
                  <FaExclamationCircle /> {errors.company}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Nairobi, Kenya"
                disabled={readOnly}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remote"
                  checked={formData.remote}
                  onChange={handleChange}
                  disabled={readOnly}
                />
                <span className="checkbox-text">Remote Position</span>
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date <span className="required">*</span></label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={readOnly}
                className={errors.startDate ? 'error' : ''}
                aria-invalid={errors.startDate ? 'true' : 'false'}
                aria-describedby={errors.startDate ? 'startDate-error' : undefined}
              />
              {errors.startDate && (
                <div id="startDate-error" className="error-message">
                  <FaExclamationCircle /> {errors.startDate}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={readOnly || formData.current}
                className={errors.endDate ? 'error' : ''}
                aria-invalid={errors.endDate ? 'true' : 'false'}
                aria-describedby={errors.endDate ? 'endDate-error' : undefined}
              />
              {errors.endDate && (
                <div id="endDate-error" className="error-message">
                  <FaExclamationCircle /> {errors.endDate}
                </div>
              )}
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="current"
                  checked={formData.current}
                  onChange={handleChange}
                  disabled={readOnly}
                />
                <span className="checkbox-text">I currently work here</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2 className="section-title">Description & Achievements</h2>
          
          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your responsibilities and role..."
              disabled={readOnly}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="achievementInput">Key Achievements</label>
            {!readOnly && (
              <div className="input-with-button">
                <input
                  type="text"
                  id="achievementInput"
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  placeholder="Add an achievement or responsibility"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAchievement();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={addAchievement}
                >
                  Add
                </button>
              </div>
            )}
            
            <div className="achievements-container">
              {formData.achievements.length === 0 ? (
                <div className="empty-list-message">
                  <FaInfoCircle />
                  <span>No achievements added yet. {!readOnly && 'Add key accomplishments to highlight your impact.'}</span>
                </div>
              ) : (
                <ul className="achievements-list">
                  {formData.achievements.map((achievement, index) => (
                    <li key={index} className="achievement-item">
                      <span>{achievement}</span>
                      {!readOnly && (
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeAchievement(index)}
                          aria-label="Remove achievement"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
          <div className="form-section">
          <h2 className="section-title">Skills & Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="skillInput">Skills & Technologies Used</label>
            {!readOnly && (
              <div className="input-with-button">                  <input
                    type="text"
                    id="skillInput"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a technology or skill"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={addSkill}
                >
                  Add
                </button>
              </div>
            )}
            
            <div className="technologies-container">
              {formData.skills.length === 0 ? (
                <div className="empty-list-message">
                  <FaInfoCircle />
                  <span>No skills added yet. {!readOnly && 'Add technologies and skills used in this role.'}</span>
                </div>
              ) : (
                <div className="technologies-list">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="technology-tag">
                      <span>{skill}</span>
                      {!readOnly && (
                        <button 
                          type="button" 
                          className="tag-remove"
                          onClick={() => removeSkill(skill)}
                          aria-label="Remove skill"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">            <label htmlFor="companyUrl">Company Website</label>
            <input
              type="url"
              id="companyUrl"
              name="companyUrl"
              value={formData.companyUrl}
              onChange={handleChange}
              placeholder="e.g. https://company.com"
              disabled={readOnly}
              className={errors.companyUrl ? 'error' : ''}
              aria-invalid={errors.companyUrl ? 'true' : 'false'}
              aria-describedby={errors.companyUrl ? 'companyUrl-error' : undefined}
            />
            {errors.companyUrl && (
              <div id="companyUrl-error" className="error-message">
                <FaExclamationCircle /> {errors.companyUrl}
              </div>
            )}
          </div>
        </div>
        
        {!readOnly && (
          <div className="form-actions">
            <Link to="/experience" className="btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>{editMode ? 'Update Experience' : 'Save Experience'}</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {readOnly && (
          <div className="form-actions">
            <Link to="/experience" className="btn-secondary">
              Back
            </Link>
            <Link to={`/experience/${id}/edit`} className="btn-primary">
              <FaEdit />
              <span>Edit Experience</span>
            </Link>
          </div>
        )}
      </form>
      
      {/* Unsaved Changes Warning */}
      {isDirty && !isSaving && !readOnly && (
        <div className="unsaved-changes-warning">
          <FaInfoCircle />
          <span>You have unsaved changes. Make sure to save before leaving this page.</span>
        </div>
      )}
      
      {/* Success/Error Messages */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            className="message success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheckCircle />
            <span>{editMode ? 'Experience successfully updated' : 'Experience successfully added'}</span>
          </motion.div>
        )}
        
        {showErrorMessage && (
          <motion.div 
            className="message error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationCircle />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS Styles */}
      <style jsx>{`
        /* Experience Form Container */
        .experience-form-container {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        
        /* Experience Form Header */
        .experience-form-header {
          margin-bottom: var(--spacing-xl);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header-left {
          max-width: 600px;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-sm);
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .experience-form-header h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
        }
        
        .header-description {
          color: var(--gray-600);
          font-size: var(--text-base);
        }
        
        /* Form Sections */
        .form-section {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
          border: 1px solid var(--gray-200);
        }
        
        .section-title {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--gray-200);
        }
        
        /* Form Groups */
        .form-group {
          margin-bottom: var(--spacing-lg);
        }
        
        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: var(--spacing-xs);
        }
        
        .form-group input[type="text"],
        .form-group input[type="url"],
        .form-group input[type="date"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          color: var(--gray-800);
          background-color: var(--white);
          transition: var(--transition-fast);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background-color: var(--gray-100);
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: var(--danger-color);
        }
        
        .form-group .error-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--danger-color);
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
        }
        
        .required {
          color: var(--danger-color);
        }
        
        /* Form Rows */
        .form-row {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }
        
        .form-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }
        
        /* Checkbox Group */
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: var(--spacing-md);
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .checkbox-text {
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        /* Input with Button */
        .input-with-button {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }
        
        .input-with-button input {
          flex: 1;
        }
        
        .btn-add {
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-add:hover {
          background-color: var(--primary-dark);
        }
        
        /* Achievements List */
        .achievements-container {
          margin-top: var(--spacing-sm);
        }
        
        .achievements-list {
          list-style-type: none;
          padding: 0;
        }
        
        .achievement-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--gray-800);
          border-left: 3px solid var(--primary-color);
        }
        
        .btn-remove {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          font-size: var(--text-sm);
          padding: var(--spacing-xs);
          transition: var(--transition-fast);
        }
        
        .btn-remove:hover {
          color: var(--danger-color);
        }
        
        /* Technologies List */
        .technologies-container {
          margin-top: var(--spacing-sm);
        }
        
        .technologies-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }
        
        .technology-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        
        .tag-remove {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: var(--text-base);
          line-height: 1;
          padding: 0;
          transition: var(--transition-fast);
        }
        
        .tag-remove:hover {
          color: var(--danger-color);
        }
        
        /* Empty List Message */
        .empty-list-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--gradient-primary);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-secondary:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        /* Unsaved Changes Warning */
        .unsaved-changes-warning {
          position: fixed;
          bottom: var(--spacing-lg);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--warning-color);
          color: var(--white);
          border-radius: var(--border-radius-full);
          font-size: var(--text-sm);
          box-shadow: var(--shadow-lg);
          z-index: 10;
        }
        
        /* Messages */
        .message {
          position: fixed;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }
        
        .success-message {
          background-color: var(--success-color);
          color: var(--white);
        }
        
        .error-message {
          background-color: var(--danger-color);
          color: var(--white);
        }
        
        /* Spinner */
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Experience List View */
        .experience-list-container {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        
        .experience-list-header {
          margin-bottom: var(--spacing-xl);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .experience-list-header h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
        }
        
        /* Experience Controls */
        .experience-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          gap: var(--spacing-md);
        }
        
        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        
        .search-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          pointer-events: none;
        }
        
        .search-container input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-md) * 2 + 1em);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius-full);
          font-size: var(--text-sm);
          transition: var(--transition);
        }
        
        .search-container input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .clear-search {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          font-size: var(--text-xl);
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        
        .clear-search:hover {
          color: var(--gray-700);
        }
        
        .filter-container {
          position: relative;
        }
        
        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--white);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          color: var(--gray-700);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
        
        .filter-toggle-btn:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .chevron {
          transition: transform 0.2s ease;
        }
        
        .chevron.open {
          transform: rotate(180deg);
        }
        
        .filter-panel {
          position: absolute;
          top: calc(100% + var(--spacing-sm));
          right: 0;
          width: 300px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          border: 1px solid var(--gray-200);
          padding: var(--spacing-md);
        }
        
        .filter-group {
          margin-bottom: var(--spacing-md);
        }
        
        .filter-group:last-child {
          margin-bottom: 0;
        }
        
        .filter-group label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }
        
        .filter-options button {
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          color: var(--gray-700);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .filter-options button:hover {
          background-color: var(--gray-200);
        }
        
        .filter-options button.active {
          background-color: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }
        
        .sort-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }
        
        .sort-options button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          color: var(--gray-700);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .sort-options button:hover {
          background-color: var(--gray-200);
        }
        
        .sort-options button.active {
          background-color: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }
        
        .sort-icon {
          font-size: 0.8em;
        }
        
        .sort-icon.asc {
          transform: rotate(180deg);
        }
        
        .filter-actions {
          margin-top: var(--spacing-md);
          display: flex;
          justify-content: flex-end;
        }
        
        /* Empty Experience */
        .empty-experience {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-2xl);
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          text-align: center;
        }
        
        .empty-icon {
          font-size: var(--text-4xl);
          color: var(--gray-400);
          margin-bottom: var(--spacing-md);
        }
        
        .empty-experience h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-sm);
        }
        
        .empty-experience p {
          color: var(--gray-600);
          margin-bottom: var(--spacing-lg);
          max-width: 400px;
        }
        
        /* Experience Timeline */
        .experience-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        
        .experience-card {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          overflow: hidden;
          border: 1px solid var(--gray-200);
          position: relative;
        }
        
        .experience-card-content {
          padding: var(--spacing-lg);
        }
        
        .experience-header {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .company-logo {
          width: 60px;
          height: 60px;
          border-radius: var(--border-radius);
          background-color: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid var(--gray-200);
          flex-shrink: 0;
        }
        
        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .company-logo svg {
          font-size: var(--text-2xl);
          color: var(--gray-500);
        }
        
        .experience-info {
          flex: 1;
        }
        
        .experience-info h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .company-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
        }
        
        .company-name {
          font-size: var(--text-base);
          color: var(--gray-700);
          font-weight: 500;
        }
        
        .employment-type-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        
        .badge-primary {
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
        }
        
        .badge-secondary {
          background-color: rgba(107, 114, 128, 0.1);
          color: var(--gray-700);
        }
        
        .badge-info {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--info-color);
        }
        
        .badge-warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
        
        .badge-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }
        
        .badge-dark {
          background-color: rgba(31, 41, 55, 0.1);
          color: var(--gray-800);
        }
        
        .remote-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        
        .experience-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .date-range, .location {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .duration {
          color: var(--gray-500);
          font-size: var(--text-xs);
        }
        
        .experience-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-icon:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .btn-icon.delete:hover {
          background-color: var(--danger-color);
          border-color: var(--danger-color);
          color: var(--white);
        }
        
        .experience-summary {
          margin-bottom: var(--spacing-md);
        }
        
        .experience-summary p {
          color: var(--gray-700);
          font-size: var(--text-sm);
          line-height: 1.6;
        }
        
        .expand-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          padding: var(--spacing-xs) 0;
          margin-top: var(--spacing-xs);
        }
        
        .expand-icon {
          font-size: 0.8em;
        }
        
        .experience-details {
          border-top: 1px solid var(--gray-200);
          padding-top: var(--spacing-md);
          overflow: hidden;
        }
        
        .achievements-section, .technologies-section {
          margin-bottom: var(--spacing-md);
        }
        
        .achievements-section h4, .technologies-section h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-sm);
        }
        
        .achievements-section ul {
          list-style-type: disc;
          padding-left: var(--spacing-lg);
        }
        
        .achievements-section li {
          color: var(--gray-700);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-xs);
          line-height: 1.5;
        }
        
        .company-website {
          margin-top: var(--spacing-md);
        }
        
        .website-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .website-link:hover {
          text-decoration: underline;
        }
        
        /* Delete Confirmation */        /* Loading */
        .experience-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s linear infinite;
          margin-bottom: var(--spacing-md);
        }        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          :root {
            /* Dark mode dropdown specific variables */
            --dropdown-bg-dark: #1f2937;
            --dropdown-border-dark: #374151;
            --dropdown-text-dark: #f9fafb;
            --dropdown-option-hover-dark: #374151;
            --dropdown-option-selected-dark: #4f46e5;
            --dropdown-focus-ring-dark: rgba(79, 70, 229, 0.4);
          }
          
          /* Employment Type Dropdown Dark Mode */
          .form-group select#employmentType {
            background-color: var(--dropdown-bg-dark) !important;
            border-color: var(--dropdown-border-dark) !important;
            color: var(--dropdown-text-dark) !important;
          }
          
          .form-group select#employmentType:focus {
            border-color: var(--dropdown-option-selected-dark) !important;
            box-shadow: 0 0 0 3px var(--dropdown-focus-ring-dark) !important;
          }
          
          .form-group select#employmentType:hover {
            border-color: #6b7280 !important;
          }
          
          .form-group select#employmentType option {
            background-color: var(--dropdown-bg-dark) !important;
            color: var(--dropdown-text-dark) !important;
          }
          
          .form-group select#employmentType option:hover {
            background-color: var(--dropdown-option-hover-dark) !important;
          }
          
          .form-group select#employmentType option:checked {
            background-color: var(--dropdown-option-selected-dark) !important;
          }
          
          /* Date Input Dark Mode */
          .form-group input[type="date"]#startDate,
          .form-group input[type="date"]#endDate {
            background-color: var(--dropdown-bg-dark) !important;
            border-color: var(--dropdown-border-dark) !important;
            color: var(--dropdown-text-dark) !important;
            color-scheme: dark;
          }
          
          .form-group input[type="date"]#startDate:focus,
          .form-group input[type="date"]#endDate:focus {
            border-color: var(--dropdown-option-selected-dark) !important;
            box-shadow: 0 0 0 3px var(--dropdown-focus-ring-dark) !important;
          }
          
          .form-group input[type="date"]#startDate:hover,
          .form-group input[type="date"]#endDate:hover {
            border-color: #6b7280 !important;
          }
          
          /* Date picker calendar icon styling */
          .form-group input[type="date"]#startDate::-webkit-calendar-picker-indicator,
          .form-group input[type="date"]#endDate::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
          
          /* Form labels in dark mode */
          .form-group label[for="employmentType"],
          .form-group label[for="startDate"],
          .form-group label[for="endDate"] {
            color: var(--dropdown-text-dark) !important;
          }
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .experience-form-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .form-row {
            flex-direction: column;
            gap: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default ExperienceForm;