import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaChartPie, 
  FaEye,
  FaFireAlt,
  FaTrophy,
  FaGraduationCap,
  FaBriefcase,
  FaCogs,
  FaProjectDiagram,
  FaTasks,
  FaCalendarAlt,
  FaBell,
  FaComments,
  FaClock,
  FaHeart
} from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import './ProfileAnalytics.css';

const ProfileAnalytics = ({ 
  profileData, 
  isLoading = false, 
  settingsConfig = {} 
}) => {
  console.log('🔍 ProfileAnalytics render:', { profileData, isLoading });

  if (isLoading || !profileData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="profile-analytics-container"
      >
        <Card className="profile-analytics-card loading">
          <div className="profile-analytics-header">
            <h3>Profile Analytics</h3>
            <div className="profile-analytics-loading-spinner"></div>
          </div>
          <div className="profile-analytics-content">
            <div className="profile-analytics-loading-placeholder"></div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'error';
  };

  const getActivityLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'very_active':
        return 'success';
      case 'active':
        return 'info';
      case 'moderate':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getActivityLevelLabel = (level) => {
    return level?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const getInsightColor = (insight) => {
    switch (insight?.toLowerCase()) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'needs_improvement':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getInsightLabel = (insight) => {
    return insight?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="profile-analytics-container"
    >
      <Card className="profile-analytics-card">
        <div className="profile-analytics-header">
          <div className="profile-analytics-title">
            <FaUser className="profile-analytics-header-icon" />
            <h3>Profile Analytics</h3>
          </div>
          <div className="profile-analytics-completion-badge">
            <Badge variant={getCompletionColor(profileData.profile_completion)} size="sm">
              {formatPercentage(profileData.profile_completion)} Complete
            </Badge>
          </div>
        </div>

        <div className="profile-analytics-content">
          {/* Profile Overview */}
          <div className="profile-analytics-section">
            <h4 className="profile-analytics-section-title">
              <FaChartPie className="profile-analytics-section-icon" />
              Profile Overview
            </h4>
            <div className="profile-analytics-overview-grid">
              <div className="profile-analytics-overview-item">
                <div className="profile-analytics-overview-icon completion">
                  <FaTrophy />
                </div>
                <div className="profile-analytics-overview-details">
                  <span className="profile-analytics-overview-value">
                    {formatPercentage(profileData.profile_completion)}
                  </span>
                  <span className="profile-analytics-overview-label">Profile Completion</span>
                  <div className="profile-analytics-progress-bar">
                    <div 
                      className="profile-analytics-progress-fill" 
                      style={{ width: `${profileData.profile_completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="profile-analytics-overview-item">
                <div className="profile-analytics-overview-icon strength">
                  <FaFireAlt />
                </div>
                <div className="profile-analytics-overview-details">
                  <span className="profile-analytics-overview-value">
                    {profileData.profile_strength || 0}/100
                  </span>
                  <span className="profile-analytics-overview-label">Profile Strength</span>
                  <div className="profile-analytics-progress-bar">
                    <div 
                      className="profile-analytics-progress-fill strength" 
                      style={{ width: `${profileData.profile_strength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="profile-analytics-section">
            <h4 className="profile-analytics-section-title">
              <FaBriefcase className="profile-analytics-section-icon" />
              Content Statistics
            </h4>
            <div className="profile-analytics-content-grid">
              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon experiences">
                  <FaBriefcase />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.experiences)}
                  </span>
                  <span className="profile-analytics-content-label">Experiences</span>
                </div>
              </div>

              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon education">
                  <FaGraduationCap />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.education)}
                  </span>
                  <span className="profile-analytics-content-label">Education</span>
                </div>
              </div>

              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon skills">
                  <FaCogs />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.skills)}
                  </span>
                  <span className="profile-analytics-content-label">Skills</span>
                </div>
              </div>

              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon projects">
                  <FaProjectDiagram />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.projects)}
                  </span>
                  <span className="profile-analytics-content-label">Projects</span>
                </div>
              </div>

              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon tasks">
                  <FaTasks />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.tasks)}
                  </span>
                  <span className="profile-analytics-content-label">Tasks</span>
                  <span className="profile-analytics-content-sub">
                    {formatNumber(profileData.counts?.completed_tasks)} completed
                  </span>
                </div>
              </div>

              <div className="profile-analytics-content-item">
                <div className="profile-analytics-content-icon events">
                  <FaCalendarAlt />
                </div>
                <div className="profile-analytics-content-details">
                  <span className="profile-analytics-content-value">
                    {formatNumber(profileData.counts?.calendar_events)}
                  </span>
                  <span className="profile-analytics-content-label">Events</span>
                  <span className="profile-analytics-content-sub">
                    {formatNumber(profileData.counts?.upcoming_events)} upcoming
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Engagement */}
          <div className="profile-analytics-section">
            <h4 className="profile-analytics-section-title">
              <FaFireAlt className="profile-analytics-section-icon" />
              Activity & Engagement
            </h4>
            <div className="profile-analytics-activity-grid">
              <div className="profile-analytics-activity-card">
                <h5>Activity Level</h5>
                <div className="profile-analytics-activity-level">
                  <Badge variant={getActivityLevelColor(profileData.activity?.activity_level)} size="lg">
                    {getActivityLevelLabel(profileData.activity?.activity_level)}
                  </Badge>
                  <div className="profile-analytics-activity-details">
                    <span>{formatNumber(profileData.activity?.total_sessions)} total sessions</span>
                    <span>{formatNumber(profileData.activity?.sessions_this_week)} this week</span>
                  </div>
                </div>
              </div>

              <div className="profile-analytics-activity-card">
                <h5>Engagement</h5>
                <div className="profile-analytics-engagement-metrics">
                  <div className="profile-analytics-engagement-item">
                    <FaEye className="profile-analytics-engagement-icon" />
                    <div>
                      <span className="profile-analytics-engagement-value">
                        {formatNumber(profileData.engagement?.portfolio_visitors)}
                      </span>
                      <span className="profile-analytics-engagement-label">Portfolio Visitors</span>
                    </div>
                  </div>
                  <div className="profile-analytics-engagement-item">
                    <FaHeart className="profile-analytics-engagement-icon" />
                    <div>
                      <span className="profile-analytics-engagement-value">
                        {profileData.engagement?.content_creation_score || 0}
                      </span>
                      <span className="profile-analytics-engagement-label">Content Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Insights */}
          {profileData.productivity && (
            <div className="profile-analytics-section">
              <h4 className="profile-analytics-section-title">
                <FaTrophy className="profile-analytics-section-icon" />
                Productivity Insights
              </h4>
              <div className="profile-analytics-productivity-grid">
                <div className="profile-analytics-productivity-item">
                  <span className="profile-analytics-productivity-label">Task Completion Rate</span>
                  <span className="profile-analytics-productivity-value">
                    {formatPercentage(profileData.productivity.task_completion_rate)}
                  </span>
                </div>
                <div className="profile-analytics-productivity-item">
                  <span className="profile-analytics-productivity-label">Overdue Rate</span>
                  <span className="profile-analytics-productivity-value">
                    {formatPercentage(profileData.productivity.overdue_rate)}
                  </span>
                </div>
                <div className="profile-analytics-productivity-item">
                  <span className="profile-analytics-productivity-label">Project Activity</span>
                  <span className="profile-analytics-productivity-value">
                    {formatPercentage(profileData.productivity.project_activity_rate)}
                  </span>
                </div>
                <div className="profile-analytics-productivity-item">
                  <span className="profile-analytics-productivity-label">Avg Comments/Task</span>
                  <span className="profile-analytics-productivity-value">
                    {(profileData.productivity.avg_comments_per_task || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Insights */}
          {profileData.insights && (
            <div className="profile-analytics-section">
              <h4 className="profile-analytics-section-title">
                <FaTrophy className="profile-analytics-section-icon" />
                Key Insights
              </h4>
              <div className="profile-analytics-insights-grid">
                <div className="profile-analytics-insight-item">
                  <span className="profile-analytics-insight-label">Most Productive Area</span>
                  <Badge variant="info" size="sm">
                    {getInsightLabel(profileData.insights.most_productive_area)}
                  </Badge>
                </div>
                <div className="profile-analytics-insight-item">
                  <span className="profile-analytics-insight-label">Completion Trend</span>
                  <Badge variant={getInsightColor(profileData.insights.completion_trend)} size="sm">
                    {getInsightLabel(profileData.insights.completion_trend)}
                  </Badge>
                </div>
                <div className="profile-analytics-insight-item">
                  <span className="profile-analytics-insight-label">Profile Completeness</span>
                  <Badge variant={getInsightColor(profileData.insights.profile_completeness)} size="sm">
                    {getInsightLabel(profileData.insights.profile_completeness)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ProfileAnalytics;
