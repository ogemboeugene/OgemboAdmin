import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaClock, 
  FaDatabase, 
  FaMemory,
  FaWifi,
  FaServer,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync
} from 'react-icons/fa';

const PerformanceMetrics = ({ timeRange, project, settingsConfig }) => {
  const [performanceData, setPerformanceData] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    throughput: 0,
    cacheHitRate: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching performance data
    setTimeout(() => {
      // Generate realistic performance data
      setPerformanceData({
        pageLoadTime: Math.random() * 2000 + 800, // 800-2800ms
        apiResponseTime: Math.random() * 500 + 100, // 100-600ms
        memoryUsage: Math.random() * 30 + 45, // 45-75%
        cpuUsage: Math.random() * 40 + 20, // 20-60%
        networkLatency: Math.random() * 100 + 50, // 50-150ms
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.random() * 500 + 200, // 200-700 req/min
        cacheHitRate: Math.random() * 20 + 75 // 75-95%
      });

      // Generate performance history
      const history = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i * 2);
        history.push({
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          loadTime: Math.random() * 1000 + 500,
          apiTime: Math.random() * 300 + 100,
          memory: Math.random() * 20 + 40,
          cpu: Math.random() * 30 + 20
        });
      }
      setPerformanceHistory(history);

      // Generate alerts
      setAlerts([
        {
          type: 'warning',
          message: 'API response time above threshold (>500ms)',
          timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
          severity: 'medium'
        },
        {
          type: 'info',
          message: 'Cache hit rate improved to 89%',
          timestamp: new Date(Date.now() - 900000).toLocaleTimeString(),
          severity: 'low'
        }
      ]);

      setLoading(false);
    }, 900);
  }, [timeRange, project]);

  const getPerformanceStatus = (value, thresholds) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const performanceMetrics = [
    {
      key: 'pageLoadTime',
      label: 'Page Load Time',
      icon: FaRocket,
      value: performanceData.pageLoadTime,
      unit: 'ms',
      thresholds: { good: 1500, warning: 2500 },
      format: (val) => `${Math.round(val)}ms`
    },
    {
      key: 'apiResponseTime',
      label: 'API Response Time',
      icon: FaDatabase,
      value: performanceData.apiResponseTime,
      unit: 'ms',
      thresholds: { good: 300, warning: 500 },
      format: (val) => `${Math.round(val)}ms`
    },
    {
      key: 'memoryUsage',
      label: 'Memory Usage',
      icon: FaMemory,
      value: performanceData.memoryUsage,
      unit: '%',
      thresholds: { good: 60, warning: 80 },
      format: (val) => `${Math.round(val)}%`
    },
    {
      key: 'cpuUsage',
      label: 'CPU Usage',
      icon: FaServer,
      value: performanceData.cpuUsage,
      unit: '%',
      thresholds: { good: 50, warning: 75 },
      format: (val) => `${Math.round(val)}%`
    },
    {
      key: 'networkLatency',
      label: 'Network Latency',
      icon: FaWifi,
      value: performanceData.networkLatency,
      unit: 'ms',
      thresholds: { good: 100, warning: 200 },
      format: (val) => `${Math.round(val)}ms`
    },
    {
      key: 'errorRate',
      label: 'Error Rate',
      icon: FaExclamationTriangle,
      value: performanceData.errorRate,
      unit: '%',
      thresholds: { good: 1, warning: 3 },
      format: (val) => `${val.toFixed(2)}%`
    },
    {
      key: 'throughput',
      label: 'Throughput',
      icon: FaChartLine,
      value: performanceData.throughput,
      unit: 'req/min',
      thresholds: { good: 1000, warning: 500 }, // Reverse logic - higher is better
      format: (val) => `${Math.round(val)} req/min`,
      reverse: true
    },
    {
      key: 'cacheHitRate',
      label: 'Cache Hit Rate',
      icon: FaCheckCircle,
      value: performanceData.cacheHitRate,
      unit: '%',
      thresholds: { good: 85, warning: 70 }, // Reverse logic - higher is better
      format: (val) => `${Math.round(val)}%`,
      reverse: true
    }
  ];

  if (loading) {
    return (
      <div className="analytics-performance-container">
        <div className="analytics-performance-header">
          <h3 className="analytics-performance-title">Performance Metrics</h3>
        </div>
        <div className="analytics-performance-loading">
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
    <div className="analytics-performance-container">
      <div className="analytics-performance-header">
        <h3 className="analytics-performance-title">
          <FaRocket className="analytics-performance-icon" />
          Performance Metrics
        </h3>
        <div className="analytics-performance-status">
          <span className="analytics-performance-status-indicator">
            <FaCheckCircle style={{ color: '#22c55e' }} />
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="analytics-performance-content">
        {/* Performance Metrics Grid */}
        <div className="analytics-performance-metrics-grid">
          {performanceMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const status = metric.reverse 
              ? (metric.value >= metric.thresholds.good ? 'good' : metric.value >= metric.thresholds.warning ? 'warning' : 'critical')
              : getPerformanceStatus(metric.value, metric.thresholds);
            const statusColor = getStatusColor(status);

            return (
              <motion.div
                key={metric.key}
                className="analytics-performance-metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="analytics-performance-metric-header">
                  <IconComponent 
                    className="analytics-performance-metric-icon"
                    style={{ color: statusColor }}
                  />
                  <div 
                    className="analytics-performance-metric-status"
                    style={{ backgroundColor: statusColor }}
                  />
                </div>
                
                <div className="analytics-performance-metric-value">
                  {metric.format(metric.value)}
                </div>
                
                <div className="analytics-performance-metric-label">
                  {metric.label}
                </div>
                
                <div className="analytics-performance-metric-progress">
                  <div 
                    className="analytics-performance-metric-progress-bar"
                    style={{ 
                      width: metric.reverse 
                        ? `${Math.min(metric.value / (metric.thresholds.good * 1.2) * 100, 100)}%`
                        : `${Math.min(metric.value / (metric.thresholds.warning * 1.2) * 100, 100)}%`,
                      backgroundColor: statusColor 
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Timeline */}
        <div className="analytics-performance-timeline">
          <h4 className="analytics-performance-timeline-title">Performance Timeline (24h)</h4>
          <div className="analytics-performance-timeline-chart">
            <div className="analytics-performance-timeline-lines">
              {/* Load Time Line */}
              <svg className="analytics-performance-timeline-svg" viewBox="0 0 300 100">
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  points={performanceHistory.map((point, index) => 
                    `${index * 25},${100 - (point.loadTime / 2000 * 80)}`
                  ).join(' ')}
                />
                {performanceHistory.map((point, index) => (
                  <circle
                    key={`load-${index}`}
                    cx={index * 25}
                    cy={100 - (point.loadTime / 2000 * 80)}
                    r="3"
                    fill="#22c55e"
                  />
                ))}
              </svg>
              
              {/* API Time Line */}
              <svg className="analytics-performance-timeline-svg" viewBox="0 0 300 100">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points={performanceHistory.map((point, index) => 
                    `${index * 25},${100 - (point.apiTime / 500 * 80)}`
                  ).join(' ')}
                />
                {performanceHistory.map((point, index) => (
                  <circle
                    key={`api-${index}`}
                    cx={index * 25}
                    cy={100 - (point.apiTime / 500 * 80)}
                    r="3"
                    fill="#3b82f6"
                  />
                ))}
              </svg>
            </div>
            
            <div className="analytics-performance-timeline-legend">
              <div className="analytics-performance-timeline-legend-item">
                <span className="analytics-performance-timeline-legend-color" style={{backgroundColor: '#22c55e'}}></span>
                Page Load Time
              </div>
              <div className="analytics-performance-timeline-legend-item">
                <span className="analytics-performance-timeline-legend-color" style={{backgroundColor: '#3b82f6'}}></span>
                API Response Time
              </div>
            </div>
          </div>
        </div>

        {/* Performance Alerts */}
        {alerts.length > 0 && (
          <div className="analytics-performance-alerts">
            <h4 className="analytics-performance-alerts-title">Recent Alerts</h4>
            <div className="analytics-performance-alerts-list">
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  className={`analytics-performance-alert analytics-alert-${alert.type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="analytics-performance-alert-icon">
                    {alert.type === 'warning' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                  </div>
                  <div className="analytics-performance-alert-content">
                    <div className="analytics-performance-alert-message">
                      {alert.message}
                    </div>
                    <div className="analytics-performance-alert-timestamp">
                      {alert.timestamp}
                    </div>
                  </div>
                  <div className={`analytics-performance-alert-severity analytics-severity-${alert.severity}`}>
                    {alert.severity}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
