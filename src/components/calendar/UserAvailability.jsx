import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

/**
 * Component for displaying user availability data
 */
const UserAvailability = ({ availability, onCreateEvent, timezone }) => {
  if (!availability) return null;
  
  // Data validation - ensure we have the expected structure
  if (!availability.users || !Array.isArray(availability.users) || !availability.summary || !availability.date_range) {
    console.error('Invalid availability data structure:', availability);
    return (
      <div className="error-message p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-medium text-red-800">Invalid Data Format</h3>
        <p className="text-red-600">The availability data is not in the expected format.</p>
      </div>
    );
  }
  
  const { users, summary, date_range } = availability;
  
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
    <div className="user-availability-container">      <div className="summary bg-gray-50 rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Availability Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat col-span-1 md:col-span-2">
            <div className="label text-sm text-gray-500">Date Range</div>
            <div className="value">
              {formatDate(date_range.start_date)} - {formatDate(date_range.end_date)}
            </div>
          </div>
          <div className="stat">
            <div className="label text-sm text-gray-500">Users</div>
            <div className="value">{summary.total_users}</div>
          </div>
          <div className="stat">
            <div className="label text-sm text-gray-500">Common Free Slots</div>
            <div className="value">{summary.common_free_slots?.length || 0}</div>
          </div>
        </div>
        
        {/* Current time indicator */}
        <div className="current-time-indicator mt-4 pt-4 border-t border-gray-200 flex items-center">
          <div className="time-dot w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-2"></div>
          <div className="text-sm">
            <span className="text-gray-500">Current time:</span> {formatCurrentTime()}
            {timezone && <span className="text-xs text-gray-400 ml-2">({timezone})</span>}
          </div>
        </div>
      </div>

      {/* Common availability section */}
      {summary.common_free_slots?.length > 0 && (
        <div className="common-availability mb-6">
          <h3 className="text-lg font-semibold mb-2">Common Free Slots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.common_free_slots.map((slot, index) => (
              <div key={index} className="slot bg-green-50 border border-green-200 rounded p-3">
                <div className="date font-medium">{formatDate(slot.date)}</div>
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
          <div key={userAvailability.user_id} className="user-section mb-8">            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="user-name">
                {userAvailability.user?.profile?.firstName} {userAvailability.user?.profile?.lastName}
              </span>
              <span className="email ml-2 text-sm text-gray-500">
                ({userAvailability.user?.email})
              </span>
            </h3>
            
            <div className="days">
              {userAvailability.availability.map(day => (
                <div key={day.date} className="day-card mb-4 border rounded shadow-sm">
                  <div className={`day-header p-3 flex justify-between items-center ${day.status === 'busy' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h4 className="font-medium">{formatDate(day.date)}</h4>
                    <span className={`status px-2 py-1 rounded-full text-xs font-medium ${
                      day.status === 'busy' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {day.status}
                    </span>
                  </div>
                  
                  <div className="day-content p-3">
                    {/* Busy periods */}
                    {day.busy_periods?.length > 0 && (
                      <div className="busy-periods mb-3">
                        <h5 className="text-sm font-medium text-red-700 mb-2">Busy Periods</h5>
                        <div className="periods">
                          {day.busy_periods.map((period, idx) => (
                            <div key={idx} className="period mb-2 pl-3 border-l-2 border-red-300">
                              <div className="time text-sm">
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </div>
                              {period.event_title && (
                                <div className="event-title text-sm font-medium">{period.event_title}</div>
                              )}
                              {period.is_all_day && (
                                <div className="all-day text-xs text-gray-500">All day</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Free periods */}
                    {day.free_periods?.length > 0 && (
                      <div className="free-periods">
                        <h5 className="text-sm font-medium text-green-700 mb-2">Free Periods</h5>
                        <div className="periods grid grid-cols-1 md:grid-cols-2 gap-2">
                          {day.free_periods.map((period, idx) => (
                            <div key={idx} className="period bg-green-50 rounded p-2 flex justify-between items-center">
                              <div className="time text-sm">
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
                      <div className="no-data text-center text-gray-500 py-4">
                        No detailed availability data
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>        ))}
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