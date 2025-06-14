import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartBar, 
  FaProjectDiagram, 
  FaTasks, 
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaTrendingUp,
  FaCode,
  FaBug,
  FaRocket
} from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import './DashboardOverviewAnalytics.css';

const DashboardOverviewAnalytics = ({ 
  dashboardAnalyticsData,
  taskAnalyticsData, 
  projectAnalyticsData,
  isLoading = false, 
  timeRange = '7d',
  settingsConfig = {} 
}) => {
  console.log('🔍 DashboardOverviewAnalytics render:', { 
    dashboardAnalyticsData, 
    taskAnalyticsData, 
    projectAnalyticsData, 
    isLoading 
  });

  if (isLoading || (!dashboardAnalyticsData && !taskAnalyticsData && !projectAnalyticsData)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-overview-analytics-container"
      >
        <Card className="dashboard-overview-analytics-card loading">
          <div className="dashboard-overview-header">
            <h3>Dashboard Overview Analytics</h3>
            <div className="loading-spinner"></div>
          </div>
          <div className="dashboard-overview-content">
            <div className="loading-placeholder">Loading dashboard analytics...</div>
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  // Extract data from responses
  const dashboardData = dashboardAnalyticsData?.analytics || {};
  const taskData = taskAnalyticsData?.analytics || {};
  const projectData = projectAnalyticsData?.analytics || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="dashboard-overview-analytics-container"
    >
      <Card className="dashboard-overview-analytics-card">
        <div className="dashboard-overview-header">
          <div className="dashboard-overview-title">
            <FaChartBar className="header-icon" />
            <h3>Dashboard Overview Analytics</h3>
          </div>
          <div className="dashboard-overview-period">
            <Badge variant="primary">
              {dashboardData.period || projectData.period || 'Current Period'}
            </Badge>
            {dashboardData.date_range && (
              <span className="date-range">
                {dashboardData.date_range.start_date} - {dashboardData.date_range.end_date}
              </span>
            )}
          </div>
        </div>

        <div className="dashboard-overview-content">
          {/* Summary Metrics */}
          <div className="overview-section">
            <h4 className="section-title">
              <FaTrendingUp className="section-icon" />
              Summary Overview
            </h4>
            <div className="metrics-grid summary-metrics">
              <div className="metric-card projects-metric">
                <div className="metric-icon-wrapper">
                  <FaProjectDiagram className="metric-icon" />
                </div>
                <div className="metric-details">
                  <span className="metric-value">
                    {formatNumber(dashboardData.summary?.total_projects || projectData.summary?.total_projects || 0)}
                  </span>
                  <span className="metric-label">Total Projects</span>
                  <span className="metric-sub">
                    {formatNumber(projectData.summary?.active_projects || 0)} active
                  </span>
                </div>
              </div>
              
              <div className="metric-card tasks-metric">
                <div className="metric-icon-wrapper">
                  <FaTasks className="metric-icon" />
                </div>
                <div className="metric-details">
                  <span className="metric-value">
                    {formatNumber(dashboardData.summary?.total_tasks || taskData.taskMetrics?.totalTasks || 0)}
                  </span>
                  <span className="metric-label">Total Tasks</span>
                  <span className="metric-sub">
                    {formatNumber(dashboardData.summary?.completed_tasks || 0)} completed
                  </span>
                </div>
              </div>
              
              <div className="metric-card events-metric">
                <div className="metric-icon-wrapper">
                  <FaCalendarAlt className="metric-icon" />
                </div>
                <div className="metric-details">
                  <span className="metric-value">
                    {formatNumber(dashboardData.summary?.total_events || 0)}
                  </span>
                  <span className="metric-label">Total Events</span>
                  <span className="metric-sub">Calendar events</span>
                </div>
              </div>
              
              <div className="metric-card completion-metric">
                <div className="metric-icon-wrapper">
                  <FaCheckCircle className="metric-icon" />
                </div>
                <div className="metric-details">
                  <span className="metric-value">
                    {formatPercentage(dashboardData.summary?.task_completion_rate || taskData.productivity?.completionRate || 0)}
                  </span>
                  <span className="metric-label">Completion Rate</span>
                  <span className="metric-sub">Tasks completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Analytics */}
          {projectData && Object.keys(projectData).length > 0 && (
            <div className="overview-section">
              <h4 className="section-title">
                <FaProjectDiagram className="section-icon" />
                Project Analytics
              </h4>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h5>Status Distribution</h5>
                  <div className="status-distribution">
                    {Object.entries(projectData.statusDistribution || {}).map(([status, count]) => (
                      <div key={status} className="status-item">
                        <span className="status-label">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h5>Priority Breakdown</h5>
                  <div className="priority-distribution">
                    {Object.entries(projectData.priorityDistribution || {}).map(([priority, count]) => (
                      <div key={priority} className={`priority-item priority-${priority}`}>
                        <span className="priority-label">{priority}</span>
                        <span className="priority-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h5>Budget Overview</h5>
                  <div className="budget-stats">
                    <div className="budget-item">
                      <span className="budget-label">Total Budget</span>
                      <span className="budget-value">
                        {formatCurrency(dashboardData.budget_analytics?.total_budget || projectData.budgetStats?.total || 0)}
                      </span>
                    </div>
                    <div className="budget-item">
                      <span className="budget-label">Average Budget</span>
                      <span className="budget-value">
                        {formatCurrency(dashboardData.budget_analytics?.average_budget || projectData.budgetStats?.average || 0)}
                      </span>
                    </div>
                    <div className="budget-item">
                      <span className="budget-label">Projects with Budget</span>
                      <span className="budget-value">
                        {projectData.budgetStats?.projectsWithBudget || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {projectData.topTechnologies && projectData.topTechnologies.length > 0 && (
                  <div className="analytics-card">
                    <h5>Top Technologies</h5>
                    <div className="technologies-list">
                      {projectData.topTechnologies.slice(0, 5).map((tech, index) => (
                        <div key={index} className="technology-item">
                          <FaCode className="tech-icon" />
                          <span className="tech-name">{tech.technology}</span>
                          <span className="tech-count">{tech.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Analytics */}
          {taskData && Object.keys(taskData).length > 0 && (
            <div className="overview-section">
              <h4 className="section-title">
                <FaTasks className="section-icon" />
                Task Analytics
              </h4>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h5>Task Status</h5>
                  <div className="task-status-distribution">
                    {Object.entries(taskData.statusDistribution || {}).map(([status, count]) => (
                      <div key={status} className={`task-status-item status-${status}`}>
                        <span className="status-label">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h5>Priority Distribution</h5>
                  <div className="task-priority-distribution">
                    {Object.entries(taskData.priorityDistribution || {}).map(([priority, count]) => (
                      <div key={priority} className={`task-priority-item priority-${priority}`}>
                        <span className="priority-label">{priority}</span>
                        <span className="priority-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h5>Productivity Metrics</h5>
                  <div className="productivity-stats">
                    {taskData.productivity && (
                      <>
                        <div className="productivity-item">
                          <span className="productivity-label">Estimated Hours</span>
                          <span className="productivity-value">{taskData.productivity.totalEstimatedHours || 0}h</span>
                        </div>
                        <div className="productivity-item">
                          <span className="productivity-label">Actual Hours</span>
                          <span className="productivity-value">{taskData.productivity.totalActualHours || 0}h</span>
                        </div>
                        <div className="productivity-item">
                          <span className="productivity-label">Overdue Rate</span>
                          <span className="productivity-value">{formatPercentage(taskData.productivity.overdueRate || 0)}</span>
                        </div>
                        <div className="productivity-item">
                          <span className="productivity-label">Assignment Rate</span>
                          <span className="productivity-value">{formatPercentage(taskData.productivity.assignmentRate || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {taskData.taskMetrics && (
                  <div className="analytics-card">
                    <h5>Task Metrics</h5>
                    <div className="task-metrics-grid">
                      <div className="task-metric-item">
                        <FaExclamationTriangle className="metric-icon overdue" />
                        <div className="metric-content">
                          <span className="metric-value">{taskData.taskMetrics.overdueTasks || 0}</span>
                          <span className="metric-label">Overdue</span>
                        </div>
                      </div>
                      <div className="task-metric-item">
                        <FaUsers className="metric-icon assigned" />
                        <div className="metric-content">
                          <span className="metric-value">{taskData.taskMetrics.assignedTasks || 0}</span>
                          <span className="metric-label">Assigned</span>
                        </div>
                      </div>
                      <div className="task-metric-item">
                        <FaRocket className="metric-icon priority" />
                        <div className="metric-content">
                          <span className="metric-value">{taskData.taskMetrics.highPriorityTasks || 0}</span>
                          <span className="metric-label">High Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Analytics */}
          {dashboardData.calendar_analytics && (
            <div className="overview-section">
              <h4 className="section-title">
                <FaCalendarAlt className="section-icon" />
                Calendar Analytics
              </h4>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h5>Event Types</h5>
                  <div className="event-type-distribution">
                    {Object.entries(dashboardData.calendar_analytics.event_type_distribution || {}).map(([type, count]) => (
                      <div key={type} className="event-type-item">
                        <span className="event-type-label">{type}</span>
                        <span className="event-type-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h5>Events Timeline</h5>
                  <div className="events-timeline">
                    {dashboardData.calendar_analytics.events_over_time?.slice(-5).map((event, index) => (
                      <div key={index} className="timeline-item">
                        <span className="timeline-date">{event.date}</span>
                        <span className="timeline-count">{event.count} events</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="dashboard-overview-footer">
            <span className="last-updated">
              <FaClock className="clock-icon" />
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardOverviewAnalytics;
