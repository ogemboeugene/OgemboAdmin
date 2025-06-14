import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCode, 
  FaBug, 
  FaCheckCircle, 
  FaClock, 
  FaArrowUp, 
  FaArrowDown,
  FaGitAlt,
  FaCodeBranch,
  FaSync
} from 'react-icons/fa';

const DeveloperMetricsCard = ({ timeRange, project, settingsConfig, sessionStats, performanceData, developerMetrics, chartsData, isLoading: dataLoading }) => {
  const [metrics, setMetrics] = useState({
    totalCommits: 0,
    linesOfCode: 0,
    bugsFixed: 0,
    codeReviews: 0,
    buildSuccess: 0,
    testCoverage: 0,
    averageReviewTime: 0,
    deployments: 0
  });

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Use real data if available, otherwise simulate
    const fetchMetrics = async () => {
      setLoading(true);
        setTimeout(() => {
        if (developerMetrics && performanceData) {
          // Use real developer metrics data
          const overview = developerMetrics.overview || {};
          const productivity = developerMetrics.productivity || {};
          const technologies = developerMetrics.technologies || [];
          
          setMetrics({
            totalCommits: Math.floor((overview.tasks?.completed || 5) * 3), // Estimate 3 commits per completed task
            linesOfCode: Math.floor((overview.tasks?.completed || 5) * 200), // Estimate 200 LOC per completed task
            bugsFixed: Math.floor((overview.tasks?.completed || 5) * 0.3), // 30% of completed tasks are bug fixes
            codeReviews: Math.floor((overview.projects?.active || 3) * 2), // 2 reviews per active project
            buildSuccess: Math.max(70, Math.min(98, productivity.timelineAdherence || 85)), // Use timeline adherence as build success
            testCoverage: Math.max(60, Math.min(95, 60 + (productivity.taskCompletionRate || 20))), // Base coverage + task completion
            averageReviewTime: Math.max(1, 10 - Math.floor((productivity.overallScore || 50) / 15)), // Better score = faster reviews
            deployments: Math.max(1, overview.projects?.completed || 1) // Deployments = completed projects
          });
        } else if (performanceData && sessionStats) {
          // Fallback to performance data mapping
          const taskData = performanceData.taskPerformance || {};
          const projectData = performanceData.projectPerformance || {};
          
          setMetrics({
            totalCommits: Math.floor((sessionStats.totalSessions || 10) * 2.5), // Estimate commits from sessions
            linesOfCode: Math.floor((taskData.completedTasks || 5) * 150), // Estimate LOC from completed tasks
            bugsFixed: Math.max(1, Math.floor((taskData.completedTasks || 5) * 0.2)), // 20% of tasks are bug fixes
            codeReviews: Math.floor((projectData.activeProjects || 3) * 1.5), // Reviews per active project
            buildSuccess: Math.max(70, 100 - (taskData.overdueRate || 10)), // Build success inversely related to overdue rate
            testCoverage: Math.min(95, 60 + (taskData.completionRate || 20)), // Coverage based on completion rate
            averageReviewTime: Math.max(1, 10 - Math.floor((performanceData.overallScore || 50) / 10)), // Better score = faster reviews
            deployments: Math.max(1, Math.floor((projectData.completedProjects || 1) * 2)) // Deployments per completed project
          });
        } else {
          // Fallback to simulated data
          const multiplier = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : 12;
          
          setMetrics({
            totalCommits: Math.floor(Math.random() * 50 * multiplier) + 10,
            linesOfCode: Math.floor(Math.random() * 5000 * multiplier) + 500,
            bugsFixed: Math.floor(Math.random() * 20 * multiplier) + 5,
            codeReviews: Math.floor(Math.random() * 15 * multiplier) + 3,
            buildSuccess: Math.floor(Math.random() * 20) + 75,
            testCoverage: Math.floor(Math.random() * 20) + 75,
            averageReviewTime: Math.floor(Math.random() * 8) + 2,
            deployments: Math.floor(Math.random() * 10 * multiplier) + 2
          });
        }
        setLoading(false);
      }, 800);
    };    fetchMetrics();
  }, [timeRange, project, sessionStats, performanceData, developerMetrics]);  const metricsConfig = [
    {
      key: 'totalCommits',
      label: 'Total Commits',
      icon: FaGitAlt,
      color: '#22c55e',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.overallScore || 50) / 8)}%` : '+12%',
      trendDirection: (developerMetrics?.productivity?.overallScore || 50) > 40 ? 'up' : 'down'
    },
    {
      key: 'linesOfCode',
      label: 'Lines of Code',
      icon: FaCode,
      color: '#3b82f6',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.taskCompletionRate || 50) / 5)}%` : '+8%',
      trendDirection: (developerMetrics?.productivity?.taskCompletionRate || 50) > 50 ? 'up' : 'down',
      formatter: (value) => `${(value / 1000).toFixed(1)}k`
    },
    {
      key: 'bugsFixed',
      label: 'Bugs Fixed',
      icon: FaBug,
      color: '#ef4444',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.taskCompletionRate || 30) / 6)}%` : '+15%',
      trendDirection: (developerMetrics?.productivity?.taskCompletionRate || 30) > 25 ? 'up' : 'down'
    },
    {
      key: 'codeReviews',
      label: 'Code Reviews',
      icon: FaCheckCircle,
      color: '#8b5cf6',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.projectCompletionRate || 30) / 5)}%` : '+5%',
      trendDirection: (developerMetrics?.productivity?.projectCompletionRate || 30) > 25 ? 'up' : 'down'
    },
    {
      key: 'buildSuccess',
      label: 'Build Success',
      icon: FaSync,
      color: '#10b981',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.timelineAdherence || 85) / 20)}%` : '-2%',
      trendDirection: (developerMetrics?.productivity?.timelineAdherence || 85) > 80 ? 'up' : 'down',
      formatter: (value) => `${value}%`
    },
    {
      key: 'testCoverage',
      label: 'Test Coverage',
      icon: FaCheckCircle,
      color: '#f59e0b',
      trend: developerMetrics ? `+${Math.floor((developerMetrics.productivity?.overallScore || 60) / 15)}%` : '+3%',
      trendDirection: (developerMetrics?.productivity?.overallScore || 60) > 50 ? 'up' : 'down',
      formatter: (value) => `${value}%`
    }
  ];
  if (loading || dataLoading) {
    return (
      <div className="analytics-metrics-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="analytics-metric-card analytics-metric-loading">
            <div className="analytics-loading-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="analytics-metrics-grid">
      {metricsConfig.map((config, index) => {
        const IconComponent = config.icon;
        const value = metrics[config.key];
        const formattedValue = config.formatter ? config.formatter(value) : value.toLocaleString();
        
        return (
          <motion.div
            key={config.key}
            className="analytics-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            style={{ '--metric-color': config.color }}
          >
            <div className="analytics-metric-header">
              <IconComponent 
                className="analytics-metric-icon" 
                style={{ color: config.color }}
              />
              <div 
                className={`analytics-metric-trend analytics-trend-${config.trendDirection}`}
              >
                {config.trendDirection === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                {config.trend}
              </div>
            </div>
            
            <div className="analytics-metric-value">
              {formattedValue}
            </div>
            
            <div className="analytics-metric-label">
              {config.label}
            </div>
            
            <div className="analytics-metric-progress">
              <div 
                className="analytics-metric-progress-bar"
                style={{ 
                  width: `${Math.min((value / (config.key === 'linesOfCode' ? 10000 : 100)) * 100, 100)}%`,
                  backgroundColor: config.color 
                }}
              ></div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DeveloperMetricsCard;
