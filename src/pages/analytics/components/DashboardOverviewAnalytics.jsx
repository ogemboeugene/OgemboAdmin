import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaProjectDiagram, 
  FaTasks, 
  FaCalendarAlt, 
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import './DashboardOverviewAnalytics.css';

const DashboardOverviewAnalytics = ({ 
  dashboardData, 
  isLoading = false, 
  timeRange = '7d',  settingsConfig = {} 
}) => {

  if (isLoading || !dashboardData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-overview-analytics-container"
      >
        <Card className="dashboard-overview-analytics-card loading">
          <div className="dashboard-overview-analytics-header">
            <h3>Dashboard Overview</h3>
            <div className="dashboard-overview-loading-spinner"></div>
          </div>
          <div className="dashboard-overview-analytics-content">
            <div className="dashboard-overview-loading-placeholder"></div>
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
  const getTrendIcon = (current, target) => {
    if (current > target) return <FaArrowUp className="trend-icon positive" />;
    if (current < target) return <FaArrowDown className="trend-icon negative" />;
    return <FaMinus className="trend-icon neutral" />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'planning':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'neutral';
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}      className="dashboard-overview-analytics-container"
    >
      <Card className="dashboard-overview-analytics-card">
        <div className="dashboard-overview-analytics-header">
          <div className="dashboard-overview-analytics-title">
            <FaChartLine className="dashboard-overview-header-icon" />
            <h3>Dashboard Overview Analytics</h3>
          </div>          <div className="dashboard-overview-period-badge">
            <Badge variant="info" size="sm">
              {dashboardData?.analytics?.period || timeRange}
            </Badge>
          </div>
        </div>        <div className="dashboard-overview-analytics-content">
          {/* Summary Statistics */}
          <div className="dashboard-overview-section">
            <h4 className="dashboard-overview-section-title">
              <FaProjectDiagram className="dashboard-overview-section-icon" />
              Summary Statistics
            </h4>            <div className="dashboard-overview-summary-grid">
              <div className="dashboard-overview-summary-item">
                <div className="dashboard-overview-summary-icon projects">
                  <FaProjectDiagram />
                </div>
                <div className="dashboard-overview-summary-details">
                  <span className="dashboard-overview-summary-value">
                    {formatNumber(dashboardData?.analytics?.summary?.total_projects || 0)}
                  </span>
                  <span className="dashboard-overview-summary-label">Total Projects</span>
                  <span className="dashboard-overview-summary-sub">
                    {formatPercentage(dashboardData?.analytics?.summary?.task_completion_rate || 0)} completion rate
                  </span>
                </div>
              </div>

              <div className="dashboard-overview-summary-item">
                <div className="dashboard-overview-summary-icon tasks">
                  <FaTasks />
                </div>
                <div className="dashboard-overview-summary-details">
                  <span className="dashboard-overview-summary-value">
                    {formatNumber(dashboardData?.analytics?.summary?.total_tasks || 0)}
                  </span>
                  <span className="dashboard-overview-summary-label">Total Tasks</span>
                  <span className="dashboard-overview-summary-sub">
                    {formatNumber(dashboardData?.analytics?.summary?.completed_tasks || 0)} completed
                  </span>
                </div>
              </div>

              <div className="dashboard-overview-summary-item">
                <div className="dashboard-overview-summary-icon events">
                  <FaCalendarAlt />
                </div>
                <div className="dashboard-overview-summary-details">
                  <span className="dashboard-overview-summary-value">
                    {formatNumber(dashboardData?.analytics?.summary?.total_events || 0)}
                  </span>
                  <span className="dashboard-overview-summary-label">Calendar Events</span>
                  <span className="dashboard-overview-summary-sub">this period</span>
                </div>
              </div>

              <div className="dashboard-overview-summary-item">
                <div className="dashboard-overview-summary-icon budget">
                  <FaDollarSign />
                </div>
                <div className="dashboard-overview-summary-details">
                  <span className="dashboard-overview-summary-value">
                    {formatCurrency(dashboardData?.analytics?.budget_analytics?.total_budget || 0)}
                  </span>
                  <span className="dashboard-overview-summary-label">Total Budget</span>
                  <span className="dashboard-overview-summary-sub">
                    {formatNumber(dashboardData?.analytics?.budget_analytics?.projects_with_budget || 0)} projects
                  </span>
                </div>
              </div>
            </div>
          </div>          {/* Project Analytics */}
          <div className="dashboard-overview-section">
            <h4 className="dashboard-overview-section-title">
              <FaProjectDiagram className="dashboard-overview-section-icon" />
              Project Distribution
            </h4>
            <div className="dashboard-overview-distribution-grid">              <div className="dashboard-overview-distribution-card">
                <h5>Status Distribution</h5>
                <div className="dashboard-overview-distribution-items">
                  {dashboardData?.analytics?.project_analytics?.status_distribution && 
                    Object.entries(dashboardData.analytics.project_analytics.status_distribution).map(([status, count]) => {
                      const totalProjects = dashboardData?.analytics?.summary?.total_projects || 0;
                      const percentage = totalProjects > 0 ? ((count / totalProjects) * 100).toFixed(1) : 0;
                      return (
                        <div key={status} className="dashboard-overview-project-status-item">
                          <div className="dashboard-overview-status-header">
                            <Badge variant={getStatusColor(status)} size="sm">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                            <span className="dashboard-overview-status-percentage">{percentage}%</span>
                          </div>
                          <div className="dashboard-overview-status-details">
                            <span className="dashboard-overview-status-count">{count}</span>
                            <span className="dashboard-overview-status-label">projects</span>
                          </div>
                          <div className="dashboard-overview-status-bar">
                            <div 
                              className={`dashboard-overview-status-fill dashboard-overview-status-${status}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  }
                  {!dashboardData?.analytics?.project_analytics?.status_distribution && dashboardData?.projectDistribution?.map((item, index) => (
                    <div key={item.status || index} className="dashboard-overview-project-status-item">
                      <div className="dashboard-overview-status-header">
                        <Badge variant={getStatusColor(item.status)} size="sm">
                          {item.status}
                        </Badge>
                        <span className="dashboard-overview-status-percentage">{item.percentage}%</span>
                      </div>
                      <div className="dashboard-overview-status-details">
                        <span className="dashboard-overview-status-count">{item.count}</span>
                        <span className="dashboard-overview-status-label">projects</span>
                      </div>
                      <div className="dashboard-overview-status-bar">
                        <div 
                          className={`dashboard-overview-status-fill dashboard-overview-status-${item.status?.toLowerCase()}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>              <div className="dashboard-overview-distribution-card">
                <h5>Priority Distribution</h5>
                <div className="dashboard-overview-distribution-items">
                  {dashboardData?.analytics?.project_analytics?.priority_distribution && 
                    Object.keys(dashboardData.analytics.project_analytics.priority_distribution).length > 0 ? (
                    Object.entries(dashboardData.analytics.project_analytics.priority_distribution).map(([priority, count]) => {
                      const totalProjects = dashboardData?.analytics?.summary?.total_projects || 0;
                      const percentage = totalProjects > 0 ? ((count / totalProjects) * 100).toFixed(1) : 0;
                      return (
                        <div key={priority} className="dashboard-overview-project-priority-item">
                          <div className="dashboard-overview-priority-header">
                            <Badge variant={getPriorityColor(priority)} size="sm">
                              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                            </Badge>
                            <span className="dashboard-overview-priority-percentage">{percentage}%</span>
                          </div>
                          <div className="dashboard-overview-priority-details">
                            <span className="dashboard-overview-priority-count">{count}</span>
                            <span className="dashboard-overview-priority-label">projects</span>
                          </div>
                          <div className="dashboard-overview-priority-indicator">
                            <div className={`dashboard-overview-priority-icon dashboard-overview-priority-${priority}`}>
                              {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (                    <div className="dashboard-overview-no-data">
                      <span>No priority data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>          {/* Task Analytics */}
          <div className="dashboard-overview-section">
            <h4 className="dashboard-overview-section-title">
              <FaTasks className="dashboard-overview-section-icon" />
              Task Distribution
            </h4>
            <div className="dashboard-overview-distribution-grid">              <div className="dashboard-overview-distribution-card">
                <h5>Status Distribution</h5>
                <div className="dashboard-overview-distribution-items">
                  {dashboardData?.analytics?.task_analytics?.status_distribution && 
                    Object.entries(dashboardData.analytics.task_analytics.status_distribution).map(([status, count]) => {
                      const totalTasks = dashboardData?.analytics?.summary?.total_tasks || 0;
                      const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(1) : 0;
                      return (
                        <div key={status} className="dashboard-overview-task-status-item">
                          <div className="dashboard-overview-task-status-header">
                            <Badge variant={getStatusColor(status)} size="sm">
                              {status === 'done' ? 'Completed' : status === 'todo' ? 'To Do' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                            <span className="dashboard-overview-task-status-percentage">{percentage}%</span>
                          </div>
                          <div className="dashboard-overview-task-status-details">
                            <span className="dashboard-overview-task-status-count">{count}</span>
                            <span className="dashboard-overview-task-status-label">tasks</span>
                          </div>
                          <div className="dashboard-overview-task-progress-bar">
                            <div 
                              className={`dashboard-overview-task-progress-fill dashboard-overview-task-${status}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>              <div className="dashboard-overview-distribution-card">
                <h5>Priority Distribution</h5>
                <div className="dashboard-overview-distribution-items">
                  {dashboardData?.analytics?.task_analytics?.priority_distribution && 
                    Object.keys(dashboardData.analytics.task_analytics.priority_distribution).length > 0 ? (
                    Object.entries(dashboardData.analytics.task_analytics.priority_distribution).map(([priority, count]) => {
                      const totalTasks = dashboardData?.analytics?.summary?.total_tasks || 0;
                      const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(1) : 0;
                      return (
                        <div key={priority} className="dashboard-overview-task-priority-item">
                          <div className="dashboard-overview-task-priority-header">
                            <Badge variant={getPriorityColor(priority)} size="sm">
                              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                            </Badge>
                            <span className="dashboard-overview-task-priority-percentage">{percentage}%</span>
                          </div>
                          <div className="dashboard-overview-task-priority-details">
                            <span className="dashboard-overview-task-priority-count">{count}</span>
                            <span className="dashboard-overview-task-priority-label">tasks</span>
                          </div>
                          <div className="dashboard-overview-task-priority-indicator">
                            <div className={`dashboard-overview-task-priority-icon dashboard-overview-task-priority-${priority}`}>
                              {priority === 'high' ? '⚡' : priority === 'medium' ? '📋' : '📝'}
                            </div>
                            <div className="dashboard-overview-task-priority-urgency">
                              {priority === 'high' ? 'Urgent' : priority === 'medium' ? 'Normal' : 'Low Priority'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="dashboard-overview-no-data">                      <span>No priority data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Analytics */}
          <div className="dashboard-overview-section">
            <h4 className="dashboard-overview-section-title">
              <FaCalendarAlt className="dashboard-overview-section-icon" />
              Calendar Events
            </h4>            <div className="dashboard-overview-calendar-grid">
              {dashboardData?.analytics?.calendar_analytics?.event_type_distribution && 
                Object.entries(dashboardData.analytics.calendar_analytics.event_type_distribution).map(([type, count]) => {
                  const totalEvents = dashboardData?.analytics?.summary?.total_events || 0;
                  const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
                  const eventIcon = {
                    'appointment': '📅',
                    'conference': '🎤',
                    'meeting': '👥',
                    'milestone': '🎯',
                    'project': '📊',
                    'task': '✅'
                  };
                  
                  return (
                    <div key={type} className="dashboard-overview-calendar-event-item">
                      <div className="dashboard-overview-calendar-event-header">
                        <div className="dashboard-overview-calendar-event-icon">
                          {eventIcon[type] || '📝'}
                        </div>
                        <div className="dashboard-overview-calendar-event-info">
                          <span className="dashboard-overview-calendar-event-count">{count}</span>
                          <span className="dashboard-overview-calendar-event-type">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="dashboard-overview-calendar-event-details">
                        <div className="dashboard-overview-calendar-event-percentage">
                          {percentage}% of events
                        </div>
                        <div className="dashboard-overview-calendar-event-bar">
                          <div 
                            className={`dashboard-overview-calendar-event-fill dashboard-overview-calendar-${type}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              {!dashboardData?.analytics?.calendar_analytics?.event_type_distribution && dashboardData?.calendarEvents?.map((event, index) => (
                <div key={event.type || index} className="dashboard-overview-calendar-item">
                  <div className="dashboard-overview-calendar-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="dashboard-overview-calendar-details">
                    <span className="dashboard-overview-calendar-count">{event.count}</span>
                    <span className="dashboard-overview-calendar-type">{event.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Time Range Info */}
          <div className="dashboard-overview-footer">
            <span className="dashboard-overview-time-range">
              <FaClock className="dashboard-overview-clock-icon" />
              Period: {dashboardData?.analytics?.date_range?.start_date || 'Unknown'} to {dashboardData?.analytics?.date_range?.end_date || 'Unknown'}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardOverviewAnalytics;
