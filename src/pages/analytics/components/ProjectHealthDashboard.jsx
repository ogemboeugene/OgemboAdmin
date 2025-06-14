import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes, 
  FaShieldAlt,
  FaRocket,
  FaDatabase,
  FaCloud,
  FaSync,
  FaEye,
  FaCog
} from 'react-icons/fa';

const ProjectHealthDashboard = ({ timeRange, project, settingsConfig, projectHealthData, isLoading: dataLoading }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    buildStatus: 'success',
    testCoverage: 85,
    codeQuality: 'A',
    security: 'good',
    performance: 92,
    dependencies: 15,
    vulnerabilities: 2,
    uptime: 99.9
  });

  const [healthHistory, setHealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Use real project health data if available, otherwise simulate
    setTimeout(() => {
      if (projectHealthData) {
        // Map real project health data
        const avgHealthScore = projectHealthData.overallHealth.averageScore || 0;
        setHealthMetrics({
          buildStatus: avgHealthScore > 70 ? 'success' : avgHealthScore > 40 ? 'warning' : 'error',
          testCoverage: Math.min(Math.max(avgHealthScore + 15, 0), 100), // Estimate based on health score
          codeQuality: avgHealthScore > 80 ? 'A' : avgHealthScore > 60 ? 'B' : avgHealthScore > 40 ? 'C' : 'D',
          security: avgHealthScore > 70 ? 'good' : avgHealthScore > 40 ? 'warning' : 'critical',
          performance: Math.min(Math.max(avgHealthScore + 10, 0), 100),
          dependencies: projectHealthData.summary.totalProjects || 0,
          vulnerabilities: projectHealthData.overallHealth.criticalProjects || 0,
          uptime: avgHealthScore > 50 ? 99.9 : 95.5
        });
      } else {
        // Fallback to simulated data
        setHealthMetrics({
          buildStatus: 'success',
          testCoverage: 85,
          codeQuality: 'A',
          security: 'good',
          performance: 92,
          dependencies: 15,
          vulnerabilities: 2,
          uptime: 99.9
        });
      }

      // Generate health history (still simulated but based on real data)
      const history = [];
      for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        const baseScore = projectHealthData ? projectHealthData.overallHealth.averageScore : 80;
        const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
        const score = Math.min(Math.max(baseScore + variation, 0), 100);
        history.push({
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: score > 70 ? 'healthy' : score > 40 ? 'warning' : 'critical',
          score: score
        });
      }
      setHealthHistory(history);
      setLoading(false);
    }, 600);
  }, [timeRange, project, projectHealthData]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'good':
        return <FaCheckCircle className="analytics-status-icon analytics-status-success" />;
      case 'warning':
        return <FaExclamationTriangle className="analytics-status-icon analytics-status-warning" />;
      case 'error':
      case 'poor':
        return <FaTimes className="analytics-status-icon analytics-status-error" />;
      default:
        return <FaCheckCircle className="analytics-status-icon analytics-status-success" />;
    }
  };

  const getProgressColor = (value, thresholds = { good: 80, warning: 60 }) => {
    if (value >= thresholds.good) return '#22c55e';
    if (value >= thresholds.warning) return '#f59e0b';
    return '#ef4444';
  };

  const healthItems = [
    {
      key: 'buildStatus',
      label: 'Build Status',
      icon: FaRocket,
      value: healthMetrics.buildStatus,
      description: 'Latest build completed successfully'
    },
    {
      key: 'testCoverage',
      label: 'Test Coverage',
      icon: FaShieldAlt,
      value: `${healthMetrics.testCoverage}%`,
      progress: healthMetrics.testCoverage,
      description: 'Unit and integration test coverage'
    },
    {
      key: 'codeQuality',
      label: 'Code Quality',
      icon: FaEye,
      value: healthMetrics.codeQuality,
      description: 'Static analysis grade'
    },
    {
      key: 'security',
      label: 'Security',
      icon: FaShieldAlt,
      value: healthMetrics.security,
      description: `${healthMetrics.vulnerabilities} vulnerabilities found`
    },
    {
      key: 'performance',
      label: 'Performance',
      icon: FaRocket,
      value: `${healthMetrics.performance}%`,
      progress: healthMetrics.performance,
      description: 'Application performance score'
    },
    {
      key: 'dependencies',
      label: 'Dependencies',
      icon: FaDatabase,
      value: healthMetrics.dependencies,
      description: 'Outdated dependencies to update'
    },
    {
      key: 'uptime',
      label: 'Uptime',
      icon: FaCloud,
      value: `${healthMetrics.uptime}%`,
      progress: healthMetrics.uptime,
      description: 'Service availability this month'
    }
  ];

  if (loading || dataLoading) {
    return (
      <div className="analytics-health-container">
        <div className="analytics-health-header">
          <h3 className="analytics-health-title">Project Health Dashboard</h3>
        </div>
        <div className="analytics-health-loading">
          <motion.div 
            className="analytics-loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSync />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-health-container">
      <div className="analytics-health-header">
        <h3 className="analytics-health-title">
          <FaShieldAlt className="analytics-health-icon" />
          Project Health
        </h3>
        <div className="analytics-health-actions">
          <button className="analytics-health-action-btn">
            <FaCog />
          </button>
        </div>
      </div>

      <div className="analytics-health-content">
        {/* Overall Health Score */}
        <motion.div 
          className="analytics-health-score"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="analytics-health-score-circle">
            <svg className="analytics-health-score-svg" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - 0.89) }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
            <div className="analytics-health-score-text">
              <span className="analytics-health-score-value">89</span>
              <span className="analytics-health-score-label">Health Score</span>
            </div>
          </div>
        </motion.div>

        {/* Health Metrics Grid */}
        <div className="analytics-health-metrics">
          {healthItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.key}
                className="analytics-health-metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="analytics-health-metric-header">
                  <IconComponent className="analytics-health-metric-icon" />
                  <span className="analytics-health-metric-label">{item.label}</span>
                  {getStatusIcon(item.value)}
                </div>
                
                <div className="analytics-health-metric-value">
                  {item.value}
                </div>
                
                {item.progress && (
                  <div className="analytics-health-metric-progress">
                    <div 
                      className="analytics-health-metric-progress-bar"
                      style={{ 
                        width: `${item.progress}%`,
                        backgroundColor: getProgressColor(item.progress)
                      }}
                    ></div>
                  </div>
                )}
                
                <div className="analytics-health-metric-description">
                  {item.description}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Health Timeline */}
        <div className="analytics-health-timeline">
          <h4 className="analytics-health-timeline-title">24-Hour Health Timeline</h4>
          <div className="analytics-health-timeline-chart">
            {healthHistory.map((point, index) => (
              <motion.div
                key={index}
                className={`analytics-health-timeline-point analytics-health-${point.status}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                title={`${point.time}: ${point.score}% health`}
                style={{ height: `${(point.score - 60) * 2}%` }}
              />
            ))}
          </div>
          <div className="analytics-health-timeline-labels">
            <span>24h ago</span>
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="analytics-health-actions-grid">
          <button className="analytics-health-action-card">
            <FaRocket />
            <span>Deploy Latest</span>
          </button>
          <button className="analytics-health-action-card">
            <FaDatabase />
            <span>Update Dependencies</span>
          </button>
          <button className="analytics-health-action-card">
            <FaShieldAlt />
            <span>Security Scan</span>
          </button>
          <button className="analytics-health-action-card">
            <FaSync />
            <span>Refresh Health</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;
