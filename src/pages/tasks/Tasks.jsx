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
  FaSearch,  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaTasks,
  FaArrowLeft,
  FaUser,
  FaBuilding,
  FaStopwatch,
  FaHistory,
  FaLink,
  FaLock,
  FaProjectDiagram,
  FaPaperclip,
  FaComment,  FaTimes
} from 'react-icons/fa';
import Modal from '../../components/ui/Modal';
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
  const [showFilters, setShowFilters] = useState(false);  const [expandedTask, setExpandedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskFormVisible, setNewTaskFormVisible] = useState(showNewTaskForm);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  
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
  });  const [predefinedTags] = useState([
    // Technology Tags
    { 
      category: 'Technology', 
      tags: [
        'frontend', 'backend', 'fullstack', 'mobile', 'web', 'api', 
        'react', 'nodejs', 'python', 'javascript', 'typescript', 
        'database', 'mongodb', 'postgresql', 'mysql', 'redis',
        'graphql', 'rest-api', 'microservices', 'cloud', 'aws', 'azure'
      ] 
    },
    // Security & Authentication Tags  
    { 
      category: 'Security', 
      tags: [
        'authentication', 'security', 'jwt', 'oauth', 'encryption',
        'ssl', 'https', 'authorization', 'rbac', 'security-audit',
        'penetration-testing', 'vulnerability-assessment', 'gdpr',
        'compliance', 'data-protection'
      ] 
    },
    // Development Process Tags
    { 
      category: 'Development', 
      tags: [
        'bug-fix', 'enhancement', 'feature', 'refactor', 'optimization',
        'testing', 'unit-tests', 'integration-tests', 'e2e-tests',
        'documentation', 'deployment', 'ci/cd', 'code-review',
        'performance', 'monitoring'
      ] 
    },
    // UI/UX & Design Tags
    { 
      category: 'Design', 
      tags: [
        'ui/ux', 'responsive', 'accessibility', 'wireframe', 'prototype',
        'user-research', 'usability-testing', 'design-system',
        'branding', 'mobile-first', 'dark-mode', 'animations'
      ] 
    },
    // Priority & Urgency Tags
    { 
      category: 'Priority', 
      tags: [
        'urgent', 'high-priority', 'medium-priority', 'low-priority',
        'critical', 'blocker', 'hotfix', 'quick-win', 'technical-debt'
      ] 
    },
    // Project Type Tags
    { 
      category: 'Project Type', 
      tags: [
        'portfolio', 'client-work', 'personal', 'open-source', 
        'prototype', 'mvp', 'production', 'maintenance', 'research',
        'proof-of-concept', 'migration', 'upgrade'
      ] 
    },
    // Business & Operations Tags
    { 
      category: 'Business', 
      tags: [
        'marketing', 'sales', 'analytics', 'reporting', 'admin',
        'user-management', 'content-management', 'seo', 'social-media',
        'email-campaign', 'automation', 'integration'
      ] 
    }
  ]);
    
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
    // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!newTask.title.trim()) {
      errors.title = 'Task title is required';
    }

    if (!newTask.projectId) {
      errors.projectId = 'Project selection is required';
    }

    if (!newTask.assigneeId) {
      errors.assigneeId = 'Assignee selection is required';
    }

    if (!newTask.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      // Validate due date is not in the past
      const dueDate = new Date(newTask.dueDate);
      const now = new Date();
      if (dueDate < now) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Optional field validation
    if (newTask.estimatedHours && (isNaN(newTask.estimatedHours) || parseFloat(newTask.estimatedHours) < 0)) {
      errors.estimatedHours = 'Estimated hours must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Clear specific form error
  const clearFormError = (fieldName) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };  // Dropdown data state
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  // Subtasks state
  const [subtasks, setSubtasks] = useState({});
  const [loadingSubtasks, setLoadingSubtasks] = useState({});
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });
  const [addingSubtask, setAddingSubtask] = useState(null);

  // Comments state
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState({});

  // Attachments state
  const [attachments, setAttachments] = useState({});
  const [loadingAttachments, setLoadingAttachments] = useState({});
  const [uploadingFile, setUploadingFile] = useState({});// Fetch tasks data
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
      }    };    fetchTasks();
  }, [apiFilters, searchQuery, sortBy, sortDirection, currentPage, pageSize]);

  // Filter and sort tasks based on current filters
  useEffect(() => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.assignee?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.project?.name || task.project?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Fetch dropdown data for projects initially
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingDropdowns(true);
      try {
        console.log('🔄 Fetching projects...');
        
        const projectsResponse = await apiService.projects.getAll();
        console.log('✅ Projects response:', projectsResponse);
        
        // Handle projects data with enhanced validation
        let projectsData = [];
        if (projectsResponse.data?.success && projectsResponse.data.data?.projects) {
          projectsData = projectsResponse.data.data.projects;
        } else if (projectsResponse.data?.data?.projects) {
          projectsData = projectsResponse.data.data.projects;
        } else if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
          projectsData = projectsResponse.data;
        } else if (projectsResponse.data?.projects) {
          projectsData = projectsResponse.data.projects;
        }
        
        // Validate and transform projects data
        const transformedProjects = projectsData
          .filter(project => project && project.id) // Filter out invalid entries
          .map(project => ({
            id: project.id,
            name: project.title || project.name || `Project ${project.id}`,
            value: project.id,
            label: project.title || project.name || `Project ${project.id}`
          }));
        
        setProjects(transformedProjects);
        console.log('🔄 Final transformed projects:', transformedProjects);
        
        // Log if any data is missing
        if (transformedProjects.length === 0) {
          console.warn('⚠️ No projects found for dropdown');
        }
        
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
        // Don't show error to user, just log it - dropdown will be empty but form still works
      } finally {
        setLoadingDropdowns(false);
      }
    };    fetchProjects();
  }, []);

  // Fetch team members when a project is selected
  const fetchTeamMembersForProject = async (projectId) => {
    if (!projectId) {
      setTeamMembers([]);
      return;
    }

    setLoadingTeamMembers(true);
    try {
      console.log('🔄 Fetching team members for project:', projectId);
      
      const teamResponse = await apiService.projects.team.get(projectId);
      console.log('✅ Team response:', teamResponse);
      
      // Handle team members data with enhanced validation
      let teamData = [];
      if (teamResponse.data?.success && teamResponse.data.data?.teamMembers) {
        teamData = teamResponse.data.data.teamMembers;
      } else if (teamResponse.data?.data?.teamMembers) {
        teamData = teamResponse.data.data.teamMembers;
      } else if (teamResponse.data?.teamMembers) {
        teamData = teamResponse.data.teamMembers;
      } else if (teamResponse.data && Array.isArray(teamResponse.data)) {
        teamData = teamResponse.data;
      }
      
      // Validate and transform team members data
      const transformedTeamMembers = teamData
        .filter(member => member && (member.user?.id || member.id)) // Filter out invalid entries
        .map(member => {
          // Handle nested user object structure
          const user = member.user || member;
          const profile = user.profile || {};
          
          return {
            id: user.id,
            name: profile.firstName && profile.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : user.name || user.username || user.email || `User ${user.id}`,
            email: user.email || '',
            value: user.id,
            label: user.email 
              ? `${profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : user.name || user.username || 'Unknown'} (${user.email})`
              : profile.firstName && profile.lastName 
                ? `${profile.firstName} ${profile.lastName}`
                : user.name || user.username || user.email || `User ${user.id}`,
            role: member.role || 'member'
          };
        });
      
      setTeamMembers(transformedTeamMembers);
      console.log('🔄 Final transformed team members:', transformedTeamMembers);
      
      // Log if any data is missing
      if (transformedTeamMembers.length === 0) {
        console.warn('⚠️ No team members found for project:', projectId);
      }
      
    } catch (error) {
      console.error('❌ Error fetching team members for project:', projectId, error);
      setTeamMembers([]);
    } finally {
      setLoadingTeamMembers(false);
    }
  };
  
  // Subtasks functions
  const fetchSubtasks = async (taskId) => {
    if (subtasks[taskId]) return; // Already loaded
    
    setLoadingSubtasks(prev => ({ ...prev, [taskId]: true }));
    try {
      console.log('🔄 Fetching subtasks for task:', taskId);
      const response = await apiService.tasks.subtasks.getAll(taskId);
      console.log('✅ Subtasks response:', response);
      
      const subtasksData = response.data?.success ? response.data.data.subtasks : response.data?.subtasks || [];
      
      setSubtasks(prev => ({
        ...prev,
        [taskId]: subtasksData
      }));
    } catch (error) {
      console.error('❌ Error fetching subtasks:', error);
    } finally {
      setLoadingSubtasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleAddSubtask = async (taskId) => {
    if (!newSubtask.title.trim()) {
      alert('Please enter a subtask title');
      return;
    }

    try {
      console.log('🔄 Adding subtask:', { taskId, subtask: newSubtask });
      const response = await apiService.tasks.subtasks.create(taskId, newSubtask);
      console.log('✅ Subtask created:', response);
      
      const createdSubtask = response.data?.success ? response.data.data : response.data;
      
      setSubtasks(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), createdSubtask]
      }));
      
      setNewSubtask({ title: '', description: '' });
      setAddingSubtask(null);
      alert('Subtask added successfully!');
    } catch (error) {
      console.error('❌ Error adding subtask:', error);
      alert('Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId, isCompleted) => {
    try {
      console.log('🔄 Toggling subtask:', { taskId, subtaskId, isCompleted });
      await apiService.tasks.subtasks.update(taskId, subtaskId, { is_completed: isCompleted });
      
      setSubtasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].map(subtask => 
          subtask.id === subtaskId ? { ...subtask, is_completed: isCompleted } : subtask
        )
      }));
    } catch (error) {
      console.error('❌ Error updating subtask:', error);
      alert('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (taskId, subtaskId) => {
    if (!confirm('Delete this subtask?')) return;
    
    try {
      console.log('🗑️ Deleting subtask:', { taskId, subtaskId });
      await apiService.tasks.subtasks.delete(taskId, subtaskId);
      
      setSubtasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(subtask => subtask.id !== subtaskId)
      }));
      
      alert('Subtask deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting subtask:', error);
      alert('Failed to delete subtask');
    }
  };

  // Comments functions
  const fetchComments = async (taskId) => {
    if (comments[taskId]) return; // Already loaded
    
    setLoadingComments(prev => ({ ...prev, [taskId]: true }));
    try {
      console.log('🔄 Fetching comments for task:', taskId);
      const response = await apiService.tasks.comments.get(taskId);
      console.log('✅ Comments response:', response);
      
      const commentsData = response.data?.success ? response.data.data.comments : response.data?.comments || [];
      
      setComments(prev => ({
        ...prev,
        [taskId]: commentsData
      }));
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [taskId]: false }));
    }
  };
  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      console.log('🔄 Adding comment:', { taskId, comment: newComment });
      const response = await apiService.tasks.comments.create(taskId, { comment: newComment });
      console.log('✅ Comment created:', response);
      
      // Extract the comment correctly from the response structure
      let createdComment;
      if (response.data?.success && response.data.data) {
        createdComment = response.data.data;
      } else {
        createdComment = response.data;
      }
      
      // Ensure we're working with proper data structure
      if (typeof createdComment === 'object' && createdComment !== null) {
        setComments(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), createdComment]
        }));
        
        setNewComment('');
        alert('Comment added successfully!');
      } else {
        throw new Error('Invalid comment data returned from API');
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      console.log('🗑️ Deleting comment:', { taskId, commentId });
      await apiService.tasks.comments.delete(taskId, commentId);
      
      setComments(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(comment => comment.id !== commentId)
      }));
      
      alert('Comment deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  // Attachments functions
  const fetchAttachments = async (taskId) => {
    if (attachments[taskId]) return; // Already loaded
    
    setLoadingAttachments(prev => ({ ...prev, [taskId]: true }));
    try {
      console.log('🔄 Fetching attachments for task:', taskId);
      const response = await apiService.tasks.attachments.get(taskId);
      console.log('✅ Full Attachments API response:', response);
      
      // Extract attachments data properly to preserve all fields
      let attachmentsData = [];
      if (response.data?.success && response.data.data?.attachments) {
        attachmentsData = response.data.data.attachments;
      } else if (response.data?.attachments) {
        attachmentsData = response.data.attachments;
      } else if (Array.isArray(response.data)) {
        attachmentsData = response.data;
      }
      
      console.log('� Raw attachments data before processing:', attachmentsData);
      
      // Ensure we preserve all the fields from the server response
      const processedAttachments = attachmentsData.map(attachment => {
        console.log('🔍 Processing individual attachment:', attachment);
        return {
          ...attachment, // Preserve all original fields
          // Ensure uploaderName is available as fallback
          uploaderName: attachment.uploaderName || 
                       (attachment.uploader?.profile?.firstName && attachment.uploader?.profile?.lastName
                         ? `${attachment.uploader.profile.firstName} ${attachment.uploader.profile.lastName}`
                         : attachment.uploader?.email || 'Unknown')
        };
      });
      
      console.log('🔍 Final processed attachments:', processedAttachments);
      
      setAttachments(prev => ({
        ...prev,
        [taskId]: processedAttachments
      }));
    } catch (error) {
      console.error('❌ Error fetching attachments:', error);
    } finally {
      setLoadingAttachments(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file) return;
    
    setUploadingFile(prev => ({ ...prev, [taskId]: true }));
    try {
      console.log('🔄 Uploading file:', { taskId, fileName: file.name });
      const formData = new FormData();
      formData.append('file', file);
        const response = await apiService.tasks.attachments.upload(taskId, formData);
      console.log('✅ File uploaded:', response);
      
      // Extract the created attachment and ensure consistent format
      let createdAttachment = response.data?.success ? response.data.data : response.data;
      
      // If the response doesn't have the wrapper, add it for consistency
      if (createdAttachment && !createdAttachment.attachment) {
        createdAttachment = { attachment: createdAttachment };
      }
      
      console.log('🔍 Processed upload attachment:', createdAttachment);
      
      setAttachments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), createdAttachment]
      }));
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(prev => ({ ...prev, [taskId]: false }));
    }
  };  const handleDeleteAttachment = async (taskId, attachmentId) => {
    // Enhanced validation with better debugging
    console.log('🗑️ handleDeleteAttachment called with:', { taskId, attachmentId, type: typeof attachmentId });
    
    if (!attachmentId || attachmentId === 'undefined' || attachmentId === null) {
      console.error('❌ Cannot delete attachment: Invalid attachment ID:', {
        attachmentId,
        type: typeof attachmentId,
        isNull: attachmentId === null,
        isUndefined: attachmentId === undefined,
        stringUndefined: attachmentId === 'undefined'
      });
      alert('Cannot delete attachment: No valid ID found');
      return;
    }

    if (!confirm('Delete this attachment?')) return;
    
    try {
      console.log('🗑️ Attempting to delete attachment:', { taskId, attachmentId });
      await apiService.tasks.attachments.delete(taskId, attachmentId);
        console.log('✅ Attachment deletion successful, updating state...');
      setAttachments(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(attachmentWrapper => {
          // Extract the actual attachment from the wrapper for filtering
          const att = attachmentWrapper.attachment || attachmentWrapper;
          const attId = att.id || att.attachment_id || att.attachmentId;
          
          console.log('🔍 Filtering attachment:', { 
            originalWrapper: attachmentWrapper, 
            extractedAttachment: att, 
            extractedId: attId, 
            targetId: attachmentId 
          });
          return attId !== attachmentId;
        })
      }));
      
      alert('Attachment deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting attachment:', error);
      alert('Failed to delete attachment');
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
  
  // Task editing functions
  const handleEditTask = (task) => {
    setEditingTask({...task});
    setTagInput('');
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddEditTag = () => {
    if (!tagInput.trim()) return;
    
    if (!editingTask.tags.includes(tagInput.trim())) {
      setEditingTask(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
    }
    setTagInput('');
  };
  
  const handleRemoveEditTag = (tagToRemove) => {
    setEditingTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleCancelEdit = () => {
    setEditingTask(null);
    setTagInput('');
  };
  
  const handleSaveEdit = async () => {
    try {
      console.log('🔄 Saving task edit:', editingTask);
      await apiService.tasks.update(editingTask.id, editingTask);
      
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      
      setEditingTask(null);
      alert('Task updated successfully!');
    } catch (error) {
      console.error('❌ Error updating task:', error);
      alert('Failed to update task');
    }
  };
  
  // Task creation functions
  const handleNewTaskInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'projectId' && value !== newTask.projectId) {
      // When project changes, load team members
      if (value) {
        fetchTeamMembersForProject(value);
      } else {
        setTeamMembers([]);
      }
    }
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      clearFormError(name);
    }
    
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (!newTask.tags.includes(tagInput.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
    }
    setTagInput('');
  };
  
  const handleAddPredefinedTag = (tag) => {
    if (!newTask.tags.includes(tag)) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('🔄 Creating task:', newTask);
      const response = await apiService.tasks.create(newTask);
      console.log('✅ Task created:', response);
      
      setNewTaskFormVisible(false);
      
      // Reset form
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
        category: 'General'
      });
      setTagInput('');
      setFormErrors({});
      
      // Refresh task list
      const params = {
        ...apiFilters,
        page: currentPage,
        limit: pageSize
      };
      const refreshResponse = await apiService.tasks.getAll(params);
      // Handle refresh response similar to fetchTasks
      
      alert('Task created successfully!');
    } catch (error) {
      console.error('❌ Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };
    // Task deletion
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return false;
    
    try {
      console.log('🗑️ Deleting task:', taskId);
      await apiService.tasks.delete(taskId);
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Close modal if the deleted task is the one currently shown
      if (selectedTaskModal && selectedTaskModal.id === taskId) {
        setSelectedTaskModal(null);
      }
      
      alert('Task deleted successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      alert('Failed to delete task');
      return false;
    }
  };
  
  // Task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('🔄 Changing task status:', { taskId, newStatus });
      await apiService.tasks.update(taskId, { status: newStatus });
      
      setTasks(prev => prev.map(task => 
        task.id === taskId
          ? { 
              ...task, 
              status: newStatus, 
              completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt 
            }
          : task
      ));
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      alert('Failed to update task status');
    }
  };
  // Show task details in modal
  const handleShowTaskDetails = (task) => {
    setSelectedTaskModal(task);
    
    // Automatically fetch related data when modal opens
    if (task && task.id) {
      console.log('🔄 Opening modal for task:', task.id);
      
      // Fetch subtasks if not already loaded
      if (!subtasks[task.id]) {
        console.log('🔄 Fetching subtasks for modal...');
        fetchSubtasks(task.id);
      }
      
      // Fetch comments if not already loaded and auto-show comments
      if (!comments[task.id]) {
        console.log('🔄 Fetching comments for modal...');
        fetchComments(task.id);
      }
      // Auto-show comments section
      setShowComments(prev => ({ ...prev, [task.id]: true }));
      
      // Fetch attachments if not already loaded
      if (!attachments[task.id]) {
        console.log('🔄 Fetching attachments for modal...');
        fetchAttachments(task.id);
      }
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
  
  // Handler functions for filtering, sorting, and pagination
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setApiFilters(prev => ({
      ...prev,
      status: status === 'all' ? '' : status,
      page: 1 // Reset to first page when filter changes
    }));
    setCurrentPage(1);
  };
  
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    setApiFilters(prev => ({
      ...prev,
      priority: priority === 'all' ? '' : priority,
      page: 1 // Reset to first page when filter changes
    }));
    setCurrentPage(1);
  };
  
  const handleSortChange = (sortKey) => {
    if (sortBy === sortKey) {
      // Toggle direction if same sort key
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      // Set new sort key with default direction
      setSortBy(sortKey);
      setSortDirection('desc');
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setApiFilters(prev => ({
      ...prev,
      page: page
    }));
  };
    // Additional handler for page size changes
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    setApiFilters(prev => ({
      ...prev,
      limit: newPageSize,
      page: 1
    }));
  };

  // Toggle task expanded state
  const toggleTaskExpanded = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };
  
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
                    {searchQuery && (            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <FaTimes />
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
                      <label htmlFor={`dueDate-${task.id}`}>Due Date</label>                      <input
                        id={`dueDate-${task.id}`}
                        type="datetime-local"
                        name="dueDate"
                        value={editingTask.dueDate ? editingTask.dueDate.slice(0, 16) : ''}
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
                        {editingTask.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}                            <button 
                              type="button" 
                              className="tag-remove" 
                              onClick={() => handleRemoveEditTag(tag)}
                            >
                              <FaTimes />
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
                          {task.tags.map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className="task-expand-btn"
                        onClick={() => handleShowTaskDetails(task)}
                        aria-label="Show task details"
                      >
                        <FaChevronRight /> Show Details
                      </button>
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
                <h2>Create New Task</h2>                <button 
                  className="modal-close"
                  onClick={() => setNewTaskFormVisible(false)}
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form className="task-form" onSubmit={handleCreateTask}>                <div className="form-group">
                  <label htmlFor="title">Title <span className="required">*</span></label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleNewTaskInputChange}
                    placeholder="Task title"
                    className={formErrors.title ? 'error' : ''}
                    required
                  />
                  {formErrors.title && (
                    <div className="error-message">{formErrors.title}</div>
                  )}
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
                    className={formErrors.description ? 'error' : ''}
                  ></textarea>
                  {formErrors.description && (
                    <div className="error-message">{formErrors.description}</div>
                  )}
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
                </div>                <div className="form-group">
                  <label htmlFor="dueDate">Due Date <span className="required">*</span></label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleNewTaskInputChange}
                    className={formErrors.dueDate ? 'error' : ''}
                    required
                  />
                  {formErrors.dueDate && (
                    <div className="error-message">{formErrors.dueDate}</div>
                  )}
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
                      className={formErrors.estimatedHours ? 'error' : ''}
                    />
                    {formErrors.estimatedHours && (
                      <div className="error-message">{formErrors.estimatedHours}</div>
                    )}
                  </div>
                </div>
                  <div className="form-row">                  <div className="form-group">
                    <label htmlFor="assigneeId">Assignee <span className="required">*</span></label>                    <select
                      id="assigneeId"
                      name="assigneeId"
                      value={newTask.assigneeId}
                      onChange={handleNewTaskInputChange}
                      disabled={loadingTeamMembers || !newTask.projectId}
                      className={formErrors.assigneeId ? 'error' : ''}
                    >
                      <option value="">
                        {loadingTeamMembers 
                          ? 'Loading team members...' 
                          : !newTask.projectId
                            ? 'Please select a project first'
                            : teamMembers.length === 0 
                              ? 'No team members available' 
                              : 'Select assignee...'
                        }
                      </option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.label}
                        </option>
                      ))}
                    </select>
                    {loadingTeamMembers && (
                      <span className="loading-text">Loading team members...</span>
                    )}
                    {!loadingTeamMembers && !newTask.projectId && (
                      <span className="info-text">Select a project to see available team members</span>
                    )}
                    {!loadingTeamMembers && newTask.projectId && teamMembers.length === 0 && (
                      <span className="error-text">No team members found for this project.</span>
                    )}
                    {formErrors.assigneeId && (
                      <div className="error-message">{formErrors.assigneeId}</div>
                    )}
                  </div>                    <div className="form-group">
                    <label htmlFor="projectId">Project <span className="required">*</span></label>
                    <select
                      id="projectId"
                      name="projectId"
                      value={newTask.projectId}
                      onChange={handleNewTaskInputChange}
                      disabled={loadingDropdowns}
                      className={formErrors.projectId ? 'error' : ''}
                    >
                      <option value="">
                        {loadingDropdowns ? 'Loading projects...' : 'Select project...'}
                      </option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.label}
                        </option>
                      ))}
                    </select>
                    {loadingDropdowns && (
                      <span className="loading-text">Loading projects...</span>
                    )}
                    {!loadingDropdowns && projects.length === 0 && (
                      <span className="empty-data-text">No projects available</span>
                    )}
                    {formErrors.projectId && (
                      <div className="error-message">{formErrors.projectId}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tagInput">Tags</label>
                  
                  {/* Predefined Tags */}
                  <div className="predefined-tags-section">
                    {predefinedTags.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="tag-category">
                        <h4 className="tag-category-title">{category.category}</h4>
                        <div className="predefined-tags">
                          {category.tags.map((tag, tagIndex) => (
                            <button
                              key={tagIndex}
                              type="button"
                              className={`predefined-tag ${newTask.tags.includes(tag) ? 'selected' : ''}`}
                              onClick={() => handleAddPredefinedTag(tag)}
                              disabled={newTask.tags.includes(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom Tag Input */}
                  <div className="custom-tag-section">
                    <h4 className="tag-section-title">Add Custom Tag</h4>
                    <div className="tag-input-container">
                      <input
                        id="tagInput"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a custom tag"
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
                  </div>
                  
                  {/* Selected Tags Display */}
                  <div className="selected-tags-section">
                    <h4 className="tag-section-title">Selected Tags ({newTask.tags.length})</h4>                    <div className="tags-list">
                      {newTask.tags.map((tag) => (
                        <span key={tag} className="tag selected-tag">
                          {tag}                          <button 
                            type="button" 
                            className="tag-remove" 
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <FaTimes />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                  <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setNewTaskFormVisible(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner"></span> Creating...
                      </>
                    ) : (
                      <>
                        <FaPlus /> Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task Details Modal */}
      {selectedTaskModal && (
        <Modal
          isOpen={!!selectedTaskModal}
          onClose={() => setSelectedTaskModal(null)}
          title={selectedTaskModal.title}
          size="large"
        >
          <div className="task-modal-content">
            <div className="task-modal-header">
              <div className="task-badges">
                <span className={`status-badge ${getStatusBadgeClass(selectedTaskModal.status)}`}>
                  {getStatusIcon(selectedTaskModal.status)} {selectedTaskModal.status.replace('-', ' ')}
                </span>
                <span className={`priority-badge ${getPriorityBadgeClass(selectedTaskModal.priority)}`}>
                  {selectedTaskModal.priority}
                </span>
                {isTaskBlocked(selectedTaskModal) && (
                  <span className="blocked-badge">
                    <FaLock /> Blocked
                  </span>
                )}
              </div>
            </div>
            
            <div className="task-modal-body">
              <div className="task-description">
                <h4>Description</h4>
                <p>{selectedTaskModal.description}</p>
              </div>
              
              <div className="task-extended-info">
                {selectedTaskModal.assignee && (
                  <div className="info-section">
                    <h4>Assignee</h4>
                    <div className="assignee-info">
                      {selectedTaskModal.assignee.avatar && (
                        <img src={selectedTaskModal.assignee.avatar} alt={selectedTaskModal.assignee.name} className="assignee-avatar" />
                      )}
                      <div className="assignee-details">
                        <span className="assignee-name">{selectedTaskModal.assignee.name}</span>
                        {selectedTaskModal.assignee.email && (
                          <span className="assignee-email">{selectedTaskModal.assignee.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTaskModal.project && (
                  <div className="info-section">
                    <h4>Project</h4>
                    <div className="project-info">
                      <FaBuilding />
                      <span>{selectedTaskModal.project.name || selectedTaskModal.project.title}</span>
                    </div>
                  </div>
                )}
                
                <div className="info-section">
                  <h4>Dates</h4>
                  <div className="dates-info">
                    <div className="date-item">
                      <FaCalendarAlt />
                      <span>Due: {new Date(selectedTaskModal.dueDate).toLocaleDateString()} at {new Date(selectedTaskModal.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="date-item">
                      <FaClock />
                      <span>Created: {new Date(selectedTaskModal.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedTaskModal.status === 'completed' && selectedTaskModal.completedAt && (
                      <div className="date-item">
                        <FaCheckCircle />
                        <span>Completed: {new Date(selectedTaskModal.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {isTaskOverdue(selectedTaskModal) && (
                      <div className="task-overdue">
                        <FaExclamationTriangle />
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {(selectedTaskModal.estimatedHours || selectedTaskModal.actualHours || selectedTaskModal.progress > 0) && (
                  <div className="info-section">
                    <h4>Time & Progress</h4>
                    <div className="time-progress-info">
                      {selectedTaskModal.estimatedHours && (
                        <div className="time-item">
                          <FaStopwatch />
                          <span>Estimated: {selectedTaskModal.estimatedHours} hours</span>
                        </div>
                      )}
                      {selectedTaskModal.actualHours && (
                        <div className="time-item">
                          <FaHistory />
                          <span>Actual: {selectedTaskModal.actualHours} hours</span>
                        </div>
                      )}
                      {selectedTaskModal.progress > 0 && (
                        <div className="progress-item">
                          <span>Progress: {selectedTaskModal.progress}%</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${selectedTaskModal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedTaskModal.category && (
                  <div className="info-section">
                    <h4>Category</h4>
                    <span className="category-badge">{selectedTaskModal.category}</span>
                  </div>
                )}
                
                <div className="info-section">
                  <h4>Tags</h4>                  <div className="tags-list">
                    {selectedTaskModal.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {selectedTaskModal.tags.length === 0 && (
                      <span className="no-tags">No tags</span>
                    )}
                  </div>
                </div>

                {/* Task Dependencies */}
                {renderDependencyList(
                  selectedTaskModal.dependencies, 
                  'Dependencies', 
                  <FaLink />, 
                  'No dependencies'
                )}

                {/* Tasks Blocked By This Task */}
                {renderDependencyList(
                  selectedTaskModal.blockedBy, 
                  'Blocking Tasks', 
                  <FaProjectDiagram />, 
                  'Not blocking any tasks'
                )}
              </div>
              
              {/* Subtasks Section */}
              <div className="info-section">
                <div className="subtasks-header">
                  <h4><FaTasks /> Subtasks ({(subtasks[selectedTaskModal.id] || []).length})</h4>
                  <button 
                    className="btn-sm" 
 
                    onClick={() => {
                      if (!subtasks[selectedTaskModal.id]) fetchSubtasks(selectedTaskModal.id);
                      setAddingSubtask(addingSubtask === selectedTaskModal.id ? null : selectedTaskModal.id);
                    }}
                  >
                    {addingSubtask === selectedTaskModal.id ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Subtask</>}
                  </button>
                </div>
                
                {addingSubtask === selectedTaskModal.id && (
                  <div className="subtask-form">
                    <input
                      type="text"
                      placeholder="Subtask title"
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                      rows="2"
                    />
                    <button className="btn-primary btn-sm" onClick={() => handleAddSubtask(selectedTaskModal.id)}>
                      <FaPlus /> Add
                    </button>
                  </div>
                )}
                
                {loadingSubtasks[selectedTaskModal.id] ? (
                  <div className="loading">Loading subtasks...</div>
                ) : (                  <div className="subtasks-list">
                    {(subtasks[selectedTaskModal.id] || []).map(subtask => (
                      <div key={subtask.id} className={`subtask-item ${subtask.is_completed ? 'completed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={subtask.is_completed}
                          onChange={(e) => handleToggleSubtask(selectedTaskModal.id, subtask.id, e.target.checked)}
                        />
                        <div className="subtask-content">
                          <div className="subtask-text">{subtask.title}</div>
                          {subtask.description && (
                            <div className="subtask-description">{subtask.description}</div>
                          )}
                          <div className="subtask-meta">
                            <span className="subtask-date">
                              Created: {new Date(subtask.created_at).toLocaleDateString()}
                            </span>
                            {subtask.is_completed && subtask.updated_at !== subtask.created_at && (
                              <span className="subtask-completed-date">
                                Completed: {new Date(subtask.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="subtask-actions">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteSubtask(selectedTaskModal.id, subtask.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(subtasks[selectedTaskModal.id] || []).length === 0 && !loadingSubtasks[selectedTaskModal.id] && (
                      <div className="empty-state">No subtasks yet</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Comments Section */}
              <div className="info-section">
                <div className="comments-header">
                  <h4><FaComment /> Comments ({selectedTaskModal.commentsCount || (comments[selectedTaskModal.id] || []).length})</h4>
                  <button 
                    className="btn-sm"
                    onClick={() => {
                      if (!comments[selectedTaskModal.id]) fetchComments(selectedTaskModal.id);
                      setShowComments(prev => ({ ...prev, [selectedTaskModal.id]: !prev[selectedTaskModal.id] }));
                    }}
                  >
                    {showComments[selectedTaskModal.id] ? <><FaChevronUp /> Hide</> : <><FaChevronDown /> Show</>} Comments
                  </button>
                </div>
                
                {showComments[selectedTaskModal.id] && (
                  <div className="comments-container">
                    <div className="comment-form">
                      <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows="3"
                      />
                      <button className="btn-primary btn-sm" onClick={() => handleAddComment(selectedTaskModal.id)}>
                        <FaPlus /> Add Comment
                      </button>
                    </div>
                    
                    {loadingComments[selectedTaskModal.id] ? (
                      <div className="loading">Loading comments...</div>
                    ) : (
                      <div className="comments-list">                        {(comments[selectedTaskModal.id] || []).map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <div className="comment-author">
                                {comment.author?.profile?.firstName && comment.author?.profile?.lastName 
                                  ? `${comment.author.profile.firstName} ${comment.author.profile.lastName}`
                                  : comment.author?.email || comment.user?.name || 'Anonymous'}
                              </div>
                              <div className="comment-date">{formatRelativeTime(comment.created_at || comment.createdAt)}</div>
                            </div>
                            <div className="comment-text">{comment.comment}</div>
                            <div className="comment-actions">
                              <button 
                                className="btn-link delete-comment"
                                onClick={() => handleDeleteComment(selectedTaskModal.id, comment.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(comments[selectedTaskModal.id] || []).length === 0 && !loadingComments[selectedTaskModal.id] && (
                          <div className="empty-state">No comments yet</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Attachments Section */}
              <div className="info-section">
                <div className="attachments-header">
                  <h4><FaPaperclip /> Attachments ({selectedTaskModal.attachmentsCount || (attachments[selectedTaskModal.id] || []).length})</h4>
                  <label className="btn-sm file-upload-btn">
                    {uploadingFile[selectedTaskModal.id] ? <><span className="loading-spinner"></span> Uploading...</> : <><FaPlus /> Upload File</>}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          if (!attachments[selectedTaskModal.id]) fetchAttachments(selectedTaskModal.id);
                          handleFileUpload(selectedTaskModal.id, e.target.files[0]);
                        }
                      }}
                      disabled={uploadingFile[selectedTaskModal.id]}
                    />
                  </label>
                </div>
                
                {loadingAttachments[selectedTaskModal.id] ? (
                  <div className="loading">Loading attachments...</div>
                ) : (                  <div className="attachments-list">                    {(attachments[selectedTaskModal.id] || []).map((attachmentWrapper, index) => {
                      console.log(`🔍 Rendering attachment ${index + 1}:`, attachmentWrapper);
                      
                      // Extract the actual attachment data from the wrapper
                      const attachment = attachmentWrapper.attachment || attachmentWrapper;
                      console.log(`🔍 Extracted attachment data:`, attachment);
                      
                      // Enhanced ID extraction with better debugging for key generation
                      const attachmentId = attachment.id || 
                                          attachment.attachment_id || 
                                          attachment.attachmentId ||
                                          index; // fallback to index
                      
                      console.log(`🔍 Attachment ${index + 1} extracted ID:`, attachmentId);
                      
                      return (
                        <div key={attachmentId} className="attachment-item">
                          <div className="attachment-icon">
                            {attachment.mime_type?.includes('pdf') ? 'PDF' : 
                             attachment.mime_type?.includes('image') ? 'IMG' : 
                             attachment.file_type?.toUpperCase() || 'FILE'}
                          </div>
                          <div className="attachment-info">
                            <div className="attachment-name">
                              {attachment.file_name || 'Unknown file'}
                            </div>
                            <div className="attachment-size">
                              {attachment.file_size ? (() => {
                                const sizeInMB = attachment.file_size / 1024 / 1024;
                                return sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${(attachment.file_size / 1024).toFixed(2)} KB`;
                              })() : 'Unknown size'}
                            </div>
                            <div className="attachment-uploader">
                              Uploaded by: {(() => {
                                return attachment.uploaderName || 
                                      (attachment.uploader?.profile?.firstName && attachment.uploader?.profile?.lastName 
                                        ? `${attachment.uploader.profile.firstName} ${attachment.uploader.profile.lastName}`
                                        : attachment.uploader?.email || 'Unknown');
                              })()}
                            </div>
                          </div>                        <div className="attachment-actions">
                            <button 
                              className="btn-sm"
                              onClick={() => {
                                // Use the exact field name from the API response
                                if (attachment.file_path) {
                                  const downloadUrl = attachment.file_path.startsWith('http') 
                                    ? attachment.file_path 
                                    : `${window.location.origin}${attachment.file_path}`;
                                  window.open(downloadUrl, '_blank');
                                } else {
                                  alert('Download URL not available');
                                }
                              }}
                            >
                              Download
                            </button>                            <button 
                              className="btn-sm delete-btn"
                              onClick={() => {
                                // Enhanced ID extraction with better debugging using the extracted attachment
                                console.log('🔍 Delete button clicked - Attachment wrapper:', attachmentWrapper);
                                console.log('🔍 Delete button clicked - Extracted attachment:', attachment);
                                console.log('🔍 Attachment type:', typeof attachment);
                                console.log('🔍 Attachment keys:', Object.keys(attachment));
                                
                                // Use the attachment ID from the extracted data
                                const attachmentId = attachment.id;
                                
                                console.log('🔍 Extracted attachment ID:', attachmentId);
                                
                                if (attachmentId && attachmentId !== 'undefined') {
                                  handleDeleteAttachment(selectedTaskModal.id, attachmentId);
                                } else {
                                  console.error('❌ No valid attachment ID found:', {
                                    attachmentObject: attachment,
                                    extractedId: attachmentId,
                                    availableFields: Object.keys(attachment)
                                  });
                                  alert('Cannot delete attachment: No valid ID found');
                                }
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(attachments[selectedTaskModal.id] || []).length === 0 && !loadingAttachments[selectedTaskModal.id] && (
                      <div className="empty-state">No attachments yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="task-modal-footer">
              <h4>Quick Actions</h4>
              <div className="status-buttons">
                <button 
                  className={`status-btn pending ${selectedTaskModal.status === 'pending' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedTaskModal.id, 'pending')}
                  disabled={selectedTaskModal.status === 'pending'}
                >
                  <FaClock /> Pending
                </button>
                <button 
                  className={`status-btn in-progress ${selectedTaskModal.status === 'in-progress' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedTaskModal.id, 'in-progress')}
                  disabled={selectedTaskModal.status === 'in-progress'}
                >
                  <FaHourglass /> In Progress
                </button>
                <button 
                  className={`status-btn completed ${selectedTaskModal.status === 'completed' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedTaskModal.id, 'completed')}
                  disabled={selectedTaskModal.status === 'completed'}
                >
                  <FaCheckCircle /> Completed
                </button>
              </div>
              
              <div className="modal-action-buttons">
                <button className="btn-secondary" onClick={() => handleEditTask(selectedTaskModal)}>
                  <FaEdit /> Edit Task
                </button>                <button className="btn-danger" onClick={() => handleDeleteTask(selectedTaskModal.id)}>
                  <FaTrash /> Delete Task
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
