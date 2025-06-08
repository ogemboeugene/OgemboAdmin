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
      <div className="availability-modal-content">
        {/* Improved styling with CSS variables for dark mode */}
        <style jsx>{`
          .availability-modal-content {
            background: var(--modal-bg, #ffffff);
            color: var(--modal-text, #1f2937);
            min-height: 400px;
          }
          
          .availability-header {
            background: linear-gradient(135deg, var(--primary-gradient-start, #3b82f6) 0%, var(--primary-gradient-end, #1d4ed8) 100%);
            padding: 1.5rem;
            margin: -1rem -1rem 1.5rem -1rem;
            border-radius: 0.75rem 0.75rem 0 0;
            color: white;
          }
          
          .availability-controls {
            background: var(--controls-bg, #f8fafc);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .date-range-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .timezone-section {
            margin-bottom: 1.5rem;
          }
          
          .actions-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color, #e2e8f0);
          }
          
          .current-time-display {
            background: var(--info-bg, #eff6ff);
            border: 1px solid var(--info-border, #bfdbfe);
            border-radius: 0.5rem;
            padding: 0.75rem;
            font-size: 0.875rem;
            color: var(--info-text, #1e40af);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .time-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .error-display {
            background: var(--error-bg, #fef2f2);
            border: 1px solid var(--error-border, #fecaca);
            border-left: 4px solid #ef4444;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
            color: var(--error-text, #dc2626);
          }
          
          .loading-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--muted-text, #6b7280);
          }
          
          .no-data-display {
            text-align: center;
            padding: 3rem;
            color: var(--muted-text, #6b7280);
          }
          
          /* Dark mode support */
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
            --muted-text: #9ca3af;
            --primary-gradient-start: #4f46e5;
            --primary-gradient-end: #7c3aed;
          }
          
          @media (max-width: 768px) {
            .date-range-section {
              grid-template-columns: 1fr;
            }
            
            .actions-section {
              flex-direction: column;
              align-items: stretch;
            }
            
            .availability-header {
              margin: -1rem -0.5rem 1rem -0.5rem;
              padding: 1rem;
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