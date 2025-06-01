import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaCheck, 
  FaTrash, 
  FaEdit, 
  FaClock, 
  FaCalendarAlt, 
  FaFilter, 
  FaSort, 
  FaEllipsisV, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglass,
  FaArrowUp,
  FaArrowDown,
  FaTags,
  FaSearch,
  FaChevronDown,
  FaTasks,
  FaChevronRight,
  FaArrowLeft
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';
import './Tasks.css';

const Tasks = ({ filter, showNewTaskForm = false }) => {
  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(showNewTaskForm);
  
  // Get current location and params
  const location = useLocation();
  const params = useParams();
  
  // Determine active filter from route
  useEffect(() => {
    if (filter) {
      if (filter === 'upcoming') {
        setStatusFilter('pending');
      } else if (filter === 'completed') {
        setStatusFilter('completed');
      }
    } else if (location.pathname.includes('/tasks/upcoming')) {
      setStatusFilter('pending');
    } else if (location.pathname.includes('/tasks/completed')) {
      setStatusFilter('completed');
    } else {
      setStatusFilter('all');
    }
  }, [filter, location]);
  
  // Refs
  const filterPanelRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample data
        const data = [
          {
            id: 1,
            title: 'Complete portfolio dashboard',
            description: 'Finish the admin dashboard for the portfolio website with all required features.',
            status: 'in-progress',
            priority: 'high',
            createdAt: '2023-07-10T10:30:00Z',
            dueDate: '2023-07-25T23:59:59Z',
            tags: ['UI/UX', 'React', 'Dashboard']
          },
          {
            id: 2,
            title: 'Add authentication system',
            description: 'Implement JWT authentication with refresh tokens for the admin panel.',
            status: 'pending',
            priority: 'high',
            createdAt: '2023-07-12T09:15:00Z',
            dueDate: '2023-07-20T23:59:59Z',
            tags: ['Security', 'Backend', 'JWT']
          },
          {
            id: 3,
            title: 'Create project showcase component',
            description: 'Design and implement a component to showcase portfolio projects with filtering options.',
            status: 'completed',
            priority: 'medium',
            createdAt: '2023-07-05T14:20:00Z',
            dueDate: '2023-07-15T23:59:59Z',
            completedAt: '2023-07-14T16:45:00Z',
            tags: ['Frontend', 'Component', 'Portfolio']
          },
          {
            id: 4,
            title: 'Optimize image loading',
            description: 'Implement lazy loading and image optimization for better performance.',
            status: 'pending',
            priority: 'low',
            createdAt: '2023-07-14T11:00:00Z',
            dueDate: '2023-07-30T23:59:59Z',
            tags: ['Performance', 'Images', 'Optimization']
          },
          {
            id: 5,
            title: 'Set up CI/CD pipeline',
            description: 'Configure GitHub Actions for continuous integration and deployment.',
            status: 'in-progress',
            priority: 'medium',
            createdAt: '2023-07-08T16:30:00Z',
            dueDate: '2023-07-22T23:59:59Z',
            tags: ['DevOps', 'CI/CD', 'GitHub']
          },
          {
            id: 6,
            title: 'Write API documentation',
            description: 'Create comprehensive documentation for all API endpoints using Swagger.',
            status: 'pending',
            priority: 'medium',
            createdAt: '2023-07-15T09:45:00Z',
            dueDate: '2023-07-28T23:59:59Z',
            tags: ['Documentation', 'API', 'Swagger']
          },
          {
            id: 7,
            title: 'Implement dark mode',
            description: 'Add dark mode support with theme toggle and system preference detection.',
            status: 'completed',
            priority: 'low',
            createdAt: '2023-07-03T13:20:00Z',
            dueDate: '2023-07-12T23:59:59Z',
            completedAt: '2023-07-11T15:30:00Z',
            tags: ['UI/UX', 'Theming', 'Accessibility']
          }
        ];
        
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          comparison = priorityValues[a.priority] - priorityValues[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusValues = { 'pending': 1, 'in-progress': 2, 'completed': 3 };
          comparison = statusValues[a.status] - statusValues[b.status];
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection]);
  
  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('.filter-toggle-btn')) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + F to focus search
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Alt + N to create new task
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setNewTaskFormVisible(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Change sort field
  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Toggle task expanded state
  const toggleTaskExpanded = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };
  
  // Handle task status change
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null
            } 
          : task
      )
    );
  };
  
  // Delete task
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };
  
  // Start editing task
  const handleEditTask = (task) => {
    setEditingTask({...task});
  };
  
  // Save edited task
  const handleSaveEdit = () => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      )
    );
    setEditingTask(null);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTask(null);
  };
  
  // Handle input change for editing task
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle input change for new task
  const handleNewTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add tag to new task
  const handleAddTag = () => {
    if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Remove tag from new task
  const handleRemoveTag = (tagToRemove) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add tag to editing task
  const handleAddEditTag = () => {
    if (tagInput.trim() && !editingTask.tags.includes(tagInput.trim())) {
      setEditingTask(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Remove tag from editing task
  const handleRemoveEditTag = (tagToRemove) => {
    setEditingTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Create new task
  const handleCreateTask = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newTask.title.trim() || !newTask.dueDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newTaskWithId = {
      ...newTask,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [newTaskWithId, ...prev]);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      tags: []
    });
    
    setNewTaskFormVisible(false);
  };
  
  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return '';
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return '';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheckCircle />;
      case 'in-progress': return <FaHourglass />;
      case 'pending': return <FaClock />;
      default: return null;
    }
  };
  
  // Check if task is overdue
  const isTaskOverdue = (task) => {
    if (task.status === 'completed') return false;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return now > dueDate;
  };
  
  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => isTaskOverdue(task)).length;
    
    return { total, pending, inProgress, completed, overdue };
  };
  
  // Get page title based on filter
  const getPageTitle = () => {
    if (location.pathname.includes('/tasks/upcoming')) {
      return 'Upcoming Tasks';
    } else if (location.pathname.includes('/tasks/completed')) {
      return 'Completed Tasks';
    } else {
      return 'All Tasks';
    }
  };
  
  // Get page description based on filter
  const getPageDescription = () => {
    if (location.pathname.includes('/tasks/upcoming')) {
      return 'View and manage your upcoming and in-progress tasks';
    } else if (location.pathname.includes('/tasks/completed')) {
      return 'View your completed tasks and achievements';
    } else {
      return 'Manage all your tasks and track your progress';
    }
  };
  
  // Stats for the current view
  const stats = getTaskStats();
  
  // If loading
  if (isLoading) {
    return (
      <div className="tasks-loading">
        <div className="spinner"></div>
        <h3>Loading tasks...</h3>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="tasks-error">
        <FaExclamationTriangle />
        <h3>Error Loading Tasks</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="tasks-container">
      {/* Tasks Header */}
      <div className="tasks-header">
        <div className="tasks-header-left">
          {location.pathname !== '/tasks' && (
            <Link to="/tasks" className="back-link">
              <FaArrowLeft /> Back to All Tasks
            </Link>
          )}
          <h1>{getPageTitle()}</h1>
          <p>{getPageDescription()}</p>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setNewTaskFormVisible(true)}
        >
          <FaPlus /> New Task
        </button>
      </div>
      
      {/* Task Statistics */}
      <div className="tasks-stats">
        <div className="stat-card">
          <div className="stat-icon all">
            <FaTags />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <FaHourglass />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>
      
      {/* Tasks Controls */}
      <div className="tasks-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            ref={searchInputRef}
          />
                    {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <FaFilter /> Filters
            <FaChevronDown className={`chevron ${showFilters ? 'open' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                className="filter-panel"
                ref={filterPanelRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="filter-group">
                  <label>Status</label>
                  <div className="filter-options">
                    <button 
                      className={statusFilter === 'all' ? 'active' : ''}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={statusFilter === 'pending' ? 'active' : ''}
                      onClick={() => setStatusFilter('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className={statusFilter === 'in-progress' ? 'active' : ''}
                      onClick={() => setStatusFilter('in-progress')}
                    >
                      In Progress
                    </button>
                    <button 
                      className={statusFilter === 'completed' ? 'active' : ''}
                      onClick={() => setStatusFilter('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Priority</label>
                  <div className="filter-options">
                    <button 
                      className={priorityFilter === 'all' ? 'active' : ''}
                      onClick={() => setPriorityFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={priorityFilter === 'high' ? 'active' : ''}
                      onClick={() => setPriorityFilter('high')}
                    >
                      High
                    </button>
                    <button 
                      className={priorityFilter === 'medium' ? 'active' : ''}
                      onClick={() => setPriorityFilter('medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={priorityFilter === 'low' ? 'active' : ''}
                      onClick={() => setPriorityFilter('low')}
                    >
                      Low
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Sort By</label>
                  <div className="sort-options">
                    <button 
                      className={sortBy === 'dueDate' ? 'active' : ''}
                      onClick={() => handleSortChange('dueDate')}
                    >
                      Due Date {sortBy === 'dueDate' && (
                        sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </button>
                    <button 
                      className={sortBy === 'priority' ? 'active' : ''}
                      onClick={() => handleSortChange('priority')}
                    >
                      Priority {sortBy === 'priority' && (
                        sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </button>
                    <button 
                      className={sortBy === 'title' ? 'active' : ''}
                      onClick={() => handleSortChange('title')}
                    >
                      Title {sortBy === 'title' && (
                        sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </button>
                    <button 
                      className={sortBy === 'status' ? 'active' : ''}
                      onClick={() => handleSortChange('status')}
                    >
                      Status {sortBy === 'status' && (
                        sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setSortBy('dueDate');
                      setSortDirection('asc');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <FaTasks className="no-tasks-icon" />
            <h3>No tasks found</h3>
            <p>
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters or search query' 
                : 'Create your first task to get started'}
            </p>
            <button 
              className="btn-primary"
              onClick={() => setNewTaskFormVisible(true)}
            >
              <FaPlus /> Create New Task
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <motion.div 
                key={task.id} 
                className={`task-card ${isTaskOverdue(task) ? 'overdue' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {editingTask && editingTask.id === task.id ? (
                  // Edit mode
                  <div className="task-edit-form">
                    <div className="form-group">
                      <label htmlFor={`title-${task.id}`}>Title</label>
                      <input
                        id={`title-${task.id}`}
                        type="text"
                        name="title"
                        value={editingTask.title}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`description-${task.id}`}>Description</label>
                      <textarea
                        id={`description-${task.id}`}
                        name="description"
                        value={editingTask.description}
                        onChange={handleEditInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`status-${task.id}`}>Status</label>
                        <select
                          id={`status-${task.id}`}
                          name="status"
                          value={editingTask.status}
                          onChange={handleEditInputChange}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`priority-${task.id}`}>Priority</label>
                        <select
                          id={`priority-${task.id}`}
                          name="priority"
                          value={editingTask.priority}
                          onChange={handleEditInputChange}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`dueDate-${task.id}`}>Due Date</label>
                      <input
                        id={`dueDate-${task.id}`}
                        type="datetime-local"
                        name="dueDate"
                        value={editingTask.dueDate.slice(0, 16)}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`tagInput-${task.id}`}>Tags</label>
                      <div className="tag-input-container">
                        <input
                          id={`tagInput-${task.id}`}
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditTag();
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          className="btn-sm"
                          onClick={handleAddEditTag}
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="tags-list">
                        {editingTask.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                            <button 
                              type="button" 
                              className="tag-remove" 
                              onClick={() => handleRemoveEditTag(tag)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn-primary"
                        onClick={handleSaveEdit}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="task-header">
                      <div className="task-badges">
                        <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                          {getStatusIcon(task.status)} {task.status.replace('-', ' ')}
                        </span>
                        <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="task-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEditTask(task)}
                          aria-label="Edit task"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete task"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      
                      <div className="task-meta">
                        <div className="task-date">
                          <FaCalendarAlt />
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {isTaskOverdue(task) && (
                          <div className="task-overdue">
                            <FaExclamationTriangle />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="task-tags">
                        <FaTags />
                        <div className="tags-list">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className="task-expand-btn"
                        onClick={() => toggleTaskExpanded(task.id)}
                        aria-expanded={expandedTask === task.id}
                      >
                        {expandedTask === task.id ? (
                          <>
                            <FaChevronDown /> Hide Details
                          </>
                        ) : (
                          <>
                            <FaChevronRight /> Show Details
                          </>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedTask === task.id && (
                          <motion.div 
                            className="task-details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="task-description">
                              <h4>Description</h4>
                              <p>{task.description}</p>
                            </div>
                            
                            <div className="task-timeline">
                              <div className="timeline-item">
                                <span className="timeline-label">Created:</span>
                                <span className="timeline-value">
                                  {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              {task.status === 'completed' && task.completedAt && (
                                <div className="timeline-item">
                                  <span className="timeline-label">Completed:</span>
                                  <span className="timeline-value">
                                    {new Date(task.completedAt).toLocaleDateString()} at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="task-quick-actions">
                              <h4>Quick Actions</h4>
                              <div className="status-buttons">
                                <button 
                                  className={`status-btn pending ${task.status === 'pending' ? 'active' : ''}`}
                                  onClick={() => handleStatusChange(task.id, 'pending')}
                                  disabled={task.status === 'pending'}
                                >
                                  <FaClock /> Pending
                                </button>
                                <button 
                                  className={`status-btn in-progress ${task.status === 'in-progress' ? 'active' : ''}`}
                                  onClick={() => handleStatusChange(task.id, 'in-progress')}
                                  disabled={task.status === 'in-progress'}
                                >
                                  <FaHourglass /> In Progress
                                </button>
                                <button 
                                  className={`status-btn completed ${task.status === 'completed' ? 'active' : ''}`}
                                  onClick={() => handleStatusChange(task.id, 'completed')}
                                  disabled={task.status === 'completed'}
                                >
                                  <FaCheckCircle /> Completed
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* New Task Form Modal */}
      <AnimatePresence>
        {newTaskFormVisible && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNewTaskFormVisible(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create New Task</h2>
                <button 
                  className="modal-close"
                  onClick={() => setNewTaskFormVisible(false)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              
              <form className="task-form" onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleNewTaskInputChange}
                    placeholder="Task title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTask.description}
                    onChange={handleNewTaskInputChange}
                    placeholder="Task description"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newTask.status}
                      onChange={handleNewTaskInputChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={newTask.priority}
                      onChange={handleNewTaskInputChange}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleNewTaskInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tagInput">Tags</label>
                  <div className="tag-input-container">
                    <input
                      id="tagInput"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn-sm"
                      onClick={handleAddTag}
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="tags-list">
                    {newTask.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button 
                          type="button" 
                          className="tag-remove" 
                          onClick={() => handleRemoveTag(tag)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setNewTaskFormVisible(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    <FaPlus /> Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
