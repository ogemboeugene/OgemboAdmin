import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartBar, 
  FaCode, 
  FaBug, 
  FaRocket, 
  FaClock, 
  FaUsers, 
  FaGitAlt, 
  FaServer,
  FaShieldAlt,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaCodeBranch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaDatabase,
  FaCloud,
  FaMobile,
  FaDesktop,
  FaGlobe,
  FaSync,
  FaCog,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api/apiService';
import DeveloperMetricsCard from './components/DeveloperMetricsCard';
import ProjectHealthDashboard from './components/ProjectHealthDashboard';
import CodeQualityInsights from './components/CodeQualityInsights';
import RealTimeCharts from './components/RealTimeCharts';
import PerformanceMetrics from './components/PerformanceMetrics';
import UserEngagementAnalytics from './components/UserEngagementAnalytics';
import FilterControls from './components/FilterControls';
import './Analytics.css';

const Analytics = () => {
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedMetrics, setSelectedMetrics] = useState('overview');  const [isFullscreen, setIsFullscreen] = useState(false);  const [refreshRate, setRefreshRate] = useState(30); // seconds
  const [settingsConfig, setSettingsConfig] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Data states for API integration
  const [sessionStats, setSessionStats] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastDataUpdate, setLastDataUpdate] = useState(null);
  
  // Detect sidebar collapsed state
  useEffect(() => {
    const checkSidebarState = () => {
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      setSidebarCollapsed(isCollapsed);
    };

    // Initial check
    checkSidebarState();

    // Create observer to watch for class changes
    const observer = new MutationObserver(checkSidebarState);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);
    // Load settings configuration
  useEffect(() => {
    const loadSettings = () => {
      try {
        const developerSettings = localStorage.getItem('developerSettings');
        if (developerSettings) {
          const parsed = JSON.parse(developerSettings);
          setSettingsConfig(parsed);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Initial data load
  useEffect(() => {
    console.log('🚀 Analytics component mounted, fetching initial data...');
    fetchAnalyticsData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    console.log('🔄 Filters changed, refreshing data...', { selectedTimeRange, selectedProject });
    fetchAnalyticsData();
  }, [selectedTimeRange, selectedProject]);

  // Simulate loading and data fetching
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedTimeRange, selectedProject]);

  // Enhanced theme classes
  const getThemeClass = () => {
    return darkMode ? 'analytics-dark' : 'analytics-light';
  };

  // Enhanced container classes
  const getContainerClasses = () => {
    const baseClasses = ['analytics-container'];
    baseClasses.push(getThemeClass());
    if (isFullscreen) baseClasses.push('analytics-fullscreen');
    return baseClasses.join(' ');
  };

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    lastUpdate: null
  });

  // Track component performance
  useEffect(() => {
    const startTime = performance.now();
    
    const timer = setTimeout(() => {
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime: endTime - startTime,
        lastUpdate: new Date().toISOString()
      }));
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedTimeRange, selectedProject]);
  // Auto-refresh functionality
  useEffect(() => {
    if (settingsConfig.autoRefresh && refreshRate > 0) {
      const interval = setInterval(() => {
        // Trigger data refresh
        console.log('Auto-refreshing analytics data...');
        fetchAnalyticsData();
        setPerformanceMetrics(prev => ({
          ...prev,
          lastUpdate: new Date().toISOString()
        }));
      }, refreshRate * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshRate, settingsConfig.autoRefresh]);

  // Fetch session statistics from API
  const fetchSessionStats = async () => {
    try {
      setDataLoading(true);
      const response = await apiService.sessions.getStats();
      
      if (response.data && response.data.success) {
        const stats = response.data.data.statistics;
        setSessionStats({
          totalSessions: stats.total_sessions,
          activeSessions: stats.active_sessions,
          deviceBreakdown: stats.device_breakdown,
          topLocations: stats.top_locations
        });
        console.log('✅ Session stats loaded:', stats);
      }
    } catch (error) {
      console.error('❌ Error fetching session stats:', error);
      // Set fallback data
      setSessionStats({
        totalSessions: 0,
        activeSessions: 0,
        deviceBreakdown: [],
        topLocations: []
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setDataLoading(true);
      // Map selectedTimeRange to API period parameter
      const periodMapping = {
        '24h': 'week', // closest match
        '7d': 'week',
        '30d': 'month',
        '90d': 'quarter',
        '1y': 'year'
      };
      
      const period = periodMapping[selectedTimeRange] || 'quarter';
      const response = await apiService.dashboard.getPerformance({ period });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setPerformanceData({
          period: data.period,
          dateRange: data.date_range,
          taskPerformance: {
            totalTasks: data.task_performance.total_tasks,
            completedTasks: data.task_performance.completed_tasks,
            overdueTasks: data.task_performance.overdue_tasks,
            completionRate: data.task_performance.completion_rate,
            overdueRate: data.task_performance.overdue_rate,
            avgCompletionDays: data.task_performance.avg_completion_days
          },
          projectPerformance: {
            totalProjects: data.project_performance.total_projects,
            completedProjects: data.project_performance.completed_projects,
            activeProjects: data.project_performance.active_projects,
            completionRate: data.project_performance.completion_rate
          },
          eventPerformance: {
            totalEvents: data.event_performance.total_events,
            pastEvents: data.event_performance.past_events,
            attendanceRate: data.event_performance.attendance_rate
          },
          overallScore: data.overall_score
        });
        console.log('✅ Performance data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching performance data:', error);
      // Set fallback data
      setPerformanceData({
        period: selectedTimeRange,
        dateRange: { start: null, end: null },
        taskPerformance: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          overdueRate: 0,
          avgCompletionDays: 0
        },
        projectPerformance: {
          totalProjects: 0,
          completedProjects: 0,
          activeProjects: 0,
          completionRate: 0
        },
        eventPerformance: {
          totalEvents: 0,
          pastEvents: 0,
          attendanceRate: 0
        },
        overallScore: 0
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Combined data fetching function
  const fetchAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching analytics data...');
      setLastDataUpdate(new Date().toISOString());
      
      // Fetch both datasets in parallel
      await Promise.all([
        fetchSessionStats(),
        fetchPerformanceData()
      ]);
      
      console.log('✅ All analytics data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange, selectedProject, refreshRate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const exportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  if (isLoading) {
    return (
      <div className="analytics-loading-container">
        <motion.div 
          className="analytics-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSync />
        </motion.div>
        <motion.p 
          className="analytics-loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading Analytics Dashboard...
        </motion.p>
      </div>
    );
  }
  return (
    <motion.div 
      className={getContainerClasses()}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`analytics-content ${getThemeClass()}`}>
        {/* Header Section */}
        <motion.div className="analytics-header" variants={itemVariants}>
        <div className="analytics-header-content">
          <div className="analytics-title-section">
            <h1 className="analytics-main-title">
              <FaChartBar className="analytics-title-icon" />
              Developer Analytics Dashboard
            </h1>
            <p className="analytics-subtitle">
              Comprehensive insights into your development workflow and performance
            </p>
          </div>
          
          <div className="analytics-header-actions">
            <button 
              className="analytics-action-btn analytics-refresh-btn"
              onClick={() => window.location.reload()}
            >
              <FaSync />
              Refresh
            </button>
            <button 
              className="analytics-action-btn analytics-export-btn"
              onClick={exportData}
            >
              <FaDownload />
              Export
            </button>
            <button 
              className="analytics-action-btn analytics-fullscreen-btn"
              onClick={handleFullscreenToggle}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div className="analytics-filters-section" variants={itemVariants}>
        <FilterControls
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          settingsConfig={settingsConfig}
        />
      </motion.div>      {/* KPI Cards Section */}
      <motion.div className="analytics-kpi-section" variants={itemVariants}>
        <DeveloperMetricsCard 
          timeRange={selectedTimeRange}
          project={selectedProject}
          settingsConfig={settingsConfig}
          sessionStats={sessionStats}
          performanceData={performanceData}
          isLoading={dataLoading}
        />
      </motion.div>

      {/* Main Charts Section */}
      <motion.div className="analytics-charts-section" variants={itemVariants}>
        <div className="analytics-charts-grid">
          <div className="analytics-chart-primary">
            <RealTimeCharts
              timeRange={selectedTimeRange}
              project={selectedProject}
              metrics={selectedMetrics}
              settingsConfig={settingsConfig}
            />
          </div>
          
          <div className="analytics-chart-secondary">
            <ProjectHealthDashboard
              timeRange={selectedTimeRange}
              project={selectedProject}
              settingsConfig={settingsConfig}
            />
          </div>
        </div>
      </motion.div>

      {/* Performance & Quality Section */}
      <motion.div className="analytics-performance-section" variants={itemVariants}>
        <div className="analytics-performance-grid">          <div className="analytics-performance-item">
            <PerformanceMetrics
              timeRange={selectedTimeRange}
              project={selectedProject}
              settingsConfig={settingsConfig}
              performanceData={performanceData}
              isLoading={dataLoading}
            />
          </div>
          
          <div className="analytics-performance-item">
            <CodeQualityInsights
              timeRange={selectedTimeRange}
              project={selectedProject}
              settingsConfig={settingsConfig}
            />
          </div>
        </div>
      </motion.div>      {/* User Engagement Section */}
      <motion.div className="analytics-engagement-section" variants={itemVariants}>
        <UserEngagementAnalytics
          timeRange={selectedTimeRange}
          project={selectedProject}
          settingsConfig={settingsConfig}
          sessionStats={sessionStats}
          performanceData={performanceData}
          isLoading={dataLoading}
        />
      </motion.div>{/* Enhanced Status Bar */}
      <motion.div 
        className={`analytics-status-bar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        variants={itemVariants}
      >
        <div className="analytics-status-left">
          <div className="analytics-status-indicator analytics-status-healthy">
            <div className="analytics-status-dot"></div>
            System Health: Excellent
          </div>
          <div className="analytics-performance-indicator">
            <FaClock />
            Load Time: {performanceMetrics.loadTime.toFixed(0)}ms
          </div>
          {performanceMetrics.lastUpdate && (
            <div className="analytics-last-update">
              <FaSync />
              Last updated: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="analytics-status-right">
          <button 
            className="analytics-export-btn"
            onClick={exportData}
            title="Export Analytics Data"
          >
            <FaDownload />
            Export
          </button>
          <button 
            className="analytics-fullscreen-btn"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}          </button>
        </div>
      </motion.div>

      </div> {/* Close analytics-content */}
    </motion.div>
  );
};

export default Analytics;
