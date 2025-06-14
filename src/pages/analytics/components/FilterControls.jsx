import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFilter, 
  FaCalendarAlt, 
  FaFolderOpen, 
  FaChartBar, 
  FaSync,
  FaCog,
  FaDownload,
  FaEye
} from 'react-icons/fa';

const FilterControls = ({ 
  selectedTimeRange, 
  setSelectedTimeRange,
  selectedProject,
  setSelectedProject,
  selectedMetrics,
  setSelectedMetrics,
  refreshRate,
  setRefreshRate,
  settingsConfig 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projects] = useState([
    { id: 'all', name: 'All Projects' },
    { id: 'ogemboadmin', name: 'OgemboAdmin' },
    { id: 'portfolio', name: 'Portfolio Site' },
    { id: 'api-service', name: 'API Service' },
    { id: 'mobile-app', name: 'Mobile App' }
  ]);

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const metricsOptions = [
    { value: 'overview', label: 'Overview Dashboard' },
    { value: 'development', label: 'Development Metrics' },
    { value: 'performance', label: 'Performance Analytics' },
    { value: 'quality', label: 'Code Quality' },
    { value: 'security', label: 'Security Insights' },
    { value: 'team', label: 'Team Collaboration' }
  ];

  const refreshOptions = [
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 0, label: 'Manual only' }
  ];

  return (
    <motion.div 
      className="analytics-filter-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="analytics-filter-header">
        <div className="analytics-filter-title">
          <FaFilter className="analytics-filter-icon" />
          <span>Filter & Controls</span>
        </div>
        
        <button 
          className="analytics-filter-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FaCog />
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      <div className="analytics-filter-content">
        {/* Primary Filters */}
        <div className="analytics-filter-row">
          <div className="analytics-filter-group">
            <label className="analytics-filter-label">
              <FaCalendarAlt />
              Time Range
            </label>
            <select 
              className="analytics-filter-select"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>          
          <div className="analytics-filter-group">
            <label className="analytics-filter-label">
              <FaFolderOpen />
              Project
            </label>
            <select 
              className="analytics-filter-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="analytics-filter-group">
            <label className="analytics-filter-label">
              <FaChartBar />
              Metrics View
            </label>
            <select 
              className="analytics-filter-select"
              value={selectedMetrics}
              onChange={(e) => setSelectedMetrics(e.target.value)}
            >
              {metricsOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              className="analytics-filter-advanced"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="analytics-filter-row">
                <div className="analytics-filter-group">
                  <label className="analytics-filter-label">
                    <FaSync />
                    Auto Refresh
                  </label>
                  <select 
                    className="analytics-filter-select"
                    value={refreshRate}
                    onChange={(e) => setRefreshRate(Number(e.target.value))}
                    disabled={!settingsConfig.autoRefresh}
                  >
                    {refreshOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="analytics-filter-group">
                  <label className="analytics-filter-label">
                    <FaEye />
                    Display Mode
                  </label>
                  <select className="analytics-filter-select">
                    <option value="detailed">Detailed View</option>
                    <option value="compact">Compact View</option>
                    <option value="minimal">Minimal View</option>
                  </select>
                </div>

                <div className="analytics-filter-group">
                  <label className="analytics-filter-label">
                    <FaDownload />
                    Export Format
                  </label>
                  <select className="analytics-filter-select">
                    <option value="pdf">PDF Report</option>
                    <option value="excel">Excel Sheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="analytics-quick-filters">
                <span className="analytics-quick-filters-label">Quick Filters:</span>
                <div className="analytics-quick-filters-buttons">
                  <button className="analytics-quick-filter-btn active">
                    All Data
                  </button>
                  <button className="analytics-quick-filter-btn">
                    High Priority
                  </button>
                  <button className="analytics-quick-filter-btn">
                    Recent Changes
                  </button>
                  <button className="analytics-quick-filter-btn">
                    Performance Issues
                  </button>
                  <button className="analytics-quick-filter-btn">
                    Security Alerts
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Indicators */}
      <div className="analytics-filter-status">
        <div className="analytics-filter-status-item">
          <span className="analytics-status-indicator analytics-status-active"></span>
          Live Data Connection
        </div>
        <div className="analytics-filter-status-item">
          <span className="analytics-status-indicator analytics-status-warning"></span>
          {settingsConfig.autoRefresh ? `Auto-refresh: ${refreshRate}s` : 'Manual refresh only'}
        </div>
        <div className="analytics-filter-status-item">
          <span className="analytics-status-indicator analytics-status-info"></span>
          Showing: {selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id === selectedProject)?.name}
        </div>
      </div>
    </motion.div>
  );
};

export default FilterControls;
