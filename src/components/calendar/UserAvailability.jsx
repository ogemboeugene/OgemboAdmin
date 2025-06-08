import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

/**
 * Component for displaying user availability data
 */
const UserAvailability = ({ availability, onCreateEvent, timezone }) => {
  if (!availability) return null;
  // Data validation - ensure we have the expected structure
  console.log('📅 UserAvailability validation check:', {
    availability,
    hasUsers: !!availability.users,
    isUsersArray: Array.isArray(availability.users),
    hasSummary: !!availability.summary,
    hasDateRange: !!availability.summary?.date_range,
    summaryStructure: availability.summary
  });

  if (!availability.users || !Array.isArray(availability.users) || !availability.summary || !availability.summary.date_range) {
    console.error('Invalid availability data structure:', {
      availability,
      missingUsers: !availability.users,
      notUsersArray: !Array.isArray(availability.users),
      missingSummary: !availability.summary,
      missingDateRange: !availability.summary?.date_range
    });
    return (
      <div className="error-message p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-medium text-red-800">Invalid Data Format</h3>
        <p className="text-red-600">The availability data is not in the expected format.</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">Debug Info</summary>
          <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(availability, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  
  const { users, summary } = availability;
  const { date_range } = summary;
  
  // Handle empty users array
  if (users.length === 0) {
    return (
      <div className="empty-state p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users selected</h3>
        <p className="mt-1 text-sm text-gray-500">Please select users to view their availability.</p>
      </div>
    );
  }
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(3);
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  
  // Reset pagination when availability data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [availability]);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Time formatting with error handling
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    
    try {
      // Format time with timezone if provided
      return new Date(isoString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: timezone || undefined
      });
    } catch (err) {
      console.error('Error formatting time:', err, isoString);
      return '—';
    }
  };
  
  // Date formatting with error handling
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timezone || undefined
      });
    } catch (err) {
      console.error('Error formatting date:', err, dateString);
      return dateString || '—';
    }
  };

  // Format time in a standardized way for display
  const formatCurrentTime = () => {
    try {
      return new Date().toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone || undefined
      });
    } catch (err) {
      return new Date().toLocaleString();
    }
  };

  const handleCreateEvent = (timeSlot, userId) => {
    if (onCreateEvent) {
      onCreateEvent(timeSlot, userId);
    }
  };
  return (
    <div className="user-availability-container">
      {/* Comprehensive responsive and dark mode styling */}
      <style jsx>{`
        /* Base Container Styles */
        .user-availability-container {
          background: var(--container-bg, #ffffff);
          color: var(--container-text, #1f2937);
          border-radius: var(--container-border-radius, 0.75rem);
          transition: all 0.3s ease;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        /* Summary Section Styles */
        .summary {
          background: var(--summary-bg, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--summary-border-radius, 0.75rem);
          padding: var(--summary-padding, 1.5rem);
          margin-bottom: var(--summary-margin-bottom, 1.5rem);
          box-shadow: var(--summary-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
          transition: all 0.3s ease;
        }
        
        .summary h3 {
          font-size: var(--summary-title-size, 1.125rem);
          font-weight: 600;
          margin-bottom: var(--summary-title-margin, 1rem);
          color: var(--summary-title-color, #1f2937);
          line-height: 1.2;
        }
        
        .summary .grid {
          display: grid;
          grid-template-columns: var(--summary-grid-columns, repeat(auto-fit, minmax(150px, 1fr)));
          gap: var(--summary-grid-gap, 1rem);
        }
        
        .summary .stat {
          display: flex;
          flex-direction: column;
          gap: var(--stat-gap, 0.25rem);
        }
        
        .summary .stat .label {
          font-size: var(--stat-label-size, 0.875rem);
          color: var(--muted-text, #6b7280);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .summary .stat .value {
          font-size: var(--stat-value-size, 1rem);
          font-weight: 600;
          color: var(--stat-value-color, #1f2937);
          line-height: 1.2;
        }
        
        /* Current Time Indicator */
        .current-time-indicator {
          margin-top: var(--time-indicator-margin-top, 1rem);
          padding-top: var(--time-indicator-padding-top, 1rem);
          border-top: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          align-items: center;
          gap: var(--time-indicator-gap, 0.5rem);
          font-size: var(--time-indicator-font-size, 0.875rem);
        }
        
        .time-dot {
          width: var(--time-dot-size, 0.75rem);
          height: var(--time-dot-size, 0.75rem);
          border-radius: 50%;
          background: var(--time-dot-color, #3b82f6);
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }
        
        /* Common Availability Section */
        .common-availability {
          margin-bottom: var(--common-availability-margin, 2rem);
        }
        
        .common-availability h3 {
          font-size: var(--section-title-size, 1.125rem);
          font-weight: 600;
          margin-bottom: var(--section-title-margin, 1rem);
          color: var(--section-title-color, #1f2937);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .common-availability h3::before {
          content: '';
          width: 4px;
          height: 1.25rem;
          background: var(--accent-color, #10b981);
          border-radius: 2px;
        }
        
        .common-availability .grid {
          display: grid;
          grid-template-columns: var(--slots-grid-columns, repeat(auto-fit, minmax(280px, 1fr)));
          gap: var(--slots-grid-gap, 1rem);
        }
        
        .common-availability .slot {
          background: var(--slot-bg, #f0fdf4);
          border: 1px solid var(--slot-border, #bbf7d0);
          border-radius: var(--slot-border-radius, 0.5rem);
          padding: var(--slot-padding, 1rem);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .common-availability .slot:hover {
          transform: translateY(-2px);
          box-shadow: var(--slot-hover-shadow, 0 4px 12px rgba(16, 185, 129, 0.15));
          border-color: var(--slot-hover-border, #16a34a);
        }
        
        .common-availability .slot::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--slot-accent, #10b981);
        }
        
        .common-availability .slot .date {
          font-weight: 600;
          color: var(--slot-date-color, #166534);
          margin-bottom: var(--slot-date-margin, 0.5rem);
          font-size: var(--slot-date-size, 0.875rem);
        }
        
        .common-availability .slot .time {
          color: var(--slot-time-color, #059669);
          margin-bottom: var(--slot-time-margin, 0.75rem);
          font-size: var(--slot-time-size, 0.875rem);
          font-weight: 500;
        }
        
        /* User Section Styles */
        .users-availability {
          display: flex;
          flex-direction: column;
          gap: var(--users-gap, 2rem);
        }
        
        .user-section {
          background: var(--user-section-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--user-section-border-radius, 0.75rem);
          padding: var(--user-section-padding, 1.5rem);
          box-shadow: var(--user-section-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
          transition: all 0.3s ease;
          position: relative;
        }
        
        .user-section:hover {
          box-shadow: var(--user-section-hover-shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
          transform: translateY(-1px);
        }
        
        .user-section h3 {
          font-size: var(--user-title-size, 1.125rem);
          font-weight: 600;
          margin-bottom: var(--user-title-margin, 1rem);
          color: var(--user-title-color, #1f2937);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .user-section .user-name {
          color: var(--user-name-color, #1f2937);
        }
        
        .user-section .email {
          font-size: var(--user-email-size, 0.875rem);
          color: var(--muted-text, #6b7280);
          font-weight: 400;
        }
        
        /* Day Card Styles */
        .day-card {
          margin-bottom: var(--day-card-margin, 1rem);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--day-card-border-radius, 0.5rem);
          overflow: hidden;
          background: var(--day-card-bg, #ffffff);
          box-shadow: var(--day-card-shadow, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
          transition: all 0.3s ease;
        }
        
        .day-card:hover {
          box-shadow: var(--day-card-hover-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        }
        
        .day-header {
          padding: var(--day-header-padding, 1rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .day-header.busy-header {
          background: var(--busy-header-bg, #fef2f2);
          color: var(--busy-header-text, #991b1b);
          border-bottom: 1px solid var(--busy-header-border, #fecaca);
        }
        
        .day-header.free-header {
          background: var(--free-header-bg, #f0fdf4);
          color: var(--free-header-text, #166534);
          border-bottom: 1px solid var(--free-header-border, #bbf7d0);
        }
        
        .day-header h4 {
          font-size: var(--day-header-title-size, 1rem);
          margin: 0;
          line-height: 1.2;
        }
        
        .status {
          padding: var(--status-padding, 0.25rem 0.75rem);
          border-radius: var(--status-border-radius, 9999px);
          font-size: var(--status-font-size, 0.75rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          transition: all 0.3s ease;
        }
        
        .status.busy {
          background: var(--status-busy-bg, #fecaca);
          color: var(--status-busy-text, #991b1b);
        }
        
        .status.free {
          background: var(--status-free-bg, #bbf7d0);
          color: var(--status-free-text, #166534);
        }
        
        /* Day Content Styles */
        .day-content {
          padding: var(--day-content-padding, 1rem);
          background: var(--day-content-bg, #fafafa);
        }
        
        .busy-periods, .free-periods {
          margin-bottom: var(--periods-margin, 1rem);
        }
        
        .busy-periods:last-child, .free-periods:last-child {
          margin-bottom: 0;
        }
        
        .busy-periods h5, .free-periods h5 {
          font-size: var(--period-title-size, 0.875rem);
          font-weight: 600;
          margin-bottom: var(--period-title-margin, 0.75rem);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .busy-periods h5 {
          color: var(--busy-title-color, #dc2626);
        }
        
        .busy-periods h5::before {
          content: '';
          width: 3px;
          height: 1rem;
          background: var(--busy-accent, #dc2626);
          border-radius: 1.5px;
        }
        
        .free-periods h5 {
          color: var(--free-title-color, #059669);
        }
        
        .free-periods h5::before {
          content: '';
          width: 3px;
          height: 1rem;
          background: var(--free-accent, #059669);
          border-radius: 1.5px;
        }
        
        /* Period Styles */
        .busy-periods .period {
          margin-bottom: var(--period-margin, 0.75rem);
          padding-left: var(--period-padding-left, 1rem);
          border-left: 2px solid var(--busy-border, #fca5a5);
          background: var(--busy-period-bg, #fef2f2);
          padding: var(--busy-period-padding, 0.75rem);
          border-radius: var(--period-border-radius, 0.375rem);
          border-left-width: 3px;
          transition: all 0.3s ease;
        }
        
        .busy-periods .period:hover {
          background: var(--busy-period-hover-bg, #fee2e2);
          border-left-color: var(--busy-hover-border, #f87171);
        }
        
        .free-periods .periods {
          display: grid;
          grid-template-columns: var(--free-periods-grid, repeat(auto-fit, minmax(200px, 1fr)));
          gap: var(--free-periods-gap, 0.75rem);
        }
        
        .free-periods .period {
          background: var(--free-period-bg, #f0fdf4);
          border: 1px solid var(--free-period-border, #bbf7d0);
          border-radius: var(--period-border-radius, 0.375rem);
          padding: var(--free-period-padding, 0.75rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--free-period-gap, 0.5rem);
          transition: all 0.3s ease;
        }
        
        .free-periods .period:hover {
          background: var(--free-period-hover-bg, #dcfce7);
          border-color: var(--free-period-hover-border, #16a34a);
          transform: translateY(-1px);
          box-shadow: var(--free-period-hover-shadow, 0 2px 8px rgba(16, 185, 129, 0.15));
        }
        
        .period .time {
          font-size: var(--period-time-size, 0.875rem);
          font-weight: 500;
          color: var(--period-time-color, #374151);
        }
        
        .period .event-title {
          font-size: var(--event-title-size, 0.875rem);
          font-weight: 600;
          color: var(--event-title-color, #1f2937);
          margin-top: var(--event-title-margin, 0.25rem);
        }
        
        .period .all-day {
          font-size: var(--all-day-size, 0.75rem);
          color: var(--muted-text, #6b7280);
          font-style: italic;
          margin-top: var(--all-day-margin, 0.25rem);
        }
        
        /* No Data Display */
        .no-data {
          text-align: center;
          padding: var(--no-data-padding, 2rem);
          color: var(--muted-text, #6b7280);
          background: var(--no-data-bg, #f9fafb);
          border-radius: var(--no-data-border-radius, 0.375rem);
          border: 1px dashed var(--no-data-border, #d1d5db);
        }
        
        /* Empty State Styles */
        .empty-state {
          text-align: center;
          padding: var(--empty-state-padding, 3rem);
          color: var(--muted-text, #6b7280);
          background: var(--empty-state-bg, #f9fafb);
          border-radius: var(--empty-state-border-radius, 0.75rem);
          border: 1px dashed var(--empty-state-border, #d1d5db);
        }
        
        .empty-state svg {
          width: var(--empty-state-icon-size, 3rem);
          height: var(--empty-state-icon-size, 3rem);
          margin: 0 auto var(--empty-state-icon-margin, 1rem);
          color: var(--empty-state-icon-color, #9ca3af);
        }
        
        .empty-state h3 {
          font-size: var(--empty-state-title-size, 1rem);
          font-weight: 600;
          margin-bottom: var(--empty-state-title-margin, 0.5rem);
          color: var(--empty-state-title-color, #374151);
        }
        
        .empty-state p {
          font-size: var(--empty-state-text-size, 0.875rem);
          color: var(--muted-text, #6b7280);
        }
        
        /* Error Display */
        .error-message {
          background: var(--error-bg, #fef2f2);
          border: 1px solid var(--error-border, #fecaca);
          border-left: 4px solid var(--error-accent, #ef4444);
          border-radius: var(--error-border-radius, 0.5rem);
          padding: var(--error-padding, 1rem);
          margin-bottom: var(--error-margin, 1rem);
          color: var(--error-text, #dc2626);
        }
        
        .error-message h3 {
          font-size: var(--error-title-size, 1rem);
          font-weight: 600;
          margin-bottom: var(--error-title-margin, 0.5rem);
          color: var(--error-title-color, #991b1b);
        }
        
        .error-message p {
          font-size: var(--error-text-size, 0.875rem);
          margin-bottom: var(--error-text-margin, 0.75rem);
        }
        
        .error-message details {
          margin-top: var(--error-details-margin, 0.75rem);
        }
        
        .error-message summary {
          cursor: pointer;
          font-size: var(--error-summary-size, 0.875rem);
          color: var(--error-summary-color, #7f1d1d);
          font-weight: 500;
        }
        
        .error-message pre {
          background: var(--error-pre-bg, #f3f4f6);
          padding: var(--error-pre-padding, 0.75rem);
          border-radius: var(--error-pre-border-radius, 0.375rem);
          font-size: var(--error-pre-size, 0.75rem);
          overflow: auto;
          margin-top: var(--error-pre-margin, 0.5rem);
          color: var(--error-pre-color, #374151);
          white-space: pre-wrap;
          word-break: break-all;
        }
        
        /* Pagination Styles */
        .pagination-container {
          margin-top: var(--pagination-margin-top, 2rem);
          padding-top: var(--pagination-padding-top, 1.5rem);
          border-top: 1px solid var(--border-color, #e2e8f0);
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          margin-bottom: var(--pagination-margin-bottom, 1rem);
        }
        
        .pagination ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: var(--pagination-gap, 0.25rem);
        }
        
        .pagination button {
          padding: var(--pagination-button-padding, 0.5rem 0.75rem);
          border-radius: var(--pagination-button-border-radius, 0.375rem);
          font-size: var(--pagination-button-size, 0.875rem);
          font-weight: 500;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--pagination-button-bg, #ffffff);
          color: var(--pagination-button-text, #374151);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pagination button:hover:not(:disabled) {
          background: var(--pagination-button-hover-bg, #f3f4f6);
          border-color: var(--pagination-button-hover-border, #d1d5db);
          transform: translateY(-1px);
        }
        
        .pagination button:disabled {
          background: var(--pagination-button-disabled-bg, #f9fafb);
          color: var(--pagination-button-disabled-text, #9ca3af);
          cursor: not-allowed;
          border-color: var(--pagination-button-disabled-border, #f3f4f6);
        }
        
        .pagination button.active {
          background: var(--pagination-active-bg, #3b82f6);
          color: var(--pagination-active-text, #ffffff);
          border-color: var(--pagination-active-border, #3b82f6);
        }
        
        .pagination button.active:hover {
          background: var(--pagination-active-hover-bg, #2563eb);
          border-color: var(--pagination-active-hover-border, #2563eb);
        }
        
        /* Pagination Info */
        .pagination-container .text-center {
          text-align: center;
          font-size: var(--pagination-info-size, 0.875rem);
          color: var(--muted-text, #6b7280);
        }
        
        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .user-availability-container {
            --container-bg: #1f2937;
            --container-text: #f9fafb;
            --summary-bg: #374151;
            --border-color: #4b5563;
            --summary-title-color: #f9fafb;
            --summary-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
            --muted-text: #9ca3af;
            --stat-value-color: #f3f4f6;
            --section-title-color: #f9fafb;
            --accent-color: #34d399;
            --time-dot-color: #3b82f6;
            --slot-bg: #064e3b;
            --slot-border: #047857;
            --slot-date-color: #6ee7b7;
            --slot-time-color: #34d399;
            --slot-hover-border: #059669;
            --slot-accent: #10b981;
            --user-section-bg: #374151;
            --user-section-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
            --user-section-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            --user-title-color: #f9fafb;
            --user-name-color: #f3f4f6;
            --day-card-bg: #4b5563;
            --day-card-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
            --day-card-hover-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            --busy-header-bg: #7f1d1d;
            --busy-header-text: #fca5a5;
            --busy-header-border: #991b1b;
            --free-header-bg: #064e3b;
            --free-header-text: #6ee7b7;
            --free-header-border: #047857;
            --day-content-bg: #6b7280;
            --status-busy-bg: #991b1b;
            --status-busy-text: #fecaca;
            --status-free-bg: #047857;
            --status-free-text: #bbf7d0;
            --busy-title-color: #f87171;
            --free-title-color: #34d399;
            --busy-accent: #ef4444;
            --free-accent: #10b981;
            --busy-period-bg: #7f1d1d;
            --busy-period-hover-bg: #991b1b;
            --busy-border: #dc2626;
            --busy-hover-border: #ef4444;
            --free-period-bg: #064e3b;
            --free-period-border: #047857;
            --free-period-hover-bg: #065f46;
            --free-period-hover-border: #059669;
            --period-time-color: #d1d5db;
            --event-title-color: #f3f4f6;
            --no-data-bg: #4b5563;
            --no-data-border: #6b7280;
            --empty-state-bg: #374151;
            --empty-state-border: #4b5563;
            --empty-state-icon-color: #6b7280;
            --empty-state-title-color: #d1d5db;
            --error-bg: #7f1d1d;
            --error-border: #991b1b;
            --error-text: #fca5a5;
            --error-title-color: #fecaca;
            --error-summary-color: #f87171;
            --error-pre-bg: #4b5563;
            --error-pre-color: #d1d5db;
            --pagination-button-bg: #4b5563;
            --pagination-button-text: #d1d5db;
            --pagination-button-hover-bg: #6b7280;
            --pagination-button-hover-border: #9ca3af;
            --pagination-button-disabled-bg: #374151;
            --pagination-button-disabled-text: #6b7280;
            --pagination-button-disabled-border: #4b5563;
            --pagination-active-bg: #2563eb;
            --pagination-active-text: #ffffff;
            --pagination-active-border: #2563eb;
            --pagination-active-hover-bg: #1d4ed8;
            --pagination-active-hover-border: #1d4ed8;
          }
        }
        
        .dark .user-availability-container {
          --container-bg: #1f2937;
          --container-text: #f9fafb;
          --summary-bg: #374151;
          --border-color: #4b5563;
          --summary-title-color: #f9fafb;
          --summary-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          --muted-text: #9ca3af;
          --stat-value-color: #f3f4f6;
          --section-title-color: #f9fafb;
          --accent-color: #34d399;
          --time-dot-color: #3b82f6;
          --slot-bg: #064e3b;
          --slot-border: #047857;
          --slot-date-color: #6ee7b7;
          --slot-time-color: #34d399;
          --slot-hover-border: #059669;
          --slot-accent: #10b981;
          --user-section-bg: #374151;
          --user-section-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
          --user-section-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          --user-title-color: #f9fafb;
          --user-name-color: #f3f4f6;
          --day-card-bg: #4b5563;
          --day-card-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --day-card-hover-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          --busy-header-bg: #7f1d1d;
          --busy-header-text: #fca5a5;
          --busy-header-border: #991b1b;
          --free-header-bg: #064e3b;
          --free-header-text: #6ee7b7;
          --free-header-border: #047857;
          --day-content-bg: #6b7280;
          --status-busy-bg: #991b1b;
          --status-busy-text: #fecaca;
          --status-free-bg: #047857;
          --status-free-text: #bbf7d0;
          --busy-title-color: #f87171;
          --free-title-color: #34d399;
          --busy-accent: #ef4444;
          --free-accent: #10b981;
          --busy-period-bg: #7f1d1d;
          --busy-period-hover-bg: #991b1b;
          --busy-border: #dc2626;
          --busy-hover-border: #ef4444;
          --free-period-bg: #064e3b;
          --free-period-border: #047857;
          --free-period-hover-bg: #065f46;
          --free-period-hover-border: #059669;
          --period-time-color: #d1d5db;
          --event-title-color: #f3f4f6;
          --no-data-bg: #4b5563;
          --no-data-border: #6b7280;
          --empty-state-bg: #374151;
          --empty-state-border: #4b5563;
          --empty-state-icon-color: #6b7280;
          --empty-state-title-color: #d1d5db;
          --error-bg: #7f1d1d;
          --error-border: #991b1b;
          --error-text: #fca5a5;
          --error-title-color: #fecaca;
          --error-summary-color: #f87171;
          --error-pre-bg: #4b5563;
          --error-pre-color: #d1d5db;
          --pagination-button-bg: #4b5563;
          --pagination-button-text: #d1d5db;
          --pagination-button-hover-bg: #6b7280;
          --pagination-button-hover-border: #9ca3af;
          --pagination-button-disabled-bg: #374151;
          --pagination-button-disabled-text: #6b7280;
          --pagination-button-disabled-border: #4b5563;
          --pagination-active-bg: #2563eb;
          --pagination-active-text: #ffffff;
          --pagination-active-border: #2563eb;
          --pagination-active-hover-bg: #1d4ed8;
          --pagination-active-hover-border: #1d4ed8;
        }
        
        /* Responsive Design - Extra Large Screens */
        @media (min-width: 1440px) {
          .user-availability-container {
            --summary-padding: 2rem;
            --summary-title-size: 1.25rem;
            --summary-grid-gap: 1.5rem;
            --stat-label-size: 1rem;
            --stat-value-size: 1.125rem;
            --section-title-size: 1.25rem;
            --slots-grid-gap: 1.5rem;
            --slot-padding: 1.25rem;
            --user-section-padding: 2rem;
            --user-title-size: 1.25rem;
            --day-header-padding: 1.25rem;
            --day-content-padding: 1.25rem;
            --period-title-size: 1rem;
            --empty-state-padding: 4rem;
            --empty-state-icon-size: 4rem;
            --empty-state-title-size: 1.125rem;
            --error-padding: 1.5rem;
            --pagination-margin-top: 2.5rem;
            --pagination-padding-top: 2rem;
            --pagination-button-padding: 0.75rem 1rem;
          }
        }
        
        /* Responsive Design - Large Screens */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .user-availability-container {
            --summary-padding: 1.75rem;
            --summary-title-size: 1.1875rem;
            --summary-grid-gap: 1.25rem;
            --section-title-size: 1.1875rem;
            --slots-grid-gap: 1.25rem;
            --user-section-padding: 1.75rem;
            --user-title-size: 1.1875rem;
            --day-header-padding: 1.125rem;
            --day-content-padding: 1.125rem;
          }
        }
        
        /* Responsive Design - Tablet */
        @media (min-width: 768px) and (max-width: 1023px) {
          .user-availability-container {
            --summary-grid-columns: repeat(2, 1fr);
            --slots-grid-columns: repeat(2, 1fr);
            --free-periods-grid: 1fr;
            --user-title-size: 1.125rem;
            --day-header-title-size: 0.9375rem;
            --period-title-size: 0.8125rem;
            --pagination-button-padding: 0.5rem 0.875rem;
          }
          
          .user-section h3 {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .day-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--day-header-gap, 0.5rem);
          }
          
          .day-header h4 {
            order: 1;
          }
          
          .status {
            order: 2;
            align-self: flex-start;
          }
        }
        
        /* Responsive Design - Mobile */
        @media (max-width: 767px) {
          .user-availability-container {
            --summary-padding: 1rem;
            --summary-title-size: 1rem;
            --summary-grid-columns: 1fr;
            --summary-grid-gap: 0.75rem;
            --stat-label-size: 0.8125rem;
            --stat-value-size: 0.9375rem;
            --summary-margin-bottom: 1rem;
            --section-title-size: 1rem;
            --slots-grid-columns: 1fr;
            --slots-grid-gap: 0.75rem;
            --slot-padding: 0.875rem;
            --users-gap: 1.5rem;
            --user-section-padding: 1rem;
            --user-title-size: 1rem;
            --user-email-size: 0.8125rem;
            --day-card-margin: 0.75rem;
            --day-header-padding: 0.875rem;
            --day-header-title-size: 0.875rem;
            --day-content-padding: 0.875rem;
            --period-title-size: 0.8125rem;
            --period-margin: 0.5rem;
            --period-time-size: 0.8125rem;
            --event-title-size: 0.8125rem;
            --free-periods-grid: 1fr;
            --free-period-padding: 0.625rem;
            --empty-state-padding: 2rem;
            --empty-state-icon-size: 2.5rem;
            --empty-state-title-size: 0.9375rem;
            --empty-state-text-size: 0.8125rem;
            --error-padding: 0.875rem;
            --error-title-size: 0.9375rem;
            --error-text-size: 0.8125rem;
            --pagination-margin-top: 1.5rem;
            --pagination-gap: 0.125rem;
            --pagination-button-padding: 0.5rem 0.625rem;
            --pagination-button-size: 0.8125rem;
          }
          
          .user-section h3 {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .day-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--day-header-gap, 0.5rem);
          }
          
          .day-header h4 {
            order: 1;
          }
          
          .status {
            order: 2;
            align-self: flex-start;
          }
          
          .free-periods .period {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--free-period-mobile-gap, 0.5rem);
          }
          
          .pagination ul {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        
        /* Responsive Design - Small Mobile */
        @media (max-width: 480px) {
          .user-availability-container {
            --summary-padding: 0.75rem;
            --summary-title-size: 0.9375rem;
            --summary-grid-gap: 0.5rem;
            --stat-label-size: 0.75rem;
            --stat-value-size: 0.875rem;
            --section-title-size: 0.9375rem;
            --slot-padding: 0.75rem;
            --user-section-padding: 0.75rem;
            --user-title-size: 0.9375rem;
            --user-email-size: 0.75rem;
            --day-header-padding: 0.75rem;
            --day-header-title-size: 0.8125rem;
            --day-content-padding: 0.75rem;
            --period-title-size: 0.75rem;
            --period-time-size: 0.75rem;
            --event-title-size: 0.75rem;
            --free-period-padding: 0.5rem;
            --empty-state-padding: 1.5rem;
            --empty-state-icon-size: 2rem;
            --empty-state-title-size: 0.875rem;
            --empty-state-text-size: 0.75rem;
            --error-padding: 0.75rem;
            --error-title-size: 0.875rem;
            --error-text-size: 0.75rem;
            --pagination-button-padding: 0.375rem 0.5rem;
            --pagination-button-size: 0.75rem;
            --time-indicator-font-size: 0.75rem;
            --time-dot-size: 0.5rem;
          }
          
          .time-indicator {
            flex-direction: column;
            text-align: center;
            gap: var(--time-indicator-small-gap, 0.25rem);
          }
          
          .current-time-indicator {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .user-availability-container {
            --border-color: #000000;
            --error-border: #000000;
            --slot-border: #000000;
            --free-period-border: #000000;
            --busy-border: #000000;
            --no-data-border: #000000;
            --empty-state-border: #000000;
          }
          
          .day-header.busy-header,
          .day-header.free-header {
            border-bottom-width: 2px;
          }
          
          .status {
            border: 1px solid currentColor;
          }
          
          .time-dot {
            border: 2px solid currentColor;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .time-dot {
            animation: none;
          }
          
          .user-availability-container *,
          .user-availability-container *::before,
          .user-availability-container *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>      <div className="summary">
        <h3>Availability Summary</h3>
        <div className="grid">
          <div className="stat">
            <div className="label">Date Range</div>
            <div className="value">
              {formatDate(date_range.start_date)} - {formatDate(date_range.end_date)}
            </div>
          </div>
          <div className="stat">
            <div className="label">Users</div>
            <div className="value">{summary.total_users}</div>
          </div>
          <div className="stat">
            <div className="label">Common Free Slots</div>
            <div className="value">{summary.common_free_slots?.length || 0}</div>
          </div>
        </div>
        
        {/* Current time indicator */}
        <div className="current-time-indicator">
          <div className="time-dot"></div>
          <div>
            <span>Current time:</span> {formatCurrentTime()}
            {timezone && <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.7 }}>({timezone})</span>}
          </div>
        </div>
      </div>      {/* Common availability section */}
      {summary.common_free_slots?.length > 0 && (
        <div className="common-availability">
          <h3>Common Free Slots</h3>
          <div className="grid">
            {summary.common_free_slots.map((slot, index) => (
              <div key={index} className="slot">
                <div className="date">{formatDate(slot.date)}</div>
                <div className="time">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </div>
                <Button 
                  color="success"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleCreateEvent(slot)}
                >
                  Schedule Meeting
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Individual user availability */}
      <div className="users-availability">
        {currentUsers.map(userAvailability => (
          <div key={userAvailability.user_id} className="user-section">
            <h3>
              <span className="user-name">
                {userAvailability.user?.profile?.firstName || 'Unknown'} {userAvailability.user?.profile?.lastName || 'User'}
              </span>
              <span className="email">
                ({userAvailability.user?.email || 'no-email@example.com'})
              </span>
            </h3>
            
            <div className="days">
              {userAvailability.availability.map(day => (
                <div key={day.date} className="day-card">
                  <div className={`day-header ${day.status === 'busy' ? 'busy-header' : 'free-header'}`}>
                    <h4>{formatDate(day.date)}</h4>
                    <span className={`status ${day.status === 'busy' ? 'busy' : 'free'}`}>
                      {day.status}
                    </span>
                  </div>
                  
                  <div className="day-content">
                    {/* Busy periods */}
                    {day.busy_periods?.length > 0 && (
                      <div className="busy-periods">
                        <h5>Busy Periods</h5>
                        <div className="periods">
                          {day.busy_periods.map((period, idx) => (
                            <div key={idx} className="period">
                              <div className="time">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </div>
                              {period.event_title && (
                                <div className="event-title">{period.event_title}</div>
                              )}
                              {period.is_all_day && (
                                <div className="all-day">All day</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Free periods */}
                    {day.free_periods?.length > 0 && (
                      <div className="free-periods">
                        <h5>Free Periods</h5>
                        <div className="periods">
                          {day.free_periods.map((period, idx) => (
                            <div key={idx} className="period">
                              <div className="time">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </div>
                              <Button 
                                color="success" 
                                size="xs"
                                onClick={() => handleCreateEvent(period, userAvailability.user_id)}
                              >
                                Schedule
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {day.busy_periods?.length === 0 && day.free_periods?.length === 0 && (
                      <div className="no-data">
                        No detailed availability data
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>))}
      </div>
      
      {/* Pagination */}
      {users.length > usersPerPage && (
        <div className="pagination-container mt-6">
          <div className="flex justify-center">
            <nav className="pagination">
              <ul className="flex list-none">
                {/* Previous button */}
                <li className="mx-1">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                  >
                    &laquo; Prev
                  </button>
                </li>
                
                {/* Page numbers */}
                {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, i) => (
                  <li key={i} className="mx-1">
                    <button
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                
                {/* Next button */}
                <li className="mx-1">
                  <button
                    onClick={() => paginate(
                      currentPage < Math.ceil(users.length / usersPerPage)
                        ? currentPage + 1
                        : Math.ceil(users.length / usersPerPage)
                    )}
                    disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                    className={`px-3 py-1 rounded ${
                      currentPage === Math.ceil(users.length / usersPerPage) 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                  >
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvailability;