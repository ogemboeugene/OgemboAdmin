import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import ProjectTeamManagement from '../../components/team/ProjectTeamManagement';
import { useNotification } from '../../context/NotificationContext';
import { useProjects } from '../../context/ProjectsContext';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaGithub,
  FaExternalLinkAlt,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaCode,
  FaCheck,
  FaTags,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaClock,
  FaLightbulb,
  FaRocket,
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaProjectDiagram,
  FaFlag,
  FaEye,
  FaFileAlt ,
  FaHeart,
  FaShare,
  FaAward,
  FaCodeBranch,
  FaTrophy,
  FaBusinessTime,
  FaHandshake,
  FaExchangeAlt,
  FaUserFriends,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaTimes,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';
import { isTokenExpired, getTokenTimeRemaining } from '../../utils/tokenUtils';
import apiService from '../../services/api/apiService';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { deleteProjectFromState } = useProjects();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Gallery carousel states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxType, setLightboxType] = useState('image'); // 'image' or 'video'
  const [lightboxIndex, setLightboxIndex] = useState(0);
    // Refs for carousel scrolling
  const imageCarouselRef = useRef(null);
  const videoCarouselRef = useRef(null);

  // Track carousel scroll position for indicators
  useEffect(() => {
    const handleImageScroll = () => {
      if (imageCarouselRef.current && project?.images?.length > 0) {
        const carousel = imageCarouselRef.current;
        const itemWidth = carousel.children[0]?.offsetWidth || 0;
        const scrollLeft = carousel.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentImageIndex(Math.min(newIndex, project.images.length - 1));
      }
    };

    const handleVideoScroll = () => {
      if (videoCarouselRef.current && project?.videos?.length > 0) {
        const carousel = videoCarouselRef.current;
        const itemWidth = carousel.children[0]?.offsetWidth || 0;
        const scrollLeft = carousel.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentVideoIndex(Math.min(newIndex, project.videos.length - 1));
      }
    };

    const imageCarousel = imageCarouselRef.current;
    const videoCarousel = videoCarouselRef.current;

    if (imageCarousel) {
      imageCarousel.addEventListener('scroll', handleImageScroll);
    }
    if (videoCarousel) {
      videoCarousel.addEventListener('scroll', handleVideoScroll);
    }

    return () => {
      if (imageCarousel) {
        imageCarousel.removeEventListener('scroll', handleImageScroll);
      }
      if (videoCarousel) {
        videoCarousel.removeEventListener('scroll', handleVideoScroll);
      }    };  }, [project?.images?.length, project?.videos?.length]);
  
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check authentication before making the request
        let token = localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('token');
        
        console.log('=== AUTHENTICATION DEBUG ===');
        console.log('Project ID:', id);
        console.log('Access token:', localStorage.getItem('access_token'));
        console.log('Auth token:', localStorage.getItem('authToken'));
        console.log('Token:', localStorage.getItem('token'));
        console.log('Refresh token:', localStorage.getItem('refresh_token'));
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('Token exists:', !!token);
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
        
        // Check if token is expired
        if (token) {
          const isExpired = isTokenExpired(token);
          const timeRemaining = getTokenTimeRemaining(token);
          console.log('Token expired:', isExpired);
          console.log('Time remaining (minutes):', timeRemaining);
          
          // If token is expired, try to refresh it
          if (isExpired) {
            console.log('🔄 Token is expired, attempting refresh...');
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (refreshToken && !isTokenExpired(refreshToken)) {
              try {
                console.log('📡 Refreshing token with refresh token...');
                const refreshResponse = await apiService.auth.refreshToken(refreshToken);
                
                if (refreshResponse.data && refreshResponse.data.success) {
                  const newAccessToken = refreshResponse.data.data.access_token;
                  console.log('✅ Token refresh successful');
                  
                  // Update stored token
                  localStorage.setItem('access_token', newAccessToken);
                  token = newAccessToken;
                  
                  console.log('🔑 Updated access token in localStorage');
                } else {
                  throw new Error('Token refresh failed - invalid response');
                }
              } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                
                // Clear all tokens and show login error
                localStorage.removeItem('access_token');
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                
                setError('Your session has expired. Please log in again.');
                return;
              }
            } else {
              console.error('❌ No valid refresh token available');
              
              // Clear all tokens and show login error
              localStorage.removeItem('access_token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              
              setError('Your session has expired. Please log in again.');
              return;
            }
          }
        }
        
        console.log('===============================');
        
        if (!token) {
          setError('Authentication required. Please log in again.');
          console.error('No authentication token found');
          return;
        }
          console.log('Fetching project with ID:', id);
        let projectData = null;
        
        try {
          // Try to get individual project first
          const response = await apiService.projects.getById(id);
          console.log('✅ Direct project fetch successful:', response);
          
          // Handle nested response structure: {success: true, data: {project: {...}}}
          const responseData = response.data?.data || response.data;
          projectData = responseData?.project || responseData;
        } catch (directError) {
          console.warn('⚠️ Direct project fetch failed, trying fallback...', directError);
          
          // If direct access fails, try to get from projects list
          if (directError.response?.status === 403 || directError.response?.status === 401) {
            console.log('🔄 Attempting fallback: fetching from projects list...');
            
            try {
              const listResponse = await apiService.projects.getAll();
              console.log('📋 Projects list fetch successful:', listResponse);
              
              const projectsList = listResponse.data?.data?.projects || listResponse.data?.projects || [];
              projectData = projectsList.find(project => project.id === parseInt(id));
              
              if (projectData) {
                console.log('✅ Found project in list:', projectData.title);
              } else {
                console.error('❌ Project not found in list');
                throw new Error('Project not found');
              }
            } catch (listError) {
              console.error('❌ Fallback also failed:', listError);
              throw directError; // Throw the original error
            }
          } else {
            throw directError;
          }
        }
        
        console.log('Final project data:', projectData);
        console.log('Project title:', projectData?.title);
        console.log('Project description:', projectData?.description);
        
        if (!projectData || !projectData.title) {
          console.error('Project data is missing or invalid:', projectData);
          throw new Error('Project not found or data is incomplete');
        }
        
        setProject(projectData);
        console.log('Project state set successfully:', projectData.title);
        
        // Check if project is in favorites
        const favorites = JSON.parse(localStorage.getItem('favoriteProjects') || '[]');
        setIsFavorite(favorites.includes(projectData.id));
          } catch (error) {
        console.error('Error fetching project:', error);
        
        // Handle authentication and authorization errors specifically
        if (error.response?.status === 403) {
          setError('You do not have permission to view this project. Please check your access rights.');
          console.error('403 Forbidden - Check token permissions or user access level');
        } else if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          console.error('401 Unauthorized - Token may be expired or invalid');
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          // Optionally redirect to login
          // navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Project not found');
        } else if (error.request && !error.response) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError('Failed to load project details. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      await apiService.projects.delete(id);
      
      // Update context state for fast refresh
      deleteProjectFromState(id);
      
      // Show success notification before navigating
      success('Project deleted successfully!');
      navigate('/projects');
      
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
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProjects') || '[]');
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(favId => favId !== project.id);
    } else {
      updatedFavorites = [...favorites, project.id];
    }
    
    localStorage.setItem('favoriteProjects', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Gallery carousel functions
  const scrollCarousel = (carouselRef, direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // Adjust this value to control scroll distance
      const currentScroll = carouselRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const scrollToImage = (index) => {
    if (imageCarouselRef.current && project?.images?.length > 0) {
      const itemWidth = imageCarouselRef.current.children[0]?.offsetWidth || 0;
      const targetScroll = itemWidth * index;
      
      imageCarouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      setCurrentImageIndex(index);
    }
  };

  const scrollToVideo = (index) => {
    if (videoCarouselRef.current && project?.videos?.length > 0) {
      const itemWidth = videoCarouselRef.current.children[0]?.offsetWidth || 0;
      const targetScroll = itemWidth * index;
      
      videoCarouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      setCurrentVideoIndex(index);
    }
  };

  const openLightbox = (type, index) => {
    setLightboxType(type);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const navigateLightbox = (direction) => {
    const currentArray = lightboxType === 'image' ? project?.images : project?.videos;
    if (!currentArray || currentArray.length === 0) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : currentArray.length - 1;
    } else {
      newIndex = lightboxIndex < currentArray.length - 1 ? lightboxIndex + 1 : 0;
    }
    setLightboxIndex(newIndex);
  };

  // Track carousel scroll position for indicators
  useEffect(() => {
    const handleImageScroll = () => {
      if (imageCarouselRef.current && project?.images?.length > 0) {
        const carousel = imageCarouselRef.current;
        const itemWidth = carousel.children[0]?.offsetWidth || 0;
        const scrollLeft = carousel.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentImageIndex(Math.min(newIndex, project.images.length - 1));
      }
    };

    const handleVideoScroll = () => {
      if (videoCarouselRef.current && project?.videos?.length > 0) {
        const carousel = videoCarouselRef.current;
        const itemWidth = carousel.children[0]?.offsetWidth || 0;
        const scrollLeft = carousel.scrollLeft;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentVideoIndex(Math.min(newIndex, project.videos.length - 1));
      }
    };

    const imageCarousel = imageCarouselRef.current;
    const videoCarousel = videoCarouselRef.current;

    if (imageCarousel) {
      imageCarousel.addEventListener('scroll', handleImageScroll);
    }
    if (videoCarousel) {
      videoCarousel.addEventListener('scroll', handleVideoScroll);
    }

    return () => {
      if (imageCarousel) {
        imageCarousel.removeEventListener('scroll', handleImageScroll);
      }
      if (videoCarousel) {
        videoCarousel.removeEventListener('scroll', handleVideoScroll);
      }
    };
  }, [project?.images?.length, project?.videos?.length]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading project details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <Link to="/projects" className="btn-primary">
          <FaArrowLeft /> Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container">
        <h3>Project Not Found</h3>
        <p>The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/projects" className="btn-primary">
          <FaArrowLeft /> Back to Projects
        </Link>
      </div>
    );
  }
  return (
    <div className="projectdetails-container">
      {/* Enhanced Header Section */}
      <motion.div 
        className="projectdetails-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="projectdetails-header-content">
          <div className="projectdetails-header-nav">
            <button onClick={() => navigate('/projects')} className="projectdetails-back-button">
              <FaArrowLeft /> Back to Projects
            </button>
            
            <div className="projectdetails-header-actions">
              <button 
                onClick={toggleFavorite}
                className={`projectdetails-action-button projectdetails-favorite-button ${isFavorite ? 'active' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? <FaStar /> : <FaRegStar />}
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </button>
              
              <Link 
                to={`/projects/${project.id}/edit`} 
                className="projectdetails-action-button projectdetails-edit-button"
              >
                <FaEdit /> Edit Project
              </Link>
                <button 
                onClick={handleDeleteClick}
                className="projectdetails-action-button projectdetails-delete-button"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
          
          <div className="projectdetails-hero">
            <div className="projectdetails-hero-text">
              <div className="projectdetails-badges">
                {project.featured && (
                  <span className="projectdetails-badge projectdetails-featured-badge">
                    <FaAward /> Featured Project
                  </span>
                )}
                <span className={`projectdetails-badge projectdetails-status-badge ${getStatusClass(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status?.replace('-', ' ') || 'No Status'}
                </span>
                {project.priority && (
                  <span className={`projectdetails-badge projectdetails-priority-badge ${getPriorityClass(project.priority)}`}>
                    <FaFlag />
                    {project.priority} Priority
                  </span>
                )}
                {project.type && (
                  <span className="projectdetails-badge projectdetails-type-badge">
                    <FaProjectDiagram />
                    {project.type}
                  </span>
                )}
              </div>
              
              <h1 className="projectdetails-title">
                {project?.title || 'Untitled Project'}
              </h1>
              <p className="projectdetails-description">
                {project?.description || 'No description available'}
              </p>              
              <div className="projectdetails-hero-stats">
                {project?.stars && (
                  <div className="projectdetails-stat-item">
                    <FaStar />
                    <span>{project.stars} Stars</span>
                  </div>
                )}
                {project?.forks && (
                  <div className="projectdetails-stat-item">
                    <FaCodeBranch />
                    <span>{project.forks} Forks</span>
                  </div>
                )}
                {project?.team?.size && (
                  <div className="projectdetails-stat-item">
                    <FaUsers />
                    <span>{project.team.size} Team Members</span>
                  </div>
                )}
                {project?.language && (
                  <div className="projectdetails-stat-item">
                    <FaCode />
                    <span>{project.language}</span>
                  </div>
                )}
              </div>
              
              <div className="projectdetails-links">
                {project?.github && (
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="projectdetails-hero-link projectdetails-github-link"
                  >
                    <FaGithub /> View Repository
                  </a>
                )}
                
                {(project?.demo || project?.liveUrl) && (
                  <a 
                    href={project.demo || project.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="projectdetails-hero-link projectdetails-demo-link"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>
                )}
                
                {project?.documentation && (
                  <a 
                    href={project.documentation} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="projectdetails-hero-link projectdetails-docs-link"
                  >
                    <FaFileAlt /> Documentation
                  </a>
                )}
              </div>
            </div>
            
            {project?.image && (
              <div className="projectdetails-hero-image">
                <img src={project.image} alt={project?.title || 'Project'} />
              </div>
            )}
          </div>
        </div>
      </motion.div>      {/* Main Content */}
      <div className="projectdetails-content">
        <div className="projectdetails-content-wrapper">
          {/* Project Overview Cards */}
          <motion.div 
            className="projectdetails-overview-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Budget Card */}
            {project?.budget && (
              <div className="projectdetails-overview-card projectdetails-budget-card">
                <div className="projectdetails-card-header">
                  <FaDollarSign />
                  <h3>Project Budget</h3>
                </div>
                <div className="projectdetails-card-content">
                  <div className="projectdetails-budget-amount">
                    {project.budget.currency || 'KES'} {project.budget.amount?.toLocaleString() || 'Not specified'}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Card */}
            {(project?.duration?.start || project?.duration?.end || project?.deadline) && (
              <div className="projectdetails-overview-card projectdetails-timeline-card">
                <div className="projectdetails-card-header">
                  <FaCalendarAlt />
                  <h3>Timeline</h3>
                </div>
                <div className="projectdetails-card-content">
                  {project.duration?.start && (
                    <div className="projectdetails-timeline-item">
                      <strong>Start:</strong> {formatDate(project.duration.start)}
                    </div>
                  )}
                  {project.duration?.end && (
                    <div className="projectdetails-timeline-item">
                      <strong>End:</strong> {formatDate(project.duration.end)}
                    </div>
                  )}
                  {project.deadline && (
                    <div className="projectdetails-timeline-item">
                      <strong>Deadline:</strong> {formatDate(project.deadline)}
                    </div>
                  )}
                  {project.duration?.total && (
                    <div className="projectdetails-timeline-item">
                      <strong>Duration:</strong> {project.duration.total}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metrics Card */}
            {project?.metrics && (
              <div className="projectdetails-overview-card projectdetails-metrics-card">
                <div className="projectdetails-card-header">
                  <FaChartLine />
                  <h3>Project Metrics</h3>
                </div>
                <div className="projectdetails-card-content">
                  {project.metrics.users && (
                    <div className="projectdetails-metric-item">
                      <FaUsers />
                      <span><strong>Users:</strong> {project.metrics.users.toLocaleString()}</span>
                    </div>
                  )}
                  {project.metrics.transactions && (
                    <div className="projectdetails-metric-item">
                      <FaExchangeAlt />
                      <span><strong>Transactions:</strong> {project.metrics.transactions.toLocaleString()}</span>
                    </div>
                  )}
                  {project.metrics.revenue && (
                    <div className="projectdetails-metric-item">
                      <FaDollarSign />
                      <span><strong>Revenue:</strong> ${project.metrics.revenue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>          {/* Main Content Grid */}
          <div className="projectdetails-content-grid">
            {/* Left Column */}
            <div className="projectdetails-content-main">
              {/* About Section */}
              {(project?.longDescription || project?.description) && (
                <motion.section 
                  className="projectdetails-content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="projectdetails-section-header">
                    <FaLightbulb />
                    <h2>About This Project</h2>
                  </div>
                  <div className="projectdetails-section-content">
                    <p>{project.longDescription || project.description}</p>
                  </div>
                </motion.section>
              )}

              {/* Technologies Section */}
              {(project?.technologies?.length > 0 || project?.tech?.length > 0) && (
                <motion.section 
                  className="projectdetails-content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="projectdetails-section-header">
                    <FaCode />
                    <h2>Technologies & Tools</h2>
                  </div>
                  <div className="projectdetails-section-content">
                    <div className="projectdetails-tech-grid">
                      {(project.technologies || project.tech || []).map((tech, index) => (
                        <span key={index} className="projectdetails-tech-badge">{tech}</span>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Features Section */}
              {project?.features?.length > 0 && (
                <motion.section 
                  className="projectdetails-content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="projectdetails-section-header">
                    <FaRocket />
                    <h2>Key Features</h2>
                  </div>
                  <div className="projectdetails-section-content">
                    <ul className="projectdetails-features-list">
                      {project.features.map((feature, index) => (
                        <li key={index}><FaCheck /> {feature}</li>
                      ))}
                    </ul>
                  </div>
                </motion.section>
              )}

              {/* Challenges & Solutions */}
              {(project.challenges || project.solutions) && (
                <motion.section 
                  className="content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="section-header">
                    <FaLightbulb />
                    <h2>Challenges & Solutions</h2>
                  </div>
                  <div className="section-content">
                    {project.challenges && (
                      <div className="challenge-solution">
                        <h4>Challenges Faced</h4>
                        <p>{project.challenges}</p>
                      </div>
                    )}
                    {project.solutions && (
                      <div className="challenge-solution">
                        <h4>Solutions Implemented</h4>
                        <p>{project.solutions}</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Lessons Learned */}
              {project.lessons && (
                <motion.section 
                  className="content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="section-header">
                    <FaTrophy />
                    <h2>Lessons Learned</h2>
                  </div>
                  <div className="section-content">
                    <p>{project.lessons}</p>
                  </div>
                </motion.section>
              )}

              {/* Next Steps */}
              {project.nextSteps && (
                <motion.section 
                  className="content-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="section-header">
                    <FaRocket />
                    <h2>Next Steps</h2>
                  </div>
                  <div className="section-content">
                    <p>{project.nextSteps}</p>
                  </div>
                </motion.section>
              )}              {/* Project Gallery - Horizontal Carousel */}
              {(project.images?.length > 0 || project.videos?.length > 0) && (
                <motion.section 
                  className="content-section gallery-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <div className="section-header">
                    <FaEye />
                    <h2>Project Gallery</h2>
                  </div>
                  <div className="section-content">
                    {project.images?.length > 0 && (
                      <div className="gallery-carousel-container">
                        <h3 className="carousel-title">Images</h3>
                        <div className="carousel-wrapper">
                          <button 
                            className="carousel-nav-btn carousel-nav-left"
                            onClick={() => scrollCarousel(imageCarouselRef, 'left')}
                            aria-label="Previous images"
                          >
                            <FaChevronLeft />
                          </button>
                          
                          <div className="gallery-carousel" ref={imageCarouselRef}>
                            {project.images.map((image, index) => (
                              <motion.div 
                                key={index} 
                                className="gallery-carousel-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openLightbox('image', index)}
                              >
                                <img 
                                  src={image} 
                                  alt={`Project screenshot ${index + 1}`}
                                  loading="lazy"
                                />
                                <div className="gallery-overlay">
                                  <FaExpand />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          <button 
                            className="carousel-nav-btn carousel-nav-right"
                            onClick={() => scrollCarousel(imageCarouselRef, 'right')}
                            aria-label="Next images"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                        
                        {/* Image indicators */}
                        <div className="carousel-indicators">
                          {project.images.map((_, index) => (
                            <button
                              key={index}
                              className={`indicator ${currentImageIndex === index ? 'active' : ''}`}
                              onClick={() => scrollToImage(index)}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {project.videos?.length > 0 && (
                      <div className="gallery-carousel-container">
                        <h3 className="carousel-title">Videos</h3>
                        <div className="carousel-wrapper">
                          <button 
                            className="carousel-nav-btn carousel-nav-left"
                            onClick={() => scrollCarousel(videoCarouselRef, 'left')}
                            aria-label="Previous videos"
                          >
                            <FaChevronLeft />
                          </button>
                          
                          <div className="video-carousel" ref={videoCarouselRef}>
                            {project.videos.map((video, index) => (
                              <motion.div 
                                key={index} 
                                className="video-carousel-item"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openLightbox('video', index)}
                              >
                                <video 
                                  preload="metadata"
                                  poster={`${video}#t=1`}
                                >
                                  <source src={video} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <div className="video-overlay">
                                  <FaPlay />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          <button 
                            className="carousel-nav-btn carousel-nav-right"
                            onClick={() => scrollCarousel(videoCarouselRef, 'right')}
                            aria-label="Next videos"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                        
                        {/* Video indicators */}
                        <div className="carousel-indicators">
                          {project.videos.map((_, index) => (
                            <button
                              key={index}
                              className={`indicator ${currentVideoIndex === index ? 'active' : ''}`}
                              onClick={() => scrollToVideo(index)}
                              aria-label={`Go to video ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}              {/* Testimonials */}
              {project.testimonials?.length > 0 && (
                <motion.section 
                  className="content-section testimonials-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <div className="section-header">
                    <FaQuoteLeft />
                    <h2>Testimonials</h2>
                  </div>
                  <div className="section-content">
                    <div className="testimonials-grid">
                      {project.testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                          <div className="testimonial-content">
                            <FaQuoteLeft />
                            <p>{testimonial.text}</p>
                          </div>
                          <div className="testimonial-author">
                            <strong>{testimonial.name}</strong>
                            {testimonial.role && <span>{testimonial.role}</span>}
                            {testimonial.company && <span>{testimonial.company}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </div>            {/* Right Sidebar */}
            <div className="projectdetails-content-sidebar">
              {/* Project Info Card */}
              <motion.div 
                className="projectdetails-sidebar-card projectdetails-project-info-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="projectdetails-card-header">
                  <FaProjectDiagram />
                  <h3>Project Information</h3>
                </div>
                <div className="projectdetails-card-content">
                  {project?.category && (
                    <div className="projectdetails-info-item">
                      <FaTags />
                      <div>
                        <label>Category</label>
                        <span>{project.category}</span>
                      </div>
                    </div>
                  )}
                  
                  {project?.type && (
                    <div className="projectdetails-info-item">
                      <FaProjectDiagram />
                      <div>
                        <label>Type</label>
                        <span>{project.type}</span>
                      </div>
                    </div>
                  )}
                    {project?.createdAt && (
                    <div className="projectdetails-info-item">
                      <FaCalendarAlt />
                      <div>
                        <label>Created</label>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  
                  {project?.updatedAt && (
                    <div className="projectdetails-info-item">
                      <FaClock />
                      <div>
                        <label>Last Updated</label>
                        <span>{formatRelativeTime(project.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="projectdetails-sidebar-card projectdetails-actions-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="projectdetails-card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="projectdetails-card-content">
                  <div className="projectdetails-actions-grid">                    {(project?.github || project?.repository) && (
                      <a 
                        href={project.github || project.repository}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="projectdetails-action-btn projectdetails-github-btn"
                      >
                        <FaGithub />
                        View Code
                      </a>
                    )}
                    
                    {(project?.demo || project?.liveUrl) && (
                      <a 
                        href={project.demo || project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="projectdetails-action-btn projectdetails-demo-btn"
                      >
                        <FaExternalLinkAlt />
                        Live Demo
                      </a>
                    )}                  </div>
                </div>
              </motion.div>

              {/* Team Management Section */}
              <motion.div 
                className="projectdetails-sidebar-card projectdetails-team-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="projectdetails-card-header">
                  <FaUsers />
                  <h3>Team Management</h3>
                </div>                <div className="projectdetails-card-content">
                  <ProjectTeamManagement projectId={project?.id} isEmbedded={true} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div 
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="lightbox-close"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <FaTimes />
              </button>
              
              <button 
                className="lightbox-nav lightbox-nav-prev"
                onClick={() => navigateLightbox('prev')}
                aria-label="Previous item"
              >
                <FaChevronLeft />
              </button>
              
              <div className="lightbox-media">
                {lightboxType === 'image' ? (
                  <img 
                    src={project?.images?.[lightboxIndex]} 
                    alt={`Project screenshot ${lightboxIndex + 1}`}
                  />
                ) : (
                  <video 
                    controls 
                    autoPlay
                    src={project?.videos?.[lightboxIndex]}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              <button 
                className="lightbox-nav lightbox-nav-next"
                onClick={() => navigateLightbox('next')}
                aria-label="Next item"
              >
                <FaChevronRight />
              </button>
              
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {(lightboxType === 'image' ? project?.images : project?.videos)?.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Project"
        size="small"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="btn-danger"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="loading-spinner"></span>
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
