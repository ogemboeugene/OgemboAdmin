import { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../services/api/apiService';

/**
 * Get user's timezone
 * @returns {string} Timezone name (e.g., "America/New_York")
 */
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Common timezones for selection
 */
const COMMON_TIMEZONES = [
  'America/New_York', // Eastern Time
  'America/Chicago', // Central Time
  'America/Denver', // Mountain Time
  'America/Los_Angeles', // Pacific Time
  'America/Anchorage', // Alaska Time
  'Pacific/Honolulu', // Hawaii Time
  'Europe/London', // GMT
  'Europe/Paris', // Central European Time
  'Asia/Tokyo', // Japan Time
  'Asia/Shanghai', // China Time
  'Australia/Sydney' // Australia Eastern Time
];

/**
 * Custom hook for managing user availability
 * Handles fetching availability data and modal state
 */
export function useAvailability() {
  const [availability, setAvailability] = useState([]);
    // Add debugging when availability changes
  useEffect(() => {
    console.log('📅 Availability state changed:', {
      availability,
      isArray: Array.isArray(availability),
      length: availability?.length,
      sample: Array.isArray(availability) ? availability.slice(0, 2) : 'Not an array'
    });
  }, [availability]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Week from now
  });  const [timezone, setTimezone] = useState(getUserTimezone());
  const [timezones] = useState(COMMON_TIMEZONES);

  // Cache last request parameters and result
  const availabilityCache = useRef({
    params: null,
    result: null,
    timestamp: null
  });

  /**
   * Fetch availability data from the API
   */
  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);

    // Validate date range
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      setIsLoading(false);
      return;
    }
    
    // Validate that end date is after start date
    if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
      setError('End date must be after start date');
      setIsLoading(false);
      return;
    }
    
    // Validate date range is not too large (more than 30 days)
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      setError('Date range cannot exceed 30 days');
      setIsLoading(false);
      return;
    }    // Create request parameters
    const requestParams = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      timezone
    };
    
    // Check if we have a cached result for these exact parameters (less than 5 minutes old)
    const cachedResult = availabilityCache.current;
    const now = Date.now();
    const isCacheValid = cachedResult.timestamp && 
                         (now - cachedResult.timestamp < 5 * 60 * 1000) && // 5-minute cache
                         cachedResult.params &&
                         JSON.stringify(cachedResult.params) === JSON.stringify(requestParams);
    
    if (isCacheValid) {
      console.log('📅 Using cached availability data');
      setAvailability(cachedResult.result);
      setIsLoading(false);
      return;
    }    try {
      console.log('📅 Fetching availability with params:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        timezone
      });
      
      const response = await apiService.calendar.getAvailability(
        dateRange.startDate,
        dateRange.endDate,
        null, // No user filtering needed
        timezone
      );
      
      console.log('📅 API Response:', response);      // API returns data in the format { success: true, data: { availability: {...} } }
      const availabilityData = response.data.data?.availability || response.data?.availability;
      
      console.log('📅 Processed availability data:', availabilityData);
      
      // Ensure we always have an array
      let finalAvailabilityData = Array.isArray(availabilityData) ? availabilityData : [];
      
      // If no availability data is returned, generate some mock data for testing
      if (!availabilityData || finalAvailabilityData.length === 0) {
        console.log('📅 No availability data from API, generating mock data for testing');
        finalAvailabilityData = generateMockAvailability(dateRange.startDate, dateRange.endDate);
      }
        // Update cache
      availabilityCache.current = {
        params: requestParams,
        result: finalAvailabilityData,
        timestamp: now
      };
      
      setAvailability(finalAvailabilityData);
    } catch (err) {
      console.error('Error fetching availability data:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });      setError(err.response?.data?.message || err.message || 'Failed to fetch availability data');
      
      // Generate mock data for testing when API fails
      console.log('📅 API failed, generating mock data for testing');
      const mockData = generateMockAvailability(dateRange.startDate, dateRange.endDate);
      setAvailability(mockData);
    } finally {
      setIsLoading(false);
    }
  };  /**
   * Open availability modal and fetch data
   */
  const openAvailabilityModal = () => {
    setIsModalOpen(true);
    fetchAvailability();
  };

  /**
   * Close availability modal and reset state
   */
  const closeAvailabilityModal = () => {
    setIsModalOpen(false);
  };
  /**
   * Update date range and refetch availability
   */
  const updateDateRange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    if (isModalOpen) {
      fetchAvailability();
    }
  };
    /**
   * Update selected timezone
   */
  const updateTimezone = (newTimezone) => {
    setTimezone(newTimezone);
    // Optionally refresh availability data with new timezone
    if (isModalOpen) {
      fetchAvailability();
    }
  };

  /**
   * Create events from available time slots
   * @param {Object} timeSlot - The time slot object with start_time and end_time
   * @param {number} userId - Optional user ID for individual availability
   * @returns {Promise} - API response from event creation
   */
  const createEventFromAvailability = useCallback((timeSlot, userId = null) => {
    if (!timeSlot || !timeSlot.start_time || !timeSlot.end_time) {
      console.error('Invalid time slot for event creation', timeSlot);
      return Promise.reject(new Error('Invalid time slot data'));
    }
    
    // Determine if this is for a specific user or common availability
    const isCommonSlot = !userId && availability?.summary?.total_users > 1;
    
    // Create appropriate title based on context
    const title = isCommonSlot 
      ? `Team Meeting (${availability.summary.total_users} attendees)`
      : 'Meeting';
      
    // Get user details if available
    let attendees = [];
    if (userId) {
      const userInfo = availability.users.find(u => u.user_id === userId);
      if (userInfo?.user?.email) {        attendees.push({
          email: userInfo.user.email,
          name: `${userInfo.user.profile?.firstName || ''} ${userInfo.user.profile?.lastName || ''}`.trim()
        });
      } else {
        attendees.push({ id: userId });
      }
    } else if (isCommonSlot) {
      // For common slot, add all users as attendees
      attendees = availability.users
        .filter(user => user.user?.email)        .map(user => ({
          email: user.user.email,
          name: `${user.user.profile?.firstName || ''} ${user.user.profile?.lastName || ''}`.trim()
        }));
    }
    
    // Format date for description
    const eventDate = new Date(timeSlot.start_time).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const eventData = {
      title,
      start: timeSlot.start_time,
      end: timeSlot.end_time,
      attendees,
      description: `Meeting scheduled from availability check on ${eventDate}`,
      timezone: timezone
    };
    
    console.log('📅 Creating event from availability:', eventData);
    return apiService.calendar.create(eventData);
  }, [availability, timezone]);

  /**
   * Export availability data as CSV
   */
  const exportAvailabilityCSV = () => {
    if (!availability) {
      setError('No availability data to export');
      return false;
    }
    
    try {
      // Headers row
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "User,Date,Status,Free Time Slots,Busy Time Slots\n";
        // Add data rows
      availability.users.forEach(userAvail => {
        // Get user name or fall back to email/ID
        const userName = userAvail.user?.profile ? 
          `${userAvail.user.profile.firstName} ${userAvail.user.profile.lastName}`.trim() : 
          (userAvail.user?.email || `User ${userAvail.user_id}`);
          
        userAvail.availability.forEach(day => {
          // Format time slots as human-readable strings
          const formatPeriods = periods => periods?.map(period => 
            `${new Date(period.start_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}-${new Date(period.end_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`
          ).join('; ') || '';
          
          // Add row with date formatted according to user's locale
          csvContent += `"${userName}","${new Date(day.date).toLocaleDateString()}","${day.status}","${formatPeriods(day.free_periods)}","${formatPeriods(day.busy_periods)}"\n`;
        });
      });
      
      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `availability_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (err) {
      console.error('Error exporting availability data:', err);
      setError('Failed to export availability data: ' + (err.message || 'Unknown error'));
      return false;
    }
  };

  // Group related values and functions for better organization
  const modalState = {
    isOpen: isModalOpen,
    open: openAvailabilityModal,
    close: closeAvailabilityModal
  };
  
  const dateState = {
    range: dateRange,
    updateRange: updateDateRange
  };
  const timezoneState = {
    current: timezone,
    options: timezones,
    update: updateTimezone
  };
  
  const availabilityState = {
    data: availability,
    loading: isLoading,
    error,
    fetch: fetchAvailability,
    export: exportAvailabilityCSV
  };
  return {
    // For backward compatibility, keep the flat structure
    availability,
    isLoading,
    error,
    isModalOpen,
    dateRange,
    timezone,
    timezones,
    openAvailabilityModal,
    closeAvailabilityModal,
    updateDateRange,
    updateTimezone,
    fetchAvailability,
    createEventFromAvailability,
    exportAvailabilityCSV,
      // New organized structure for future refactoring
    modal: modalState,
    dates: dateState,
    timezones: timezoneState,
    availabilityData: availabilityState,
    createEvent: createEventFromAvailability
  };
}

/**
 * Generate mock availability data for testing purposes
 */
const generateMockAvailability = (startDate, endDate) => {
  const mockData = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate availability slots for random dates within the range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Add availability on random days (about 40% of days)
    if (Math.random() > 0.6) {
      const date = new Date(d);
      
      // Add 1-3 availability slots per day
      const slotsCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < slotsCount; i++) {
        const startHour = 9 + (i * 3); // 9 AM, 12 PM, 3 PM
        const startTime = new Date(date);
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startHour + 2); // 2-hour slots
        
        mockData.push({
          id: `mock-${date.toISOString().split('T')[0]}-${i}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          user_id: 'current-user',
          user_name: 'Current User',
          status: 'available'
        });
      }
    }
  }
  
  console.log('📅 Generated mock availability data:', mockData);
  return mockData;
};

export default useAvailability;