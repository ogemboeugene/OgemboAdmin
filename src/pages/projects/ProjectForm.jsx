import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FaSave, 
  FaTimes, 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaImage, 
  FaGithub, 
  FaGlobe, 
  FaCalendarAlt,
  FaChartBar,
  FaQuoteLeft,
  FaUsers,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaLightbulb,
  FaCode,
  FaUserFriends,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLink,
  FaCloudUploadAlt,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaSpinner
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api/apiService';
import firebaseStorageService from '../../services/firebase/storageService';

const ProjectForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
    const [formData, setFormData] = useState({    // Required backend fields
    title: '',
    description: '',
    priority: 'medium', // New required field
    type: 'personal', // New required field with valid default
    
    // Optional backend fields
    deadline: '',
    features: [], // New field (similar to technologies)
    client: {
      name: '',
      company: '',
      email: '',
      phone: ''
    },
    budget: {
      amount: '',
      currency: 'USD'
    },
    documentation: '',
    stars: '',
    forks: '',
    language: '',
    images: [],
    videos: [],
    tags: [],
    
    // Existing fields to keep/map
    technologies: [], // Renamed from tech
    image: '',
    demo: '',
    github: '',
    category: '',
    status: 'planning',
    featured: false,
    
    // Frontend-only fields for form UX (will be transformed for backend)
    longDescription: '',
    impact: '',
    metrics: {
      users: '',
      transactions: '',
      revenue: ''
    },
    team: {
      size: '',
      roles: []
    },
    duration: {
      start: '',
      end: '',
      total: ''
    },
    challenges: '',
    solutions: '',
    lessons: '',
    nextSteps: '',
    testimonials: []
  });
    const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [testimonialInput, setTestimonialInput] = useState({ name: '', role: '', text: '' });  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [showHelpTips, setShowHelpTips] = useState(true);  const [activeSection, setActiveSection] = useState('basic');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
    // Categories for projects
  const categories = [
    'Web Application', 
    'Mobile App', 
    'Desktop Application', 
    'API/Backend', 
    'E-commerce', 
    'Portfolio', 
    'Game', 
    'Data Visualization', 
    'Machine Learning', 
    'Blockchain', 
    'Other'
  ];  // Project types (new required field) - Updated to match backend expectations
  const projectTypes = [
    { value: 'personal', label: 'Personal Project' },
    { value: 'client', label: 'Client Project' },
    { value: 'open-source', label: 'Open Source' },
    { value: 'learning', label: 'Learning Project' }
  ];
  
  // Priority levels (new required field)
  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ];
  
  // Currency options for budget
  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KES'
  ];
  
  // Status options
  const statusOptions = [
    { value: 'planning', label: 'Planning', color: '#3b82f6' },
    { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'on-hold', label: 'On Hold', color: '#6b7280' }
  ];
    // Form sections
  const formSections = [
    { id: 'basic', label: 'Basic Info', icon: <FaInfoCircle /> },
    { id: 'details', label: 'Details', icon: <FaLightbulb /> },
    { id: 'client', label: 'Client & Budget', icon: <FaMoneyBillWave /> },
    { id: 'tech', label: 'Technology', icon: <FaCode /> },
    { id: 'features', label: 'Features', icon: <FaCheckCircle /> },
    { id: 'metrics', label: 'Metrics', icon: <FaChartBar /> },
    { id: 'team', label: 'Team', icon: <FaUserFriends /> },
    { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt /> },
    { id: 'links', label: 'Links', icon: <FaLink /> },
    { id: 'reflection', label: 'Reflection', icon: <FaLightbulb /> },
    { id: 'testimonials', label: 'Testimonials', icon: <FaQuoteLeft /> }
  ];
  
  // Help tips for form fields
  const helpTips = {
    title: "Choose a concise, memorable name that clearly represents your project.",
    description: "Write a brief 1-2 sentence summary of what your project does.",
    longDescription: "Provide comprehensive details about your project, its purpose, and functionality.",
    tech: "List all technologies, frameworks, and languages used in your project.",
    impact: "Describe the measurable impact your project had (e.g., increased efficiency by 30%).",
    metrics: "Include quantifiable metrics to demonstrate your project's scale and success.",
    team: "Detail the team composition and your specific role in the project.",
    duration: "Specify the project timeline and total duration.",
    challenges: "Describe significant challenges faced during development.",
    solutions: "Explain how you overcame the challenges mentioned.",
    lessons: "Share key learnings and insights gained from this project.",
    nextSteps: "Outline future plans or potential improvements for this project."
  };
    // Validation rules
  const validateField = (name, value) => {
    switch(name) {
      case 'title':
        return !value.trim() ? 'Project title is required' : 
               value.length > 100 ? 'Title must be less than 100 characters' : '';
      case 'description':
        return !value.trim() ? 'Short description is required' : 
               value.length > 200 ? 'Description must be less than 200 characters' : '';
      case 'priority':
        return !value ? 'Priority level is required' : '';
      case 'type':
        return !value ? 'Project type is required' : '';
      case 'longDescription':
        return !value.trim() ? 'Long description is required' : 
               value.length < 50 ? 'Please provide a more detailed description (at least 50 characters)' : '';
      case 'impact':
        return !value.trim() ? 'Impact statement is required' : '';
      case 'technologies':
        return value.length === 0 ? 'At least one technology must be added' : '';
      case 'github':
        return value && !/^https?:\/\/github\.com\/[\w-]+\/[\w-]+/.test(value) ? 
               'Please enter a valid GitHub repository URL' : '';
      case 'demo':
        return value && !/^https?:\/\//.test(value) ? 
               'Please enter a valid URL starting with http:// or https://' : '';
      case 'client.email':
        return value && !/\S+@\S+\.\S+/.test(value) ? 
               'Please enter a valid email address' : '';
      case 'budget.amount':
        return value && isNaN(parseFloat(value)) ? 
               'Please enter a valid number for budget amount' : '';
      case 'duration.start':
        return !value ? 'Start date is required' : '';
      case 'duration.end':
        return value && new Date(value) < new Date(formData.duration.start) ? 
               'End date must be after start date' : '';
      case 'deadline':
        return value && new Date(value) < new Date() ? 
               'Deadline must be in the future' : '';
      default:
        return '';
    }
  };
    // Calculate form completion progress
  const calculateProgress = () => {
    const requiredFields = [
      'title', 'description', 'priority', 'type', 'longDescription', 'impact', 
      'duration.start', 'category', 'status'
    ];
    
    const completedFields = requiredFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return formData[parent][child];
      }
      return formData[field];
    });
    
    // Add tech array check
    if (formData.technologies.length > 0) completedFields.push('technologies');
    
    // Add team roles check
    if (formData.team.roles.length > 0) completedFields.push('team.roles');
    
    const progress = Math.round((completedFields.length / (requiredFields.length + 2)) * 100);
    return progress;
  };
  // Fetch project data for edit mode
  useEffect(() => {
    console.log('useEffect triggered - editMode:', editMode, 'id:', id);
    if (editMode && id) {
      console.log('Starting data fetch for edit mode');
      setIsLoading(true);
      
      const fetchProject = async () => {try {
          console.log('Fetching project with ID:', id);
          const response = await apiService.projects.getById(id);
          console.log('Full API response:', response);
          console.log('Response data structure:', response.data);
          
          // Handle nested response structure: {success: true, data: {project: {...}}}
          // First get the data object, then extract the project
          const responseData = response.data?.data || response.data;
          const project = responseData?.project || responseData;
          
          console.log('Response data:', responseData);
          console.log('Extracted project data:', project);
          console.log('Project title:', project?.title);
          console.log('Project description:', project?.description);
          
          if (!project || !project.title) {
            console.error('Project data is missing or invalid:', project);
            throw new Error('Project not found or data is incomplete');
          }
          
          // Transform backend data to frontend format
          const transformedProject = {
            // Required fields
            title: project.title || '',
            description: project.description || '',
            priority: project.priority || 'medium',
            type: project.type || 'personal',
            
            // Optional backend fields with direct mapping
            deadline: project.deadline ? project.deadline.split('T')[0] : '', // Convert to date input format
            features: project.features || [],
            technologies: project.technologies || [],
            image: project.image || '',
            demo: project.liveUrl || project.demo || '', // Handle both field names
            github: project.github || '',
            category: project.category || '',
            status: project.status || 'planning',
            featured: Boolean(project.featured),
            
            // Client information
            client: {
              name: project.client?.name || '',
              company: project.client?.company || '',
              email: project.client?.email || '',
              phone: project.client?.phone || ''
            },
            
            // Budget information
            budget: {
              amount: project.budget?.amount ? project.budget.amount.toString() : '',
              currency: project.budget?.currency || 'USD'
            },
            
            // Additional fields
            documentation: project.documentation || '',
            stars: project.stars ? project.stars.toString() : '',
            forks: project.forks ? project.forks.toString() : '',
            language: project.language || '',
            images: project.images || [],
            videos: project.videos || [],
            tags: project.tags || [],
            
            // Frontend-only fields from backend extended data
            longDescription: project.longDescription || project.extendedDescription || '',
            impact: project.impact || '',
            
            // Metrics with proper formatting
            metrics: {
              users: project.metrics?.users ? project.metrics.users.toString() : '',
              transactions: project.metrics?.transactions ? project.metrics.transactions.toString() : '',
              revenue: project.metrics?.revenue ? project.metrics.revenue.toString() : ''
            },
            
            // Team information
            team: {
              size: project.team?.size ? project.team.size.toString() : '',
              roles: project.team?.roles || []
            },
            
            // Duration information - handle both formats
            duration: {
              start: project.startDate ? project.startDate.split('T')[0] : 
                     project.duration?.start ? project.duration.start.split('T')[0] : '',
              end: project.endDate ? project.endDate.split('T')[0] : 
                   project.duration?.end ? project.duration.end.split('T')[0] : '',
              total: project.duration?.total || ''
            },
            
            // Reflection fields
            challenges: project.challenges || '',
            solutions: project.solutions || '',
            lessons: project.learnings || project.lessons || '',
            nextSteps: project.nextSteps || '',
            
            // Transform testimonials format
            testimonials: (project.testimonials || []).map(testimonial => ({
              name: testimonial.author || testimonial.name,
              role: testimonial.role || '',
              text: testimonial.feedback || testimonial.text
            }))
          };
            console.log('Transformed project data:', transformedProject);
          setFormData(transformedProject);
          setPreviewImage(transformedProject.image);
          console.log('Project state set successfully:', transformedProject.title);
          
        } catch (error) {
          console.error('Error fetching project:', error);
          
          // Handle different error types
          if (error.response?.status === 404) {
            alert('Project not found. Redirecting to projects list.');
            navigate('/projects');
          } else if (error.response?.status === 401) {
            alert('You are not authorized to edit this project.');
            navigate('/projects');
          } else if (error.response?.status === 403) {
            alert('You do not have permission to edit this project.');
            navigate('/projects');
          } else {
            alert('Failed to load project data. Please try again.');
            console.error('Full error:', error);
            // Don't navigate away on network errors, allow user to retry
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProject();
    }
  }, [editMode, id, navigate]);
  
  // Update form progress when form data changes
  useEffect(() => {
    const progress = calculateProgress();
    setFormProgress(progress);
  }, [formData]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
    // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // First set up a preview using FileReader for immediate feedback
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Then upload to Firebase Storage
        setIsUploading(true);
        setUploadProgress(0);
        
        // Generate a unique filename with timestamp and random string
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `project-${timestamp}-${randomString}-${file.name}`;
          // Upload the file with progress tracking
        const imageUrl = await firebaseStorageService.uploadImage(
          file, 
          'projects', 
          fileName, 
          (progress) => {
            setUploadProgress(Math.round(progress));
          }
        );
        
        // Save the Firebase URL to formData
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
        
        console.log('Image successfully uploaded:', imageUrl);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Error uploading image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };
    // Add technology
  const addTech = () => {
    if (techInput.trim()) {
      if (!formData.technologies.includes(techInput.trim())) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, techInput.trim()]
        }));
        
        // Clear tech validation error if it exists
        if (errors.technologies) {
          setErrors(prev => ({
            ...prev,
            technologies: ''
          }));
        }
      }
      setTechInput('');
    }
  };
  
  // Handle tech input keydown
  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    }
  };
  
  // Remove technology
  const removeTech = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
    
    // Validate tech array after removal
    if (formData.technologies.length <= 1) {
      setErrors(prev => ({
        ...prev,
        technologies: 'At least one technology must be added'
      }));
    }
  };

  // Add feature
  const addFeature = () => {
    if (featureInput.trim()) {
      if (!formData.features.includes(featureInput.trim())) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, featureInput.trim()]
        }));
      }
      setFeatureInput('');
    }
  };
  
  // Handle feature input keydown
  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };
  
  // Remove feature
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      if (!formData.tags.includes(tagInput.trim().toLowerCase())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }));
      }
      setTagInput('');
    }
  };
  
  // Handle tag input keydown
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Remove tag
  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  // Add team role
  const addRole = () => {
    if (roleInput.trim()) {
      if (!formData.team.roles.includes(roleInput.trim())) {
        setFormData(prev => ({
          ...prev,
          team: {
            ...prev.team,
            roles: [...prev.team.roles, roleInput.trim()]
          }
        }));
      }
      setRoleInput('');
    }
  };
  
  // Handle role input keydown
  const handleRoleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRole();
    }
  };
  
  // Remove team role
  const removeRole = (index) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        roles: prev.team.roles.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Add testimonial
  const addTestimonial = () => {
    if (testimonialInput.name.trim() && testimonialInput.text.trim()) {
      setFormData(prev => ({
        ...prev,
        testimonials: [...prev.testimonials, { ...testimonialInput }]
      }));
      setTestimonialInput({ name: '', role: '', text: '' });
    }
  };
  
  // Remove testimonial
  const removeTestimonial = (index) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };
  
  // Handle testimonial input change
  const handleTestimonialChange = (e) => {
    const { name, value } = e.target;
    setTestimonialInput(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Calculate duration automatically
  const calculateDuration = () => {
    const { start, end } = formData.duration;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (endDate >= startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.round(diffDays / 30);
        
        let durationText = '';
        if (diffMonths < 1) {
          durationText = `${diffDays} days`;
        } else if (diffMonths === 1) {
          durationText = '1 month';
        } else if (diffMonths < 12) {
          durationText = `${diffMonths} months`;
        } else {
          const years = Math.floor(diffMonths / 12);
          const remainingMonths = diffMonths % 12;
          durationText = years === 1 ? '1 year' : `${years} years`;
          if (remainingMonths > 0) {
            durationText += remainingMonths === 1 ? ' and 1 month' : ` and ${remainingMonths} months`;
          }
        }
        
        setFormData(prev => ({
          ...prev,
          duration: {
            ...prev.duration,
            total: durationText
          }
        }));
      }
    }
  };
  
  // Update duration when start or end date changes
  useEffect(() => {
    calculateDuration();
  }, [formData.duration.start, formData.duration.end]);
    // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    newErrors.title = validateField('title', formData.title);
    newErrors.description = validateField('description', formData.description);
    newErrors.priority = validateField('priority', formData.priority);
    newErrors.type = validateField('type', formData.type);
    newErrors.longDescription = validateField('longDescription', formData.longDescription);
    newErrors.impact = validateField('impact', formData.impact);
    newErrors.technologies = validateField('technologies', formData.technologies);
    newErrors.github = validateField('github', formData.github);
    newErrors.demo = validateField('demo', formData.demo);
    newErrors['client.email'] = validateField('client.email', formData.client.email);
    newErrors['budget.amount'] = validateField('budget.amount', formData.budget.amount);
    newErrors['duration.start'] = validateField('duration.start', formData.duration.start);
    newErrors['duration.end'] = validateField('duration.end', formData.duration.end);
    newErrors.deadline = validateField('deadline', formData.deadline);
    
    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };
  // Transform form data for API submission
  const transformDataForAPI = (formData) => {
    // Helper function to convert string to integer or null
    const parseIntOrNull = (value) => {
      if (!value || value === '') return null;
      const parsed = parseInt(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper function to convert string to number or null
    const parseFloatOrNull = (value) => {
      if (!value || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper function to extract numeric value from strings like "10,000+" or "$100,000+"
    const extractNumericValue = (value, isInteger = true) => {
      if (!value || value === '') return null;
      
      // Remove common formatting characters and extract numbers
      const cleanValue = value.toString().replace(/[\$,+\s]/g, '');
      
      if (isInteger) {
        const parsed = parseInt(cleanValue);
        return isNaN(parsed) ? null : parsed;
      } else {
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? null : parsed;
      }
    };

    // Create backend-compatible data structure
    const apiData = {
      // Required fields
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      type: formData.type,
      
      // Optional fields with direct mapping
      deadline: formData.deadline || null,
      features: formData.features,
      documentation: formData.documentation || null,
      stars: parseIntOrNull(formData.stars),
      forks: parseIntOrNull(formData.forks),
      language: formData.language || null,
      images: formData.images,
      videos: formData.videos,
      tags: formData.tags,
      technologies: formData.technologies,
      
      // Client information
      client: formData.client.name ? {
        name: formData.client.name,
        company: formData.client.company || null,
        email: formData.client.email || null,
        phone: formData.client.phone || null
      } : null,
      
      // Budget information
      budget: formData.budget.amount ? {
        amount: parseFloatOrNull(formData.budget.amount),
        currency: formData.budget.currency
      } : null,
      
      // Existing fields that map directly
      image: formData.image || null,
      demo: formData.demo || null,
      github: formData.github || null,
      category: formData.category || null,
      status: formData.status,
      featured: formData.featured,
      
      // Transform frontend-only fields with proper type conversion
      extendedDescription: formData.longDescription,
      impact: formData.impact,
      
      // Metrics with proper type conversion (backend expects integers/numbers)
      metrics: {
        users: extractNumericValue(formData.metrics.users, true), // integer
        transactions: extractNumericValue(formData.metrics.transactions, true), // integer  
        revenue: extractNumericValue(formData.metrics.revenue, false) // number (float)
      },
      
      // Team with proper type conversion (backend expects integer for size)
      team: {
        size: parseIntOrNull(formData.team.size), // integer
        roles: formData.team.roles
      },
      
      duration: formData.duration,
      challenges: formData.challenges,
      solutions: formData.solutions,
      lessons: formData.lessons,
      nextSteps: formData.nextSteps,
      testimonials: formData.testimonials
    };
    
    // Remove null values to keep the payload clean
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === null || apiData[key] === '') {
        delete apiData[key];
      }
    });
    
    return apiData;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    
    if (!isValid) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return;
    }
      setIsLoading(true);
    
    try {
      // Check authentication
      if (!isLoggedIn || !user) {
        throw new Error('You must be logged in to save projects');
      }      // Transform data for API
      const apiData = transformDataForAPI(formData);
      
      // DEBUG: Log the data being sent to backend
      console.log('=== DEBUGGING FORM SUBMISSION ===');
      console.log('Original formData:', formData);
      console.log('Transformed apiData:', apiData);
      console.log('Type field value:', apiData.type);
      console.log('Type field type:', typeof apiData.type);
      console.log('Available project types:', projectTypes.map(pt => pt.value));
      console.log('=====================================');
        // Make API call using apiService with automatic auth headers
      let response;
      if (editMode) {
        response = await apiService.projects.update(id, apiData);
      } else {
        response = await apiService.projects.create(apiData);
        
        // Automatically add the project creator as a team member for new projects
        try {
          const projectId = response.data?.data?.id || response.data?.id;
          if (projectId && user) {
            const creatorTeamMember = {
              name: user.displayName || user.name || user.email?.split('@')[0] || 'Project Creator',
              email: user.email,
              role: 'Project Lead',
              permissions: ['read', 'write', 'admin', 'delete'],
              joinDate: new Date().toISOString().split('T')[0],
              responsibilities: 'Project creator and lead',
              department: 'Management',
              isActive: true
            };
            
            console.log('Auto-adding project creator as team member:', creatorTeamMember);
            await apiService.projects.team.add(projectId, creatorTeamMember);
            console.log('Project creator successfully added as team member');
          }
        } catch (teamError) {
          console.warn('Could not automatically add creator as team member:', teamError);
          // Don't fail the entire project creation if team member addition fails
        }
      }
      
      console.log('Project saved successfully:', response.data);
      
      // Show success message
      alert(editMode ? 'Project updated successfully!' : 'Project created successfully!');
      
      // Navigate back to projects list (this will trigger a reload)
      navigate('/projects');
        } catch (error) {
      console.error('Error saving project:', error);
      
      // DEBUG: Log detailed error information for validation debugging
      console.log('=== ERROR DEBUGGING ===');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error message:', error.message);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
      console.log('======================');
      
      // Handle different types of errors
      let errorMessage = 'Failed to save project. Please try again.';
      
      if (error.response) {
        // API error response
        switch (error.response.status) {
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            // Could redirect to login here
            break;
          case 403:
            errorMessage = 'You do not have permission to save projects.';
            break;
          case 400:
            errorMessage = error.response.data?.message || 'Invalid project data. Please check your inputs.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred while saving the project.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/projects');
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    
    // Scroll to top when entering preview mode
    if (!showPreview) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle blur event for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Navigate to a specific section
  const navigateToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
    if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3 className="loading-text">{editMode ? 'Loading project data...' : 'Creating project...'}</h3>
      </div>
    );
  }
  
  // Preview component
  const ProjectPreview = () => (
    <div className="project-preview">
      <div className="preview-header">
        <h2>Project Preview</h2>
        <button type="button" className="btn-outline" onClick={togglePreview}>
          <FaEdit /> Edit Form
        </button>
      </div>
      
      <div className="preview-content">        <div className="preview-image">
          {formData.image ? (
            <img src={formData.image} alt={formData.title} />
          ) : previewImage ? (
            <img src={previewImage} alt={formData.title} />
          ) : (
            <div className="preview-image-placeholder">
              <FaImage />
              <span>No image provided</span>
            </div>
          )}
        </div>
        
        <div className="preview-main">
          <div className="preview-title-section">
            <h1>{formData.title || 'Untitled Project'}</h1>
            {formData.featured && <span className="preview-featured-badge">Featured</span>}
            <span className={`preview-status-badge status-${formData.status}`}>
              {statusOptions.find(option => option.value === formData.status)?.label || 'Status not set'}
            </span>
          </div>
          
          <div className="preview-description">
            <p className="preview-short-desc">{formData.description || 'No description provided'}</p>
          </div>
            <div className="preview-tech">
            <h3>Technologies</h3>
            <div className="preview-tech-list">
              {formData.technologies.length > 0 ? (
                formData.technologies.map((tech, index) => (
                  <span key={index} className="preview-tech-tag">{tech}</span>
                ))
              ) : (
                <p className="preview-empty">No technologies specified</p>
              )}
            </div>
          </div>
          
          <div className="preview-section">
            <h3>About this Project</h3>
            <div className="preview-long-desc">
              {formData.longDescription ? (
                <p>{formData.longDescription}</p>
              ) : (
                <p className="preview-empty">No detailed description provided</p>
              )}
            </div>
          </div>
          
          <div className="preview-section">
            <h3>Impact</h3>
            <p>{formData.impact || 'No impact statement provided'}</p>
          </div>
          
          <div className="preview-metrics">
            <h3>Key Metrics</h3>
            <div className="preview-metrics-grid">
              <div className="preview-metric-card">
                <div className="preview-metric-icon">
                  <FaUsers />
                </div>
                <div className="preview-metric-content">
                  <h4>Users</h4>
                  <p>{formData.metrics.users || 'N/A'}</p>
                </div>
              </div>
              
              <div className="preview-metric-card">
                <div className="preview-metric-icon">
                  <FaExchangeAlt />
                </div>
                <div className="preview-metric-content">
                  <h4>Transactions</h4>
                  <p>{formData.metrics.transactions || 'N/A'}</p>
                </div>
              </div>
              
              <div className="preview-metric-card">
                <div className="preview-metric-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="preview-metric-content">
                  <h4>Revenue</h4>
                  <p>{formData.metrics.revenue || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="preview-columns">
            <div className="preview-column">
              <h3>Team</h3>
              <p><strong>Size:</strong> {formData.team.size || 'Not specified'}</p>
              <h4>Roles</h4>
              {formData.team.roles.length > 0 ? (
                <ul className="preview-roles-list">
                  {formData.team.roles.map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              ) : (
                <p className="preview-empty">No team roles specified</p>
              )}
            </div>
            
            <div className="preview-column">
              <h3>Timeline</h3>
              <p><strong>Start Date:</strong> {formData.duration.start ? formatDate(formData.duration.start) : 'Not set'}</p>
              <p><strong>End Date:</strong> {formData.duration.end ? formatDate(formData.duration.end) : 'Not set'}</p>
              <p><strong>Duration:</strong> {formData.duration.total || 'Not calculated'}</p>
            </div>
          </div>
          
          <div className="preview-section">
            <h3>Challenges & Solutions</h3>
            <div className="preview-columns">
              <div className="preview-column">
                <h4>Challenges</h4>
                <p>{formData.challenges || 'No challenges specified'}</p>
              </div>
              
              <div className="preview-column">
                <h4>Solutions</h4>
                <p>{formData.solutions || 'No solutions specified'}</p>
              </div>
            </div>
          </div>
          
          <div className="preview-section">
            <h3>Lessons & Next Steps</h3>
            <div className="preview-columns">
              <div className="preview-column">
                <h4>Lessons Learned</h4>
                <p>{formData.lessons || 'No lessons specified'}</p>
              </div>
              
              <div className="preview-column">
                <h4>Next Steps</h4>
                <p>{formData.nextSteps || 'No next steps specified'}</p>
              </div>
            </div>
          </div>
          
          {formData.testimonials.length > 0 && (
            <div className="preview-section">
              <h3>Testimonials</h3>
              <div className="preview-testimonials">
                {formData.testimonials.map((testimonial, index) => (
                  <div key={index} className="preview-testimonial">
                    <blockquote>"{testimonial.text}"</blockquote>
                    <div className="preview-testimonial-author">
                      <p><strong>{testimonial.name}</strong></p>
                      {testimonial.role && <p>{testimonial.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="preview-links">
            <h3>Project Links</h3>
            <div className="preview-links-grid">
              {formData.github && (
                <a href={formData.github} target="_blank" rel="noopener noreferrer" className="preview-link github">
                  <FaGithub />
                  <span>GitHub Repository</span>
                </a>
              )}
              
              {formData.demo && (
                <a href={formData.demo} target="_blank" rel="noopener noreferrer" className="preview-link demo">
                  <FaGlobe />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="project-form-page">      {/* Form Header */}
      <div className="form-header">
        <div className="header-left">
          <Link to="/projects" className="back-link">
            <FaArrowLeft /> Back to Projects
          </Link>
          <h1>{editMode ? 'Edit Project' : 'Create New Project'}</h1>
          {/* DEBUG: Show current form data in edit mode */}
          {editMode && process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              DEBUG: Title: "{formData.title}" | ID: {id} | Loading: {isLoading.toString()}
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-outline toggle-preview-btn" 
            onClick={togglePreview}
          >
            {showPreview ? <><FaEdit /> Edit Form</> : <><FaEye /> Preview</>}
          </button>
          
          <button 
            type="button" 
            className="btn-outline toggle-help-btn" 
            onClick={() => setShowHelpTips(!showHelpTips)}
          >
            {showHelpTips ? <><FaEyeSlash /> Hide Tips</> : <><FaInfoCircle /> Show Tips</>}
          </button>
        </div>
      </div>
      
      {/* Form Progress */}
      <div className="form-progress-container">
        <div className="form-progress-label">
          <span>Form Completion</span>
          <span>{formProgress}%</span>
        </div>
        <div className="form-progress-bar">
          <div 
            className="form-progress-value" 
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Form Navigation */}
      <div className="form-navigation">
        {formSections.map(section => (
          <button
            key={section.id}
            type="button"
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => navigateToSection(section.id)}
          >
            {section.icon}
            <span>{section.label}</span>
          </button>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="form-content">
        {showPreview ? (
          <ProjectPreview />
        ) : (
          <form onSubmit={handleSubmit} className="project-form" ref={formRef}>
            {/* Basic Information Section */}
            <div id="section-basic" className="form-section">
              <div className="section-header">
                <h2><FaInfoCircle /> Basic Information</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Start with the essential details about your project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">
                    Project Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                                        value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.title && touched.title ? 'error' : ''}
                    required
                  />
                  {showHelpTips && helpTips.title && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.title}</span>
                    </div>
                  )}
                  {errors.title && touched.title && (
                    <div className="error-message">{errors.title}</div>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="description">
                    Short Description <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.description && touched.description ? 'error' : ''}
                    maxLength={200}
                    required
                  />
                  <div className="character-count">
                    {formData.description.length}/200 characters
                  </div>
                  {showHelpTips && helpTips.description && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.description}</span>
                    </div>
                  )}
                  {errors.description && touched.description && (
                    <div className="error-message">{errors.description}</div>
                  )}
                </div>
                  <div className="form-group">
                  <label htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">
                    Priority <span className="required">*</span>
                  </label>
                  <div className="status-options">
                    {priorityLevels.map(priority => (
                      <label key={priority.value} className="status-option">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={handleChange}
                          required
                        />
                        <span className="status-label" style={{ backgroundColor: priority.color }}>
                          {priority.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.priority && touched.priority && (
                    <div className="error-message">{errors.priority}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="type">
                    Project Type <span className="required">*</span>
                  </label>                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.type && touched.type ? 'error' : ''}
                    required
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && touched.type && (
                    <div className="error-message">{errors.type}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="deadline">
                    Deadline
                  </label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.deadline && touched.deadline ? 'error' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.deadline && touched.deadline && (
                    <div className="error-message">{errors.deadline}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="language">
                    Primary Language
                  </label>
                  <input
                    type="text"
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, Python, Java"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">
                    Status <span className="required">*</span>
                  </label>
                  <div className="status-options">
                    {statusOptions.map(option => (
                      <label key={option.value} className="status-option">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={handleChange}
                        />
                        <span className="status-label" style={{ backgroundColor: option.color }}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group featured-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    <span>Featured Project</span>
                  </label>
                  <div className="field-tip">
                    <FaInfoCircle />
                    <span>Featured projects will be highlighted in your portfolio</span>
                  </div>
                </div>
                  <div className="form-group image-upload">
                  <label>Project Image</label>
                  <div 
                    className="image-upload-area" 
                    onClick={isUploading ? null : triggerFileInput}
                    style={{ cursor: isUploading ? 'default' : 'pointer' }}
                  >
                    {previewImage ? (
                      <div className="image-preview">
                        <img src={previewImage} alt="Project preview" />
                        {!isUploading && (
                          <div className="image-overlay">
                            <FaEdit />
                            <span>Change Image</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="upload-progress-overlay">
                            <div className="upload-progress">
                              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <div className="upload-progress-text">
                              <FaSpinner className="spinner" />
                              <span>{uploadProgress}% Uploading...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        {isUploading ? (
                          <>
                            <FaSpinner className="spinner" />
                            <span>Uploading {uploadProgress}%</span>
                            <div className="upload-progress">
                              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt />
                            <span>Click to upload an image</span>
                            <p>Recommended size: 1200 x 630 pixels</p>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                  </div>
                  {formData.image && !isUploading && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>Image URL: {formData.image.substring(0, 50)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Details Section */}
            <div id="section-details" className="form-section">
              <div className="section-header">
                <h2><FaLightbulb /> Project Details</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Provide comprehensive details about your project to showcase your work effectively.</p>
                  </div>
                )}
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="longDescription">
                  Detailed Description <span className="required">*</span>
                </label>
                <textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.longDescription && touched.longDescription ? 'error' : ''}
                  required
                  rows="6"
                ></textarea>
                <div className="character-count">
                  {formData.longDescription.length} characters (min: 50)
                </div>
                {showHelpTips && helpTips.longDescription && (
                  <div className="field-tip">
                    <FaInfoCircle />
                    <span>{helpTips.longDescription}</span>
                  </div>
                )}
                {errors.longDescription && touched.longDescription && (
                  <div className="error-message">{errors.longDescription}</div>
                )}
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="impact">
                  Impact <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.impact && touched.impact ? 'error' : ''}
                  required
                  placeholder="e.g., Increased user engagement by 30%"
                />
                {showHelpTips && helpTips.impact && (
                  <div className="field-tip">
                    <FaInfoCircle />
                    <span>{helpTips.impact}</span>
                  </div>
                )}
                {errors.impact && touched.impact && (
                  <div className="error-message">{errors.impact}</div>
                )}              </div>
            </div>
            
            {/* Client & Budget Section */}
            <div id="section-client" className="form-section">
              <div className="section-header">
                <h2><FaMoneyBillWave /> Client & Budget Information</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Add client details and budget information for this project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="client.name">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="client.name"
                    name="client.name"
                    value={formData.client.name}
                    onChange={handleChange}
                    placeholder="Client or company name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="client.company">
                    Company
                  </label>
                  <input
                    type="text"
                    id="client.company"
                    name="client.company"
                    value={formData.client.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="client.email">
                    Client Email
                  </label>
                  <input
                    type="email"
                    id="client.email"
                    name="client.email"
                    value={formData.client.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors['client.email'] && touched['client.email'] ? 'error' : ''}
                    placeholder="client@example.com"
                  />
                  {errors['client.email'] && touched['client.email'] && (
                    <div className="error-message">{errors['client.email']}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="client.phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="client.phone"
                    name="client.phone"
                    value={formData.client.phone}
                    onChange={handleChange}
                    placeholder="+1-555-0123"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="budget.amount">
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    id="budget.amount"
                    name="budget.amount"
                    value={formData.budget.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors['budget.amount'] && touched['budget.amount'] ? 'error' : ''}
                    placeholder="50000"
                    min="0"
                    step="100"
                  />
                  {errors['budget.amount'] && touched['budget.amount'] && (
                    <div className="error-message">{errors['budget.amount']}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="budget.currency">
                    Currency
                  </label>
                  <select
                    id="budget.currency"
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleChange}
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="documentation">
                    Documentation URL
                  </label>
                  <div className="input-with-icon">
                    <FaLink className="input-icon" />
                    <input
                      type="url"
                      id="documentation"
                      name="documentation"
                      value={formData.documentation}
                      onChange={handleChange}
                      placeholder="https://docs.example.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="stars">
                    GitHub Stars
                  </label>
                  <input
                    type="number"
                    id="stars"
                    name="stars"
                    value={formData.stars}
                    onChange={handleChange}
                    placeholder="150"
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="forks">
                    GitHub Forks
                  </label>
                  <input
                    type="number"
                    id="forks"
                    name="forks"
                    value={formData.forks}
                    onChange={handleChange}
                    placeholder="25"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            {/* Features Section */}
            <div id="section-features" className="form-section">
              <div className="section-header">
                <h2><FaCheckCircle /> Project Features</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>List the key features and functionality of your project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="featureInput">
                  Features
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="featureInput"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    placeholder="Add feature (e.g., User Authentication, Real-time Chat)"
                  />
                  <button type="button" onClick={addFeature} className="add-btn">
                    <FaPlus /> Add
                  </button>
                </div>
                {showHelpTips && (
                  <div className="field-tip">
                    <FaInfoCircle />
                    <span>Press Enter to add multiple features quickly</span>
                  </div>
                )}
                <div className="tags-container">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="tag">
                      {feature}
                      <button type="button" onClick={() => removeFeature(index)} className="remove-tag">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {formData.features.length === 0 && (
                  <div className="empty-state">
                    <p>No features added yet</p>
                  </div>
                )}
                
                <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                  <label htmlFor="tagInput">
                    Tags
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tags (e.g., react, fullstack, web-app)"
                    />
                    <button type="button" onClick={addTag} className="add-btn">
                      <FaPlus /> Add
                    </button>
                  </div>
                  {showHelpTips && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>Tags help categorize your project. Use lowercase letters and hyphens.</span>
                    </div>
                  )}
                  <div className="tags-container">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="tag">
                        #{tag}
                        <button type="button" onClick={() => removeTag(index)} className="remove-tag">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.tags.length === 0 && (
                    <div className="empty-state">
                      <p>No tags added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
              {/* Technology Section */}
            <div id="section-tech" className="form-section">
              <div className="section-header">
                <h2><FaCode /> Technologies</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>List all technologies, frameworks, and languages used in your project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="techInput">
                  Technologies <span className="required">*</span>
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="techInput"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    placeholder="Add technology (e.g., React, Node.js)"
                    className={errors.technologies && touched.technologies ? 'error' : ''}
                  />
                  <button type="button" onClick={addTech} className="add-btn">
                    <FaPlus /> Add
                  </button>
                </div>
                {showHelpTips && (
                  <div className="field-tip">
                    <FaInfoCircle />
                    <span>Press Enter to add multiple technologies quickly</span>
                  </div>
                )}
                {errors.technologies && (
                  <div className="error-message">{errors.technologies}</div>
                )}
                <div className="tags-container">
                  {formData.technologies.map((tech, index) => (
                    <div key={index} className="tag">
                      {tech}
                      <button type="button" onClick={() => removeTech(index)} className="remove-tag">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {formData.technologies.length === 0 && (
                  <div className="empty-state">
                    <p>No technologies added yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Metrics Section */}
            <div id="section-metrics" className="form-section">
              <div className="section-header">
                <h2><FaChartBar /> Metrics</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Include quantifiable metrics to demonstrate your project's scale and success.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid three-columns">
                <div className="form-group">
                  <label htmlFor="metrics.users">
                    Users
                  </label>
                  <div className="input-with-icon">
                    <FaUsers className="input-icon" />
                    <input
                      type="text"
                      id="metrics.users"
                      name="metrics.users"
                      value={formData.metrics.users}
                      onChange={handleChange}
                      placeholder="e.g., 10,000+"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="metrics.transactions">
                    Transactions
                  </label>
                  <div className="input-with-icon">
                    <FaExchangeAlt className="input-icon" />
                    <input
                      type="text"
                      id="metrics.transactions"
                      name="metrics.transactions"
                      value={formData.metrics.transactions}
                      onChange={handleChange}
                      placeholder="e.g., 50,000+"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="metrics.revenue">
                    Revenue
                  </label>
                  <div className="input-with-icon">
                    <FaMoneyBillWave className="input-icon" />
                    <input
                      type="text"
                      id="metrics.revenue"
                      name="metrics.revenue"
                      value={formData.metrics.revenue}
                      onChange={handleChange}
                      placeholder="e.g., $100,000+"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Team Section */}
            <div id="section-team" className="form-section">
              <div className="section-header">
                <h2><FaUserFriends /> Team</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Detail the team composition and your specific role in the project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="team.size">
                    Team Size
                  </label>
                  <input
                    type="number"
                    id="team.size"
                    name="team.size"
                    value={formData.team.size}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                
                <div className="form-group wide">
                  <label htmlFor="roleInput">
                    Team Roles
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="roleInput"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      onKeyDown={handleRoleKeyDown}
                      placeholder="Add role (e.g., Developer, Designer)"
                    />
                    <button type="button" onClick={addRole} className="add-btn">
                      <FaPlus /> Add
                    </button>
                  </div>
                  <div className="tags-container">
                    {formData.team.roles.map((role, index) => (
                      <div key={index} className="tag">
                        {role}
                        <button type="button" onClick={() => removeRole(index)} className="remove-tag">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.team.roles.length === 0 && (
                    <div className="empty-state">
                      <p>No team roles added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Timeline Section */}
            <div id="section-timeline" className="form-section">
              <div className="section-header">
                <h2><FaCalendarAlt /> Timeline</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Specify the project timeline and total duration.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid three-columns">
                <div className="form-group">
                  <label htmlFor="duration.start">
                    Start Date <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      id="duration.start"
                      name="duration.start"
                      value={formData.duration.start}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors['duration.start'] && touched['duration.start'] ? 'error' : ''}
                      required
                    />
                  </div>
                  {errors['duration.start'] && touched['duration.start'] && (
                    <div className="error-message">{errors['duration.start']}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration.end">
                    End Date
                  </label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      id="duration.end"
                                            name="duration.end"
                      value={formData.duration.end}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors['duration.end'] && touched['duration.end'] ? 'error' : ''}
                      min={formData.duration.start}
                    />
                  </div>
                  {errors['duration.end'] && touched['duration.end'] && (
                    <div className="error-message">{errors['duration.end']}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration.total">
                    Total Duration
                  </label>
                  <input
                    type="text"
                    id="duration.total"
                    name="duration.total"
                    value={formData.duration.total}
                    onChange={handleChange}
                    placeholder="Calculated automatically"
                    readOnly
                  />
                  {showHelpTips && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>This field is calculated automatically based on start and end dates</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Links Section */}
            <div id="section-links" className="form-section">
              <div className="section-header">
                <h2><FaLink /> Project Links</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Add links to your project repository and live demo.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="github">
                    GitHub Repository
                  </label>
                  <div className="input-with-icon">
                    <FaGithub className="input-icon" />
                    <input
                      type="url"
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.github && touched.github ? 'error' : ''}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                  {errors.github && touched.github && (
                    <div className="error-message">{errors.github}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="demo">
                    Live Demo URL
                  </label>
                  <div className="input-with-icon">
                    <FaGlobe className="input-icon" />
                    <input
                      type="url"
                      id="demo"
                      name="demo"
                      value={formData.demo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.demo && touched.demo ? 'error' : ''}
                      placeholder="https://example.com"
                    />
                  </div>
                  {errors.demo && touched.demo && (
                    <div className="error-message">{errors.demo}</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reflection Section */}
            <div id="section-reflection" className="form-section">
              <div className="section-header">
                <h2><FaLightbulb /> Reflection</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Share your experiences, challenges, and learnings from this project.</p>
                  </div>
                )}
              </div>
              
              <div className="form-grid two-columns">
                <div className="form-group">
                  <label htmlFor="challenges">
                    Challenges Faced
                  </label>
                  <textarea
                    id="challenges"
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe significant challenges faced during development"
                  ></textarea>
                  {showHelpTips && helpTips.challenges && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.challenges}</span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="solutions">
                    Solutions Implemented
                  </label>
                  <textarea
                    id="solutions"
                    name="solutions"
                    value={formData.solutions}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Explain how you overcame the challenges mentioned"
                  ></textarea>
                  {showHelpTips && helpTips.solutions && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.solutions}</span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lessons">
                    Lessons Learned
                  </label>
                  <textarea
                    id="lessons"
                    name="lessons"
                    value={formData.lessons}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Share key learnings and insights gained from this project"
                  ></textarea>
                  {showHelpTips && helpTips.lessons && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.lessons}</span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="nextSteps">
                    Next Steps
                  </label>
                  <textarea
                    id="nextSteps"
                    name="nextSteps"
                    value={formData.nextSteps}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Outline future plans or potential improvements for this project"
                  ></textarea>
                  {showHelpTips && helpTips.nextSteps && (
                    <div className="field-tip">
                      <FaInfoCircle />
                      <span>{helpTips.nextSteps}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Testimonials Section */}
            <div id="section-testimonials" className="form-section">
              <div className="section-header">
                <h2><FaQuoteLeft /> Testimonials</h2>
                {showHelpTips && (
                  <div className="section-tip">
                    <FaLightbulb />
                    <p>Add testimonials from clients or team members about your project.</p>
                  </div>
                )}
              </div>
              
              <div className="testimonial-form">
                <div className="form-grid three-columns">
                  <div className="form-group">
                    <label htmlFor="testimonialName">
                      Name
                    </label>
                    <input
                      type="text"
                      id="testimonialName"
                      name="name"
                      value={testimonialInput.name}
                      onChange={handleTestimonialChange}
                      placeholder="Client or team member name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="testimonialRole">
                      Role
                    </label>
                    <input
                      type="text"
                      id="testimonialRole"
                      name="role"
                      value={testimonialInput.role}
                      onChange={handleTestimonialChange}
                      placeholder="e.g., Client, Project Manager"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="testimonialText">
                      Testimonial
                    </label>
                    <textarea
                      id="testimonialText"
                      name="text"
                      value={testimonialInput.text}
                      onChange={handleTestimonialChange}
                      rows="3"
                      placeholder="What they said about your project"
                    ></textarea>
                  </div>
                </div>
                
                <div className="testimonial-actions">
                  <button 
                    type="button" 
                    className="btn-outline"
                    onClick={addTestimonial}
                    disabled={!testimonialInput.name || !testimonialInput.text}
                  >
                    <FaPlus /> Add Testimonial
                  </button>
                </div>
              </div>
              
              {formData.testimonials.length > 0 ? (
                <div className="testimonials-list">
                  <h3>Added Testimonials</h3>
                  {formData.testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-item">
                      <div className="testimonial-content">
                        <blockquote>"{testimonial.text}"</blockquote>
                        <div className="testimonial-author">
                          <strong>{testimonial.name}</strong>
                          {testimonial.role && <span> - {testimonial.role}</span>}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn-icon delete" 
                        onClick={() => removeTestimonial(index)}
                        title="Remove testimonial"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No testimonials added yet</p>
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>{editMode ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <FaSave /> {editMode ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <style>{`
        /* Project Form Styles */
        :root {
          /* Primary Colors */
          --primary-color: #4f46e5;
          --primary-light: #818cf8;
          --primary-dark: #3730a3;
          
          /* Secondary Colors */
          --secondary-color: #10b981;
          --secondary-light: #34d399;
          --secondary-dark: #059669;
          
          /* Accent Colors */
          --accent-color: #f59e0b;
          --accent-light: #fbbf24;
          --accent-dark: #d97706;
          
          /* Neutral Colors */
          --white: #ffffff;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --black: #000000;
          
          /* Status Colors */
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --danger-color: #ef4444;
          --info-color: #3b82f6;
          
          /* UI Elements */
          --border-radius-sm: 0.25rem;
          --border-radius: 0.375rem;
          --border-radius-md: 0.5rem;
          --border-radius-lg: 0.75rem;
          --border-radius-xl: 1rem;
          --border-radius-full: 9999px;
          
          /* Shadows */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
          
          /* Transitions */
          --transition: all 0.3s ease;
          --transition-fast: all 0.15s ease;
        }
        
        /* Base Styles */
        .project-form-page {
          width: 940px;
          margin: 0 auto;
          margin-left: 1rem;
          padding: 1rem;
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          overflow-x: hidden;
        }
          
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .back-link svg {
          margin-right: 0.5rem;
        }
        
        .form-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        /* Form Progress */
        .form-progress-container {
          margin-bottom: 1.5rem;
        }
        
        .form-progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .form-progress-bar {
          height: 8px;
          background-color: var(--gray-200);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }
        
        .form-progress-value {
          height: 100%;
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          border-radius: var(--border-radius-full);
          transition: width 0.5s ease;
        }
        
        /* Form Navigation */
        .form-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--gray-400) transparent;
        }
        
        .form-navigation::-webkit-scrollbar {
          height: 4px;
        }
        
        .form-navigation::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .form-navigation::-webkit-scrollbar-thumb {
          background-color: var(--gray-400);
          border-radius: 2px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--gray-100);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: var(--gray-700);
          white-space: nowrap;
          transition: var(--transition-fast);
          border: 1px solid var(--gray-200);
        }
        
        .nav-item svg {
          margin-right: 0.5rem;
          font-size: 1rem;
        }
        
        .nav-item:hover {
          background-color: var(--gray-200);
        }
        
        .nav-item.active {
          background-color: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }
        
        /* Form Content */
        .form-content {
          margin-bottom: 2rem;
        }
        
        .project-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .form-section {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          scroll-margin-top: 2rem;
        }
        
        .form-section:hover {
          box-shadow: var(--shadow-md);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .section-header h2 svg {
          margin-right: 0.5rem;
          color: var(--primary-color);
        }
        
        .section-tip {
          display: flex;
          align-items: flex-start;
          background-color: var(--gray-50);
          padding: 0.75rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: var(--gray-700);
          max-width: 300px;
        }
        
        .section-tip svg {
          color: var(--accent-color);
          margin-right: 0.5rem;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }
        
        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        
        .form-grid.three-columns {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .form-grid.two-columns {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group.wide {
          grid-column: span 2;
        }
        
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }
        
        .required {
          color: var(--danger-color);
          margin-left: 0.25rem;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: var(--gray-800);
          background-color: var(--white);
          transition: var(--transition-fast);
          width: 100%;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: var(--danger-color);
        }
        
        .form-group input.error:focus,
        .form-group select.error:focus,
        .form-group textarea.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
        
        .error-message {
          color: var(--danger-color);
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
        }
        
        .error-message::before {
          content: "⚠️";
          margin-right: 0.25rem;
        }
        
        .field-tip {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
        
        .field-tip svg {
          margin-right: 0.25rem;
          font-size: 0.875rem;
          color: var(--info-color);
        }
        
        .character-count {
          font-size: 0.75rem;
          color: var(--gray-500);
          text-align: right;
          margin-top: 0.25rem;
        }
        
        /* Input with Icon */
        .input-with-icon {
          position: relative;
        }
        
        .input-with-icon .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: 1rem;
        }
        
        .input-with-icon input {
          padding-left: 2.5rem;
        }
        
        /* Input with Button */
        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-button input {
          flex: 1;
        }
        
        .add-btn {
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .add-btn:hover {
          background-color: var(--primary-dark);
        }
        
        .add-btn svg {
          margin-right: 0.25rem;
        }
        
        /* Tags Container */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .tag {
          display: flex;
          align-items: center;
          background-color: var(--primary-light);
          color: var(--white);
          padding: 0.25rem 0.5rem;
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .remove-tag {
          background: none;
          border: none;
          color: var(--white);
          margin-left: 0.25rem;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Checkbox */
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
          cursor: pointer;
        }
        
        /* Status Options */
        .status-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .status-option {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .status-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .status-label {
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--white);
          transition: var(--transition-fast);
          opacity: 0.7;
        }
        
        .status-option input[type="radio"]:checked + .status-label {
          opacity: 1;
          box-shadow: var(--shadow-sm);
        }
        
        .status-option input[type="radio"]:focus + .status-label {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px var(--primary-color);
        }
          /* Image Upload */
        .image-upload-area {
          border: 2px dashed var(--gray-300);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }
        
        .image-upload-area:hover {
          border-color: var(--primary-color);
          background-color: var(--gray-50);
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--gray-500);
        }
        
        .upload-placeholder svg {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--primary-color);
        }
        
        .upload-placeholder span {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .upload-placeholder p {
          font-size: 0.75rem;
          margin: 0;
        }
        
        .image-preview {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: var(--border-radius);
          overflow: hidden;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
          .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--white);
          opacity: 0;
          transition: var(--transition-fast);
        }
        
        .image-preview:hover .image-overlay {
          opacity: 1;
        }
        
        .image-overlay svg {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        /* Upload Progress */
        .upload-progress-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--white);
        }
        
        .upload-progress {
          width: 80%;
          height: 10px;
          background-color: var(--gray-300);
          border-radius: var(--border-radius-full);
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .upload-progress-bar {
          height: 100%;
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          border-radius: var(--border-radius-full);
          transition: width 0.3s ease;
        }
        
        .upload-progress-text {
          display: flex;
          align-items: center;
          margin-top: 10px;
          font-size: 0.875rem;
        }
        
        .upload-progress-text .spinner {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 1rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-500);
          font-size: 0.875rem;
          margin-top: 0.75rem;
        }
        
        /* Testimonials */
        .testimonial-form {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .testimonial-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .testimonials-list {
          margin-top: 1.5rem;
        }
        
        .testimonials-list h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--gray-800);
        }
        
        .testimonial-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          margin-bottom: 0.75rem;
        }
        
        .testimonial-content {
          flex: 1;
        }
        
        .testimonial-content blockquote {
          margin: 0 0 0.5rem 0;
          font-style: italic;
          color: var(--gray-800);
          font-size: 0.875rem;
        }
        
        .testimonial-author {
          font-size: 0.75rem;
          color: var(--gray-600);
        }
        
        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }
        
        .btn-primary {
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-primary:hover {
          background-color: var(--primary-dark);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-primary svg {
          margin-right: 0.5rem;
        }
        
        .btn-secondary {
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-secondary:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .btn-secondary svg {
          margin-right: 0.5rem;
        }
        
        .btn-outline {
          background-color: transparent;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          border-radius: var(--border-radius);
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-outline:hover {
          background-color: rgba(79, 70, 229, 0.1);
        }
        
        .btn-outline:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-outline svg {
          margin-right: 0.5rem;
        }
        
        .btn-icon {
          width: 2rem;
          height: 2rem;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .btn-icon:hover {
          background-color: var(--gray-100);
          color: var(--primary-color);
        }
        
        .btn-icon.delete {
          color: var(--danger-color);
        }
        
        .btn-icon.delete:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        /* Loading Spinner */
        .spinner-small {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Project Preview */
        .project-preview {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .preview-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0;
        }
        
        .preview-content {
          display: flex;
          flex-direction: column;
        }
        
        .preview-image {
          width: 100%;
          height: 300px;
          background-color: var(--gray-100);
          position: relative;
        }
        
        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .preview-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--gray-500);
        }
        
        .preview-image-placeholder svg {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .preview-main {
          padding: 2rem;
        }
        
        .preview-title-section {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .preview-title-section h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
          margin-right: 1rem;
        }
        
        .preview-featured-badge {
          background-color: var(--accent-color);
          color: var(--white);
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          margin-right: 0.75rem;
        }
        
        .preview-status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--white);
        }
        
        .status-completed {
          background-color: var(--success-color);
        }
        
        .status-in-progress {
          background-color: var(--warning-color);
        }
        
        .status-planning {
          background-color: var(--info-color);
        }
        
        .preview-description {
          margin-bottom: 2rem;
        }
        
        .preview-short-desc {
          font-size: 1.125rem;
          color: var(--gray-700);
          line-height: 1.6;
        }
        
        .preview-tech {
          margin-bottom: 2rem;
        }
        
        .preview-tech h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .preview-tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .preview-tech-tag {
          background-color: var(--primary-light);
          color: var(--white);
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .preview-section {
          margin-bottom: 2rem;
        }
        
        .preview-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .preview-long-desc {
          color: var(--gray-700);
          line-height: 1.6;
        }
        
        .preview-metrics {
          margin-bottom: 2rem;
        }
        
        .preview-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .preview-metric-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .preview-metric-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--border-radius);
          background-color: var(--primary-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          margin-right: 1rem;
        }
        
        .preview-metric-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin: 0 0 0.25rem 0;
        }
        
        .preview-metric-content p {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .preview-columns {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .preview-column h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .preview-column h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 1rem 0 0.5rem 0;
        }
        
        .preview-column p {
          margin: 0 0 0.5rem 0;
          color: var(--gray-700);
        }
        
        .preview-roles-list {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          color: var(--gray-700);
        }
        
        .preview-testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .preview-testimonial {
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          border-left: 4px solid var(--primary-color);
        }
        
        .preview-testimonial blockquote {
          font-style: italic;
          color: var(--gray-800);
          margin: 0 0 1rem 0;
          line-height: 1.6;
        }
        
        .preview-testimonial-author p {
          margin: 0;
          color: var(--gray-700);
        }
        
        .preview-links {
          margin-top: 2rem;
        }
        
        .preview-links h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .preview-links-grid {
          display: flex;
          gap: 1rem;
        }
        
        .preview-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          border-radius: var(--border-radius);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .preview-link.github {
          background-color: #24292e;
          color: var(--white);
        }
        
        .preview-link.demo {
          background-color: var(--primary-color);
          color: var(--white);
        }
        
        .preview-link:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .preview-link svg {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }
        
        .preview-empty {
          color: var(--gray-500);
          font-style: italic;
          font-size: 0.875rem;
        }
        
        /* Loading Container */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(79, 70, 229, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }
        
        .loading-text {
          font-size: 1rem;
          color: var(--gray-700);
        }
        
        /* Responsive Styles */
        @media (max-width: 1024px) {
          .form-grid.three-columns {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .preview-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .project-form-page {
            padding: 1.5rem;
          }
          
          .form-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          
          .form-grid,
          .form-grid.three-columns,
          .form-grid.two-columns {
            grid-template-columns: 1fr;
          }
          
          .preview-columns {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .preview-links-grid {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .project-form-page {
            padding: 1rem;
          }
          
          .form-navigation {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
          }
          
          .nav-item {
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
          }
          
          .form-section {
            padding: 1rem;
          }
          
          .section-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .section-tip {
            max-width: 100%;
          }
          
          .preview-title-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .preview-title-section h1 {
            font-size: 1.5rem;
          }
          
          .preview-metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Dark Mode Styles */
        .dark-mode .project-form-page {
          background-color: #1a1a2e;
          color: #e6e6e6;
        }

        .dark-mode .form-header h1,
        .dark-mode .section-header h2 {
          color: #ffffff;
        }

        .dark-mode .back-link {
          color: #818cf8;
        }

        .dark-mode .back-link:hover {
          color: #a5b4fc;
        }

        .dark-mode .form-progress-container {
          background-color: #2a2a3c;
        }

        .dark-mode .form-progress-label {
          color: #d1d5db;
        }

        .dark-mode .form-progress-bar {
          background-color: #374151;
        }

        .dark-mode .nav-item {
          background-color: #2a2a3c;
          border-color: #374151;
          color: #d1d5db;
        }

        .dark-mode .nav-item:hover {
          background-color: #374151;
        }

        .dark-mode .nav-item.active {
          background-color: #4f46e5;
          color: #ffffff;
        }

        .dark-mode .form-content {
          background-color: #2a2a3c;
        }

        .dark-mode .form-section {
          border-color: #374151;
        }

        .dark-mode label {
          color: #d1d5db;
        }

        .dark-mode input[type="text"],
        .dark-mode input[type="url"],
        .dark-mode input[type="number"],
        .dark-mode input[type="date"],
        .dark-mode select,
        .dark-mode textarea {
          background-color: #1f2937;
          border-color: #374151;
          color: #e6e6e6;
        }

        .dark-mode input:focus,
        .dark-mode select:focus,
        .dark-mode textarea:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }

        .dark-mode .field-tip {
          color: #9ca3af;
        }

        .dark-mode .character-count {
          color: #9ca3af;
        }

        .dark-mode .input-icon {
          color: #9ca3af;
        }

        .dark-mode .add-btn {
          background-color: #4f46e5;
        }

        .dark-mode .add-btn:hover {
          background-color: #4338ca;
        }

        .dark-mode .tag {
          background-color: #4338ca;
        }

        .dark-mode .empty-state {
          background-color: #1f2937;
          color: #9ca3af;
        }

        .dark-mode .testimonial-item {
          background-color: #1f2937;
          border-left-color: #4f46e5;
        }

        .dark-mode .testimonial-content blockquote {
          color: #e6e6e6;
        }

        .dark-mode .testimonial-author {
          color: #9ca3af;
        }

        .dark-mode .form-actions {
          background-color: #1f2937;
          border-top-color: #374151;
        }

        .dark-mode .btn-primary {
          background-color: #4f46e5;
        }

        .dark-mode .btn-primary:hover {
          background-color: #4338ca;
        }

        .dark-mode .btn-secondary {
          background-color: #1f2937;
          color: #d1d5db;
          border-color: #374151;
        }

        .dark-mode .btn-secondary:hover {
          background-color: #374151;
        }

        .dark-mode .btn-outline {
          color: #818cf8;
          border-color: #818cf8;
        }

        .dark-mode .btn-outline:hover {
          background-color: rgba(129, 140, 248, 0.1);
        }

        .dark-mode .image-upload-area {
          border-color: #374151;
        }

        .dark-mode .upload-placeholder {
          color: #9ca3af;
        }

        .dark-mode .upload-placeholder span {
          color: #d1d5db;
        }

        .dark-mode .section-tip {
          background-color: #1f2937;
          color: #d1d5db;
        }

        .dark-mode .status-option input[type="radio"]:focus + .status-label {
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }

        /* Preview mode dark styles */
        .dark-mode .project-preview {
          background-color: #2a2a3c;
        }

        .dark-mode .preview-header {
          border-bottom-color: #374151;
        }

        .dark-mode .preview-header h2 {
          color: #ffffff;
        }

        .dark-mode .preview-image-placeholder {
          background-color: #1f2937;
          color: #9ca3af;
        }

        .dark-mode .preview-title-section h1 {
          color: #ffffff;
        }

        .dark-mode .preview-description p {
          color: #d1d5db;
        }

        .dark-mode .preview-tech h3,
        .dark-mode .preview-section h3 {
          color: #ffffff;
        }

        .dark-mode .preview-long-desc p {
          color: #d1d5db;
        }

        .dark-mode .preview-metric-card {
          background-color: #1f2937;
          border-color: #374151;
        }

        .dark-mode .preview-metric-content h4 {
          color: #d1d5db;
        }

        .dark-mode .preview-metric-content p {
          color: #ffffff;
        }

        .dark-mode .preview-column h4 {
          color: #e6e6e6;
        }

        .dark-mode .preview-column p {
          color: #d1d5db;
        }

        .dark-mode .preview-roles-list {
          color: #d1d5db;
        }

        .dark-mode .preview-testimonial {
          background-color: #1f2937;
        }

        .dark-mode .preview-testimonial blockquote {
          color: #e6e6e6;
        }

        .dark-mode .preview-testimonial-author {
          color: #9ca3af;
        }

        .dark-mode .preview-empty {
          color: #9ca3af;
        }

        /* Add transitions for smooth theme switching */
        .project-form-page,
        .form-header, .back-link, .form-progress-container,
        .form-progress-label, .form-progress-bar, .nav-item,
        .form-content, .form-section, label, input, select, textarea,
        .field-tip, .character-count, .input-icon, .add-btn,
        .tag, .empty-state, .testimonial-item, .testimonial-content,
        .testimonial-author, .form-actions, .btn-primary, .btn-secondary,
        .btn-outline, .image-upload-area, .upload-placeholder,
        .section-tip, .project-preview, .preview-header, .preview-image-placeholder,
        .preview-title-section h1, .preview-description p, .preview-tech h3,
        .preview-section h3, .preview-long-desc p, .preview-metric-card,
        .preview-metric-content h4, .preview-metric-content p, .preview-column h4,
        .preview-column p, .preview-roles-list, .preview-testimonial,
        .preview-testimonial blockquote, .preview-testimonial-author, .preview-empty {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ProjectForm;
