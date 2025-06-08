import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaProjectDiagram, 
  FaUser, 
  FaBriefcase, 
  FaGraduationCap, 
  FaEdit, 
  FaPlus, 
  FaCode, 
  FaGithub, 
  FaExternalLinkAlt, 
  FaCalendarAlt, 
  FaEye, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisV,
  FaBell,
  FaInfo,
  FaLightbulb,
  FaCog,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaRocket,
  FaLayerGroup,
  FaClipboardList,
  FaTasks,
  FaRegClock,
  FaCodeBranch,  FaDownload,
  FaShareAlt,
  FaChartArea,
  FaInfoCircle,
  FaCalendarPlus,
  FaMapMarkerAlt,
  FaClock,
  FaCommentAlt,
  FaUpload
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '../../utils/formatters';
import { truncateText } from '../../utils/formatters';
import apiService from '../../services/api/apiService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  // Get authentication state from context
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
    visitors: 0,
    profileViews: 0
  });
  
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
    // Deadline filtering states
  const [deadlineFilters, setDeadlineFilters] = useState({
    days: 30,
    limit: 10,
    priority: 'all',
    type: 'all',
    status: 'all'
  });

  // Activity filtering states
  const [activityFilters, setActivityFilters] = useState({
    limit: 10,
    activity_type: 'all'
  });const [analyticsData, setAnalyticsData] = useState({
    weeklyVisits: [0, 0, 0, 0, 0, 0, 0],
    skillDistribution: [],
    projectCategories: []
  });
  
  const notificationRef = useRef(null);
  const dashboardRef = useRef(null);
  const searchRef = useRef(null);
  
  // Check for dark mode preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (dashboardRef.current) {
        setShowScrollTop(dashboardRef.current.scrollTop > 300);
      }
    };
    
    const dashboardElement = dashboardRef.current;
    if (dashboardElement) {
      dashboardElement.addEventListener('scroll', handleScroll);
      return () => dashboardElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (searchRef.current && !searchRef.current.contains(event.target) && searchQuery === '') {
        searchRef.current.classList.remove('expanded');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for auth context to load
      if (authLoading) {
        return;
      }

      setIsLoading(true);
      try {
        // Check authentication state from context
        if (!isLoggedIn || !user) {
          throw new Error('User not authenticated');
        }

        // Ensure we have a valid token
        const accessToken = localStorage.getItem('access_token');
        const authToken = localStorage.getItem('authToken');
        
        if (!accessToken && !authToken) {
          throw new Error('No authentication token found');
        }// Call the actual dashboard overview API endpoint
        const response = await apiService.dashboard.getOverview();
        
        if (response.data && response.data.success) {
          const data = response.data.data.overview; // Fix: Access the overview object
          
          // Map API response to component state - fixed mapping
          setStats({
            projects: data.projects?.total || 0,
            skills: data.skills?.total || 0,
            experience: data.experience?.total || 0,
            education: data.education?.total || 0,
            visitors: data.portfolioTraffic?.thisWeek?.totalVisitors || 0,
            profileViews: data.portfolioTraffic?.thisWeek?.profileViews || 0
          });
          
          // Map recent projects from API response
          if (data.recentActivity?.projects) {
            setRecentProjects(data.recentActivity.projects.map(project => ({
              id: project.id,
              title: project.title,
              description: project.description,
              updatedAt: project.updatedAt,
              image: project.image || '/assets/pro.jpg',
              status: project.status,
              technologies: project.technologies || [],
              progress: project.progressPercentage || 0,
              github: project.github,
              live: project.liveUrl,
              stars: project.stars || 0,
              forks: project.forks || 0
            })));          }

          // Note: Upcoming deadlines are now fetched separately via dedicated endpoint
          
          // Map upcoming events from new API format
          if (data.upcomingEvents && data.upcomingEvents.length > 0) {
            setUpcomingEvents(data.upcomingEvents.slice(0, 6).map(event => ({
              id: event.id,
              title: event.title || event.name,
              description: event.description,
              startDateTime: event.start_datetime,
              endDateTime: event.end_datetime,
              date: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString() : 'TBD',
              time: event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
              location: event.location || 'TBD',
              type: event.event_type || 'event',
              isAllDay: event.is_all_day
            })));          }
          
          // Note: Recent activities are now fetched separately via dedicated endpoint
          
          // Map analytics data if available
          if (data.portfolioTraffic) {
            setAnalyticsData(prevData => ({
              ...prevData,
              weeklyVisits: data.portfolioTraffic.dailyVisitors || prevData.weeklyVisits,
              totalVisitors: data.portfolioTraffic.thisWeek?.totalVisitors || prevData.totalVisitors
            }));
          }          // Map skill distribution - limit to top 5 categories
          if (data.skills?.distribution) {
            // Sort by count/percentage and take top 5
            const sortedSkills = data.skills.distribution
              .sort((a, b) => (b.count || b.percentage || 0) - (a.count || a.percentage || 0))
              .slice(0, 5); // Limit to top 5
            
            setAnalyticsData(prevData => ({
              ...prevData,
              skillDistribution: sortedSkills.map(skill => ({
                name: skill.category,
                value: skill.percentage || skill.count || 0,
                count: skill.count || 0
              }))
            }));
          }

          // Map project categories
          if (data.projectCategories) {
            setAnalyticsData(prevData => ({
              ...prevData,
              projectCategories: data.projectCategories.map(category => ({
                name: category.category,
                count: category.count || 0
              }))
            }));
          }        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          // The AuthContext will handle token refresh automatically via interceptors
        }
        
        // Fallback to empty/zero data if API fails
        setStats({
          projects: 0,
          skills: 0,
          experience: 0,
          education: 0,
          visitors: 0,
          profileViews: 0
        });        setRecentProjects([]);
        setNotifications([]);
        // Note: upcomingDeadlines and recentActivities handled by separate endpoints
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, authLoading, user]);  // Fetch upcoming deadlines from dedicated endpoint
  const fetchUpcomingDeadlines = async (filters = deadlineFilters) => {
    try {
      // Prepare query parameters
      const params = {
        days: filters.days,
        limit: filters.limit
      };
      
      // Call the endpoint with query parameters
      const response = await apiService.dashboard.getUpcomingDeadlines(params);
      
      if (response.data && response.data.success && response.data.data && response.data.data.deadlines) {
        let deadlines = response.data.data.deadlines;
        
        // Apply client-side filters
        if (filters.priority !== 'all') {
          deadlines = deadlines.filter(deadline => deadline.priority === filters.priority);
        }
        
        if (filters.type !== 'all') {
          deadlines = deadlines.filter(deadline => deadline.type === filters.type);
        }
        
        if (filters.status !== 'all') {
          deadlines = deadlines.filter(deadline => deadline.status === filters.status);
        }
        
        // Map the API response to match component's expected data structure
        const mappedDeadlines = deadlines.map(deadline => ({
          id: deadline.id,
          project: deadline.title || 'Project', // Use title as project name
          task: deadline.description || deadline.title, // Use description as task
          deadline: deadline.deadline,
          priority: deadline.priority || 'medium',
          type: deadline.type, // project or event
          status: deadline.status,
          location: deadline.location,
          progress: deadline.progress
        }));
        
        setUpcomingDeadlines(mappedDeadlines);
      }
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      // Keep existing deadlines on error to avoid breaking the UI
    }
  };
  // Add useEffect to fetch deadlines separately
  useEffect(() => {
    if (isLoggedIn && user && !authLoading) {
      fetchUpcomingDeadlines();
    }
  }, [isLoggedIn, user, authLoading]);

  // Handle deadline filter changes
  const handleDeadlineFilterChange = (filterType, value) => {
    const newFilters = { ...deadlineFilters, [filterType]: value };
    setDeadlineFilters(newFilters);
    fetchUpcomingDeadlines(newFilters);
  };    // Helper function to get activity icons
  const getActivityIcon = (type, action = '') => {
    // Handle activity types from the new API format
    switch (type) {
      case 'project':
        if (action === 'updated') return 'FaProjectDiagram';
        if (action === 'created') return 'FaPlus';
        return 'FaProjectDiagram';
      case 'task':
        if (action === 'updated') return 'FaTasks';
        if (action === 'completed') return 'FaCheckCircle';
        return 'FaTasks';
      case 'event':
        if (action === 'scheduled') return 'FaCalendarAlt';
        return 'FaCalendarAlt';      case 'comment':
        return 'FaCommentAlt';
      case 'file_upload':
        return 'FaUpload';
      case 'other':
        return 'FaUpload';
      // Legacy support for existing activity types
      case 'project_completed':
      case 'task_completed':
      case 'success':
        return 'FaCheckCircle';
      case 'github_push':
      case 'code_commit':
        return 'FaGithub';
      case 'project_created':
      case 'new_project':
        return 'FaPlus';
      case 'skill_added':
      case 'profile_updated':
        return 'FaCode';
      case 'deadline_approaching':
      case 'warning':
        return 'FaExclamationTriangle';
      default:
        return 'FaInfoCircle';
    }
  };
  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    
    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    } else {
      return past.toLocaleDateString();
    }
  };

  // Helper function to format deadline countdown
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffInMs = deadlineDate - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return 'Overdue';
    } else if (diffInDays === 0) {
      return 'Due today';
    } else if (diffInDays === 1) {
      return 'Due tomorrow';
    } else if (diffInDays <= 7) {
      return `${diffInDays} days left`;
    } else if (diffInDays <= 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week left' : `${weeks} weeks left`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month left' : `${months} months left`;
    }
  };
  
  // Define color mapping for skill categories
  const getSkillCategoryColor = (category) => {
    const colorMap = {
      'Backend': 'var(--secondary-color)',      // Green
      'DevOps': 'var(--accent-color)',          // Orange
      'Frontend': 'var(--primary-color)',       // Blue
      'Other': 'var(--gray-500)',               // Gray
      'Language': 'var(--info-color)',          // Light Blue
      'Soft Skills': 'var(--warning-color)',    // Yellow
      'Tools': 'var(--danger-color)',           // Red
      'Mobile': 'var(--success-color)',         // Dark Green
      'Database': '#8b5cf6',                    // Purple
      'Framework': '#ec4899'                    // Pink
    };
    
    return colorMap[category] || 'var(--gray-400)';
  };

  // Generate dynamic stroke-dasharray for donut segments
  const generateDonutSegments = (skillDistribution) => {
    if (!skillDistribution || skillDistribution.length === 0) {
      return [];
    }

    let cumulativeOffset = 25; // Starting offset
    return skillDistribution.map((skill, index) => {
      const percentage = skill.value;
      const dashArray = `${percentage} ${100 - percentage}`;
      const dashOffset = cumulativeOffset;
      cumulativeOffset += percentage;
      
      return {
        ...skill,
        dashArray,
        dashOffset,
        color: getSkillCategoryColor(skill.name)
      };
    });
  };

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    
    if (diffMonth > 0) {
      return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
    // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'in-progress':
        return <FaHourglassHalf className="status-icon in-progress" />;
      case 'planning':
        return <FaExclamationTriangle className="status-icon planning" />;
      default:
        return null;
    }
  };
  
  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  // Scroll to top
  const scrollToTop = () => {
    if (dashboardRef.current) {
      dashboardRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Expand search on focus
  const expandSearch = () => {
    if (searchRef.current) {
      searchRef.current.classList.add('expanded');
    }
  };
  
  // Filter projects based on search query
  const filteredProjects = searchQuery 
    ? recentProjects.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recentProjects;
  
  // Fetch recent activity from dedicated endpoint
  const fetchRecentActivity = async (filters = activityFilters) => {
    try {
      // Prepare query parameters
      const params = {
        limit: filters.limit
      };
      
      // Only add activity_type if it's not 'all'
      if (filters.activity_type !== 'all') {
        params.activity_type = filters.activity_type;
      }
      
      // Call the endpoint with query parameters
      const response = await apiService.dashboard.getRecentActivity(params);
      
      if (response.data && response.data.success && response.data.data && response.data.data.activities) {
        const activities = response.data.data.activities;
        
        // Map the API response to match component's expected data structure
        const mappedActivities = activities.map(activity => ({
          id: activity.id,
          type: activity.type || 'info',
          action: activity.action,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp || new Date().toISOString(),
          metadata: activity.metadata,
          icon: getActivityIcon(activity.type, activity.action)
        }));
        
        setRecentActivities(mappedActivities);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Keep existing activities on error to avoid breaking the UI
    }
  };

  // Add useEffect to fetch activities separately
  useEffect(() => {
    if (isLoggedIn && user && !authLoading) {
      fetchRecentActivity();
    }
  }, [isLoggedIn, user, authLoading]);

  // Handle activity filter changes
  const handleActivityFilterChange = (filterType, value) => {
    const newFilters = { ...activityFilters, [filterType]: value };
    setActivityFilters(newFilters);
    fetchRecentActivity(newFilters);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3 className="loading-text">Loading dashboard data...</h3>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" ref={dashboardRef}>        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {user?.profile?.firstName || 'User'}!</h1>
            <p>Here's an overview of your portfolio and recent activities.</p>
          </div>
          <div className="welcome-actions">
            <Link to="/projects/new" className="btn-gradient">
              <FaPlus /> New Project
            </Link>
            <Link to="/profile" className="btn-outline">
              <FaUser /> View Profile
            </Link>
          </div>
        </div>
        
        <div className="dashboard-stats">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="stat-icon projects">
              <FaProjectDiagram />
            </div>
            <div className="stat-info">
              <h3>{stats.projects}</h3>
              <p>Projects</p>
            </div>
            <div className="stat-action">
              <Link to="/projects" className="action-link">View All</Link>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: '80%' }}></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="stat-icon skills">
              <FaCode />
            </div>
            <div className="stat-info">
              <h3>{stats.skills}</h3>
              <p>Skills</p>
            </div>
            <div className="stat-action">
              <Link to="/profile" className="action-link">Update</Link>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: '65%' }}></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="stat-icon experience">
              <FaBriefcase />
            </div>
            <div className="stat-info">
              <h3>{stats.experience}</h3>
              <p>Experience</p>
            </div>
            <div className="stat-action">
              <Link to="/profile" className="action-link">Manage</Link>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: '50%' }}></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="stat-icon education">
              <FaGraduationCap />
            </div>
            <div className="stat-info">
              <h3>{stats.education}</h3>
              <p>Education</p>
            </div>
            <div className="stat-action">
              <Link to="/profile" className="action-link">Manage</Link>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: '90%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Analytics Overview Section */}
        <div className="analytics-overview">
          <div className="analytics-card visitors">
            <div className="analytics-header">
              <h3><FaChartLine /> Portfolio Traffic</h3>
              <div className="analytics-period">
                <select defaultValue="week">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="analytics-content">
              <div className="analytics-summary">
                <div className="summary-item">
                  <h4>{formatNumber(stats.visitors)}</h4>
                  <p>Total Visitors</p>
                  <span className="trend positive">+12.5% <FaArrowUp /></span>
                </div>
                <div className="summary-item">
                  <h4>{formatNumber(stats.profileViews)}</h4>
                  <p>Profile Views</p>
                  <span className="trend positive">+8.3% <FaArrowUp /></span>
                </div>
                <div className="summary-item">
                  <h4>4:25</h4>
                  <p>Avg. Time</p>
                  <span className="trend negative">-2.1% <FaArrowDown /></span>
                </div>
              </div>
              <div className="analytics-chart">
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {analyticsData.weeklyVisits.map((value, index) => (
                      <div key={index} className="chart-bar" style={{ height: `${(value / Math.max(...analyticsData.weeklyVisits)) * 100}%` }}>
                        <span className="bar-tooltip">{value} visits</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div className="analytics-card skills-distribution">
            <div className="analytics-header">
              <h3><FaChartPie /> Skills Distribution</h3>
              <span className="analytics-subtitle">Top 5 Categories</span>
            </div>
            <div className="analytics-content">
              <div className="skills-chart">
                <div className="donut-chart">
                  <svg viewBox="0 0 36 36" className="donut">
                    <circle className="donut-ring" cx="18" cy="18" r="15.91549" />
                    {generateDonutSegments(analyticsData.skillDistribution).map((segment, index) => (
                      <circle
                        key={index}
                        className={`donut-segment ${segment.name.toLowerCase().replace(/\s+/g, '-')}`}
                        cx="18"
                        cy="18"
                        r="15.91549"
                        style={{
                          strokeDasharray: segment.dashArray,
                          strokeDashoffset: segment.dashOffset,
                          stroke: segment.color
                        }}
                      />
                    ))}
                  </svg>
                  <div className="donut-text">
                    <h4>{stats.skills}</h4>
                    <p>Skills</p>
                  </div>
                </div>
                <div className="skills-legend">
                  {analyticsData.skillDistribution.map((skill, index) => (
                    <div key={index} className={`legend-item ${skill.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span 
                        className="legend-color" 
                        style={{ backgroundColor: getSkillCategoryColor(skill.name) }}
                      ></span>
                      <span className="legend-label">{skill.name}</span>
                      <span className="legend-value">{skill.value}%</span>
                      {skill.count && (
                        <span className="legend-count">({skill.count})</span>
                      )}
                    </div>
                  ))}
                  {analyticsData.skillDistribution.length === 0 && (
                    <div className="empty-state">
                      <p>No skill data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="analytics-card project-categories">
            <div className="analytics-header">
              <h3><FaLayerGroup /> Project Categories</h3>
            </div>
            <div className="analytics-content">
              <div className="categories-list">
                {analyticsData.projectCategories.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <span className="category-count">{category.count} projects</span>
                    </div>
                    <div className="category-bar">
                      <div className="category-progress" style={{ width: `${(category.count / stats.projects) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-sections">
          <div className="dashboard-section projects-section">
            <div className="section-headers">
              <h3><FaRocket /> Recent Projects</h3>
              <Link to="/projects/new" className="btn-outline">
                <FaPlus /> Add New
              </Link>
            </div>
            
            <div className="recent-projects">
              {filteredProjects.length === 0 ? (
                <div className="empty-list">
                  <FaProjectDiagram className="empty-icon" />
                  <p>{searchQuery ? 'No projects match your search' : 'No projects added yet'}</p>
                  <Link to="/projects/new" className="btn-outline">Add Your First Project</Link>
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredProjects.map((project, index) => (
                    <motion.div 
                      key={project.id} 
                      className="project-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                    >
                      <div className="project-image">
                        <img src={project.image} alt={project.title} />
                        <div className="project-status">
                          {getStatusIcon(project.status)}
                          <span>{project.status.replace('-', ' ')}</span>
                        </div>
                        <div className="project-overlay">
                          <div className="project-actions">
                            <Link to={`/projects/${project.id}/edit`} className="btn-icon" title="Edit Project">
                              <FaEdit />
                            </Link>
                            
                            {project.github && (
                              <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View on GitHub">
                                <FaGithub />
                              </a>
                            )}
                            
                            {project.live && (
                              <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View Live Site">
                                <FaExternalLinkAlt />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="project-details">
                        <div className="project-info-details">
                          <h4>{project.title}</h4>
                          <p>{truncateText(project.description, 80)}</p>
                          
                          <div className="project-tech-stack">
                            {project.technologies.map((tech, index) => (
                              <span key={index} className="tech-badge">{tech}</span>
                            ))}
                          </div>
                          
                          <div className="project-progress">
                            <div className="progress-label">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress-value" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="project-meta">
                            <div className="project-stats">
                              <div className="stat">
                                <FaStar />
                                <span>{project.stars}</span>
                              </div>
                              <div className="stat">
                                <FaCodeBranch />
                                <span>{project.forks}</span>
                              </div>
                            </div>
                            <span className="update-time">
                              Updated {formatRelativeTime(project.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {filteredProjects.length > 0 && !searchQuery && (
              <div className="view-all-container">
                <Link to="/projects" className="view-all-link">
                  View all projects <FaExternalLinkAlt />
                </Link>
              </div>
            )}
          </div>
          <div className="dashboard-section deadlines-section">
            <div className="section-headers">
              <h3><FaRegClock /> Upcoming Deadlines</h3>
              <div className="deadline-filters">
                <select 
                  value={deadlineFilters.days} 
                  onChange={(e) => handleDeadlineFilterChange('days', parseInt(e.target.value))}
                  className="filter-select"
                  title="Days ahead"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                </select>
                
                <select 
                  value={deadlineFilters.priority} 
                  onChange={(e) => handleDeadlineFilterChange('priority', e.target.value)}
                  className="filter-select"
                  title="Priority"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select 
                  value={deadlineFilters.type} 
                  onChange={(e) => handleDeadlineFilterChange('type', e.target.value)}
                  className="filter-select"
                  title="Type"
                >
                  <option value="all">All Types</option>
                  <option value="project">Projects</option>
                  <option value="event">Events</option>
                </select>
                
                <Link to="/tasks/new" className="btn-outline">
                  <FaPlus /> Add Task
                </Link>
              </div>
            </div>
              <div className="deadlines-list">
              {upcomingDeadlines.length === 0 ? (
                <div className="empty-list">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No upcoming deadlines</p>
                  <Link to="/tasks/new" className="btn-outline">Add Your First Task</Link>
                </div>
              ) : (
                <div className={`deadlines-grid ${upcomingDeadlines.length > 6 ? 'scrollable' : ''}`}>
                  {upcomingDeadlines.slice(0, 6).map((deadline, index) => (
                    <motion.div 
                      key={deadline.id} 
                      className={`deadline-item ${getPriorityClass(deadline.priority)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                    >                      <div className="deadline-info">
                        <h4>{deadline.project}</h4>
                        <p>{deadline.task}</p>
                        <div className="deadline-meta">
                          <span className={`type-badge type-${deadline.type}`}>
                            {deadline.type === 'project' ? <FaProjectDiagram /> : <FaCalendarAlt />}
                            {deadline.type}
                          </span>
                          {deadline.location && (
                            <span className="location-info">
                              <FaMapMarkerAlt /> {deadline.location}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="deadline-time">
                        <div className="deadline-date">
                          <FaCalendarAlt />
                          <span>{new Date(deadline.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="deadline-countdown">
                          {formatDeadline(deadline.deadline)}
                        </div>
                      </div>
                      
                      <div className="deadline-actions">
                        <button className="btn-icon" title="Mark as Complete">
                          <FaCheckCircle />
                        </button>
                        <button className="btn-icon" title="Edit Task">
                          <FaEdit />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>          
          </div>
          
          <div className="dashboard-section events-section">
            <div className="section-headers">
              <h3><FaCalendarPlus /> Upcoming Events</h3>
              <Link to="/calendar" className="btn-outline">
                <FaPlus /> Add Event
              </Link>
            </div>
            
            <div className="events-list">
              {upcomingEvents.length === 0 ? (
                <div className="empty-list">
                  <FaCalendarPlus className="empty-icon" />
                  <p>No upcoming events</p>
                  <Link to="/calendar" className="btn-outline">Schedule Your First Event</Link>
                </div>
              ) : (
                <div className={`events-grid ${upcomingEvents.length > 6 ? 'scrollable' : ''}`}>
                  {upcomingEvents.slice(0, 6).map((event, index) => (
                    <motion.div 
                      key={event.id} 
                      className="event-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                    >                      <div className="event-info">
                        <h4>{event.title}</h4>
                        {event.description && (
                          <p className="event-description">{event.description}</p>
                        )}
                        <p className="event-location">
                          <FaMapMarkerAlt /> {event.location}
                        </p>
                      </div>
                      
                      <div className="event-time">
                        <div className="event-date">
                          <FaCalendarAlt />
                          <span>{event.date}</span>
                        </div>
                        {!event.isAllDay && event.time && (
                          <div className="event-time-info">
                            <FaClock />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.isAllDay && (
                          <div className="event-time-info">
                            <FaClock />
                            <span>All Day</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="event-actions">
                        <button className="btn-icon" title="View Details">
                          <FaEye />
                        </button>
                        <button className="btn-icon" title="Edit Event">
                          <FaEdit />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-section quick-actions-section">
            <div className="section-headers">
              <h3><FaLightbulb /> Quick Actions</h3>
            </div>
            
            <div className="quick-actions">
              <motion.div 
                className="action-card"
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="action-icon">
                  <FaUser />
                </div>
                <div className="action-content">
                  <h4>Edit Profile</h4>
                  <p>Update your personal and professional information</p>
                  <Link to="/profile" className="action-link">Update Profile</Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="action-card"
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="action-icon">
                  <FaPlus />
                </div>
                <div className="action-content">
                  <h4>Add New Project</h4>
                  <p>Showcase your latest work in your portfolio</p>
                  <Link to="/projects/new" className="action-link">Create Project</Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="action-card"
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="action-icon">
                  <FaProjectDiagram />
                </div>
                <div className="action-content">
                  <h4>Manage Projects</h4>
                  <p>Edit, update or remove your existing projects</p>
                  <Link to="/projects" className="action-link">View Projects</Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="action-card"
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="action-icon">
                  <FaCode />
                </div>
                <div className="action-content">
                  <h4>Update Skills</h4>
                  <p>Add or update your technical skills and expertise</p>
                  <Link to="/profile" className="action-link">Manage Skills</Link>
                </div>
              </motion.div>
            </div>
          </div>            
          <div className="dashboard-section activity-section">
            <div className="section-headers">
              <h3><FaChartLine /> Recent Activity</h3>
              <div className="filter-controls">
                <select 
                  value={activityFilters.limit} 
                  onChange={(e) => handleActivityFilterChange('limit', parseInt(e.target.value))}
                  className="filter-select"
                >
                  <option value={5}>Last 5</option>
                  <option value={10}>Last 10</option>
                  <option value={20}>Last 20</option>
                  <option value={50}>Last 50</option>
                </select>                <select 
                  value={activityFilters.activity_type} 
                  onChange={(e) => handleActivityFilterChange('activity_type', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="project">Projects</option>
                  <option value="task">Tasks</option>
                  <option value="event">Events</option>
                  <option value="comment">Comments</option>
                  <option value="file_upload">File Uploads</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
              <div className="activity-timeline">
              {recentActivities.length === 0 ? (
                <div className="empty-state">
                  <FaInfoCircle />
                  <p>No recent activities found</p>
                </div>
              ) : (
                <div className={`timeline-container ${recentActivities.length > 6 ? 'scrollable' : ''}`}>
                  {recentActivities.slice(0, 6).map((activity, index) => (
                    <div key={activity.id} className="timeline-item">
                      <div className="timeline-icon">
                        {activity.icon === 'FaCheckCircle' && <FaCheckCircle />}
                        {activity.icon === 'FaGithub' && <FaGithub />}
                        {activity.icon === 'FaPlus' && <FaPlus />}
                        {activity.icon === 'FaCode' && <FaCode />}
                        {activity.icon === 'FaExclamationTriangle' && <FaExclamationTriangle />}
                        {activity.icon === 'FaProjectDiagram' && <FaProjectDiagram />}
                        {activity.icon === 'FaTasks' && <FaTasks />}
                        {activity.icon === 'FaCalendarAlt' && <FaCalendarAlt />}
                        {activity.icon === 'FaCommentAlt' && <FaCommentAlt />}
                        {activity.icon === 'FaUpload' && <FaUpload />}
                        {(!activity.icon || activity.icon === 'FaInfoCircle') && <FaInfoCircle />}
                      </div>
                      <div className="timeline-content">
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className="timeline-time">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* New Section: Portfolio Export */}
          <div className="dashboard-section export-section">
            <div className="section-headers">
              <h3><FaDownload /> Export Portfolio</h3>
            </div>
            
            <div className="export-options">
              <div className="export-option">
                <div className="export-icon">
                  <FaDownload />
                </div>
                <div className="export-content">
                  <h4>Download as PDF</h4>
                  <p>Get a printable version of your portfolio</p>
                  <button className="export-btn">Export PDF</button>
                </div>
              </div>
              
              <div className="export-option">
                <div className="export-icon">
                  <FaShareAlt />
                </div>
                <div className="export-content">
                  <h4>Share Portfolio</h4>
                  <p>Get a shareable link to your public portfolio</p>
                  <button className="export-btn">Generate Link</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-footer">
          <p>&copy; {new Date().getFullYear()} DevAdmin. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      
      {showScrollTop && (
        <motion.button 
          className="scroll-top-btn" 
          onClick={scrollToTop} 
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp />
        </motion.button>
      )}
      
      <style>{`
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
          --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
          
          /* Transitions */
          --transition: all 0.3s ease;
          --transition-fast: all 0.15s ease;
          --transition-slow: all 0.5s ease;
          
          /* Gradients */
          --gradient-primary: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          --gradient-secondary: linear-gradient(135deg, var(--secondary-color), var(--secondary-dark));
          --gradient-accent: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
          --gradient-success: linear-gradient(135deg, var(--success-color), #059669);
          --gradient-danger: linear-gradient(135deg, var(--danger-color), #dc2626);
          --gradient-blue: linear-gradient(135deg, #3b82f6, #1d4ed8);
          --gradient-purple: linear-gradient(135deg, #8b5cf6, #6d28d9);
          --gradient-pink: linear-gradient(135deg, #ec4899, #be185d);
          
          /* Spacing */
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 1.5rem;
          --spacing-xl: 2rem;
          --spacing-2xl: 3rem;
          --spacing-3xl: 4rem;
          
          /* Font Sizes */
          --text-xs: 0.75rem;
          --text-sm: 0.875rem;
          --text-base: 1rem;
          --text-lg: 1.125rem;
          --text-xl: 1.25rem;
          --text-2xl: 1.5rem;
          --text-3xl: 1.875rem;
          --text-4xl: 2.25rem;
          
          /* Layout */
          --header-height: 70px;
          --content-max-width: 1400px;
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
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: var(--gray-100);
          color: var(--gray-800);
          line-height: 1.5;
          transition: var(--transition);
        }
        
        a {
          text-decoration: none;
          color: inherit;
        }
        
        button {
          cursor: pointer;
          background: none;
          border: none;
          outline: none;
        }
        
        ul {
          list-style: none;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Loading Screen */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: var(--gradient-primary);
          color: var(--white);
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          font-size: var(--text-xl);
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        
        .loading-progress {
          width: 200px;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: var(--border-radius-full);
          overflow: hidden;
          position: relative;
        }
        
        .loading-progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: var(--white);
          border-radius: var(--border-radius-full);
          animation: progress 2s ease-in-out infinite;
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        /* Dashboard Layout */
        .dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        
        /* Main Content */
        .dashboard-container {
          flex: 1;
          padding: var(--spacing-xl);
          max-width: 100%;
          overflow-y: auto;
          max-height: 100vh;
          scrollbar-width: thin;
          scrollbar-color: var(--gray-400) transparent;
        }
        
        .dashboard-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .dashboard-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .dashboard-container::-webkit-scrollbar-thumb {
          background-color: var(--gray-400);
          border-radius: 3px;
        }
        
        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }
        
        .header-left h2 {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        /* Search Box */
        .search-box {
          position: relative;
          width: 250px;
          transition: var(--transition);
        }
        
        .search-box.expanded, .search-box.active {
          width: 300px;
        }
        
        .search-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: var(--text-sm);
          pointer-events: none;
        }
        
        .search-box input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-md) * 2 + 1em);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius-full);
          background-color: var(--white);
          font-size: var(--text-sm);
          transition: var(--transition);
        }
        
        .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .clear-search {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: var(--text-lg);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        
        .clear-search:hover {
          color: var(--gray-700);
        }
        
        /* Notification */
        .notification-wrapper {
          position: relative;
        }
        
        .notification-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--gray-100);
          color: var(--gray-700);
          transition: var(--transition-fast);
          position: relative;
        }
        
        .notification-btn:hover {
          background-color: var(--gray-200);
          color: var(--primary-color);
        }
        
        .notification-btn.has-unread {
          color: var(--primary-color);
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--danger-color);
          color: var(--white);
          font-size: var(--text-xs);
          width: 18px;
          height: 18px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
          border: 1px solid var(--gray-200);
        }
        
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .notifications-header h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .mark-read-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: var(--text-xs);
          cursor: pointer;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          transition: var(--transition-fast);
        }
        
        .mark-read-btn:hover {
          background-color: var(--gray-100);
        }
        
        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--gray-200);
          transition: var(--transition-fast);
        }
        
        .notification-item:last-child {
          border-bottom: none;
        }
        
        .notification-item.unread {
          background-color: rgba(79, 70, 229, 0.05);
        }
        
        .notification-item:hover {
          background-color: var(--gray-100);
        }
        
        .notification-icon {
          margin-right: var(--spacing-md);
          font-size: var(--text-xl);
          margin-top: var(--spacing-xs);
        }
        
        .notification-item.info .notification-icon {
          color: var(--info-color);
        }
        
        .notification-item.success .notification-icon {
          color: var(--success-color);
        }
        
        .notification-item.warning .notification-icon {
          color: var(--warning-color);
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-content p {
          margin-bottom: var(--spacing-xs);
          color: var(--gray-800);
          font-size: var(--text-sm);
        }
        
        .notification-time {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        .empty-notifications {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--gray-500);
        }
        
        .empty-icon {
          font-size: var(--text-3xl);
          margin-bottom: var(--spacing-md);
          opacity: 0.5;
        }
        
        .notifications-footer {
          padding: var(--spacing-md);
          text-align: center;
          border-top: 1px solid var(--gray-200);
        }
        
        .view-all-link {
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .view-all-link:hover {
          text-decoration: underline;
        }
        
        /* User Menu */
        .user-menu {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          transition: var(--transition-fast);
        }
        
        .user-menu:hover {
          background-color: var(--gray-100);
        }

                .user-avatar-small {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          margin-right: var(--spacing-sm);
          object-fit: cover;
        }
        
        .user-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--gray-800);
        }
        
        /* Theme Toggle Button */
        .theme-toggle-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--gray-100);
          color: var(--gray-700);
          transition: var(--transition-fast);
        }
        
        .theme-toggle-btn:hover {
          background-color: var(--gray-200);
        }
        
        .dark-mode .theme-toggle-btn {
          color: var(--yellow-400);
        }
        
        /* Welcome Section */
        .dashboard-welcome {
          background: var(--gradient-primary);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
          color: var(--white);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-md);
        }
        
        .welcome-content h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
        }
        
        .welcome-content p {
          font-size: var(--text-base);
          opacity: 0.9;
        }
        
        .welcome-actions {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .btn-gradient {
          background: var(--white);
          color: var(--primary-color);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--border-radius);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
          box-shadow: var(--shadow);
        }
        
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .btn-outline {
          background: var(--white);
          color: var(--primary-color);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--border-radius);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
          box-shadow: var(--shadow);
        }
        
        .btn-outline:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        /* Stats Section */
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .stat-card {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          padding: var(--spacing-lg);
          display: flex;
          align-items: center;
          position: relative;
          transition: var(--transition);
          border: 1px solid var(--gray-200);
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: var(--transition);
        }
        
        .stat-card:hover::before {
          opacity: 1;
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          margin-right: var(--spacing-md);
        }
        
        .stat-icon.projects {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(55, 48, 163, 0.1));
          color: var(--primary-color);
        }
        
        .stat-icon.skills {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          color: var(--secondary-color);
        }
        
        .stat-icon.experience {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
          color: var(--accent-color);
        }
        
        .stat-icon.education {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1));
          color: var(--info-color);
        }
        
        .stat-info {
          flex: 1;
        }
        
        .stat-info h3 {
          font-size: var(--text-3xl);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 700;
        }
        
        .stat-info p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-action {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
        }
        
        .action-link {
          font-size: var(--text-xs);
          color: var(--primary-color);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .action-link:hover {
          text-decoration: underline;
        }
        
        .stat-progress {
          position: absolute;
          bottom: var(--spacing-md);
          left: var(--spacing-md);
          right: var(--spacing-md);
        }
        
        .progress-bar {
          height: 4px;
          background-color: var(--gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }
        
        .progress-value {
          height: 100%;
          border-radius: var(--border-radius-full);
        }
        
        .stat-card:nth-child(1) .progress-value {
          background: var(--gradient-primary);
        }
        
        .stat-card:nth-child(2) .progress-value {
          background: var(--gradient-secondary);
        }
        
        .stat-card:nth-child(3) .progress-value {
          background: var(--gradient-accent);
        }
        
        .stat-card:nth-child(4) .progress-value {
          background: var(--gradient-blue);
        }
        
        /* Analytics Overview */
        .analytics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .analytics-card {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          padding: var(--spacing-lg);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
        }
        
        .analytics-card:hover {
          box-shadow: var(--shadow-md);
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
          .analytics-header h3 {
          font-size: var(--text-lg);
          color: var(--gray-900);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .analytics-subtitle {
          font-size: var(--text-xs);
          color: var(--gray-500);
          font-weight: 400;
          margin-left: var(--spacing-sm);
        }
        
        .analytics-period select {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-300);
          font-size: var(--text-xs);
          background-color: var(--white);
          color: var(--gray-700);
        }
        
        .analytics-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-item h4 {
          font-size: var(--text-2xl);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 700;
        }
        
        .summary-item p {
          color: var(--gray-600);
          font-size: var(--text-xs);
          margin-bottom: var(--spacing-xs);
        }
        
        .trend {
          font-size: var(--text-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        
        .trend.positive {
          color: var(--success-color);
        }
        
        .trend.negative {
          color: var(--danger-color);
        }
        
        .analytics-chart {
          height: 200px;
          position: relative;
        }
        
        .chart-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chart-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 180px;
          padding-bottom: var(--spacing-sm);
        }
        
        .chart-bar {
          width: 30px;
          background: var(--gradient-primary);
          border-radius: var(--border-radius) var(--border-radius) 0 0;
          position: relative;
          transition: var(--transition);
        }
        
        .chart-bar:hover {
          opacity: 0.8;
        }
        
        .bar-tooltip {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--gray-800);
          color: var(--white);
          padding: 2px 6px;
          border-radius: var(--border-radius);
          font-size: var(--text-xs);
          white-space: nowrap;
          opacity: 0;
          transition: var(--transition);
        }
        
        .chart-bar:hover .bar-tooltip {
          opacity: 1;
        }
        
        .chart-labels {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        /* Skills Distribution */
        .skills-chart {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .donut-chart {
          position: relative;
          width: 180px;
          height: 180px;
        }
        
        .donut {
          width: 100%;
          height: 100%;
        }
        
        .donut-ring {
          fill: transparent;
          stroke: var(--gray-200);
          stroke-width: 3;
        }
        
        .donut-segment {
          fill: transparent;
          stroke-width: 3;
          stroke-linecap: round;
        }
        
        .donut-segment.frontend {
          stroke: var(--primary-color);
        }
        
        .donut-segment.backend {
          stroke: var(--secondary-color);
        }
        
        .donut-segment.devops {
          stroke: var(--accent-color);
        }
        
        .donut-segment.mobile {
          stroke: var(--info-color);
        }
        
        .donut-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .donut-text h4 {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0;
        }
        
        .donut-text p {
          font-size: var(--text-xs);
          color: var(--gray-600);
        }
        
        .skills-legend {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: var(--border-radius-sm);
        }
        
        .legend-item.frontend .legend-color {
          background-color: var(--primary-color);
        }
        
        .legend-item.backend .legend-color {
          background-color: var(--secondary-color);
        }
        
        .legend-item.devops .legend-color {
          background-color: var(--accent-color);
        }
        
        .legend-item.mobile .legend-color {
          background-color: var(--info-color);
        }
        
        .legend-label {
          flex: 1;
          color: var(--gray-700);
        }
          .legend-value {
          font-weight: 600;
          color: var(--gray-900);
        }

        .legend-count {
          font-size: var(--text-xs);
          color: var(--gray-500);
          margin-left: var(--spacing-xs);
        }

        /* Empty States */
        .empty-state {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--gray-500);
        }

        .empty-state p {
          font-size: var(--text-sm);
          margin: 0;
        }
        
        /* Project Categories */
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .category-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .category-info h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .category-count {
          font-size: var(--text-xs);
          color: var(--gray-600);
        }
        
        .category-bar {
          height: 8px;
          background-color: var(--gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }
        
        .category-progress {
          height: 100%;
          border-radius: var(--border-radius-full);
          background: var(--gradient-primary);
        }
        
        /* Dashboard Sections */
        .dashboard-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-xl);
        }
        
        .dashboard-section {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          padding: var(--spacing-lg);
          border: 1px solid var(--gray-200);
          margin-bottom: var(--spacing-xl);
        }
        
        .section-headers {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        
        .section-headers h3 {
          font-size: var(--text-lg);
          color: var(--gray-900);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .section-headers h3 svg {
          color: var(--primary-color);
        }

        .deadlines-section .section-headers h3 svg{
          font-size: 2.25rem;
          color: var(--primary-color);
        }
        
        .btn-primary {
          background: var(--gradient-primary);
          color: var(--white);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--border-radius);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
          box-shadow: var(--shadow);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        /* Projects Section */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }
        
        .project-card {
          background-color: var(--white);
          border-radius: var(--border-radius);
          overflow: hidden;
          border: 1px solid var(--gray-200);
          transition: var(--transition);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .project-image {
          position: relative;
          height: 160px;
          overflow: hidden;
        }
        
        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        
        .project-card:hover .project-image img {
          transform: scale(1.05);
        }
        
        .project-status {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: var(--border-radius);
          padding: var(--spacing-xs) var(--spacing-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: capitalize;
          box-shadow: var(--shadow-sm);
        }
        
        .status-icon {
          font-size: var(--text-sm);
        }
        
        .status-icon.completed {
          color: var(--success-color);
        }
        
        .status-icon.in-progress {
          color: var(--warning-color);
        }
        
        .status-icon.planning {
          color: var(--info-color);
        }
        
        .project-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
        }
        
        .project-card:hover .project-overlay {
          opacity: 1;
        }
        
        .project-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--white);
          color: var(--gray-800);
          transition: var(--transition-fast);
          font-size: var(--text-base);
        }
        
        .btn-icon:hover {
          background-color: var(--primary-color);
          color: var(--white);
          transform: translateY(-2px);
        }
        
        .project-details {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        
        .project-info-details {
          flex: 1;
        }
        
        .project-info-details h4 {
          font-size: var(--text-lg);
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
          font-weight: 600;
        }
        
        .project-info-details p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-md);
          line-height: 1.5;
        }
        
        .project-tech-stack {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
        }
        
        .tech-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        
        .project-progress {
          margin-bottom: var(--spacing-md);
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--gray-700);
        }
        
        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        .project-stats {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .update-time {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        .view-all-container {
          margin-top: var(--spacing-lg);
          text-align: center;
        }
        
        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .view-all-link:hover {
          text-decoration: underline;
        }
          /* Deadlines Section */
        .deadlines-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .deadline-filters {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }
        
        .filter-select {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          font-size: var(--text-sm);
          color: var(--gray-700);
          cursor: pointer;
          transition: var(--transition-fast);
          min-width: 100px;
        }
        
        .filter-select:hover {
          border-color: var(--primary-color);
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
        
        .deadline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border-left: 4px solid var(--gray-400);
          transition: var(--transition);
        }
        
        .deadline-item.priority-high {
          border-left-color: var(--danger-color);
        }
        
        .deadline-item.priority-medium {
          border-left-color: var(--warning-color);
        }
        
        .deadline-item.priority-low {
          border-left-color: var(--info-color);
        }
        
        .deadline-info {
          flex: 1;
        }
        
        .deadline-info h4 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }
        
        .deadline-info p {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .deadline-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xs);
        }
        
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: 2px var(--spacing-xs);
          border-radius: var(--border-radius);
          font-size: var(--text-xs);
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .type-badge.type-project {
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
        }
        
        .type-badge.type-event {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-color);
        }
        
        .location-info {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        .deadline-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--spacing-xs);
          margin-right: var(--spacing-md);
        }
        
        .deadline-date {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--gray-600);
        }
        
        .deadline-countdown {
          font-size: var(--text-xs);
          font-weight: 600;
        }
        
        .deadline-countdown .text-warning {
          color: var(--warning-color);
        }
        
        .deadline-countdown .text-danger {
          color: var(--danger-color);
        }
        
        .deadline-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        /* Quick Actions Section */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-md);
        }
        
        .action-card {
          background-color: var(--white);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          margin-bottom: var(--spacing-md);
          background: var(--gradient-primary);
          color: var(--white);
        }
        
        .action-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .action-content h4 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }
        
        .action-content p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-md);
          flex: 1;
        }
        
        .action-link {
          align-self: flex-start;
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .action-link:hover {
          text-decoration: underline;
        }
        
        /* Activity Timeline */
        .activity-timeline {
          position: relative;
          padding-left: var(--spacing-lg);
        }
        
        .activity-timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 7px;
          width: 2px;
          background-color: var(--gray-200);
        }
        
        .timeline-item {
          position: relative;
          padding-bottom: var(--spacing-lg);
        }
        
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        
        .timeline-icon {
          position: absolute;
          left: -30px;
          top: 0;
          width: 16px;
          height: 16px;
          border-radius: var(--border-radius-full);
          background-color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 8px;
        }
        
        .timeline-content {
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          position: relative;
        }
        
        .timeline-content::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 8px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid var(--gray-50);
        }
        
        .timeline-content h4 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }
        
        .timeline-content p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-xs);
        }
          .timeline-time {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }
        
        /* Scrollable containers */
        .timeline-container.scrollable,
        .deadlines-grid.scrollable,
        .events-grid.scrollable {
          max-height: auto;
          overflow-y: auto;
          padding-right: var(--spacing-xs);
        }
        
        .timeline-container.scrollable::-webkit-scrollbar,
        .deadlines-grid.scrollable::-webkit-scrollbar,
        .events-grid.scrollable::-webkit-scrollbar {
          width: 6px;
        }
        
        .timeline-container.scrollable::-webkit-scrollbar-track,
        .deadlines-grid.scrollable::-webkit-scrollbar-track,
        .events-grid.scrollable::-webkit-scrollbar-track {
          background: var(--gray-100);
          border-radius: 3px;
        }
        
        .timeline-container.scrollable::-webkit-scrollbar-thumb,
        .deadlines-grid.scrollable::-webkit-scrollbar-thumb,
        .events-grid.scrollable::-webkit-scrollbar-thumb {
          background: var(--gray-400);
          border-radius: 3px;
        }
        
        .timeline-container.scrollable::-webkit-scrollbar-thumb:hover,
        .deadlines-grid.scrollable::-webkit-scrollbar-thumb:hover,
        .events-grid.scrollable::-webkit-scrollbar-thumb:hover {
          background: var(--gray-500);
        }
        
        /* Events Section */
        .events-section {
          background-color: var(--white);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow);
          padding: var(--spacing-lg);
          border: 1px solid var(--gray-200);
        }
        
        .events-grid {
          display: grid;
          gap: var(--spacing-md);
        }
        
        .event-item {
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .event-item:hover {
          background-color: var(--white);
          box-shadow: var(--shadow-sm);
        }
        
        .event-info {
          flex: 1;
        }
          .event-info h4 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }
        
        .event-description {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-xs);
          line-height: 1.4;
        }
        
        .event-location {
          color: var(--gray-600);
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-xs);
        }
        
        .event-time {
          margin: 0 var(--spacing-md);
          text-align: center;
        }
        
        .event-date,
        .event-time-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--gray-600);
          margin-bottom: var(--spacing-xs);
        }
        
        .event-date:last-child,
        .event-time-info:last-child {
          margin-bottom: 0;
        }
        
        .event-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        /* Export Section */
        .export-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-md);
        }
        
        .export-option {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          background-color: var(--white);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
        }
        
        .export-option:hover {
          box-shadow: var(--shadow-md);
        }
        
        .export-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          background: var(--gradient-primary);
          color: var(--white);
        }
        
        .export-content {
          flex: 1;
        }
        
        .export-content h4 {
          font-size: var(--text-base);
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }
        
        .export-content p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .export-btn {
          background: var(--gradient-primary);
          color: var(--white);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--border-radius);
          font-weight: 500;
          font-size: var(--text-sm);
          transition: var(--transition);
        }
        
        .export-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        
        /* Empty States */
        .empty-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--gray-500);
        }
        
        .empty-icon {
          font-size: var(--text-4xl);
          margin-bottom: var(--spacing-md);
          opacity: 0.5;
        }
        
        .empty-list p {
          margin-bottom: var(--spacing-md);
          font-size: var(--text-base);
        }
        
        /* Footer */
        .dashboard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg) 0;
          border-top: 1px solid var(--gray-200);
          margin-top: var(--spacing-xl);
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .footer-links {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .footer-links a {
          color: var(--gray-600);
          transition: var(--transition-fast);
        }
        
        .footer-links a:hover {
          color: var(--primary-color);
        }
        
        /* Scroll to Top Button */
        .scroll-top-btn {
          position: fixed;
          bottom: var(--spacing-lg);
          right: var(--spacing-lg);
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-full);
          background: var(--gradient-primary);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          z-index: 40;
          border: none;
          cursor: pointer;
        }
        
        /* Mobile Sidebar */
        .mobile-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 100;
        }
        
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: var(--gradient-primary);
          color: var(--white);
          z-index: 101;
          display: flex;
          flex-direction: column;
        }
        
        .mobile-menu-btn {
          display: none;
          font-size: var(--text-xl);
          color: var(--gray-700);
          margin-right: var(--spacing-md);
        }
        
        /* Media Queries */
        @media (max-width: 1024px) {
          .dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          
          .mobile-close {
            display: block;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .search-box {
            width: 100%;
          }
          
          .dashboard-welcome {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }
          
          .welcome-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
          
          .projects-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            grid-template-columns: 1fr;
          }
          
          .export-options {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-container {
            padding: var(--spacing-md);
          }
          
          .section-headers {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }
          
          .deadline-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }
          
          .deadline-time {
            align-items: flex-start;
            margin-right: 0;
          }
          
          .deadline-actions {
            align-self: flex-end;
          }
          
          .dashboard-footer {
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
          
          .footer-links {
            flex-direction: column;
            gap: var(--spacing-sm);
          }
          
          .export-option {
            flex-direction: column;
          }
          
          .export-icon {
            margin-bottom: var(--spacing-sm);
          }
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Utility Classes */
        .text-primary { color: var(--primary-color); }
        .text-success { color: var(--success-color); }
        .text-warning { color: var(--warning-color); }
        .text-danger { color: var(--danger-color); }
        .text-info { color: var(--info-color); }
        
        .bg-primary { background-color: var(--primary-color); }
        .bg-success { background-color: var(--success-color); }
        .bg-warning { background-color: var(--warning-color); }
        .bg-danger { background-color: var(--danger-color); }
        .bg-info { background-color: var(--info-color); }
        
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-in-out; }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
