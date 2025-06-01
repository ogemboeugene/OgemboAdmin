import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaSave, 
  FaPlus, 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGlobe,
  FaCode,
  FaCog, 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaLanguage, 
  FaCamera, 
  FaCheck, 
  FaInfoCircle,
  FaFacebook,
  FaInstagram,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaYoutube,
  FaStackOverflow,
  FaCodepen,
  FaCalendarAlt,
  FaUserTag,
  FaIdCard,
  FaFileAlt,
  FaCloudUploadAlt,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    title: '',
    bio: '',
    dob: '',
    gender: '',
    nationality: '',
    profileImage: '',
    coverImage: '',
    resume: '',
    
    // Contact Information
    email: '',
    phone: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    
    // Social Links
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    dribbble: '',
    behance: '',
    medium: '',
    youtube: '',
    stackoverflow: '',
    codepen: '',
    
    // Skills & Languages
    skills: [],
    languages: [],
    
    // Preferences
    availability: '',
    jobType: [],
    remoteWork: false,
    relocation: false,
    visibilityPreference: 'public',
    
    // Education & Experience (excluded for now)
    education: [],
    experience: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('intermediate');
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const resumeRef = useRef(null);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
          // Sample data with user fallbacks
        const data = {
          // Personal Information
          name: user?.profile?.firstName && user?.profile?.lastName 
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : 'Eugene Brian Ogembo',
          title: user?.profile?.title || user?.profile?.currentPosition || 'Software Developer',
          bio: user?.profile?.bio || 'Passionate software developer with a focus on web and mobile applications. Experienced in React, Flutter, and backend technologies.',
          dob: user?.profile?.dateOfBirth || '1995-05-15',
          gender: user?.profile?.gender || 'male',
          nationality: user?.profile?.nationality || 'Kenyan',
          profileImage: user?.profile?.avatar || '/assets/pro.jpg',
          coverImage: user?.profile?.coverImage || '/assets/cover.jpg',
          resume: user?.profile?.resume || '/assets/resume.pdf',
          
          // Contact Information
          email: user?.email || 'eugene@example.com',
          phone: user?.profile?.phone || '+254 700 123456',
          location: {
            address: user?.profile?.address || '123 Tech Avenue',
            city: user?.profile?.city || 'Nairobi',
            state: user?.profile?.state || '',
            country: user?.profile?.country || 'Kenya',
            zipCode: user?.profile?.zipCode || '00100'
          },
          
          // Social Links
          website: user?.profile?.website || 'https://eugeneogembo.com',
          github: user?.profile?.githubProfile || 'https://github.com/ogemboeugene',
          linkedin: user?.profile?.linkedinProfile || 'https://linkedin.com/in/ogemboeugene',
          twitter: user?.profile?.twitterProfile || 'https://twitter.com/ogemboeugene',
          facebook: user?.profile?.facebookProfile || 'https://facebook.com/ogemboeugene',
          instagram: user?.profile?.instagramProfile || '',
          dribbble: user?.profile?.dribbbleProfile || '',
          behance: user?.profile?.behanceProfile || '',
          medium: user?.profile?.mediumProfile || 'https://medium.com/@ogemboeugene',
          youtube: user?.profile?.youtubeProfile || '',
          stackoverflow: user?.profile?.stackoverflowProfile || '',
          codepen: user?.profile?.codepenProfile || 'https://codepen.io/ogemboeugene',
          
          // Skills & Languages
          skills: ['React', 'Node.js', 'Flutter', 'Python', 'Django', 'JavaScript', 'TypeScript'],
          languages: [
            { name: 'English', proficiency: 'fluent' },
            { name: 'Swahili', proficiency: 'native' },
            { name: 'French', proficiency: 'beginner' }
          ],
          
          // Preferences
          availability: 'full-time',
          jobType: ['permanent', 'contract'],
          remoteWork: true,
          relocation: false,
          visibilityPreference: 'public',
          
          // Education & Experience (excluded for now)
          education: [],
          experience: []
        };
        
        setFormData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setErrors(prev => ({
          ...prev,
          general: 'Failed to load profile data. Please refresh the page.'
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      // Handle nested objects like location.city
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'jobType' && type === 'checkbox') {
      // Handle multiple checkboxes for job type
      if (checked) {
        setFormData(prev => ({
          ...prev,
          jobType: [...prev.jobType, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          jobType: prev.jobType.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setIsDirty(true);
  };
  
  // Handle skill input
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
      setIsDirty(true);
    }
  };
  
  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
    setIsDirty(true);
  };
  
  // Handle language input
  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.some(lang => lang.name === languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { 
          name: languageInput.trim(), 
          proficiency: languageProficiency 
        }]
      }));
      setLanguageInput('');
      setLanguageProficiency('intermediate');
      setIsDirty(true);
    }
  };
  
  const removeLanguage = (languageName) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.name !== languageName)
    }));
    setIsDirty(true);
  };
  
  // Handle file uploads
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you would upload the file to a server
    // For this example, we'll create a local URL
    const fileUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      [type]: fileUrl
    }));
    
    setIsDirty(true);
  };
  
  const triggerFileInput = (ref) => {
    ref.current.click();
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // URL validations
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (formData.website && !urlRegex.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = 'Please enter a valid URL';
    }
    
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessMessage(true);
      setIsDirty(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to save profile. Please try again.'
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Prompt user before leaving if form is dirty
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
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-form-container">
      <div className="profile-form-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>Profile Settings</h1>
        </div>
        
        <div className="header-right">
          <button 
            type="button" 
            className={`visibility-toggle ${formData.visibilityPreference === 'public' ? 'public' : 'private'}`}
            onClick={() => handleChange({
              target: {
                name: 'visibilityPreference',
                value: formData.visibilityPreference === 'public' ? 'private' : 'public'
              }
            })}
          >
            {formData.visibilityPreference === 'public' ? (
              <>
                <FaEye /> Public Profile
              </>
            ) : (
              <>
                <FaEyeSlash /> Private Profile
              </>
            )}
          </button>
          
          <Link to={`/profile/${formData.name.split(' ')[0].toLowerCase()}`} className="view-profile-btn">
            <FaUser /> View Public Profile
          </Link>
        </div>
      </div>
      
      {errors.general && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <p>{errors.general}</p>
          <button onClick={() => setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.general;
            return newErrors;
          })}>
            <FaTimes />
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheck />
            <p>{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="profile-cover-section">
        <div 
          className="profile-cover" 
          style={{ backgroundImage: formData.coverImage ? `url(${formData.coverImage})` : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}
        >
          <button 
            type="button" 
            className="change-cover-btn"
            onClick={() => triggerFileInput(coverImageRef)}
          >
            <FaCamera /> Change Cover
          </button>
          <input 
            type="file" 
            ref={coverImageRef} 
            onChange={(e) => handleFileChange(e, 'coverImage')} 
            accept="image/*" 
            hidden 
          />
        </div>
        
        <div className="profile-image-container">
          <div 
            className="profile-image" 
            style={{ backgroundImage: formData.profileImage ? `url(${formData.profileImage})` : 'none' }}
          >
            {!formData.profileImage && (
              <FaUser className="profile-placeholder" />
            )}
            <button 
              type="button" 
              className="change-image-btn"
              onClick={() => triggerFileInput(profileImageRef)}
            >
              <FaCamera />
            </button>
            <input 
              type="file" 
              ref={profileImageRef} 
              onChange={(e) => handleFileChange(e, 'profileImage')} 
              accept="image/*" 
              hidden 
            />
          </div>
          <div className="profile-name-title">
            <h2>{formData.name || 'Your Name'}</h2>
            <p>{formData.title || 'Your Title'}</p>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <FaUser /> Personal Info
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FaEnvelope /> Contact
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <FaGlobe /> Social Links
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <FaCode /> Skills & Languages
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FaCog /> Preferences
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Information Tab */}
        <div className={`form-tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Professional Title</label>
                <div className="input-with-icon">
                  <FaUserTag className="input-icon" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="4"
              ></textarea>
              <p className="input-help">
                <FaInfoCircle /> Brief description about yourself and your professional background
              </p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <div className="input-with-icon">
                  <FaIdCard className="input-icon" />
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Your nationality"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="resume">Resume/CV</label>
              <div className="file-upload-container">
                <div className="file-upload-info">
                  {formData.resume ? (
                    <>
                      <FaFileAlt className="file-icon" />
                      <span className="file-name">Resume Uploaded</span>
                      <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="view-file-link">
                        View
                      </a>
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="file-icon" />
                      <span className="file-name">No resume uploaded</span>
                    </>
                  )}
                </div>
                <button 
                  type="button" 
                  className="upload-btn"
                  onClick={() => triggerFileInput(resumeRef)}
                >
                  <FaCloudUploadAlt /> Upload Resume
                </button>
                <input 
                  type="file" 
                  ref={resumeRef} 
                  onChange={(e) => handleFileChange(e, 'resume')} 
                  accept=".pdf,.doc,.docx" 
                  hidden 
                />
              </div>
              <p className="input-help">
                <FaInfoCircle /> Accepted formats: PDF, DOC, DOCX. Max size: 5MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact Information Tab */}
        <div className={`form-tab-content ${activeTab === 'contact' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group location-group">
              <div className="location-header">
                <label>Location</label>
                <button 
                  type="button" 
                  className="toggle-details-btn"
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                >
                  {showLocationDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              <div className="input-with-icon">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  id="location.address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                />
              </div>
              
              <AnimatePresence>
                {showLocationDetails && (
                  <motion.div 
                    className="location-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.city"
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.state"
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleChange}
                          placeholder="State/Province"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.country"
                          name="location.country"
                          value={formData.location.country}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.zipCode"
                          name="location.zipCode"
                          value={formData.location.zipCode}
                          onChange={handleChange}
                          placeholder="Zip/Postal Code"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Social Links Tab */}
        <div className={`form-tab-content ${activeTab === 'social' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Social Links</h3>
            <p className="section-description">
              Connect your social profiles to showcase your work and presence across platforms
            </p>
            
            <div className="social-links-grid">
              <div className="form-group">
                <label htmlFor="website">Personal Website</label>
                <div className="input-with-icon">
                  <FaGlobe className="input-icon" />
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? 'error' : ''}
                  />
                </div>
                {errors.website && <p className="error-message">{errors.website}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <div className="input-with-icon">
                  <FaGithub className="input-icon" />
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className={errors.github ? 'error' : ''}
                  />
                </div>
                {errors.github && <p className="error-message">{errors.github}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <div className="input-with-icon">
                  <FaLinkedin className="input-icon" />
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className={errors.linkedin ? 'error' : ''}
                  />
                </div>
                {errors.linkedin && <p className="error-message">{errors.linkedin}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="twitter">Twitter</label>
                <div className="input-with-icon">
                  <FaTwitter className="input-icon" />
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <div className="input-with-icon">
                  <FaFacebook className="input-icon" />
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <div className="input-with-icon">
                  <FaInstagram className="input-icon" />
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="dribbble">Dribbble</label>
                <div className="input-with-icon">
                  <FaDribbble className="input-icon" />
                  <input
                    type="url"
                    id="dribbble"
                    name="dribbble"
                    value={formData.dribbble}
                    onChange={handleChange}
                    placeholder="https://dribbble.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="behance">Behance</label>
                <div className="input-with-icon">
                  <FaBehance className="input-icon" />
                  <input
                    type="url"
                    id="behance"
                    name="behance"
                    value={formData.behance}
                    onChange={handleChange}
                    placeholder="https://behance.net/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="medium">Medium</label>
                <div className="input-with-icon">
                  <FaMedium className="input-icon" />
                  <input
                    type="url"
                    id="medium"
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    placeholder="https://medium.com/@username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="youtube">YouTube</label>
                <div className="input-with-icon">
                  <FaYoutube className="input-icon" />
                  <input
                    type="url"
                    id="youtube"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/c/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="stackoverflow">Stack Overflow</label>
                <div className="input-with-icon">
                  <FaStackOverflow className="input-icon" />
                  <input
                    type="url"
                    id="stackoverflow"
                    name="stackoverflow"
                    value={formData.stackoverflow}
                    onChange={handleChange}
                    placeholder="https://stackoverflow.com/users/id/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="codepen">CodePen</label>
                <div className="input-with-icon">
                  <FaCodepen className="input-icon" />
                  <input
                    type="url"
                    id="codepen"
                    name="codepen"
                    value={formData.codepen}
                    onChange={handleChange}
                    placeholder="https://codepen.io/username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skills & Languages Tab */}
        <div className={`form-tab-content ${activeTab === 'skills' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Skills</h3>
            <p className="section-description">
              Add your technical skills and areas of expertise
            </p>
            
            <div className="form-group">
              <label htmlFor="skillInput">Add Skills</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React, Python, UI Design"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill}>
                  <FaPlus /> Add
                </button>
              </div>
              <p className="input-help">
                <FaInfoCircle /> Press Enter or click Add to add a skill
              </p>
            </div>
            
            <div className="skills-container">
              {formData.skills.length === 0 ? (
                <p className="empty-state">No skills added yet. Add your first skill above.</p>
              ) : (
                formData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    <span>{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">Languages</h3>
            <p className="section-description">
              Add languages you speak and your proficiency level
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="languageInput">Language</label>
                <input
                  type="text"
                  id="languageInput"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="e.g. English, Spanish, French"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="languageProficiency">Proficiency</label>
                <select
                  id="languageProficiency"
                  value={languageProficiency}
                  onChange={(e) => setLanguageProficiency(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </select>
              </div>
              
              <div className="form-group form-button-group">
                <label>&nbsp;</label>
                <button type="button" className="add-btn" onClick={addLanguage}>
                  <FaPlus /> Add Language
                </button>
              </div>
            </div>
            
            <div className="languages-list">
              {formData.languages.length === 0 ? (
                <p className="empty-state">No languages added yet. Add your first language above.</p>
              ) : (
                <div className="language-table">
                  <div className="language-table-header">
                    <div className="language-name-header">Language</div>
                    <div className="language-proficiency-header">Proficiency</div>
                    <div className="language-actions-header">Actions</div>
                  </div>
                  {formData.languages.map((language, index) => (
                    <div key={index} className="language-item">
                      <div className="language-name">{language.name}</div>
                      <div className="language-proficiency">
                        <div className={`proficiency-badge ${language.proficiency}`}>
                          {language.proficiency.charAt(0).toUpperCase() + language.proficiency.slice(1)}
                        </div>
                      </div>
                      <div className="language-actions">
                        <button type="button" className="remove-btn" onClick={() => removeLanguage(language.name)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Preferences Tab */}
        <div className={`form-tab-content ${activeTab === 'preferences' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Work Preferences</h3>
            <p className="section-description">
              Set your availability and job preferences
            </p>
            
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="">Select Availability</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Job Types</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="permanent"
                    checked={formData.jobType.includes('permanent')}
                    onChange={handleChange}
                  />
                  <span>Permanent</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="contract"
                    checked={formData.jobType.includes('contract')}
                    onChange={handleChange}
                  />
                  <span>Contract</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="freelance"
                    checked={formData.jobType.includes('freelance')}
                    onChange={handleChange}
                  />
                  <span>Freelance</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="internship"
                    checked={formData.jobType.includes('internship')}
                    onChange={handleChange}
                  />
                  <span>Internship</span>
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <span>Remote Work</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="remoteWork"
                      checked={formData.remoteWork}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <p className="input-help">Available for remote work opportunities</p>
              </div>
              
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <span>Relocation</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="relocation"
                      checked={formData.relocation}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <p className="input-help">Open to relocating for the right opportunity</p>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">Profile Visibility</h3>
            <p className="section-description">
              Control who can see your profile information
            </p>
            
            <div className="form-group">
              <label htmlFor="visibilityPreference">Profile Visibility</label>
              <select
                id="visibilityPreference"
                name="visibilityPreference"
                value={formData.visibilityPreference}
                onChange={handleChange}
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="private">Private - Only visible to you</option>
                <option value="connections">Connections Only - Visible to your connections</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
            Cancel
          </button>
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
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        /* Base Variables */
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
        
        /* Profile Form Container */
        .profile-form-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--white);
          color: var(--gray-800);
        }
        
        /* Header */
        .profile-form-header {
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
        
        .profile-form-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--gray-900);
        }
        
        .header-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .visibility-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
          border: 1px solid var(--gray-300);
        }
        
        .visibility-toggle.public {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-color);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .visibility-toggle.private {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .visibility-toggle:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        .view-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          background-color: var(--primary-color);
          color: var(--white);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .view-profile-btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
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
          border-left: 4px solid var(--secondary-color);
          color: var(--secondary-color);
        }
        
        .error-banner svg,
        .success-banner svg {
          font-size: 1.25rem;
        }
        
        .error-banner p,
        .success-banner p {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .error-banner button,
        .success-banner button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .error-banner button:hover,
        .success-banner button:hover {
          opacity: 1;
        }
        
        /* Profile Cover Section */
        .profile-cover-section {
          position: relative;
          margin-bottom: 4rem;
        }
        
        .profile-cover {
          height: 200px;
          border-radius: var(--border-radius-lg);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        
        .change-cover-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          background-color: rgba(0, 0, 0, 0.5);
          color: var(--white);
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .change-cover-btn:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        
        .profile-image-container {
          position: absolute;
          left: 2rem;
          bottom: 50px;
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
        }
        
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: var(--border-radius-full);
          background-color: var(--white);
          border: 4px solid var(--white);
          box-shadow: var(--shadow-md);
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .profile-placeholder {
          font-size: 3rem;
          color: var(--gray-400);
        }
        
        .change-image-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          background-color: var(--primary-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .change-image-btn:hover {
          background-color: var(--primary-dark);
          transform: scale(1.1);
        }
        
        .profile-name-title {
          padding-bottom: 0.5rem;
        }
        
        .profile-name-title h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }
        
        .profile-name-title p {
          font-size: 1rem;
          color: var(--gray-600);
        }
        
        /* Tabs */
        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
          margin-bottom: 2rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .profile-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--gray-600);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }
        
        .tab-btn:hover {
          color: var(--primary-color);
        }
        
        .tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        /* Form Content */
        .form-tab-content {
          display: none;
        }
        
        .form-tab-content.active {
          display: block;
        }
        
        .form-section {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid var(--gray-200);
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
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .form-group {
          flex: 1;
          min-width: 250px;
          margin-bottom: 1.5rem;
        }
        
        .form-button-group {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-width: auto;
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
        input[type="email"],
        input[type="tel"],
        input[type="url"],
        input[type="date"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          color: var(--gray-800);
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }
        
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
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
        
        /* Location Group */
        .location-group {
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          padding: 1rem;
          background-color: var(--gray-50);
        }
        
        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .toggle-details-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .toggle-details-btn:hover {
          text-decoration: underline;
        }
        
        .location-details {
          margin-top: 1rem;
          overflow: hidden;
        }
        
        /* Social Links */
        .social-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        /* Skills */
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .skill-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius-full);
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .skill-tag button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 0.75rem;
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .skill-tag button:hover {
          opacity: 1;
        }
        
        .empty-state {
          padding: 1.5rem;
          text-align: center;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        /* Languages */
        .language-table {
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          overflow: hidden;
        }
        
        .language-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 80px;
          background-color: var(--gray-100);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--gray-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .language-item {
          display: grid;
          grid-template-columns: 2fr 1fr 80px;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--gray-200);
          align-items: center;
        }
        
        .language-name {
          font-weight: 500;
          color: var(--gray-800);
        }
        
        .proficiency-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }
        
        .proficiency-badge.beginner {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .proficiency-badge.intermediate {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
        
        .proficiency-badge.advanced {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--info-color);
        }
        
        .proficiency-badge.fluent,
        .proficiency-badge.native {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-color);
        }
        
        .language-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-full);
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .remove-btn:hover {
          background-color: rgba(239, 68, 68, 0.2);
        }
        
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        
        .add-btn:hover {
          background-color: var(--primary-dark);
        }
        
        /* Checkbox and Toggle Styles */
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--primary-color);
        }
        
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
        .dark-mode .profile-form-container {
          background-color: var(--gray-900);
        }
        
        .dark-mode .profile-form-header h1 {
          color: var(--gray-100);
        }
        
        .dark-mode .back-link {
          color: var(--gray-400);
        }
        
        .dark-mode .back-link:hover {
          color: var(--primary-light);
        }
        
        .dark-mode .visibility-toggle {
          border-color: var(--gray-700);
        }
        
        .dark-mode .visibility-toggle.public {
          background-color: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.4);
        }
        
        .dark-mode .visibility-toggle.private {
          background-color: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
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
        .dark-mode input[type="email"],
        .dark-mode input[type="tel"],
        .dark-mode input[type="url"],
        .dark-mode input[type="date"],
        .dark-mode input[type="number"],
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
        
        .dark-mode .location-group {
          background-color: var(--gray-700);
          border-color: var(--gray-600);
        }
        
        .dark-mode .toggle-details-btn {
          color: var(--primary-light);
        }
        
        .dark-mode .skill-tag {
          background-color: rgba(129, 140, 248, 0.2);
          color: var(--primary-light);
        }
        
        .dark-mode .skill-tag button {
          color: var(--primary-light);
        }
        
        .dark-mode .empty-state {
          background-color: var(--gray-700);
          color: var(--gray-400);
        }
        
        .dark-mode .language-table {
          border-color: var(--gray-700);
        }
        
        .dark-mode .language-table-header {
          background-color: var(--gray-700);
          color: var(--gray-300);
        }
        
        .dark-mode .language-item {
          border-color: var(--gray-700);
        }
        
        .dark-mode .language-name {
          color: var(--gray-200);
        }
        
        .dark-mode .checkbox-label {
          color: var(--gray-300);
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
          .profile-form-container {
            padding: 1rem;
          }
          
          .profile-form-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
          
          .profile-cover {
            height: 150px;
          }
          
          .profile-image-container {
            left: 50%;
            transform: translateX(-50%);
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .profile-tabs {
            margin-top: 4rem;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .social-links-grid {
            grid-template-columns: 1fr;
          }
          
          .language-table-header,
          .language-item {
            grid-template-columns: 1.5fr 1fr 60px;
            font-size: 0.75rem;
            padding: 0.5rem;
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

export default ProfileForm;
