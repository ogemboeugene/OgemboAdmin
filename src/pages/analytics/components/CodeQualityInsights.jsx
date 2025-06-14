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

const CodeQualityInsights = ({ timeRange, project, settingsConfig, codeQualityData, isLoading: dataLoading }) => {
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
  const [overviewData, setOverviewData] = useState(null);
  const [technologyData, setTechnologyData] = useState(null);
  const [repositoriesData, setRepositoriesData] = useState([]);
  const [loading, setLoading] = useState(true);useEffect(() => {
    // Use real code quality data if available, otherwise simulate
    setTimeout(() => {      if (codeQualityData && codeQualityData.codeQuality && 
          (codeQualityData.codeQuality.maintainabilityIndex > 0 || 
           codeQualityData.codeQuality.testCoverage > 0)) {
        // Map real code quality data to component state
        const maintainabilityIndex = codeQualityData.codeQuality?.maintainabilityIndex || 0;
        const testCoverage = codeQualityData.codeQuality?.testCoverage || 0;
        const technicalDebt = codeQualityData.codeQuality?.technicalDebt || 0;
        const codeComplexity = codeQualityData.codeQuality?.codeComplexity || 0;        const duplicateCode = codeQualityData.codeQuality?.duplicateCodePercentage || 0;
        
        // Calculate overall grade based on metrics
        const averageScore = (maintainabilityIndex + testCoverage) / 2;
        let overallGrade = 'F';
        if (averageScore >= 90) overallGrade = 'A';
        else if (averageScore >= 80) overallGrade = 'B';
        else if (averageScore >= 70) overallGrade = 'C';
        else if (averageScore >= 60) overallGrade = 'D';
        
        setQualityData({
          overallGrade,
          maintainabilityIndex,
          technicalDebt,
          codeSmells: Math.floor(technicalDebt * 5), // Estimate code smells
          duplications: duplicateCode,
          complexity: codeComplexity > 50 ? 'High' : codeComplexity > 25 ? 'Medium' : 'Low',
          testability: testCoverage,
          reliability: Math.min(100, maintainabilityIndex + 10)
        });

        // Generate insights based on real data
        const newInsights = [];
        
        if (testCoverage < 70) {
          newInsights.push({
            type: 'warning',
            icon: FaExclamationTriangle,
            title: 'Low Test Coverage',
            description: `Test coverage is ${testCoverage}%, below recommended 70%`,
            priority: 'high',
            effort: '4-8 hours',
            impact: 'reliability'
          });
        }
        
        if (duplicateCode > 5) {
          newInsights.push({
            type: 'warning',
            icon: FaCode,
            title: 'Code Duplication Detected',
            description: `${duplicateCode}% duplicate code found across the codebase`,
            priority: 'medium',
            effort: '3-5 hours',
            impact: 'maintainability'
          });
        }
        
        if (codeComplexity > 30) {
          newInsights.push({
            type: 'improvement',
            icon: FaLightbulb,
            title: 'High Code Complexity',
            description: `Code complexity score is ${codeComplexity}, consider refactoring`,
            priority: 'medium',
            effort: '2-4 hours',
            impact: 'maintainability'
          });
        }
        
        if (maintainabilityIndex > 80) {
          newInsights.push({
            type: 'success',
            icon: FaCheckCircle,
            title: 'Excellent Maintainability',
            description: `Maintainability index is ${maintainabilityIndex}, well done!`,
            priority: 'low',
            effort: '0 hours',
            impact: 'positive'
          });
        }
        
        setInsights(newInsights);

        // Map overview data
        if (codeQualityData.overview) {
          setOverviewData({
            totalRepositories: codeQualityData.overview.totalRepositories,
            totalStars: codeQualityData.overview.totalStars,
            totalForks: codeQualityData.overview.totalForks,
            avgStarsPerRepo: codeQualityData.overview.avgStarsPerRepo,
            primaryLanguages: codeQualityData.overview.primaryLanguages,
            technologiesUsed: codeQualityData.overview.technologiesUsed
          });
        }

        // Map technology data
        if (codeQualityData.technology) {
          setTechnologyData({
            topTechnologies: codeQualityData.technology.topTechnologies || [],
            languageDistribution: codeQualityData.technology.languageDistribution || [],
            diversityIndex: codeQualityData.technology.diversityIndex
          });
        }

        // Map repositories data
        setRepositoriesData(codeQualityData.repositories || []);

        // Map real recommendations
        const realRecommendations = codeQualityData.recommendations?.map(rec => ({
          id: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          tags: [rec.type],
          icon: rec.type === 'testing' ? FaCheckCircle : FaLightbulb,
          estimatedTime: rec.priority === 'high' ? '4-6 hours' : '2-3 hours',
          impact: rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low',
          effort: rec.priority === 'high' ? '4-6 hours' : '2-3 hours'
        })) || [];
          // Add default recommendations if none exist
        if (realRecommendations.length === 0) {
          realRecommendations.push({
            id: 'maintain',
            title: 'Maintain Current Quality',
            description: 'Continue following current development practices',
            priority: 'low',
            tags: ['quality'],
            icon: FaCheckCircle,
            estimatedTime: 'Ongoing',
            impact: 'low',
            effort: 'Ongoing'
          });
        }
        
        setRecommendations(realRecommendations);      } else {
        // Fallback to simulated data
        setQualityData({
          overallGrade: 'A',
          maintainabilityIndex: 78,
          technicalDebt: 2.5,
          codeSmells: 12,
          duplications: 3.2,
          complexity: 'Medium',
          testability: 85,
          reliability: 92
        });

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
          }
        ]);        setRecommendations([
          {
            id: 1,
            title: 'Implement unit tests for UserService',
            description: 'Add comprehensive test coverage for authentication logic',
            priority: 'high',
            tags: ['testing', 'quality'],
            icon: FaCheckCircle,
            estimatedTime: '4-6 hours',
            impact: 'high',
            effort: '4-6 hours'
          }
        ]);
      }      setLoading(false);
    }, 700);
  }, [timeRange, project, codeQualityData]);

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
    if (!impact || typeof impact !== 'string') return '#6b7280';
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

        {/* Technology Stack Overview */}
        {technologyData && technologyData.topTechnologies && technologyData.topTechnologies.length > 0 && (
          <div className="analytics-quality-technology">
            <h4 className="analytics-quality-section-title">Technology Stack</h4>
            <div className="analytics-quality-tech-grid">
              {technologyData.topTechnologies.slice(0, 6).map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="analytics-quality-tech-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <div className="analytics-quality-tech-name">{tech.name}</div>
                  <div className="analytics-quality-tech-usage">
                    <div className="analytics-quality-tech-bar">
                      <div 
                        className="analytics-quality-tech-bar-fill"
                        style={{ width: `${tech.percentage}%` }}
                      />
                    </div>
                    <span className="analytics-quality-tech-percentage">{tech.percentage}%</span>
                  </div>
                  <div className="analytics-quality-tech-projects">{tech.projectCount} projects</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Repository Overview */}
        {overviewData && (
          <div className="analytics-quality-overview">
            <h4 className="analytics-quality-section-title">Repository Overview</h4>
            <div className="analytics-quality-overview-stats">
              <div className="analytics-quality-overview-stat">
                <FaCode className="analytics-quality-overview-icon" />
                <div className="analytics-quality-overview-stat-content">
                  <div className="analytics-quality-overview-stat-value">{overviewData.totalRepositories}</div>
                  <div className="analytics-quality-overview-stat-label">Repositories</div>
                </div>
              </div>
              <div className="analytics-quality-overview-stat">
                <FaEye className="analytics-quality-overview-icon" />
                <div className="analytics-quality-overview-stat-content">
                  <div className="analytics-quality-overview-stat-value">{overviewData.totalStars}</div>
                  <div className="analytics-quality-overview-stat-label">Total Stars</div>
                </div>
              </div>
              <div className="analytics-quality-overview-stat">
                <FaSync className="analytics-quality-overview-icon" />
                <div className="analytics-quality-overview-stat-content">
                  <div className="analytics-quality-overview-stat-value">{overviewData.totalForks}</div>
                  <div className="analytics-quality-overview-stat-label">Total Forks</div>
                </div>
              </div>
              <div className="analytics-quality-overview-stat">
                <FaChartLine className="analytics-quality-overview-icon" />
                <div className="analytics-quality-overview-stat-content">
                  <div className="analytics-quality-overview-stat-value">{overviewData.avgStarsPerRepo}</div>
                  <div className="analytics-quality-overview-stat-label">Avg Stars/Repo</div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    Impact: {rec.impact || 'Unknown'}
                  </span>
                  <span className="analytics-quality-recommendation-tag">
                    Effort: {rec.effort || 'TBD'}
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
