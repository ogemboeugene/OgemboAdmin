import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import { useProjects } from '../../context/ProjectsContext';
import { 
  FaEdit,
  FaTrash, 
  FaEye, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaRegStar, 
  FaList,
  FaSort, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaCalendarAlt, 
  FaCode, 
  FaGithub, 
  FaExternalLinkAlt, 
  FaEllipsisV,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaTags,
  FaLayerGroup,
  FaCheck,
  FaTimes,
  FaProjectDiagram
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';
import { truncateText } from '../../utils/formatters';
import apiService from '../../services/api/apiService';

const ProjectList = () => {
  const { success, error: showError } = useNotification();
  const { 
    projects, 
    setProjects, 
    isLoading, 
    setIsLoading, 
    error, 
    setError, 
    lastUpdate, 
    refreshProjects, 
    deleteProjectFromState 
  } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');  const [selectedTech, setSelectedTech] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null); // Track which project is being deleted
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeProject, setActiveProject] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // API-related state
  const [apiFilters, setApiFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 12
  });  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState(null);
  
  const filterRef = useRef(null);
  const searchInputRef = useRef(null);  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Prepare API parameters
        const params = {
          ...apiFilters,
          search: searchTerm || undefined,
          tech: selectedTech || undefined,
          sort: sortBy,
          order: sortDirection
        };
        
        // Remove empty parameters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === undefined) {
            delete params[key];
          }
        });
        
        const response = await apiService.projects.getAll(params);
        
        if (response.data && response.data.success) {
          // Handle the new API response format
          const apiData = response.data.data;
          
          // Transform API projects to match current component expectations
          const transformedProjects = apiData.projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            tech: project.technologies || [], // Map 'technologies' to 'tech'
            image: project.image || '/src/assets/images/image.png', // Use default image if null
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            status: project.status,
            progress: project.progress || 0,
            github: project.github,
            liveUrl: project.liveUrl,
            featured: Boolean(project.featured), // Convert 1/0 to boolean
            category: project.category,
            priority: project.priority,
            type: project.type,
            deadline: project.deadline,
            startDate: project.startDate,
            endDate: project.endDate,
            features: project.features || [],
            teamMembers: project.teamMembers || [],
            tasks: project.tasks || [],
            client: project.client,
            budget: project.budget,
            timeAgo: project.timeAgo,
            technologiesDisplay: project.technologiesDisplay,
            taskStats: project.taskStats,
            teamSize: project.teamSize || 0
          }));
          
          setProjects(transformedProjects);
          setStatistics(apiData.statistics);
          setTotalPages(apiData.pagination?.pages || 1);
          setTotalCount(apiData.pagination?.total || transformedProjects.length);
        } else {
          setProjects([]);
          setTotalCount(0);
        }
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteProjects');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.response?.data?.message || 'Failed to fetch projects');
        
        // Fallback to sample data if API fails
        if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
          console.log('API unavailable, using sample data...');
          const fallbackData = [
            {
              id: 1,
              title: 'MamaPesa',
              description: 'A mobile wallet and savings solution for informal groups in Kenya. Features include group savings, loans, and financial tracking for community-based organizations.',
              tech: ['Flutter', 'Django', 'Firebase', 'PostgreSQL'],
              image: '/src/assets/images/image.png',
              createdAt: '2023-01-15',
              updatedAt: '2023-06-10',
              status: 'completed',
              progress: 100,
              github: 'https://github.com/username/mamapesa',
              liveUrl: 'https://mamapesa.example.com',
              featured: true,
              category: 'Mobile App',
              priority: 'high'
            },
            {
              id: 2,
              title: 'ShopOkoa',
              description: 'An e-commerce platform tailored for small vendors in East Africa. Includes inventory management, payment processing, and delivery tracking.',
              tech: ['React', 'Node.js', 'MongoDB', 'Express'],
              image: '/src/assets/images/image.png',
              createdAt: '2023-03-10',
              updatedAt: '2023-07-22',
              status: 'in-progress',
              progress: 75,
              github: 'https://github.com/username/shopokoa',
              liveUrl: 'https://shopokoa.example.com',
              featured: false,
              category: 'Web App',
              priority: 'medium'
            },
            {
              id: 3,
              title: 'SokoBeauty',
              description: 'A digital marketplace for beauty products connecting local manufacturers with consumers. Includes product reviews, virtual try-on features, and subscription services.',
              tech: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
              image: '/src/assets/images/image.png',
              createdAt: '2023-06-22',
              updatedAt: '2023-08-15',
              status: 'planning',
              progress: 30,
              github: 'https://github.com/username/sokobeauty',
              liveUrl: '',
              featured: false,
              category: 'Web App',
              priority: 'low'
            }
          ];
          setProjects(fallbackData);
          setTotalCount(fallbackData.length);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
    
    // Add keyboard shortcut for search
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
      document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [apiFilters, searchTerm, selectedTech, sortBy, sortDirection, lastUpdate]);
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteProjects', JSON.stringify(favorites));
  }, [favorites]);
  
  // Close filter drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterDrawerOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique tech options for filter
  const techOptions = [...new Set(projects.flatMap(project => project.tech))].sort();
  
  // Get unique status options
  const statusOptions = [...new Set(projects.map(project => project.status))];
  
  // Get unique categories
  const categoryOptions = [...new Set(projects.map(project => project.category))];
  
  // Handle toggling sort direction
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };
  
  // Toggle project as favorite
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(projectId => projectId !== id) 
        : [...prev, id]
    );
  };
  
  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTech = !selectedTech || project.tech.includes(selectedTech);
      const matchesStatus = !selectedStatus || project.status === selectedStatus;
      
      // Date filtering
      let matchesDate = true;
      if (selectedDate === 'last-week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        matchesDate = new Date(project.updatedAt) >= lastWeek;
      } else if (selectedDate === 'last-month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        matchesDate = new Date(project.updatedAt) >= lastMonth;
      } else if (selectedDate === 'last-year') {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        matchesDate = new Date(project.updatedAt) >= lastYear;
      }
      
      return matchesSearch && matchesTech && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      // First sort by favorites
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Then sort by the selected field
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'updatedAt') {
        return sortDirection === 'asc'
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'progress') {
        return sortDirection === 'asc'
          ? a.progress - b.progress
          : b.progress - a.progress;
      }
      
      return 0;
    });

  // Handle delete confirmation
  const handleDeleteClick = (projectId, e) => {
    e.stopPropagation();
    setConfirmDelete(projectId);
  };  // Delete project
  const confirmDeleteProject = async (id) => {
    try {
      setDeletingProject(id); // Set which project is being deleted
      
      // Call the actual delete API
      await apiService.projects.delete(id);
      
      // Update state using context method - this triggers fast refresh
      deleteProjectFromState(id);
      setConfirmDelete(null);
      
      // Also remove from favorites if it's there
      if (favorites.includes(id)) {
        setFavorites(favorites.filter(projectId => projectId !== id));
      }
        // Show success notification
      success('Project deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting project:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to delete project. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        switch (error.response.status) {
          case 401:
            errorMessage = 'You are not authorized to delete this project. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to delete this project.';
            break;
          case 404:
            errorMessage = 'Project not found. It may have already been deleted.';
            break;
          case 409:
            errorMessage = 'Cannot delete project due to existing dependencies.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showError(errorMessage);
    } finally {
      setDeletingProject(null); // Clear deleting state
    }
  };
    // API Filter Functions
  const handleApiFilterChange = (filterType, value) => {
    setApiFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setApiFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleStatusFilterChange = (status) => {
    handleApiFilterChange('status', status);
    setSelectedStatus(status);
  };

  const handlePriorityFilterChange = (priority) => {
    handleApiFilterChange('priority', priority);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTech('');
    setSelectedStatus('');
    setSelectedDate('');
    setApiFilters({
      status: '',
      priority: '',
      page: 1,
      limit: 12
    });
    setIsFilterDrawerOpen(false);
  };
  
  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'planning':
        return 'status-planning';
      default:
        return '';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck />;
      case 'in-progress':
        return <FaCode />;
      case 'planning':
        return <FaCalendarAlt />;
      default:
        return null;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Toggle project details
  const toggleProjectDetails = (id) => {
    setActiveProject(activeProject === id ? null : id);
  };
  
  // Show tooltip
  const handleShowTooltip = (id) => {
    setShowTooltip(id);
  };
  
  // Hide tooltip
  const handleHideTooltip = () => {
    setShowTooltip(null);
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading projects...</h3>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <motion.div 
        className="project-list-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-left">
          <h2>My Projects</h2>          <div className="project-stats">
            <div className="stat-item">
              <span className="stat-value">{statistics?.total || projects.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics?.completed || projects.filter(p => p.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics?.in_progress || projects.filter(p => p.status === 'in-progress').length}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics?.featured || projects.filter(p => p.featured).length}</span>
              <span className="stat-label">Featured</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <FaLayerGroup />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FaList />
            </button>
          </div>
          
          <Link to="/projects/new" className="btn-primary">
            <FaPlus /> Add New Project
          </Link>
        </div>
      </motion.div>

      <motion.div 
        className="project-filters-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
          <div className="search-shortcut">Ctrl+K</div>
        </div>
        
        <div className="filter-actions">
          <div className="tech-filter">
            <select 
              value={selectedTech} 
              onChange={(e) => setSelectedTech(e.target.value)}
              className="filter-select"
            >
              <option value="">All Technologies</option>
              {techOptions.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
          
          <button 
            className={`filter-btn ${isFilterDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
          >
            <FaFilter /> Filters
            {(selectedStatus || selectedDate) && (
              <span className="filter-badge"></span>
            )}
          </button>
          
          <div className="sort-dropdown">
            <button className="sort-btn">
              {sortDirection === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              <span>Sort</span>
            </button>
            <div className="sort-menu">
              <button 
                className={`sort-option ${sortBy === 'title' ? 'active' : ''}`}
                onClick={() => handleSort('title')}
              >
                Name {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-option ${sortBy === 'createdAt' ? 'active' : ''}`}
                onClick={() => handleSort('createdAt')}
              >
                Date Created {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-option ${sortBy === 'updatedAt' ? 'active' : ''}`}
                onClick={() => handleSort('updatedAt')}
              >
                Last Updated {sortBy === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-option ${sortBy === 'progress' ? 'active' : ''}`}
                onClick={() => handleSort('progress')}
              >
                Progress {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div 
            className="filter-drawer"
            ref={filterRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-drawer-content">              <div className="filter-section">
                <h4>Status</h4>
                <div className="filter-options">
                  <button 
                    className={`filter-chip ${selectedStatus === '' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('')}
                  >
                    All
                  </button>
                  {statusOptions.map(status => (
                    <button 
                      key={status}
                      className={`filter-chip ${selectedStatus === status ? 'active' : ''} ${getStatusClass(status)}`}
                      onClick={() => handleStatusFilterChange(status === selectedStatus ? '' : status)}
                    >
                      {getStatusIcon(status)}
                      {status.replace('-', ' ')}
                    </button>
                  ))}                </div>
              </div>
              
              <div className="filter-section">
                <h4>Priority</h4>
                <div className="filter-options">
                  <button 
                    className={`filter-chip ${apiFilters.priority === '' ? 'active' : ''}`}
                    onClick={() => handlePriorityFilterChange('')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-chip ${apiFilters.priority === 'high' ? 'active' : ''}`}
                    onClick={() => handlePriorityFilterChange('high')}
                  >
                    High
                  </button>
                  <button 
                    className={`filter-chip ${apiFilters.priority === 'medium' ? 'active' : ''}`}
                    onClick={() => handlePriorityFilterChange('medium')}
                  >
                    Medium
                  </button>
                  <button 
                    className={`filter-chip ${apiFilters.priority === 'low' ? 'active' : ''}`}
                    onClick={() => handlePriorityFilterChange('low')}
                  >
                    Low
                  </button>
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Category</h4>
                <div className="filter-options">
                  {categoryOptions.map(category => (
                    <button 
                      key={category}
                      className={`filter-chip ${searchTerm.includes(category) ? 'active' : ''}`}
                      onClick={() => setSearchTerm(category)}
                    >
                      <FaTags />
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Last Updated</h4>
                <div className="filter-options">
                  <button 
                    className={`filter-chip ${selectedDate === '' ? 'active' : ''}`}
                    onClick={() => setSelectedDate('')}
                  >
                    Any time
                  </button>
                  <button 
                    className={`filter-chip ${selectedDate === 'last-week' ? 'active' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === 'last-week' ? '' : 'last-week')}
                  >
                    Last week
                  </button>
                  <button 
                    className={`filter-chip ${selectedDate === 'last-month' ? 'active' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === 'last-month' ? '' : 'last-month')}
                  >
                    Last month
                  </button>
                  <button 
                    className={`filter-chip ${selectedDate === 'last-year' ? 'active' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === 'last-year' ? '' : 'last-year')}
                  >
                    Last year
                  </button>
                </div>
              </div>
              
              <div className="filter-actions">
                <button className="btn-outline" onClick={resetFilters}>
                  Reset Filters
                </button>
                <button className="btn-primary" onClick={() => setIsFilterDrawerOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Updating projects...</span>
        </div>
      )}

      {error && (
        <motion.div 
          className="error-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="error-content">
            <FaInfoCircle className="error-icon" />
            <span className="error-message">{error}</span>
            <button 
              className="error-dismiss" 
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}

      {filteredProjects.length === 0 ? (
        <motion.div 
          className="no-projects"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="no-projects-icon">
            <FaProjectDiagram />
          </div>
          <h3>No projects found</h3>
          <p>Try adjusting your filters or add a new project.</p>
          <Link to="/projects/new" className="btn-primary">
            <FaPlus /> Create New Project
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="results-summary">
            Showing {filteredProjects.length} of {projects.length} projects
            {(searchTerm || selectedTech || selectedStatus || selectedDate) && (
              <button className="clear-filters" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
          
          <div className={`project-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
            {filteredProjects.map((project, index) => (
              <motion.div 
                key={project.id} 
                className={`project-card ${favorites.includes(project.id) ? 'is-favorite' : ''} ${project.featured ? 'is-featured' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                onClick={() => toggleProjectDetails(project.id)}
              >
                {/* Project delete confirmation */}                <AnimatePresence>
                  {confirmDelete === project.id && (
                    <motion.div 
                      className="delete-confirm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="delete-confirm-content">
                        <h4>Delete this project?</h4>
                        <p>This action cannot be undone.</p>
                        <div className="delete-actions">
                          <button 
                            onClick={() => confirmDeleteProject(project.id)}
                            className="btn-danger"
                            disabled={deletingProject === project.id}
                          >
                            {deletingProject === project.id ? (
                              <>
                                <span className="loading-spinner"></span>
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(null)}
                            className="btn-secondary"
                            disabled={deletingProject === project.id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {project.featured && (
                  <div className="featured-badge">
                    <FaStar /> Featured
                  </div>
                )}
                
                <div className="project-card-content">
                  <div className="project-image-container">
                    <img src={project.image} alt={project.title} className="project-image" />
                    <div className="project-image-overlay">
                      <div className="project-quick-actions">
                        <Link 
                          to={`/projects/${project.id}/view`} 
                          className="quick-action-btn"
                          title="View Details"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/projects/${project.id}/edit`} 
                          className="quick-action-btn"
                          title="Edit Project"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          className="quick-action-btn delete" 
                          onClick={(e) => handleDeleteClick(project.id, e)}
                          title="Delete Project"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`status-badge ${getStatusClass(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span>{project.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="project-infos">
                    <div className="project-header">
                      <h3 className="project-title">{project.title}</h3>
                      <button 
                        className={`favorite-btn ${favorites.includes(project.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(project.id);
                        }}
                        aria-label={favorites.includes(project.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {favorites.includes(project.id) ? <FaStar /> : <FaRegStar />}
                      </button>
                    </div>
                    
                    <p className="project-description">
                      {viewMode === 'list' 
                        ? truncateText(project.description, 120) 
                        : truncateText(project.description, 80)
                      }
                    </p>
                    
                    <div className="project-tech">
                      {project.tech.slice(0, viewMode === 'list' ? 6 : 3).map((tech, index) => (
                        <span 
                          key={index} 
                          className="tech-tag"
                          onMouseEnter={() => handleShowTooltip(`${project.id}-${tech}`)}
                          onMouseLeave={handleHideTooltip}
                        >
                          {tech}
                          {showTooltip === `${project.id}-${tech}` && (
                            <span className="tech-tooltip">{tech}</span>
                          )}
                        </span>
                      ))}
                      {project.tech.length > (viewMode === 'list' ? 6 : 3) && (
                        <span 
                          className="tech-tag more"
                          onMouseEnter={() => handleShowTooltip(`${project.id}-more`)}
                          onMouseLeave={handleHideTooltip}
                        >
                          +{project.tech.length - (viewMode === 'list' ? 6 : 3)}
                          {showTooltip === `${project.id}-more` && (
                            <span className="tech-tooltip">
                              {project.tech.slice(viewMode === 'list' ? 6 : 3).join(', ')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    <div className="project-meta">
                      <div className="project-progress">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-value ${getStatusClass(project.status)}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="project-dates">
                        <div className="date-item">
                          <FaCalendarAlt className="date-icon" />
                          <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="project-links">
                        {project.github && (
                          <a 
                            href={project.github} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="project-link github"
                            onClick={(e) => e.stopPropagation()}
                            title="View on GitHub"
                          >
                            <FaGithub />
                          </a>
                        )}
                        
                        {project.liveUrl && (
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="project-link live"
                            onClick={(e) => e.stopPropagation()}
                            title="View Live Site"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expandable project details */}
                <AnimatePresence>
                  {activeProject === project.id && (
                    <motion.div 
                      className="project-details-expanded"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="expanded-content">
                        <div className="expanded-section">
                          <h4>Description</h4>
                          <p>{project.description}</p>
                        </div>
                        
                        <div className="expanded-section">
                          <h4>Technologies</h4>
                          <div className="expanded-tech-list">
                            {project.tech.map((tech, index) => (
                              <span key={index} className="tech-tag expanded">{tech}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="expanded-columns">
                          <div className="expanded-section">
                            <h4>Status</h4>
                            <div className={`expanded-status ${getStatusClass(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span>{project.status.replace('-', ' ')}</span>
                            </div>
                          </div>
                          
                          <div className="expanded-section">
                            <h4>Category</h4>
                            <div className="expanded-category">
                              <FaTags />
                              <span>{project.category}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="expanded-columns">
                          <div className="expanded-section">
                            <h4>Created</h4>
                            <div className="expanded-date">
                              <FaCalendarAlt />
                              <span>{formatDate(project.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="expanded-section">
                            <h4>Last Updated</h4>
                            <div className="expanded-date">
                              <FaCalendarAlt />
                              <span>{formatDate(project.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="expanded-actions">
                          <Link 
                            to={`/projects/${project.id}/view`} 
                            className="btn-outline"
                          >
                            <FaEye /> View Details
                          </Link>
                          <Link 
                            to={`/projects/${project.id}/edit`} 
                            className="btn-primary"
                          >
                            <FaEdit /> Edit Project
                          </Link>
                        </div>
                      </div>
                      
                      <button 
                        className="collapse-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(null);
                        }}
                        aria-label="Collapse details"
                      >
                        <FaChevronUp />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div 
          className="pagination-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pagination-info">
            <span>
              Showing {Math.min(((apiFilters.page - 1) * apiFilters.limit) + 1, totalCount)} to {Math.min(apiFilters.page * apiFilters.limit, totalCount)} of {totalCount} projects
            </span>
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              disabled={apiFilters.page === 1}
              onClick={() => handlePageChange(apiFilters.page - 1)}
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </button>
            
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // Show first page, last page, current page, and pages around current page
              let page;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (apiFilters.page <= 4) {
                page = i + 1;
              } else if (apiFilters.page >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = apiFilters.page - 3 + i;
              }
              
              return (
                <button
                  key={page}
                  className={`pagination-btn ${apiFilters.page === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            
            {totalPages > 7 && apiFilters.page < totalPages - 3 && (
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
              disabled={apiFilters.page === totalPages}
              onClick={() => handlePageChange(apiFilters.page + 1)}
              aria-label="Next page"
            >
              <FaChevronRight />
            </button>
          </div>
        </motion.div>
      )}
      
      <style jsx>{`
        /* Project List Container */
        .project-list-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
        }
        
        /* Header Styles */
        .project-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .header-left h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .project-stats {
          display: flex;
          gap: 16px;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          background: var(--white);
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--gray-600);
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .view-toggle {
          display: flex;
          background: var(--gray-100);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .view-btn {
          background: none;
          border: none;
          padding: 8px 12px;
          cursor: pointer;
          color: var(--gray-600);
          transition: all 0.2s ease;
        }
        
        .view-btn.active {
          background: var(--primary-color);
          color: var(--white);
        }
        
        .btn-primary {
          background: var(--primary-color);
          color: var(--white);
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Filter Bar Styles */
        .project-filters-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .project-list-container .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }
        
        .project-list-container .search-box input {
          width: 100%;
          padding: 10px 40px 10px 36px;
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .project-list-container .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .clear-search {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .search-shortcut {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--gray-200);
          color: var(--gray-600);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          pointer-events: none;
        }
        
        .filter-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .filter-select {
          padding: 10px 12px;
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          background: var(--white);
          font-size: 14px;
          min-width: 180px;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--white);
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover, .filter-btn.active {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        
        .filter-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-color);
        }
        
        .sort-dropdown {
          position: relative;
        }
        
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--white);
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sort-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        
        .sort-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--white);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 200px;
          z-index: 10;
          overflow: hidden;
          display: none;
        }
        
        .sort-dropdown:hover .sort-menu {
          display: block;
        }
        
        .sort-option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          background: none;
          border: none;
          font-size: 14px;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sort-option:hover {
          background: var(--gray-100);
        }
        
        .sort-option.active {
          background: var(--gray-100);
          color: var(--primary-color);
          font-weight: 500;
        }
        
        /* Filter Drawer */
        .filter-drawer {
          background: var(--white);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .filter-drawer-content {
          padding: 20px;
        }
        
        .filter-section {
          margin-bottom: 20px;
        }
        
        .filter-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          margin: 0 0 12px 0;
        }
        
        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .filter-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 20px;
          font-size: 13px;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-chip:hover {
          background: var(--gray-200);
        }
        
        .filter-chip.active {
          background: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }
        
        .filter-chip svg {
          font-size: 12px;
        }
        
        .filter-chip.status-completed {
          border-color: var(--success-color);
        }
        
        .filter-chip.status-completed.active {
          background: var(--success-color);
          color: var(--white);
        }
        
        .filter-chip.status-in-progress {
          border-color: var(--warning-color);
        }
        
        .filter-chip.status-in-progress.active {
          background: var(--warning-color);
          color: var(--white);
        }
        
        .filter-chip.status-planning {
          border-color: var(--info-color);
        }
        
        .filter-chip.status-planning.active {
          background: var(--info-color);
          color: var(--white);
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .btn-outline {
          background: transparent;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .btn-outline:hover {
          background: rgba(79, 70, 229, 0.1);
        }
        
        /* Results Summary */
        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--gray-600);
        }
        
        .clear-filters {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        
        /* Project Container */
        .project-container {
          display: grid;
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .grid-view {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        
        .list-view {
          grid-template-columns: 1fr;
        }
        
        /* Project Card */
        .project-card {
          background: var(--white);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
          border: 1px solid var(--gray-200);
        }
        
        .project-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        .project-card.is-favorite {
          border-color: var(--warning-color);
        }
        
        .project-card.is-featured::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--warning-color);
          z-index: 1;
        }
        
        .featured-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--warning-color);
          color: var(--white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .project-card-content {
          display: flex;
          flex-direction: column;
        }
        
        .list-view .project-card-content {
          flex-direction: row;
        }
        
        .project-image-container {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        
        .list-view .project-image-container {
          width: 280px;
          flex-shrink: 0;
        }
        
        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .project-card:hover .project-image {
          transform: scale(1.05);
        }
        
        .project-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .project-card:hover .project-image-overlay {
          opacity: 1;
        }
        
        .project-quick-actions {
          display: flex;
          gap: 8px;
        }
        
        .quick-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--white);
          color: var(--gray-800);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .quick-action-btn.delete:hover {
          background: var(--danger-color);
          color: var(--white);
        }
        
        .status-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: var(--white);
          color: var(--gray-800);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .status-badge.status-completed {
          background: var(--success-color);
          color: var(--white);
        }
        
        .status-badge.status-in-progress {
          background: var(--warning-color);
          color: var(--white);
        }
        
        .status-badge.status-planning {
          background: var(--info-color);
          color: var(--white);
        }
        
        .project-infos {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .project-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0;
          line-height: 1.3;
        }
        
        .favorite-btn {
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 4px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin-left: 8px;
        }
        
        .favorite-btn:hover, .favorite-btn.active {
          color: var(--warning-color);
          transform: scale(1.1);
        }
        
        .favorite-btn.active {
          color: var(--warning-color);
        }
        
        .project-description {
          color: var(--gray-600);
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 12px 0;
          flex: 1;
        }
        
        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        
        .tech-tag {
          background: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          position: relative;
        }
        
        .tech-tag.more {
          background: rgba(107, 114, 128, 0.1);
          color: var(--gray-600);
        }
        
        .tech-tag.expanded {
          margin-bottom: 4px;
        }
        
        .tech-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gray-800);
          color: var(--white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 8px;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .tech-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: var(--gray-800) transparent transparent transparent;
        }
        
        .project-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .list-view .project-meta {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        
        .project-progress {
          flex: 1;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--gray-600);
          margin-bottom: 4px;
        }
        
        .progress-bar {
          height: 6px;
          background: var(--gray-200);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-value {
          height: 100%;
          background: var(--primary-color);
          border-radius: 3px;
        }
        
        .progress-value.status-completed {
          background: var(--success-color);
        }
        
        .progress-value.status-in-progress {
          background: var(--warning-color);
        }
        
        .progress-value.status-planning {
          background: var(--info-color);
        }
        
        .project-dates {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .date-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--gray-600);
        }
        
        .date-icon {
          color: var(--gray-500);
        }
        
        .project-links {
          display: flex;
          gap: 8px;
        }
        
        .project-link {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .project-link.github {
          background: #24292e;
          color: var(--white);
        }
        
        .project-link.live {
          background: var(--primary-color);
          color: var(--white);
        }
        
        .project-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        /* Delete Confirmation */
        .delete-confirm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        
        .delete-confirm-content {
          background: var(--white);
          padding: 24px;
          border-radius: 12px;
          max-width: 300px;
          text-align: center;
        }
        
        .delete-confirm-content h4 {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 8px 0;
        }
        
        .delete-confirm-content p {
          color: var(--gray-600);
          margin: 0 0 16px 0;
        }
        
        .delete-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .btn-danger {
          background: var(--danger-color);
          color: var(--white);
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-danger:hover {
          background: #dc2626;
        }
        
        .btn-secondary {
          background: var(--gray-200);
          color: var(--gray-700);
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-secondary:hover {
          background: var(--gray-300);
        }
        
        /* Expanded Project Details */
        .project-details-expanded {
          background: var(--gray-50);
          border-top: 1px solid var(--gray-200);
          position: relative;
          overflow: hidden;
        }
        
        .expanded-content {
          padding: 20px;
        }
        
        .expanded-section {
          margin-bottom: 16px;
        }
        
        .expanded-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          margin: 0 0 8px 0;
        }
        
        .expanded-section p {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
          margin: 0;
        }
        
        .expanded-tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .expanded-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .expanded-status, .expanded-category, .expanded-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--gray-700);
        }
        
        .expanded-status.status-completed {
          color: var(--success-color);
        }
        
        .expanded-status.status-in-progress {
          color: var(--warning-color);
        }
        
        .expanded-status.status-planning {
          color: var(--info-color);
        }
        
        .expanded-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }
        
        .collapse-details-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--white);
          border: 1px solid var(--gray-300);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--gray-600);
          transition: all 0.2s ease;
        }
        
        .collapse-details-btn:hover {
          background: var(--gray-100);
          color: var(--primary-color);
        }
        
        /* No Projects */
        .no-projects {
          text-align: center;
          padding: 48px 24px;
          background: var(--white);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .no-projects-icon {
          font-size: 48px;
          color: var(--gray-400);
          margin-bottom: 16px;
        }
        
        .no-projects h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0 0 8px 0;
        }
        
        .no-projects p {
          color: var(--gray-600);
          margin: 0 0 24px 0;
        }
        
        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          min-height: 400px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(2px);
        }
          .loading-overlay .loading-spinner {
          margin-bottom: 12px;
        }

        /* Error Banner */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .error-content {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 12px;
        }

        .error-icon {
          color: #dc2626;
          font-size: 18px;
          flex-shrink: 0;
        }

        .error-message {
          color: #991b1b;
          font-size: 14px;
          flex: 1;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .error-dismiss:hover {
          background: rgba(220, 38, 38, 0.1);
        }
        
        /* Responsive Styles */
        @media (max-width: 992px) {
          .expanded-columns {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .list-view .project-card-content {
            flex-direction: column;
          }
          
          .list-view .project-image-container {
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .project-list-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .project-filters-bar {
            flex-direction: column;
          }
          
          .filter-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .tech-filter {
            flex: 1;
          }
          
          .filter-select {
            width: 100%;
          }
          
          .project-container {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 576px) {
          .project-stats {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .stat-item {
            flex: 1;
            min-width: calc(50% - 8px);
          }
          
          .filter-actions {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .filter-btn, .sort-dropdown {
            flex: 1;
          }
          
          .sort-btn {
            width: 100%;
            justify-content: center;
          }
          
          .expanded-actions {
            flex-direction: column;
          }
          
          .expanded-actions .btn-outline,
          .expanded-actions .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          :root {
            --white: #1f2937;
            --gray-50: #111827;
            --gray-100: #1f2937;
            --gray-200: #374151;
            --gray-300: #4b5563;
            --gray-400: #6b7280;
            --gray-500: #9ca3af;
            --gray-600: #d1d5db;
            --gray-700: #e5e7eb;
            --gray-800: #f3f4f6;
            --gray-900: #f9fafb;
            
            --primary-color: #818cf8;
            --primary-dark: #6366f1;
            --primary-hover: #4338ca; 
            --success-color: #34d399;
            --warning-color: #fbbf24;
            --danger-color: #f87171;
            --info-color: #60a5fa;
          }
          
          .project-card {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          .loading-overlay {
            background: rgba(31, 41, 55, 0.8);
          }
          
          .tech-tag {
            background: rgba(129, 140, 248, 0.2);
          }
          
          .project-list-container .search-box input,
          .filter-select,
          .filter-btn,
          .sort-btn {
            background: var(--gray-100);
            border-color: var(--gray-300);
            color: var(--gray-700);
          }
          
          .search-shortcut {
            background: var(--gray-300);
            color: var(--gray-100);
          }
          
          .btn-secondary {
            background: var(--gray-300);
            color: var(--gray-100);
          }
          
          .delete-confirm {
            background: rgba(0, 0, 0, 0.8);
          }
        }
        
        /* Animation Keyframes */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
          /* Custom Scrollbar */
        .project-list-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .project-list-container::-webkit-scrollbar-track {
          background: var(--gray-100);
        }
        
        .project-list-container::-webkit-scrollbar-thumb {
          background-color: var(--gray-400);
          border-radius: 4px;
        }
        
        .project-list-container::-webkit-scrollbar-thumb:hover {
          background-color: var(--gray-500);
        }

        /* Pagination Styles */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding: 20px;
          background: var(--white);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .pagination-info {
          font-size: 14px;
          color: var(--gray-600);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--gray-300);
          background: var(--white);
          color: var(--gray-700);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: rgba(79, 70, 229, 0.05);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }

        .pagination-ellipsis {
          padding: 0 8px;
          color: var(--gray-500);
          font-size: 14px;
        }

        @media (max-width: 576px) {
          .pagination-container {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .pagination-controls {
            justify-content: center;
          }

          .pagination-btn {
            width: 32px;
            height: 32px;
          }
        }

        /* Dark Mode Styles */
        .dark-mode .project-list-container {
          background-color: #111827;
          color: #e5e7eb;
        }

        .dark-mode .project-list-header h2 {
          color: #f9fafb;
        }

        .dark-mode .stat-item {
          background: #1f2937;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .stat-value {
          color: #818cf8;
        }

        .dark-mode .stat-label {
          color: #9ca3af;
        }

        .dark-mode .view-btn {
          color: #9ca3af;
          background: #1f2937;
        }

        .dark-mode .view-btn.active {
          background: #4f46e5;
          color: #f9fafb;
        }

        .dark-mode .btn-primary {
          background: #4f46e5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .btn-primary:hover {
          background: #4338ca;
        }

        .dark-mode .search-box input {
          background: #1f2937;
          border-color: #374151;
          color: #e5e7eb;
        }

        .dark-mode .search-box input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
        }

        .dark-mode .search-icon,
        .dark-mode .clear-search {
          color: #9ca3af;
        }

        .dark-mode .search-shortcut {
          background: #374151;
          color: #d1d5db;
        }

        .dark-mode .filter-select,
        .dark-mode .filter-btn,
        .dark-mode .sort-btn {
          background: #1f2937;
          border-color: #374151;
          color: #d1d5db;
        }

        .dark-mode .filter-btn:hover,
        .dark-mode .filter-btn.active,
        .dark-mode .sort-btn:hover {
          border-color: #4f46e5;
          color: #818cf8;
        }

        .dark-mode .sort-menu {
          background: #1f2937;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .sort-option {
          color: #d1d5db;
        }

        .dark-mode .sort-option:hover {
          background: #374151;
        }

        .dark-mode .sort-option.active {
          background: #374151;
          color: #818cf8;
        }

        .dark-mode .filter-drawer {
          background: #1f2937;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .filter-section h4 {
          color: #e5e7eb;
        }

        .dark-mode .filter-chip {
          background: #374151;
          border-color: #4b5563;
          color: #d1d5db;
        }

        .dark-mode .filter-chip:hover {
          background: #4b5563;
        }

        .dark-mode .filter-chip.active {
          background: #4f46e5;
          color: #f9fafb;
          border-color: #4f46e5;
        }

        .dark-mode .btn-outline {
          color: #818cf8;
          border-color: #818cf8;
        }

        .dark-mode .btn-outline:hover {
          background: rgba(79, 70, 229, 0.2);
        }

        .dark-mode .results-summary {
          color: #9ca3af;
        }

        .dark-mode .clear-filters {
          color: #818cf8;
        }

        .dark-mode .project-card {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .project-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .project-card.is-favorite {
          border-color: #fbbf24;
        }

        .dark-mode .project-title {
          color: #f9fafb;
        }

        .dark-mode .project-description {
          color: #d1d5db;
        }

        .dark-mode .tech-tag {
          background: rgba(79, 70, 229, 0.2);
          color: #818cf8;
        }

        .dark-mode .tech-tag.more {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .dark-mode .tech-tooltip {
          background: #4b5563;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .tech-tooltip::after {
          border-color: #4b5563 transparent transparent transparent;
        }

        .dark-mode .progress-label {
          color: #9ca3af;
        }

        .dark-mode .progress-bar {
          background: #374151;
        }

        .dark-mode .date-item {
          color: #9ca3af;
        }

        .dark-mode .date-icon {
          color: #6b7280;
        }

        .dark-mode .project-link.github {
          background: #111827;
        }

        .dark-mode .project-link.live {
          background: #4f46e5;
        }

        .dark-mode .delete-confirm {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
        }

        .dark-mode .delete-confirm-content {
          background: #1f2937;
        }

        .dark-mode .delete-confirm-content h4 {
          color: #f9fafb;
        }

        .dark-mode .delete-confirm-content p {
          color: #d1d5db;
        }

        .dark-mode .btn-danger {
          background: #ef4444;
        }

        .dark-mode .btn-danger:hover {
          background: #dc2626;
        }

        .dark-mode .btn-secondary {
          background: #374151;
          color: #d1d5db;
        }

        .dark-mode .btn-secondary:hover {
          background: #4b5563;
        }

        .dark-mode .project-details-expanded {
          background: #111827;
          border-top-color: #374151;
        }

        .dark-mode .expanded-section h4 {
          color: #e5e7eb;
        }

        .dark-mode .expanded-section p {
          color: #d1d5db;
        }

        .dark-mode .expanded-status,
        .dark-mode .expanded-category,
        .dark-mode .expanded-date {
          color: #d1d5db;
        }

        .dark-mode .collapse-details-btn {
          background: #1f2937;
          border-color: #4b5563;
          color: #9ca3af;
        }

        .dark-mode .collapse-details-btn:hover {
          background: #374151;
          color: #818cf8;
        }

        .dark-mode .no-projects {
          background: #1f2937;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .no-projects-icon {
          color: #6b7280;
        }

        .dark-mode .no-projects h3 {
          color: #f3f4f6;
        }

        .dark-mode .no-projects p {
          color: #9ca3af;
        }

        .dark-mode .loading-container {
          color: #e5e7eb;
        }

        .dark-mode .loading-spinner {
          border-color: rgba(79, 70, 229, 0.3);
          border-top-color: #818cf8;
        }

        .dark-mode .loading-overlay {
          background: rgba(17, 24, 39, 0.8);
        }

        /* Status colors in dark mode */
        .dark-mode .status-badge.status-completed {
          background: #059669;
        }

        .dark-mode .status-badge.status-in-progress {
          background: #d97706;
        }

        .dark-mode .status-badge.status-planning {
          background: #2563eb;
        }

        .dark-mode .progress-value.status-completed {
          background: #059669;
        }

        .dark-mode .progress-value.status-in-progress {
          background: #d97706;
        }

        .dark-mode .progress-value.status-planning {
          background: #2563eb;
        }

        .dark-mode .expanded-status.status-completed {
          color: #34d399;
        }

        .dark-mode .expanded-status.status-in-progress {
          color: #fbbf24;
        }        .dark-mode .expanded-status.status-planning {
          color: #60a5fa;
        }

        /* Pagination dark mode styles */
        .dark-mode .pagination-container {
          background: #1f2937;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .pagination-info {
          color: #9ca3af;
        }

        .dark-mode .pagination-btn {
          background: #1f2937;
          border-color: #374151;
          color: #d1d5db;
        }

        .dark-mode .pagination-btn:hover:not(:disabled) {
          border-color: #818cf8;
          color: #818cf8;
          background: rgba(79, 70, 229, 0.1);
        }

        .dark-mode .pagination-btn.active {
          background: #4f46e5;
          color: #f9fafb;
          border-color: #4f46e5;
        }        .dark-mode .pagination-ellipsis {
          color: #6b7280;
        }

        /* Error banner dark mode styles */
        .dark-mode .error-banner {
          background: #2d1b1b;
          border-color: #5b2626;
        }

        .dark-mode .error-icon {
          color: #f87171;
        }

        .dark-mode .error-message {
          color: #fca5a5;
        }

        .dark-mode .error-dismiss {
          color: #f87171;
        }

        .dark-mode .error-dismiss:hover {
          background: rgba(248, 113, 113, 0.1);
        }

        /* Add smooth transitions for dark mode */
        .project-list-container,
        .project-list-header,
        .stat-item,
        .view-btn,
        .btn-primary,
        .search-box input,
        .filter-select,
        .filter-btn,
        .sort-btn,
        .sort-menu,
        .filter-drawer,
        .filter-chip,
        .project-card,
        .project-title,
        .project-description,
        .tech-tag,
        .progress-bar,
        .progress-value,
        .delete-confirm-content,
        .project-details-expanded,
        .no-projects,
        .loading-container {
          transition: background-color 0.3s ease, 
                      color 0.3s ease, 
                      border-color 0.3s ease, 
                      box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ProjectList;
