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
  const [availability, setAvailability] = useState(null);
    // Add debugging when availability changes
  useEffect(() => {
    console.log('📅 Availability state changed:', {
      availability,
      isObject: typeof availability === 'object' && availability !== null,
      hasUsers: availability?.users && Array.isArray(availability.users),
      hasSummary: availability?.summary,
      usersCount: availability?.users?.length || 0
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
  
  // State for smart conflict detection
  const [events, setEvents] = useState([]);

  // Cache last request parameters and result
  const availabilityCache = useRef({
    params: null,
    result: null,
    timestamp: null
  });

  /**
   * Update events for smart conflict detection
   * @param {Array} eventsList - Array of events to check for conflicts
   */
  const updateEvents = useCallback((eventsList) => {
    console.log('📅 Updating events for smart conflict detection:', eventsList?.length);
    setEvents(eventsList || []);
  }, []);

  /**
   * Check for conflicts between availability and existing events
   * @param {Array} availabilitySlots - Available time slots
   * @param {Array} existingEvents - Current events
   * @returns {Array} - Conflicts found
   */
  const checkConflicts = useCallback((availabilitySlots, existingEvents) => {
    if (!availabilitySlots || !existingEvents) return [];
    
    const conflicts = [];
    
    existingEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      availabilitySlots.forEach(slot => {
        const slotStart = new Date(slot.start_time);
        const slotEnd = new Date(slot.end_time);
        
        // Check for overlap
        if (eventStart < slotEnd && eventEnd > slotStart) {
          conflicts.push({
            event: event,
            slot: slot,
            type: 'overlap',
            description: `Event "${event.title}" overlaps with availability slot`
          });
        }
      });
    });
    
    console.log('📅 Smart conflict detection found conflicts:', conflicts.length);
    return conflicts;
  }, []);

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
        console.log('📅 API Response:', response);

      // API returns data in the format { success: true, data: { availability: { users: [...] } } }
      const availabilityResponse = response.data.data?.availability || response.data?.availability;
        console.log('📅 Raw availability response:', availabilityResponse);
      
      let finalAvailabilityData = null;      // Handle the nested API response format
      if (availabilityResponse && availabilityResponse.users && Array.isArray(availabilityResponse.users)) {        // Extract availability data from the users array and ensure complete summary structure
        const existingSummary = availabilityResponse.summary || {};
        finalAvailabilityData = {
          users: availabilityResponse.users,
          summary: {
            total_users: existingSummary.total_users || availabilityResponse.users.length,
            total_days: existingSummary.total_days || Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1,
            common_free_slots: existingSummary.common_free_slots || [],
            date_range: existingSummary.date_range || {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }
        };
        console.log('📅 Processed availability data from users array:', {
          finalAvailabilityData,
          hasUsers: !!finalAvailabilityData.users,
          usersLength: finalAvailabilityData.users?.length,
          hasSummary: !!finalAvailabilityData.summary,
          hasDateRange: !!finalAvailabilityData.summary?.date_range,
          summaryStructure: finalAvailabilityData.summary
        });
      } else if (Array.isArray(availabilityResponse)) {
        // Fallback for simple array format - convert to expected object structure
        finalAvailabilityData = {
          users: availabilityResponse,
          summary: {
            total_users: availabilityResponse.length,
            total_days: Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1,
            common_free_slots: [],
            date_range: {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }
        };
        console.log('📅 Using simple array format, converted to object:', finalAvailabilityData);      } else {
        // If no valid availability data is returned, generate some mock data for testing
        console.log('📅 No valid availability data from API, generating mock data for testing');
        finalAvailabilityData = generateMockAvailability(dateRange.startDate, dateRange.endDate, events);
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
      const mockData = generateMockAvailability(dateRange.startDate, dateRange.endDate, events);
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
    createEvent: createEventFromAvailability,
    updateEvents,
    checkConflicts
  };
}

/**
 * Generate mock availability data with business rules applied
 * Business Rules:
 * 1. Saturday - no available slots (no dots shown)
 * 2. Sunday - only half-day availability
 * 3. Time alignment - slots start at round hours (not 9:04am)
 * 4. Buffer time - if event ends at 11:40am, next slot starts at 12:00pm
 * 5. Slot duration - 2-hour slots
 * 6. Breaks - include necessary breaks between slots
 * 7. Event conflict checking - ensure slots don't overlap with existing events
 */
const generateMockAvailability = (startDate, endDate, existingEvents = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Create mock availability data in the expected nested format
  const mockAvailabilityDays = [];
  
  // Generate availability slots for each day in the range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // BUSINESS RULE 1: Saturday - no available slots
    if (dayOfWeek === 6) {
      mockAvailabilityDays.push({
        date: dateString,
        status: 'unavailable',
        free_periods: [],
        busy_periods: []
      });
      continue;
    }
    
    // Get existing events for this date to check for conflicts
    const dayEvents = getEventsForDate(date, existingEvents);
    
    // Generate availability slots based on day type
    const freePeriods = generateDayAvailability(date, dayOfWeek, dayEvents);
    
    // Determine status based on availability
    const status = freePeriods.length > 0 ? 'available' : 'busy';
    
    mockAvailabilityDays.push({
      date: dateString,
      status: status,
      free_periods: freePeriods,
      busy_periods: generateBusyPeriods(date, dayEvents)
    });
  }
  
  /**
   * Generate availability slots for a specific day
   */
  function generateDayAvailability(date, dayOfWeek, dayEvents) {
    const freePeriods = [];
    
    // BUSINESS RULE 2: Sunday - only half-day availability (morning only)
    if (dayOfWeek === 0) {
      // Sunday: 9:00 AM - 1:00 PM (4 hours, 2 slots with break)
      const slots = [
        { start: 9, end: 11 },   // 9:00 AM - 11:00 AM
        { start: 12, end: 14 }   // 12:00 PM - 2:00 PM (with 1-hour break)
      ];
      
      slots.forEach(slot => {
        const period = createTimeSlot(date, slot.start, slot.end);
        if (!hasConflictWithEvents(period, dayEvents)) {
          freePeriods.push(period);
        }
      });
      
      return freePeriods;
    }
    
    // Regular weekdays (Monday-Friday): Full day availability
    // BUSINESS RULE 3 & 5: Round hour start times, 2-hour slots
    // BUSINESS RULE 6: Include breaks between slots
    const standardSlots = [
      { start: 9, end: 11 },   // 9:00 AM - 11:00 AM
      { start: 12, end: 14 },  // 12:00 PM - 2:00 PM (1-hour break after morning)
      { start: 15, end: 17 }   // 3:00 PM - 5:00 PM (1-hour break after afternoon)
    ];
    
    // Add availability slots, checking for conflicts with existing events
    standardSlots.forEach(slot => {
      const period = createTimeSlot(date, slot.start, slot.end);
      
      // BUSINESS RULE 7: Event conflict checking
      if (!hasConflictWithEvents(period, dayEvents)) {
        freePeriods.push(period);
      }
    });
    
    return freePeriods;
  }
  
  /**
   * Create a time slot with proper ISO formatting
   */
  function createTimeSlot(date, startHour, endHour) {
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0); // BUSINESS RULE 3: Round hours
    
    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);
    
    return {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    };
  }
  
  /**
   * Check if a time slot conflicts with existing events
   * BUSINESS RULE 4: Buffer time - 20 minutes after events, round to next hour
   */
  function hasConflictWithEvents(timeSlot, dayEvents) {
    const slotStart = new Date(timeSlot.start_time);
    const slotEnd = new Date(timeSlot.end_time);
    
    for (const event of dayEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Add 20-minute buffer after event end, then round up to next hour
      const bufferEnd = new Date(eventEnd.getTime() + 20 * 60 * 1000); // +20 minutes
      const roundedBufferEnd = new Date(bufferEnd);
      roundedBufferEnd.setHours(roundedBufferEnd.getHours() + 1, 0, 0, 0); // Round up to next hour
      
      // Check for overlap with buffer consideration
      if (slotStart < roundedBufferEnd && slotEnd > eventStart) {
        return true; // Conflict found
      }
    }
    
    return false; // No conflict
  }
  
  /**
   * Generate busy periods based on existing events
   */
  function generateBusyPeriods(date, dayEvents) {
    return dayEvents.map(event => ({
      start_time: event.start,
      end_time: event.end,
      event_title: event.title || 'Busy',
      is_all_day: event.allDay || false
    }));
  }
  
  /**
   * Get events for a specific date from existing events array
   */
  function getEventsForDate(date, events) {
    const dateStr = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  }
  // Return in the expected nested format
  const mockData = {
    users: [
      {
        user_id: 1,
        user: {
          email: 'test@example.com',
          profile: {
            firstName: 'Test',
            lastName: 'User'
          }
        },
        availability: mockAvailabilityDays
      }
    ],
    summary: {
      total_users: 1,
      total_days: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1,
      common_free_slots: [], // Add empty common free slots for now
      date_range: {
        start_date: startDate,
        end_date: endDate
      }
    }
  };
  
  console.log('📅 Generated mock availability data:', {
    mockData,
    hasUsers: !!mockData.users,
    usersLength: mockData.users?.length,
    hasSummary: !!mockData.summary,
    hasDateRange: !!mockData.summary?.date_range,
    summaryStructure: mockData.summary
  });
  return mockData;
};

export default useAvailability;