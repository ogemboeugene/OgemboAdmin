import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaCog, 
  FaUser, 
  FaPalette, 
  FaBell, 
  FaLock, 
  FaChartBar,
  FaComments,
  FaRocket,
  FaCamera,
  FaCopy,
  FaGlobe, 
  FaDatabase, 
  FaCloudUploadAlt, 
  FaTrash, 
  FaInfoCircle, 
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaCheck, 
  FaTimes, 
  FaMoon, 
  FaSun, 
  FaToggleOn, 
  FaToggleOff, 
  FaChevronRight,
  FaShieldAlt,
  FaKey,
  FaCode,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaSync,
  FaCloudDownloadAlt,
  FaHistory,
  FaLanguage,
  FaFont,
  FaRobot,
  FaEnvelope,
  FaDesktop,
  FaMobile,
  FaTabletAlt,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaArrowLeft,
  FaTerminal,
  FaServer,  FaNetworkWired,
  FaLayerGroup,
  FaFileCode,
  FaTools,
  FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('general');
  
  // State for theme settings
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [fontSize, setFontSize] = useState('medium');
  
  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifyOnProjectUpdate, setNotifyOnProjectUpdate] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);
    // State for account settings
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
    // State for developer settings
  const [githubUsername, setGithubUsername] = useState(user?.profile?.githubUsername || '');
  const [preferredStack, setPreferredStack] = useState(['React', 'Node.js', 'MongoDB']);
  const [stackInput, setStackInput] = useState('');
  const [devEnvironment, setDevEnvironment] = useState('vscode');
    // State for API settings
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_STRIPE_TEST_KEY || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhook');
  
  // State for portfolio settings
  const [portfolioVisibility, setPortfolioVisibility] = useState('public');
  const [showCodeSamples, setShowCodeSamples] = useState(true);
  const [showProjectMetrics, setShowProjectMetrics] = useState(true);
  const [allowProjectComments, setAllowProjectComments] = useState(true);
  
  // State for social profiles
  const [githubProfile, setGithubProfile] = useState(user?.profile?.githubProfile || '');
  const [linkedinProfile, setLinkedinProfile] = useState(user?.profile?.linkedinProfile || '');
  const [twitterProfile, setTwitterProfile] = useState(user?.profile?.twitterProfile || '');
  
  // State for backup & data
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('weekly');
  const [lastBackup, setLastBackup] = useState('2023-07-15T14:30:00');
  
  // State for saving changes
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Refs for scrolling to sections
  const generalRef = useRef(null);
  const appearanceRef = useRef(null);
  const notificationsRef = useRef(null);
  const accountRef = useRef(null);
  const developerRef = useRef(null);
  const securityRef = useRef(null);
  const apiRef = useRef(null);
  const portfolioRef = useRef(null);
  const socialRef = useRef(null);
  const backupRef = useRef(null);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('developerSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setDarkMode(parsedSettings.darkMode || false);
        setPrimaryColor(parsedSettings.primaryColor || '#2563eb');
        setFontSize(parsedSettings.fontSize || 'medium');
        setEmailNotifications(parsedSettings.emailNotifications !== undefined ? parsedSettings.emailNotifications : true);
        setPushNotifications(parsedSettings.pushNotifications !== undefined ? parsedSettings.pushNotifications : true);
        setPortfolioVisibility(parsedSettings.portfolioVisibility || 'public');
        setShowCodeSamples(parsedSettings.showCodeSamples !== undefined ? parsedSettings.showCodeSamples : true);
        setShowProjectMetrics(parsedSettings.showProjectMetrics !== undefined ? parsedSettings.showProjectMetrics : true);
        setAllowProjectComments(parsedSettings.allowProjectComments !== undefined ? parsedSettings.allowProjectComments : true);
        
        if (parsedSettings.preferredStack) {
          setPreferredStack(parsedSettings.preferredStack);
        }
        
        if (parsedSettings.devEnvironment) {
          setDevEnvironment(parsedSettings.devEnvironment);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    // Check if system prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode && savedSettings === null) {
      setDarkMode(true);
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      darkMode,
      primaryColor,
      fontSize,
      emailNotifications,
      pushNotifications,
      notifyOnProjectUpdate,
      notifyOnMessage,
      portfolioVisibility,
      showCodeSamples,
      showProjectMetrics,
      allowProjectComments,
      preferredStack,
      devEnvironment
    };
    
    localStorage.setItem('developerSettings', JSON.stringify(settings));
    
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Apply primary color as CSS variable
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Apply font size
    let rootFontSize = '16px';
    if (fontSize === 'small') rootFontSize = '14px';
    if (fontSize === 'large') rootFontSize = '18px';
    document.documentElement.style.fontSize = rootFontSize;
    
  }, [
    darkMode, 
    primaryColor, 
    fontSize, 
    emailNotifications, 
    pushNotifications, 
    notifyOnProjectUpdate, 
    notifyOnMessage,
    portfolioVisibility,
    showCodeSamples,
    showProjectMetrics,
    allowProjectComments,
    preferredStack,
    devEnvironment
  ]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Scroll to the appropriate section
    const refs = {
      general: generalRef,
      appearance: appearanceRef,
      notifications: notificationsRef,
      account: accountRef,
      developer: developerRef,
      security: securityRef,
      api: apiRef,
      portfolio: portfolioRef,
      social: socialRef,
      backup: backupRef
    };
    
    if (refs[tab] && refs[tab].current) {
      refs[tab].current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Add tech stack item
  const addStackItem = () => {
    if (stackInput.trim() && !preferredStack.includes(stackInput.trim())) {
      setPreferredStack([...preferredStack, stackInput.trim()]);
      setStackInput('');
    }
  };
  
  // Remove tech stack item
  const removeStackItem = (item) => {
    setPreferredStack(preferredStack.filter(tech => tech !== item));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate password if changing
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
      }
      
      // Success
      setSaveSuccess(true);
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(error.message || 'An error occurred while saving settings');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Generate a new API key
  const generateNewApiKey = () => {
    // In a real app, this would call an API to generate a new key
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'sk_test_';
    for (let i = 0; i < 24; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setApiKey(result);
  };
  
  // Handle backup now
  const handleBackupNow = async () => {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastBackup(new Date().toISOString());
      alert('Backup completed successfully!');
    } catch (error) {
      alert('Backup failed: ' + error.message);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1><FaCog /> Developer Settings</h1>
          <p className="header-description">
            Manage your developer profile, portfolio, and admin preferences
          </p>
        </div>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => handleTabChange('general')}
            >
              <FaCog className="nav-icon" />
              <span>General</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => handleTabChange('appearance')}
            >
              <FaPalette className="nav-icon" />
              <span>Appearance</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => handleTabChange('portfolio')}
            >
              <FaLayerGroup className="nav-icon" />
              <span>Portfolio</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'developer' ? 'active' : ''}`}
              onClick={() => handleTabChange('developer')}
            >
              <FaTerminal className="nav-icon" />
              <span>Developer</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <FaBell className="nav-icon" />
              <span>Notifications</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => handleTabChange('account')}
            >
              <FaUser className="nav-icon" />
              <span>Account</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <FaLock className="nav-icon" />
              <span>Security</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => handleTabChange('api')}
            >
              <FaCode className="nav-icon" />
              <span>API Access</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => handleTabChange('social')}
            >
              <FaGlobe className="nav-icon" />
              <span>Social Profiles</span>
              <FaChevronRight className="nav-arrow" />
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => handleTabChange('backup')}
            >
              <FaDatabase className="nav-icon" />
              <span>Backup & Data</span>
              <FaChevronRight className="nav-arrow" />
            </button>
          </div>
          
          <div className="sidebar-footer">
            <button className="btn-danger">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        
        <div className="settings-main">
          <form onSubmit={handleSubmit}>
            {/* General Settings */}
            <section className="settings-section" ref={generalRef}>
              <div className="section-header">
                <h2><FaCog /> General Settings</h2>
                <p>Configure your basic portfolio preferences</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Portfolio Visibility</label>
                  <div className="toggle-group">
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="visibility-public" 
                        name="visibility" 
                        value="public"
                        checked={portfolioVisibility === 'public'}
                        onChange={() => setPortfolioVisibility('public')}
                      />
                      <label htmlFor="visibility-public">Public</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="visibility-private" 
                        name="visibility" 
                        value="private"
                        checked={portfolioVisibility === 'private'}
                        onChange={() => setPortfolioVisibility('private')}
                      />
                      <label htmlFor="visibility-private">Private</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="visibility-password" 
                        name="visibility" 
                        value="password"
                        checked={portfolioVisibility === 'password'}
                        onChange={() => setPortfolioVisibility('password')}
                      />
                      <label htmlFor="visibility-password">Password Protected</label>
                    </div>
                  </div>
                  <p className="form-help">Control who can view your portfolio website</p>
                </div>
                
                <div className="form-group">
                  <label>Language</label>
                  <div className="select-wrapper">
                    <select defaultValue="en">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                  <p className="form-help">Select your preferred language for the admin dashboard</p>
                </div>
                
                <div className="form-group">
                  <label>Time Zone</label>
                  <div className="select-wrapper">
                    <select defaultValue="Africa/Nairobi">
                      <option value="Africa/Nairobi">East Africa Time (UTC+3)</option>
                      <option value="Europe/London">Greenwich Mean Time (UTC+0)</option>
                      <option value="America/New_York">Eastern Time (UTC-5)</option>
                      <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                      <option value="Asia/Tokyo">Japan Time (UTC+9)</option>
                    </select>
                  </div>
                  <p className="form-help">Set your local time zone for accurate timestamps</p>
                </div>
                
                <div className="form-group">
                  <label>Date Format</label>
                  <div className="toggle-group">
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="date-mdy" 
                        name="date-format" 
                        value="mdy"
                        defaultChecked
                      />
                      <label htmlFor="date-mdy">MM/DD/YYYY</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="date-dmy" 
                        name="date-format" 
                        value="dmy"
                      />
                      <label htmlFor="date-dmy">DD/MM/YYYY</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="date-ymd" 
                        name="date-format" 
                        value="ymd"
                      />
                      <label htmlFor="date-ymd">YYYY/MM/DD</label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Appearance Settings */}
            <section className="settings-section" ref={appearanceRef}>
              <div className="section-header">
                <h2><FaPalette /> Appearance</h2>
                <p>Customize how your dashboard looks</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Theme</label>
                  <div className="theme-selector">
                    <div 
                      className={`theme-option ${darkMode === false ? 'active' : ''}`}
                      onClick={() => setDarkMode(false)}
                    >
                      <div className="theme-preview light">
                        <FaSun className="theme-icon" />
                      </div>
                      <span>Light</span>
                    </div>
                    
                    <div 
                      className={`theme-option ${darkMode === true ? 'active' : ''}`}
                      onClick={() => setDarkMode(true)}
                    >
                      <div className="theme-preview dark">
                        <FaMoon className="theme-icon" />
                      </div>
                      <span>Dark</span>
                    </div>
                    
                    <div className="theme-option disabled">
                      <div className="theme-preview system">
                        <FaDesktop className="theme-icon" />
                      </div>
                      <span>System</span>
                      <span className="coming-soon-badge">Soon</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Primary Color</label>
                  <div className="color-picker">
                    <div className="color-options">
                      <div 
                        className={`color-option ${primaryColor === '#2563eb' ? 'active' : ''}`}
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={() => setPrimaryColor('#2563eb')}
                      ></div>
                      <div 
                        className={`color-option ${primaryColor === '#10b981' ? 'active' : ''}`}
                        style={{ backgroundColor: '#10b981' }}
                        onClick={() => setPrimaryColor('#10b981')}
                      ></div>
                      <div 
                        className={`color-option ${primaryColor === '#f59e0b' ? 'active' : ''}`}
                        style={{ backgroundColor: '#f59e0b' }}
                        onClick={() => setPrimaryColor('#f59e0b')}
                      ></div>
                      <div 
                        className={`color-option ${primaryColor === '#ef4444' ? 'active' : ''}`}
                        style={{ backgroundColor: '#ef4444' }}
                        onClick={() => setPrimaryColor('#ef4444')}
                      ></div>
                      <div 
                        className={`color-option ${primaryColor === '#8b5cf6' ? 'active' : ''}`}
                        style={{ backgroundColor: '#8b5cf6' }}
                        onClick={() => setPrimaryColor('#8b5cf6')}
                      ></div>
                      <div 
                        className={`color-option ${primaryColor === '#ec4899' ? 'active' : ''}`}
                        style={{ backgroundColor: '#ec4899' }}
                        onClick={() => setPrimaryColor('#ec4899')}
                      ></div>
                    </div>
                    
                    <div className="color-input-wrapper">
                      <span>Custom:</span>
                      <input 
                        type="color" 
                        className="color-input"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Font Size</label>
                  <div className="font-size-selector">
                    <div 
                      className={`font-size-option ${fontSize === 'small' ? 'active' : ''}`}
                      onClick={() => setFontSize('small')}
                    >
                      <FaFont className="font-size-icon small" />
                      <span>Small</span>
                    </div>
                    
                    <div 
                      className={`font-size-option ${fontSize === 'medium' ? 'active' : ''}`}
                      onClick={() => setFontSize('medium')}
                    >
                      <FaFont className="font-size-icon medium" />
                      <span>Medium</span>
                    </div>
                    
                    <div 
                      className={`font-size-option ${fontSize === 'large' ? 'active' : ''}`}
                      onClick={() => setFontSize('large')}
                    >
                      <FaFont className="font-size-icon large" />
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Portfolio Settings */}
            <section className="settings-section" ref={portfolioRef}>
              <div className="section-header">
                <h2><FaLayerGroup /> Portfolio Settings</h2>
                <p>Configure how your projects are displayed</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Project Display Options</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaFileCode className="toggle-icon" />
                        <span>Show code samples</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setShowCodeSamples(!showCodeSamples)}
                        aria-pressed={showCodeSamples}
                      >
                        {showCodeSamples ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaChartBar className="toggle-icon" />
                        <span>Show project metrics</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setShowProjectMetrics(!showProjectMetrics)}
                        aria-pressed={showProjectMetrics}
                      >
                        {showProjectMetrics ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaComments className="toggle-icon" />
                        <span>Allow project comments</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setAllowProjectComments(!allowProjectComments)}
                        aria-pressed={allowProjectComments}
                      >
                        {allowProjectComments ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Default Project Sort</label>
                  <div className="select-wrapper">
                    <select defaultValue="newest">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="complexity">Complexity</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>
                  <p className="form-help">Choose how projects are sorted by default on your portfolio</p>
                </div>
                
                <div className="form-group">
                  <label>Projects Per Page</label>
                  <div className="select-wrapper">
                    <select defaultValue="6">
                      <option value="3">3</option>
                      <option value="6">6</option>
                      <option value="9">9</option>
                      <option value="12">12</option>
                      <option value="all">Show All</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Featured Projects</label>
                  <div className="select-wrapper">
                    <select multiple defaultValue={['1', '2']}>
                      <option value="1">MamaPesa</option>
                      <option value="2">ShopOkoa</option>
                      <option value="3">SokoBeauty</option>
                      <option value="4">DevPortal</option>
                    </select>
                  </div>
                  <p className="form-help">Select projects to feature prominently on your portfolio (Ctrl+click to select multiple)</p>
                </div>
              </div>
            </section>
            
            {/* Developer Settings */}
            <section className="settings-section" ref={developerRef}>
              <div className="section-header">
                <h2><FaTerminal /> Developer Settings</h2>
                <p>Configure your technical preferences</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label htmlFor="githubUsername">GitHub Username</label>
                  <input 
                    type="text" 
                    id="githubUsername" 
                    value={githubUsername} 
                    onChange={(e) => setGithubUsername(e.target.value)} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Preferred Tech Stack</label>
                  <div className="input-with-button">
                    <input 
                      type="text" 
                      value={stackInput} 
                      onChange={(e) => setStackInput(e.target.value)}
                      placeholder="Add technology"
                    />
                    <button type="button" onClick={addStackItem}>Add</button>
                  </div>
                  <div className="tags-container">
                    {preferredStack.map((tech, index) => (
                      <div key={index} className="tag">
                        {tech}
                        <button type="button" onClick={() => removeStackItem(tech)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Development Environment</label>
                  <div className="toggle-group">
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="env-vscode" 
                        name="dev-environment" 
                        value="vscode"
                        checked={devEnvironment === 'vscode'}
                        onChange={() => setDevEnvironment('vscode')}
                      />
                      <label htmlFor="env-vscode">VS Code</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="env-intellij" 
                        name="dev-environment" 
                        value="intellij"
                        checked={devEnvironment === 'intellij'}
                        onChange={() => setDevEnvironment('intellij')}
                      />
                      <label htmlFor="env-intellij">IntelliJ</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="env-sublime" 
                        name="dev-environment" 
                        value="sublime"
                        checked={devEnvironment === 'sublime'}
                        onChange={() => setDevEnvironment('sublime')}
                      />
                      <label htmlFor="env-sublime">Sublime</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="env-other" 
                        name="dev-environment" 
                        value="other"
                        checked={devEnvironment === 'other'}
                        onChange={() => setDevEnvironment('other')}
                      />
                      <label htmlFor="env-other">Other</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Code Snippet Theme</label>
                  <div className="select-wrapper">
                    <select defaultValue="monokai">
                      <option value="monokai">Monokai</option>
                      <option value="github">GitHub</option>
                      <option value="dracula">Dracula</option>
                      <option value="solarized">Solarized</option>
                      <option value="nord">Nord</option>
                    </select>
                  </div>
                  <p className="form-help">Theme used for code snippets in your portfolio</p>
                </div>
              </div>
            </section>
            
            {/* Notifications Settings */}
            <section className="settings-section" ref={notificationsRef}>
              <div className="section-header">
                <h2><FaBell /> Notifications</h2>
                <p>Manage how you receive updates</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Notification Channels</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaEnvelope className="toggle-icon" />
                        <span>Email notifications</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        aria-pressed={emailNotifications}
                      >
                        {emailNotifications ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaMobile className="toggle-icon" />
                        <span>Push notifications</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setPushNotifications(!pushNotifications)}
                        aria-pressed={pushNotifications}
                      >
                        {pushNotifications ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Notification Types</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaRocket className="toggle-icon" />
                        <span>Project updates</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotifyOnProjectUpdate(!notifyOnProjectUpdate)}
                        aria-pressed={notifyOnProjectUpdate}
                      >
                        {notifyOnProjectUpdate ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaEnvelope className="toggle-icon" />
                        <span>Messages</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotifyOnMessage(!notifyOnMessage)}
                        aria-pressed={notifyOnMessage}
                      >
                        {notifyOnMessage ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Quiet Hours</label>
                  <div className="time-range">
                    <div className="time-input">
                      <label>From</label>
                      <input type="time" defaultValue="22:00" />
                    </div>
                    <div className="time-input">
                      <label>To</label>
                      <input type="time" defaultValue="07:00" />
                    </div>
                  </div>
                  <p className="form-help">No notifications will be sent during these hours</p>
                </div>
              </div>
            </section>
            
            {/* Account Settings */}
            <section className="settings-section" ref={accountRef}>
              <div className="section-header">
                <h2><FaUser /> Account</h2>
                <p>Manage your personal information</p>
              </div>
              
              <div className="settings-card">
                <div className="profile-header">                <div className="profile-avatar">
                  {user?.profile?.avatar ? (
                    <img src={user.profile.avatar} alt="Profile" />
                  ) : (
                    <FaUserCircle className="user-avatar-icon" />
                  )}
                  <div className="avatar-upload">
                    <FaCamera />
                  </div>
                </div>
                
                <div className="profile-info">
                  <h3>{user?.profile?.firstName} {user?.profile?.lastName}</h3>
                  <p>{user?.profile?.title || user?.profile?.currentPosition || 'Full Stack Developer'}</p>
                  
                  <div className="account-type">
                    <span className="account-badge">{user?.role || 'Admin'}</span>
                    <button type="button" className="btn-text">Upgrade Plan</button>
                  </div>
                </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                  />
                  <p className="form-help">This will be used for your portfolio URL: example.com/{username}</p>
                </div>
                
                <div className="form-group">
                  <label>Professional Title</label>
                  <input type="text" defaultValue="Full Stack Developer" />
                </div>
                
                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    rows="4" 
                    defaultValue="Experienced software developer specializing in web and mobile applications. Passionate about creating elegant solutions to complex problems."
                  ></textarea>
                  <p className="form-help">Brief description for your portfolio homepage</p>
                </div>
              </div>
            </section>
            
            {/* Security Settings */}
            <section className="settings-section" ref={securityRef}>
              <div className="section-header">
                <h2><FaLock /> Security</h2>
                <p>Manage your account security</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="currentPassword" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="newPassword" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="password-requirements">
                  <h4>Password Requirements</h4>
                  <ul>
                    <li className={newPassword.length >= 8 ? 'valid' : ''}>
                      {newPassword.length >= 8 ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                      {/[A-Z]/.test(newPassword) ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                      At least one uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                      {/[a-z]/.test(newPassword) ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                      At least one lowercase letter
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                      {/[0-9]/.test(newPassword) ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                      At least one number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'valid' : ''}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                      At least one special character
                    </li>
                  </ul>
                </div>
                
                <div className="form-group">
                  <label>Two-Factor Authentication</label>
                  <button type="button" className="btn-primary">
                    <FaShieldAlt /> Enable 2FA
                  </button>
                  <p className="form-help">Add an extra layer of security to your account</p>
                </div>
                
                <div className="form-group">
                  <label>Active Sessions</label>
                  <div className="session-list">
                    <div className="session-item current">
                      <div className="session-info">
                        <div className="session-device">
                          <FaDesktop className="device-icon" />
                          <div className="device-details">
                            <h4>Chrome on Windows</h4>
                            <p>Nairobi, Kenya • 192.168.1.1</p>
                          </div>
                        </div>
                        <div className="session-time">
                          <span>Current session</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="session-item">
                      <div className="session-info">
                        <div className="session-device">
                          <FaMobile className="device-icon" />
                          <div className="device-details">
                            <h4>Safari on iPhone</h4>
                            <p>Nairobi, Kenya • 192.168.1.2</p>
                          </div>
                        </div>
                        <div className="session-time">
                          <span>Active 2 hours ago</span>
                        </div>
                      </div>
                      <button type="button" className="btn-outline danger">
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                    
                    <div className="session-item">
                      <div className="session-info">
                        <div className="session-device">
                          <FaTabletAlt className="device-icon" />
                          <div className="device-details">
                            <h4>Chrome on iPad</h4>
                            <p>Mombasa, Kenya • 192.168.1.3</p>
                          </div>
                        </div>
                        <div className="session-time">
                          <span>Active 3 days ago</span>
                        </div>
                      </div>
                      <button type="button" className="btn-outline danger">
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                  
                  <button type="button" className="btn-outline danger">
                    <FaSignOutAlt /> Logout of all other sessions
                  </button>
                </div>
              </div>
            </section>
            
            {/* API Settings */}
            <section className="settings-section" ref={apiRef}>
              <div className="section-header">
                <h2><FaCode /> API Access</h2>
                <p>Manage API keys and webhooks for integrations</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>API Key</label>
                  <div className="api-key-display">
                    <div className="api-key-input">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        value={apiKey} 
                        readOnly 
                      />
                      <button 
                        type="button" 
                        className="api-key-toggle"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    <div className="api-key-actions">
                      <button type="button" className="btn-secondary" onClick={() => navigator.clipboard.writeText(apiKey)}>
                        <FaCopy /> Copy
                      </button>
                      <button type="button" className="btn-primary" onClick={generateNewApiKey}>
                        <FaSync /> Generate New Key
                      </button>
                    </div>
                    
                    <div className="api-key-warning">
                      <FaExclamationTriangle className="warning-icon" />
                      <p>Keep your API key secure. Regenerating your API key will invalidate your existing key.</p>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Rate Limits</label>
                  <div className="rate-limit-info">
                    <div className="rate-limit-item">
                      <div className="rate-limit-label">Requests per minute</div>
                      <div className="rate-limit-value">60</div>
                    </div>
                    <div className="rate-limit-item">
                      <div className="rate-limit-label">Requests per day</div>
                      <div className="rate-limit-value">10,000</div>
                    </div>
                    <div className="rate-limit-item">
                      <div className="rate-limit-label">Concurrent requests</div>
                      <div className="rate-limit-value">5</div>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="webhookUrl">Webhook URL</label>
                  <input 
                    type="url" 
                    id="webhookUrl" 
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)} 
                    placeholder="https://example.com/webhook"
                  />
                  <p className="form-help">URL to receive notifications when your portfolio data changes</p>
                </div>
                
                <div className="form-group">
                  <label>Webhook Events</label>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input type="checkbox" id="event-project" defaultChecked />
                      <label htmlFor="event-project">Project updates</label>
                    </div>
                    <div className="checkbox-item">
                      <input type="checkbox" id="event-profile" defaultChecked />
                      <label htmlFor="event-profile">Profile changes</label>
                    </div>
                    <div className="checkbox-item">
                      <input type="checkbox" id="event-contact" defaultChecked />
                      <label htmlFor="event-contact">Contact form submissions</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>API Documentation</label>
                  <a href="#" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt /> View API Docs
                  </a>
                </div>
              </div>
            </section>
            
            {/* Social Profiles */}
            <section className="settings-section" ref={socialRef}>
              <div className="section-header">
                <h2><FaGlobe /> Social Profiles</h2>
                <p>Connect your social media accounts</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label className="social-label">
                    <FaGithub className="social-icon github" />
                    GitHub
                  </label>
                  <div className="social-input">
                    <span className="input-prefix">github.com/</span>
                    <input 
                      type="text" 
                      value={githubProfile.replace('github.com/', '')} 
                      onChange={(e) => setGithubProfile(`github.com/${e.target.value}`)} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="social-label">
                    <FaLinkedin className="social-icon linkedin" />
                    LinkedIn
                  </label>
                  <div className="social-input">
                    <span className="input-prefix">linkedin.com/in/</span>
                    <input 
                      type="text" 
                      value={linkedinProfile.replace('linkedin.com/in/', '')} 
                      onChange={(e) => setLinkedinProfile(`linkedin.com/in/${e.target.value}`)} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="social-label">
                    <FaTwitter className="social-icon twitter" />
                    Twitter
                  </label>
                  <div className="social-input">
                    <span className="input-prefix">twitter.com/</span>
                    <input 
                      type="text" 
                      value={twitterProfile.replace('twitter.com/', '')} 
                      onChange={(e) => setTwitterProfile(`twitter.com/${e.target.value}`)} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Display Social Icons</label>
                  <div className="toggle-group">
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-all" 
                        name="social-display" 
                        value="all"
                        defaultChecked
                      />
                      <label htmlFor="social-all">All Pages</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-home" 
                        name="social-display" 
                        value="home"
                      />
                      <label htmlFor="social-home">Home Page Only</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-contact" 
                        name="social-display" 
                        value="contact"
                      />
                      <label htmlFor="social-contact">Contact Page Only</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-none" 
                        name="social-display" 
                        value="none"
                      />
                      <label htmlFor="social-none">Hide All</label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Backup & Data */}
            <section className="settings-section" ref={backupRef}>
              <div className="section-header">
                <h2><FaDatabase /> Backup & Data</h2>
                <p>Manage your portfolio data</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Automatic Backups</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaCloudUploadAlt className="toggle-icon" />
                        <span>Enable automatic backups</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setAutoBackup(!autoBackup)}
                        aria-pressed={autoBackup}
                      >
                        {autoBackup ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Backup Frequency</label>
                  <div className="select-wrapper">
                    <select 
                      value={backupFrequency} 
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      disabled={!autoBackup}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Manual Backup</label>
                  <div className="backup-info">
                    <div className="backup-date">
                      <FaHistory className="backup-icon" />
                      <span>Last backup: {lastBackup ? formatDate(lastBackup) : 'Never'}</span>
                    </div>
                    <button type="button" className="btn-primary" onClick={handleBackupNow}>
                      <FaCloudUploadAlt /> Backup Now
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Export Data</label>
                  <div className="export-options">
                    <div className="export-format">
                      <label>Format:</label>
                      <div className="select-wrapper">
                        <select defaultValue="json">
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="xml">XML</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" className="btn-secondary">
                      <FaCloudDownloadAlt /> Export
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Data Management</label>
                  <div className="data-management-actions">
                    <button type="button" className="btn-secondary">
                      <FaSync /> Sync Data
                    </button>
                    <button type="button" className="btn-outline danger">
                      <FaTrash /> Delete All Data
                    </button>
                  </div>
                  <p className="form-help">Warning: Deleting all data cannot be undone</p>
                </div>
              </div>
            </section>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            className="save-success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <FaCheck className="success-icon" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {saveError && (
          <motion.div 
            className="save-error"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <FaExclamationTriangle className="error-icon" />
            <span>{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        /* Settings Container */
        .settings-container {
          padding: var(--spacing-xl);
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
        
        /* Settings Header */
        .settings-header {
          margin-bottom: var(--spacing-xl);
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-sm);
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .settings-header h1 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .header-description {
          color: var(--gray-600);
          font-size: var(--text-base);
        }
        
        /* Settings Content Layout */
        .settings-content {
          display: flex;
          gap: var(--spacing-xl);
        }
        
        /* Settings Sidebar */
        .settings-sidebar {
          width: 260px;
          flex-shrink: 0;
          position: sticky;
          top: var(--spacing-xl);
          height: calc(100vh - var(--spacing-xl) * 2);
          display: flex;
          flex-direction: column;
        }
        
        .settings-nav {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          overflow: hidden;
          flex: 1;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: left;
          border-left: 3px solid transparent;
          transition: var(--transition-fast);
          position: relative;
        }
        
        .nav-item:hover {
          background-color: var(--gray-100);
          color: var(--gray-900);
        }
        
        .nav-item.active {
          background-color: var(--gray-100);
          color: var(--primary-color);
          border-left-color: var(--primary-color);
          font-weight: 500;
        }
        
        .nav-icon {
          margin-right: var(--spacing-md);
          font-size: 1.1em;
        }
        
        .nav-arrow {
          margin-left: auto;
          font-size: 0.8em;
          opacity: 0;
          transition: var(--transition-fast);
        }
        
        .nav-item:hover .nav-arrow,
        .nav-item.active .nav-arrow {
          opacity: 1;
        }
        
        .sidebar-footer {
          margin-top: var(--spacing-md);
        }
        
        .sidebar-footer .btn-danger {
          width: 100%;
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          background-color: var(--danger-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .sidebar-footer .btn-danger:hover {
          background-color: var(btn-danger-hover);
        }
        
        /* Settings Main Content */
        .settings-main {
          flex: 1;
          min-width: 0;
        }
        
        /* Settings Sections */
        .settings-section {
          margin-bottom: var(--spacing-2xl);
        }
        
        .section-header {
          margin-bottom: var(--spacing-lg);
        }
        
        .section-header h2 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .section-header p {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        /* Settings Card */
        .settings-card {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          padding: var(--spacing-xl);
          border: 1px solid var(--gray-200);
        }
        
        /* Form Styles */
        .form-group {
          margin-bottom: var(--spacing-lg);
        }
        
        .form-group:last-child {
          margin-bottom: 0;
        }
        
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: var(--spacing-sm);
          color: var(--gray-800);
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          font-size: var(--text-base);
          transition: var(--transition-fast);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .form-help {
          margin-top: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--gray-500);
        }
        
        /* Toggle Group */
        .toggle-group {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        
        .toggle-option {
          position: relative;
        }
        
        .toggle-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-option label {
          display: inline-block;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition-fast);
          font-weight: normal;
          margin-bottom: 0;
        }
        
        .toggle-option input[type="radio"]:checked + label {
          background-color: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }
        
        .toggle-option input[type="radio"]:focus + label {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .toggle-option label:hover {
          background-color: var(--gray-100);
        }
        
        .toggle-option input[type="radio"]:checked + label:hover {
          background-color: var(--primary-dark);
        }
        
        /* Toggle Switch */
        .toggle-switch-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .toggle-switch-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .toggle-icon {
          color: var(--gray-600);
        }
        
        .toggle-switch {
          background: none;
          border: none;
          padding: 0;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .toggle-on {
          color: var(--primary-color);
        }
        
        .toggle-off {
          color: var(--gray-400);
        }
        
        /* Theme Selector */
        .theme-selector {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .theme-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid var(--gray-200);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }
        
        .theme-option:hover {
          border-color: var(--gray-400);
        }
        
        .theme-option.active {
          border-color: var(--primary-color);
        }
        
        .theme-option.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .theme-preview {
          width: 100%;
          height: 100px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .theme-preview.light {
          background-color: var(--white);
          border: 1px solid var(--gray-200);
        }
        
        .theme-preview.dark {
          background-color: var(--gray-800);
          color: var(--white);
        }
        
        .theme-preview.system {
          background: linear-gradient(to right, var(--white) 50%, var(--gray-800) 50%);
        }
        
        .theme-icon {
          font-size: 2rem;
        }
        
        .coming-soon-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--gray-500);
          color: var(--white);
          font-size: var(--text-xs);
          padding: 2px 6px;
          border-radius: var(--border-radius);
          transform: translate(30%, -30%);
        }
        
        /* Color Picker */
        .color-picker {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .color-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        
        .color-option {
          width: 36px;
          height: 36px;
          border-radius: var(--border-radius-full);
          cursor: pointer;
          border: 2px solid var(--gray-200);
          transition: var(--transition-fast);
        }
        
        .color-option:hover {
          transform: scale(1.1);
        }
        
        .color-option.active {
          border-color: var(--gray-800);
          transform: scale(1.1);
        }
        
        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .color-input {
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
        }
        
        .color-input::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        
        .color-input::-webkit-color-swatch {
          border: none;
          border-radius: var(--border-radius);
        }
        
        /* Font Size Selector */
        .font-size-selector {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .font-size-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid var(--gray-200);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .font-size-option:hover {
          border-color: var(--gray-400);
        }
        
        .font-size-option.active {
          border-color: var(--primary-color);
        }
        
        .font-size-icon {
          color: var(--gray-700);
        }
        
        .font-size-icon.small {
          font-size: 1rem;
        }
        
        .font-size-icon.medium {
          font-size: 1.5rem;
        }
        
        .font-size-icon.large {
          font-size: 2rem;
        }
        
        /* Time Range */
        .time-range {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .time-input {
          flex: 1;
        }
        
        .time-input label {
          font-size: var(--text-sm);
          color: var(--gray-600);
          margin-bottom: var(--spacing-xs);
        }
        
        /* Profile Header */
        .profile-header {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: var(--border-radius-full);
          overflow: hidden;
          position: relative;
        }
          .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .user-avatar-icon {
          width: 100%;
          height: 100%;
          color: var(--neutral-400);
          background-color: var(--neutral-100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        
        .avatar-upload {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xs);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .avatar-upload:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-info h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }
        
        .profile-info p {
          color: var(--gray-600);
          margin-bottom: var(--spacing-md);
        }
        
        .account-type {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .account-badge {
          background-color: var(--primary-color);
          color: var(--white);
          font-size: var(--text-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-full);
          font-weight: 500;
        }
        
        .btn-text {
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        
        .btn-text:hover {
          text-decoration: underline;
        }
        
        /* Password Input */
        .password-input {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0;
        }
        
        .password-toggle:hover {
          color: var(--gray-700);
        }
        
        /* Password Requirements */
        .password-requirements {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
        }
        
        .password-requirements h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--gray-700);
        }
        
        .password-requirements ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .password-requirements li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
          color: var(--gray-600);
          margin-bottom: var(--spacing-xs);
        }
        
        .password-requirements li:last-child {
          margin-bottom: 0;
        }
        
        .password-requirements li.valid {
          color: var(--success-color);
        }
        
        .check-icon {
          color: var(--success-color);
        }
        
        .times-icon {
          color: var(--gray-400);
        }
        
        /* Session List */
        .session-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .session-item.current {
          border-left: 3px solid var(--primary-color);
        }
        
        .session-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }
        
        .session-device {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .device-icon {
          font-size: 1.5rem;
          color: var(--gray-600);
        }
        
        .device-details h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }
        
        .device-details p {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        .session-time {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        /* API Key Display */
        .api-key-display {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .api-key-input {
          position: relative;
        }
        
        .api-key-toggle {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0;
        }
        
        .api-key-toggle:hover {
          color: var(--gray-700);
        }
        
        .api-key-actions {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .api-key-warning {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: rgba(245, 158, 11, 0.1);
          border-radius: var(--border-radius);
        }
        
        .warning-icon {
          color: var(--warning-color);
          flex-shrink: 0;
          margin-top: 3px;
        }
        
        .api-key-warning p {
          font-size: var(--text-sm);
          color: var(--gray-700);
          margin: 0;
        }
        
        /* Rate Limit Info */
        .rate-limit-info {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .rate-limit-item {
          flex: 1;
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          text-align: center;
        }
        
        .rate-limit-label {
          font-size: var(--text-sm);
          color: var(--gray-600);
          margin-bottom: var(--spacing-xs);
        }
        
        .rate-limit-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
        }
        
        /* Checkbox Group */
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .checkbox-item input[type="checkbox"] {
          width: auto;
        }
        
        /* Social Inputs */
        .social-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .social-icon {
          font-size: 1.2rem;
        }
        
        .social-icon.github {
          color: #333;
        }
        
        .social-icon.linkedin {
          color: #0077b5;
        }
        
        .social-icon.twitter {
          color: #1da1f2;
        }
        
        .social-input {
          position: relative;
        }
        
        .input-prefix {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: var(--text-sm);
        }
        
        .social-input input {
          padding-left: calc(var(--spacing-md) + 100px);
        }
        
        /* Backup Info */
        .backup-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .backup-date {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .backup-icon {
          color: var(--primary-color);
        }
        
        /* Export Options */
        .export-options {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .export-format {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .export-format label {
          margin-bottom: 0;
        }
        
        .export-format .select-wrapper {
          width: 120px;
        }
        
        /* Data Management Actions */
        .data-management-actions {
          display: flex;
          gap: var(--spacing-md);
        }
        
        /* Tags Container */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }
        
        .tag {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--gray-100);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
        }
        
        .tag button {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0;
          font-size: var(--text-base);
          line-height: 1;
        }
        
        .tag button:hover {
          color: var(--danger-color);
        }
        
        /* Input with Button */
        .input-with-button {
          display: flex;
        }
        
        .input-with-button input {
          flex: 1;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .input-with-button button {
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-top-right-radius: var(--border-radius);
          border-bottom-right-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .input-with-button button:hover {
          background-color: var(--primary-dark);
        }
        
        /* Select Wrapper */
        .select-wrapper {
          position: relative;
        }
        
        .select-wrapper::after {
          content: '';
          position: absolute;
          top: 50%;
          right: var(--spacing-md);
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid var(--gray-500);
          pointer-events: none;
        }
        
        .select-wrapper select {
          appearance: none;
          padding-right: calc(var(--spacing-md) * 2);
        }
        
        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-2xl);
        }
        
        .btn-primary {
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-primary:hover {
          background-color: var(--primary-dark);
        }
        
        .btn-primary:disabled {
          background-color: var(--gray-400);
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-secondary:hover {
          background-color: var(--gray-100);
        }
        
        .btn-outline {
          padding: var(--spacing-sm) var(--spacing-lg);
          background-color: transparent;
          border: 1px solid currentColor;
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-outline.danger {
          color: var(--danger-color);
        }
        
        .btn-outline.danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        /* Success and Error Messages */
        .save-success,
        .save-error {
          position: fixed;
          bottom: var(--spacing-xl);
          right: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }
        
        .save-success {
          background-color: var(--success-color);
          color: var(--white);
        }
        
        .save-error {
          background-color: var(--danger-color);
          color: var(--white);
        }
        
        .success-icon,
        .error-icon {
          font-size: 1.2em;
        }
        
        /* Responsive Styles */
        @media (max-width: 1024px) {
          .settings-content {
            flex-direction: column;
          }
          
          .settings-sidebar {
            width: 100%;
            position: static;
            height: auto;
            margin-bottom: var(--spacing-xl);
          }
          
          .settings-nav {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs);
            padding: var(--spacing-md);
          }
          
          .nav-item {
            width: auto;
            border-left: none;
            border-radius: var(--border-radius);
          }
          
          .nav-item.active {
            background-color: var(--primary-color);
            color: var(--white);
            border-left: none;
          }
          
          .nav-arrow {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .settings-container {
            padding: var(--spacing-md);
          }
          
          .settings-card {
            padding: var(--spacing-md);
          }
          
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .theme-selector,
          .font-size-selector {
            flex-direction: column;
          }
          
          .rate-limit-info {
            flex-direction: column;
          }
          
          .time-range {
            flex-direction: column;
          }
          
          .export-options {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .data-management-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .data-management-actions button {
            width: 100%;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .form-actions button {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .toggle-group {
            flex-direction: column;
          }
          
          .toggle-option label {
            width: 100%;
            text-align: center;
          }
          
          .session-item {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .session-info {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }
          
          .api-key-actions {
            flex-direction: column;
          }
          
          .api-key-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
