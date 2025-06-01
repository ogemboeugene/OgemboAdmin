import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTimes, 
  FaSave, 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaCode,
  FaSearch,
  FaFilter,
  FaStar,
  FaInfoCircle,
  FaGlobe,
  FaTools,
  FaDatabase
} from 'react-icons/fa';
import apiService from '../../services/api/apiService';

const SkillsForm = () => {
  const navigate = useNavigate();  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    skills: [],
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    platforms: []
  });
  
  // Input states
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [databaseInput, setDatabaseInput] = useState('');
  const [platformInput, setPlatformInput] = useState('');
  
  // Skill level options
  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];
  
  // Skill categories
  const categories = [
    { id: 'all', label: 'All Skills', icon: <FaCode /> },
    { id: 'skills', label: 'General Skills', icon: <FaStar /> },
    { id: 'languages', label: 'Languages', icon: <FaCode /> },
    { id: 'frameworks', label: 'Frameworks', icon: <FaTools /> },
    { id: 'databases', label: 'Databases', icon: <FaDatabase /> },
    { id: 'tools', label: 'Tools', icon: <FaTools /> },
    { id: 'platforms', label: 'Platforms', icon: <FaGlobe /> }
  ];
    // Fetch skills data
  useEffect(() => {
    const fetchSkillsData = async () => {
      setIsLoading(true);
      try {
        // Fetch skills data from API
        const response = await apiService.skills.getAll();
        const skillsData = response.data;
        
        // Transform API response to match our component structure
        const transformedData = {
          skills: skillsData.skills || [],
          languages: skillsData.languages || [],
          frameworks: skillsData.frameworks || [],
          tools: skillsData.tools || [],
          databases: skillsData.databases || [],
          platforms: skillsData.platforms || []
        };
        
        setFormData(transformedData);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        
        // If API fails, show error and use empty data
        setError('Failed to load skills data. Please try again.');
        
        // Initialize with empty data structure if API fails
        setFormData({
          skills: [],
          languages: [],
          frameworks: [],
          tools: [],
          databases: [],
          platforms: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkillsData();
  }, []);
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form data
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join('; ')}`);
        setIsSaving(false);
        return;
      }
      
      // Prepare data for API submission
      const skillsProfileData = {
        skills: formData.skills,
        languages: formData.languages,
        frameworks: formData.frameworks,
        tools: formData.tools,
        databases: formData.databases,
        platforms: formData.platforms,
        updatedAt: new Date().toISOString()
      };
      
      // Submit to API
      await apiService.skills.updateProfile(skillsProfileData);
      
      // Success
      setSuccess('Skills updated successfully!');
      setIsDirty(false);
      setLastSaved(new Date());
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving skills:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to save skills. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'You are not authorized to update skills. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to update skills.';
            break;
          case 422:
            errorMessage = 'Invalid skill data provided. Please check your entries.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Failed to save skills'}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
    // Add skill item with validation
  const addSkillItem = (category, input, setInput) => {
    if (!input.trim()) {
      setError('Please enter a skill name.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Validate skill name length
    if (input.trim().length < 2) {
      setError('Skill name must be at least 2 characters long.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (input.trim().length > 50) {
      setError('Skill name must be less than 50 characters.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Check if skill already exists in this category
    const exists = formData[category].some(
      item => item.name.toLowerCase() === input.trim().toLowerCase()
    );
    
    if (!exists) {
      const newSkill = {
        id: Date.now(), // Temporary ID for new skills
        name: input.trim(),
        level: 'intermediate', // Default level
        years: 1, // Default years
        isNew: true // Flag to identify new skills for API operations
      };
      
      setFormData(prev => ({
        ...prev,
        [category]: [...prev[category], newSkill]
      }));
      
      setInput('');
      setIsDirty(true);
      
      // Clear any existing errors
      setError(null);
    } else {
      // Show error for duplicate skill
      setError(`"${input.trim()}" already exists in ${category}. Please use a different name.`);
      
      // Auto-hide error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
    // Remove skill item with API integration
  const removeSkillItem = async (category, index) => {
    const skillToRemove = formData[category][index];
    
    try {
      // If it's an existing skill (has an ID and not marked as new), delete from API
      if (skillToRemove.id && !skillToRemove.isNew) {
        await apiService.skills.delete(skillToRemove.id);
      }
      
      // Remove from local state
      setFormData(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
      
      setIsDirty(true);
      
      // Show success message for API deletion
      if (skillToRemove.id && !skillToRemove.isNew) {
        setSuccess(`${skillToRemove.name} removed successfully!`);
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      setError(`Failed to remove ${skillToRemove.name}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Update skill level
  const updateSkillLevel = (category, index, level) => {
    const updatedItems = [...formData[category]];
    updatedItems[index] = {
      ...updatedItems[index],
      level
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: updatedItems
    }));
    
    setIsDirty(true);
  };
    // Update skill years with validation
  const updateSkillYears = (category, index, years) => {
    const yearValue = parseInt(years) || 0;
    
    // Validate years range
    if (yearValue < 0) {
      setError('Years of experience cannot be negative.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (yearValue > 50) {
      setError('Years of experience cannot exceed 50 years.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const updatedItems = [...formData[category]];
    updatedItems[index] = {
      ...updatedItems[index],
      years: yearValue
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: updatedItems
    }));
    
    setIsDirty(true);
    setError(null); // Clear any existing errors
  };
  
  // Get level badge color
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'var(--info-color)';
      case 'intermediate':
        return 'var(--warning-color)';
      case 'advanced':
        return 'var(--secondary-color)';
      case 'expert':
        return 'var(--primary-color)';
      default:
        return 'var(--gray-500)';
    }
  };
  
  // Filter skills based on search query and active category
  const getFilteredSkills = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query && activeCategory === 'all') {
      return formData;
    }
    
    const filtered = {};
    
    Object.keys(formData).forEach(category => {
      if (activeCategory === 'all' || activeCategory === category) {
        filtered[category] = formData[category].filter(
          item => item.name.toLowerCase().includes(query)
        );
      } else {
        filtered[category] = [];
      }
    });
    
    return filtered;
  };
  
  // Check if any category has items after filtering
  const hasFilteredItems = (filteredData) => {
    return Object.values(filteredData).some(category => category.length > 0);
  };
    // Get total skills count
  const getTotalSkillsCount = () => {
    return Object.values(formData).reduce(
      (total, category) => total + category.length, 0
    );
  };
  
  // Get average skill level across all skills
  const getAverageSkillLevel = () => {
    const allSkills = Object.values(formData).flat();
    if (allSkills.length === 0) return 'No skills';
    
    const levelValues = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const totalLevels = allSkills.reduce((sum, skill) => sum + (levelValues[skill.level] || 2), 0);
    const average = totalLevels / allSkills.length;
    
    if (average <= 1.5) return 'Beginner';
    if (average <= 2.5) return 'Intermediate';
    if (average <= 3.5) return 'Advanced';
    return 'Expert';
  };
  
  // Get total years of experience
  const getTotalExperience = () => {
    const allSkills = Object.values(formData).flat();
    return allSkills.reduce((total, skill) => Math.max(total, skill.years || 0), 0);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading skills data...</p>
      </div>
    );
  }
  
  // Get filtered skills
  const filteredSkills = getFilteredSkills();
  
  return (
    <div className="skills-form-container">
      <div className="skills-form-header">
        <div className="header-left">
            <Link to="/profile" className="back-link">
                <FaArrowLeft className="back-icon" /> Back to Profile
            </Link>
            <div className="title-section">
                <h1 className="page-title">Manage Skills</h1>
                <p className="header-description">
                Add and manage your technical skills, programming languages, and tools
                </p>
            </div>
        </div>
          <div className="header-stats">
            <div className="stat-item primary">
                <div className="stat-icon">
                <FaCode />
                </div>
                <div className="stat-info">
                <span className="stat-value">{getTotalSkillsCount()}</span>
                <span className="stat-label">Total Skills</span>
                </div>
            </div>
            <div className="stat-item secondary">
                <div className="stat-icon">
                <FaStar />
                </div>
                <div className="stat-info">
                <span className="stat-value">{getAverageSkillLevel()}</span>
                <span className="stat-label">Average Level</span>
                </div>
            </div>
            <div className="stat-item tertiary">
                <div className="stat-icon">
                <FaTools />
                </div>
                <div className="stat-info">
                <span className="stat-value">{getTotalExperience()}+</span>
                <span className="stat-label">Max Experience (Years)</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Error and Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              <FaTimes />
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheckCircle />
            <p>{success}</p>
            <button onClick={() => setSuccess(null)} aria-label="Dismiss success message">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit}>        <div className="skills-toolbar">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div className="toolbar-settings">
              <div className="auto-save-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  Auto-save
                </label>
                {lastSaved && (
                  <span className="last-saved">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="category-filter">
              <FaFilter className="filter-icon" />
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span>{category.label}</span>
                    {category.id !== 'all' && formData[category.id]?.length > 0 && (
                      <span className="category-count">{formData[category.id].length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="skills-sections">
          {/* General Skills Section */}
          {(activeCategory === 'all' || activeCategory === 'skills') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaStar className="section-icon" />
                  General Skills
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a new skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('skills', skillInput, setSkillInput);
                      }
                    }}
                                      />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('skills', skillInput, setSkillInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.skills.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No skills match your search criteria.' 
                        : 'No skills added yet. Add your first skill!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.skills.map((skill, index) => (
                      <motion.div 
                        key={`skill-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{skill.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('skills', index)}
                            aria-label={`Remove ${skill.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={skill.level}
                              onChange={(e) => updateSkillLevel('skills', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(skill.level) }}
                            >
                              {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={skill.years}
                              onChange={(e) => updateSkillYears('skills', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Programming Languages Section */}
          {(activeCategory === 'all' || activeCategory === 'languages') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaCode className="section-icon" />
                  Programming Languages
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Add a programming language..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('languages', languageInput, setLanguageInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('languages', languageInput, setLanguageInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.languages.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No programming languages match your search criteria.' 
                        : 'No programming languages added yet. Add your first language!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.languages.map((language, index) => (
                      <motion.div 
                        key={`language-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{language.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('languages', index)}
                            aria-label={`Remove ${language.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={language.level}
                              onChange={(e) => updateSkillLevel('languages', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(language.level) }}
                            >
                              {language.level.charAt(0).toUpperCase() + language.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={language.years}
                              onChange={(e) => updateSkillYears('languages', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Frameworks Section */}
          {(activeCategory === 'all' || activeCategory === 'frameworks') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaTools className="section-icon" />
                  Frameworks & Libraries
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={frameworkInput}
                    onChange={(e) => setFrameworkInput(e.target.value)}
                    placeholder="Add a framework or library..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('frameworks', frameworkInput, setFrameworkInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('frameworks', frameworkInput, setFrameworkInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.frameworks.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No frameworks match your search criteria.' 
                        : 'No frameworks added yet. Add your first framework!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.frameworks.map((framework, index) => (
                      <motion.div 
                        key={`framework-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{framework.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('frameworks', index)}
                            aria-label={`Remove ${framework.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={framework.level}
                              onChange={(e) => updateSkillLevel('frameworks', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(framework.level) }}
                            >
                              {framework.level.charAt(0).toUpperCase() + framework.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={framework.years}
                              onChange={(e) => updateSkillYears('frameworks', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Databases Section */}
          {(activeCategory === 'all' || activeCategory === 'databases') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaDatabase className="section-icon" />
                  Databases
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={databaseInput}
                    onChange={(e) => setDatabaseInput(e.target.value)}
                    placeholder="Add a database..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('databases', databaseInput, setDatabaseInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('databases', databaseInput, setDatabaseInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.databases.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No databases match your search criteria.' 
                        : 'No databases added yet. Add your first database!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.databases.map((database, index) => (
                      <motion.div 
                        key={`database-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{database.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('databases', index)}
                            aria-label={`Remove ${database.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={database.level}
                              onChange={(e) => updateSkillLevel('databases', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(database.level) }}
                            >
                              {database.level.charAt(0).toUpperCase() + database.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={database.years}
                              onChange={(e) => updateSkillYears('databases', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tools Section */}
          {(activeCategory === 'all' || activeCategory === 'tools') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaTools className="section-icon" />
                  Tools & Software
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder="Add a tool or software..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('tools', toolInput, setToolInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('tools', toolInput, setToolInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.tools.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No tools match your search criteria.' 
                        : 'No tools added yet. Add your first tool!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.tools.map((tool, index) => (
                      <motion.div 
                        key={`tool-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{tool.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('tools', index)}
                            aria-label={`Remove ${tool.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={tool.level}
                              onChange={(e) => updateSkillLevel('tools', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(tool.level) }}
                            >
                              {tool.level.charAt(0).toUpperCase() + tool.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={tool.years}
                              onChange={(e) => updateSkillYears('tools', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Platforms Section */}
          {(activeCategory === 'all' || activeCategory === 'platforms') && (
            <div className="skills-section">
              <div className="section-header">
                <h2>
                  <FaGlobe className="section-icon" />
                  Platforms & Services
                </h2>
                <div className="skill-input-container">
                  <input
                    type="text"
                    value={platformInput}
                    onChange={(e) => setPlatformInput(e.target.value)}
                    placeholder="Add a platform or service..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillItem('platforms', platformInput, setPlatformInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-skill-btn"
                    onClick={() => addSkillItem('platforms', platformInput, setPlatformInput)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
              
              <div className="skills-list">
                {filteredSkills.platforms.length === 0 ? (
                  <div className="empty-skills">
                    <p>
                      {searchQuery 
                        ? 'No platforms match your search criteria.' 
                        : 'No platforms added yet. Add your first platform!'}
                    </p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {filteredSkills.platforms.map((platform, index) => (
                      <motion.div 
                        key={`platform-${index}`}
                        className="skill-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <h3>{platform.name}</h3>
                          <button
                            type="button"
                            className="remove-skill"
                            onClick={() => removeSkillItem('platforms', index)}
                            aria-label={`Remove ${platform.name}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        
                        <div className="skill-details">
                          <div className="skill-level">
                            <label>Proficiency:</label>
                            <select
                              value={platform.level}
                              onChange={(e) => updateSkillLevel('platforms', index, e.target.value)}
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <div 
                              className="level-indicator" 
                              style={{ backgroundColor: getLevelColor(platform.level) }}
                            >
                              {platform.level.charAt(0).toUpperCase() + platform.level.slice(1)}
                            </div>
                          </div>
                          
                          <div className="skill-years">
                            <label>Years of Experience:</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={platform.years}
                              onChange={(e) => updateSkillYears('platforms', index, e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* No Results Message */}
          {searchQuery && !hasFilteredItems(filteredSkills) && (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <h3>No skills found</h3>
              <p>No skills match your search criteria "{searchQuery}"</p>
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <div className="action-info">
            {isDirty && (
              <span className="unsaved-changes">
                <FaInfoCircle /> You have unsaved changes
              </span>
            )}
          </div>
          
          <div className="action-buttons">
            <Link to="/profile" className="cancel-btn">
              <FaTimes /> Cancel
            </Link>
            
            <button 
              type="submit" 
              className="save-btn" 
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <>
                  <div className="button-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Skills
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Auto-save effect */}
      <useEffect(() => {
    let autoSaveTimer;
    
    if (isDirty && autoSaveEnabled && !isSaving) {
      autoSaveTimer = setTimeout(async () => {
        try {
          const skillsProfileData = {
            skills: formData.skills,
            languages: formData.languages,
            frameworks: formData.frameworks,
            tools: formData.tools,
            databases: formData.databases,
            platforms: formData.platforms,
            updatedAt: new Date().toISOString()
          };
          
          await apiService.skills.updateProfile(skillsProfileData);
          setIsDirty(false);
          setLastSaved(new Date());
          setSuccess('Skills auto-saved successfully!');
          setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Don't show error for auto-save failures to avoid UI spam
        }
      }, 3000); // Auto-save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData, isDirty, autoSaveEnabled, isSaving]);
  
      // Handle page leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  
  // Validate form data
  const validateFormData = () => {
    const errors = [];
    
    // Check for duplicate skills across categories
    const allSkillNames = Object.values(formData).flat().map(skill => skill.name.toLowerCase());
    const duplicates = allSkillNames.filter((name, index) => allSkillNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate skills found: ${[...new Set(duplicates)].join(', ')}`);
    }
    
    // Check for invalid years
    Object.values(formData).flat().forEach(skill => {
      if (skill.years < 0 || skill.years > 50) {
        errors.push(`Invalid years of experience for ${skill.name}: ${skill.years}`);
      }
    });
    
    return errors;
  };

  // ...existing code...
    <style jsx>{`
        /* Skills Form Container */
        .skills-form-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
        }
        
        /* Header Styles */
        .skills-form-header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
            background: linear-gradient(to right, rgba(79, 70, 229, 0.05), transparent);
            border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
            padding: 2rem;
            margin: -2rem -2rem 2rem -2rem;
        }

        .header-content {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
            
        .header-left {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 1.5rem;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            color: var(--primary-color);
            font-size: var(--text-sm);
            margin-bottom: 1rem;
            transition: var(--transition-fast);
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: var(--border-radius);
            background-color: rgba(79, 70, 229, 0.08);
        }
        
        .back-link svg {
          margin-right: 0.5rem;
          font-size: 0.8rem;
        }
        
        .back-link:hover {
          color: var(--primary-dark);
          transform: translateX(-3px);
          background-color: rgba(79, 70, 229, 0.12);
        }

        .title-section {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
                
        .back-icon {
            margin-right: 0.5rem;
            font-size: 0.8rem;
        }

        .back-link:hover {
            color: var(--primary-dark);
            transform: translateX(-3px);
            background-color: rgba(79, 70, 229, 0.12);
        }
            
        .page-title {
            font-size: var(--text-3xl);
            color: var(--gray-900);
            margin-bottom: 0.75rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            line-height: 1.2;
        }

        .skills-form-header h1 {
          font-size: var(--text-2xl);
          color: var(--gray-900);
          margin-bottom: 0.75rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .header-description {
          color: var(--gray-600);
          font-size: var(--text-base);
          max-width: 600px;
          line-height: 1.5;
        }
        
        .header-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            min-width: 180px;
            transition: transform 0.2s ease;
            box-shadow: var(--shadow-sm);
        }

        .stat-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .stat-item.primary,
        .stat-item.secondary,
        .stat-item.tertiary  {
            background: linear-gradient(135deg, var(--info-color), #3182ce);
            color: white;
        }

        .stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            font-size: 1.25rem;
        }

        .stat-info {
            display: flex;
            flex-direction: column;
        }

        .stat-label {
            font-size: var(--text-xs);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }

        /* Dark Mode Styles */
        .dark-mode .skills-form-header {
            background: linear-gradient(to right, rgba(79, 70, 229, 0.1), rgba(79, 70, 229, 0.02));
            border-bottom-color: var(--gray-700);
        }

        .dark-mode .skills-form-header h1 {
            color: var(--white);
        }

        .dark-mode .header-description {
            color: var(--gray-400);
        }

        .dark-mode .back-link {
            background-color: rgba(79, 70, 229, 0.15);
            color: var(--primary-light);
        }
        
        .dark-mode .back-link:hover {
            background-color: rgba(79, 70, 229, 0.25);
        }
        
        .dark-mode .page-title {
            color: var(--white);
        }
        
        .dark-mode .header-description {
            color: var(--gray-400);
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
            .page-title {
            font-size: var(--text-2xl);
            }
            
            .header-description {
            font-size: var(--text-sm);
            }
        }

        /* Responsive Styles */
        @media (min-width: 768px) {
            .header-content {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
            
            .header-stats {
                margin-top: 0;
            }
            }

            @media (max-width: 767px) {
            .skills-form-header {
                padding: 1.5rem;
            }
            
            .header-stats {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-between;
            }
            
            .stat-item {
                flex: 1;
                min-width: 140px;
            }
            }

            @media (max-width: 480px) {
            .skills-form-header {
                padding: 1.25rem;
            }
            
            .skills-form-header h1 {
                font-size: var(--text-2xl);
            }
            
            .header-stats {
                flex-direction: column;
            }
            
            .stat-item {
                width: 100%;
            }
        }

       
        .stat-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.25rem;
        }
        
        /* Error and Success Banners */
        .error-banner,
        .success-banner {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;
        }
        
        .error-banner {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger-color);
        }
        
        .success-banner {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--success-color);
        }
        
        .error-banner svg,
        .success-banner svg {
          margin-right: 0.75rem;
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
          color: inherit;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Skills Toolbar */
        .skills-toolbar {
          margin-bottom: 2rem;
        }
        
        .search-filter {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .search-box {
          position: relative;
          flex: 1;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }
        
        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-base);
          transition: var(--transition-fast);
        }
        
        .search-box input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        
        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .category-filter {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .filter-icon {
          color: var(--gray-500);
        }
        
        .category-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .category-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          background-color: var(--gray-100);
          color: var(--gray-700);
          font-size: var(--text-sm);
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .category-tab:hover {
          background-color: var(--gray-200);
        }
        
        .category-tab.active {
          background-color: var(--primary-color);
          color: var(--white);
        }
        
        .category-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 0.25rem;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
        }
        
        /* Skills Sections */
        .skills-sections {
          margin-bottom: 2rem;
        }
        
        .skills-section {
          margin-bottom: 2.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-header h2 {
          display: flex;
          align-items: center;
          font-size: var(--text-xl);
          color: var(--gray-900);
          margin: 0;
        }
        
        .section-icon {
          margin-right: 0.75rem;
          color: var(--primary-color);
        }
        
        .skill-input-container {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          max-width: 400px;
        }
        
        .skill-input-container input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
        
        .skill-input-container input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        
        .add-skill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .add-skill-btn:hover {
          background-color: var(--primary-dark);
        }
        
        /* Skills List */
        .skills-list {
          margin-bottom: 1.5rem;
        }
        
        .empty-skills {
          padding: 2rem;
          text-align: center;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-500);
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .skill-item {
          background-color: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          padding: 1rem;
          transition: var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        
        .skill-item:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .skill-header h3 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin: 0;
          font-weight: 600;
        }
        
        .remove-skill {
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }
        
        .remove-skill:hover {
          color: var(--danger-color);
        }
        
        .skill-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .skill-level, .skill-years {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .skill-level label, .skill-years label {
          font-size: var(--text-xs);
          color: var(--gray-600);
          font-weight: 500;
        }
        
        .skill-level select, .skill-years input {
          padding: 0.5rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
        
        .skill-level select:focus, .skill-years input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        
        .level-indicator {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: var(--border-radius);
          color: var(--white);
          font-size: var(--text-xs);
          font-weight: 600;
          text-align: center;
          margin-top: 0.25rem;
        }
        
        /* No Results */
        .no-results {
          text-align: center;
          padding: 3rem 2rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-600);
        }
        
        .no-results-icon {
          font-size: 2.5rem;
          color: var(--gray-400);
          margin-bottom: 1rem;
        }
        
        .no-results h3 {
          font-size: var(--text-lg);
          color: var(--gray-800);
          margin-bottom: 0.5rem;
        }
        
        .no-results p {
          margin-bottom: 1.5rem;
        }
        
        .clear-search-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--white);
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .clear-search-btn:hover {
          background-color: var(--primary-color);
          color: var(--white);
        }
        
        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }
        
        .action-info {
          color: var(--gray-600);
        }
        
        .unsaved-changes {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fbbf24;
          font-size: var(--text-sm);
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
        }
        
        .cancel-btn, .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .cancel-btn {
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
        }
        
        .cancel-btn:hover {
          background-color: var(--gray-100);
        }
        
        .save-btn {
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
        }
        
        .save-btn:hover:not(:disabled) {
          background-color: var(--primary-dark);
        }
        
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Loading Screen */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 2rem;
        }
        
        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        /* Dark Mode Styles */
        .dark-mode .skills-form-container {
          background-color: var(--gray-800);
          color: var(--gray-200);
        }
        
        .dark-mode .skills-form-header {
          border-bottom-color: var(--gray-700);
        }
        
        .dark-mode .skills-form-header h1 {
          color: var(--white);
        }
        
        .dark-mode .header-description {
          color: var(--gray-400);
        }
        
        .dark-mode .back-link {
          background-color: rgba(79, 70, 229, 0.15);
          color: var(--primary-light);
        }
        
        .dark-mode .back-link:hover {
          background-color: rgba(79, 70, 229, 0.25);
        }
        
        /* Search and filter */
        .dark-mode .search-box input,
        .dark-mode .skill-input-container input,
        .dark-mode .skill-level select,
        .dark-mode .skill-years input {
            background-color: var(--dark-card-bg);
            border-color: var(--dark-border);
            color: var(--dark-text-primary);
        }
        
        .dark-mode .search-box input:focus,
        .dark-mode .skill-input-container input:focus,
        .dark-mode .skill-level select:focus,
        .dark-mode .skill-years input:focus {
            border-color: var(--dark-primary-light);
            box-shadow: 0 0 0 3px var(--dark-highlight);
        }
        
        .dark-mode .search-icon,
        .dark-mode .clear-search,
        .dark-mode .filter-icon {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .category-tab {
            background-color: var(--dark-card-bg);
            color: var(--dark-text-secondary);
        }
        
        .dark-mode .category-tab:hover {
            background-color: #4b5563;
        }
        
        .dark-mode .category-tab.active {
            background-color: var(--primary-color);
            color: var(--white);
        }
        
        /* Section headers */
        .dark-mode .section-header h2 {
            color: var(--dark-text-primary);
        }
        
        .dark-mode .section-icon {
            color: var(--dark-primary-light);
        }
        
        /* Empty states */
        .dark-mode .empty-skills,
        .dark-mode .no-results {
            background-color: var(--dark-card-bg);
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .empty-skills p,
        .dark-mode .no-results p {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .no-results-icon {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .no-results h3 {
            color: var(--dark-text-secondary);
        }
        
        .dark-mode .clear-search-btn {
            background-color: var(--dark-card-bg);
            color: var(--dark-primary-light);
            border-color: var(--dark-primary-light);
        }
        
        .dark-mode .clear-search-btn:hover {
            background-color: var(--primary-color);
            color: var(--white);
        }
        
        /* Skill items */
        .dark-mode .skill-item {
            background-color: var(--dark-card-bg);
            border-color: var(--dark-border);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .dark-mode .skill-item:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
        }
        
        .dark-mode .skill-header {
            border-bottom-color: var(--dark-border);
        }
        
        .dark-mode .skill-header h3 {
            color: var(--dark-text-primary);
        }
        
        .dark-mode .remove-skill {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .remove-skill:hover {
            color: #ef4444;
        }
        
        .dark-mode .skill-level label,
        .dark-mode .skill-years label {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .level-indicator {
            opacity: 0.9;
        }
        
        /* Form actions */
        .dark-mode .form-actions {
            border-top-color: var(--dark-border);
        }
        
        .dark-mode .action-info {
            color: var(--dark-text-tertiary);
        }
        
        .dark-mode .unsaved-changes {
            color: #fbbf24;
        }
        
        .dark-mode .cancel-btn {
            background-color: var(--dark-card-bg);
            color: var(--dark-text-secondary);
            border-color: var(--dark-border);
        }
        
        .dark-mode .cancel-btn:hover {
            background-color: #4b5563;
        }
        
        .dark-mode .button-spinner {
            border-color: rgba(255, 255, 255, 0.2);
            border-top-color: var(--white);
        }
        
        /* Loading screen */
        .dark-mode .loading-screen {
            background-color: var(--dark-bg);
            color: var(--dark-text-secondary);
        }
        
        .dark-mode .loading-spinner {
            border-color: rgba(79, 70, 229, 0.3);
            border-top-color: var(--dark-primary-light);
        }
      `}</style>
    </div>
  );
};

export default SkillsForm;
