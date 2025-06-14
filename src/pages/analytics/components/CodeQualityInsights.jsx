import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCode, 
  FaBug, 
  FaLightbulb, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaChartLine,
  FaClipboardList,
  FaSync
} from 'react-icons/fa';

const CodeQualityInsights = ({ timeRange, project, settingsConfig }) => {
  const [qualityData, setQualityData] = useState({
    overallGrade: 'A',
    maintainabilityIndex: 78,
    technicalDebt: 2.5,
    codeSmells: 12,
    duplications: 3.2,
    complexity: 'Medium',
    testability: 85,
    reliability: 92
  });

  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching quality data
    setTimeout(() => {
      setInsights([
        {
          type: 'improvement',
          icon: FaLightbulb,
          title: 'Refactoring Opportunity',
          description: 'UserService.js has high cyclomatic complexity',
          priority: 'medium',
          effort: '2-3 hours',
          impact: 'maintainability'
        },
        {
          type: 'warning',
          icon: FaExclamationTriangle,
          title: 'Code Duplication Detected',
          description: '15 duplicate code blocks found across components',
          priority: 'high',
          effort: '4-6 hours',
          impact: 'maintainability'
        },
        {
          type: 'success',
          icon: FaCheckCircle,
          title: 'Test Coverage Improved',
          description: 'Test coverage increased by 8% this week',
          priority: 'info',
          effort: 'completed',
          impact: 'quality'
        },
        {
          type: 'bug',
          icon: FaBug,
          title: 'Potential Memory Leak',
          description: 'Event listeners not properly cleaned up in useEffect',
          priority: 'high',
          effort: '1-2 hours',
          impact: 'performance'
        }
      ]);

      setRecommendations([
        {
          title: 'Extract Common Utility Functions',
          description: 'Create shared utility functions to reduce code duplication',
          impact: 'High',
          effort: 'Medium'
        },
        {
          title: 'Implement Error Boundaries',
          description: 'Add React error boundaries for better error handling',
          impact: 'Medium',
          effort: 'Low'
        },
        {
          title: 'Add Type Definitions',
          description: 'Convert JavaScript files to TypeScript for better type safety',
          impact: 'High',
          effort: 'High'
        },
        {
          title: 'Optimize Bundle Size',
          description: 'Remove unused dependencies and implement tree shaking',
          impact: 'Medium',
          effort: 'Medium'
        }
      ]);

      setLoading(false);
    }, 700);
  }, [timeRange, project]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#22c55e';
      case 'B': return '#84cc16';
      case 'C': return '#eab308';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="analytics-quality-container">
        <div className="analytics-quality-header">
          <h3 className="analytics-quality-title">Code Quality Insights</h3>
        </div>
        <div className="analytics-quality-loading">
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
    <div className="analytics-quality-container">
      <div className="analytics-quality-header">
        <h3 className="analytics-quality-title">
          <FaCode className="analytics-quality-icon" />
          Code Quality Insights
        </h3>
        <div className="analytics-quality-grade">
          <span 
            className="analytics-quality-grade-value"
            style={{ color: getGradeColor(qualityData.overallGrade) }}
          >
            {qualityData.overallGrade}
          </span>
          <span className="analytics-quality-grade-label">Overall Grade</span>
        </div>
      </div>

      <div className="analytics-quality-content">
        {/* Quality Metrics */}
        <div className="analytics-quality-metrics">
          <div className="analytics-quality-metric">
            <div className="analytics-quality-metric-header">
              <FaEye className="analytics-quality-metric-icon" />
              <span>Maintainability</span>
            </div>
            <div className="analytics-quality-metric-value">
              {qualityData.maintainabilityIndex}
            </div>
            <div className="analytics-quality-metric-progress">
              <div 
                className="analytics-quality-metric-progress-bar"
                style={{ 
                  width: `${qualityData.maintainabilityIndex}%`,
                  backgroundColor: qualityData.maintainabilityIndex > 70 ? '#22c55e' : '#f59e0b'
                }}
              />
            </div>
          </div>

          <div className="analytics-quality-metric">
            <div className="analytics-quality-metric-header">
              <FaChartLine className="analytics-quality-metric-icon" />
              <span>Technical Debt</span>
            </div>
            <div className="analytics-quality-metric-value">
              {qualityData.technicalDebt}h
            </div>
            <div className="analytics-quality-metric-progress">
              <div 
                className="analytics-quality-metric-progress-bar"
                style={{ 
                  width: `${Math.max(0, 100 - qualityData.technicalDebt * 10)}%`,
                  backgroundColor: qualityData.technicalDebt < 5 ? '#22c55e' : '#ef4444'
                }}
              />
            </div>
          </div>

          <div className="analytics-quality-metric">
            <div className="analytics-quality-metric-header">
              <FaClipboardList className="analytics-quality-metric-icon" />
              <span>Testability</span>
            </div>
            <div className="analytics-quality-metric-value">
              {qualityData.testability}%
            </div>
            <div className="analytics-quality-metric-progress">
              <div 
                className="analytics-quality-metric-progress-bar"
                style={{ 
                  width: `${qualityData.testability}%`,
                  backgroundColor: qualityData.testability > 80 ? '#22c55e' : '#f59e0b'
                }}
              />
            </div>
          </div>
        </div>

        {/* Issues & Insights */}
        <div className="analytics-quality-insights">
          <h4 className="analytics-quality-section-title">Quality Insights</h4>
          <div className="analytics-quality-insights-list">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <motion.div
                  key={index}
                  className={`analytics-quality-insight-card analytics-insight-${insight.type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="analytics-quality-insight-header">
                    <IconComponent 
                      className="analytics-quality-insight-icon"
                      style={{ color: getPriorityColor(insight.priority) }}
                    />
                    <div className="analytics-quality-insight-title">
                      {insight.title}
                    </div>
                    <span 
                      className="analytics-quality-insight-priority"
                      style={{ backgroundColor: getPriorityColor(insight.priority) }}
                    >
                      {insight.priority}
                    </span>
                  </div>
                  
                  <div className="analytics-quality-insight-description">
                    {insight.description}
                  </div>
                  
                  <div className="analytics-quality-insight-footer">
                    <span className="analytics-quality-insight-effort">
                      Effort: {insight.effort}
                    </span>
                    <span className="analytics-quality-insight-impact">
                      Impact: {insight.impact}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="analytics-quality-recommendations">
          <h4 className="analytics-quality-section-title">Recommendations</h4>
          <div className="analytics-quality-recommendations-list">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                className="analytics-quality-recommendation-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="analytics-quality-recommendation-header">
                  <FaLightbulb className="analytics-quality-recommendation-icon" />
                  <div className="analytics-quality-recommendation-title">
                    {rec.title}
                  </div>
                </div>
                
                <div className="analytics-quality-recommendation-description">
                  {rec.description}
                </div>
                
                <div className="analytics-quality-recommendation-tags">
                  <span 
                    className="analytics-quality-recommendation-tag"
                    style={{ color: getImpactColor(rec.impact) }}
                  >
                    Impact: {rec.impact}
                  </span>
                  <span className="analytics-quality-recommendation-tag">
                    Effort: {rec.effort}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="analytics-quality-stats">
          <div className="analytics-quality-stat">
            <span className="analytics-quality-stat-value">{qualityData.codeSmells}</span>
            <span className="analytics-quality-stat-label">Code Smells</span>
          </div>
          <div className="analytics-quality-stat">
            <span className="analytics-quality-stat-value">{qualityData.duplications}%</span>
            <span className="analytics-quality-stat-label">Duplications</span>
          </div>
          <div className="analytics-quality-stat">
            <span className="analytics-quality-stat-value">{qualityData.complexity}</span>
            <span className="analytics-quality-stat-label">Complexity</span>
          </div>
          <div className="analytics-quality-stat">
            <span className="analytics-quality-stat-value">{qualityData.reliability}%</span>
            <span className="analytics-quality-stat-label">Reliability</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeQualityInsights;
