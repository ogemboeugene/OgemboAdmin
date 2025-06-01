import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUniversity, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaLink, 
  FaPlus, 
  FaTimes, 
  FaTrash, 
  FaSave, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaArrowLeft,
  FaInfoCircle,
  FaAward,
  FaBook,
  FaCertificate,
  FaFileAlt
} from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import { truncateText } from '../../utils/formatters';

const EducationForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
    courses: [],
    gpa: '',
    maxGpa: '4.0',
    certificateUrl: '',
    institutionLogo: '',
    institutionWebsite: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(editMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [achievementInput, setAchievementInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch education data if in edit mode
  useEffect(() => {
    if (editMode && id) {
      setIsLoading(true);
      
      // Simulate API call to fetch education data
      setTimeout(() => {
        // Sample data for edit mode
        const educationData = {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          institution: 'University of Nairobi',
          location: 'Nairobi, Kenya',
          startDate: '2016-09-01',
          endDate: '2020-05-30',
          current: false,
          description: 'Studied computer science with a focus on software engineering and artificial intelligence. Participated in various coding competitions and hackathons.',
          achievements: [
            'Graduated with First Class Honors',
            'Dean\'s List for 6 consecutive semesters',
            'Best Final Year Project Award'
          ],
          courses: [
            'Data Structures and Algorithms',
            'Database Management Systems',
            'Artificial Intelligence',
            'Software Engineering',
            'Computer Networks'
          ],
          gpa: '3.8',
          maxGpa: '4.0',
          certificateUrl: '/assets/certificate.pdf',
          institutionLogo: '/assets/university-logo.png',
          institutionWebsite: 'https://uonbi.ac.ke'
        };
        
        setFormData(educationData);
        setIsLoading(false);
      }, 1000);
    }
  }, [editMode, id]);
  
  // Mark form as dirty when changes are made
  useEffect(() => {
    if (!isLoading) {
      setIsDirty(true);
    }
  }, [formData, isLoading]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }
    
    if (!formData.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.current && !formData.endDate) {
      newErrors.endDate = 'End date is required if not currently studying';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    
    if (formData.gpa && isNaN(parseFloat(formData.gpa))) {
      newErrors.gpa = 'GPA must be a valid number';
    }
    
    if (formData.maxGpa && isNaN(parseFloat(formData.maxGpa))) {
      newErrors.maxGpa = 'Max GPA must be a valid number';
    }
    
    if (formData.gpa && formData.maxGpa && parseFloat(formData.gpa) > parseFloat(formData.maxGpa)) {
      newErrors.gpa = 'GPA cannot be greater than Max GPA';
    }
    
    if (formData.institutionWebsite && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.institutionWebsite)) {
      newErrors.institutionWebsite = 'Website URL is invalid';
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
  };
  
  const addCourse = () => {
    if (courseInput.trim() && !formData.courses.includes(courseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        courses: [...prev.courses, courseInput.trim()]
      }));
      setCourseInput('');
    }
  };
  
  const removeCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccessMessage(true);
      setIsDirty(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        
        // Navigate back to profile page
        navigate('/profile');
      }, 3000);
    } catch (error) {
      console.error('Error saving education:', error);
      setShowErrorMessage(true);
      setErrorMessage('Failed to save education. Please try again.');
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading education data...</p>
      </div>
    );
  }
  
  return (
    <div className="education-form-container">
      <div className="education-form-header">
        <div className="header-left">
          <Link to="/profile" className="back-link">
            <FaArrowLeft /> Back to Profile
          </Link>
          <h1>{editMode ? 'Edit Education' : 'Add New Education'}</h1>
        </div>
      </div>
      
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaCheckCircle />
            <p>Education {editMode ? 'updated' : 'added'} successfully!</p>
            <button onClick={() => setShowSuccessMessage(false)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showErrorMessage && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaExclamationCircle />
            <p>{errorMessage}</p>
            <button onClick={() => setShowErrorMessage(false)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="education-form">
        <div className="form-section">
          <h3 className="section-title">Education Details</h3>
          <p className="section-description">
            Provide information about your degree and institution
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="degree">
                Degree / Certificate <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FaGraduationCap className="input-icon" />
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className={errors.degree ? 'error' : ''}
                  placeholder="e.g. Bachelor of Science, Master's Degree"
                  required
                />
              </div>
              {errors.degree && <div className="error-message">{errors.degree}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fieldOfStudy">
                Field of Study <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FaBook className="input-icon" />
                <input
                  type="text"
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  className={errors.fieldOfStudy ? 'error' : ''}
                  placeholder="e.g. Computer Science, Business Administration"
                  required
                />
              </div>
              {errors.fieldOfStudy && <div className="error-message">{errors.fieldOfStudy}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="institution">
                Institution <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FaUniversity className="input-icon" />
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className={errors.institution ? 'error' : ''}
                  placeholder="e.g. University of Nairobi, Harvard University"
                  required
                />
              </div>
              {errors.institution && <div className="error-message">{errors.institution}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-with-icon">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi, Kenya"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'error' : ''}
                  required
                />
              </div>
              {errors.startDate && <div className="error-message">{errors.startDate}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">
                End Date {!formData.current && <span className="required">*</span>}
              </label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                  disabled={formData.current}
                  required={!formData.current}
                />
              </div>
              {errors.endDate && <div className="error-message">{errors.endDate}</div>}
            </div>
          </div>
          
                    <div className="form-group toggle-group">
            <label className="toggle-label">
              <span>I am currently studying here</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  name="current"
                  checked={formData.current}
                  onChange={handleChange}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gpa">GPA / Grade</label>
              <input
                type="text"
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className={errors.gpa ? 'error' : ''}
                placeholder="e.g. 3.8"
              />
              {errors.gpa && <div className="error-message">{errors.gpa}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="maxGpa">Max GPA / Grade Scale</label>
              <input
                type="text"
                id="maxGpa"
                name="maxGpa"
                value={formData.maxGpa}
                onChange={handleChange}
                className={errors.maxGpa ? 'error' : ''}
                placeholder="e.g. 4.0"
              />
              {errors.maxGpa && <div className="error-message">{errors.maxGpa}</div>}
              <p className="input-help">The maximum possible GPA or grade in your institution's scale</p>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Institution Information</h3>
          <p className="section-description">
            Additional details about the educational institution
          </p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="institutionWebsite">Institution Website</label>
              <div className="input-with-icon">
                <FaLink className="input-icon" />
                <input
                  type="url"
                  id="institutionWebsite"
                  name="institutionWebsite"
                  value={formData.institutionWebsite}
                  onChange={handleChange}
                  className={errors.institutionWebsite ? 'error' : ''}
                  placeholder="e.g. https://university.edu"
                />
              </div>
              {errors.institutionWebsite && <div className="error-message">{errors.institutionWebsite}</div>}
              <p className="input-help">Include the full URL with http:// or https://</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="institutionLogo">Institution Logo</label>
              <div className="file-upload-container">
                <div className="file-upload-info">
                  <FaUniversity className="file-icon" />
                  <span className="file-name">
                    {formData.institutionLogo ? truncateText(formData.institutionLogo.split('/').pop(), 20) : 'No logo uploaded'}
                  </span>
                  {formData.institutionLogo && (
                    <a href={formData.institutionLogo} target="_blank" rel="noopener noreferrer" className="view-file-link">
                      View
                    </a>
                  )}
                </div>
                <label htmlFor="logo-upload" className="upload-btn">
                  <FaPlus /> Upload Logo
                </label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // In a real app, you would upload this to a server
                      // For now, we'll just use a fake URL
                      setFormData({
                        ...formData,
                        institutionLogo: URL.createObjectURL(file)
                      });
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
              <p className="input-help">Recommended size: 200x200px, max 2MB</p>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="certificateUrl">Certificate / Diploma URL</label>
            <div className="input-with-icon">
              <FaCertificate className="input-icon" />
              <input
                type="url"
                id="certificateUrl"
                name="certificateUrl"
                value={formData.certificateUrl}
                onChange={handleChange}
                placeholder="e.g. https://example.com/certificate.pdf"
              />
            </div>
            <p className="input-help">Link to your diploma or certificate if available online</p>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Education Description</h3>
          <p className="section-description">
            Describe your educational experience and what you learned
          </p>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe your educational experience, focus areas, thesis, etc..."
            ></textarea>
            <p className="input-help">
              <FaInfoCircle /> Highlight your academic focus, research, and key learning outcomes.
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="achievementInput">Academic Achievements</label>
            <div className="input-with-button">
              <input
                type="text"
                id="achievementInput"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="e.g. Dean's List, Graduated with Honors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
              />
              <button type="button" onClick={addAchievement}>Add</button>
            </div>
            <p className="input-help">Press Enter or click Add to add an achievement</p>
            
            <div className="achievements-list">
              {formData.achievements.length === 0 ? (
                <div className="empty-state">
                  No achievements added yet. Highlight your academic accomplishments, awards, and honors.
                </div>
              ) : (
                <ul className="bullet-list">
                  {formData.achievements.map((achievement, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bullet-item"
                    >
                      <span>{achievement}</span>
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={() => removeAchievement(index)}
                        aria-label="Remove achievement"
                      >
                        <FaTimes />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="courseInput">Relevant Courses</label>
            <div className="input-with-button">
              <input
                type="text"
                id="courseInput"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                placeholder="e.g. Data Structures and Algorithms"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCourse();
                  }
                }}
              />
              <button type="button" onClick={addCourse}>Add</button>
            </div>
            <p className="input-help">Press Enter or click Add to add a course</p>
            
            <div className="courses-list">
              {formData.courses.length === 0 ? (
                <div className="empty-state">
                  No courses added yet. Add relevant courses that showcase your knowledge and skills.
                </div>
              ) : (
                <ul className="bullet-list">
                  {formData.courses.map((course, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bullet-item"
                    >
                      <span>{course}</span>
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={() => removeCourse(index)}
                        aria-label="Remove course"
                      >
                        <FaTimes />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => {
              if (isDirty) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  navigate('/profile');
                }
              } else {
                navigate('/profile');
              }
            }}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="save-btn" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="button-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> {editMode ? 'Update Education' : 'Save Education'}
              </>
            )}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        :root {
          /* Primary Colors */
          --primary-color: #4f46e5;
          --primary-light: #818cf8;
          --primary-dark: #3730a3;
          
          /* Secondary Colors */
          --secondary-color: #10b981;
          --secondary-light: #34d399;
          --secondary-dark: #059669;
          
          /* Accent Colors */
          --accent-color: #f59e0b;
          --accent-light: #fbbf24;
          --accent-dark: #d97706;
          
          /* Neutral Colors */
          --white: #ffffff;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --black: #000000;
          
          /* Status Colors */
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --danger-color: #ef4444;
          --info-color: #3b82f6;
          
          /* UI Elements */
          --border-radius-sm: 0.25rem;
          --border-radius: 0.375rem;
          --border-radius-md: 0.5rem;
          --border-radius-lg: 0.75rem;
          --border-radius-xl: 1rem;
          --border-radius-full: 9999px;
          
          /* Shadows */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
          
          /* Transitions */
          --transition: all 0.3s ease;
          --transition-fast: all 0.15s ease;
          --transition-slow: all 0.5s ease;
        }
        
        /* Dark Mode Variables */
        .dark-mode {
          --white: #111827;
          --gray-50: #1f2937;
          --gray-100: #374151;
          --gray-200: #4b5563;
          --gray-300: #6b7280;
          --gray-400: #9ca3af;
          --gray-500: #d1d5db;
          --gray-600: #e5e7eb;
          --gray-700: #f3f4f6;
          --gray-800: #f9fafb;
          --gray-900: #ffffff;
          --black: #ffffff;
          
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }
        
        /* Global Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        /* Loading Screen */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--white);
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--gray-200);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Education Form Container */
        .education-form-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--white);
          color: var(--gray-800);
        }
        
        /* Header */
        .education-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .education-form-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--gray-900);
        }
        
        /* Error and Success Banners */
        .error-banner,
        .success-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .error-banner {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid var(--danger-color);
          color: var(--danger-color);
        }
        
        .success-banner {
          background-color: rgba(16, 185, 129, 0.1);
          border-left: 4px solid var(--success-color);
          color: var(--success-color);
        }
        
        .error-banner svg,
        .success-banner svg {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .error-banner p,
        .success-banner p {
          flex: 1;
          margin: 0;
        }
        
        .error-banner button,
        .success-banner button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .error-banner button:hover,
        .success-banner button:hover {
          opacity: 1;
        }
        
        /* Form */
        .education-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        /* Form Sections */
        .form-section {
          background-color: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        
        .section-description {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 1.5rem;
        }
        
        /* Form Groups and Rows */
        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          flex: 1;
          margin-bottom: 1.5rem;
        }
        
        .form-group:last-child {
          margin-bottom: 0;
        }
        
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }
        
        .required {
          color: var(--danger-color);
        }
        
        input[type="text"],
        input[type="url"],
        input[type="date"],
        select,
        textarea {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: var(--gray-800);
          background-color: var(--white);
          transition: var(--transition-fast);
        }
        
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        input::placeholder,
        textarea::placeholder {
          color: var(--gray-400);
        }
        
        input.error,
        select.error,
        textarea.error {
          border-color: var(--danger-color);
        }
        
        input.error:focus,
        select.error:focus,
        textarea.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
        
        .error-message {
          color: var(--danger-color);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .input-help {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
        
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        .input-with-icon input,
        .input-with-icon select {
          padding-left: 2.25rem;
        }
        
        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-button input {
          flex: 1;
        }
        
        .input-with-button button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.625rem 1rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .input-with-button button:hover {
          background-color: var(--primary-dark);
        }
        
        /* Toggle Switch */
        .toggle-group {
          min-width: 200px;
        }
        
        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-bottom: 0.25rem;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--gray-300);
          border-radius: 34px;
          transition: var(--transition-fast);
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: var(--white);
          border-radius: 50%;
          transition: var(--transition-fast);
        }
        
        input:checked + .toggle-slider {
          background-color: var(--primary-color);
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        
        /* File Upload */
        .file-upload-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border: 1px dashed var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--gray-50);
        }
        
        .file-upload-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        
        .file-icon {
          font-size: 1.25rem;
          color: var(--gray-500);
        }
        
        .file-name {
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .view-file-link {
          font-size: 0.75rem;
          color: var(--primary-color);
          margin-left: 0.5rem;
        }
        
        .view-file-link:hover {
          text-decoration: underline;
        }
        
        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .upload-btn:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        /* Achievements and Courses Lists */
        .achievements-list,
        .courses-list {
          margin-top: 1rem;
        }
        
        .bullet-list {
          list-style: none;
        }
        
        .bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .bullet-item:last-child {
          border-bottom: none;
        }
        
        .bullet-item span {
          flex: 1;
          position: relative;
          padding-left: 1.25rem;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .bullet-item span::before {
          content: "•";
          position: absolute;
          left: 0.25rem;
          color: var(--primary-color);
          font-size: 1.25rem;
          line-height: 1;
        }
        
        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: var(--border-radius-full);
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
          flex-shrink: 0;
        }
        
        .remove-btn:hover {
          background-color: rgba(239, 68, 68, 0.2);
        }
        
        .empty-state {
          padding: 1.5rem;
          text-align: center;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }
        
        .cancel-btn {
          padding: 0.625rem 1.25rem;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .cancel-btn:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .save-btn:hover:not(:disabled) {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.25rem;
        }

                /* Dark Mode Styles */
        .dark-mode .education-form-container {
          background-color: var(--gray-900);
        }
        
        .dark-mode .education-form-header h1 {
          color: var(--gray-100);
        }
        
        .dark-mode .back-link {
          color: var(--gray-400);
        }
        
        .dark-mode .back-link:hover {
          color: var(--primary-light);
        }
        
        .dark-mode .form-section {
          background-color: var(--gray-800);
          border-color: var(--gray-700);
        }
        
        .dark-mode .section-title {
          color: var(--gray-100);
        }
        
        .dark-mode .section-description {
          color: var(--gray-400);
        }
        
        .dark-mode label {
          color: var(--gray-300);
        }
        
        .dark-mode input[type="text"],
        .dark-mode input[type="url"],
        .dark-mode input[type="date"],
        .dark-mode select,
        .dark-mode textarea {
          background-color: var(--gray-700);
          border-color: var(--gray-600);
          color: var(--gray-200);
        }
        
        .dark-mode input:focus,
        .dark-mode select:focus,
        .dark-mode textarea:focus {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }
        
        .dark-mode .input-icon {
          color: var(--gray-400);
        }
        
        .dark-mode .input-help {
          color: var(--gray-400);
        }
        
        .dark-mode .toggle-slider {
          background-color: var(--gray-600);
        }
        
        .dark-mode .toggle-slider:before {
          background-color: var(--gray-300);
        }
        
        .dark-mode input:checked + .toggle-slider {
          background-color: var(--primary-light);
        }
        
        .dark-mode .file-upload-container {
          background-color: var(--gray-700);
          border-color: var(--gray-600);
        }
        
        .dark-mode .file-icon {
          color: var(--gray-400);
        }
        
        .dark-mode .file-name {
          color: var(--gray-300);
        }
        
        .dark-mode .upload-btn {
          background-color: var(--gray-800);
          color: var(--gray-300);
          border-color: var(--gray-600);
        }
        
        .dark-mode .upload-btn:hover {
          background-color: var(--gray-700);
          border-color: var(--gray-500);
        }
        
        .dark-mode .bullet-item {
          border-color: var(--gray-700);
        }
        
        .dark-mode .bullet-item span {
          color: var(--gray-300);
        }
        
        .dark-mode .empty-state {
          background-color: var(--gray-700);
          color: var(--gray-400);
        }
        
        .dark-mode .form-actions {
          border-color: var(--gray-700);
        }
        
        .dark-mode .cancel-btn {
          background-color: var(--gray-800);
          color: var(--gray-300);
          border-color: var(--gray-600);
        }
        
        .dark-mode .cancel-btn:hover {
          background-color: var(--gray-700);
          border-color: var(--gray-500);
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .education-form-container {
            padding: 1rem;
          }
          
          .education-form-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .form-actions {
            flex-direction: column-reverse;
            gap: 0.5rem;
          }
          
          .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EducationForm;
