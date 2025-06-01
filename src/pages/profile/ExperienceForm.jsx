import React, { useState, useEffect, useRef } from 'react';
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
  FaSave, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaArrowLeft,
  FaInfoCircle,
  FaGlobe,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
  FaSort,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import { formatDate, truncateText } from '../../utils/formatters';

const ExperienceForm = ({ editMode = false, readOnly = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isListView = location.pathname === '/experience';
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    employmentType: 'full-time',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
    technologies: [],
    companyWebsite: '',
    companyLogo: '',
    remote: false
  });
  
  // List view states
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [expandedExperience, setExpandedExperience] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // UI states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isListView || editMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [achievementInput, setAchievementInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs
  const filterPanelRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Fetch experiences data for list view
  useEffect(() => {
    if (isListView) {
      setIsLoading(true);
      
      // Simulate API call to fetch experiences
      setTimeout(() => {
        // Sample data for list view
        const experiencesData = [
          {
            id: 1,
            title: 'Senior Frontend Developer',
            company: 'TechInnovate Solutions',
            location: 'Nairobi, Kenya',
            employmentType: 'full-time',
            startDate: '2020-06-01',
            endDate: '',
            current: true,
            description: 'Leading the frontend development team in building modern web applications using React, Redux, and TypeScript. Implementing responsive designs and ensuring cross-browser compatibility.',
            achievements: [
              'Reduced page load time by 40% through code optimization and lazy loading techniques',
              'Implemented a component library that increased development speed by 30%',
              'Led a team of 5 developers to successfully deliver 3 major projects ahead of schedule'
            ],
            technologies: ['React', 'Redux', 'TypeScript', 'SCSS', 'Jest', 'Webpack'],
            companyWebsite: 'https://techinnovate.example.com',
            companyLogo: '/assets/company.png',
            remote: true
          },
          {
            id: 2,
            title: 'Frontend Developer',
            company: 'Digital Crafters',
            location: 'Remote',
            employmentType: 'contract',
            startDate: '2018-03-15',
            endDate: '2020-05-30',
            current: false,
            description: 'Developed responsive web applications for clients in various industries. Worked with a team of designers and backend developers to deliver high-quality products.',
            achievements: [
              'Built and maintained over 10 client websites using modern frontend technologies',
              'Improved website accessibility scores by an average of 35%',
              'Implemented automated testing that caught 95% of UI bugs before deployment'
            ],
            technologies: ['JavaScript', 'React', 'CSS3', 'HTML5', 'Git', 'Figma'],
            companyWebsite: 'https://digitalcrafters.example.com',
            companyLogo: '/assets/company.png',
            remote: true
          },
          {
            id: 3,
            title: 'Web Developer Intern',
            company: 'InnoTech Startups',
            location: 'Nairobi, Kenya',
            employmentType: 'internship',
            startDate: '2017-06-01',
            endDate: '2018-02-28',
            current: false,
            description: 'Assisted the development team in building and maintaining web applications. Gained hands-on experience with frontend and backend technologies.',
            achievements: [
              'Developed a dashboard for internal use that improved team productivity by 20%',
              'Contributed to the company blog with technical articles on web development',
              'Participated in code reviews and improved coding standards'
            ],
            technologies: ['JavaScript', 'jQuery', 'PHP', 'MySQL', 'Bootstrap'],
            companyWebsite: 'https://innotech.example.com',
            companyLogo: '/assets/company.png',
            remote: false
          }
        ];
        
        setExperiences(experiencesData);
        setIsLoading(false);
      }, 1000);
    }
  }, [isListView]);
  
  // Apply filters and sorting to experiences
  useEffect(() => {
    if (isListView && experiences.length > 0) {
      let result = [...experiences];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(exp => 
          exp.title.toLowerCase().includes(query) || 
          exp.company.toLowerCase().includes(query) ||
          exp.description.toLowerCase().includes(query) ||
          exp.technologies.some(tech => tech.toLowerCase().includes(query))
        );
      }
      
      // Apply employment type filter
      if (employmentTypeFilter !== 'all') {
        result = result.filter(exp => exp.employmentType === employmentTypeFilter);
      }
      
      // Apply sorting
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'startDate':
            comparison = new Date(a.startDate) - new Date(b.startDate);
            break;
          case 'company':
            comparison = a.company.localeCompare(b.company);
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          default:
            comparison = 0;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      setFilteredExperiences(result);
    }
  }, [isListView, experiences, searchQuery, employmentTypeFilter, sortBy, sortDirection]);
  
  // Fetch experience data if in edit mode
  useEffect(() => {
    if (editMode && id) {
      setIsLoading(true);
      
      // Simulate API call to fetch experience data
      setTimeout(() => {
        // Sample data for edit mode
        const experienceData = {
          title: 'Senior Frontend Developer',
          company: 'TechInnovate Solutions',
          location: 'Nairobi, Kenya',
          employmentType: 'full-time',
          startDate: '2020-06-01',
          endDate: '',
          current: true,
          description: 'Leading the frontend development team in building modern web applications using React, Redux, and TypeScript. Implementing responsive designs and ensuring cross-browser compatibility.',
          achievements: [
            'Reduced page load time by 40% through code optimization and lazy loading techniques',
            'Implemented a component library that increased development speed by 30%',
            'Led a team of 5 developers to successfully deliver 3 major projects ahead of schedule'
          ],
          technologies: ['React', 'Redux', 'TypeScript', 'SCSS', 'Jest', 'Webpack'],
          companyWebsite: 'https://techinnovate.example.com',
          companyLogo: '/assets/company-logo.png',
          remote: true
        };
        
        setFormData(experienceData);
        setIsLoading(false);
      }, 1000);
    }
  }, [editMode, id]);
  
  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('.filter-toggle-btn')) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Mark form as dirty when changes are made
  useEffect(() => {
    if (!isLoading && !isListView) {
      setIsDirty(true);
    }
  }, [formData, isLoading, isListView]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + F to focus search in list view
      if (isListView && e.altKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Alt + N to create new experience
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        navigate('/experience/new');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListView, navigate]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
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
    
    if (formData.companyWebsite && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Website URL is invalid';
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
  
  const addTechnology = () => {
    if (technologyInput.trim() && !formData.technologies.includes(technologyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, technologyInput.trim()]
      }));
      setTechnologyInput('');
    }
  };
  
  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
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
        
        // Navigate back to experience list
        navigate('/experience');
      }, 3000);
    } catch (error) {
      console.error('Error saving experience:', error);
      setShowErrorMessage(true);
      setErrorMessage('Failed to save experience. Please try again.');
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
    // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Toggle expanded experience
  const toggleExpandExperience = (id) => {
    setExpandedExperience(prev => prev === id ? null : id);
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };
  
  // Confirm delete experience
  const confirmDeleteExperience = async (id) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove from state
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setConfirmDelete(null);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error deleting experience:', error);
      setShowErrorMessage(true);
      setErrorMessage('Failed to delete experience. Please try again.');
      setTimeout(() => setShowErrorMessage(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get employment type label
  const getEmploymentTypeLabel = (type) => {
    const types = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'internship': 'Internship',
      'volunteer': 'Volunteer'
    };
    
    return types[type] || type;
  };
  
  // Get employment type badge class
  const getEmploymentTypeBadgeClass = (type) => {
    const classes = {
      'full-time': 'badge-primary',
      'part-time': 'badge-secondary',
      'contract': 'badge-info',
      'freelance': 'badge-warning',
      'internship': 'badge-success',
      'volunteer': 'badge-dark'
    };
    
    return classes[type] || 'badge-default';
  };
  
  // Format date range
  const formatDateRange = (startDate, endDate, current) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (current) {
      return `${start} - Present`;
    }
    
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      return `${start} - ${end}`;
    }
    
    return start;
  };
  
  // Calculate duration
  const calculateDuration = (startDate, endDate, current) => {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate);
    
    const diffYears = end.getFullYear() - start.getFullYear();
    const diffMonths = end.getMonth() - start.getMonth();
    
    let years = diffYears;
    let months = diffMonths;
    
    if (diffMonths < 0) {
      years--;
      months = 12 + diffMonths;
    }
    
    const yearText = years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : '';
    const monthText = months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : '';
    
    if (yearText && monthText) {
      return `${yearText}, ${monthText}`;
    }
    
    return yearText || monthText || 'Less than a month';
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="experience-loading">
        <div className="spinner"></div>
        <h3>Loading...</h3>
      </div>
    );
  }
  
  // Render list view
  if (isListView) {
    return (
      <div className="experience-list-container">
        {/* Header */}
        <div className="experience-list-header">
          <div className="header-left">
            <h1>Work Experience</h1>
            <p className="header-description">
              Manage your professional work experience and career history
            </p>
          </div>
          
          <Link to="/experience/new" className="btn-primary">
            <FaPlus /> Add Experience
          </Link>
        </div>
        
        {/* Controls */}
        <div className="experience-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          
          <div className="filter-container">
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <FaFilter /> Filters
              <FaChevronDown className={`chevron ${showFilters ? 'open' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="filter-panel"
                  ref={filterPanelRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="filter-group">
                    <label>Employment Type</label>
                    <div className="filter-options">
                      <button 
                        className={employmentTypeFilter === 'all' ? 'active' : ''}
                        onClick={() => setEmploymentTypeFilter('all')}
                      >
                        All
                      </button>
                      <button 
                        className={employmentTypeFilter === 'full-time' ? 'active' : ''}
                        onClick={() => setEmploymentTypeFilter('full-time')}
                      >
                        Full-time
                      </button>
                      <button 
                        className={employmentTypeFilter === 'part-time' ? 'active' : ''}
                        onClick={() => setEmploymentTypeFilter('part-time')}
                      >
                        Part-time
                      </button>
                      <button 
                        className={employmentTypeFilter === 'contract' ? 'active' : ''}
                        onClick={() => setEmploymentTypeFilter('contract')}
                      >
                        Contract
                      </button>
                      <button 
                        className={employmentTypeFilter === 'internship' ? 'active' : ''}
                        onClick={() => setEmploymentTypeFilter('internship')}
                      >
                        Internship
                      </button>
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <label>Sort By</label>
                    <div className="sort-options">
                      <button 
                        className={sortBy === 'startDate' ? 'active' : ''}
                        onClick={() => handleSortChange('startDate')}
                      >
                        Date {sortBy === 'startDate' && (
                          sortDirection === 'asc' ? <FaSort className="sort-icon asc" /> : <FaSort className="sort-icon desc" />
                        )}
                      </button>
                      <button 
                        className={sortBy === 'company' ? 'active' : ''}
                        onClick={() => handleSortChange('company')}
                      >
                        Company {sortBy === 'company' && (
                          sortDirection === 'asc' ? <FaSort className="sort-icon asc" /> : <FaSort className="sort-icon desc" />
                        )}
                      </button>
                      <button 
                        className={sortBy === 'title' ? 'active' : ''}
                        onClick={() => handleSortChange('title')}
                      >
                        Job Title {sortBy === 'title' && (
                          sortDirection === 'asc' ? <FaSort className="sort-icon asc" /> : <FaSort className="sort-icon desc" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setEmploymentTypeFilter('all');
                        setSortBy('startDate');
                        setSortDirection('desc');
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Experience List */}
        {filteredExperiences.length === 0 ? (
          <div className="empty-experience">
            <FaBriefcase className="empty-icon" />
            <h3>No work experience found</h3>
            <p>
              {searchQuery || employmentTypeFilter !== 'all' 
                ? 'Try adjusting your filters or search query' 
                : 'Add your first work experience to showcase your professional history'}
            </p>
            <Link to="/experience/new" className="btn-primary">
              <FaPlus /> Add Experience
            </Link>
          </div>
        ) : (
          <div className="experience-cards-grid">
            {filteredExperiences.map(experience => (
              <motion.div 
                key={experience.id} 
                className="experience-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {/* Delete confirmation */}
                {confirmDelete === experience.id && (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this experience?</p>
                    <div className="delete-actions">
                      <button 
                        className="btn-danger"
                        onClick={() => confirmDeleteExperience(experience.id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="experience-card-content">
                  <div className="experience-header">
                    <div className="company-logo">
                      {experience.companyLogo ? (
                        <img src={experience.companyLogo} alt={experience.company} />
                      ) : (
                        <FaBuilding />
                      )}
                    </div>
                    
                    <div className="experience-info">
                      <h3>{experience.title}</h3>
                      <div className="company-info">
                        <span className="company-name">{experience.company}</span>
                        <span className={`employment-type-badge ${getEmploymentTypeBadgeClass(experience.employmentType)}`}>
                          {getEmploymentTypeLabel(experience.employmentType)}
                        </span>
                        {experience.remote && (
                          <span className="remote-badge">
                            <FaGlobe /> Remote
                          </span>
                        )}
                      </div>
                      
                      <div className="experience-meta">
                        <div className="date-range">
                          <FaCalendarAlt />
                          <span>{formatDateRange(experience.startDate, experience.endDate, experience.current)}</span>
                          <span className="duration">
                            ({calculateDuration(experience.startDate, experience.endDate, experience.current)})
                          </span>
                        </div>
                        
                        {experience.location && (
                          <div className="location">
                            <FaMapMarkerAlt />
                            <span>{experience.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="experience-actions">
                      <Link 
                        to={`/experience/${experience.id}/edit`} 
                        className="btn-icon" 
                        title="Edit Experience"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDeleteClick(experience.id)}
                        title="Delete Experience"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="experience-summary">
                    <p>{truncateText(experience.description, expandedExperience === experience.id ? 1000 : 150)}</p>
                    
                    {experience.description.length > 150 && (
                      <button 
                        className="expand-btn"
                        onClick={() => toggleExpandExperience(experience.id)}
                      >
                        {expandedExperience === experience.id ? (
                          <>Show Less <FaChevronDown className="expand-icon" /></>
                        ) : (
                          <>Show More <FaChevronRight className="expand-icon" /></>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedExperience === experience.id && (
                      <motion.div 
                        className="experience-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {experience.achievements.length > 0 && (
                          <div className="achievements-section">
                            <h4>Key Achievements</h4>
                            <ul className="achievements-list">
                              {experience.achievements.map((achievement, index) => (
                                <li key={index}>{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {experience.technologies.length > 0 && (
                          <div className="technologies-section">
                            <h4>Technologies Used</h4>
                            <div className="technologies-list">
                              {experience.technologies.map((tech, index) => (
                                <span key={index} className="technology-tag">{tech}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {experience.companyWebsite && (
                          <div className="company-website">
                            <a href={experience.companyWebsite} target="_blank" rel="noopener noreferrer" className="website-link">
                              <FaLink /> Visit Company Website
                            </a>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
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
              <span>Experience successfully updated</span>
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
            <label htmlFor="title">Job Title <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              disabled={readOnly}
              className={errors.title ? 'error' : ''}
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <div id="title-error" className="error-message">
                <FaExclamationCircle /> {errors.title}
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
          <h2 className="section-title">Technologies & Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="technologyInput">Technologies Used</label>
            {!readOnly && (
              <div className="input-with-button">
                <input
                  type="text"
                  id="technologyInput"
                  value={technologyInput}
                  onChange={(e) => setTechnologyInput(e.target.value)}
                  placeholder="Add a technology or skill"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={addTechnology}
                >
                  Add
                </button>
              </div>
            )}
            
            <div className="technologies-container">
              {formData.technologies.length === 0 ? (
                <div className="empty-list-message">
                  <FaInfoCircle />
                  <span>No technologies added yet. {!readOnly && 'Add technologies and skills used in this role.'}</span>
                </div>
              ) : (
                <div className="technologies-list">
                  {formData.technologies.map((tech, index) => (
                    <div key={index} className="technology-tag">
                      <span>{tech}</span>
                      {!readOnly && (
                        <button 
                          type="button" 
                          className="tag-remove"
                          onClick={() => removeTechnology(tech)}
                          aria-label="Remove technology"
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
          
          <div className="form-group">
            <label htmlFor="companyWebsite">Company Website</label>
            <input
              type="url"
              id="companyWebsite"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="e.g. https://company.com"
              disabled={readOnly}
              className={errors.companyWebsite ? 'error' : ''}
              aria-invalid={errors.companyWebsite ? 'true' : 'false'}
              aria-describedby={errors.companyWebsite ? 'companyWebsite-error' : undefined}
            />
            {errors.companyWebsite && (
              <div id="companyWebsite-error" className="error-message">
                <FaExclamationCircle /> {errors.companyWebsite}
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
        
        /* Delete Confirmation */
        .delete-confirm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg);
          z-index: 5;
          text-align: center;
        }
        
        .delete-confirm p {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-md);
        }
        
        .delete-actions {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .btn-danger {
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--danger-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-danger:hover {
          background-color: #dc2626;
        }
        
        /* Loading */
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
          
          .experience-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            max-width: none;
          }
          
          .filter-panel {
            width: 100%;
            left: 0;
            right: 0;
          }
          
          .experience-header {
            flex-direction: column;
          }
          
          .company-logo {
            width: 50px;
            height: 50px;
          }
          
          .experience-actions {
            position: absolute;
            top: var(--spacing-md);
            right: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default ExperienceForm;