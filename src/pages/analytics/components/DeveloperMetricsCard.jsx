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

const DeveloperMetricsCard = ({ timeRange, project, settingsConfig }) => {
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
    // Simulate API call to fetch metrics
    const fetchMetrics = async () => {
      setLoading(true);
      
      // Simulate different data based on time range
      const multiplier = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : 12;
      
      setTimeout(() => {
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
        setLoading(false);
      }, 800);
    };

    fetchMetrics();
  }, [timeRange, project]);
  const metricsConfig = [
    {
      key: 'totalCommits',
      label: 'Total Commits',
      icon: FaGitAlt,
      color: '#22c55e',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      key: 'linesOfCode',
      label: 'Lines of Code',
      icon: FaCode,
      color: '#3b82f6',
      trend: '+8%',
      trendDirection: 'up',
      formatter: (value) => `${(value / 1000).toFixed(1)}k`
    },
    {
      key: 'bugsFixed',
      label: 'Bugs Fixed',
      icon: FaBug,
      color: '#ef4444',
      trend: '+15%',
      trendDirection: 'up'
    },
    {
      key: 'codeReviews',
      label: 'Code Reviews',
      icon: FaCheckCircle,
      color: '#8b5cf6',
      trend: '+5%',
      trendDirection: 'up'
    },
    {
      key: 'buildSuccess',
      label: 'Build Success',
      icon: FaSync,
      color: '#10b981',
      trend: '-2%',
      trendDirection: 'down',
      formatter: (value) => `${value}%`
    },
    {
      key: 'testCoverage',
      label: 'Test Coverage',
      icon: FaCheckCircle,
      color: '#f59e0b',
      trend: '+3%',
      trendDirection: 'up',
      formatter: (value) => `${value}%`
    }
  ];
  if (loading) {
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
