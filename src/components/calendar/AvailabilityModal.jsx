import React, { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import UserAvailability from './UserAvailability';

/**
 * Modal component for displaying user availability - simplified for date range only
 */
const AvailabilityModal = ({
  isOpen,
  onClose,
  availability,
  isLoading,
  error,
  dateRange,
  timezone,
  timezones = [],
  onDateRangeChange,
  onTimezoneChange,
  onRefresh,
  onExport,
  onCreateEvent
}) => {  const handleStartDateChange = (e) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange(e.target.value, dateRange.endDate || '');
    }
  };

  const handleEndDateChange = (e) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange(dateRange.startDate || '', e.target.value);
    }
  };

  const handleTimezoneChange = (e) => {
    if (onTimezoneChange) {
      onTimezoneChange(e.target.value);
    }
  };

  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Availability"
      size="large"
      className="availability-modal"
    >
      <div className="availability-modal-content">        {/* Comprehensive responsive and dark mode styling */}
        <style jsx>{`
          /* Base Modal Styles */
          .availability-modal-content {
            background: var(--modal-bg, #ffffff);
            color: var(--modal-text, #1f2937);
            min-height: 400px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          /* Header Styles */
          .availability-header {
            background: linear-gradient(135deg, var(--primary-gradient-start, #3b82f6) 0%, var(--primary-gradient-end, #1d4ed8) 100%);
            padding: var(--header-padding, 1.5rem);
            margin: -1rem -1rem 1.5rem -1rem;
            border-radius: 0.75rem 0.75rem 0 0;
            color: white;
            box-shadow: var(--header-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
          }
          
          .availability-header h3 {
            font-size: var(--header-title-size, 1.25rem);
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            line-height: 1.2;
          }
          
          .availability-header p {
            font-size: var(--header-subtitle-size, 0.875rem);
            opacity: 0.9;
            margin: 0;
            line-height: 1.4;
          }
          
          /* Controls Section */
          .availability-controls {
            background: var(--controls-bg, #f8fafc);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: var(--controls-border-radius, 0.75rem);
            padding: var(--controls-padding, 1.5rem);
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
            box-shadow: var(--controls-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
          }
          
          /* Date Range Section */
          .date-range-section {
            display: grid;
            grid-template-columns: var(--date-grid-columns, 1fr 1fr);
            gap: var(--date-grid-gap, 1rem);
            margin-bottom: 1rem;
          }
          
          /* Timezone Section */
          .timezone-section {
            margin-bottom: 1.5rem;
          }
          
          /* Actions Section */
          .actions-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color, #e2e8f0);
          }
          
          /* Current Time Display */
          .current-time-display {
            background: var(--info-bg, #eff6ff);
            border: 1px solid var(--info-border, #bfdbfe);
            border-radius: 0.5rem;
            padding: var(--time-display-padding, 0.75rem);
            font-size: var(--time-display-font-size, 0.875rem);
            color: var(--info-text, #1e40af);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }
          
          .time-indicator {
            width: var(--time-indicator-size, 8px);
            height: var(--time-indicator-size, 8px);
            border-radius: 50%;
            background: var(--time-indicator-color, #10b981);
            animation: pulse 2s infinite;
            flex-shrink: 0;
          }
          
          /* Animations */
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Error Display */
          .error-display {
            background: var(--error-bg, #fef2f2);
            border: 1px solid var(--error-border, #fecaca);
            border-left: 4px solid var(--error-accent, #ef4444);
            border-radius: 0.5rem;
            padding: var(--error-padding, 1rem);
            margin-bottom: 1rem;
            color: var(--error-text, #dc2626);
            animation: fadeIn 0.3s ease;
          }
          
          .error-display svg {
            flex-shrink: 0;
            width: 1.25rem;
            height: 1.25rem;
          }
          
          /* Loading Display */
          .loading-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--loading-padding, 3rem);
            color: var(--muted-text, #6b7280);
            animation: fadeIn 0.3s ease;
          }
          
          .loading-display .animate-spin {
            width: var(--loading-spinner-size, 3rem);
            height: var(--loading-spinner-size, 3rem);
            border-width: 3px;
            margin-bottom: 1rem;
          }
          
          /* No Data Display */
          .no-data-display {
            text-align: center;
            padding: var(--no-data-padding, 3rem);
            color: var(--muted-text, #6b7280);
            animation: fadeIn 0.3s ease;
          }
          
          .no-data-display svg {
            width: var(--no-data-icon-size, 4rem);
            height: var(--no-data-icon-size, 4rem);
            margin-bottom: 1rem;
            opacity: 0.6;
          }
          
          /* Button Styles */
          .export-btn {
            transition: all 0.2s ease;
          }
          
          .export-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            .availability-modal-content {
              --modal-bg: #1f2937;
              --modal-text: #f9fafb;
              --controls-bg: #374151;
              --border-color: #4b5563;
              --info-bg: #1e3a8a;
              --info-border: #3b82f6;
              --info-text: #bfdbfe;
              --error-bg: #7f1d1d;
              --error-border: #dc2626;
              --error-text: #fca5a5;
              --error-accent: #f87171;
              --muted-text: #9ca3af;
              --primary-gradient-start: #4f46e5;
              --primary-gradient-end: #7c3aed;
              --header-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
              --controls-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
              --time-indicator-color: #34d399;
            }
          }
          
          .dark .availability-modal-content {
            --modal-bg: #1f2937;
            --modal-text: #f9fafb;
            --controls-bg: #374151;
            --border-color: #4b5563;
            --info-bg: #1e3a8a;
            --info-border: #3b82f6;
            --info-text: #bfdbfe;
            --error-bg: #7f1d1d;
            --error-border: #dc2626;
            --error-text: #fca5a5;
            --error-accent: #f87171;
            --muted-text: #9ca3af;
            --primary-gradient-start: #4f46e5;
            --primary-gradient-end: #7c3aed;
            --header-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            --controls-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
            --time-indicator-color: #34d399;
          }
          
          /* Responsive Design - Extra Large Screens */
          @media (min-width: 1440px) {
            .availability-modal-content {
              --header-padding: 2rem;
              --controls-padding: 2rem;
              --header-title-size: 1.5rem;
              --header-subtitle-size: 1rem;
              --date-grid-gap: 1.5rem;
              --loading-padding: 4rem;
              --no-data-padding: 4rem;
              --no-data-icon-size: 5rem;
              --loading-spinner-size: 4rem;
            }
          }
          
          /* Responsive Design - Large Screens */
          @media (min-width: 1024px) and (max-width: 1439px) {
            .availability-modal-content {
              --header-padding: 1.75rem;
              --controls-padding: 1.75rem;
              --header-title-size: 1.375rem;
              --date-grid-gap: 1.25rem;
            }
          }
          
          /* Responsive Design - Tablet */
          @media (min-width: 768px) and (max-width: 1023px) {
            .availability-modal-content {
              --header-padding: 1.5rem;
              --controls-padding: 1.5rem;
              --header-title-size: 1.25rem;
              --date-grid-columns: 1fr 1fr;
              --date-grid-gap: 1rem;
              --time-display-padding: 1rem;
            }
            
            .actions-section {
              flex-direction: row;
              flex-wrap: wrap;
              gap: 1rem;
            }
            
            .actions-section > div {
              flex: 1;
              min-width: 200px;
            }
          }
          
          /* Responsive Design - Mobile */
          @media (max-width: 767px) {
            .availability-modal-content {
              --header-padding: 1rem;
              --controls-padding: 1rem;
              --header-title-size: 1.125rem;
              --header-subtitle-size: 0.8rem;
              --date-grid-columns: 1fr;
              --date-grid-gap: 0.75rem;
              --controls-border-radius: 0.5rem;
              --time-display-padding: 0.75rem;
              --time-display-font-size: 0.8rem;
              --time-indicator-size: 6px;
              --loading-padding: 2rem;
              --no-data-padding: 2rem;
              --no-data-icon-size: 3rem;
              --loading-spinner-size: 2.5rem;
              --error-padding: 0.75rem;
            }
            
            .availability-header {
              margin: -1rem -0.5rem 1rem -0.5rem;
              border-radius: 0.5rem 0.5rem 0 0;
            }
            
            .actions-section {
              flex-direction: column;
              align-items: stretch;
              gap: 0.75rem;
            }
            
            .actions-section button {
              width: 100%;
              justify-content: center;
            }
            
            .current-time-display {
              flex-direction: column;
              text-align: center;
              gap: 0.5rem;
            }
            
            .error-display {
              padding: 0.75rem;
              font-size: 0.875rem;
            }
            
            .loading-display p {
              font-size: 0.875rem;
            }
            
            .no-data-display h3 {
              font-size: 1rem;
            }
            
            .no-data-display p {
              font-size: 0.875rem;
            }
          }
          
          /* Responsive Design - Small Mobile */
          @media (max-width: 480px) {
            .availability-modal-content {
              --header-padding: 0.75rem;
              --controls-padding: 0.75rem;
              --header-title-size: 1rem;
              --header-subtitle-size: 0.75rem;
              --date-grid-gap: 0.5rem;
              --time-display-font-size: 0.75rem;
              --loading-padding: 1.5rem;
              --no-data-padding: 1.5rem;
              --no-data-icon-size: 2.5rem;
              --loading-spinner-size: 2rem;
            }
            
            .availability-header {
              margin: -0.75rem -0.25rem 0.75rem -0.25rem;
            }
            
            .current-time-display {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
            
            .error-display {
              padding: 0.5rem;
              font-size: 0.8rem;
            }
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .availability-modal-content {
              --border-color: #000000;
              --error-border: #000000;
              --info-border: #000000;
            }
            
            .availability-header {
              background: #000000;
              color: #ffffff;
            }
            
            .time-indicator {
              border: 2px solid currentColor;
            }
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .time-indicator {
              animation: none;
            }
            
            .availability-modal-content,
            .availability-controls,
            .current-time-display,
            .export-btn {
              transition: none;
            }
            
            .error-display,
            .loading-display,
            .no-data-display {
              animation: none;
            }
          }
          }
        `}</style>
        
        <div className="availability-header">
          <h3 className="text-xl font-semibold mb-2">Team Availability Check</h3>
          <p className="text-blue-100 text-sm">Check team member availability for scheduling meetings and events</p>
        </div>
        
        <div className="availability-controls">
          <div className="date-range-section">
            <InputField
              name="startDate"
              label="Start Date"
              type="date"
              value={dateRange?.startDate || ''}
              onChange={handleStartDateChange}
              className="date-input"
            />
            <InputField
              name="endDate"
              label="End Date"
              type="date"
              value={dateRange?.endDate || ''}
              onChange={handleEndDateChange}
              className="date-input"
            />
          </div>
          
          <div className="timezone-section">
            <SelectField
              name="timezone"
              label="Timezone"
              value={timezone}
              onChange={handleTimezoneChange}
              options={[
                { value: '', label: '-- Local Timezone --' },
                ...(timezones && Array.isArray(timezones) ? timezones.map(tz => ({
                  value: tz,
                  label: tz.replace('_', ' ').replace('/', ': ')
                })) : [])
              ]}
            />
            <div className="current-time-display">
              <div className="time-indicator"></div>
              <span>Current time: {new Date().toLocaleTimeString([], { 
                timeZone: timezone || undefined,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</span>
            </div>
          </div>
          
          <div className="actions-section">
            <div className="flex items-center gap-2">
              {availability && (
                <Button 
                  onClick={onExport} 
                  color="secondary" 
                  disabled={!availability || isLoading} 
                  size="sm"
                  className="export-btn"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export CSV
                </Button>
              )}
            </div>
            
            <Button onClick={handleRefresh} color="primary" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Availability...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Check Availability
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-display">
            <div className="flex items-start">
              <svg className="h-5 w-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium">Error</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-display">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="font-medium">Loading availability data...</p>
            <p className="text-sm mt-1">This may take a few moments</p>
          </div>
        ) : (
          availability ? (
            <UserAvailability 
              availability={availability} 
              onCreateEvent={onCreateEvent}
              timezone={timezone}
            />
          ) : (
            <div className="no-data-display">
              <svg className="inline-block w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">No availability data</h3>
              <p className="text-sm">Please select a date range and click "Check Availability" to view team schedules.</p>
            </div>
          )
        )}
      </div>
    </Modal>
  );
};

export default AvailabilityModal;