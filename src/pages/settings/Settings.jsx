import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiService from '../../services/api/apiService';
import sessionTracker from '../../services/sessionTracker';
import { formatDate, formatFileSize } from '../../utils/formatters';
import { 
  validateForAPI, 
  transformForBackend, 
  detectChanges, 
  formatErrorMessages,
  updateSettings,
  createSettingsChangeDetector
} from '../../utils/settingsValidation';
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
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, setDarkMode, primaryColor, setPrimaryColor, fontSize, setFontSize } = useTheme();
  
  // Helper functions for date format mapping
  const mapServerDateFormatToUI = (serverFormat) => {
    const formatMap = {
      'MM/DD/YYYY': 'mdy',
      'DD/MM/YYYY': 'dmy', 
      'YYYY-MM-DD': 'ymd'
    };
    return formatMap[serverFormat] || 'mdy'; // default to mdy if not found
  };
  
  const mapUIDateFormatToServer = (uiFormat) => {
    const formatMap = {
      'mdy': 'MM/DD/YYYY',
      'dmy': 'DD/MM/YYYY',
      'ymd': 'YYYY-MM-DD'
    };
    return formatMap[uiFormat] || 'MM/DD/YYYY'; // default to MM/DD/YYYY if not found
  };
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('general');
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
    // State for notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Master toggle
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifyOnProjectUpdate, setNotifyOnProjectUpdate] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);
  
  // State for additional notification types
  const [notifyOnTasks, setNotifyOnTasks] = useState(true);
  const [notifyOnCalendar, setNotifyOnCalendar] = useState(true);
  const [notifyOnSecurity, setNotifyOnSecurity] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  
  // State for account settings
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
    // State for developer settings
  const [githubUsername, setGithubUsername] = useState('');
  const [preferredStack, setPreferredStack] = useState([]);
  const [stackInput, setStackInput] = useState('');
  const [devEnvironment, setDevEnvironment] = useState('');
  const [codeSnippetTheme, setCodeSnippetTheme] = useState('monokai');
  const [codeEditor, setCodeEditor] = useState(''); // Full editor name
  
  // State for localization settings
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Africa/Nairobi');
  const [dateFormat, setDateFormat] = useState('mdy');
    // State for API settings
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');  const [webhookEvents, setWebhookEvents] = useState([]);

  // Debug webhook events changes
  useEffect(() => {
    console.log('🔗 Webhook events state changed:', webhookEvents);
  }, [webhookEvents]);
  
  // State for portfolio settings
  const [portfolioVisibility, setPortfolioVisibility] = useState('public');
  const [showCodeSamples, setShowCodeSamples] = useState(true);
  const [showProjectMetrics, setShowProjectMetrics] = useState(true);
  const [allowProjectComments, setAllowProjectComments] = useState(true);
  const [defaultProjectSort, setDefaultProjectSort] = useState('newest');
  const [projectsPerPage, setProjectsPerPage] = useState('6');
  
  // State for social profiles
  const [githubProfile, setGithubProfile] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [twitterProfile, setTwitterProfile] = useState('');
  const [socialDisplay, setSocialDisplay] = useState('all');
    // State for backup & data
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('weekly');
  const [lastBackup, setLastBackup] = useState(null);
  const [lastBackupUrl, setLastBackupUrl] = useState(null);
  const [lastBackupSize, setLastBackupSize] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');    // State for notification timing
  const [quietHoursFrom, setQuietHoursFrom] = useState('22:00');
  const [quietHoursTo, setQuietHoursTo] = useState('07:00');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  
  // State for additional notification settings
  const [notificationTypes, setNotificationTypes] = useState({
    project_updates: true,
    comments: true,
    collaborations: true,
    system_updates: true
  });
  
  // State for privacy settings
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowSearchEngineIndexing, setAllowSearchEngineIndexing] = useState(true);
  // State for security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [apiKeysCount, setApiKeysCount] = useState(0);
  const [activeApiKeysCount, setActiveApiKeysCount] = useState(0);
  const [activeSessionsCount, setActiveSessionsCount] = useState(0);
  const [lastActiveApiKey, setLastActiveApiKey] = useState(null);
  
  // State for session management
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    deviceBreakdown: {},
    topLocations: []
  });
  
  // State for appearance settings (additional)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // State for localization settings (additional)
  const [timeFormat, setTimeFormat] = useState('12'); // 12 or 24
  
  // State for backup settings (additional)
  const [backupLocation, setBackupLocation] = useState('firebase');
  
  // State for projects and featured projects
  const [projects, setProjects] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  // State for saving changes
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // State for tracking initial settings for change detection
  const [initialSettings, setInitialSettings] = useState(null);
  const [changeDetector, setChangeDetector] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
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
  const backupRef = useRef(null);  // Load settings from localStorage and fetch settings data from API
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setDataError(null);
        try {
        // Track if server provides development environment value
        let serverProvidedDevEnvironment = false;
        
        // Fetch both profile and settings data in parallel
        const [profileResponse, settingsResponse] = await Promise.all([
          apiService.profile.get(),
          apiService.settings.get()
        ]);        console.log('Profile response:', profileResponse);
        console.log('Settings response:', settingsResponse);
        
        // Debug: Log the actual settings data structure
        if (settingsResponse.data && settingsResponse.data.success) {
          console.log('🔍 Settings data structure:', settingsResponse.data.data);
          if (settingsResponse.data.data && settingsResponse.data.data.settings) {
            console.log('🔍 Settings object:', settingsResponse.data.data.settings);
            if (settingsResponse.data.data.settings.developer) {
              console.log('🔍 Developer settings:', settingsResponse.data.data.settings.developer);
            }
          }
        }// Handle profile data
        if (profileResponse.data && profileResponse.data.success) {
          const responseData = profileResponse.data.data;
          const userData = responseData.user;
          const profileData = userData.profile;
            // Set user information
          setEmail(userData.email || '');
          setFirstName(profileData.firstName || '');
          setLastName(profileData.lastName || '');
          
          // Combine firstName and lastName to create username
          const combinedUsername = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
          setUsername(combinedUsername || profileData.username || '');
          
          setProfessionalTitle(profileData.title || profileData.currentPosition || '');
          setBio(profileData.bio || '');          // Set social profiles from profile data
          if (profileData.socialLinks) {
            console.log('Social Links from API:', profileData.socialLinks);
            setGithubProfile(profileData.socialLinks.github || '');
            setLinkedinProfile(profileData.socialLinks.linkedin || '');
            setTwitterProfile(profileData.socialLinks.twitter || '');
            
            console.log('Set GitHub Profile to:', profileData.socialLinks.github);
            console.log('Set LinkedIn Profile to:', profileData.socialLinks.linkedin);
            console.log('Set Twitter Profile to:', profileData.socialLinks.twitter);
            
            // Extract GitHub username from GitHub URL for the githubUsername field
            if (profileData.socialLinks.github) {
              const githubUrl = profileData.socialLinks.github;
              const usernameMatch = githubUrl.match(/github\.com\/([^\/]+)/);
              if (usernameMatch && usernameMatch[1]) {
                setGithubUsername(usernameMatch[1]);
              }
            }
          }          // Map settings from profile if available
          if (responseData.settings) {
            const settings = responseData.settings;
            
            // Handle nested appearance settings
            if (settings.appearance) {
              if (settings.appearance.theme) {
                setDarkMode(settings.appearance.theme === 'dark');
              }
              if (settings.appearance.primary_color) {
                setPrimaryColor(settings.appearance.primary_color);
              }
              if (settings.appearance.font_size) {
                setFontSize(settings.appearance.font_size);
              }
              if (settings.appearance.sidebar_collapsed !== undefined) {
                setSidebarCollapsed(settings.appearance.sidebar_collapsed === 1);
              }
              if (settings.appearance.animations_enabled !== undefined) {
                setAnimationsEnabled(settings.appearance.animations_enabled === 1);
              }
            }
              // Handle nested notification settings
            if (settings.notifications) {
              // Master toggle
              if (settings.notifications.notifications_enabled !== undefined) {
                setNotificationsEnabled(settings.notifications.notifications_enabled === 1);
              }
              
              // Basic notification channels
              setEmailNotifications(settings.notifications.email_notifications === 1);
              setPushNotifications(settings.notifications.push_notifications === 1);
              setNotifyOnProjectUpdate(settings.notifications.project_updates === 1);
              setNotifyOnMessage(settings.notifications.messages === 1);
              
              // Extended notification types
              if (settings.notifications.notification_types) {
                const notifTypes = settings.notifications.notification_types;
                setNotificationTypes(notifTypes);
                
                // Map individual notification types
                if (notifTypes.tasks !== undefined) {
                  setNotifyOnTasks(notifTypes.tasks);
                }
                if (notifTypes.calendar !== undefined) {
                  setNotifyOnCalendar(notifTypes.calendar);
                }
                if (notifTypes.security !== undefined) {
                  setNotifyOnSecurity(notifTypes.security);
                }
                if (notifTypes.system !== undefined) {
                  setEmailDigest(notifTypes.system);
                }
              }
              
              // Quiet hours settings
              if (settings.notifications.quiet_hours) {
                const quietHours = settings.notifications.quiet_hours;
                setQuietHoursFrom(quietHours.start || '22:00');
                setQuietHoursTo(quietHours.end || '07:00');
                setQuietHoursEnabled(quietHours.enabled === true);
              }
            }
            
            // Handle nested privacy settings
            if (settings.privacy) {
              setProfilePublic(settings.privacy.profile_public === 1);
              setShowEmail(settings.privacy.show_email === 1);
              setShowPhone(settings.privacy.show_phone === 1);
              setAllowSearchEngineIndexing(settings.privacy.allow_search_engine_indexing === 1);
              setPortfolioVisibility(settings.privacy.profile_public === 1 ? 'public' : 'private');
            }
              // Handle nested security settings
            if (settings.security) {
              setTwoFactorEnabled(settings.security.two_factor_enabled === 1);
              setLoginNotifications(settings.security.login_notifications === 1);
              
              if (settings.security.session_timeout) {
                setSessionTimeout(settings.security.session_timeout);
              }
              if (settings.security.api_keys_count !== undefined) {
                setApiKeysCount(settings.security.api_keys_count);
              }
              if (settings.security.active_api_keys !== undefined) {
                setActiveApiKeysCount(settings.security.active_api_keys);
              }              if (settings.security.active_sessions_count !== undefined) {
                setActiveSessionsCount(settings.security.active_sessions_count);
              }
              if (settings.security.last_active_api_key) {
                setLastActiveApiKey(settings.security.last_active_api_key);
              }
              if (settings.security.api_key) {
                setApiKey(settings.security.api_key);
              }
            }
            
            // Handle nested localization settings
            if (settings.localization) {
              if (settings.localization.language) {
                setLanguage(settings.localization.language);
              }
              if (settings.localization.timezone) {
                setTimezone(settings.localization.timezone);
              }
              if (settings.localization.date_format) {
                setDateFormat(mapServerDateFormatToUI(settings.localization.date_format));
              }
              if (settings.localization.time_format) {
                setTimeFormat(settings.localization.time_format);
              }
            }
              // Handle nested backup settings
            if (settings.backup) {
              setAutoBackup(settings.backup.auto_backup === 1);
              if (settings.backup.backup_frequency) {
                setBackupFrequency(settings.backup.backup_frequency);
              }
              if (settings.backup.backup_location) {
                setBackupLocation(settings.backup.backup_location);
              }
              if (settings.backup.last_backup) {
                setLastBackup(settings.backup.last_backup);
              }
              if (settings.backup.last_backup_url) {
                setLastBackupUrl(settings.backup.last_backup_url);
              }
              if (settings.backup.last_backup_size) {
                setLastBackupSize(settings.backup.last_backup_size);
              }
            }
            
            // Fallback to old flat structure for backward compatibility
            if (!settings.notifications && !settings.privacy && !settings.security) {
              // Notification settings (legacy)
              setEmailNotifications(settings.emailNotifications === 1);
              setPushNotifications(settings.pushNotifications === 1);
              setNotifyOnProjectUpdate(settings.loginNotifications === 1);
              setNotifyOnMessage(settings.notificationsEnabled === 1);
              
              // Theme settings (legacy)
              if (settings.theme) {
                setDarkMode(settings.theme === 'dark');
              }
              if (settings.primaryColor) {
                setPrimaryColor(settings.primaryColor);
              }
              if (settings.fontSize) {
                setFontSize(settings.fontSize);
              }
              
              // Privacy settings (legacy)
              setPortfolioVisibility(settings.profilePublic === 1 ? 'public' : 'private');
              setShowCodeSamples(settings.showEmail === 1);
              setShowProjectMetrics(settings.showPhone === 1);
            }            // Developer settings
            if (settings.developer) {
              if (settings.developer.github_username) {
                setGithubUsername(settings.developer.github_username);
              }
              if (settings.developer.development_environment) {
                console.log('🚀 Setting devEnvironment from server:', settings.developer.development_environment);
                setDevEnvironment(settings.developer.development_environment);
                serverProvidedDevEnvironment = true;
              }
              if (settings.developer.code_editor) {
                setCodeEditor(settings.developer.code_editor);
              }
              if (settings.developer.code_snippet_theme) {
                setCodeSnippetTheme(settings.developer.code_snippet_theme);
              }              if (settings.developer.webhook_url) {
                setWebhookUrl(settings.developer.webhook_url);
              }
              if (settings.developer.webhook_events) {
                console.log('🔗 Loading webhook events from server:', settings.developer.webhook_events);
                // Handle both old object format and new array format
                if (Array.isArray(settings.developer.webhook_events)) {
                  console.log('🔗 Setting webhook events (array format):', settings.developer.webhook_events);
                  setWebhookEvents(settings.developer.webhook_events);
                } else if (typeof settings.developer.webhook_events === 'object') {
                  // Convert old object format to new array format
                  const selectedEvents = [];
                  if (settings.developer.webhook_events.project) selectedEvents.push('project_updates');
                  if (settings.developer.webhook_events.profile) selectedEvents.push('profile_changes');
                  if (settings.developer.webhook_events.contact) selectedEvents.push('contact_form_submissions');
                  console.log('🔗 Converted webhook events (object to array):', selectedEvents);
                  setWebhookEvents(selectedEvents);
                }
              }
            }
              // Legacy developer settings fallback
            if (settings.githubUsername) {
              setGithubUsername(settings.githubUsername);
            }
            if (settings.developmentEnvironment) {
              console.log('🚀 Setting devEnvironment from legacy field:', settings.developmentEnvironment);
              setDevEnvironment(settings.developmentEnvironment);
              serverProvidedDevEnvironment = true;
            }
            if (settings.codeSnippetTheme) {
              setCodeSnippetTheme(settings.codeSnippetTheme);
            }
            if (settings.webhookUrl) {
              setWebhookUrl(settings.webhookUrl);
            }
            
            // Localization settings
            if (settings.language) {
              setLanguage(settings.language);
            }
            if (settings.timezone) {
              setTimezone(settings.timezone);
            }
            if (settings.dateFormat) {
              setDateFormat(settings.dateFormat);
            }
            if (settings.timeFormat) {
              // Handle time format if needed
            }
            
            // Backup settings
            setAutoBackup(settings.autoBackup === 1);
            if (settings.backupFrequency) {
              setBackupFrequency(settings.backupFrequency);
            }
            
            // Projects settings
            if (settings.defaultProjectSort) {
              setDefaultProjectSort(settings.defaultProjectSort);
            }
            if (settings.projectsPerPage) {
              setProjectsPerPage(settings.projectsPerPage.toString());
            }
          }
          
          // Set preferred tech stack from skills
          if (profileData.skills && profileData.skills.length > 0) {
            const techStackNames = profileData.skills.map(skill => skill.name);
            setPreferredStack(techStackNames);
          }
        }        // Handle settings data response (if it has different structure)
        if (settingsResponse.data && settingsResponse.data.success) {
          const settingsData = settingsResponse.data.data;
          
          // Override with any additional settings from settings endpoint
          if (settingsData && settingsData.settings) {
            const settings = settingsData.settings;
            
            // Handle nested appearance settings
            if (settings.appearance) {
              if (settings.appearance.theme !== undefined) {
                setDarkMode(settings.appearance.theme === 'dark');
              }
              if (settings.appearance.primary_color !== undefined) {
                setPrimaryColor(settings.appearance.primary_color);
              }
              if (settings.appearance.font_size !== undefined) {
                setFontSize(settings.appearance.font_size);
              }
              if (settings.appearance.sidebar_collapsed !== undefined) {
                setSidebarCollapsed(settings.appearance.sidebar_collapsed === 1);
              }
              if (settings.appearance.animations_enabled !== undefined) {
                setAnimationsEnabled(settings.appearance.animations_enabled === 1);
              }
            }
            
            // Handle nested notification settings
            if (settings.notifications) {
              if (settings.notifications.email_notifications !== undefined) {
                setEmailNotifications(settings.notifications.email_notifications === 1);
              }
              if (settings.notifications.push_notifications !== undefined) {
                setPushNotifications(settings.notifications.push_notifications === 1);
              }
              if (settings.notifications.project_updates !== undefined) {
                setNotifyOnProjectUpdate(settings.notifications.project_updates === 1);
              }
              if (settings.notifications.messages !== undefined) {
                setNotifyOnMessage(settings.notifications.messages === 1);
              }
              if (settings.notifications.notification_types) {
                setNotificationTypes(settings.notifications.notification_types);
              }
              if (settings.notifications.quiet_hours) {
                setQuietHoursFrom(settings.notifications.quiet_hours.from || '22:00');
                setQuietHoursTo(settings.notifications.quiet_hours.to || '07:00');
              }
            }
            
            // Handle nested privacy settings
            if (settings.privacy) {
              if (settings.privacy.profile_public !== undefined) {
                setProfilePublic(settings.privacy.profile_public === 1);
                setPortfolioVisibility(settings.privacy.profile_public === 1 ? 'public' : 'private');
              }
              if (settings.privacy.show_email !== undefined) {
                setShowEmail(settings.privacy.show_email === 1);
                setShowCodeSamples(settings.privacy.show_email === 1);
              }
              if (settings.privacy.show_phone !== undefined) {
                setShowPhone(settings.privacy.show_phone === 1);
                setShowProjectMetrics(settings.privacy.show_phone === 1);
              }
              if (settings.privacy.allow_search_engine_indexing !== undefined) {
                setAllowSearchEngineIndexing(settings.privacy.allow_search_engine_indexing === 1);
              }
            }
              // Handle nested security settings
            if (settings.security) {
              if (settings.security.two_factor_enabled !== undefined) {
                setTwoFactorEnabled(settings.security.two_factor_enabled === 1);
              }
              if (settings.security.login_notifications !== undefined) {
                setLoginNotifications(settings.security.login_notifications === 1);
              }
              if (settings.security.session_timeout) {
                setSessionTimeout(settings.security.session_timeout);
              }
              if (settings.security.api_keys_count !== undefined) {
                setApiKeysCount(settings.security.api_keys_count);
              }
              if (settings.security.active_api_keys !== undefined) {
                setActiveApiKeysCount(settings.security.active_api_keys);
              }
              if (settings.security.active_sessions_count !== undefined) {
                setActiveSessionsCount(settings.security.active_sessions_count);
              }
              if (settings.security.last_active_api_key) {
                setLastActiveApiKey(settings.security.last_active_api_key);
              }
              if (settings.security.api_key) {
                setApiKey(settings.security.api_key);
              }
            }
            
            // Handle nested localization settings
            if (settings.localization) {
              if (settings.localization.language) {
                setLanguage(settings.localization.language);
              }
              if (settings.localization.timezone) {
                setTimezone(settings.localization.timezone);
              }
              if (settings.localization.date_format) {
                setDateFormat(mapServerDateFormatToUI(settings.localization.date_format));
              }
              if (settings.localization.time_format) {
                setTimeFormat(settings.localization.time_format);
              }
            }
            
            // Handle nested backup settings
            if (settings.backup) {
              if (settings.backup.auto_backup !== undefined) {
                setAutoBackup(settings.backup.auto_backup === 1);
              }
              if (settings.backup.backup_frequency) {
                setBackupFrequency(settings.backup.backup_frequency);
              }
              if (settings.backup.backup_location) {
                setBackupLocation(settings.backup.backup_location);
              }
              if (settings.backup.last_backup) {
                setLastBackup(settings.backup.last_backup);
              }            }
            
            // Handle nested developer settings
            if (settings.developer) {
              if (settings.developer.github_username) {
                setGithubUsername(settings.developer.github_username);
              }
              if (settings.developer.development_environment) {
                console.log('🚀 Setting devEnvironment from settingsResponse:', settings.developer.development_environment);
                setDevEnvironment(settings.developer.development_environment);
                serverProvidedDevEnvironment = true;
              }
              if (settings.developer.code_editor) {
                setCodeEditor(settings.developer.code_editor);
              }
              if (settings.developer.code_snippet_theme) {
                setCodeSnippetTheme(settings.developer.code_snippet_theme);
              }              if (settings.developer.webhook_url) {
                setWebhookUrl(settings.developer.webhook_url);
              }
              if (settings.developer.webhook_events) {
                // Handle both old object format and new array format
                if (Array.isArray(settings.developer.webhook_events)) {
                  setWebhookEvents(settings.developer.webhook_events);
                } else if (typeof settings.developer.webhook_events === 'object') {
                  // Convert old object format to new array format
                  const selectedEvents = [];
                  if (settings.developer.webhook_events.project) selectedEvents.push('project_updates');
                  if (settings.developer.webhook_events.profile) selectedEvents.push('profile_changes');
                  if (settings.developer.webhook_events.contact) selectedEvents.push('contact_form_submissions');
                  setWebhookEvents(selectedEvents);
                }
              }
            }
            
            // Fallback to old flat structure settings for backward compatibility
            if (!settings.notifications && settings.notifications !== null) {
              if (settings.emailNotifications !== undefined) {
                setEmailNotifications(settings.emailNotifications === 1);
              }
              if (settings.pushNotifications !== undefined) {
                setPushNotifications(settings.pushNotifications === 1);
              }
            }
            if (!settings.appearance && settings.appearance !== null) {
              if (settings.theme !== undefined) {
                setDarkMode(settings.theme === 'dark');
              }
              if (settings.primaryColor !== undefined) {
                setPrimaryColor(settings.primaryColor);
              }
              if (settings.fontSize !== undefined) {
                setFontSize(settings.fontSize);
              }
            }
              // Map featured projects from settings
            if (settings.projects && settings.projects.featured_projects) {
              const featuredProjectsData = settings.projects.featured_projects;
              setProjects(featuredProjectsData);
              setFeaturedProjects(featuredProjectsData.map(p => p.id.toString()));
            }
            
            // Map projects per page from settings
            if (settings.projects && settings.projects.projects_per_page) {
              setProjectsPerPage(settings.projects.projects_per_page.toString());
            }
            
            // Map preferred tech stack from settings
            if (settings.projects && settings.projects.preferred_tech_stack) {
              const techStackNames = settings.projects.preferred_tech_stack.map(tech => tech.name);
              const uniqueTechStack = [...new Set(techStackNames)]; // Remove duplicates
              setPreferredStack(uniqueTechStack);
            }
            
            // Map webhookUrl from developer settings
            if (settings.developer && settings.developer.webhook_url) {
              setWebhookUrl(settings.developer.webhook_url);
            }
          }
        }        // Load additional local settings not covered by API
        const savedSettings = localStorage.getItem('developerSettings');
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            
            // Only use local settings for values not provided by API
            if (!codeSnippetTheme) {
              setCodeSnippetTheme(parsedSettings.codeSnippetTheme || 'vs-code');
            }            if (!socialDisplay) {
              setSocialDisplay(parsedSettings.socialDisplay || 'all');
            }            // IMPORTANT: Don't use localStorage devEnvironment anymore since server should be the source of truth
            // The server provides the correct value, localStorage should not override it
            console.log('ℹ️ Skipping localStorage devEnvironment check - server value takes precedence');
          } catch (error) {
            console.error('Error parsing saved local settings:', error);
          }
        }        // Set fallback default for devEnvironment if neither server nor localStorage provided a value
        if (!serverProvidedDevEnvironment) {
          console.log('🔧 Setting fallback default devEnvironment to vscode');
          setDevEnvironment('vscode');
        } else {
          console.log('✅ devEnvironment already set from server');
        }
        
      } catch (error) {
        console.error('Error fetching settings data:', error);
        setDataError('Failed to load settings. Some features may not work correctly.');
        
        // Fallback to local storage if API fails
        const savedSettings = localStorage.getItem('developerSettings');
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            
            setEmailNotifications(parsedSettings.emailNotifications !== undefined ? parsedSettings.emailNotifications : true);
            setPushNotifications(parsedSettings.pushNotifications !== undefined ? parsedSettings.pushNotifications : true);
            setPortfolioVisibility(parsedSettings.portfolioVisibility || 'public');
            setShowCodeSamples(parsedSettings.showCodeSamples !== undefined ? parsedSettings.showCodeSamples : true);
            setShowProjectMetrics(parsedSettings.showProjectMetrics !== undefined ? parsedSettings.showProjectMetrics : true);
            setAllowProjectComments(parsedSettings.allowProjectComments !== undefined ? parsedSettings.allowProjectComments : true);            if (parsedSettings.preferredStack) {
              setPreferredStack(parsedSettings.preferredStack);
            }            // In error fallback, we won't use localStorage devEnvironment anymore
            // The server should be the source of truth for devEnvironment
            console.log('⚠️ Error fallback: Server failed, but not using localStorage devEnvironment');
          } catch (error) {
            console.error('Error parsing fallback settings:', error);
          }
        }
          // Set fallback default for devEnvironment if server didn't provide a value
        if (!serverProvidedDevEnvironment) {
          console.log('🔧 Error fallback: Setting default devEnvironment to vscode');
          setDevEnvironment('vscode');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setDarkMode, setPrimaryColor, setFontSize]);

  // Create initial settings snapshot for change detection after data loads
  useEffect(() => {
    if (!isLoading && initialSettings === null) {
      const currentSettings = {
        // Appearance
        appearance: {
          theme: darkMode ? 'dark' : 'light',
          primary_color: primaryColor,
          font_size: fontSize,
          sidebar_collapsed: sidebarCollapsed,
          animations_enabled: animationsEnabled
        },
        // Notifications
        notifications: {
          notifications_enabled: notificationsEnabled,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          project_updates: notifyOnProjectUpdate,
          messages: notifyOnMessage,
          notification_types: {
            tasks: notifyOnTasks,
            calendar: notifyOnCalendar,
            security: notifyOnSecurity,
            email_digest: emailDigest,
            ...notificationTypes
          },
          quiet_hours: {
            enabled: quietHoursEnabled,
            from: quietHoursFrom,
            to: quietHoursTo
          }
        },
        // Privacy
        privacy: {
          portfolio_visibility: portfolioVisibility,
          show_code_samples: showCodeSamples,
          show_project_metrics: showProjectMetrics,
          allow_project_comments: allowProjectComments,
          social_display: socialDisplay,
          show_email: showEmail,
          show_phone: showPhone,
          profile_public: profilePublic,
          allow_search_engine_indexing: allowSearchEngineIndexing
        },
        // Security
        security: {
          two_factor_enabled: twoFactorEnabled,
          session_timeout: sessionTimeout,
          login_notifications: loginNotifications,
          api_keys_count: apiKeysCount,
          active_api_keys: activeApiKeysCount,
          active_sessions_count: activeSessionsCount,
          last_active_api_key: lastActiveApiKey,
          api_key: apiKey
        },
        // Localization
        localization: {
          language: language,
          timezone: timezone,
          date_format: dateFormat,
          time_format: timeFormat
        },
        // Backup
        backup: {
          auto_backup: autoBackup,
          backup_frequency: backupFrequency,
          backup_location: backupLocation,
          last_backup: lastBackup,
          last_backup_url: lastBackupUrl,
          last_backup_size: lastBackupSize
        },        // Developer
        developer: {
          github_username: githubUsername,
          development_environment: devEnvironment,
          webhook_url: webhookUrl,
          webhook_events: webhookEvents,
          code_snippet_theme: codeSnippetTheme,
          code_editor: codeEditor,
          preferred_tech_stack: preferredStack
        },
        // Projects
        projects: {
          featured_projects: featuredProjects,
          default_sort: defaultProjectSort,
          projects_per_page: projectsPerPage
        },
        // Profile
        profile: {
          email: email,
          username: username,
          first_name: firstName,
          last_name: lastName,
          professional_title: professionalTitle,
          bio: bio,
          github_profile: githubProfile,
          linkedin_profile: linkedinProfile,
          twitter_profile: twitterProfile
        }
      };
        setInitialSettings(currentSettings);
      setChangeDetector(createSettingsChangeDetector(currentSettings));
    }
  }, [isLoading]); // Only run when loading state changes

  // Track if there are any changes to enable/disable save button
  useEffect(() => {
    if (changeDetector && initialSettings) {
      const currentSettings = {
        // Appearance
        appearance: {
          theme: darkMode ? 'dark' : 'light',
          primary_color: primaryColor,
          font_size: fontSize,
          sidebar_collapsed: sidebarCollapsed,
          animations_enabled: animationsEnabled
        },
        // Notifications
        notifications: {
          notifications_enabled: notificationsEnabled,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          project_updates: notifyOnProjectUpdate,
          messages: notifyOnMessage,
          notification_types: {
            tasks: notifyOnTasks,
            calendar: notifyOnCalendar,
            security: notifyOnSecurity,
            email_digest: emailDigest,
            ...notificationTypes
          },
          quiet_hours: {
            enabled: quietHoursEnabled,
            from: quietHoursFrom,
            to: quietHoursTo
          }
        },
        // Privacy
        privacy: {
          portfolio_visibility: portfolioVisibility,
          show_code_samples: showCodeSamples,
          show_project_metrics: showProjectMetrics,
          allow_project_comments: allowProjectComments,
          social_display: socialDisplay,
          show_email: showEmail,
          show_phone: showPhone,
          profile_public: profilePublic,
          allow_search_engine_indexing: allowSearchEngineIndexing
        },
        // Security
        security: {
          two_factor_enabled: twoFactorEnabled,
          session_timeout: sessionTimeout,
          login_notifications: loginNotifications,
          api_keys_count: apiKeysCount,
          active_api_keys: activeApiKeysCount,
          active_sessions_count: activeSessionsCount,
          last_active_api_key: lastActiveApiKey,
          api_key: apiKey
        },
        // Localization
        localization: {
          language: language,
          timezone: timezone,
          date_format: dateFormat,
          time_format: timeFormat
        },
        // Backup
        backup: {
          auto_backup: autoBackup,
          backup_frequency: backupFrequency,
          backup_location: backupLocation,
          last_backup: lastBackup,
          last_backup_url: lastBackupUrl,
          last_backup_size: lastBackupSize
        },        // Developer
        developer: {
          github_username: githubUsername,
          development_environment: devEnvironment,
          webhook_url: webhookUrl,
          webhook_events: webhookEvents,
          code_snippet_theme: codeSnippetTheme,
          code_editor: codeEditor,
          preferred_tech_stack: preferredStack
        },
        // Projects
        projects: {
          featured_projects: featuredProjects,
          default_sort: defaultProjectSort,
          projects_per_page: projectsPerPage
        },
        // Profile
        profile: {
          email: email,
          username: username,
          first_name: firstName,
          last_name: lastName,
          professional_title: professionalTitle,
          bio: bio,
          github_profile: githubProfile,
          linkedin_profile: linkedinProfile,
          twitter_profile: twitterProfile
        }
      };      const changes = changeDetector.detectChanges(currentSettings);
      const hasAnyChanges = Object.keys(changes).length > 0 || 
                           newPassword.trim() !== '' || 
                           currentPassword.trim() !== '';      console.log('Change Detection Debug:', {
        hasChangeDetector: !!changeDetector,
        hasInitialSettings: !!initialSettings,
        changesDetected: Object.keys(changes).length,
        passwordChanges: newPassword.trim() !== '' || currentPassword.trim() !== '',
        hasAnyChanges
      });
      
      console.log('DETAILED CHANGES:', changes);
      
      // Debug array comparison
      if (changes.developer?.preferred_tech_stack) {
        console.log('PREFERRED STACK COMPARISON:', {
          initial: initialSettings.developer.preferred_tech_stack,
          current: currentSettings.developer.preferred_tech_stack,
          initialLength: initialSettings.developer.preferred_tech_stack?.length,
          currentLength: currentSettings.developer.preferred_tech_stack?.length,
          areEqual: JSON.stringify(initialSettings.developer.preferred_tech_stack) === JSON.stringify(currentSettings.developer.preferred_tech_stack)
        });
      }
      
      if (changes.projects?.featured_projects) {
        console.log('FEATURED PROJECTS COMPARISON:', {
          initial: initialSettings.projects.featured_projects,
          current: currentSettings.projects.featured_projects,
          initialLength: initialSettings.projects.featured_projects?.length,
          currentLength: currentSettings.projects.featured_projects?.length,
          areEqual: JSON.stringify(initialSettings.projects.featured_projects) === JSON.stringify(currentSettings.projects.featured_projects)
        });
      }
      
      setHasChanges(hasAnyChanges);
    } else {
      setHasChanges(false);
    }
  }, [
    changeDetector, initialSettings, darkMode, primaryColor, fontSize, sidebarCollapsed, animationsEnabled,
    notificationsEnabled, emailNotifications, pushNotifications, notifyOnProjectUpdate, notifyOnMessage,
    notifyOnTasks, notifyOnCalendar, notifyOnSecurity, emailDigest, notificationTypes,
    quietHoursEnabled, quietHoursFrom, quietHoursTo, portfolioVisibility, showCodeSamples,
    showProjectMetrics, allowProjectComments, socialDisplay, showEmail, showPhone, profilePublic,
    allowSearchEngineIndexing, twoFactorEnabled, sessionTimeout, loginNotifications, apiKeysCount,
    activeApiKeysCount, activeSessionsCount, lastActiveApiKey, apiKey, language, timezone,
    dateFormat, timeFormat, autoBackup, backupFrequency, backupLocation, lastBackup,
    lastBackupUrl, lastBackupSize, githubUsername, devEnvironment, webhookUrl, codeSnippetTheme,
    codeEditor, preferredStack, featuredProjects, defaultProjectSort, projectsPerPage,
    webhookEvents, email, username, firstName, lastName, professionalTitle, bio,
    githubProfile, linkedinProfile, twitterProfile, newPassword, currentPassword
  ]);
    // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      // Theme settings are now handled by ThemeContext, but we still store them here for consistency
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

  // Handle featured projects selection change
  const handleFeaturedProjectsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map(option => option.value);
    setFeaturedProjects(selectedValues);
  };  // Helper function to format constraint violation messages for better UX
  const formatConstraintError = (errorMessage) => {
    if (errorMessage.includes('backup_frequency')) {
      return 'Invalid backup frequency. Please select: daily, weekly, monthly, or never.';
    }
    if (errorMessage.includes('backup_location')) {
      return 'Invalid backup location. Please select: cloud or local.';
    }
    if (errorMessage.includes('session_timeout')) {
      return 'Session timeout must be between 5 and 10,080 minutes (1 week maximum).';
    }
    if (errorMessage.includes('default_sort')) {
      return 'Invalid sort option. Please select: title, created_at, updated_at, status, priority, or progress.';
    }
    if (errorMessage.includes('projects_per_page')) {
      return 'Invalid projects per page. Please select: 5, 6, 9, 10, 12, 18, 24, or 100.';
    }
    if (errorMessage.includes('theme')) {
      return 'Invalid theme. Please select: light, dark, or system.';
    }
    return 'Invalid data format. Please check your inputs and try again.';
  };
  // Helper function to get user-friendly field names for error messages
  const getUserFriendlyFieldName = (fieldPath) => {
    const fieldMap = {
      'backup.backup_frequency': 'Backup Frequency',
      'backup.backup_location': 'Backup Location',
      'security.session_timeout': 'Session Timeout',
      'projects.default_sort': 'Default Project Sort',
      'projects.projects_per_page': 'Projects Per Page',
      'appearance.theme': 'Theme',
      'appearance.font_size': 'Font Size',
      'notifications.email_notifications': 'Email Notifications',
      'privacy.portfolio_visibility': 'Portfolio Visibility'
    };
    return fieldMap[fieldPath] || fieldPath;
  };

  // Session management functions
  const fetchActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await apiService.sessions.getAll();
      if (response.data && response.data.success) {
        setActiveSessions(response.data.data.sessions || []);
        console.log('✅ Active sessions loaded:', response.data.data.sessions);
      }
    } catch (error) {
      console.error('❌ Failed to fetch active sessions:', error);
      setSaveError('Failed to load active sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchSessionStats = async () => {
    try {
      const response = await apiService.sessions.getStats();
      if (response.data && response.data.success) {
        setSessionStats(response.data.data.stats || {
          totalSessions: 0,
          activeSessions: 0,
          deviceBreakdown: {},
          topLocations: []
        });
        console.log('✅ Session stats loaded:', response.data.data.stats);
      }
    } catch (error) {
      console.error('❌ Failed to fetch session stats:', error);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      const response = await apiService.sessions.terminate(sessionId);
      if (response.data && response.data.success) {
        // Remove session from local state
        setActiveSessions(sessions => sessions.filter(session => session.id !== sessionId));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log('✅ Session terminated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to terminate session:', error);
      setSaveError('Failed to terminate session');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const handleTerminateOtherSessions = async () => {
    try {
      const response = await apiService.sessions.terminateOthers();
      if (response.data && response.data.success) {
        // Keep only current session
        const currentSessionId = localStorage.getItem('sessionId');
        setActiveSessions(sessions => 
          sessions.filter(session => session.id === currentSessionId)
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log('✅ Other sessions terminated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to terminate other sessions:', error);
      setSaveError('Failed to terminate other sessions');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  // Helper function to get device icon based on device type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return FaMobile;
      case 'tablet':
        return FaTabletAlt;
      default:
        return FaDesktop;
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  // Fetch sessions and stats on component mount
  useEffect(() => {
    if (!isLoading) {
      fetchActiveSessions();
      fetchSessionStats();
    }
  }, [isLoading]);

  // Handle form submission with enhanced validation and partial updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Password validation (existing logic)
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!currentPassword) {
          throw new Error('Current password is required to change password');
        }
      }

      // Validate quiet hours timing
      if (quietHoursEnabled && quietHoursFrom && quietHoursTo) {
        const fromTime = new Date(`2000-01-01 ${quietHoursFrom}`);
        const toTime = new Date(`2000-01-01 ${quietHoursTo}`);
        if (fromTime >= toTime) {
          throw new Error('Quiet hours "from" time must be before "to" time');
        }
      }

      // Get current settings state
      const currentSettings = {
        appearance: {
          theme: darkMode ? 'dark' : 'light',
          primary_color: primaryColor,
          font_size: fontSize,
          sidebar_collapsed: sidebarCollapsed,
          animations_enabled: animationsEnabled
        },
        notifications: {
          notifications_enabled: notificationsEnabled,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          project_updates: notifyOnProjectUpdate,
          messages: notifyOnMessage,
          notification_types: {
            tasks: notifyOnTasks,
            calendar: notifyOnCalendar,
            security: notifyOnSecurity,
            email_digest: emailDigest,
            ...notificationTypes
          },
          quiet_hours: {
            enabled: quietHoursEnabled,
            from: quietHoursFrom,
            to: quietHoursTo
          }
        },
        privacy: {
          portfolio_visibility: portfolioVisibility,
          show_code_samples: showCodeSamples,
          show_project_metrics: showProjectMetrics,
          allow_project_comments: allowProjectComments,
          social_display: socialDisplay,
          show_email: showEmail,
          show_phone: showPhone,
          profile_public: profilePublic,
          allow_search_engine_indexing: allowSearchEngineIndexing
        },
        security: {
          two_factor_enabled: twoFactorEnabled,
          session_timeout: sessionTimeout,
          login_notifications: loginNotifications,
          api_keys_count: apiKeysCount,
          active_api_keys: activeApiKeysCount,
          active_sessions_count: activeSessionsCount,
          last_active_api_key: lastActiveApiKey,
          ...(apiKey && apiKey !== import.meta.env.VITE_STRIPE_TEST_KEY && { api_key: apiKey })
        },
        localization: {
          language: language,
          timezone: timezone,
          date_format: dateFormat,
          time_format: timeFormat
        },
        backup: {
          auto_backup: autoBackup,
          backup_frequency: backupFrequency,
          backup_location: backupLocation,
          ...(lastBackup && { last_backup: lastBackup }),
          ...(lastBackupUrl && { last_backup_url: lastBackupUrl }),
          ...(lastBackupSize && { last_backup_size: lastBackupSize })
        },        developer: {
          github_username: githubUsername,
          development_environment: devEnvironment,
          webhook_url: webhookUrl,
          webhook_events: webhookEvents,
          code_snippet_theme: codeSnippetTheme,
          code_editor: codeEditor,
          preferred_tech_stack: preferredStack
        },
        projects: {
          featured_projects: featuredProjects,
          default_sort: defaultProjectSort,
          projects_per_page: parseInt(projectsPerPage)
        }
      };

      console.log('🔗 Webhook events being sent to server:', webhookEvents);
      console.log('📤 Full settings object being sent:', currentSettings);

      // Detect changes using the change detector
      let changedSettings = {};
      if (changeDetector && initialSettings) {
        changedSettings = changeDetector.detectChanges(currentSettings);
        console.log('Detected changes:', changedSettings);
      } else {
        // Fallback to sending all settings if change detection isn't available
        changedSettings = currentSettings;
        console.log('Sending all settings (change detection not available)');
      }

      // Validate the settings data using API validation
      if (Object.keys(changedSettings).length > 0) {
        const validation = validateForAPI(changedSettings);
        if (!validation.valid) {
          const formattedErrors = formatErrorMessages(validation.errors);
          throw new Error(`Settings validation failed: ${formattedErrors.map(e => e.message).join('; ')}`);
        }
      }

      // Prepare profile data if profile fields have changed
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        current_position: professionalTitle,
        bio: bio,
        social_links: {
          github: githubProfile,
          linkedin: linkedinProfile,
          twitter: twitterProfile
        },
        skills: preferredStack.map(tech => ({ name: tech }))
      };

      // Prepare promises array
      const updatePromises = [];

      // Always update profile data (could be enhanced with change detection later)
      updatePromises.push(apiService.profile.update(profileData));

      // Only update settings if there are changes
      if (Object.keys(changedSettings).length > 0) {
        // Transform settings for backend API format
        const transformedSettings = transformForBackend(changedSettings);
        console.log('Sending transformed settings to API:', transformedSettings);
        
        // Use the updateSettings utility function
        const settingsResult = await updateSettings(apiService, transformedSettings, {
          validateBeforeSend: false, // Already validated above
          transformData: false // Already transformed above
        });

        if (!settingsResult.success) {
          throw new Error(settingsResult.error);
        }
      } else {
        console.log('No settings changes detected, skipping settings update');
      }      // Handle password change separately
      if (newPassword) {
        const passwordData = {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        };
        updatePromises.push(apiService.auth.changePassword(passwordData));
      }

      // Execute all updates
      await Promise.all(updatePromises);
      
      // Success - update initial settings for future change detection
      setInitialSettings(currentSettings);
      if (changeDetector) {
        setChangeDetector(createSettingsChangeDetector(currentSettings));
      }
      
      setSaveSuccess(true);
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');        // Update local storage with comprehensive settings
      const localSettings = {
        // Appearance settings
        darkMode,
        primaryColor,
        fontSize,
        sidebarCollapsed,
        animationsEnabled,
        
        // Notification settings
        emailNotifications,
        pushNotifications,
        notifyOnProjectUpdate,
        notifyOnMessage,
        notificationTypes,
        quietHoursFrom,
        quietHoursTo,
        
        // Privacy settings
        portfolioVisibility,
        showCodeSamples,
        showProjectMetrics,
        allowProjectComments,
        showEmail,
        showPhone,
        profilePublic,
        allowSearchEngineIndexing,
        
        // Security settings
        twoFactorEnabled,
        sessionTimeout,
        loginNotifications,
        apiKeysCount,
        
        // Developer settings
        preferredStack,
        devEnvironment,
        codeSnippetTheme,
        socialDisplay,
        githubUsername,
        
        // Localization settings
        language,
        timezone,
        dateFormat,
        timeFormat,
        
        // Backup settings
        autoBackup,
        backupFrequency,
        backupLocation
      };
      localStorage.setItem('developerSettings', JSON.stringify(localSettings));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
        } catch (error) {
      console.error('Error saving settings:', error);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = 'An error occurred while saving settings';
      
      if (error.response?.status === 500 && error.response?.data?.message?.includes('CONSTRAINT')) {
        errorMessage = formatConstraintError(error.response.data.message);
      } else if (error.response?.status === 400) {
        const apiError = error.response.data;
        if (apiError.errors && typeof apiError.errors === 'object') {
          // Handle validation errors with field names
          const fieldErrors = Object.entries(apiError.errors)
            .map(([field, message]) => `${getUserFriendlyFieldName(field)}: ${message}`)
            .join('; ');
          errorMessage = `Validation failed: ${fieldErrors}`;
        } else {
          errorMessage = apiError.message || 'Invalid request data';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };
    // Generate a new API key
  const generateNewApiKey = async () => {
    try {
      setIsSaving(true);
      
      // Call API to generate new key (if endpoint exists)
      // For now, generate a mock key and save it
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'sk_live_';
      for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      setApiKey(result);
      
      // Save the new API key to settings
      const settingsData = {
        security: {
          api_key: result
        }
      };
      
      await apiService.settings.update(settingsData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error generating API key:', error);
      setSaveError('Failed to generate new API key');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };
  // Handle backup now with Firebase Storage
  const handleBackupNow = async () => {
    try {
      setIsSaving(true);
      
      // Gather comprehensive user data for backup
      const [profileResponse, settingsResponse, projectsResponse] = await Promise.all([
        apiService.profile.get().catch(() => ({ data: null })),
        apiService.settings.get().catch(() => ({ data: null })),
        apiService.projects?.list?.().catch(() => ({ data: null }))
      ]);
      
      // Prepare comprehensive backup data
      const backupData = {
        profile: profileResponse.data?.data || null,
        settings: {
          appearance: {
            theme: darkMode ? 'dark' : 'light',
            primary_color: primaryColor,
            font_size: fontSize,
            sidebar_collapsed: sidebarCollapsed,
            animations_enabled: animationsEnabled
          },
          notifications: {
            email_notifications: emailNotifications,
            push_notifications: pushNotifications,
            project_updates: notifyOnProjectUpdate,
            messages: notifyOnMessage,
            notification_types: notificationTypes,
            quiet_hours: { from: quietHoursFrom, to: quietHoursTo }
          },
          privacy: {
            portfolio_visibility: portfolioVisibility,
            show_code_samples: showCodeSamples,
            show_project_metrics: showProjectMetrics,
            allow_project_comments: allowProjectComments,
            social_display: socialDisplay,
            show_email: showEmail,
            show_phone: showPhone,
            profile_public: profilePublic,
            allow_search_engine_indexing: allowSearchEngineIndexing
          },
          security: {
            two_factor_enabled: twoFactorEnabled,
            session_timeout: sessionTimeout,
            login_notifications: loginNotifications,
            api_keys_count: apiKeysCount
          },
          localization: {
            language: language,
            timezone: timezone,
            date_format: dateFormat,
            time_format: timeFormat
          },
          backup: {
            auto_backup: autoBackup,
            backup_frequency: backupFrequency,
            backup_location: backupLocation
          },
          developer: {
            github_username: githubUsername,
            development_environment: devEnvironment,
            webhook_url: webhookUrl,
            code_snippet_theme: codeSnippetTheme,
            preferred_tech_stack: preferredStack
          }
        },
        projects: projectsResponse.data?.data || null,
        metadata: {
          backup_created_at: new Date().toISOString(),
          backup_type: 'manual',
          version: '1.0'
        }
      };

      // Create backup using Firebase Storage
      const firebaseStorageService = (await import('../../services/firebase/storageService')).default;
      const backupResult = await firebaseStorageService.createBackup(backupData, user?.id || 'anonymous');
      
      // Update last backup time
      const now = new Date().toISOString();
      setLastBackup(now);
      
      // Update settings with new backup time and result
      const settingsData = {
        backup: {
          auto_backup: autoBackup ? 1 : 0,
          backup_frequency: backupFrequency,
          backup_location: backupLocation,
          last_backup: now,
          last_backup_url: backupResult.downloadURL,
          last_backup_size: backupResult.size
        }
      };
      
      await apiService.settings.update(settingsData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Backup failed:', error);
      setSaveError('Backup failed: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      setIsSaving(true);
      
      // Call export API endpoint
      const response = await apiService.settings.export(exportFormat);
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: exportFormat === 'json' ? 'application/json' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-data.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setSaveError('Export failed: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
    return (
    <div className="settings-container">
      {/* Data Error Display */}
      {dataError && (
        <div className="data-error-banner">
          <FaExclamationTriangle className="error-icon" />
          <span>{dataError}</span>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading ? (
        <div className="settings-loading">
          <div className="loading-spinner">
            <FaSync className="spinner-icon" />
          </div>
          <p>Loading your settings...</p>
        </div>
      ) : (
        <>
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
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
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
                        checked={dateFormat === 'mdy'}
                        onChange={() => setDateFormat('mdy')}
                      />
                      <label htmlFor="date-mdy">MM/DD/YYYY</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="date-dmy" 
                        name="date-format" 
                        value="dmy"
                        checked={dateFormat === 'dmy'}
                        onChange={() => setDateFormat('dmy')}
                      />
                      <label htmlFor="date-dmy">DD/MM/YYYY</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="date-ymd" 
                        name="date-format" 
                        value="ymd"
                        checked={dateFormat === 'ymd'}
                        onChange={() => setDateFormat('ymd')}
                      />
                      <label htmlFor="date-ymd">YYYY/MM/DD</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Format</label>
                  <div className="toggle-group">
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="time-12" 
                        name="time-format" 
                        value="12"
                        checked={timeFormat === '12'}
                        onChange={() => setTimeFormat('12')}
                      />
                      <label htmlFor="time-12">12-hour (AM/PM)</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="time-24" 
                        name="time-format" 
                        value="24"
                        checked={timeFormat === '24'}
                        onChange={() => setTimeFormat('24')}
                      />
                      <label htmlFor="time-24">24-hour</label>
                    </div>
                  </div>
                  <p className="form-help">Select your preferred time display format</p>
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
                    <select value={defaultProjectSort} onChange={(e) => setDefaultProjectSort(e.target.value)}>
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
                    <select value={projectsPerPage} onChange={(e) => setProjectsPerPage(e.target.value)}>
                      {(() => {
                        const defaultOptions = ['3', '6', '9', '12', 'all'];
                        const currentValue = projectsPerPage.toString();
                        
                        // If current value is not in default options and is a number, add it
                        if (!defaultOptions.includes(currentValue) && !isNaN(currentValue) && currentValue !== 'all') {
                          const numericOptions = defaultOptions.filter(opt => opt !== 'all').map(Number);
                          numericOptions.push(Number(currentValue));
                          numericOptions.sort((a, b) => a - b);
                          
                          return [
                            ...numericOptions.map(num => <option key={num} value={num.toString()}>{num}</option>),
                            <option key="all" value="all">Show All</option>
                          ];
                        }
                        
                        // Return default options
                        return [
                          <option key="3" value="3">3</option>,
                          <option key="6" value="6">6</option>,
                          <option key="9" value="9">9</option>,
                          <option key="12" value="12">12</option>,
                          <option key="all" value="all">Show All</option>
                        ];
                      })()}
                    </select>
                  </div>
                </div>
                  <div className="form-group">
                  <label>Featured Projects</label>
                  <div className="select-wrapper">
                    {loadingProjects ? (
                      <div className="loading-state">
                        <span>Loading projects...</span>
                      </div>
                    ) : (
                      <select 
                        multiple 
                        value={featuredProjects}
                        onChange={handleFeaturedProjectsChange}
                        disabled={projects.length === 0}
                      >
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <option key={project.id} value={project.id.toString()}>
                              {project.title}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No projects available</option>
                        )}
                      </select>
                    )}
                  </div>                  <p className="form-help">
                    These are your currently featured projects. You can unselect projects to remove them from your featured list (Ctrl+click to deselect).
                    {projects.length === 0 && !loadingProjects && (
                      <span className="error-text"> - No featured projects found. Go to Projects page to mark some projects as featured.</span>
                    )}                  </p>
                </div>
              </div>
            </section>

            {/* Privacy Settings */}
            <section className="settings-section">
              <div className="section-header">
                <h2><FaEye /> Privacy</h2>
                <p>Control your personal information visibility</p>
              </div>
              
              <div className="settings-card">
                <div className="form-group">
                  <label>Contact Information</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaEnvelope className="toggle-icon" />
                        <span>Show email address</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setShowEmail(!showEmail)}
                        aria-pressed={showEmail}
                      >
                        {showEmail ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaMobile className="toggle-icon" />
                        <span>Show phone number</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setShowPhone(!showPhone)}
                        aria-pressed={showPhone}
                      >
                        {showPhone ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                  <p className="form-help">Control which contact information is displayed on your portfolio</p>
                </div>

                <div className="form-group">
                  <label>Profile Visibility</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaGlobe className="toggle-icon" />
                        <span>Public profile</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setProfilePublic(!profilePublic)}
                        aria-pressed={profilePublic}
                      >
                        {profilePublic ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaRobot className="toggle-icon" />
                        <span>Allow search engine indexing</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setAllowSearchEngineIndexing(!allowSearchEngineIndexing)}
                        aria-pressed={allowSearchEngineIndexing}
                      >
                        {allowSearchEngineIndexing ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                  <p className="form-help">Control how your profile appears in search results</p>
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
                    </div>                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="codeEditor">Code Editor</label>
                  <input 
                    type="text" 
                    id="codeEditor" 
                    value={codeEditor} 
                    onChange={(e) => setCodeEditor(e.target.value)} 
                    placeholder="e.g., Visual Studio Code 1.85.0"
                  />
                  <p className="form-help">Specific version and details of your code editor</p>
                </div>
                
                <div className="form-group">
                  <label>Code Snippet Theme</label>
                  <div className="select-wrapper">
                    <select value={codeSnippetTheme} onChange={(e) => setCodeSnippetTheme(e.target.value)}>
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
                  <label>Master Notification Control</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaBell className="toggle-icon" />
                        <span>Enable all notifications</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        aria-pressed={notificationsEnabled}
                      >
                        {notificationsEnabled ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                  <p className="form-help">Master toggle to enable or disable all notifications</p>
                </div>

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
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaComments className="toggle-icon" />
                        <span>Comments</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotificationTypes(prev => ({ ...prev, comments: !prev.comments }))}
                        aria-pressed={notificationTypes.comments}
                      >
                        {notificationTypes.comments ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaNetworkWired className="toggle-icon" />
                        <span>Collaborations</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotificationTypes(prev => ({ ...prev, collaborations: !prev.collaborations }))}
                        aria-pressed={notificationTypes.collaborations}
                      >
                        {notificationTypes.collaborations ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                      <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaCog className="toggle-icon" />
                        <span>System updates</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotificationTypes(prev => ({ ...prev, system_updates: !prev.system_updates }))}
                        aria-pressed={notificationTypes.system_updates}
                      >
                        {notificationTypes.system_updates ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaChartBar className="toggle-icon" />
                        <span>Task updates</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotifyOnTasks(!notifyOnTasks)}
                        aria-pressed={notifyOnTasks}
                      >
                        {notifyOnTasks ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaDesktop className="toggle-icon" />
                        <span>Calendar events</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotifyOnCalendar(!notifyOnCalendar)}
                        aria-pressed={notifyOnCalendar}
                      >
                        {notifyOnCalendar ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaShieldAlt className="toggle-icon" />
                        <span>Security alerts</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setNotifyOnSecurity(!notifyOnSecurity)}
                        aria-pressed={notifyOnSecurity}
                      >
                        {notifyOnSecurity ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                    
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaEnvelope className="toggle-icon" />
                        <span>Daily email digest</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setEmailDigest(!emailDigest)}
                        aria-pressed={emailDigest}
                      >
                        {emailDigest ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                </div>                  <div className="form-group">
                  <label>Quiet Hours</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaBell className="toggle-icon" />
                        <span>Enable quiet hours</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                        aria-pressed={quietHoursEnabled}
                      >
                        {quietHoursEnabled ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                  
                  {quietHoursEnabled && (
                    <div className="time-range">
                      <div className="time-input">
                        <label>From</label>
                        <input 
                          type="time" 
                          value={quietHoursFrom} 
                          onChange={(e) => setQuietHoursFrom(e.target.value)} 
                        />
                      </div>
                      <div className="time-input">
                        <label>To</label>
                        <input 
                          type="time" 
                          value={quietHoursTo} 
                          onChange={(e) => setQuietHoursTo(e.target.value)} 
                        />
                      </div>
                    </div>
                  )}
                  <p className="form-help">
                    {quietHoursEnabled 
                      ? "No notifications will be sent during these hours" 
                      : "Enable quiet hours to set notification-free time periods"
                    }
                  </p>
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
                  <h3>{firstName} {lastName}</h3>
                  <p>{professionalTitle || 'Full Stack Developer'}</p>
                  
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
                  <input 
                    type="text" 
                    value={professionalTitle} 
                    onChange={(e) => setProfessionalTitle(e.target.value)} 
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
                
                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    rows="4" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description for your portfolio homepage"
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
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaShieldAlt className="toggle-icon" />
                        <span>Enable 2FA</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        aria-pressed={twoFactorEnabled}
                      >
                        {twoFactorEnabled ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>
                  <p className="form-help">Add an extra layer of security to your account</p>
                </div>

                <div className="form-group">
                  <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    id="sessionTimeout" 
                    value={sessionTimeout} 
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    min="5"
                    max="480"
                    step="5"
                  />
                  <p className="form-help">Automatically log out after this period of inactivity</p>
                </div>

                <div className="form-group">
                  <label>Login Notifications</label>
                  <div className="toggle-switch-group">
                    <div className="toggle-switch-item">
                      <div className="toggle-label">
                        <FaBell className="toggle-icon" />
                        <span>Notify me of new logins</span>
                      </div>
                      <button 
                        type="button"
                        className="toggle-switch"
                        onClick={() => setLoginNotifications(!loginNotifications)}
                        aria-pressed={loginNotifications}
                      >
                        {loginNotifications ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                      </button>
                    </div>
                  </div>                  <p className="form-help">Get notified when someone logs into your account</p>
                </div>
                  <div className="form-group">
                  <label>Security Monitoring</label>
                  <div className="security-stats">
                    <div className="security-stat-item">
                      <div className="security-stat-label">Active API Keys</div>
                      <div className="security-stat-value">{activeApiKeysCount}</div>
                    </div>
                    <div className="security-stat-item">
                      <div className="security-stat-label">Active Sessions</div>
                      <div className="security-stat-value">{sessionStats.activeSessions || activeSessionsCount}</div>
                    </div>
                    {sessionStats.totalSessions > 0 && (
                      <div className="security-stat-item">
                        <div className="security-stat-label">Total Sessions</div>
                        <div className="security-stat-value">{sessionStats.totalSessions}</div>
                      </div>
                    )}                    {lastActiveApiKey && (
                      <div className="security-stat-item">
                        <div className="security-stat-label">Last Active API Key</div>
                        <div className="security-stat-value">
                          {typeof lastActiveApiKey === 'object' ? lastActiveApiKey.name || lastActiveApiKey.id : lastActiveApiKey}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Device breakdown */}
                  {Object.keys(sessionStats.deviceBreakdown || {}).length > 0 && (
                    <div className="device-breakdown">
                      <h4>Devices</h4>
                      <div className="device-stats">
                        {Object.entries(sessionStats.deviceBreakdown).map(([deviceType, count]) => (
                          <div key={deviceType} className="device-stat">
                            <span className="device-type">{deviceType}</span>
                            <span className="device-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Top locations */}
                  {sessionStats.topLocations && sessionStats.topLocations.length > 0 && (
                    <div className="location-breakdown">
                      <h4>Top Locations</h4>
                      <div className="location-stats">
                        {sessionStats.topLocations.slice(0, 3).map((location, index) => (
                          <div key={index} className="location-stat">
                            <span className="location-name">{location.location}</span>
                            <span className="location-count">{location.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="form-help">Monitor your account's security status</p>
                </div>
                  <div className="form-group">
                  <label>Active Sessions</label>
                  {loadingSessions ? (
                    <div className="session-loading">
                      <FaSync className="spinner-icon spinning" />
                      <span>Loading sessions...</span>
                    </div>
                  ) : activeSessions.length > 0 ? (
                    <div className="session-list">
                      {activeSessions.map((session) => {
                        const currentSessionId = localStorage.getItem('sessionId');
                        const isCurrentSession = session.id === currentSessionId;
                        const DeviceIcon = getDeviceIcon(session.device_type);
                        
                        return (
                          <div key={session.id} className={`session-item ${isCurrentSession ? 'current' : ''}`}>
                            <div className="session-info">
                              <div className="session-device">
                                <DeviceIcon className="device-icon" />
                                <div className="device-details">
                                  <h4>{session.browser} on {session.device_name || session.os}</h4>
                                  <p>{session.location || 'Unknown Location'} • {session.ip_address || 'Unknown IP'}</p>
                                </div>
                              </div>
                              <div className="session-time">
                                <span>
                                  {isCurrentSession 
                                    ? 'Current session' 
                                    : `Active ${formatRelativeTime(session.last_activity)}`
                                  }
                                </span>
                              </div>
                            </div>
                            {!isCurrentSession && (
                              <button 
                                type="button" 
                                className="btn-outline danger"
                                onClick={() => handleTerminateSession(session.id)}
                              >
                                <FaSignOutAlt /> Logout
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="session-empty">
                      <p>No active sessions found</p>
                    </div>
                  )}
                  
                  {activeSessions.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-outline danger"
                      onClick={handleTerminateOtherSessions}
                    >
                      <FaSignOutAlt /> Logout of all other sessions
                    </button>
                  )}
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
                </div>                  <div className="form-group">
                  <label>Webhook Events</label>
                  <p className="form-help">Select which events should trigger webhook notifications</p>
                  <div className="webhook-events-grid">
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-push" 
                        checked={webhookEvents.includes('push')}
                        onChange={(e) => {
                          const event = 'push';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-push">Push events</label>
                    </div>
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-pull-request" 
                        checked={webhookEvents.includes('pull_request')}
                        onChange={(e) => {
                          const event = 'pull_request';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-pull-request">Pull requests</label>
                    </div>
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-issues" 
                        checked={webhookEvents.includes('issues')}
                        onChange={(e) => {
                          const event = 'issues';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-issues">Issues</label>
                    </div>
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-project-updates" 
                        checked={webhookEvents.includes('project_updates')}
                        onChange={(e) => {
                          const event = 'project_updates';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-project-updates">Project updates</label>
                    </div>
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-profile-changes" 
                        checked={webhookEvents.includes('profile_changes')}
                        onChange={(e) => {
                          const event = 'profile_changes';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-profile-changes">Profile changes</label>
                    </div>
                    <div className="webhook-event-item">
                      <input 
                        type="checkbox" 
                        id="event-contact-form" 
                        checked={webhookEvents.includes('contact_form_submissions')}
                        onChange={(e) => {
                          const event = 'contact_form_submissions';
                          setWebhookEvents(prev => 
                            e.target.checked 
                              ? [...prev.filter(ev => ev !== event), event]
                              : prev.filter(ev => ev !== event)
                          );
                        }}
                      />
                      <label htmlFor="event-contact-form">Contact form submissions</label>
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
              
              <div className="settings-card">                <div className="form-group">
                  <label className="social-label">
                    <FaGithub className="social-icon github" />
                    GitHub
                  </label>
                  <div className="social-input">
                    <input 
                      type="text" 
                      value={githubProfile || ''} 
                      onChange={(e) => {
                        setGithubProfile(e.target.value);
                      }}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
                  <div className="form-group">
                  <label className="social-label">
                    <FaLinkedin className="social-icon linkedin" />
                    LinkedIn
                  </label>
                  <div className="social-input">
                    <input 
                      type="text" 
                      value={linkedinProfile || ''} 
                      onChange={(e) => {
                        setLinkedinProfile(e.target.value);
                      }}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                  <div className="form-group">
                  <label className="social-label">
                    <FaTwitter className="social-icon twitter" />
                    Twitter
                  </label>
                  <div className="social-input">
                    <input 
                      type="text" 
                      value={twitterProfile || ''} 
                      onChange={(e) => {
                        setTwitterProfile(e.target.value);
                      }}
                      placeholder="https://twitter.com/username"
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
                        checked={socialDisplay === 'all'}
                        onChange={() => setSocialDisplay('all')}
                      />
                      <label htmlFor="social-all">All Pages</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-home" 
                        name="social-display" 
                        value="home"
                        checked={socialDisplay === 'home'}
                        onChange={() => setSocialDisplay('home')}
                      />
                      <label htmlFor="social-home">Home Page Only</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-contact" 
                        name="social-display" 
                        value="contact"
                        checked={socialDisplay === 'contact'}
                        onChange={() => setSocialDisplay('contact')}
                      />
                      <label htmlFor="social-contact">Contact Page Only</label>
                    </div>
                    <div className="toggle-option">
                      <input 
                        type="radio" 
                        id="social-none" 
                        name="social-display" 
                        value="none"
                        checked={socialDisplay === 'none'}
                        onChange={() => setSocialDisplay('none')}
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
                  <label>Backup Location</label>
                  <div className="select-wrapper">
                    <select 
                      value={backupLocation} 
                      onChange={(e) => setBackupLocation(e.target.value)}
                    >
                      <option value="firebase">Firebase Storage</option>
                      <option value="local">Local Storage</option>
                      <option value="cloud">Cloud Storage</option>
                    </select>
                  </div>
                  <p className="form-help">Choose where your backups are stored</p>
                </div>
                  <div className="form-group">
                  <label>Manual Backup</label>
                  <div className="backup-info">
                    <div className="backup-details">
                      <div className="backup-date">
                        <FaHistory className="backup-icon" />
                        <span>Last backup: {lastBackup ? formatDate(lastBackup) : 'Never'}</span>
                      </div>
                      {lastBackupSize && (
                        <div className="backup-size">
                          <span>Size: {formatFileSize(lastBackupSize)}</span>
                        </div>
                      )}
                      {lastBackupUrl && (
                        <div className="backup-download">
                          <a href={lastBackupUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                            <FaCloudDownloadAlt /> Download Last Backup
                          </a>
                        </div>
                      )}
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
                        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="xml">XML</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={handleExportData}>
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
              </button>              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSaving || !hasChanges}
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
        )}      </AnimatePresence>
      
      {/* Debug Helper for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          left: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '4px', 
          fontSize: '12px',
          zIndex: 1000
        }}>
          <details>
            <summary style={{ cursor: 'pointer' }}>Settings Debug</summary>
            <div style={{ marginTop: '8px' }}>
              <div>Changes Detected: {changeDetector && initialSettings ? 
                Object.keys(changeDetector.detectChanges({
                  appearance: { theme: darkMode ? 'dark' : 'light' },
                  notifications: { email_notifications: emailNotifications }
                })).length : 'N/A'}</div>
              <div>Initial Settings: {initialSettings ? 'Loaded' : 'Not Set'}</div>
              <div>Change Detector: {changeDetector ? 'Ready' : 'Not Set'}</div>
              <div>API Validation: Available</div>
              <div>PUT Integration: Active</div>
            </div>
          </details>
        </div>
      )}
      
      <style>{`
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
        
        /* Session Loading */
        .session-loading {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .session-loading .spinner-icon {
          animation: spin 1s linear infinite;
        }
        
        .session-empty {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--gray-500);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        /* Device and Location Breakdown */
        .device-breakdown,
        .location-breakdown {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
        }
        
        .device-breakdown h4,
        .location-breakdown h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--gray-700);
        }
        
        .device-stats,
        .location-stats {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .device-stat,
        .location-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
        }
        
        .device-type,
        .location-name {
          color: var(--gray-700);
        }
        
        .device-count,
        .location-count {
          color: var(--gray-500);
          font-weight: 500;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        
        /* Webhook Events Grid */
        .webhook-events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: repeat(3, auto);
          gap: var(--spacing-md);
          margin-top: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .webhook-event-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          transition: var(--transition-fast);
        }
        
        .webhook-event-item:hover {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
        
        .webhook-event-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--primary-color);
          cursor: pointer;
        }
        
        .webhook-event-item label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          margin: 0;
          flex: 1;
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
        
        .social-input input {
          width: 100%;
          padding: var(--spacing-md);
        }
        
        .social-input input::placeholder {
          color: var(--gray-400);
          opacity: 1;
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
        
        /* Loading State */
        .loading-state {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--gray-500);
          font-style: italic;
        }
        
        /* Error Text */
        .error-text {
          color: var(--danger-color);
          font-weight: 500;
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
        
        /* New UI Elements Styles */
        
        /* Master Notification Toggle */
        .notification-master-toggle {
          padding: var(--spacing-lg);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          margin-bottom: var(--spacing-lg);
        }
        
        .notification-master-toggle .toggle-label {
          font-weight: 600;
          color: var(--gray-900);
        }
        
        /* Security Statistics */
        .security-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        
        .security-stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .security-stat-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-color);
          color: var(--white);
          border-radius: var(--border-radius);
          font-size: 1.2em;
        }
        
        .security-stat-details h4 {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--gray-600);
          font-weight: 500;
        }
        
        .security-stat-details .stat-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        /* Backup Details */
        .backup-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }
        
        .backup-detail-item {
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .backup-detail-item h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-sm);
          color: var(--gray-600);
          font-weight: 500;
        }
        
        .backup-detail-item .detail-value {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-900);
          margin: 0;
        }
        
        .backup-download-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .backup-download-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
        
        /* Quiet Hours Conditional Display */
        .quiet-hours-details {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .quiet-hours-disabled {
          opacity: 0.6;
          pointer-events: none;
        }
        
        /* Extended Notification Types */
        .notification-types-extended {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        
        /* Code Editor Input */
        .code-editor-input {
          margin-top: var(--spacing-md);
        }
        
        .code-editor-input label {
          display: block;
          font-weight: 500;
          margin-bottom: var(--spacing-sm);
          color: var(--gray-800);
        }
        
        .code-editor-input input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-base);
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
          
          .webhook-events-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
          }
          
          .webhook-event-item {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
      </>
      )}
    </div>
  );
};

export default Settings;
