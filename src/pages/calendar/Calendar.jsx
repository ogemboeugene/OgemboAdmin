import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import apiService from '../../services/api/apiService';
import useAvailability from '../../hooks/useAvailability';
import AvailabilityModal from '../../components/calendar/AvailabilityModal';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEllipsisH, 
  FaTrash, 
  FaEdit, 
  FaEye, 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimes, 
  FaArrowLeft, 
  FaArrowRight, 
  FaRegCalendarAlt, 
  FaListUl, 
  FaThLarge, 
  FaProjectDiagram, 
  FaTasks, 
  FaUserClock, 
  FaCode, 
  FaLaptopCode, 
  FaGithub,
  FaCalendarCheck, 
  FaExternalLinkAlt, 
  FaInfoCircle,
  FaRegClock,
  FaRegCheckCircle,
  FaRegCalendarCheck,
  FaRegCalendarPlus,
  FaRegCalendarMinus,
  FaSyncAlt,
  FaTag,
  FaUserFriends,
  FaLink,
  FaMapMarkerAlt,
  FaBell,
  FaGraduationCap
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';

const Calendar = () => {
  const { user } = useAuth();
  const { success, error: showErrorNotification } = useNotification();  // Initialize the availability hook
  const {
    availability,
    isLoading: availabilityLoading,
    error: availabilityError,
    isModalOpen,
    dateRange,
    timezone,
    timezones,
    openAvailabilityModal,
    closeAvailabilityModal,
    updateDateRange,
    updateTimezone,
    fetchAvailability,
    exportAvailabilityCSV,
    createEventFromAvailability
  } = useAvailability();
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // State for attendee management
  const [isEditingAttendees, setIsEditingAttendees] = useState(false);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeeName, setNewAttendeeName] = useState('');  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
    event_type: 'meeting',
    priority: 'medium',
    project_id: '',
    task_id: '',
    location: '',
    is_all_day: false,
    attendees: [],
    reminders: [{ minutes_before: 15, notification_type: 'in_app' }],
    recurrence_rule: '',
    color: '#8b5cf6'
  });
  
  // Refs  const calendarRef = useRef(null);
  const searchRef = useRef(null);
  const modalRef = useRef(null);
  const addEventModalRef = useRef(null);
  const currentEventRef = useRef(null);
  // Fetch events data function
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📅 Fetching calendar events...');
      const response = await apiService.calendar.getAll();
      
      let eventsData = [];
        // Handle different response structures
      if (response.data) {
        if (response.data.data && response.data.data.events && Array.isArray(response.data.data.events)) {
          // Handle nested structure: response.data.data.events
          eventsData = response.data.data.events;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          eventsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.data.events && Array.isArray(response.data.events)) {
          eventsData = response.data.events;
        }
      }      // Transform API data to frontend format
      const transformedEvents = eventsData.map((event, index) => {
        console.log('📅 Processing event:', { id: event.id, _id: event._id, event }); // Debug log
        
        // Store the original backend ID (even if undefined) and generate display ID
        const originalBackendId = event.id || event._id;
        let eventId = originalBackendId;
        
        // Generate a fallback display ID if the backend ID is invalid, but track that it's from backend
        if (!eventId || eventId === 'undefined' || eventId === undefined || eventId === null || eventId === '') {
          eventId = `backend-undefined-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          console.log('⚠️ Generated fallback display ID for backend event with undefined ID:', eventId);
        }
        
        const transformedEvent = {
          id: eventId,
          originalBackendId: originalBackendId, // Store original backend ID for API calls
          isBackendEvent: true, // Mark as backend event regardless of ID validity
          title: event.title || event.name || 'Untitled Event',
          description: event.description || '',
          start: new Date(event.startDate || event.start_date || event.start || event.date),
          end: new Date(event.endDate || event.end_date || event.end || event.start_date || event.start || event.date),
          category: event.category || event.type || event.event_type || 'general',
          priority: event.priority || 'medium',
          project: event.project || event.relatedProject || event.projectName || 'General',
          completed: event.completed || event.status === 'completed' || event.is_completed || false,
          location: event.location || '',
          attendees: event.attendees || [],
          color: event.color || getCategoryColor(event.category || event.type || event.event_type || 'general')
        };
        
        console.log('📅 Transformed event:', transformedEvent.id, transformedEvent.title, 'Backend ID:', originalBackendId);
        return transformedEvent;
      });
      
      setEvents(transformedEvents);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedEvents.map(event => event.category))];
      setCategories(uniqueCategories);
      setSelectedCategories(uniqueCategories);
      
      console.log('📅 Successfully fetched calendar events:', transformedEvents.length);
      
    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      setError('Failed to load calendar events. Please try again.');        // Fallback to sample data if API fails
      const fallbackEvents = [
        {
          id: 'sample-1',
          originalBackendId: null,
          isBackendEvent: false,
          title: 'Sample Meeting',
          description: 'This is a sample meeting event (API connection failed)',
          start: new Date(),
          end: new Date(new Date().getTime() + 60 * 60 * 1000),
          category: 'meeting',
          priority: 'medium',
          project: 'Sample Project',
          completed: false,
          location: 'Conference Room A',
          attendees: ['user@example.com'],
          color: '#3b82f6'
        },
        {
          id: 'sample-2',
          originalBackendId: null,
          isBackendEvent: false,
          title: 'Project Deadline',
          description: 'Important project deadline (API connection failed)',
          start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
          end: new Date(new Date().getTime() + 25 * 60 * 60 * 1000),
          category: 'deadline',
          priority: 'high',
          project: 'Sample Project',
          completed: false,
          location: 'Remote',
          attendees: [],
          color: '#ef4444'
        },
        {
          id: 'sample-3',
          originalBackendId: null,
          isBackendEvent: false,
          title: 'Code Review',
          description: 'Weekly code review session (API connection failed)',
          start: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
          end: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          category: 'review',
          priority: 'medium',
          project: 'Development',
          completed: true,
          location: 'Online',
          attendees: ['dev1@example.com', 'dev2@example.com'],
          color: '#6366f1'
        }
      ];
        setEvents(fallbackEvents);
      setCategories(['meeting', 'deadline', 'review']);
      setSelectedCategories(['meeting', 'deadline', 'review']);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events data on component mount  // Fetch events and availability on component mount
  useEffect(() => {
    fetchEvents();
    fetchAvailability(); // Also fetch availability data for purple dots
  }, []);
  // Fetch availability data when the current date (month/year) changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update date range to cover the current month view
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]; // Last day of current month
    
    // Update the date range and fetch availability
    updateDateRange(startDate, endDate);
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // Filter events based on search and categories
  useEffect(() => {
    let filtered = events;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.project.toLowerCase().includes(query)
      );
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category));
    }
    
    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategories]);
  // Monitor currentEvent attendee state changes for debugging
  useEffect(() => {
    if (currentEvent) {
      console.log('🔍 ATTENDEE STATE MONITOR - currentEvent changed:', {
        eventId: currentEvent.id,
        originalBackendId: currentEvent.originalBackendId,
        attendeesWithStatus: currentEvent.attendeesWithStatus?.length || 0,
        attendeesWithStatusData: currentEvent.attendeesWithStatus,
        attendees: currentEvent.attendees?.length || 0,
        attendeesData: currentEvent.attendees,
        lastAttendeesUpdate: currentEvent.lastAttendeesUpdate,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack // Add stack trace to see what caused this update
      });
      
      // Update the ref for immediate access
      currentEventRef.current = currentEvent;
    }
  }, [currentEvent?.attendeesWithStatus, currentEvent?.attendees, currentEvent?.lastAttendeesUpdate]);
    // Handle click outside of modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEventModal(false);
        // Reset attendee editing state when modal closes
        setIsEditingAttendees(false);
        setNewAttendeeEmail('');
        setNewAttendeeName('');
      }
      if (addEventModalRef.current && !addEventModalRef.current.contains(event.target)) {
        setShowAddEventModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };  // Handle event click - fetch detailed event information
  const handleEventClick = async (event) => {
    try {      console.log('📅 Event clicked:', { 
        id: event.id, 
        title: event.title, 
        originalBackendId: event.originalBackendId,
        isBackendEvent: event.isBackendEvent,
        fullEvent: event 
      });
        // Set the basic event data first, but preserve any existing attendee data if available
      setCurrentEvent(prev => ({
        ...event,
        // Preserve attendee data if it exists from previous state AND if attendees were already fetched
        attendeesWithStatus: event.attendeesWithStatus || 
                            (prev?._attendeesFetched ? prev.attendeesWithStatus : []),
        attendees: event.attendees || 
                  (prev?._attendeesFetched ? prev.attendees : []),
        // Preserve the fetched flag
        _attendeesFetched: prev?._attendeesFetched || false
      }));
      setShowEventModal(true);
      
      // Only fetch detailed info if we have a valid backend event
      const shouldFetchDetails = event.isBackendEvent && 
                                event.originalBackendId &&
                                event.originalBackendId !== 'undefined' && 
                                event.originalBackendId !== undefined && 
                                event.originalBackendId !== null;
      
      // Also check for legacy events (events without the isBackendEvent flag)
      const isLegacyBackendEvent = !event.isBackendEvent &&
                                  event.id && 
                                  event.id !== 'undefined' && 
                                  event.id !== undefined && 
                                  event.id !== null &&
                                  typeof event.id === 'string' && 
                                  !event.id.startsWith('sample-') && 
                                  !event.id.startsWith('local-') &&
                                  !event.id.startsWith('fallback-') &&
                                  !event.id.startsWith('backend-undefined-');
      
      if (shouldFetchDetails || isLegacyBackendEvent) {
        const fetchId = shouldFetchDetails ? event.originalBackendId : event.id;
        
        try {
          // Fetch detailed event information from the API
          console.log('📅 Fetching detailed event information for ID:', fetchId);
          const response = await apiService.calendar.getById(fetchId);
          
          let detailedEvent;
          if (response.data && response.data.data) {
            detailedEvent = response.data.data;
          } else if (response.data) {
            detailedEvent = response.data;
          } else {
            throw new Error('Invalid response format');
          }
          
          // Transform detailed API data to frontend format
          const enrichedEvent = {
            ...event, // Keep the existing event data as fallback
            id: event.id, // Keep the display ID
            originalBackendId: event.originalBackendId || detailedEvent.id, // Preserve backend tracking
            isBackendEvent: event.isBackendEvent || true, // Mark as backend event
            title: detailedEvent.title || event.title,
            description: detailedEvent.description || event.description,
            start: new Date(detailedEvent.start_time || detailedEvent.startDate || detailedEvent.start_date || event.start),
            end: new Date(detailedEvent.end_time || detailedEvent.endDate || detailedEvent.end_date || event.end),
            category: detailedEvent.event_type || detailedEvent.category || event.category,
            priority: detailedEvent.priority || event.priority,
            project: detailedEvent.project_id || detailedEvent.project || event.project,
            task: detailedEvent.task_id || detailedEvent.task || event.task,
            completed: detailedEvent.completed || event.completed,
            location: detailedEvent.location || event.location,
            attendees: detailedEvent.attendees || event.attendees || [],
            color: detailedEvent.color || event.color,
            isAllDay: detailedEvent.is_all_day || event.isAllDay,
            recurrenceRule: detailedEvent.recurrence_rule || event.recurrenceRule,
            reminders: detailedEvent.reminders || event.reminders || [],
            // Additional detailed fields from API
            projectDetails: detailedEvent.project_details || null,
            taskDetails: detailedEvent.task_details || null,
            attendeesWithStatus: detailedEvent.attendees || detailedEvent.attendees_with_status || [],
            createdAt: detailedEvent.created_at ? new Date(detailedEvent.created_at) : null,
            updatedAt: detailedEvent.updated_at ? new Date(detailedEvent.updated_at) : null,
            createdBy: detailedEvent.created_by || null
          };          // Update the current event with detailed information, preserving existing attendee data
          setCurrentEvent(prev => ({
            ...enrichedEvent,
            // Preserve any attendee data that might have been fetched already if _attendeesFetched is true
            attendeesWithStatus: enrichedEvent.attendeesWithStatus || 
                               (prev?._attendeesFetched ? prev.attendeesWithStatus : []),
            attendees: enrichedEvent.attendees || 
                      (prev?._attendeesFetched ? prev.attendees : []),
            // Preserve the fetched flag
            _attendeesFetched: prev?._attendeesFetched || false
          }));
            console.log('✅ Event details fetched successfully:', enrichedEvent);
            // Fetch attendees for the event if it's a backend event
          if (enrichedEvent.isBackendEvent && enrichedEvent.originalBackendId) {
            await fetchEventAttendees(enrichedEvent.originalBackendId, enrichedEvent);
          }
          
        } catch (detailError) {
          console.error('❌ Error fetching event details (using basic event data):', detailError);
          // Continue with basic event data - don't block the modal
        }
      } else {
        console.log('📅 Using basic event data (local/sample event or invalid backend ID)');
          // Even for basic events, try to fetch attendees if it might be a backend event
        if (event.id && typeof event.id !== 'string' || 
            (typeof event.id === 'string' && 
             !event.id.startsWith('sample-') && 
             !event.id.startsWith('local-') && 
             !event.id.startsWith('fallback-') && 
             !event.id.startsWith('backend-undefined-'))) {
          console.log('📅 Attempting to fetch attendees for potential backend event:', event.id);
          await fetchEventAttendees(event.id, event);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in handleEventClick:', error);
      // Don't show error to user, just use the basic event data
      // The modal will still open with the basic information
    }
  };
  
  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };
  
  // Toggle view
  const changeView = (newView) => {
    setView(newView);
  };  // Handle new event form changes
  const handleNewEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setNewEvent(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle integer fields that need conversion
      if (name === 'project_id' || name === 'task_id') {
        const convertedValue = value === '' ? null : parseInt(value, 10) || null;
        setNewEvent(prev => ({
          ...prev,
          [name]: convertedValue
        }));
      } else {
        setNewEvent(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  // Open add event modal with optional pre-selected date
  const openAddEventModal = (selectedDate = null) => {
    if (selectedDate) {
      // Set the start time to the selected date at current time
      const startTime = new Date(selectedDate);
      startTime.setHours(new Date().getHours());
      startTime.setMinutes(new Date().getMinutes());
      
      // Set end time to 1 hour later
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      
      setNewEvent(prev => ({
        ...prev,
        start_time: startTime,
        end_time: endTime
      }));
      
      // Also update the selected date
      setSelectedDate(selectedDate);
    }
    
    setShowAddEventModal(true);
  };
    // Handle date/time changes for new event
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    const [date, time] = value.split('T');
    
    const newDateTime = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      newDateTime.setHours(parseInt(hours, 10));
      newDateTime.setMinutes(parseInt(minutes, 10));
    }
    
    setNewEvent(prev => ({
      ...prev,
      [name]: newDateTime
    }));
  };
  // Add new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('📅 Creating new calendar event...');
      
      // Prepare event data for API with correct field names
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start_time.toISOString(),
        end_time: newEvent.end_time.toISOString(),
        event_type: newEvent.event_type,
        priority: newEvent.priority,
        project_id: newEvent.project_id,
        task_id: newEvent.task_id,
        location: newEvent.location,
        is_all_day: newEvent.is_all_day,
        attendees: newEvent.attendees,
        reminders: newEvent.reminders,
        recurrence_rule: newEvent.recurrence_rule,
        color: newEvent.color
      };
      
      let createdEvent;
      let isLocalOnly = false;
      
      try {
        const response = await apiService.calendar.create(eventData);
        
        // Handle response and transform data
        if (response.data && response.data.data) {
          createdEvent = response.data.data;
        } else if (response.data) {
          createdEvent = response.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (apiError) {
        console.log('📅 No backend connection - creating event locally only');
        isLocalOnly = true;
          // Create a local event when API fails
        createdEvent = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          originalBackendId: null, // No backend ID for local events
          isBackendEvent: false, // Mark as local event
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type,
          priority: eventData.priority,
          project_id: eventData.project_id,
          task_id: eventData.task_id,
          location: eventData.location,
          is_all_day: eventData.is_all_day,
          attendees: eventData.attendees,
          reminders: eventData.reminders,
          recurrence_rule: eventData.recurrence_rule,
          color: eventData.color,
          completed: false
        };
      }      // Transform to frontend format
      const transformedEvent = {
        id: createdEvent.id,
        originalBackendId: isLocalOnly ? null : createdEvent.id, // Only store backend ID for backend events
        isBackendEvent: !isLocalOnly, // Mark as backend event if API succeeded
        title: createdEvent.title || eventData.title, // Fallback to original title if missing
        description: createdEvent.description || eventData.description || '',
        start: new Date(createdEvent.start_time || createdEvent.startDate || createdEvent.start_date),
        end: new Date(createdEvent.end_time || createdEvent.endDate || createdEvent.end_date),
        category: createdEvent.event_type || createdEvent.category || 'meeting',
        priority: createdEvent.priority || 'medium',
        project: createdEvent.project_id || createdEvent.project || '',
        completed: createdEvent.completed || false,
        location: createdEvent.location || '',
        attendees: createdEvent.attendees || [],
        color: createdEvent.color || getCategoryColor(createdEvent.event_type || createdEvent.category || 'meeting')
      };
      
      if (isLocalOnly) {
        // Add to local state directly when no backend
        setEvents(prevEvents => [...prevEvents, transformedEvent]);
      } else {
        // Refresh events from server to get updated data
        await fetchEvents();
      }
      
      // Update categories and ensure new event's category is selected
      const newEventCategory = transformedEvent.category;
      setCategories(prevCategories => {
        const updatedCategories = prevCategories.includes(newEventCategory) 
          ? prevCategories 
          : [...prevCategories, newEventCategory];
        return updatedCategories;
      });
      
      // Update selectedCategories to include the new category
      setSelectedCategories(prevSelected => {
        return prevSelected.includes(newEventCategory) 
          ? prevSelected 
          : [...prevSelected, newEventCategory];
      });
        // Reset form
      setShowAddEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
        event_type: 'meeting',
        priority: 'medium',
        project_id: '',
        task_id: '',
        location: '',
        is_all_day: false,
        attendees: [],
        reminders: [{ minutes_before: 15, notification_type: 'in_app' }],
        recurrence_rule: '',
        color: '#8b5cf6'
      });      // Show success notification
      console.log('📅 Event creation debugging:', {
        createdEventTitle: createdEvent.title,
        eventDataTitle: eventData.title,
        transformedEventTitle: transformedEvent.title,
        newEventTitle: newEvent.title,
        isLocalOnly
      });
      
      // Additional validation to catch undefined titles
      if (!transformedEvent.title || transformedEvent.title === 'undefined') {
        console.error('❌ Warning: Event title is undefined or invalid:', {
          transformedEvent,
          createdEvent,
          eventData,
          newEvent
        });
      }
      
      const successMessage = isLocalOnly 
        ? `Event "${transformedEvent.title || 'Untitled Event'}" created successfully! (Local only - no backend connection)`
        : `Event "${transformedEvent.title || 'Untitled Event'}" created successfully!`;
      success(successMessage);
      
      console.log('✅ Calendar event created successfully:', transformedEvent);
        } catch (error) {
      console.error('❌ Error creating calendar event:', error);
      setError('Failed to create event. Please try again.');
      showErrorNotification('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };  // Toggle event completion status
  const toggleEventCompletion = async () => {
    if (!currentEvent) return;
    
    try {
      console.log('📅 Toggling event completion status for event ID:', currentEvent.id);
      console.log('📅 Event details:', { 
        title: currentEvent.title, 
        id: currentEvent.id, 
        originalBackendId: currentEvent.originalBackendId,
        isBackendEvent: currentEvent.isBackendEvent 
      });
      
      // Check if this is an explicitly local/sample event (created offline or sample data)
      const isExplicitlyLocalEvent = currentEvent.id && 
                                   typeof currentEvent.id === 'string' && 
                                   (currentEvent.id.startsWith('sample-') || 
                                    currentEvent.id.startsWith('local-'));
      
      if (isExplicitlyLocalEvent) {
        console.log('🔄 Handling explicitly local/sample event completion toggle (no backend connection)');
        
        // Update local state only for sample events
        const updatedEvents = events.map(event => 
          event.id === currentEvent.id 
            ? { ...event, completed: !event.completed } 
            : event
        );        setEvents(updatedEvents);
        setCurrentEvent(prev => ({ 
          ...prev, 
          completed: !prev.completed,
          // Preserve attendee data 
          attendeesWithStatus: prev.attendeesWithStatus || currentEvent.attendeesWithStatus,
          attendees: prev.attendees || currentEvent.attendees,
          _attendeesFetched: prev._attendeesFetched || currentEvent._attendeesFetched
        }));
        
        // Show success notification
        const statusText = !currentEvent.completed ? 'completed' : 'pending';
        success(`Event "${currentEvent.title}" marked as ${statusText}! (Local only - no backend connection)`);
        console.log('✅ Event completion status updated locally');
        return;
      }
      
      // For backend events (including those with undefined IDs), try backend update first
      if (currentEvent.isBackendEvent) {
        console.log('🌐 Attempting backend completion toggle for backend event. Original ID:', currentEvent.originalBackendId);
          try {
          // Use the original backend ID for update, even if it's undefined
          const updateId = currentEvent.originalBackendId || currentEvent.id;
            // Use the correct PUT endpoint to update the event with new completion status
          await apiService.calendar.update(updateId, { 
            completed: !currentEvent.completed 
          });
            // Store attendee data before refreshing events
          const attendeeDataToPreserve = {
            attendeesWithStatus: currentEvent.attendeesWithStatus,
            attendees: currentEvent.attendees,
            _attendeesFetched: currentEvent._attendeesFetched
          };
          
          console.log('🔄 Preserving attendee data before fetchEvents():', attendeeDataToPreserve);
          
          // Refresh events from server to get the latest data
          await fetchEvents();
          
          // Find the updated event and restore attendee data
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === currentEvent.id || event.originalBackendId === currentEvent.originalBackendId
                ? {
                    ...event,
                    completed: !currentEvent.completed,
                    // Restore preserved attendee data
                    attendeesWithStatus: attendeeDataToPreserve.attendeesWithStatus,
                    attendees: attendeeDataToPreserve.attendees,
                    _attendeesFetched: attendeeDataToPreserve._attendeesFetched
                  }
                : event
            )
          );
          
          console.log('✅ Restored attendee data after fetchEvents()');
          
          // Update current event state
          setCurrentEvent(prev => ({ 
            ...prev, 
            completed: !prev.completed,
            // Preserve attendee data 
            attendeesWithStatus: attendeeDataToPreserve.attendeesWithStatus || prev.attendeesWithStatus,
            attendees: attendeeDataToPreserve.attendees || prev.attendees,
            _attendeesFetched: attendeeDataToPreserve._attendeesFetched || prev._attendeesFetched
          }));
          
          // Show success notification
          const statusText = !currentEvent.completed ? 'completed' : 'pending';
          success(`Event "${currentEvent.title}" marked as ${statusText}!`);
          
          console.log('✅ Event completion status updated successfully via backend using PUT /api/calendar/events/{id}');
          return;
          
        } catch (backendError) {
          console.error('❌ Backend completion toggle failed:', backendError);
            // If backend update fails, fall back to local update
          console.log('🔄 Backend update failed, falling back to local update...');
          
          const updatedEvents = events.map(event => 
            event.id === currentEvent.id 
              ? { ...event, completed: !event.completed } 
              : event
          );
          setEvents(updatedEvents);
          setCurrentEvent(prev => ({ 
            ...prev, 
            completed: !prev.completed,
            // Preserve attendee data 
            attendeesWithStatus: prev.attendeesWithStatus || currentEvent.attendeesWithStatus,
            attendees: prev.attendees || currentEvent.attendees,
            _attendeesFetched: prev._attendeesFetched || currentEvent._attendeesFetched
          }));
          
          const statusText = !currentEvent.completed ? 'completed' : 'pending';
          success(`Event "${currentEvent.title}" marked as ${statusText} locally (Backend update failed)`);
          console.log('✅ Event completion status updated locally due to backend failure');
          return;
        }
      }
      
      // Handle legacy events that don't have the isBackendEvent flag
      // This covers events created before the backend tracking was implemented
      if (currentEvent.id && 
          currentEvent.id !== 'undefined' && 
          currentEvent.id !== undefined && 
          currentEvent.id !== null &&
          !currentEvent.id.startsWith('fallback-') &&
          !currentEvent.id.startsWith('backend-undefined-')) {
        
        console.log('🌐 Attempting backend completion toggle for legacy event ID:', currentEvent.id);
          try {          // Use PUT endpoint to update event completion status
          await apiService.calendar.update(currentEvent.id, { 
            completed: !currentEvent.completed 
          });
            // Store attendee data before refreshing events
          const attendeeDataToPreserve = {
            attendeesWithStatus: currentEvent.attendeesWithStatus,
            attendees: currentEvent.attendees,
            _attendeesFetched: currentEvent._attendeesFetched
          };
          
          console.log('🔄 Preserving attendee data before fetchEvents():', attendeeDataToPreserve);
          
          // Refresh events from server to get the latest data          await fetchEvents();
          
          // Find the updated event and restore attendee data
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === currentEvent.id || event.originalBackendId === currentEvent.originalBackendId
                ? {
                    ...event,
                    completed: !currentEvent.completed,
                    // Restore preserved attendee data
                    attendeesWithStatus: attendeeDataToPreserve.attendeesWithStatus,
                    attendees: attendeeDataToPreserve.attendees,
                    _attendeesFetched: attendeeDataToPreserve._attendeesFetched
                  }
                : event
            )
          );
          
          console.log('✅ Restored attendee data after fetchEvents()');
          
          setCurrentEvent(prev => ({ 
            ...prev, 
            completed: !prev.completed,
            // Preserve attendee data 
            attendeesWithStatus: attendeeDataToPreserve.attendeesWithStatus || prev.attendeesWithStatus,
            attendees: attendeeDataToPreserve.attendees || prev.attendees,
            _attendeesFetched: attendeeDataToPreserve._attendeesFetched || prev._attendeesFetched
          }));
          
          const statusText = !currentEvent.completed ? 'completed' : 'pending';
          success(`Event "${currentEvent.title}" marked as ${statusText}!`);
          console.log('✅ Legacy event completion status updated successfully via backend using PUT /api/calendar/events/{id}');
          return;
          
        } catch (backendError) {
          console.error('❌ Backend completion toggle failed for legacy event:', backendError);
          
          const updatedEvents = events.map(event => 
            event.id === currentEvent.id 
              ? { ...event, completed: !event.completed } 
              : event          );
          setEvents(updatedEvents);
          setCurrentEvent(prev => ({ 
            ...prev, 
            completed: !prev.completed,
            // Preserve attendee data 
            attendeesWithStatus: prev.attendeesWithStatus || currentEvent.attendeesWithStatus,
            attendees: prev.attendees || currentEvent.attendees,
            _attendeesFetched: prev._attendeesFetched || currentEvent._attendeesFetched
          }));
          
          const statusText = !currentEvent.completed ? 'completed' : 'pending';
          success(`Event "${currentEvent.title}" marked as ${statusText} locally (Backend update failed)`);
          console.log('✅ Legacy event completion status updated locally due to backend failure');
          return;
        }
      }
      
      // Handle events with fallback IDs or undefined backend IDs - try local update
      console.log('⚠️ Event has fallback/undefined ID, attempting local update only');
      
      const updatedEvents = events.map(event => 
        event.id === currentEvent.id 
          ? { ...event, completed: !event.completed } 
          : event
      );      setEvents(updatedEvents);
      setCurrentEvent(prev => ({ 
        ...prev, 
        completed: !prev.completed,
        // Preserve attendee data 
        attendeesWithStatus: prev.attendeesWithStatus || currentEvent.attendeesWithStatus,
        attendees: prev.attendees || currentEvent.attendees,
        _attendeesFetched: prev._attendeesFetched || currentEvent._attendeesFetched
      }));
      
      const statusText = !currentEvent.completed ? 'completed' : 'pending';
      success(`Event "${currentEvent.title}" marked as ${statusText} locally (Invalid event ID)`);
      console.log('✅ Event with invalid ID completion status updated locally');
      
    } catch (error) {
      console.error('❌ Error in toggleEventCompletion function:', error);
      
      // Last resort: try local update if everything else fails
      try {
        const updatedEvents = events.map(event => 
          event.id === currentEvent.id 
            ? { ...event, completed: !event.completed } 
            : event
        );        setEvents(updatedEvents);
        setCurrentEvent(prev => ({ 
          ...prev, 
          completed: !prev.completed,
          // Preserve attendee data 
          attendeesWithStatus: prev.attendeesWithStatus || currentEvent.attendeesWithStatus,
          attendees: prev.attendees || currentEvent.attendees,
          _attendeesFetched: prev._attendeesFetched || currentEvent._attendeesFetched
        }));
        
        const statusText = !currentEvent.completed ? 'completed' : 'pending';
        success(`Event "${currentEvent.title}" marked as ${statusText} locally (Error occurred)`);
        console.log('✅ Event completion status updated locally due to error');
      } catch (localError) {
        console.error('❌ Even local update failed:', localError);
        setError('Failed to update event status. Please try again.');
        showErrorNotification('Failed to update event status. Please try again.');
      }
    }
  };// Delete event
  const deleteEvent = async () => {
    if (!currentEvent) return;
    
    try {
      console.log('📅 Deleting calendar event with ID:', currentEvent.id);
      console.log('📅 Event details:', { 
        title: currentEvent.title, 
        id: currentEvent.id, 
        originalBackendId: currentEvent.originalBackendId,
        isBackendEvent: currentEvent.isBackendEvent 
      });
      
      // Check if this is an explicitly local/sample event (created offline or sample data)
      const isExplicitlyLocalEvent = currentEvent.id && 
                                   typeof currentEvent.id === 'string' && 
                                   (currentEvent.id.startsWith('sample-') || 
                                    currentEvent.id.startsWith('local-'));
      
      if (isExplicitlyLocalEvent) {
        console.log('🔄 Handling explicitly local/sample event deletion (no backend connection)');
        
        // Remove the event from local state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== currentEvent.id));
        setShowEventModal(false);
        
        // Show success notification with offline indicator
        success(`Event "${currentEvent.title}" deleted successfully! (Local only - no backend connection)`);
        console.log('✅ Local/sample event deleted successfully');
        return;
      }
      
      // For backend events (including those with undefined IDs), try backend deletion first
      if (currentEvent.isBackendEvent) {
        console.log('🌐 Attempting backend deletion for backend event. Original ID:', currentEvent.originalBackendId);
        
        try {
          // Use the original backend ID for deletion, even if it's undefined
          // The backend should handle the deletion based on other identifying information
          const deleteId = currentEvent.originalBackendId || currentEvent.id;
          await apiService.calendar.delete(deleteId);
          
          // Refresh events from server to get the latest data
          await fetchEvents();
          
          setShowEventModal(false);
          
          // Show success notification
          success(`Event "${currentEvent.title}" deleted successfully!`);
          
          console.log('✅ Calendar event deleted successfully from backend');
          return;
          
        } catch (backendError) {
          console.error('❌ Backend deletion failed:', backendError);
          
          // If backend deletion fails, fall back to local deletion
          console.log('🔄 Backend deletion failed, falling back to local deletion...');
          
          setEvents(prevEvents => prevEvents.filter(event => event.id !== currentEvent.id));
          setShowEventModal(false);
          
          success(`Event "${currentEvent.title}" deleted locally (Backend deletion failed)`);
          console.log('✅ Event deleted locally due to backend failure');
          return;
        }
      }
      
      // Handle legacy events that don't have the isBackendEvent flag
      // This covers events created before the backend tracking was implemented
      if (currentEvent.id && 
          currentEvent.id !== 'undefined' && 
          currentEvent.id !== undefined && 
          currentEvent.id !== null &&
          !currentEvent.id.startsWith('fallback-') &&
          !currentEvent.id.startsWith('backend-undefined-')) {
        
        console.log('🌐 Attempting backend deletion for legacy event ID:', currentEvent.id);
        
        try {
          await apiService.calendar.delete(currentEvent.id);
          
          // Refresh events from server to get the latest data
          await fetchEvents();
          
          setShowEventModal(false);
          
          success(`Event "${currentEvent.title}" deleted successfully!`);
          console.log('✅ Legacy event deleted successfully from backend');
          return;
          
        } catch (backendError) {
          console.error('❌ Backend deletion failed for legacy event:', backendError);
          
          setEvents(prevEvents => prevEvents.filter(event => event.id !== currentEvent.id));
          setShowEventModal(false);
          
          success(`Event "${currentEvent.title}" deleted locally (Backend deletion failed)`);
          console.log('✅ Legacy event deleted locally due to backend failure');
          return;
        }
      }
      
      // Handle events with fallback IDs or undefined backend IDs - try local deletion
      console.log('⚠️ Event has fallback/undefined ID, performing local deletion only');
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== currentEvent.id));
      setShowEventModal(false);
      
      success(`Event "${currentEvent.title}" deleted locally (Invalid event ID)`);        console.log('✅ Event with invalid ID deleted locally');
      
    } catch (error) {
      console.error('❌ Error in deleteEvent function:', error);
      
      // Last resort: try local deletion if everything else fails
      try {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== currentEvent.id));
        setShowEventModal(false);
        
        success(`Event "${currentEvent.title}" deleted locally (Error occurred)`);
        console.log('✅ Event deleted locally due to error');
      } catch (localError) {
        console.error('❌ Even local deletion failed:', localError);
        setError('Failed to delete event. Please try again.');
        showErrorNotification('Failed to delete event. Please try again.');
      }
    }
  };

  // Attendee Management Functions  // Fetch attendees for a specific event
  const fetchEventAttendees = async (eventId, eventData = null) => {
    // Use provided eventData or fall back to currentEvent
    const targetEvent = eventData || currentEvent;
    
    // Early return if no event data available
    if (!targetEvent) {
      console.log('📅 Skipping attendee fetch - no event data available');
      return;
    }
    
    // Only skip if it's explicitly a local/sample event (string-based checks)
    const eventIdStr = String(eventId);
    if (!eventId || 
        (eventIdStr.startsWith('sample-') || 
         eventIdStr.startsWith('local-') || 
         eventIdStr.startsWith('fallback-') || 
         eventIdStr.startsWith('backend-undefined-'))) {
      console.log('📅 Skipping attendee fetch for local/sample event:', eventId);
      return;
    }
    
    // Convert numeric eventId to string for API calls
    const apiEventId = String(eventId);

    try {
      setAttendeesLoading(true);      console.log('📅 Fetching attendees for event:', eventId);
      
      // Prioritize the explicitly passed eventId, only fall back to targetEvent's backend ID if eventId is falsy
      const fetchId = apiEventId || targetEvent?.originalBackendId;
      
      console.log('📅 Attendee fetch decision logic:', {
        passedEventId: eventId,
        apiEventId: apiEventId,
        targetEventOriginalBackendId: targetEvent?.originalBackendId,
        targetEventId: targetEvent?.id,
        finalFetchId: fetchId,
        usingPassedId: !!apiEventId,
        fallbackToBackendId: !apiEventId && !!targetEvent?.originalBackendId
      });
      
      const response = await apiService.calendar.attendees.get(fetchId);
      
      console.log('📅 Attendees API response:', {
        status: response.status,
        data: response.data,
        fullResponse: response
      });
      
      let attendeesData = [];
      if (response.data && response.data.data) {
        attendeesData = response.data.data;
      } else if (response.data) {
        attendeesData = response.data;
      }
      
      // Ensure attendeesData is an array
      if (!Array.isArray(attendeesData)) {
        console.error('📅 Expected array but got:', typeof attendeesData, attendeesData);
        
        // Try to extract array from different possible structures
        if (attendeesData && typeof attendeesData === 'object') {
          // Check if it's wrapped in another object
          if (attendeesData.attendees && Array.isArray(attendeesData.attendees)) {
            attendeesData = attendeesData.attendees;
          } else if (attendeesData.data && Array.isArray(attendeesData.data)) {
            attendeesData = attendeesData.data;
          } else {
            // Convert object to array if it has numeric keys
            const values = Object.values(attendeesData);
            if (values.length > 0 && values[0] && typeof values[0] === 'object') {
              attendeesData = values;
            } else {
              console.warn('📅 Cannot parse attendees data, using empty array');
              attendeesData = [];
            }
          }
        } else {
          console.warn('📅 Invalid attendees data format, using empty array');
          attendeesData = [];
        }
      }
      
      console.log('📅 Processed attendees data:', attendeesData);
      
      // Normalize attendee data structure for consistent frontend display
      const normalizedAttendees = attendeesData.map(attendee => ({
        id: attendee.id || `attendee-${Date.now()}-${Math.random()}`,
        name: attendee.name || attendee.email || 'Unknown Attendee',
        email: attendee.email || '',
        status: attendee.status || 'pending',
        // Preserve any additional backend fields
        ...attendee
      }));
        console.log('📅 Raw attendees from backend:', attendeesData);
      console.log('📅 Normalized attendees for frontend:', normalizedAttendees);      // Update current event with fetched attendees
      console.log('📅 CRITICAL DEBUG - currentEvent check:', {
        currentEventExists: !!currentEvent,
        currentEventValue: currentEvent,
        currentEventId: currentEvent?.id,
        targetEventExists: !!targetEvent,
        targetEventValue: targetEvent,
        targetEventId: targetEvent?.id
      });
      
      if (currentEvent) {
        console.log('📅 Before state update - currentEvent.attendeesWithStatus:', currentEvent.attendeesWithStatus);
        console.log('📅 About to set normalizedAttendees:', normalizedAttendees);
        console.log('📅 Target event for attendees:', targetEvent?.id, 'Current event:', currentEvent?.id);// Always update currentEvent if we're fetching for the currently displayed event
        console.log('📅 Pre-condition check values:', {
          targetEvent: !!targetEvent,
          currentEvent: !!currentEvent,
          targetEventId: targetEvent?.id,
          targetEventIdType: typeof targetEvent?.id,
          currentEventId: currentEvent?.id,
          currentEventIdType: typeof currentEvent?.id,
          targetBackendId: targetEvent?.originalBackendId,
          currentBackendId: currentEvent?.originalBackendId,
          fetchId: fetchId,
          fetchIdType: typeof fetchId
        });
        
        const condition1 = String(targetEvent?.id) === String(currentEvent?.id);
        const condition2 = String(targetEvent?.originalBackendId) === String(currentEvent?.originalBackendId);
        const condition3 = String(fetchId) === String(currentEvent?.id);
        const condition4 = String(fetchId) === String(currentEvent?.originalBackendId);
        
        const shouldUpdateCurrentEvent = targetEvent && currentEvent && (condition1 || condition2 || condition3 || condition4);
        
        console.log('📅 Detailed condition evaluation:', {
          hasTargetEvent: !!targetEvent,
          hasCurrentEvent: !!currentEvent,
          condition1_targetId_eq_currentId: condition1,
          condition2_targetBackendId_eq_currentBackendId: condition2,
          condition3_fetchId_eq_currentId: condition3,
          condition4_fetchId_eq_currentBackendId: condition4,
          anyConditionTrue: condition1 || condition2 || condition3 || condition4,
          finalShouldUpdate: shouldUpdateCurrentEvent
        });
        
        console.log('📅 Should update current event:', shouldUpdateCurrentEvent);        if (shouldUpdateCurrentEvent) {
          console.log('📅 Updating currentEvent state with attendees:', normalizedAttendees);
          setCurrentEvent(prev => {
            const updatedEvent = {
              ...prev,
              attendeesWithStatus: normalizedAttendees,
              attendees: normalizedAttendees.map(att => att.email || att.name),
              // Add a timestamp to force React to recognize this as a new state
              lastAttendeesUpdate: Date.now(),
              // Mark that attendees have been successfully fetched
              _attendeesFetched: true
            };
            console.log('📅 State update - prev event:', prev);
            console.log('📅 State update - new event:', updatedEvent);
            console.log('📅 State update - attendeesWithStatus length:', updatedEvent.attendeesWithStatus?.length);
            return updatedEvent;
          });
          
          // Also store in a ref for immediate access without waiting for state update
          const refUpdate = {
            ...currentEvent,
            attendeesWithStatus: normalizedAttendees,
            attendees: normalizedAttendees.map(att => att.email || att.name),
            lastAttendeesUpdate: Date.now(),
            _attendeesFetched: true
          };
          currentEventRef.current = refUpdate;
          
          console.log('📅 Updated currentEventRef:', currentEventRef.current);
          console.log('📅 Updated currentEventRef attendeesWithStatus length:', currentEventRef.current?.attendeesWithStatus?.length);
        } else {
          console.log('📅 Skipping currentEvent update - event ID mismatch');
          console.log('📅 FORCING currentEventRef update as fallback...');
          
          // FORCE update the ref regardless of condition mismatch
          const refUpdate = {
            ...currentEvent,
            attendeesWithStatus: normalizedAttendees,
            attendees: normalizedAttendees.map(att => att.email || att.name),
            lastAttendeesUpdate: Date.now(),
            _attendeesFetched: true
          };
          currentEventRef.current = refUpdate;
          
          console.log('📅 FORCED currentEventRef update:', currentEventRef.current);
          console.log('📅 FORCED currentEventRef attendeesWithStatus length:', currentEventRef.current?.attendeesWithStatus?.length);
          
          // Also force state update since the condition logic might be wrong
          console.log('📅 FORCING currentEvent state update as well...');          setCurrentEvent(prev => {
            const updatedEvent = {
              ...prev,
              attendeesWithStatus: normalizedAttendees,
              attendees: normalizedAttendees.map(att => att.email || att.name),
              lastAttendeesUpdate: Date.now(),
              _attendeesFetched: true
            };
            console.log('📅 FORCED State update - prev event:', prev);
            console.log('📅 FORCED State update - new event:', updatedEvent);
            return updatedEvent;
          });
        }
      } else {
        console.log('🚨 CRITICAL: currentEvent is null/undefined during attendee fetch!');
        console.log('🚨 This is why attendees are not being stored in state/ref');
        console.log('🚨 Attempting to force update with targetEvent...');
        
        if (targetEvent) {
          console.log('📅 Using targetEvent as fallback for state update');
          
          // Force update currentEvent with the targetEvent and attendees
          setCurrentEvent({
            ...targetEvent,
            attendeesWithStatus: normalizedAttendees,
            attendees: normalizedAttendees.map(att => att.email || att.name),
            lastAttendeesUpdate: Date.now(),
            _attendeesFetched: true
          });
          
          // Also update the ref
          currentEventRef.current = {
            ...targetEvent,
            attendeesWithStatus: normalizedAttendees,
            attendees: normalizedAttendees.map(att => att.email || att.name),
            lastAttendeesUpdate: Date.now(),
            _attendeesFetched: true
          };
          
          console.log('✅ FORCED currentEvent update using targetEvent');
        } else {
          console.log('🚨 Both currentEvent and targetEvent are null - cannot update state');
        }
      }
        // Also update the events list to keep it in sync
      if (targetEvent && targetEvent.id) {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === targetEvent.id || event.originalBackendId === targetEvent.originalBackendId
              ? { 
                  ...event, 
                  attendeesWithStatus: normalizedAttendees,
                  attendees: normalizedAttendees.map(att => att.email || att.name)
                }
              : event
          )
        );
        console.log('📅 Updated events list with attendees for event:', targetEvent.id);
      }
      
      console.log('✅ Attendees fetched and synchronized successfully:', attendeesData);
      
    } catch (error) {
      console.error('❌ Error fetching attendees:', error);
      // Don't show error notification, just log it
    } finally {
      setAttendeesLoading(false);
    }
  };  // User lookup function to check if email belongs to existing user
  const lookupUserByEmail = async (email) => {
    try {
      // Try to search for user by email - this would be the ideal implementation
      // For now, we'll implement a fallback approach since no user lookup API is available
      console.log('📅 Attempting user lookup for email:', email);
      
      // If you have a users API endpoint, you could use something like:
      // const response = await apiService.users.search({ email });
      // return response.data?.user_id || null;
      
      // Since no user lookup API is available, return null for external attendees
      return null;
    } catch (error) {
      console.log('📅 User lookup failed (expected for external attendees):', error.message);
      return null;
    }
  };

  // Add new attendee to event
  const addAttendeeToEvent = async () => {
    if (!currentEvent || !newAttendeeEmail.trim()) return;
      // Use originalBackendId only if it exists and is valid, otherwise check if the main id is a real backend ID
    let eventId = currentEvent.originalBackendId;
    
    // If no originalBackendId, check if the main ID is a valid backend ID (not a generated frontend ID)
    if (!eventId || eventId === 'undefined' || eventId === null) {
      if (currentEvent.id && 
          typeof currentEvent.id !== 'string' || 
          (typeof currentEvent.id === 'string' && 
           !currentEvent.id.startsWith('backend-undefined-') &&
           !currentEvent.id.startsWith('fallback-') &&
           !currentEvent.id.startsWith('local-') &&
           !currentEvent.id.startsWith('sample-'))) {
        eventId = currentEvent.id;
      }
    }
    
    console.log('📅 Adding attendee - Event details:', {
      currentEventId: currentEvent.id,
      originalBackendId: currentEvent.originalBackendId,
      isBackendEvent: currentEvent.isBackendEvent,
      finalEventId: eventId,
      eventIdValidation: {
        hasOriginalBackendId: !!currentEvent.originalBackendId,
        mainIdType: typeof currentEvent.id,
        mainIdValue: currentEvent.id
      }
    });
    
    // Validate eventId - more comprehensive check
    if (!eventId || 
        eventId === 'undefined' || 
        eventId === null ||
        (typeof eventId === 'string' && 
         (eventId.startsWith('backend-undefined-') ||
          eventId.startsWith('fallback-') ||
          eventId.startsWith('local-') ||
          eventId.startsWith('sample-')))) {
      console.error('📅 Invalid event ID for attendee addition:', eventId);
      success(`Attendee added locally (invalid event ID)`);
      
      // Handle as local event
      const newAttendee = {
        id: `local-attendee-${Date.now()}`,
        name: newAttendeeName.trim() || newAttendeeEmail.trim(),
        email: newAttendeeEmail.trim(),
        status: 'pending'
      };
      
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: [...(prev.attendeesWithStatus || []), newAttendee],
        attendees: [...(prev.attendees || []), newAttendee.email]
      }));
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: [...(event.attendeesWithStatus || []), newAttendee],
                attendees: [...(event.attendees || []), newAttendee.email]
              }
            : event
        )
      );
      
      setNewAttendeeEmail('');
      setNewAttendeeName('');
      return;
    }
    
    // Check if this is explicitly a local/sample event
    const isExplicitlyLocalEvent = eventId && 
                                   typeof eventId === 'string' && 
                                   (eventId.startsWith('sample-') || 
                                    eventId.startsWith('local-'));
    
    if (isExplicitlyLocalEvent) {
      console.log('📅 Handling explicitly local/sample event for attendee addition');
      
      // Handle local event - update only in local state
      const newAttendee = {
        id: `local-attendee-${Date.now()}`,
        name: newAttendeeName.trim() || newAttendeeEmail.trim(),
        email: newAttendeeEmail.trim(),
        status: 'pending'
      };
      
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: [...(prev.attendeesWithStatus || []), newAttendee],
        attendees: [...(prev.attendees || []), newAttendee.email]
      }));
      
      // Update in events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: [...(event.attendeesWithStatus || []), newAttendee],
                attendees: [...(event.attendees || []), newAttendee.email]
              }
            : event
        )
      );
      
      setNewAttendeeEmail('');
      setNewAttendeeName('');
      success(`Attendee added locally (local event)`);
      return;
    }    // For all other events, try backend first
    try {
      setAttendeesLoading(true);
      console.log('📅 Attempting backend attendee addition for event:', eventId);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAttendeeEmail.trim())) {
        throw new Error('Invalid email format');
      }

      // Try to lookup user by email to get user_id
      console.log('📅 Looking up user by email for backend API...');
      const userId = await lookupUserByEmail(newAttendeeEmail.trim());
      
      // Prepare attendee data for backend API
      const attendeeData = {
        name: newAttendeeName.trim() || newAttendeeEmail.trim(),
        email: newAttendeeEmail.trim(),
        status: 'pending'
      };
      
      // Include user_id only if we found an existing user
      if (userId) {
        attendeeData.user_id = userId;
        // Also try attendeeUserId as an alternative field name
        attendeeData.attendeeUserId = userId;
        console.log('📅 Found existing user, including user_id:', userId);
      } else {
        console.log('📅 External attendee - no user_id available');
      }
      
      // Ensure name is not empty
      if (!attendeeData.name || attendeeData.name.length === 0) {
        attendeeData.name = attendeeData.email.split('@')[0]; // Use email prefix as fallback name
      }
      
      console.log('📅 Attendee data being sent to backend:', {
        eventId,
        attendeeData,
        url: `/calendar/events/${eventId}/attendees`
      });
        const response = await apiService.calendar.attendees.add(eventId, attendeeData);
      
      console.log('📅 Backend response for attendee addition:', {
        status: response.status,
        data: response.data,
        fullResponse: response
      });
      
      let newAttendee;
      if (response.data && response.data.data) {
        newAttendee = response.data.data;
      } else if (response.data) {
        newAttendee = response.data;
      } else {
        newAttendee = attendeeData;
      }
      
      // Ensure the attendee object has the required fields for display
      newAttendee = {
        id: newAttendee.id || `attendee-${Date.now()}`,
        name: newAttendee.name || attendeeData.name,
        email: newAttendee.email || attendeeData.email,
        status: newAttendee.status || attendeeData.status || 'pending',
        // Preserve any additional backend fields
        ...newAttendee
      };
      
      console.log('📅 Processed attendee for frontend:', newAttendee);
      
      // Update current event
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: [...(prev.attendeesWithStatus || []), newAttendee],
        attendees: [...(prev.attendees || []), newAttendee.email]
      }));
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: [...(event.attendeesWithStatus || []), newAttendee],
                attendees: [...(event.attendees || []), newAttendee.email]
              }
            : event
        )
      );
      
      setNewAttendeeEmail('');
      setNewAttendeeName('');
      success(`Attendee "${newAttendee.name}" added successfully!`);
      console.log('✅ Attendee added successfully via backend');
    } catch (error) {
      console.error('❌ Backend attendee addition failed:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('📅 Backend error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Show more specific error message if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Backend error: ${error.response.status}`;
        console.error('📅 Specific error:', errorMessage);
      } else if (error.request) {
        console.error('📅 No response received:', error.request);
      } else {
        console.error('📅 Error setting up request:', error.message);
      }
      
      // Fall back to local addition if backend fails
      console.log('🔄 Backend failed, falling back to local attendee addition...');
      
      const newAttendee = {
        id: `local-attendee-${Date.now()}`,
        name: newAttendeeName.trim() || newAttendeeEmail.trim(),
        email: newAttendeeEmail.trim(),
        status: 'pending'
      };
      
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: [...(prev.attendeesWithStatus || []), newAttendee],
        attendees: [...(prev.attendees || []), newAttendee.email]
      }));
      
      // Update in events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: [...(event.attendeesWithStatus || []), newAttendee],
                attendees: [...(event.attendees || []), newAttendee.email]
              }
            : event
        )
      );
      
      setNewAttendeeEmail('');
      setNewAttendeeName('');
      success(`Attendee added locally (backend failed)`);
    } finally {
      setAttendeesLoading(false);
    }
  };  // Remove attendee from event
  const removeAttendeeFromEvent = async (attendeeId, attendeeIdentifier) => {
    if (!currentEvent) return;
    
    // Use originalBackendId only if it exists and is valid, otherwise check if the main id is a real backend ID
    let eventId = currentEvent.originalBackendId;
    
    // If no originalBackendId, check if the main ID is a valid backend ID (not a generated frontend ID)
    if (!eventId || eventId === 'undefined' || eventId === null) {
      if (currentEvent.id && 
          typeof currentEvent.id !== 'string' || 
          (typeof currentEvent.id === 'string' && 
           !currentEvent.id.startsWith('backend-undefined-') &&
           !currentEvent.id.startsWith('fallback-') &&
           !currentEvent.id.startsWith('local-') &&
           !currentEvent.id.startsWith('sample-'))) {
        eventId = currentEvent.id;
      }
    }
    
    console.log('📅 Removing attendee - Event details:', {
      currentEventId: currentEvent.id,
      originalBackendId: currentEvent.originalBackendId,
      isBackendEvent: currentEvent.isBackendEvent,
      finalEventId: eventId,
      attendeeId,
      attendeeIdentifier,
      eventIdValidation: {
        hasOriginalBackendId: !!currentEvent.originalBackendId,
        mainIdType: typeof currentEvent.id,
        mainIdValue: currentEvent.id
      }
    });    // Check if attendee exists in current event data (use ref for immediate access)
    const eventToCheck = currentEventRef.current || currentEvent;
    const attendeeExistsInStatus = eventToCheck.attendeesWithStatus?.some(att => 
      att.id === attendeeId || att.email === attendeeIdentifier
    );
    const attendeeExistsInBasic = eventToCheck.attendees?.includes(attendeeIdentifier);
      // Force refresh if attendeesWithStatus is empty but attendees exist (state sync issue)
    if (!attendeeExistsInStatus && attendeeExistsInBasic && 
        (!currentEvent.attendeesWithStatus || currentEvent.attendeesWithStatus.length === 0) &&
        currentEvent.attendees && currentEvent.attendees.length > 0) {
      console.log('📅 State synchronization issue detected - attendeesWithStatus empty but attendees exist, force refreshing...');
      
      try {
        await fetchEventAttendees(eventId, currentEvent);
        // After refresh, check again and update attendeeId if we found the attendee
        const refreshedEvent = currentEventRef.current || currentEvent;
        const foundAttendee = refreshedEvent.attendeesWithStatus?.find(att => 
          att.email === attendeeIdentifier
        );
        
        if (foundAttendee) {
          console.log('📅 Attendee found after refresh, updating attendeeId and continuing with removal...');
          console.log('📅 Found attendee details:', foundAttendee);
          
          // Update the attendeeId to use the real backend ID
          attendeeId = foundAttendee.id;
          
          console.log('📅 Updated attendeeId for removal:', attendeeId);
          // Continue with the removal process after refresh with proper ID
        } else {
          console.warn('📅 Attendee still not found after refresh');
          showErrorNotification('Attendee not found in current event');
          return;
        }
      } catch (refreshError) {
        console.error('📅 Failed to refresh attendees:', refreshError);
        showErrorNotification('Failed to refresh attendee data');
        return;      }
    } else if (!attendeeExistsInStatus && !attendeeExistsInBasic) {
      // Both arrays checked and attendee not found
      console.warn('📅 Attendee not found in current event data:', {
        attendeeId,
        attendeeIdentifier,
        currentAttendees: currentEvent.attendees,
        currentAttendeesWithStatus: currentEvent.attendeesWithStatus
      });
      showErrorNotification('Attendee not found in current event');
      return;
    }
    
    // Final check: if attendeeId is still null, try to find it one more time
    if (!attendeeId) {
      console.log('📅 AttendeeId is null, attempting final lookup...');
      const eventData = currentEventRef.current || currentEvent;
      const foundAttendee = eventData.attendeesWithStatus?.find(att => 
        att.email === attendeeIdentifier
      );
      
      if (foundAttendee && foundAttendee.id) {
        attendeeId = foundAttendee.id;
        console.log('📅 Found attendeeId in final lookup:', attendeeId);
      } else {
        console.log('📅 Could not find valid attendeeId, will handle as email-based removal');
      }
    }
      // Check if this is explicitly a local/sample event OR if we don't have a valid backend event ID
    const isExplicitlyLocalEvent = !eventId || 
                                   eventId === 'undefined' || 
                                   eventId === null ||
                                   (typeof eventId === 'string' && 
                                    (eventId.startsWith('sample-') || 
                                     eventId.startsWith('local-') ||
                                     eventId.startsWith('backend-undefined-') ||
                                     eventId.startsWith('fallback-')));
    
    if (isExplicitlyLocalEvent) {
      console.log('📅 Handling local/sample event or invalid backend ID for attendee removal:', eventId);
      
      // Handle local event - update only in local state
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
          att.id !== attendeeId && att.email !== attendeeIdentifier
        ),
        attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
      }));
      
      // Update in events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                  att.id !== attendeeId && att.email !== attendeeIdentifier
                ),
                attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
              }
            : event
        )
      );
        success(`Attendee removed locally`);
      return;
    }

    // For all other events, try backend first - but validate the IDs first
    
    // Additional validation for backend call
    if (!eventId || (!Number.isInteger(Number(eventId)) && typeof eventId !== 'string')) {
      console.error('📅 Invalid event ID for backend call:', eventId, typeof eventId);
      console.log('📅 Falling back to local removal due to invalid event ID');
      
      // Handle as local removal
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
          att.id !== attendeeId && att.email !== attendeeIdentifier
        ),
        attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
      }));
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                  att.id !== attendeeId && att.email !== attendeeIdentifier
                ),
                attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
              }
            : event
        )
      );
      
      success(`Attendee removed locally (invalid event ID)`);
      return;
    }
    
    try {
      setAttendeesLoading(true);      console.log('📅 Attempting backend attendee removal for event:', eventId, attendeeId);
        // Validate attendee ID before making backend call
      if (!attendeeId || 
          attendeeId === null || 
          attendeeId === undefined || 
          (typeof attendeeId === 'string' && attendeeId.startsWith('basic-'))) {
        console.log('📅 Invalid or missing attendee ID for backend call:', attendeeId);
        console.log('📅 Falling back to local removal due to invalid/missing attendee ID');
        
        // Handle as local removal
        setCurrentEvent(prev => ({
          ...prev,
          attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
            att.email !== attendeeIdentifier
          ),
          attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
        }));
        
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === currentEvent.id 
              ? { 
                  ...event, 
                  attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                    att.email !== attendeeIdentifier
                  ),
                  attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
                }
              : event
          )
        );
        
        success(`Attendee removed locally (no valid backend ID)`);
        setAttendeesLoading(false);
        return;
      }        // At this point, attendeeId should be a valid backend ID
      console.log('📅 Using valid attendee ID for backend removal:', attendeeId);
      
      // Backend call first - wait for success before updating state
      await apiService.calendar.attendees.remove(eventId, attendeeId);
      
      console.log('✅ Backend attendee removal successful, updating frontend state...');
        // Only update frontend state after successful backend confirmation
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
          att.id !== attendeeId && att.email !== attendeeIdentifier
        ),
        attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
      }));
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                  att.id !== attendeeId && att.email !== attendeeIdentifier
                ),
                attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
              }
            : event
        )
      );
      
      success(`Attendee removed successfully!`);
      console.log('✅ Attendee removed successfully via backend and frontend state updated');
    } catch (error) {
      console.error('❌ Backend attendee removal failed:', error);
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error('📅 Backend error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          eventId,
          attendeeId,
          attendeeIdentifier
        });
        
        // Show more specific error message if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Backend error: ${error.response.status}`;
        console.error('📅 Specific error:', errorMessage);
        
        // Handle different error scenarios
        if (error.response.status === 404) {
          console.error('📅 404 Error: Attendee or event not found on backend');
          // For 404, the attendee might already be deleted, so we can remove from frontend
          console.log('🔄 Attendee not found on backend (404), removing from frontend state...');
          
          setCurrentEvent(prev => ({
            ...prev,
            attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
              att.id !== attendeeId && att.email !== attendeeIdentifier
            ),
            attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
          }));
          
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === currentEvent.id 
                ? { 
                    ...event, 
                    attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                      att.id !== attendeeId && att.email !== attendeeIdentifier
                    ),
                    attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
                  }
                : event
            )
          );
          
          success(`Attendee removed (was already deleted on backend)`);
        } else if (error.response.status >= 400 && error.response.status < 500) {
          // Client errors (400-499) - don't fall back to local deletion
          const clientErrorMessage = error.response.data?.message || `Failed to remove attendee: ${errorMessage}`;
          showErrorNotification(clientErrorMessage);
          console.log('🚫 Client error occurred, not falling back to local deletion');
        } else {
          // Server errors (500+) - could fall back to local deletion as a last resort
          console.log('🔄 Server error occurred, falling back to local attendee removal...');
          
          setCurrentEvent(prev => ({
            ...prev,
            attendeesWithStatus: (prev.attendeesWithStatus || []).filter(att => 
              att.id !== attendeeId && att.email !== attendeeIdentifier
            ),
            attendees: (prev.attendees || []).filter(email => email !== attendeeIdentifier)
          }));
          
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === currentEvent.id 
                ? { 
                    ...event, 
                    attendeesWithStatus: (event.attendeesWithStatus || []).filter(att => 
                      att.id !== attendeeId && att.email !== attendeeIdentifier
                    ),
                    attendees: (event.attendees || []).filter(email => email !== attendeeIdentifier)
                  }
                : event
            )
          );
          
          showErrorNotification(`Backend server error occurred. Attendee removed locally as fallback.`);
        }
      } else if (error.request) {
        // Network error - no response received
        console.error('📅 No response received (network error):', error.request);
        showErrorNotification('Network error: Unable to connect to server. Please check your connection and try again.');
        console.log('🚫 Network error occurred, not falling back to local deletion');
      } else {
        // Error setting up request
        console.error('📅 Error setting up request:', error.message);
        showErrorNotification('Request error: Failed to set up removal request.');
        console.log('🚫 Request setup error occurred, not falling back to local deletion');
      }
    } finally {
      setAttendeesLoading(false);
    }
  };

  // Update attendee status
  const updateAttendeeStatus = async (attendeeId, newStatus, attendeeIdentifier) => {
    if (!currentEvent) return;
    
    const eventId = currentEvent.originalBackendId || currentEvent.id;
    
    // Check if this is a local/sample event
    if (!eventId || typeof eventId !== 'string' || 
        eventId.startsWith('sample-') || eventId.startsWith('local-') || 
        eventId.startsWith('fallback-') || eventId.startsWith('backend-undefined-')) {
      
      // Handle local event - update only in local state
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: (prev.attendeesWithStatus || []).map(att => 
          att.id === attendeeId || att.email === attendeeIdentifier
            ? { ...att, status: newStatus }
            : att
        )
      }));
      
      // Update in events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: (event.attendeesWithStatus || []).map(att => 
                  att.id === attendeeId || att.email === attendeeIdentifier
                    ? { ...att, status: newStatus }
                    : att
                )
              }
            : event
        )
      );
      
      success(`Attendee status updated locally to ${newStatus}`);
      return;
    }

    try {
      setAttendeesLoading(true);
      console.log('📅 Updating attendee status:', eventId, attendeeId, newStatus);
      
      await apiService.calendar.attendees.updateStatus(eventId, attendeeId, newStatus);
      
      // Update current event
      setCurrentEvent(prev => ({
        ...prev,
        attendeesWithStatus: (prev.attendeesWithStatus || []).map(att => 
          att.id === attendeeId ? { ...att, status: newStatus } : att
        )
      }));
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === currentEvent.id 
            ? { 
                ...event, 
                attendeesWithStatus: (event.attendeesWithStatus || []).map(att => 
                  att.id === attendeeId ? { ...att, status: newStatus } : att
                )
              }
            : event
        )
      );
      
      success(`Attendee status updated to ${newStatus}!`);
      
    } catch (error) {
      console.error('❌ Error updating attendee status:', error);
      showErrorNotification('Failed to update attendee status. Please try again.');
    } finally {
      setAttendeesLoading(false);
    }
  };
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week (0-6) for first day of month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Check if a date has events
  const hasEvents = (date) => {
    return filteredEvents.some(event => 
      date.getDate() === event.start.getDate() && 
      date.getMonth() === event.start.getMonth() && 
      date.getFullYear() === event.start.getFullYear()
    );
  };
  
  // Get events for a specific date
  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => 
      date.getDate() === event.start.getDate() && 
      date.getMonth() === event.start.getMonth() && 
      date.getFullYear() === event.start.getFullYear()
    );
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is selected
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Get color for category
  const getCategoryColor = (category) => {
    const colorMap = {
      meeting: '#3b82f6',
      deadline: '#ef4444',
      planning: '#8b5cf6',
      development: '#10b981',
      review: '#6366f1',
      learning: '#ec4899'
    };
    
    return colorMap[category] || '#9ca3af';
  };
  
  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meeting':
        return <FaUserFriends />;
      case 'deadline':
        return <FaExclamationTriangle />;
      case 'planning':
        return <FaTasks />;
      case 'development':
        return <FaLaptopCode />;
      case 'review':
        return <FaCode />;
      case 'learning':
        return <FaGraduationCap />;
      default:
        return <FaCalendarAlt />;
    }
  };
  
  // Get badge for priority
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="priority-badge high">High Priority</span>;
      case 'medium':
        return <span className="priority-badge medium">Medium Priority</span>;
      case 'low':
        return <span className="priority-badge low">Low Priority</span>;
      default:
        return null;
    }
  };
    // Format date for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  // Handle creating events from availability slots
  const handleCreateFromAvailability = async (timeSlot, userId) => {
    try {
      console.log('📅 Creating event from availability slot:', timeSlot);
      
      if (!timeSlot || !timeSlot.start_time || !timeSlot.end_time) {
        throw new Error('Invalid time slot data. Missing start or end time.');
      }
      
      // Prepare event data
      const eventData = {
        title: 'Meeting',
        description: 'Meeting scheduled from availability check',
        start_time: new Date(timeSlot.start_time),
        end_time: new Date(timeSlot.end_time),
        event_type: 'meeting',
        priority: 'medium',
        location: '',
        is_all_day: false,
        attendees: userId ? [userId] : [],
        color: '#4ADE80' // Green color for availability-created events
      };
      
      // Open the add event modal with prefilled data from availability
      setNewEvent({
        ...newEvent,
        ...eventData
      });
      
      // Close availability modal
      closeAvailabilityModal();
      
      // Open add event modal
      setShowAddEventModal(true);
        success('Event details loaded from availability slot. Review and submit to create.');
    } catch (err) {
      console.error('Error preparing event from availability:', err);
      showErrorNotification(err.message || 'Failed to prepare event from availability slot.');
      
      // If error occurs, keep the availability modal open
      setIsModalOpen(true);
    }  };
    // Helper function to check if a date has availability data
  const hasAvailabilityForDate = (date) => {
    if (!availability || !availability.length) {
      console.log('📅 No availability data:', { availability });
      return false;
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const hasSlots = availability.some(slot => {
      const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
      return slotDate === dateStr;
    });
    
    if (hasSlots) {
      console.log('📅 Found availability for date:', dateStr, availability.filter(slot => {
        const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
        return slotDate === dateStr;
      }));
    }
    
    return hasSlots;
  };
  
  // Get availability slots for a specific date
  const getAvailabilityForDate = (date) => {
    if (!availability || !availability.length) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.filter(slot => {
      const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
      return slotDate === dateStr;
    });
  };
  
  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }
      // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const hasEventsToday = dayEvents.length > 0;      const hasAvailability = hasAvailabilityForDate(date);
      const availabilitySlots = getAvailabilityForDate(date);
      
      // Debug logging
      console.log(`📅 Day ${day}:`, {
        date: date.toISOString().split('T')[0],
        hasEventsToday,
        hasAvailability,
        availabilitySlots: availabilitySlots.length,
        totalAvailability: availability?.length || 0
      });
        // Create tooltip text for availability
      const createAvailabilityTooltip = () => {
        if (!hasAvailability) return '';
        
        const slots = availabilitySlots.slice(0, 3); // Show first 3 slots
        const tooltipText = slots.map(slot => {
          const startTime = new Date(slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const endTime = new Date(slot.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          return `${startTime} - ${endTime}`;
        }).join('\n');
        
        if (availabilitySlots.length > 3) {
          return `${tooltipText}\n+${availabilitySlots.length - 3} more slots`;
        }
        
        return `Available slots:\n${tooltipText}`;
      };
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            openAddEventModal(date);
          }}
          title={createAvailabilityTooltip()}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            <div className="day-indicators">
              {hasEventsToday && <span className="event-indicator blue"></span>}
              {hasAvailability && <span className="event-indicator purple"></span>}
            </div>
          </div>
          <div className="day-events">
            {dayEvents.slice(0, 3).map(event => (
              <div 
                key={event.id} 
                className={`day-event ${event.completed ? 'completed' : ''}`}
                style={{ backgroundColor: event.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                <span className="event-title">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="more-events" onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(date);
                setView('day');
              }}>
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const days = [];
    
    // Create 7 days for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <div key={`week-day-${i}`} className="week-day">
          <div className={`week-day-header ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`} onClick={() => {
            setSelectedDate(date);
            openAddEventModal(date);
          }}>
            <div className="week-day-name">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
            <div className="week-day-number">{date.getDate()}</div>
          </div>
          <div className="week-day-events">
            {dayEvents.map(event => (
              <motion.div 
                key={event.id} 
                className={`week-event ${event.completed ? 'completed' : ''}`}
                style={{ backgroundColor: event.color }}
                onClick={() => handleEventClick(event)}
                whileHover={{ y: -2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="week-event-time">
                  {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, '0')} - 
                  {event.end.getHours()}:{event.end.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="week-event-title">{event.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="week-view">
        {days}
      </div>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    // Create time slots (1-hour intervals)
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = dayEvents.filter(event => event.start.getHours() === hour);
      
      timeSlots.push(
        <div key={`hour-${hour}`} className="day-time-slot">
          <div className="time-label">
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
          <div className="time-events">
            {hourEvents.map(event => (
              <motion.div 
                key={event.id} 
                className={`time-event ${event.completed ? 'completed' : ''}`}
                style={{ backgroundColor: event.color }}
                onClick={() => handleEventClick(event)}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="time-event-title">{event.title}</div>
                <div className="time-event-time">
                  {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, '0')} - 
                  {event.end.getHours()}:{event.end.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="time-event-project">
                  <FaProjectDiagram className="time-event-icon" />
                  {event.project}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="day-view">
        <div className="day-header">
          <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
        </div>
        <div className="day-time-slots">
          {timeSlots}
        </div>
      </div>
    );
  };
  
  // Render agenda view
  const renderAgendaView = () => {
    // Group events by date
    const groupedEvents = {};
    
    filteredEvents.forEach(event => {
      const dateKey = event.start.toDateString();
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    
    // Sort dates
    const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a) - new Date(b));
    
    return (
      <div className="agenda-view">
        {sortedDates.length === 0 ? (
          <div className="no-events">
            <FaRegCalendarAlt className="no-events-icon" />
            <h3>No events found</h3>
            <p>Try adjusting your filters or add new events</p>
            <button className="btn-primary" onClick={() => setShowAddEventModal(true)}>
              <FaPlus /> Add Event
            </button>
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <motion.div 
              key={dateKey} 
              className="agenda-date"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="agenda-date-header">
                <h3>{new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              </div>
              <div className="agenda-events">
                {groupedEvents[dateKey].map(event => (
                  <motion.div 
                    key={event.id} 
                    className={`agenda-event ${event.completed ? 'completed' : ''}`}
                    whileHover={{ y: -3, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}
                    onClick={() => handleEventClick(event)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="agenda-event-color" style={{ backgroundColor: event.color }}></div>
                    <div className="agenda-event-content">
                      <div className="agenda-event-header">
                        <h4>{event.title}</h4>
                        {getPriorityBadge(event.priority)}
                      </div>
                      <p className="agenda-event-description">{event.description}</p>
                      <div className="agenda-event-details">
                        <div className="agenda-event-time">
                          <FaRegClock />
                          <span>
                            {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                            {event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="agenda-event-project">
                          <FaProjectDiagram />
                          <span>{event.project}</span>
                        </div>
                        {event.location && (
                          <div className="agenda-event-location">
                            <FaMapMarkerAlt />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="agenda-event-category">
                          {getCategoryIcon(event.category)}
                          <span>{event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="agenda-event-status">
                      {event.completed ? (
                        <FaCheckCircle className="status-icon completed" />
                      ) : (
                        <FaRegClock className="status-icon pending" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  };
  
  // Render event modal
  const renderEventModal = () => {
    if (!currentEvent) return null;
    
    return (
      <motion.div 
        className="event-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="event-modal"
          ref={modalRef}
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <div className="event-modal-header" style={{ backgroundColor: currentEvent.color }}>
            <div className="event-modal-category">
              {getCategoryIcon(currentEvent.category)}
              <span>{currentEvent.category.charAt(0).toUpperCase() + currentEvent.category.slice(1)}</span>
            </div>            <button className="event-modal-close" onClick={() => {
              setShowEventModal(false);
              setIsEditingAttendees(false);
              setNewAttendeeEmail('');
              setNewAttendeeName('');
            }}>
              <FaTimes />
            </button>
          </div>
          <div className="event-modal-content">
            <h2 className="event-modal-title">{currentEvent.title}</h2>
            <div className="event-modal-meta">
              <div className="event-status">
                {currentEvent.completed ? (
                  <>
                    <FaCheckCircle />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <FaRegClock />
                    <span>Pending</span>
                  </>
                )}
              </div>
              {getPriorityBadge(currentEvent.priority)}
            </div>
            
            <div className="event-modal-description">
              <p>{currentEvent.description}</p>
            </div>
              <div className="event-modal-details">
              <div className="detail-item">
                <div className="detail-icon">
                  <FaRegCalendarAlt />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Date & Time</span>
                  <div className="detail-value">
                    {currentEvent.isAllDay ? (
                      <>
                        {currentEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        <br />
                        <span className="all-day-badge">All Day Event</span>
                      </>
                    ) : (
                      <>
                        {currentEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        <br />
                        {currentEvent.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                        {currentEvent.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Project Details */}
              {(currentEvent.project || currentEvent.projectDetails) && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaProjectDiagram />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Project</span>
                    <div className="detail-value">
                      {currentEvent.projectDetails ? (
                        <>
                          <strong>{currentEvent.projectDetails.title || currentEvent.project}</strong>
                          {currentEvent.projectDetails.description && (
                            <div className="detail-sub-text">{currentEvent.projectDetails.description}</div>
                          )}
                        </>
                      ) : (
                        currentEvent.project
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Task Details */}
              {(currentEvent.task || currentEvent.taskDetails) && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaTasks />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Task</span>
                    <div className="detail-value">
                      {currentEvent.taskDetails ? (
                        <>
                          <strong>{currentEvent.taskDetails.title || currentEvent.task}</strong>
                          {currentEvent.taskDetails.description && (
                            <div className="detail-sub-text">{currentEvent.taskDetails.description}</div>
                          )}                          {currentEvent.taskDetails.status && (
                            <div className={`task-status-badge status-${currentEvent.taskDetails.status}`}>
                              {currentEvent.taskDetails.status.charAt(0).toUpperCase() + currentEvent.taskDetails.status.slice(1)}
                            </div>
                          )}
                        </>
                      ) : (
                        currentEvent.task
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Location */}
              {currentEvent.location && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    <div className="detail-value">{currentEvent.location}</div>
                  </div>
                </div>
              )}              {/* Enhanced Attendees with Management */}
              {((currentEvent.attendeesWithStatus && currentEvent.attendeesWithStatus.length > 0) || 
                (currentEvent.attendees && currentEvent.attendees.length > 0) || 
                isEditingAttendees) && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUserFriends />
                  </div>
                  <div className="detail-content">
                    <div className="detail-header">
                      <span className="detail-label">Attendees</span>
                      <button 
                        className="btn-icon-small" 
                        onClick={() => setIsEditingAttendees(!isEditingAttendees)}
                        disabled={attendeesLoading}
                      >
                        {isEditingAttendees ? <FaTimes /> : <FaEdit />}
                      </button>
                    </div>
                    
                    {attendeesLoading && (
                      <div className="loading-spinner-small"></div>
                    )}
                    
                    <div className="attendees-list">
                      {(() => {
                        try {
                          if (currentEvent.attendeesWithStatus && currentEvent.attendeesWithStatus.length > 0) {
                            return currentEvent.attendeesWithStatus.map((attendee, index) => (
                              <div key={attendee.id || index} className="attendee-with-status">
                                <div className="attendee-info">
                                  <span className="attendee-name">
                                    {attendee?.name || attendee?.email || 'Unknown Attendee'}
                                  </span>
                                  <span className={`attendee-status status-${attendee?.status || 'pending'}`}>
                                    {attendee?.status ? attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1) : 'Pending'}
                                  </span>
                                </div>
                                
                                {isEditingAttendees && (
                                  <div className="attendee-actions">
                                    <select
                                      value={attendee.status || 'pending'}
                                      onChange={(e) => updateAttendeeStatus(
                                        attendee.id, 
                                        e.target.value, 
                                        attendee.email
                                      )}
                                      className="status-select"
                                      disabled={attendeesLoading}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="accepted">Accepted</option>
                                      <option value="declined">Declined</option>
                                      <option value="tentative">Tentative</option>
                                    </select>
                                    <button
                                      className="btn-icon-small danger"
                                      onClick={() => removeAttendeeFromEvent(
                                        attendee.id, 
                                        attendee.email
                                      )}
                                      disabled={attendeesLoading}
                                      title="Remove attendee"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ));
                          } else if (currentEvent.attendees && currentEvent.attendees.length > 0) {
                            return currentEvent.attendees.map((attendee, index) => (
                              <div key={index} className="attendee-with-status">
                                <div className="attendee-info">
                                  <span className="attendee-name">
                                    {typeof attendee === 'string' 
                                      ? attendee 
                                      : (attendee?.email || attendee?.name || 'Unknown')}
                                  </span>
                                  <span className="attendee-status status-pending">
                                    Pending
                                  </span>
                                </div>                                  {isEditingAttendees && (
                                  <div className="attendee-actions">
                                    <button
                                      className="btn-icon-small danger"                                      onClick={() => {
                                        // For basic attendees, we need to use email as identifier and try to find real ID
                                        const attendeeEmail = typeof attendee === 'string' ? attendee : attendee.email;
                                        
                                        console.log('📅 Looking for attendee with email:', attendeeEmail);
                                        
                                        // Try multiple data sources to find the real attendee ID
                                        // 1. First try the ref (most up-to-date)
                                        let eventData = currentEventRef.current;
                                        let realAttendee = eventData?.attendeesWithStatus?.find(att => 
                                          att.email === attendeeEmail
                                        );
                                        
                                        // 2. If not found in ref, try current state
                                        if (!realAttendee) {
                                          eventData = currentEvent;
                                          realAttendee = eventData?.attendeesWithStatus?.find(att => 
                                            att.email === attendeeEmail
                                          );
                                        }
                                        
                                        // 3. If still not found, try to trigger a fresh fetch
                                        if (!realAttendee && (!eventData?.attendeesWithStatus || eventData.attendeesWithStatus.length === 0)) {
                                          console.log('📅 No attendeesWithStatus found, will trigger fetch in removeAttendeeFromEvent');
                                        }
                                        
                                        // Only use real ID if found, otherwise pass null to trigger fetch/lookup in removeAttendeeFromEvent
                                        const realAttendeeId = realAttendee?.id || null;
                                        
                                        console.log('📅 Removing basic attendee:', {
                                          index,
                                          attendeeEmail,
                                          realAttendee,
                                          realAttendeeId,
                                          hasRealId: !!realAttendee?.id,
                                          willFallbackToLocal: !realAttendee?.id,
                                          usingRefData: !!currentEventRef.current,
                                          eventDataSource: currentEventRef.current ? 'ref' : 'state',
                                          refAttendeesLength: currentEventRef.current?.attendeesWithStatus?.length || 0,
                                          stateAttendeesLength: currentEvent?.attendeesWithStatus?.length || 0
                                        });
                                        
                                        // Pass null for ID if no real ID found - this will trigger lookup/fetch in removeAttendeeFromEvent
                                        removeAttendeeFromEvent(realAttendeeId, attendeeEmail);
                                      }}
                                      disabled={attendeesLoading}
                                      title="Remove attendee"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ));
                          }
                          
                          if (isEditingAttendees && (!currentEvent.attendeesWithStatus || currentEvent.attendeesWithStatus.length === 0) && 
                              (!currentEvent.attendees || currentEvent.attendees.length === 0)) {
                            return <p className="no-attendees">No attendees yet. Add some below!</p>;
                          }
                          
                          return null;
                        } catch (error) {
                          console.error('Error rendering attendees:', error);
                          return <span className="attendee">Error loading attendees</span>;
                        }
                      })()}
                      
                      {/* Add New Attendee Form */}
                      {isEditingAttendees && (
                        <div className="add-attendee-form">
                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Attendee Name (optional)"
                              value={newAttendeeName}
                              onChange={(e) => setNewAttendeeName(e.target.value)}
                              className="attendee-input"
                              disabled={attendeesLoading}
                            />
                            <input
                              type="email"
                              placeholder="Email Address"
                              value={newAttendeeEmail}
                              onChange={(e) => setNewAttendeeEmail(e.target.value)}
                              className="attendee-input"
                              disabled={attendeesLoading}
                              required
                            />                            <button
                              className="btn-primary-small"
                              onClick={addAttendeeToEvent}
                              disabled={!newAttendeeEmail.trim() || 
                                       attendeesLoading || 
                                       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAttendeeEmail.trim())}
                              title="Add attendee"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reminders */}
              {currentEvent.reminders && currentEvent.reminders.length > 0 && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaBell />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Reminders</span>
                    <div className="reminders-list">
                      {currentEvent.reminders.map((reminder, index) => (
                        <div key={index} className="reminder-item-display">
                          {reminder.minutes_before} minutes before via {reminder.notification_type}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Recurrence Rule */}
              {currentEvent.recurrenceRule && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaSyncAlt />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Recurrence</span>
                    <div className="detail-value">
                      {currentEvent.recurrenceRule.replace('FREQ=', '').toLowerCase().charAt(0).toUpperCase() + 
                       currentEvent.recurrenceRule.replace('FREQ=', '').toLowerCase().slice(1)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Created/Updated Information */}
              {(currentEvent.createdAt || currentEvent.updatedAt) && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaInfoCircle />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Event Information</span>
                    <div className="detail-value">
                      {currentEvent.createdAt && (
                        <div className="event-timestamp">
                          Created: {currentEvent.createdAt.toLocaleDateString('en-US')} at {currentEvent.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      )}
                      {currentEvent.updatedAt && currentEvent.updatedAt.getTime() !== currentEvent.createdAt?.getTime() && (
                        <div className="event-timestamp">
                          Last updated: {currentEvent.updatedAt.toLocaleDateString('en-US')} at {currentEvent.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      )}
                      {currentEvent.createdBy && (
                        <div className="event-timestamp">
                          Created by: {currentEvent.createdBy.name || currentEvent.createdBy.email || 'Unknown'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="event-modal-actions">
              <button className="btn-outline danger" onClick={deleteEvent}>
                <FaTrash /> Delete
              </button>              <button className="btn-outline" onClick={() => {
                setShowEventModal(false);
                setIsEditingAttendees(false);
                setNewAttendeeEmail('');
                setNewAttendeeName('');
              }}>
                <FaTimes /> Close
              </button>
              <button className="btn-primary" onClick={toggleEventCompletion}>
                {currentEvent.completed ? (
                  <>
                    <FaRegCalendarMinus /> Mark as Pending
                  </>
                ) : (
                  <>
                    <FaRegCheckCircle /> Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Render add event modal
  const renderAddEventModal = () => {
    return (
      <motion.div 
        className="event-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="event-modal add-event-modal"
          ref={addEventModalRef}
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <div className="event-modal-header" style={{ backgroundColor: getCategoryColor(newEvent.event_type) }}>
            <div className="event-modal-category">
              <FaRegCalendarPlus />
              <span>Add New Event</span>
            </div>
            <button className="event-modal-close" onClick={() => setShowAddEventModal(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="event-modal-content">
            <form onSubmit={handleAddEvent} className="add-event-form">
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newEvent.title}
                  onChange={handleNewEventChange}
                  required
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleNewEventChange}
                  placeholder="Enter event description"
                  rows="3"
                ></textarea>
              </div>
                <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_time">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formatDateForInput(newEvent.start_time)}
                    onChange={handleDateTimeChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="end_time">End Date & Time</label>
                  <input
                    type="datetime-local"
                    id="end_time"
                    name="end_time"
                    value={formatDateForInput(newEvent.end_time)}
                    onChange={handleDateTimeChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_all_day"
                    checked={newEvent.is_all_day}
                    onChange={handleNewEventChange}
                  />
                  <span>All Day Event</span>
                </label>
              </div>
                <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event_type">Event Type</label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={newEvent.event_type}
                    onChange={handleNewEventChange}
                    required
                  >
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="milestone">Milestone</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="review">Review</option>
                    <option value="learning">Learning</option>
                    <option value="standup">Standup</option>
                    <option value="presentation">Presentation</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newEvent.priority}
                    onChange={handleNewEventChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project_id">Project</label>
                  <input
                    type="text"
                    id="project_id"
                    name="project_id"
                    value={newEvent.project_id || ''}
                    onChange={handleNewEventChange}
                    placeholder="Enter project ID or name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="task_id">Task</label>
                  <input
                    type="text"
                    id="task_id"
                    name="task_id"
                    value={newEvent.task_id || ''}
                    onChange={handleNewEventChange}
                    placeholder="Enter task ID or name"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={handleNewEventChange}
                    placeholder="Enter location"
                  />
                </div>
                  <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={newEvent.color}
                    onChange={handleNewEventChange}
                  />
                </div>
              </div>
              
              {/* Attendees Section */}
              <div className="form-group">
                <label htmlFor="attendees">Attendees</label>                <textarea
                  id="attendees"
                  name="attendees"
                  value={Array.isArray(newEvent.attendees) 
                    ? newEvent.attendees.map(attendee => 
                        typeof attendee === 'string' ? attendee : (attendee?.email || attendee?.name || '')
                      ).join(', ')
                    : ''
                  }
                  onChange={(e) => {
                    const attendeesList = e.target.value.split(',').map(email => email.trim()).filter(email => email);
                    setNewEvent(prev => ({ ...prev, attendees: attendeesList }));
                  }}
                  placeholder="Enter email addresses separated by commas"
                  rows="2"
                />
                <small className="form-help">Enter attendee email addresses separated by commas</small>
              </div>
              
              {/* Reminders Section */}
              <div className="form-group">
                <label>Reminders</label>
                <div className="reminders-container">
                  {newEvent.reminders.map((reminder, index) => (
                    <div key={index} className="reminder-item">
                      <div className="reminder-row">
                        <input
                          type="number"
                          value={reminder.minutes_before}
                          onChange={(e) => {
                            const newReminders = [...newEvent.reminders];
                            newReminders[index].minutes_before = parseInt(e.target.value) || 0;
                            setNewEvent(prev => ({ ...prev, reminders: newReminders }));
                          }}
                          placeholder="Minutes"
                          min="0"
                          max="10080"
                        />
                        <span>minutes before via</span>
                        <select
                          value={reminder.notification_type}
                          onChange={(e) => {
                            const newReminders = [...newEvent.reminders];
                            newReminders[index].notification_type = e.target.value;
                            setNewEvent(prev => ({ ...prev, reminders: newReminders }));
                          }}
                        >
                          <option value="in_app">In-App</option>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                        </select>
                        {newEvent.reminders.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon-small danger"
                            onClick={() => {
                              const newReminders = newEvent.reminders.filter((_, i) => i !== index);
                              setNewEvent(prev => ({ ...prev, reminders: newReminders }));
                            }}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-outline-small"
                    onClick={() => {
                      setNewEvent(prev => ({
                        ...prev,
                        reminders: [...prev.reminders, { minutes_before: 15, notification_type: 'in_app' }]
                      }));
                    }}
                  >
                    <FaPlus /> Add Reminder
                  </button>
                </div>
              </div>
              
              {/* Recurrence Rule */}
              <div className="form-group">
                <label htmlFor="recurrence_rule">Recurrence</label>
                <select
                  id="recurrence_rule"
                  name="recurrence_rule"
                  value={newEvent.recurrence_rule}
                  onChange={handleNewEventChange}
                >
                  <option value="">No Recurrence</option>
                  <option value="FREQ=DAILY">Daily</option>
                  <option value="FREQ=WEEKLY">Weekly</option>
                  <option value="FREQ=MONTHLY">Monthly</option>
                  <option value="FREQ=YEARLY">Yearly</option>
                </select>
              </div>
                <div className="event-modal-actions">
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setShowAddEventModal(false)}
                  disabled={isSubmitting}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };
    if (isLoading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <h3>Loading calendar...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-error">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <h3>Error Loading Calendar</h3>
        <p>{error}</p>
        <button 
          className="btn-primary" 
          onClick={() => window.location.reload()}
        >
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {error && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FaTimes />
          </button>
        </div>
      )}
      <div className="calendar-header">
        <div className="header-left">
          <h1><FaCalendarAlt /> Calendar</h1>
          <p className="header-description">
            Manage your schedule, deadlines, and project timelines
          </p>
        </div>
        
        <div className="header-actions">
          <div className="search-box" ref={searchRef}>
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                <FaTimes />
              </button>
            )}
          </div>          <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filter
          </button>
          <button className="btn-availability" onClick={openAvailabilityModal}>
            <FaUserFriends /> Check Availability
          </button>
          
          <button className="btn-primary" onClick={() => openAddEventModal()}>
            <FaPlus /> Add Event
          </button>
        </div>
      </div>
      
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="btn-today" onClick={goToToday}>
            Today
          </button>
          <div className="navigation-buttons">
            <button className="btn-nav" onClick={goToPreviousMonth}>
              <FaChevronLeft />
            </button>
            <button className="btn-nav" onClick={goToNextMonth}>
              <FaChevronRight />
            </button>
          </div>
          <h2 className="current-date">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="toolbar-right">
          <div className="view-switcher">
            <button 
              className={`view-button ${view === 'month' ? 'active' : ''}`} 
              onClick={() => changeView('month')}
            >
              <FaThLarge /> <span>Month</span>
            </button>
            <button 
              className={`view-button ${view === 'week' ? 'active' : ''}`} 
              onClick={() => changeView('week')}
            >
              <FaRegCalendarAlt /> <span>Week</span>
            </button>
            <button 
              className={`view-button ${view === 'day' ? 'active' : ''}`} 
              onClick={() => changeView('day')}
            >
              <FaRegCalendarCheck /> <span>Day</span>
            </button>
            <button 
              className={`view-button ${view === 'agenda' ? 'active' : ''}`} 
              onClick={() => changeView('agenda')}
            >
              <FaListUl /> <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filters-content">
              <div className="filter-section">
                <h3>Categories</h3>
                <div className="category-filters">
                  {categories.map(category => (
                    <div 
                      key={category} 
                      className={`category-filter ${selectedCategories.includes(category) ? 'active' : ''}`}
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="category-color" style={{ backgroundColor: getCategoryColor(category) }}></div>
                      <div className="category-icon">{getCategoryIcon(category)}</div>
                      <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="filter-actions">
                <button className="btn-outline" onClick={() => setSelectedCategories([])}>
                  Clear Filters
                </button>
                <button className="btn-primary" onClick={() => setSelectedCategories(categories)}>
                  Select All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="calendar-content">
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
            {view === 'agenda' && renderAgendaView()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {showEventModal && renderEventModal()}
        {showAddEventModal && renderAddEventModal()}
      </AnimatePresence>
      
      <style jsx>{`
        /* Calendar Container */
        .calendar-container {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        /* Calendar Header */
        .calendar-header {
          background: var(--gradient-primary);
          color: var(--white);
          padding: var(--spacing-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-left h1 {
          font-size: var(--text-2xl);
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .header-description {
          font-size: var(--text-sm);
          opacity: 0.9;
          color: var(--dark-color)
        }
        
        .header-actions {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
        }
        
        .clear-search {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--white);
          cursor: pointer;
          font-size: var(--text-base);
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .clear-search:hover {
          opacity: 1;
        }
        
        /* Buttons */
        .btn-filter {
          background-color: rgba(255, 255, 255, 0.2);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
        }
          .btn-filter:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .btn-availability {
          background-color: rgba(72, 187, 120, 0.8);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
        }
        
        .btn-availability:hover {
          background-color: rgba(72, 187, 120, 1);
        }
        
        .btn-primary {
          background-color: var(--white);
          color: var(--primary-color);
          border: none;
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .btn-outline {
          background-color: transparent;
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition);
        }
        
        .btn-outline:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .btn-outline.danger {
          color: var(--danger-color);
          border-color: var(--danger-color);
        }
        
        .btn-outline.danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        /* Calendar Toolbar */
        .calendar-toolbar {
          padding: var(--spacing-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .btn-today {
          background-color: var(--gray-100);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition);
        }
        
        .btn-today:hover {
          background-color: var(--gray-200);
        }
        
        .navigation-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        .btn-nav {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--gray-100);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
        
        .btn-nav:hover {
          background-color: var(--gray-200);
        }
        
        .current-date {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0 var(--spacing-md);
        }
        
        .view-switcher {
          display: flex;
          background-color: var(--gray-100);
          border-radius: var(--border-radius);
          padding: 2px;
          border: 1px solid var(--gray-300);
        }
        
        .view-button {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: var(--text-sm);
          border-radius: var(--border-radius);
          color: var(--gray-600);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: var(--transition-fast);
        }
        
        .view-button:hover {
          background-color: var(--gray-200);
        }
        
        .view-button.active {
          background-color: var(--primary-color);
          color: var(--white);
        }
        
        /* Filters Panel */
        .filters-panel {
          border-bottom: 1px solid var(--gray-200);
          overflow: hidden;
        }
        
        .filters-content {
          padding: var(--spacing-md);
        }
        
        .filter-section h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-sm);
        }
        
        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .category-filter {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          background-color: var(--gray-100);
          border: 1px solid var(--gray-200);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .category-filter:hover {
          background-color: var(--gray-200);
        }
        
        .category-filter.active {
          background-color: var(--gray-50);
          border-color: var(--primary-color);
          box-shadow: 0 0 0 1px var(--primary-color);
        }
        
        .category-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .category-icon {
          color: var(--gray-700);
          font-size: var(--text-sm);
        }
        
        .category-name {
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
        }
        
        /* Calendar Content */
        .calendar-content {
          flex: 1;
          overflow: auto;
          padding: var(--spacing-md);
        }
        
        /* Calendar Grid */
        .calendar-grid {
          background-color: var(--white);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
        }
        
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .weekday {
          padding: var(--spacing-sm);
          text-align: center;
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(100px, 1fr);
        }
        
        .calendar-day {
          border-right: 1px solid var(--gray-200);
          border-bottom: 1px solid var(--gray-200);
          padding: var(--spacing-xs);
          min-height: 100px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .calendar-day:nth-child(7n) {
          border-right: none;
        }
        
        .calendar-day:hover {
          background-color: var(--gray-50);
        }
        
        .calendar-day.empty {
          background-color: var(--gray-50);
          cursor: default;
        }
        
        .calendar-day.today {
          background-color: rgba(79, 70, 229, 0.05);
        }
        
        .calendar-day.selected {
          background-color: rgba(79, 70, 229, 0.1);
          border: 2px solid var(--primary-color);
        }
          .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xs);
        }
        
        .day-indicators {
          display: flex;
          gap: 2px;
          align-items: center;
        }
        
        .day-number {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .calendar-day.today .day-number {
          background-color: var(--primary-color);
          color: var(--white);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .event-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .event-indicator.blue {
          background-color: var(--primary-color);
        }
          .event-indicator.purple {
          background-color: #8B5CF6;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.8);
          width: 8px;
          height: 8px;
        }
        
        .day-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .day-event {
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 10px;
          color: var(--white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .day-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .day-event.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }
        
        .more-events {
          font-size: 10px;
          color: var(--primary-color);
          text-align: center;
          padding: 2px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .more-events:hover {
          text-decoration: underline;
        }
        
        /* Week View */
        .week-view {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--spacing-xs);
          background-color: var(--white);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
        }
        
        .week-day {
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }
        
        .week-day-header {
          padding: var(--spacing-sm);
          text-align: center;
          background-color: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .week-day-header:hover {
          background-color: var(--gray-200);
        }
        .week-day-header.today {
          background-color: rgba(79, 70, 229, 0.1);
        }
        
        .week-day-header.selected {
          background-color: rgba(79, 70, 229, 0.2);
          border: 1px solid var(--primary-color);
        }
        
        .week-day-name {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .week-day-number {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--gray-800);
        }
        
        .week-day-events {
          padding: var(--spacing-xs);
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .week-event {
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          color: var(--white);
          cursor: pointer;
          transition: var(--transition);
        }
        
        .week-event.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }
        
        .week-event-time {
          font-size: var(--text-xs);
          margin-bottom: 2px;
          opacity: 0.9;
        }
        
        .week-event-title {
          font-weight: 500;
          font-size: var(--text-sm);
        }
        
        /* Day View */
        .day-view {
          background-color: var(--white);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
        }
        
        .day-header {
          padding: var(--spacing-md);
          background-color: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .day-header h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .day-time-slots {
          padding: var(--spacing-md);
        }
        
        .day-time-slot {
          display: flex;
          margin-bottom: var(--spacing-md);
        }
        
        .time-label {
          width: 80px;
          font-size: var(--text-sm);
          color: var(--gray-500);
          text-align: right;
          padding-right: var(--spacing-md);
          font-weight: 500;
        }
        
        .time-events {
          flex: 1;
          border-left: 1px solid var(--gray-200);
          padding-left: var(--spacing-md);
          min-height: 40px;
        }
        
        .time-event {
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          color: var(--white);
          margin-bottom: var(--spacing-sm);
          cursor: pointer;
          transition: var(--transition);
        }
        
        .time-event.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }
        
        .time-event-title {
          font-weight: 500;
          font-size: var(--text-sm);
          margin-bottom: 2px;
        }
        
        .time-event-time {
          font-size: var(--text-xs);
          margin-bottom: 4px;
          opacity: 0.9;
        }
        
        .time-event-project {
          font-size: var(--text-xs);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .time-event-icon {
          font-size: 10px;
        }
        
        /* Agenda View */
        .agenda-view {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .agenda-date {
          background-color: var(--white);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--gray-200);
        }
        
        .agenda-date-header {
          padding: var(--spacing-md);
          background-color: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .agenda-date-header h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .agenda-events {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .agenda-event {
          display: flex;
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          overflow: hidden;
          transition: var(--transition);
          cursor: pointer;
          background-color: var(--white);
        }
        
        .agenda-event.completed {
          opacity: 0.7;
        }
        
        .agenda-event-color {
          width: 8px;
          flex-shrink: 0;
        }
        
        .agenda-event-content {
          flex: 1;
          padding: var(--spacing-md);
        }
        
        .agenda-event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xs);
        }
        
        .agenda-event-header h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .agenda-event-description {
          font-size: var(--text-sm);
          color: var(--gray-600);
          margin-bottom: var(--spacing-sm);
        }
        
        .agenda-event-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }
        
        .agenda-event-time,
        .agenda-event-project,
        .agenda-event-location,
        .agenda-event-category {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--gray-600);
        }
        
        .agenda-event-status {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--spacing-md);
          background-color: var(--gray-50);
        }
        
        .status-icon {
          font-size: var(--text-xl);
        }
        
        .status-icon.completed {
          color: var(--success-color);
        }
        
        .status-icon.pending {
          color: var(--warning-color);
        }
        
        /* No Events */
        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-2xl);
          background-color: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          text-align: center;
        }
        
        .no-events-icon {
          font-size: var(--text-4xl);
          color: var(--gray-400);
          margin-bottom: var(--spacing-md);
        }
        
        .no-events h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: var(--spacing-xs);
        }
        
        .no-events p {
          font-size: var(--text-base);
          color: var(--gray-500);
          margin-bottom: var(--spacing-lg);
        }
        
        /* Event Modal */
        .event-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-md);
        }
        
        .event-modal {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
        }
        
        .add-event-modal {
          max-width: 600px;
        }
        
        .event-modal-header {
          padding: var(--spacing-lg);
          color: var(--white);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .event-modal-category {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: 600;
        }
        
        .event-modal-close {
          background: none;
          border: none;
          color: var(--white);
          font-size: var(--text-xl);
          cursor: pointer;
          opacity: 0.8;
          transition: var(--transition-fast);
        }
        
        .event-modal-close:hover {
          opacity: 1;
        }
        
        .event-modal-content {
          padding: var(--spacing-lg);
        }
        
        .event-modal-title {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
        }
        
        .event-modal-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .event-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .priority-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        
        .priority-badge.high {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .priority-badge.medium {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
        
        .priority-badge.low {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--info-color);
        }
        
        .event-modal-description {
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-lg);
        }
        
        .event-modal-description p {
          font-size: var(--text-sm);
          color: var(--gray-700);
          line-height: 1.6;
        }
        
        .event-modal-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        
        .detail-item {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .detail-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--border-radius);
          background-color: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          font-size: var(--text-base);
        }
        
        .detail-content {
          flex: 1;
        }
        
        .detail-label {
          font-size: var(--text-xs);
          color: var(--gray-500);
          margin-bottom: 2px;
        }
        
        .detail-value {
          font-size: var(--text-sm);
          color: var(--gray-800);
        }
        
        .attendees-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
        }
          .attendee {
          font-size: var(--text-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--gray-100);
          border-radius: var(--border-radius-full);
          color: var(--gray-700);
        }
        
        /* New Modal Element Styles */
        .detail-sub-text {
          font-size: var(--text-xs);
          color: var(--gray-600);
          margin-top: var(--spacing-xs);
          font-style: italic;
          line-height: 1.4;
        }
        
        .task-status-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          margin-top: var(--spacing-xs);
          text-transform: capitalize;
        }
        
        .task-status-badge.status-pending {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .task-status-badge.status-in-progress {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--info-color);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .task-status-badge.status-completed {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .task-status-badge.status-cancelled {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .attendee-with-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xs);
          border: 1px solid var(--gray-200);
        }
        
        .attendee-name {
          font-size: var(--text-sm);
          color: var(--gray-700);
          font-weight: 500;
        }
        
        .attendee-status {
          font-size: var(--text-xs);
          padding: 2px var(--spacing-xs);
          border-radius: var(--border-radius-sm);
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .attendee-status.status-accepted {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }
        
        .attendee-status.status-declined {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .attendee-status.status-tentative {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
          .attendee-status.status-pending {
          background-color: rgba(156, 163, 175, 0.1);
          color: var(--gray-600);
        }
        
        /* Attendee Management Styles */
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .attendee-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          flex: 1;
        }
        
        .attendee-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-left: var(--spacing-sm);
        }
        
        .status-select {
          font-size: var(--text-xs);
          padding: 2px var(--spacing-xs);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius-sm);
          background-color: var(--white);
          min-width: 80px;
        }
        
        .add-attendee-form {
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--gray-200);
        }
        
        .attendee-input {
          flex: 1;
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
        }
        
        .attendee-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
        
        .btn-primary-small {
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          transition: var(--transition);
        }
        
        .btn-primary-small:hover:not(:disabled) {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
        }
        
        .btn-primary-small:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-icon-small {
          padding: var(--spacing-xs);
          background: none;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          transition: var(--transition);
          color: var(--gray-600);
        }
        
        .btn-icon-small:hover:not(:disabled) {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
          transform: translateY(-1px);
        }
        
        .btn-icon-small.danger {
          color: var(--danger-color);
          border-color: var(--danger-color);
        }
        
        .btn-icon-small.danger:hover:not(:disabled) {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: var(--danger-color);
        }
        
        .btn-icon-small:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .no-attendees {
          color: var(--gray-500);
          font-style: italic;
          font-size: var(--text-sm);
          margin: 0;
        }
        
        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid var(--gray-200);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: var(--spacing-xs) 0;
        }
        
        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xs);
        }
        
        .reminder-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .reminder-icon {
          color: var(--primary-color);
          font-size: var(--text-sm);
        }
        
        .reminder-text {
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .event-timestamp {
          font-size: var(--text-xs);
          color: var(--gray-500);
          margin-bottom: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .event-timestamp:last-child {
          margin-bottom: 0;
        }
        
        .all-day-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          border: 1px solid rgba(79, 70, 229, 0.3);
          margin-left: var(--spacing-sm);
        }
        
        .event-modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          border-top: 1px solid var(--gray-200);
          padding-top: var(--spacing-md);
        }
        
        /* Add Event Form */
        .add-event-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
        
        .form-group label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--gray-700);
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: var(--spacing-sm);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
          .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        
        /* Checkbox Styles */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          font-size: var(--text-sm);
          color: var(--gray-700);
        }
        
        .checkbox-label input[type="checkbox"] {
          margin: 0;
          cursor: pointer;
        }
        
        /* Form Help Text */
        .form-help {
          font-size: var(--text-xs);
          color: var(--gray-500);
          margin-top: var(--spacing-xs);
        }
        
        /* Reminders Styles */
        .reminders-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .reminder-item {
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          padding: var(--spacing-sm);
          background-color: var(--gray-50);
        }
        
        .reminder-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }
        
        .reminder-row input[type="number"] {
          width: 80px;
          padding: var(--spacing-xs);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
        }
        
        .reminder-row select {
          padding: var(--spacing-xs);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
        }
        
        .reminder-row span {
          font-size: var(--text-sm);
          color: var(--gray-600);
        }
        
        .btn-outline-small {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--primary-color);
          background-color: transparent;
          color: var(--primary-color);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-outline-small:hover {
          background-color: var(--primary-color);
          color: var(--white);
        }
        
        .btn-icon-small {
          padding: var(--spacing-xs);
          border: none;
          border-radius: var(--border-radius);
          background-color: transparent;
          color: var(--gray-500);
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-icon-small.danger {
          color: var(--danger-color);
        }
        
        .btn-icon-small:hover {
          background-color: var(--gray-100);
        }
        
        .btn-icon-small.danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
          /* Loading State */
        .calendar-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s linear infinite;
          margin-bottom: var(--spacing-md);
        }
        
        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: var(--spacing-xs);
        }
        
        /* Error State */
        .calendar-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          text-align: center;
        }
        
        .error-icon {
          font-size: var(--text-4xl);
          color: var(--danger-color);
          margin-bottom: var(--spacing-md);
        }
        
        .calendar-error h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-sm);
        }
        
        .calendar-error p {
          font-size: var(--text-base);
          color: var(--gray-600);
          margin-bottom: var(--spacing-lg);
        }
        
        .error-banner {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-md);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .error-banner button {
          background: none;
          border: none;
          color: var(--danger-color);
          cursor: pointer;
          margin-left: auto;
          padding: var(--spacing-xs);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive Styles */
        @media (max-width: 991px) {
          .calendar-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .search-box {
            width: 200px;
          }
          
          .calendar-toolbar {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .toolbar-left, .toolbar-right {
            width: 100%;
            justify-content: space-between;
          }
          
          .view-button span {
            display: none;
          }
          
          .week-view {
            overflow-x: auto;
          }
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .calendar-days {
            grid-auto-rows: minmax(80px, 1fr);
          }
          
          .day-event {
            font-size: 8px;
          }
          
          .week-view {
            display: flex;
            flex-direction: column;
          }
          
          .week-day {
            min-height: auto;
          }
          
          .event-modal-details {
            gap: var(--spacing-sm);
          }
          
          .detail-item {
            flex-direction: column;
            gap: var(--spacing-xs);
          }
          
          .event-modal-actions {
            flex-direction: column;
          }
        }
        
        @media (max-width: 576px) {
          .calendar-weekdays {
            display: none;
          }
          
          .calendar-days {
            display: flex;
            flex-direction: column;
          }
          
          .calendar-day {
            min-height: auto;
            padding: var(--spacing-md);
            border-right: none;
          }
          
          .day-header {
            margin-bottom: var(--spacing-sm);
          }
          
          .day-number {
            font-size: var(--text-base);
          }
          
          .week-day-name {
            display: block;
          }
          
          .search-box {
            width: 100%;
          }
          
          .header-actions {
            flex-direction: column;
            gap: var(--spacing-sm);
          }
            .btn-filter, .btn-availability, .btn-primary {
            width: 100%;
            justify-content: center;
          }
          
          .event-modal-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }      `}</style>      {/* User Availability Modal */}      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={closeAvailabilityModal}
        availability={availability}
        isLoading={availabilityLoading}
        error={availabilityError}
        dateRange={dateRange}
        timezone={timezone}
        timezones={timezones}
        onDateRangeChange={updateDateRange}
        onTimezoneChange={updateTimezone}
        onRefresh={fetchAvailability}
        onExport={exportAvailabilityCSV}
        onCreateEvent={handleCreateFromAvailability}
      />
    </div>
  );
};

export default Calendar;