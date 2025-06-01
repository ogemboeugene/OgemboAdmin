import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
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
  FaBell
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';

const Calendar = () => {
  const { user } = useAuth();
  
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    category: 'meeting',
    priority: 'medium',
    project: '',
    location: '',
    attendees: []
  });
  
  // Refs
  const calendarRef = useRef(null);
  const searchRef = useRef(null);
  const modalRef = useRef(null);
  const addEventModalRef = useRef(null);
  
  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data
        const sampleEvents = [
          {
            id: 1,
            title: 'Project Deadline: MamaPesa',
            description: 'Final delivery of the mobile wallet application',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 14, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 16, 0),
            category: 'deadline',
            priority: 'high',
            project: 'MamaPesa',
            completed: false,
            location: 'Remote',
            attendees: ['John Doe', 'Jane Smith'],
            color: '#ef4444'
          },
          {
            id: 2,
            title: 'Code Review: ShopOkoa',
            description: 'Review pull requests for the e-commerce platform',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 10, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 11, 30),
            category: 'meeting',
            priority: 'medium',
            project: 'ShopOkoa',
            completed: true,
            location: 'Zoom Meeting',
            attendees: ['Alex Johnson', 'Sarah Williams'],
            color: '#3b82f6'
          },
          {
            id: 3,
            title: 'API Integration Planning',
            description: 'Plan the integration of payment APIs for SokoBeauty',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 9, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 12, 0),
            category: 'planning',
            priority: 'medium',
            project: 'SokoBeauty',
            completed: true,
            location: 'Conference Room A',
            attendees: ['Michael Brown', 'Emily Davis'],
            color: '#8b5cf6'
          },
          {
            id: 4,
            title: 'DevPortal UI Implementation',
            description: 'Implement the new dashboard UI components',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 13, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 17, 0),
            category: 'development',
            priority: 'medium',
            project: 'DevPortal',
            completed: false,
            location: 'Remote',
            attendees: [],
            color: '#10b981'
          },
          {
            id: 5,
            title: 'Client Meeting: KenyaFresh',
            description: 'Discuss requirements for the new food delivery app',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 15, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 16, 0),
            category: 'meeting',
            priority: 'high',
            project: 'KenyaFresh',
            completed: false,
            location: 'Client Office',
            attendees: ['Robert Wilson', 'Lisa Anderson', user?.profile?.firstName && user?.profile?.lastName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Eugene Ogembo'],
            color: '#f59e0b'
          },
          {
            id: 6,
            title: 'Database Schema Review',
            description: 'Review and optimize database schema for MamaPesa',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 11, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 12, 30),
            category: 'review',
            priority: 'low',
            project: 'MamaPesa',
            completed: true,
            location: 'Remote',
            attendees: ['John Doe'],
            color: '#6366f1'
          },
          {
            id: 7,
            title: 'Weekly Team Standup',
            description: 'Regular team standup meeting to discuss progress and blockers',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 9, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 9, 30),
            category: 'meeting',
            priority: 'medium',
            project: 'All Projects',
            completed: false,
            location: 'Google Meet',
            attendees: ['Team Members'],
            color: '#8b5cf6'
          },
          {
            id: 8,
            title: 'Learn GraphQL',
            description: 'Self-study session on GraphQL for upcoming projects',
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 13, 0),
            end: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 15, 0),
            category: 'learning',
            priority: 'low',
            project: 'Personal Development',
            completed: false,
            location: 'Home Office',
            attendees: [],
            color: '#ec4899'
          }
        ];
        
        setEvents(sampleEvents);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(sampleEvents.map(event => event.category))];
        setCategories(uniqueCategories);
        setSelectedCategories(uniqueCategories);
        
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
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
  
  // Handle click outside of modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEventModal(false);
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
  };
  
  // Handle event click
  const handleEventClick = (event) => {
    setCurrentEvent(event);
    setShowEventModal(true);
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
  };
  
  // Handle new event form changes
  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
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
  const handleAddEvent = (e) => {
    e.preventDefault();
    
    const newEventWithId = {
      ...newEvent,
      id: events.length + 1,
      color: getCategoryColor(newEvent.category),
      completed: false
    };
    
    setEvents([...events, newEventWithId]);
    setShowAddEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      category: 'meeting',
      priority: 'medium',
      project: '',
      location: '',
      attendees: []
    });
  };
  
  // Toggle event completion status
  const toggleEventCompletion = () => {
    if (!currentEvent) return;
    
    const updatedEvents = events.map(event => 
      event.id === currentEvent.id 
        ? { ...event, completed: !event.completed } 
        : event
    );
    
    setEvents(updatedEvents);
    setCurrentEvent({ ...currentEvent, completed: !currentEvent.completed });
  };
  
  // Delete event
  const deleteEvent = () => {
    if (!currentEvent) return;
    
    const updatedEvents = events.filter(event => event.id !== currentEvent.id);
    setEvents(updatedEvents);
    setShowEventModal(false);
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
      const hasEventsToday = dayEvents.length > 0;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            {hasEventsToday && <span className="event-indicator"></span>}
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
          <div className={`week-day-header ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`} onClick={() => setSelectedDate(date)}>
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
            </div>
            <button className="event-modal-close" onClick={() => setShowEventModal(false)}>
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
                    {currentEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    <br />
                    {currentEvent.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                    {currentEvent.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-icon">
                  <FaProjectDiagram />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Project</span>
                  <div className="detail-value">{currentEvent.project}</div>
                </div>
              </div>
              
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
              )}
              
              {currentEvent.attendees && currentEvent.attendees.length > 0 && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUserFriends />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Attendees</span>
                    <div className="attendees-list">
                      {currentEvent.attendees.map((attendee, index) => (
                        <span key={index} className="attendee">{attendee}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="event-modal-actions">
              <button className="btn-outline danger" onClick={deleteEvent}>
                <FaTrash /> Delete
              </button>
              <button className="btn-outline" onClick={() => setShowEventModal(false)}>
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
          <div className="event-modal-header" style={{ backgroundColor: getCategoryColor(newEvent.category) }}>
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
                  <label htmlFor="start">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    id="start"
                    name="start"
                    value={formatDateForInput(newEvent.start)}
                    onChange={handleDateTimeChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="end">End Date & Time</label>
                  <input
                    type="datetime-local"
                    id="end"
                    name="end"
                    value={formatDateForInput(newEvent.end)}
                    onChange={handleDateTimeChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={newEvent.category}
                    onChange={handleNewEventChange}
                    required
                  >
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="review">Review</option>
                    <option value="learning">Learning</option>
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
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project">Project</label>
                  <input
                    type="text"
                    id="project"
                    name="project"
                    value={newEvent.project}
                    onChange={handleNewEventChange}
                    placeholder="Enter project name"
                  />
                </div>
                
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
              </div>
              
              <div className="event-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowAddEventModal(false)}>
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FaPlus /> Add Event
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
  
  return (
    <div className="calendar-container">
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
          </div>
          
          <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filter
          </button>
          
          <button className="btn-primary" onClick={() => setShowAddEventModal(true)}>
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
          background-color: var(--primary-color);
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
          
          .btn-filter, .btn-primary {
            width: 100%;
            justify-content: center;
          }
          
          .event-modal-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
