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
  FaChevronLeft,
  FaChevronRight,
  FaTasks,
  FaArrowLeft,
  FaUser,
  FaBuilding,
  FaStopwatch,
  FaHistory,
  FaLink,
  FaLock,
  FaProjectDiagram
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';
import apiService from '../../services/api/apiService';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // API filters state
  const [apiFilters, setApiFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    project: '',
    category: '',
    page: 1,
    limit: 12
  });
  
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
    tags: [],
    assigneeId: '',
    projectId: '',
    estimatedHours: '',
    category: 'General'
  });
    // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Dropdown data state
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);// Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Fetching tasks from API...');
        
        // Prepare API parameters
        const params = {
          ...apiFilters,
          search: searchQuery || undefined,
          sort: sortBy,
          order: sortDirection,
          page: currentPage,
          limit: pageSize
        };
        
        // Remove empty parameters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === undefined) {
            delete params[key];
          }
        });
        
        const response = await apiService.tasks.getAll(params);
        console.log('✅ Tasks response:', response);
        
        // Handle different response structures
        let tasksData = [];
        let pagination = null;
        
        if (response.data && response.data.success && response.data.data) {
          const apiData = response.data.data;
          tasksData = apiData.tasks || apiData;
          pagination = apiData.pagination;
        } else if (response.data && Array.isArray(response.data)) {
          tasksData = response.data;
        } else if (response.data && response.data.tasks) {
          tasksData = response.data.tasks;
          pagination = response.data.pagination;
        }

        // Transform API data to match frontend expectations
        const transformedTasks = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          dueDate: task.dueDate,
          completedAt: task.completedAt,
          tags: task.tags || [],
          
          // Additional server fields
          assignee: task.assignee ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
            avatar: task.assignee.avatar
          } : null,
          
          project: task.project ? {
            id: task.project.id,
            name: task.project.name,
            title: task.project.title
          } : null,
          
          estimatedHours: task.estimatedHours || null,
          actualHours: task.actualHours || null,
          progress: task.progress || 0,
          
          // Comments and attachments counts
          commentsCount: task.commentsCount || task.comments?.length || 0,
          attachmentsCount: task.attachmentsCount || task.attachments?.length || 0,
          
          // Dependencies
          dependencies: task.dependencies || [],
          blockedBy: task.blockedBy || [],
          
          // Category
          category: task.category || 'General'
        }));
        
        console.log('🔄 Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
        
        // Update pagination info
        if (pagination) {
          setTotalPages(pagination.pages || Math.ceil(pagination.total / pageSize));
          setTotalCount(pagination.total || transformedTasks.length);
        } else {
          setTotalPages(1);
          setTotalCount(transformedTasks.length);
        }
        
      } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('You do not have permission to view tasks.');
        } else if (error.request && !error.response) {
          setError('Unable to connect to the server. Please check your connection.');
        } else {
          setError('Failed to load tasks. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };    fetchTasks();
  }, [apiFilters, searchQuery, sortBy, sortDirection, currentPage, pageSize]);

  // Fetch dropdown data for assignees and projects
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        console.log('🔄 Fetching dropdown data...');
        
        // Fetch projects and team members concurrently
        const [projectsResponse, teamResponse] = await Promise.all([
          apiService.projects.getAll(),
          apiService.projects.team.get()
        ]);
        
        console.log('✅ Projects response:', projectsResponse);
        console.log('✅ Team response:', teamResponse);
        
        // Handle projects data
        let projectsData = [];
        if (projectsResponse.data?.success && projectsResponse.data.data?.projects) {
          projectsData = projectsResponse.data.data.projects;
        } else if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
          projectsData = projectsResponse.data;
        }
        
        // Handle team members data
        let teamData = [];
        if (teamResponse.data?.success && teamResponse.data.data) {
          teamData = teamResponse.data.data;
        } else if (teamResponse.data && Array.isArray(teamResponse.data)) {
          teamData = teamResponse.data;
        }
        
        // Transform data for dropdowns
        const transformedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.title || project.name,
          value: project.id,
          label: project.title || project.name
        }));
        
        const transformedTeamMembers = teamData.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          value: member.id,
          label: `${member.name} (${member.email})`
        }));
        
        setProjects(transformedProjects);
        setTeamMembers(transformedTeamMembers);
        
        console.log('🔄 Transformed projects:', transformedProjects);
        console.log('🔄 Transformed team members:', transformedTeamMembers);
        
      } catch (error) {
        console.error('❌ Error fetching dropdown data:', error);
        // Don't show error to user, just log it - dropdowns will be empty but form still works
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
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
  
  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setApiFilters(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };
  
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
    setApiFilters(prev => ({
      ...prev,
      limit: newSize,
      page: 1
    }));
  };
  
  // API Filter Functions
  const handleApiFilterChange = (filterType, value) => {
    setApiFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filters change
    }));
    setCurrentPage(1);
  };
  
  // Enhanced filter handlers that update both local and API filters
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleApiFilterChange('status', status === 'all' ? '' : status);
  };
  
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    handleApiFilterChange('priority', priority === 'all' ? '' : priority);
  };
  
  // Search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setApiFilters(prev => ({
        ...prev,
        page: 1
      }));
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('dueDate');
    setSortDirection('asc');
    setCurrentPage(1);
    setApiFilters({
      status: '',
      priority: '',
      assignee: '',
      project: '',
      category: '',
      page: 1,
      limit: pageSize
    });
    setShowFilters(false);
  };
  
  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('🔄 Updating task status:', { taskId, newStatus });
      
      await apiService.tasks.updateStatus(taskId, newStatus);
      console.log('✅ Task status updated successfully');
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
              } 
            : task
        )
      );
      
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update this task.');
      } else if (error.response?.status === 404) {
        alert('Task not found. It may have been deleted.');
      } else {
        alert('Failed to update task status. Please try again.');
      }
    }
  };
    // Delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('🗑️ Deleting task:', taskId);
        
        await apiService.tasks.delete(taskId);
        console.log('✅ Task deleted successfully');
        
        // Remove from local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        alert('Task deleted successfully!');
        
      } catch (error) {
        console.error('❌ Error deleting task:', error);
        
        if (error.response?.status === 401) {
          alert('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          alert('You do not have permission to delete this task.');
        } else if (error.response?.status === 404) {
          alert('Task not found. It may have already been deleted.');
          // Still remove from local state in case of sync issues
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        } else {
          alert('Failed to delete task. Please try again.');
        }
      }
    }
  };
  
  // Start editing task
  const handleEditTask = (task) => {
    setEditingTask({...task});
  };
  // Save edited task
  const handleSaveEdit = async () => {
    try {
      console.log('🔄 Updating task:', editingTask);
      
      // Validate required fields
      if (!editingTask.title.trim()) {
        alert('Task title is required');
        return;
      }
      
      // Prepare comprehensive task data for API - normalization will be handled by apiService
      const taskData = {
        title: editingTask.title.trim(),
        description: editingTask.description.trim(),
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        tags: editingTask.tags,
        
        // Include additional fields if they exist
        assigneeId: editingTask.assigneeId || editingTask.assignee?.id || null,
        projectId: editingTask.projectId || editingTask.project?.id || null,
        estimatedHours: editingTask.estimatedHours || null,
        actualHours: editingTask.actualHours || null,
        category: editingTask.category || 'General',
        progress: editingTask.progress || 0,
        
        // Include parent task if it exists
        parentTaskId: editingTask.parentTaskId || null,
        
        // Include notes if they exist
        notes: editingTask.notes || null
      };
      
      const response = await apiService.tasks.update(editingTask.id, taskData);
      console.log('✅ Task updated:', response);
      
      // Handle different response structures and extract the updated task data
      let updatedTaskData = null;
      if (response.data?.success && response.data.data?.task) {
        updatedTaskData = response.data.data.task;
      } else if (response.data?.data) {
        updatedTaskData = response.data.data;
      } else if (response.data) {
        updatedTaskData = response.data;
      }
      
      // Transform server response to match frontend expectations
      const transformedTask = {
        id: editingTask.id,
        title: updatedTaskData?.title || editingTask.title,
        description: updatedTaskData?.description || editingTask.description,
        status: updatedTaskData?.status || editingTask.status,
        priority: updatedTaskData?.priority || editingTask.priority,
        dueDate: updatedTaskData?.dueDate || editingTask.dueDate,
        tags: updatedTaskData?.tags || editingTask.tags || [],
        
        // Keep existing data and update with server response
        assignee: updatedTaskData?.assignee || editingTask.assignee,
        project: updatedTaskData?.project || editingTask.project,
        estimatedHours: updatedTaskData?.estimatedHours || editingTask.estimatedHours,
        actualHours: updatedTaskData?.actualHours || editingTask.actualHours,
        category: updatedTaskData?.category || editingTask.category,
        progress: updatedTaskData?.progress || editingTask.progress || 0,
        
        // Update timestamps
        createdAt: editingTask.createdAt,
        updatedAt: updatedTaskData?.updatedAt || new Date().toISOString(),
        completedAt: updatedTaskData?.completedAt || editingTask.completedAt,
        
        // Keep counts and other metadata
        commentsCount: editingTask.commentsCount || 0,
        attachmentsCount: editingTask.attachmentsCount || 0,
        dependencies: editingTask.dependencies || [],
        blockedBy: editingTask.blockedBy || []
      };
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTask.id ? transformedTask : task
        )
      );
      
      setEditingTask(null);
      alert('Task updated successfully!');
      
    } catch (error) {
      console.error('❌ Error updating task:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to update task. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this task.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Task not found. It may have been deleted.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid task data. Please check your inputs.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Validation failed. Please check required fields.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
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
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    if (!newTask.dueDate) {
      alert('Due date is required');
      return;
    }
    
    try {
      console.log('🔄 Creating new task:', newTask);
      
      // Prepare comprehensive task data for API - normalization will be handled by apiService
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        tags: newTask.tags,
        category: newTask.category,
        estimatedHours: newTask.estimatedHours ? parseFloat(newTask.estimatedHours) : null,
        assigneeId: newTask.assigneeId || null,
        projectId: newTask.projectId || null,
        
        // Additional metadata
        createdBy: null, // Will be set by backend based on authentication
        notes: newTask.notes || null
      };
      
      const response = await apiService.tasks.create(taskData);
      console.log('✅ Task created:', response);
      
      // Handle different response structures and extract the created task data
      let createdTaskData = null;
      if (response.data?.success && response.data.data?.task) {
        createdTaskData = response.data.data.task;
      } else if (response.data?.data) {
        createdTaskData = response.data.data;
      } else if (response.data) {
        createdTaskData = response.data;
      }
      
      if (!createdTaskData) {
        throw new Error('Invalid response structure from server');
      }
      
      // Transform server response to match frontend expectations
      const transformedTask = {
        id: createdTaskData.id,
        title: createdTaskData.title,
        description: createdTaskData.description,
        status: createdTaskData.status,
        priority: createdTaskData.priority,
        createdAt: createdTaskData.createdAt,
        updatedAt: createdTaskData.updatedAt,
        dueDate: createdTaskData.dueDate,
        completedAt: createdTaskData.completedAt,
        tags: createdTaskData.tags || [],
        
        // Handle nested objects
        assignee: createdTaskData.assignee || null,
        project: createdTaskData.project || null,
        
        // Additional fields with defaults
        estimatedHours: createdTaskData.estimatedHours || null,
        actualHours: createdTaskData.actualHours || null,
        progress: createdTaskData.progress || 0,
        commentsCount: createdTaskData.commentsCount || 0,
        attachmentsCount: createdTaskData.attachmentsCount || 0,
        dependencies: createdTaskData.dependencies || [],
        blockedBy: createdTaskData.blockedBy || [],
        category: createdTaskData.category || 'General',
        
        // Subtasks if any
        subtasks: createdTaskData.subtasks || []
      };
      
      // Add to beginning of tasks list
      setTasks(prev => [transformedTask, ...prev]);
      
      // Reset form to initial state
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        tags: [],
        assigneeId: '',
        projectId: '',
        estimatedHours: '',
        category: 'General',
        notes: ''
      });
      
      // Close form and clear tag input
      setNewTaskFormVisible(false);
      setTagInput('');
      alert('Task created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating task:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create task. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create tasks.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid task data. Please check your inputs.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Validation failed. Please check required fields.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
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

  // Helper function to find task by ID
  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  // Helper function to render dependency list
  const renderDependencyList = (dependencyIds, title, icon, emptyMessage) => {
    if (!dependencyIds || dependencyIds.length === 0) {
      return null;
    }

    const dependencyTasks = dependencyIds
      .map(id => getTaskById(id))
      .filter(task => task !== undefined);

    if (dependencyTasks.length === 0) {
      return null;
    }

    return (
      <div className="info-section">
        <h4>{icon} {title}</h4>
        <div className="dependency-list">
          {dependencyTasks.map(depTask => (
            <div key={depTask.id} className="dependency-item">
              <div className="dependency-status">
                {getStatusIcon(depTask.status)}
                <span className={`dependency-status-text ${depTask.status}`}>
                  {depTask.status.replace('-', ' ')}
                </span>
              </div>
              <div className="dependency-info">
                <span className="dependency-title">{depTask.title}</span>
                <span className={`dependency-priority priority-${depTask.priority}`}>
                  {depTask.priority}
                </span>
              </div>
              {depTask.dueDate && (
                <div className="dependency-date">
                  <FaCalendarAlt />
                  <span>{new Date(depTask.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Check if task is blocked (has incomplete dependencies)
  const isTaskBlocked = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return false;
    }
    
    const dependencyTasks = task.dependencies
      .map(id => getTaskById(id))
      .filter(task => task !== undefined);
    
    return dependencyTasks.some(depTask => depTask.status !== 'completed');
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
                  <div className="filter-options">                    <button 
                      className={statusFilter === 'all' ? 'active' : ''}
                      onClick={() => handleStatusFilterChange('all')}
                    >
                      All
                    </button>
                    <button 
                      className={statusFilter === 'pending' ? 'active' : ''}
                      onClick={() => handleStatusFilterChange('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className={statusFilter === 'in-progress' ? 'active' : ''}
                      onClick={() => handleStatusFilterChange('in-progress')}
                    >
                      In Progress
                    </button>
                    <button 
                      className={statusFilter === 'completed' ? 'active' : ''}
                      onClick={() => handleStatusFilterChange('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Priority</label>
                  <div className="filter-options">                    <button 
                      className={priorityFilter === 'all' ? 'active' : ''}
                      onClick={() => handlePriorityFilterChange('all')}
                    >
                      All
                    </button>
                    <button 
                      className={priorityFilter === 'high' ? 'active' : ''}
                      onClick={() => handlePriorityFilterChange('high')}
                    >
                      High
                    </button>
                    <button 
                      className={priorityFilter === 'medium' ? 'active' : ''}
                      onClick={() => handlePriorityFilterChange('medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={priorityFilter === 'low' ? 'active' : ''}
                      onClick={() => handlePriorityFilterChange('low')}
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
                  <>                    <div className="task-header">
                      <div className="task-badges">
                        <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                          {getStatusIcon(task.status)} {task.status.replace('-', ' ')}
                        </span>
                        <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        {isTaskBlocked(task) && (
                          <span className="blocked-badge">
                            <FaLock /> Blocked
                          </span>
                        )}
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
                        {/* Additional Task Information */}
                      <div className="task-additional-info">
                        {task.assignee && (
                          <div className="task-assignee">
                            <FaUser />
                            <span>{task.assignee.name}</span>
                          </div>
                        )}
                        
                        {task.project && (
                          <div className="task-project">
                            <FaBuilding />
                            <span>{task.project.name || task.project.title}</span>
                          </div>
                        )}
                        
                        {(task.estimatedHours || task.actualHours) && (
                          <div className="task-time-tracking">
                            {task.estimatedHours && (
                              <div className="time-estimate">
                                <FaStopwatch />
                                <span>Est: {task.estimatedHours}h</span>
                              </div>
                            )}
                            {task.actualHours && (
                              <div className="time-actual">
                                <FaHistory />
                                <span>Actual: {task.actualHours}h</span>
                              </div>
                            )}
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
                          >                            <div className="task-description">
                              <h4>Description</h4>
                              <p>{task.description}</p>
                            </div>
                            
                            {/* Extended Task Information */}
                            <div className="task-extended-info">
                              {task.assignee && (
                                <div className="info-section">
                                  <h4>Assignee</h4>
                                  <div className="assignee-info">
                                    {task.assignee.avatar && (
                                      <img src={task.assignee.avatar} alt={task.assignee.name} className="assignee-avatar" />
                                    )}
                                    <div className="assignee-details">
                                      <span className="assignee-name">{task.assignee.name}</span>
                                      {task.assignee.email && (
                                        <span className="assignee-email">{task.assignee.email}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {task.project && (
                                <div className="info-section">
                                  <h4>Project</h4>
                                  <div className="project-info">
                                    <FaBuilding />
                                    <span>{task.project.name || task.project.title}</span>
                                  </div>
                                </div>
                              )}
                              
                              {(task.estimatedHours || task.actualHours || task.progress > 0) && (
                                <div className="info-section">
                                  <h4>Time & Progress</h4>
                                  <div className="time-progress-info">
                                    {task.estimatedHours && (
                                      <div className="time-item">
                                        <FaStopwatch />
                                        <span>Estimated: {task.estimatedHours} hours</span>
                                      </div>
                                    )}
                                    {task.actualHours && (
                                      <div className="time-item">
                                        <FaHistory />
                                        <span>Actual: {task.actualHours} hours</span>
                                      </div>
                                    )}
                                    {task.progress > 0 && (
                                      <div className="progress-item">
                                        <span>Progress: {task.progress}%</span>
                                        <div className="progress-bar">
                                          <div 
                                            className="progress-fill" 
                                            style={{ width: `${task.progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {task.category && (
                                <div className="info-section">
                                  <h4>Category</h4>
                                  <span className="category-badge">{task.category}</span>
                                </div>
                              )}
                                {(task.commentsCount > 0 || task.attachmentsCount > 0) && (
                                <div className="info-section">
                                  <h4>Attachments</h4>
                                  <div className="attachments-info">
                                    {task.commentsCount > 0 && (
                                      <span className="attachment-count">
                                        💬 {task.commentsCount} comment{task.commentsCount !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {task.attachmentsCount > 0 && (
                                      <span className="attachment-count">
                                        📎 {task.attachmentsCount} attachment{task.attachmentsCount !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Task Dependencies */}
                              {renderDependencyList(
                                task.dependencies, 
                                'Dependencies', 
                                <FaLink />, 
                                'No dependencies'
                              )}

                              {/* Tasks Blocked By This Task */}
                              {renderDependencyList(
                                task.blockedBy, 
                                'Blocking Tasks', 
                                <FaProjectDiagram />, 
                                'Not blocking any tasks'
                              )}
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
        {/* Enhanced Pagination Controls */}
      {totalPages > 1 && (
        <motion.div 
          className="tasks-pagination"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pagination-info">
            <span>
              Showing {Math.min(((currentPage - 1) * pageSize) + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} tasks
            </span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </button>
            
            {/* Page number buttons */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              
              return (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            
            {totalPages > 7 && currentPage < totalPages - 3 && (
              <>
                <span className="pagination-ellipsis">...</span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div className="page-size-selector">
            <label htmlFor="pageSize">Tasks per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="page-size-select"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </motion.div>
      )}
      
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
                
                {/* Additional Task Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={newTask.category}
                      onChange={handleNewTaskInputChange}
                    >
                      <option value="General">General</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Testing">Testing</option>
                      <option value="Documentation">Documentation</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="estimatedHours">Estimated Hours</label>
                    <input
                      id="estimatedHours"
                      type="number"
                      name="estimatedHours"
                      value={newTask.estimatedHours}
                      onChange={handleNewTaskInputChange}
                      placeholder="0"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                  <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="assigneeId">Assignee (Optional)</label>
                    <select
                      id="assigneeId"
                      name="assigneeId"
                      value={newTask.assigneeId}
                      onChange={handleNewTaskInputChange}
                      disabled={loadingDropdowns}
                    >
                      <option value="">Select assignee...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.label}
                        </option>
                      ))}
                    </select>
                    {loadingDropdowns && (
                      <span className="loading-text">Loading team members...</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="projectId">Project (Optional)</label>
                    <select
                      id="projectId"
                      name="projectId"
                      value={newTask.projectId}
                      onChange={handleNewTaskInputChange}
                      disabled={loadingDropdowns}
                    >
                      <option value="">Select project...</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.label}
                        </option>
                      ))}
                    </select>
                    {loadingDropdowns && (
                      <span className="loading-text">Loading projects...</span>
                    )}
                  </div>
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
