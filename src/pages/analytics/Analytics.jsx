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
import SystemStatus from './components/SystemStatus';
import DashboardOverviewAnalytics from './components/DashboardOverviewAnalytics';
import ProfileAnalytics from './components/ProfileAnalytics';
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
  const [developerMetrics, setDeveloperMetrics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [projectHealthData, setProjectHealthData] = useState(null);
  const [performanceMetricsData, setPerformanceMetricsData] = useState(null);
  const [codeQualityData, setCodeQualityData] = useState(null);  const [userEngagementData, setUserEngagementData] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [systemStatusData, setSystemStatusData] = useState(null);
  const [dashboardAnalyticsData, setDashboardAnalyticsData] = useState(null);
  const [taskAnalyticsData, setTaskAnalyticsData] = useState(null);
  const [projectAnalyticsData, setProjectAnalyticsData] = useState(null);
  const [profileAnalyticsData, setProfileAnalyticsData] = useState(null);
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

  // Initial data load  // Debounced data fetching to prevent excessive API calls
  useEffect(() => {
    console.log('🚀 Analytics component mounted, loading with demo data...');
    
    // Load demo data immediately to show the UI
    loadDemoData();
    
    // Optionally fetch real data after a delay (only if user stays on page)
    const fetchTimer = setTimeout(() => {
      console.log('🔄 Fetching essential analytics data only...');
      fetchEssentialData();
    }, 2000);

    return () => clearTimeout(fetchTimer);
  }, []);

  // Debounced filter change handler
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      console.log('🔄 Filters changed, refreshing essential data...', { selectedTimeRange, selectedProject });
      fetchEssentialData();
    }, 1000); // 1 second debounce

    return () => clearTimeout(debounceTimer);
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

  // Fetch developer metrics from API
  const fetchDeveloperMetrics = async () => {
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
      
      const period = periodMapping[selectedTimeRange] || 'year';
      const response = await apiService.analytics.getDeveloperMetrics({ period });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setDeveloperMetrics({
          period: data.period,
          overview: {
            projects: {
              total: data.overview.projects.total,
              active: data.overview.projects.active,
              completed: data.overview.projects.completed,
              completionRate: data.overview.projects.completionRate
            },
            tasks: {
              total: data.overview.tasks.total,
              completed: data.overview.tasks.completed,
              overdue: data.overview.tasks.overdue,
              completionRate: data.overview.tasks.completionRate,
              overdueRate: data.overview.tasks.overdueRate
            },
            skills: {
              total: data.overview.skills.total,
              categories: data.overview.skills.categories
            },
            portfolio: {
              weeklyVisitors: data.overview.portfolio.weeklyVisitors,
              profileViews: data.overview.portfolio.profileViews,
              avgViewsPerDay: data.overview.portfolio.avgViewsPerDay
            }
          },
          productivity: {
            overallScore: data.productivity.overallScore,
            projectCompletionRate: data.productivity.projectCompletionRate,
            taskCompletionRate: data.productivity.taskCompletionRate,
            timelineAdherence: data.productivity.timelineAdherence
          },
          technologies: data.technologies,
          experience: {
            totalJobs: data.experience.totalJobs,
            totalEducation: data.experience.totalEducation,
            upcomingEvents: data.experience.upcomingEvents
          }
        });
        console.log('✅ Developer metrics loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching developer metrics:', error);
      // Set fallback data
      setDeveloperMetrics({
        period: selectedTimeRange,
        overview: {
          projects: { total: 0, active: 0, completed: 0, completionRate: 0 },
          tasks: { total: 0, completed: 0, overdue: 0, completionRate: 0, overdueRate: 0 },
          skills: { total: 0, categories: {} },
          portfolio: { weeklyVisitors: 0, profileViews: 0, avgViewsPerDay: 0 }
        },
        productivity: {
          overallScore: 0,
          projectCompletionRate: 0,
          taskCompletionRate: 0,
          timelineAdherence: 0
        },
        technologies: [],
        experience: { totalJobs: 0, totalEducation: 0, upcomingEvents: 0 }
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch charts data from API
  const fetchChartsData = async () => {
    try {
      setDataLoading(true);
      // Map selectedTimeRange to API timeframe parameter
      const timeframeMapping = {
        '24h': '7d', // closest match
        '7d': '7d',
        '30d': '30d',
        '90d': '90d',
        '1y': '365d'
      };
      
      const timeframe = timeframeMapping[selectedTimeRange] || '30d';
      const response = await apiService.analytics.getChartsData({ 
        timeframe,
        chartType: 'all' // Get all chart types
      });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setChartsData({
          timeframe: data.timeframe,
          charts: data.charts,
          // Process calendar events data for charts
          calendarEvents: data.charts.calendarEvents || [],
          // Additional chart data processing can be added here
        });
        console.log('✅ Charts data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching charts data:', error);
      // Set fallback data
      setChartsData({
        timeframe: selectedTimeRange,
        charts: {},
        calendarEvents: []
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch project health data from API
  const fetchProjectHealthData = async () => {
    try {
      setDataLoading(true);
      const response = await apiService.analytics.getProjectHealth();
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setProjectHealthData({
          overallHealth: {
            averageScore: data.overallHealth.averageScore,
            criticalProjects: data.overallHealth.criticalProjects,
            warningProjects: data.overallHealth.warningProjects,
            healthyProjects: data.overallHealth.healthyProjects
          },
          projects: data.projects.map(project => ({
            id: project.id,
            title: project.title,
            status: project.status,
            priority: project.priority,
            healthScore: project.healthScore,
            healthStatus: project.healthStatus,
            metrics: project.metrics,
            taskDistribution: project.taskDistribution,
            deadline: project.deadline
          })),
          summary: data.summary
        });
        console.log('✅ Project health data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching project health data:', error);
      // Set fallback data
      setProjectHealthData({
        overallHealth: {
          averageScore: 0,
          criticalProjects: 0,
          warningProjects: 0,
          healthyProjects: 0
        },
        projects: [],
        summary: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          criticalIssues: 0
        }
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch performance metrics data from API
  const fetchPerformanceMetricsData = async () => {
    try {
      setDataLoading(true);
      // Map selectedTimeRange to API period parameter
      const periodMapping = {
        '24h': 'week',
        '7d': 'week',
        '30d': 'month',
        '90d': 'quarter',
        '1y': 'year'
      };
      
      const period = periodMapping[selectedTimeRange] || 'month';
      const response = await apiService.analytics.getPerformanceMetrics({ period });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setPerformanceMetricsData({
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
          velocity: data.velocity || [],
          overallScore: data.overall_score
        });
        console.log('✅ Performance metrics data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching performance metrics data:', error);
      // Set fallback data
      setPerformanceMetricsData({
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
        velocity: [],
        overallScore: 0
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch code quality data from API
  const fetchCodeQualityData = async () => {
    try {
      setDataLoading(true);
      const response = await apiService.analytics.getCodeQuality();
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setCodeQualityData({
          overview: {
            totalRepositories: data.overview.totalRepositories,
            totalStars: data.overview.totalStars,
            totalForks: data.overview.totalForks,
            avgStarsPerRepo: data.overview.avgStarsPerRepo,
            primaryLanguages: data.overview.primaryLanguages,
            technologiesUsed: data.overview.technologiesUsed
          },
          codeQuality: {
            maintainabilityIndex: data.codeQuality.maintainabilityIndex,
            technicalDebt: data.codeQuality.technicalDebt,
            codeComplexity: data.codeQuality.codeComplexity,
            testCoverage: data.codeQuality.testCoverage,
            duplicateCodePercentage: data.codeQuality.duplicateCodePercentage,
            issueResolutionTime: data.codeQuality.issueResolutionTime
          },
          technology: {
            topTechnologies: data.technology.topTechnologies,
            languageDistribution: data.technology.languageDistribution,
            diversityIndex: data.technology.diversityIndex
          },
          repositories: data.repositories,
          recommendations: data.recommendations || []
        });
        console.log('✅ Code quality data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching code quality data:', error);
      // Set fallback data
      setCodeQualityData({
        overview: {
          totalRepositories: 0,
          totalStars: 0,
          totalForks: 0,
          avgStarsPerRepo: 0,
          primaryLanguages: 0,
          technologiesUsed: 0
        },
        codeQuality: {
          maintainabilityIndex: 0,
          technicalDebt: 0,
          codeComplexity: 0,
          testCoverage: 0,
          duplicateCodePercentage: 0,
          issueResolutionTime: 0
        },
        technology: {
          topTechnologies: [],
          languageDistribution: [],
          diversityIndex: 0
        },
        repositories: [],
        recommendations: []
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch user engagement data from API
  const fetchUserEngagementData = async () => {
    try {
      setDataLoading(true);
      // Map timeRange to period for the API
      const periodMapping = {
        '7d': 'week',
        '30d': 'month',
        '90d': 'quarter',
        '1y': 'year'
      };
      
      const period = periodMapping[selectedTimeRange] || 'month';
      const response = await apiService.analytics.getUserEngagement({ period });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setUserEngagementData({
          period: data.period,
          engagement: {
            score: data.engagement.score,
            level: data.engagement.level,
            factors: data.engagement.factors
          },
          sessions: {
            total: data.sessions.total,
            uniqueDevices: data.sessions.uniqueDevices,
            avgDuration: data.sessions.avgDuration
          },
          portfolio: {
            visitors: data.portfolio.visitors,
            profileViews: data.portfolio.profileViews,
            avgTimeOnSite: data.portfolio.avgTimeOnSite,
            bounceRate: data.portfolio.bounceRate
          },
          activity: {
            taskUpdates: data.activity.taskUpdates,
            projectUpdates: data.activity.projectUpdates,
            eventUpdates: data.activity.eventUpdates,
            comments: data.activity.comments,
            total: data.activity.total,
            dailyBreakdown: data.activity.dailyBreakdown || []
          },
          insights: data.insights || []
        });
        console.log('✅ User engagement data loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching user engagement data:', error);
      // Set fallback data
      setUserEngagementData({
        period: selectedTimeRange,
        engagement: {
          score: 0,
          level: 'unknown',
          factors: {
            sessionActivity: 0,
            avgSessionDuration: 0,
            totalActions: 0,
            profileCompleteness: 0
          }
        },
        sessions: { total: 0, uniqueDevices: 0, avgDuration: 0 },
        portfolio: { visitors: 0, profileViews: 0, avgTimeOnSite: 0, bounceRate: 0 },
        activity: {
          taskUpdates: 0,
          projectUpdates: 0,
          eventUpdates: 0,
          comments: 0,
          total: 0,
          dailyBreakdown: []
        },
        insights: []
      });
    } finally {
      setDataLoading(false);
    }
  };
  // Fetch filter options from API
  const fetchFilterOptions = async () => {
    try {
      const response = await apiService.analytics.getFilterOptions();
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        
        // Map all filter options with proper fallbacks and deduplication
        setFilterOptions({
          timeframes: data.timeframes || [
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
            { value: '1y', label: 'Last year' }
          ],
          periods: data.periods || [
            { value: 'week', label: 'This week' },
            { value: 'month', label: 'This month' },
            { value: 'quarter', label: 'This quarter' },
            { value: 'year', label: 'This year' }
          ],
          projects: data.projects || [],
          technologies: Array.isArray(data.technologies) ? 
            data.technologies.filter((tech, index, self) => 
              index === self.findIndex(t => t.value === tech.value)
            ) : [],
          languages: Array.isArray(data.languages) ? 
            data.languages.filter((lang, index, self) => 
              index === self.findIndex(l => l.value === lang.value)
            ) : [],
          eventTypes: Array.isArray(data.eventTypes) ? 
            data.eventTypes.filter((event, index, self) => 
              index === self.findIndex(e => e.value === event.value)
            ) : [],
          taskStatuses: Array.isArray(data.taskStatuses) ? 
            data.taskStatuses.filter((status, index, self) => 
              index === self.findIndex(s => s.value === status.value)
            ) : [],
          chartTypes: data.chartTypes || [
            { value: 'bar', label: 'Bar Chart' },
            { value: 'line', label: 'Line Chart' },
            { value: 'pie', label: 'Pie Chart' },
            { value: 'area', label: 'Area Chart' }
          ]
        });
        console.log('✅ Filter options loaded and deduplicated:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
      // Set comprehensive fallback data
      setFilterOptions({
        timeframes: [
          { value: '7d', label: 'Last 7 days' },
          { value: '30d', label: 'Last 30 days' },
          { value: '90d', label: 'Last 90 days' },
          { value: '1y', label: 'Last year' }
        ],
        periods: [
          { value: 'week', label: 'This week' },
          { value: 'month', label: 'This month' },
          { value: 'quarter', label: 'This quarter' },
          { value: 'year', label: 'This year' }
        ],
        projects: [],
        technologies: [],
        languages: [],
        eventTypes: [],
        taskStatuses: [],
        chartTypes: [
          { value: 'bar', label: 'Bar Chart' },
          { value: 'line', label: 'Line Chart' },
          { value: 'pie', label: 'Pie Chart' },
          { value: 'area', label: 'Area Chart' }
        ]
      });
    }
  };
  // Fetch system status data from API
  const fetchSystemStatusData = async () => {
    try {
      console.log('🔄 Fetching system status data...');
      const response = await apiService.analytics.getSystemStatus();
      console.log('📊 System status response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('✅ System status data received:', data);
        setSystemStatusData({
          systemHealth: data.systemHealth,
          healthScore: data.healthScore,
          platform: {
            totalUsers: data.platform.totalUsers,
            activeUsers: data.platform.activeUsers,
            totalProjects: data.platform.totalProjects,
            activeProjects: data.platform.activeProjects,
            totalTasks: data.platform.totalTasks,
            completedTasks: data.platform.completedTasks,
            inProgressTasks: data.platform.inProgressTasks,
            overdueTasksGlobal: data.platform.overdueTasksGlobal,
            userGrowthRate: data.platform.userGrowthRate,
            taskCompletionRate: data.platform.taskCompletionRate,
            projectActivityRate: data.platform.projectActivityRate,
            recentActivity: data.platform.recentActivity
          },
          userStatus: {
            projects: data.userStatus.projects,
            tasks: data.userStatus.tasks,
            completedTasks: data.userStatus.completedTasks,
            overdueTasks: data.userStatus.overdueTasks,
            recentProjects: data.userStatus.recentProjects,
            totalEvents: data.userStatus.totalEvents,
            upcomingEvents: data.userStatus.upcomingEvents,
            unreadNotifications: data.userStatus.unreadNotifications,
            accountHealth: data.userStatus.accountHealth,
            taskCompletionRate: data.userStatus.taskCompletionRate,
            overdueRate: data.userStatus.overdueRate
          },
          alerts: data.alerts || [],
          metrics: data.metrics,
          timestamp: data.timestamp
        });        console.log('✅ System status data loaded:', data);
      } else {
        console.log('⚠️ System status response format unexpected:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching system status data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Set fallback data
      setSystemStatusData({
        systemHealth: 'unknown',
        healthScore: 0,
        platform: {
          totalUsers: 0,
          activeUsers: 0,
          totalProjects: 0,
          activeProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasksGlobal: 0,
          userGrowthRate: 0,
          taskCompletionRate: 0,
          projectActivityRate: 0,
          recentActivity: {
            newUsers: 0,
            newProjects: 0,
            completedTasks: 0,
            errorNotifications: 0
          }
        },
        userStatus: {
          projects: 0,
          tasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          recentProjects: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          unreadNotifications: 0,
          accountHealth: 'unknown',
          taskCompletionRate: 0,
          overdueRate: 0
        },
        alerts: [],
        metrics: {
          errorRate: 0,
          errorNotifications: 0,
          totalNotifications: 0,
          unreadNotifications: 0,
          healthScore: 0,
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  // Fetch dashboard analytics data from API
  const fetchDashboardAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching dashboard analytics data...');
      const params = {
        period: selectedTimeRange === '7d' ? 'week' : selectedTimeRange === '30d' ? 'month' : 'quarter'
      };
      const response = await apiService.dashboard.getAnalytics(params);
      console.log('📊 Dashboard analytics response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('✅ Dashboard analytics data received:', data);
        setDashboardAnalyticsData(data);
        console.log('✅ Dashboard analytics data loaded:', data);
      } else {
        console.log('⚠️ Dashboard analytics response format unexpected:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard analytics data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Set fallback data
      setDashboardAnalyticsData(null);
    }
  };

  // Fetch task analytics data from API
  const fetchTaskAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching task analytics data...');
      const params = {
        period: selectedTimeRange === '7d' ? 'week' : selectedTimeRange === '30d' ? 'month' : 'quarter',
        project_id: selectedProject !== 'all' ? selectedProject : null
      };
      const response = await apiService.dashboard.getTaskAnalytics(params);
      console.log('📊 Task analytics response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('✅ Task analytics data received:', data);
        setTaskAnalyticsData(data);
        console.log('✅ Task analytics data loaded:', data);
      } else {
        console.log('⚠️ Task analytics response format unexpected:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching task analytics data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Set fallback data
      setTaskAnalyticsData(null);
    }
  };

  // Fetch project analytics data from API
  const fetchProjectAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching project analytics data...');
      const params = {
        period: selectedTimeRange === '7d' ? 'week' : selectedTimeRange === '30d' ? 'month' : 'quarter',
        timeframe: selectedTimeRange === '7d' ? 'week' : selectedTimeRange === '30d' ? 'month' : 'quarter'
      };
      const response = await apiService.dashboard.getProjectAnalytics(params);
      console.log('📊 Project analytics response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('✅ Project analytics data received:', data);
        setProjectAnalyticsData(data);
        console.log('✅ Project analytics data loaded:', data);
      } else {
        console.log('⚠️ Project analytics response format unexpected:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching project analytics data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Set fallback data
      setProjectAnalyticsData(null);
    }
  };

  // Fetch profile analytics data from API
  const fetchProfileAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching profile analytics data...');
      const response = await apiService.profile.getAnalytics();
      console.log('📊 Profile analytics response:', response);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('✅ Profile analytics data received:', data);
        setProfileAnalyticsData(data);
        console.log('✅ Profile analytics data loaded:', data);
      } else {
        console.log('⚠️ Profile analytics response format unexpected:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching profile analytics data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Set fallback data
      setProfileAnalyticsData(null);
    }
  };

  // Load demo data immediately for better UX
  const loadDemoData = () => {
    console.log('📊 Loading demo data for immediate display...');
    
    // Set demo data for new analytics components
    setSystemStatusData({
      systemHealth: 'good',
      healthScore: 85,
      platform: {
        totalUsers: 1234,
        activeUsers: 567,
        totalProjects: 89,
        activeProjects: 23,
        totalTasks: 456,
        completedTasks: 234
      },
      alerts: [
        { type: 'info', message: 'Demo data - Real data will load shortly' }
      ]
    });

    setDashboardAnalyticsData({
      overview: {
        totalProjects: 89,
        activeProjects: 23,
        completedProjects: 45,
        totalTasks: 456,
        completedTasks: 234,
        pendingTasks: 122
      },
      taskBreakdown: {
        byStatus: {
          todo: 122,
          inProgress: 100,
          completed: 234
        },
        byPriority: {
          high: 45,
          medium: 211,
          low: 200
        }
      },
      projectMetrics: {
        onTime: 18,
        delayed: 3,
        atRisk: 2
      }
    });

    setProfileAnalyticsData({
      userStats: {
        totalLogins: 156,
        lastLoginDays: 2,
        profileCompleteness: 85,
        totalProjects: 12,
        totalTasks: 89
      },
      activity: {
        weeklyLogins: [5, 7, 4, 6, 8, 3, 4],
        monthlyTasks: [23, 34, 28, 45]
      },
      insights: {
        mostActiveDay: 'Friday',
        averageSessionTime: '2h 15m',
        preferredWorkingHours: '9AM - 5PM'
      }
    });

    // Set loading to false since we have demo data
    setDataLoading(false);
    setIsLoading(false);
  };

  // Fetch only essential data to prevent server overload
  const fetchEssentialData = async () => {
    try {
      console.log('🔄 Fetching essential analytics data only...');
      setDataLoading(true);
      
      // Only fetch the 3 most important endpoints to prevent server overload
      const essentialPromises = [
        fetchSystemStatusData().catch(err => console.warn('System status failed:', err)),
        fetchDashboardAnalyticsData().catch(err => console.warn('Dashboard analytics failed:', err)),
        fetchProfileAnalyticsData().catch(err => console.warn('Profile analytics failed:', err))
      ];

      // Run essential calls in parallel but limit to 3 max
      await Promise.allSettled(essentialPromises);
      
      console.log('✅ Essential analytics data loaded');
      
    } catch (error) {
      console.error('❌ Error loading essential analytics data:', error);
    } finally {
      setDataLoading(false);
      setIsLoading(false);
    }
  };

  // Optional: Load additional data only when user explicitly requests it
  const loadAdditionalData = async () => {
    try {
      console.log('🔄 Loading additional analytics data...');
      setDataLoading(true);
      
      // Load additional data with proper delays
      const additionalCalls = [
        () => fetchSessionStats(),
        () => fetchPerformanceData(),
        () => fetchDeveloperMetrics(),
        () => fetchChartsData(),
        () => fetchFilterOptions()
      ];

      // Execute with 500ms delays to be gentle on server
      for (let i = 0; i < additionalCalls.length; i++) {
        try {
          await additionalCalls[i]();
          if (i < additionalCalls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.warn(`Additional data call ${i} failed:`, error);
        }
      }
      
      console.log('✅ Additional analytics data loaded');
      
    } catch (error) {
      console.error('❌ Error loading additional analytics data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Combined data fetching function
  const fetchAnalyticsData = async () => {
    try {
      console.log('🔄 Fetching analytics data...');
      setDataLoading(true);
      setLastDataUpdate(new Date().toISOString());
      
      // Add delay between API calls to prevent rate limiting
      const delayBetweenCalls = 200; // 200ms delay
      
      // Fetch data with delays to prevent overwhelming the server
      try {
        await fetchSessionStats();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchPerformanceData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchDeveloperMetrics();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchChartsData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchProjectHealthData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchPerformanceMetricsData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchCodeQualityData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchUserEngagementData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchFilterOptions();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        // Fetch new analytics endpoints with delays
        await fetchSystemStatusData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchDashboardAnalyticsData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchTaskAnalyticsData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchProjectAnalyticsData();
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
        
        await fetchProfileAnalyticsData();
        
      } catch (fetchError) {
        console.warn('⚠️ Some analytics data failed to load, using fallback data');
        
        // Set fallback data for all analytics components
        setSystemStatusData({
          systemHealth: 'good',
          healthScore: 85,
          platform: {
            totalUsers: 1234,
            activeUsers: 567,
            totalProjects: 89,
            activeProjects: 23,
            totalTasks: 456,
            completedTasks: 234
          },
          alerts: [
            { type: 'info', message: 'Backend server is not available - showing demo data' }
          ]
        });
        
        setDashboardAnalyticsData({
          overview: {
            totalProjects: 89,
            activeProjects: 23,
            completedTasks: 234,
            totalUsers: 1234
          },
          projectDistribution: [
            { status: 'active', count: 23, percentage: 25.8 },
            { status: 'completed', count: 45, percentage: 50.6 },
            { status: 'on-hold', count: 12, percentage: 13.5 },
            { status: 'cancelled', count: 9, percentage: 10.1 }
          ],
          taskMetrics: {
            totalTasks: 456,
            completedTasks: 234,
            inProgressTasks: 123,
            pendingTasks: 99
          }
        });
        
        setProfileAnalyticsData({
          profileCompleteness: 87,
          skillsCount: 15,
          experienceYears: 5,
          projectsWorkedOn: 23,
          tasksCompleted: 234,
          averageRating: 4.6,
          topSkills: [
            { skill: 'JavaScript', level: 'Expert', projects: 15 },
            { skill: 'React', level: 'Advanced', projects: 12 },
            { skill: 'Node.js', level: 'Intermediate', projects: 8 }
          ]
        });
      }
      
      console.log('✅ Analytics data loading completed');
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
    } finally {
      setDataLoading(false);
    }
  };
  // Removed duplicate useEffect that was causing excessive API calls
  // The data fetching is now handled by the optimized useEffect hooks above

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
      <motion.div className="analytics-filters-section" variants={itemVariants}>        <FilterControls
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          settingsConfig={settingsConfig}
          filterOptions={filterOptions}
        />
      </motion.div>      {/* KPI Cards Section */}
      <motion.div className="analytics-kpi-section" variants={itemVariants}>        <DeveloperMetricsCard 
          timeRange={selectedTimeRange}
          project={selectedProject}
          settingsConfig={settingsConfig}
          sessionStats={sessionStats}
          performanceData={performanceData}
          developerMetrics={developerMetrics}
          chartsData={chartsData}
          dashboardData={dashboardAnalyticsData}
          taskData={taskAnalyticsData}
          projectData={projectAnalyticsData}
          isLoading={dataLoading}
        />
      </motion.div>

      {/* Main Charts Section */}
      <motion.div className="analytics-charts-section" variants={itemVariants}>
        <div className="analytics-charts-grid">
          <div className="analytics-chart-primary">            <RealTimeCharts
              timeRange={selectedTimeRange}
              project={selectedProject}
              metrics={selectedMetrics}
              settingsConfig={settingsConfig}
              chartsData={chartsData}
              developerMetrics={developerMetrics}
              isLoading={dataLoading}
            />
          </div>
            <div className="analytics-chart-secondary">
            <ProjectHealthDashboard
              timeRange={selectedTimeRange}
              project={selectedProject}
              settingsConfig={settingsConfig}
              projectHealthData={projectHealthData}
              isLoading={dataLoading}
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
              performanceMetricsData={performanceMetricsData}
              isLoading={dataLoading}
            />
          </div>
            <div className="analytics-performance-item">
            <CodeQualityInsights
              timeRange={selectedTimeRange}
              project={selectedProject}
              settingsConfig={settingsConfig}
              codeQualityData={codeQualityData}
              isLoading={dataLoading}
            />
          </div>
        </div>
      </motion.div>      {/* User Engagement Section */}
      <motion.div className="analytics-engagement-section" variants={itemVariants}>        <UserEngagementAnalytics
          timeRange={selectedTimeRange}
          project={selectedProject}
          settingsConfig={settingsConfig}
          userEngagementData={userEngagementData}
          sessionStats={sessionStats}
          performanceData={performanceData}
          isLoading={dataLoading}
        />
      </motion.div>

      {/* System Status Section */}
      <motion.div className="analytics-system-status-section" variants={itemVariants}>
        <SystemStatus
          timeRange={selectedTimeRange}
          settingsConfig={settingsConfig}
          systemStatusData={systemStatusData}
          isLoading={dataLoading}
        />
      </motion.div>{/* Enhanced Status Bar */}
      <motion.div 
        className={`analytics-status-bar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        variants={itemVariants}
      >        <div className="analytics-status-left">
          <div className={`analytics-status-indicator ${
            systemStatusData?.systemHealth === 'excellent' || systemStatusData?.systemHealth === 'good' 
              ? 'analytics-status-healthy' 
              : systemStatusData?.systemHealth === 'fair' || systemStatusData?.systemHealth === 'warning'
              ? 'analytics-status-warning'
              : 'analytics-status-error'
          }`}>
            <div className="analytics-status-dot"></div>
            System Health: {systemStatusData?.systemHealth ? 
              systemStatusData.systemHealth.charAt(0).toUpperCase() + systemStatusData.systemHealth.slice(1) : 
              'Unknown'
            } {systemStatusData?.healthScore ? `(${systemStatusData.healthScore}/100)` : ''}
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

      {/* Dashboard Overview Analytics Section */}
      <motion.div className="analytics-dashboard-overview-section" variants={itemVariants}>
        <DashboardOverviewAnalytics
          timeRange={selectedTimeRange}
          settingsConfig={settingsConfig}
          dashboardData={dashboardAnalyticsData}
          isLoading={dataLoading}
        />
      </motion.div>

      {/* Profile Analytics Section */}
      <motion.div className="analytics-profile-analytics-section" variants={itemVariants}>
        <ProfileAnalytics
          settingsConfig={settingsConfig}
          profileData={profileAnalyticsData}
          isLoading={dataLoading}
        />
      </motion.div>
      </div> {/* Close analytics-content */}
    </motion.div>
  );
};

export default Analytics;
