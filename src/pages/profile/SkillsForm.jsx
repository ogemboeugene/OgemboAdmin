import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTimes, 
  FaSave, 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaCode,
  FaSearch,
  FaFilter,
  FaStar,
  FaInfoCircle,
  FaGlobe,
  FaTools,
  FaDatabase,
  FaCogs,
  FaLaptopCode
} from 'react-icons/fa';
import apiService from '../../services/api/apiService';
import AddSkillModal from '../../components/modals/AddSkillModal';

const SkillsForm = () => {
  const navigate = useNavigate();
    // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);  const [lastSaved, setLastSaved] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
    // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState(null);
  
  // Refs for debouncing
  const autoSaveTimer = useRef(null);
  const suggestionTimer = useRef(null);
  
  // Form data
  const [formData, setFormData] = useState({
    skills: [],
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    platforms: []
  });
    // Input states
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [databaseInput, setDatabaseInput] = useState('');
  const [platformInput, setPlatformInput] = useState('');
  
  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState({});
  const [suggestionsCategory, setSuggestionsCategory] = useState(null);
  
  // Skill suggestions for each category
  const skillSuggestions = {
    skills: [
      'Leadership', 'Project Management', 'Problem Solving', 'Communication', 
      'Team Work', 'Critical Thinking', 'Time Management', 'Creativity',
      'Analytical Thinking', 'Decision Making', 'Adaptability', 'Mentoring'
    ],
    languages: [
      'JavaScript', 'Python', 'Java', 'C#', 'TypeScript', 'Go', 'Rust',
      'PHP', 'Ruby', 'Swift', 'Kotlin', 'C++', 'C', 'Scala', 'Dart'
    ],
    frameworks: [
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django',
      'Flask', 'Spring Boot', 'Laravel', '.NET Core', 'Next.js', 'Nuxt.js',
      'React Native', 'Flutter', 'Ionic', 'Svelte', 'Ember.js'
    ],
    tools: [
      'Git', 'Docker', 'Kubernetes', 'Jenkins', 'VS Code', 'IntelliJ IDEA',
      'Postman', 'Figma', 'Adobe XD', 'Slack', 'Jira', 'Confluence',
      'Webpack', 'Babel', 'ESLint', 'Prettier', 'npm', 'yarn'
    ],
    databases: [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
      'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
      'Elasticsearch', 'Neo4j', 'InfluxDB', 'CouchDB'
    ],
    platforms: [
      'AWS', 'Google Cloud', 'Azure', 'Heroku', 'Vercel', 'Netlify',
      'DigitalOcean', 'Linux', 'Windows', 'macOS', 'Android', 'iOS',
      'Shopify', 'WordPress', 'Salesforce'
    ]
  };
    // Skill level options
  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];
  // Helper functions moved to later in the file
    // Skill categories
  const categories = [
    { id: 'all', label: 'All Skills', icon: <FaCode /> },
    { id: 'skills', label: 'General Skills', icon: <FaStar /> },
    { id: 'languages', label: 'Languages', icon: <FaLaptopCode /> },
    { id: 'frameworks', label: 'Frameworks', icon: <FaCogs /> },
    { id: 'databases', label: 'Databases', icon: <FaDatabase /> },
    { id: 'tools', label: 'Tools', icon: <FaTools /> },
    { id: 'platforms', label: 'Platforms', icon: <FaGlobe /> }  ];

  // Fetch skills data from API
  useEffect(() => {
    const fetchSkillsData = async () => {
      setIsLoading(true);      try {
        const response = await apiService.skills.getAll();
        const skillsData = response.data.data; // Note: nested data structure
        
        console.log('📦 Raw API data:', skillsData);
        
        // Map proficiency levels from numbers to strings
        const mapProficiencyLevel = (level) => {
          switch (level) {
            case 1: return 'beginner';
            case 2: return 'intermediate';
            case 3: return 'advanced';
            case 4: return 'expert';
            default: return 'intermediate';
          }
        };        // Map API categories to component categories with intelligent name-based mapping
        const mapCategory = (apiCategory, skillName) => {
          // First, try direct category mapping
          const categoryMap = {
            'programming_language': 'languages',
            'language': 'languages',
            'framework': 'frameworks',
            'technical': 'frameworks', // Many technical skills are frameworks
            'tool': 'tools',
            'database': 'databases',
            'platform': 'platforms',
            'soft': 'skills', // Soft skills go to general skills
          };
          
          // If we have a direct mapping, use it
          if (categoryMap[apiCategory]) {
            return categoryMap[apiCategory];
          }
          
          // For 'other' and null categories, use intelligent name-based mapping
          const skillNameLower = skillName.toLowerCase();
          
          // Database keywords
          if (skillNameLower.includes('sql') || skillNameLower.includes('mongo') || 
              skillNameLower.includes('redis') || skillNameLower.includes('database')) {
            return 'databases';
          }
          
          // Platform/Cloud keywords
          if (skillNameLower.includes('aws') || skillNameLower.includes('azure') || 
              skillNameLower.includes('cloud') || skillNameLower.includes('heroku')) {
            return 'platforms';
          }
          
          // Programming language keywords
          if (skillNameLower.includes('script') || skillNameLower.includes('java') || 
              skillNameLower.includes('python') || skillNameLower.includes('type')) {
            return 'languages';
          }
          
          // Framework keywords
          if (skillNameLower.includes('.js') || skillNameLower.includes('react') || 
              skillNameLower.includes('vue') || skillNameLower.includes('express')) {
            return 'frameworks';
          }
          
          // Default to general skills for soft skills and unknown categories
          return 'skills';
        };
        
        // Transform and group skills by category
        const transformedData = {
          skills: [],
          languages: [],
          frameworks: [],
          tools: [],
          databases: [],
          platforms: []
        };
        
        // Process each skill from the API
        if (skillsData.skills && Array.isArray(skillsData.skills)) {
          skillsData.skills.forEach((skill, index) => {
            const transformedSkill = {
              id: skill.id || Date.now() + index,
              name: skill.name,
              level: mapProficiencyLevel(skill.proficiencyLevel),
              years: skill.yearsExperience || 1,
              description: skill.description || '',
              isNew: false
            };
            
            const targetCategory = mapCategory(skill.category, skill.name);
            
            // Check for duplicates in the target category
            const existsInCategory = transformedData[targetCategory].some(
              existingSkill => existingSkill.name.toLowerCase() === skill.name.toLowerCase()
            );
            
            if (!existsInCategory) {
              transformedData[targetCategory].push(transformedSkill);
            } else {
              // If duplicate, keep the one with higher proficiency
              const existingIndex = transformedData[targetCategory].findIndex(
                existingSkill => existingSkill.name.toLowerCase() === skill.name.toLowerCase()
              );
              
              if (existingIndex !== -1) {
                const existing = transformedData[targetCategory][existingIndex];
                const existingLevelValue = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[existing.level];
                const newLevelValue = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[transformedSkill.level];
                
                if (newLevelValue > existingLevelValue) {
                  transformedData[targetCategory][existingIndex] = transformedSkill;
                }
              }
            }
          });
        }
        
        console.log('🔄 Transformed data:', transformedData);
        
        setFormData(transformedData);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        setError('Failed to load skills data. Please try again.');
        
        // Initialize with empty data if API fails
        setFormData({
          skills: [],
          languages: [],
          frameworks: [],
          tools: [],
          databases: [],
          platforms: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkillsData();
  }, []);
  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!autoSaveEnabled || !isDirty || isSaving || isAutoSaving) return;
    
    setIsAutoSaving(true);
    
    try {
      // Use the same logic as handleSubmit for individual skill updates
      const skillsToSave = [];
      
      // Process each category
      Object.keys(formData).forEach(category => {
        formData[category].forEach(skill => {
          // Map form data to API format
          const skillData = {
            skill_name: skill.name,
            category: mapCategoryToAPI(category),
            proficiency_level: mapLevelToAPI(skill.level),
            years_of_experience: skill.years || 1,
            description: skill.description || '',
            is_featured: skill.isFeatured || false
          };
          
          skillsToSave.push({
            id: skill.id,
            isNew: skill.isNew,
            data: skillData
          });
        });
      });
      
      // Save skills individually
      const savePromises = skillsToSave.map(async (skill) => {
        if (skill.isNew) {
          // Create new skill
          return await apiService.skills.create(skill.data);
        } else {
          // Update existing skill
          return await apiService.skills.update(skill.id, skill.data);
        }
      });
      
      // Execute all save operations
      await Promise.all(savePromises);
      
      setIsDirty(false);
      setLastSaved(new Date());
      
      // Mark all skills as no longer new
      const updatedFormData = { ...formData };
      Object.keys(updatedFormData).forEach(category => {
        updatedFormData[category] = updatedFormData[category].map(skill => ({
          ...skill,
          isNew: false
        }));
      });
      setFormData(updatedFormData);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error for auto-save failures to avoid disrupting user
    } finally {
      setIsAutoSaving(false);
    }
  }, [autoSaveEnabled, isDirty, isSaving, isAutoSaving, formData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && isDirty) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, autoSaveEnabled, isDirty]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      if (suggestionTimer.current) {
        clearTimeout(suggestionTimer.current);
      }
    };
  }, []);

  // Handle page leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  // Helper function to map UI categories to API categories
  const mapCategoryToAPI = (category) => {
    const categoryMap = {
      'skills': 'soft',
      'languages': 'programming_language',
      'frameworks': 'framework',
      'tools': 'tool',
      'databases': 'database',
      'platforms': 'platform'
    };
    return categoryMap[category] || 'other';
  };

  // Helper function to map UI skill levels to API levels
  const mapLevelToAPI = (level) => {
    const levelMap = {
      'beginner': 'beginner',
      'intermediate': 'intermediate', 
      'advanced': 'advanced',
      'expert': 'expert'
    };
    return levelMap[level] || 'intermediate';
  };

  // Form validation
  const validateFormData = () => {
    const errors = [];
    
    // Check for duplicate skills across categories
    const allSkillNames = Object.values(formData).flat().map(skill => skill.name.toLowerCase());
    const duplicates = allSkillNames.filter((name, index) => allSkillNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate skills found: ${[...new Set(duplicates)].join(', ')}`);
    }
    
    // Check for invalid years
    Object.values(formData).flat().forEach(skill => {
      if (skill.years < 0 || skill.years > 50) {
        errors.push(`Invalid years of experience for ${skill.name}: ${skill.years}`);
      }
    });
    
    return errors;
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form data
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join('; ')}`);
        setIsSaving(false);
        return;
      }
      
      // Collect all skills that need to be saved
      const skillsToSave = [];
      
      // Process each category
      Object.keys(formData).forEach(category => {
        formData[category].forEach(skill => {
          // Map form data to API format
          const skillData = {
            skill_name: skill.name,
            category: mapCategoryToAPI(category),
            proficiency_level: mapLevelToAPI(skill.level),
            years_of_experience: skill.years || 1,
            description: skill.description || '',
            is_featured: skill.isFeatured || false
          };
          
          skillsToSave.push({
            id: skill.id,
            isNew: skill.isNew,
            data: skillData
          });
        });
      });
      
      // Save skills individually
      const savePromises = skillsToSave.map(async (skill) => {
        if (skill.isNew) {
          // Create new skill
          return await apiService.skills.create(skill.data);
        } else {
          // Update existing skill
          return await apiService.skills.update(skill.id, skill.data);
        }
      });
      
      // Execute all save operations
      await Promise.all(savePromises);
      
      // Success
      setSuccess('Skills updated successfully!');
      setIsDirty(false);
      setLastSaved(new Date());
      
      // Mark all skills as no longer new
      const updatedFormData = { ...formData };
      Object.keys(updatedFormData).forEach(category => {
        updatedFormData[category] = updatedFormData[category].map(skill => ({
          ...skill,
          isNew: false
        }));
      });
      setFormData(updatedFormData);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving skills:', error);
      
      let errorMessage = 'Failed to save skills. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'You are not authorized to update skills. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to update skills.';
            break;
          case 422:
            errorMessage = 'Invalid skill data provided. Please check your entries.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Failed to save skills'}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  // Add skill item with validation
  const addSkillItem = (category, input, setInput) => {
    console.log('🔍 addSkillItem called with:', { category, input, setInput: !!setInput });
    
    if (!input.trim()) {
      console.log('❌ Empty input detected');
      setError('Please enter a skill name.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (input.trim().length < 2) {
      console.log('❌ Input too short:', input.trim().length);
      setError('Skill name must be at least 2 characters long.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (input.trim().length > 50) {
      console.log('❌ Input too long:', input.trim().length);
      setError('Skill name must be less than 50 characters.');
      setTimeout(() => setError(null), 3000);
      return;
    }
      const exists = formData[category].some(
      item => item.name.toLowerCase() === input.trim().toLowerCase()
    );
    
    console.log('🔍 Checking for duplicates:', { 
      category, 
      input: input.trim(), 
      exists, 
      existingSkills: formData[category]?.map(s => s.name) 
    });
    
    if (!exists) {
      const newSkill = {
        id: Date.now(),
        name: input.trim(),
        level: 'intermediate',
        years: 1,
        isNew: true
      };
      
      console.log('✅ Adding new skill:', newSkill);
      
      setFormData(prev => ({
        ...prev,
        [category]: [...prev[category], newSkill]
      }));
      
      setInput('');
      setIsDirty(true);
      setError(null);
      
      console.log('✅ Skill added successfully');
    } else {
      console.log('❌ Duplicate skill detected');
      setError(`"${input.trim()}" already exists in ${category}. Please use a different name.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Remove skill item
  const removeSkillItem = async (category, index) => {
    const skillToRemove = formData[category][index];
    
    try {
      if (skillToRemove.id && !skillToRemove.isNew) {
        await apiService.skills.delete(skillToRemove.id);
      }
      
      setFormData(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
      
      setIsDirty(true);
      
      if (skillToRemove.id && !skillToRemove.isNew) {
        setSuccess(`${skillToRemove.name} removed successfully!`);
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      setError(`Failed to remove ${skillToRemove.name}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Update skill level
  const updateSkillLevel = (category, index, level) => {
    const updatedItems = [...formData[category]];
    updatedItems[index] = {
      ...updatedItems[index],
      level
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: updatedItems
    }));
    
    setIsDirty(true);
  };

  // Update skill years with validation
  const updateSkillYears = (category, index, years) => {
    const yearValue = parseInt(years) || 0;
    
    if (yearValue < 0) {
      setError('Years of experience cannot be negative.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (yearValue > 50) {
      setError('Years of experience cannot exceed 50 years.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const updatedItems = [...formData[category]];
    updatedItems[index] = {
      ...updatedItems[index],
      years: yearValue
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: updatedItems
    }));
    
    setIsDirty(true);
    setError(null);
  };

  // Get level badge color
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'var(--info-color)';
      case 'intermediate':
        return 'var(--warning-color)';
      case 'advanced':
        return 'var(--secondary-color)';
      case 'expert':
        return 'var(--primary-color)';
      default:
        return 'var(--gray-500)';
    }
  };

  // Filter skills based on search query and active category
  const getFilteredSkills = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query && activeCategory === 'all') {
      return formData;
    }
    
    const filtered = {};
    
    Object.keys(formData).forEach(category => {
      if (activeCategory === 'all' || activeCategory === category) {
        filtered[category] = formData[category].filter(
          item => item.name.toLowerCase().includes(query)
        );
      } else {
        filtered[category] = [];
      }
    });
    
    return filtered;
  };

  // Check if any category has items after filtering
  const hasFilteredItems = (filteredData) => {
    return Object.values(filteredData).some(category => category.length > 0);
  };

  // Get total skills count
  const getTotalSkillsCount = () => {
    return Object.values(formData).reduce(
      (total, category) => total + category.length, 0
    );
  };

  // Get average skill level
  const getAverageSkillLevel = () => {
    const allSkills = Object.values(formData).flat();
    if (allSkills.length === 0) return 'No skills';
    
    const levelValues = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const totalLevels = allSkills.reduce((sum, skill) => sum + (levelValues[skill.level] || 2), 0);
    const average = totalLevels / allSkills.length;
    
    if (average <= 1.5) return 'Beginner';
    if (average <= 2.5) return 'Intermediate';
    if (average <= 3.5) return 'Advanced';
    return 'Expert';
  };
  // Get total years of experience
  const getTotalExperience = () => {
    const allSkills = Object.values(formData).flat();
    return allSkills.reduce((total, skill) => Math.max(total, skill.years || 0), 0);
  };

  // Get input state and setter for category
  const getCategoryInput = (categoryId) => {
    switch (categoryId) {
      case 'skills': return { input: skillInput, setInput: setSkillInput };
      case 'languages': return { input: languageInput, setInput: setLanguageInput };
      case 'frameworks': return { input: frameworkInput, setInput: setFrameworkInput };
      case 'tools': return { input: toolInput, setInput: setToolInput };
      case 'databases': return { input: databaseInput, setInput: setDatabaseInput };
      case 'platforms': return { input: platformInput, setInput: setPlatformInput };
      default: return { input: '', setInput: () => {} };
    }
  };

  // Get category display name and placeholder
  const getCategoryInfo = (categoryId) => {
    const categoryMap = {
      skills: { name: 'General Skills', placeholder: 'Add a new skill...', icon: <FaStar /> },
      languages: { name: 'Programming Languages', placeholder: 'Add a programming language...', icon: <FaLaptopCode /> },
      frameworks: { name: 'Frameworks & Libraries', placeholder: 'Add a framework or library...', icon: <FaCogs /> },
      tools: { name: 'Tools & Software', placeholder: 'Add a tool or software...', icon: <FaTools /> },
      databases: { name: 'Databases', placeholder: 'Add a database...', icon: <FaDatabase /> },
      platforms: { name: 'Platforms & Services', placeholder: 'Add a platform or service...', icon: <FaGlobe /> }
    };
    
    return categoryMap[categoryId] || { name: categoryId, placeholder: `Add a new ${categoryId}...`, icon: <FaCode /> };
  };

  // Get filtered suggestions based on input  // Get filtered suggestions based on input with debouncing
  const getFilteredSuggestions = useCallback((categoryId, input) => {
    if (!input.trim() || input.length < 2) return [];
    
    const suggestions = skillSuggestions[categoryId] || [];
    const existingSkills = formData[categoryId].map(skill => skill.name.toLowerCase());
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase()) &&
      !existingSkills.includes(suggestion.toLowerCase())
    ).slice(0, 5);
  }, [formData]);

  // Debounced suggestion handler
  const debouncedSuggestions = useCallback((categoryId, input) => {
    if (suggestionTimer.current) {
      clearTimeout(suggestionTimer.current);
    }
    
    suggestionTimer.current = setTimeout(() => {
      if (input.trim().length >= 2) {
        setShowSuggestions(prev => ({ ...prev, [categoryId]: true }));
        setSuggestionsCategory(categoryId);
      } else {
        setShowSuggestions(prev => ({ ...prev, [categoryId]: false }));
        setSuggestionsCategory(null);
      }
    }, 300); // 300ms debounce
  }, []);  // Handle suggestion click
  const handleSuggestionClick = (categoryId, suggestion) => {
    const { setInput } = getCategoryInput(categoryId);
    setInput(suggestion);
    setShowSuggestions(prev => ({ ...prev, [categoryId]: false }));
    setSuggestionsCategory(null);
  };

  // Export skills to JSON file
  const handleExportSkills = () => {
    try {
      const exportData = {
        skills: formData,
        metadata: {
          exportDate: new Date().toISOString(),
          totalSkills: getTotalSkillsCount(),
          averageLevel: getAverageSkillLevel(),
          totalExperience: getTotalExperience(),
          version: '1.0'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skills-export-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setSuccess('Skills exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export skills. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Import skills from JSON file
  const handleImportSkills = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please select a valid JSON file.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data structure
        if (!importData.skills || typeof importData.skills !== 'object') {
          throw new Error('Invalid file format. Expected skills data not found.');
        }

        // Validate that all required categories exist
        const requiredCategories = ['skills', 'languages', 'frameworks', 'tools', 'databases', 'platforms'];
        const validImportData = {};
        
        requiredCategories.forEach(category => {
          if (Array.isArray(importData.skills[category])) {
            // Validate each skill object
            validImportData[category] = importData.skills[category].filter(skill => {
              return skill && 
                     typeof skill.name === 'string' && 
                     skill.name.trim().length > 0 &&
                     ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level) &&
                     typeof skill.years === 'number' &&
                     skill.years >= 0;
            }).map((skill, index) => ({
              ...skill,
              id: Date.now() + index,
              isNew: true
            }));
          } else {
            validImportData[category] = [];
          }
        });

        // Show confirmation dialog
        const totalImportSkills = Object.values(validImportData).reduce(
          (total, category) => total + category.length, 0
        );

        if (totalImportSkills === 0) {
          setError('No valid skills found in the import file.');
          setTimeout(() => setError(null), 3000);
          return;
        }

        const confirmImport = window.confirm(
          `Import ${totalImportSkills} skills? This will replace your current skills data.`
        );

        if (confirmImport) {
          setFormData(validImportData);
          setIsDirty(true);
          setSuccess(`Successfully imported ${totalImportSkills} skills!`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (error) {
        console.error('Import failed:', error);
        setError(`Failed to import skills: ${error.message}`);
        setTimeout(() => setError(null), 3000);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
      setTimeout(() => setError(null), 3000);
    };

    reader.readAsText(file);
      // Reset file input
    event.target.value = '';
  };
  // Modal handlers
  const handleAddSkillClick = (categoryId = null) => {
    setPreselectedCategory(categoryId);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setPreselectedCategory(null);
  };

  const handleSkillAdded = (newSkill) => {
    // Map API category to form category if needed
    const categoryMap = {
      'programming_language': 'languages',
      'language': 'languages',
      'framework': 'frameworks',
      'technical': 'frameworks',
      'tool': 'tools',
      'database': 'databases',
      'platform': 'platforms',
      'soft': 'skills',
      'other': 'skills'
    };

    const targetCategory = categoryMap[newSkill.category] || newSkill.category || 'skills';

    // Create skill object in the format expected by the form
    const skillToAdd = {
      id: Date.now(),
      name: newSkill.name,
      level: newSkill.proficiencyLevel === 1 ? 'beginner' :
             newSkill.proficiencyLevel === 2 ? 'intermediate' :
             newSkill.proficiencyLevel === 3 ? 'advanced' : 'expert',
      years: newSkill.yearsExperience || 1,
      isFeatured: newSkill.isFeatured || false,
      isNew: true
    };

    // Add to the appropriate category
    setFormData(prev => ({
      ...prev,
      [targetCategory]: [...(prev[targetCategory] || []), skillToAdd]
    }));

    // Mark as dirty for save indication
    setIsDirty(true);

    // Close modal and show success message
    setIsAddModalOpen(false);
    setSuccess(`Successfully added "${newSkill.name}" to ${targetCategory}`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Render skill section
  const renderSkillSection = (categoryId) => {
    const { input, setInput } = getCategoryInput(categoryId);
    const categoryInfo = getCategoryInfo(categoryId);
    const filteredSkills = getFilteredSkills();
    const skills = filteredSkills[categoryId] || [];
    const filteredSuggestions = getFilteredSuggestions(categoryId, input);

    return (
      <div key={categoryId} className="skills-section">
        <div className="section-header">
          <h2>
            {categoryInfo.icon}
            {categoryInfo.name}
          </h2>          <div className="skill-input-container">
            <div className="input-with-suggestions">              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setIsDirty(true);
                  debouncedSuggestions(categoryId, e.target.value);
                }}
                placeholder={categoryInfo.placeholder}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillItem(categoryId, input, setInput);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSuggestions(prev => ({ ...prev, [categoryId]: false }));
                    setSuggestionsCategory(null);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSuggestions(prev => ({ ...prev, [categoryId]: false }));
                  }, 200);
                }}
                aria-label={`Add new ${categoryInfo.name.toLowerCase()}`}
                aria-expanded={showSuggestions[categoryId] || false}
                aria-autocomplete="list"
                role="combobox"
              />              {showSuggestions[categoryId] && input.length >= 2 && (
                <div 
                  className="suggestions-dropdown" 
                  role="listbox"
                  aria-label={`Suggestions for ${categoryInfo.name.toLowerCase()}`}
                >
                  {getFilteredSuggestions(categoryId, input).map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(categoryId, suggestion)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSuggestionClick(categoryId, suggestion);
                        }
                      }}
                      role="option"
                      tabIndex={0}
                      aria-selected={false}
                    >
                      {suggestion}
                    </div>
                  ))}
                  {getFilteredSuggestions(categoryId, input).length === 0 && (
                    <div className="no-suggestions" role="status">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>            <div className="add-skill-buttons">
              <button
                type="button"
                className="add-skill-btn"
                onClick={() => {
                  console.log('🎯 Add button clicked for category:', categoryId, 'input:', input);
                  addSkillItem(categoryId, input, setInput);
                }}
                title="Add skill from input"
              >
                <FaPlus /> Add
              </button>
              <button
                type="button"
                className="add-skill-btn add-skill-btn--modal"
                onClick={() => handleAddSkillClick(categoryId)}
                title="Add skill via modal"
              >
                <FaPlus /> Add via Modal
              </button>
            </div>
          </div>
        </div>
        
        <div className="skills-list">
          {skills.length === 0 ? (
            <div className="empty-skills">
              <p>
                {searchQuery 
                  ? `No ${categoryInfo.name.toLowerCase()} match your search criteria.` 
                  : `No ${categoryInfo.name.toLowerCase()} added yet. Add your first one!`}
              </p>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <motion.div 
                  key={`${categoryId}-${index}`}
                  className="skill-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="skill-header">
                    <h3>{skill.name}</h3>
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => removeSkillItem(categoryId, index)}
                      aria-label={`Remove ${skill.name}`}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="skill-details">
                    <div className="skill-level">
                      <label>Proficiency:</label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(categoryId, index, e.target.value)}
                      >
                        {skillLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      <div 
                        className="level-indicator" 
                        style={{ backgroundColor: getLevelColor(skill.level) }}
                      >
                        {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                      </div>
                    </div>
                    
                    <div className="skill-years">
                      <label>Years of Experience:</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.years}
                        onChange={(e) => updateSkillYears(categoryId, index, e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions[categoryId] && filteredSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            <ul>
              {filteredSuggestions.map(suggestion => (
                <li 
                  key={suggestion} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(categoryId, suggestion, setInput)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading skills data...</p>
      </div>
    );
  }

  const filteredSkills = getFilteredSkills();

  return (
    <div className="skills-form-container">
      <div className="skills-form-header">
        <div className="header-left">
          <Link to="/profile" className="back-link">
            <FaArrowLeft className="back-icon" /> Back to Profile
          </Link>
          <div className="title-section">
            <h1 className="page-title">Manage Skills</h1>            <p className="header-description">
              Add and manage your technical skills, programming languages, frameworks, databases, tools, and platforms
            </p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item primary">
            <div className="stat-icon">
              <FaCode />
            </div>
            <div className="stat-info">
              <span className="stat-value">{getTotalSkillsCount()}</span>
              <span className="stat-label">Total Skills</span>
            </div>
          </div>
          <div className="stat-item secondary">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{getAverageSkillLevel()}</span>
              <span className="stat-label">Average Level</span>
            </div>
          </div>
          <div className="stat-item tertiary">
            <div className="stat-icon">
              <FaTools />
            </div>
            <div className="stat-info">
              <span className="stat-value">{getTotalExperience()}+</span>
              <span className="stat-label">Max Experience (Years)</span>
            </div>          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-left">
          <div className="auto-save-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                aria-label="Enable auto-save"
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="control-label">Auto-save</span>
            {isAutoSaving && <span className="auto-save-indicator">Saving...</span>}
            {lastSaved && (
              <span className="last-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
          <div className="controls-right">
          <div className="import-export-controls">
            <button
              type="button"
              className="btn-primary add-skill-btn"
              onClick={handleAddSkillClick}
              title="Add a new skill"
            >
              <FaPlus /> Add Skill
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportSkills}
              title="Export skills to JSON file"
            >
              Export Skills
            </button>
            <label className="btn-secondary file-input-label">
              Import Skills
              <input
                type="file"
                accept=".json"
                onChange={handleImportSkills}
                style={{ display: 'none' }}
                aria-label="Import skills from JSON file"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              <FaTimes />
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheckCircle />
            <p>{success}</p>
            <button onClick={() => setSuccess(null)} aria-label="Dismiss success message">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="skills-toolbar">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div className="toolbar-settings">
              <div className="auto-save-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  Auto-save
                </label>
                {lastSaved && (
                  <span className="last-saved">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="category-filter">
              <FaFilter className="filter-icon" />
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span>{category.label}</span>
                    {category.id !== 'all' && formData[category.id]?.length > 0 && (
                      <span className="category-count">{formData[category.id].length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>        <div className="skills-sections">
          {/* Render skill sections based on active category */}
          {(activeCategory === 'all') ? (
            // Show all categories
            Object.keys(formData).map(categoryId => renderSkillSection(categoryId))
          ) : (
            // Show only selected category
            renderSkillSection(activeCategory)
          )}

          {/* No Results Message */}
          {searchQuery && !hasFilteredItems(filteredSkills) && (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <h3>No skills found</h3>
              <p>No skills match your search criteria "{searchQuery}"</p>
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <div className="action-info">
            {isDirty && (
              <span className="unsaved-changes">
                <FaInfoCircle /> You have unsaved changes
              </span>
            )}
          </div>
          
          <div className="action-buttons">
            <Link to="/profile" className="cancel-btn">
              <FaTimes /> Cancel
            </Link>
            
            <button 
              type="submit" 
              className="save-btn" 
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <>
                  <div className="button-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Skills
                </>
              )}
            </button>
          </div>
        </div>
      </form>      <style jsx>{`
        /* CSS Variables for Theme Support */
        :root {
          --skills-primary: #3b82f6;
          --skills-primary-dark: #2563eb;
          --skills-primary-light: #dbeafe;
          --skills-secondary: #10b981;
          --skills-secondary-dark: #059669;
          --skills-secondary-light: #d1fae5;
          --skills-warning: #f59e0b;
          --skills-warning-light: #fef3c7;
          --skills-error: #ef4444;
          --skills-error-light: #fee2e2;
          --skills-success: #10b981;
          --skills-success-light: #d1fae5;
          --skills-info: #06b6d4;
          --skills-info-light: #cffafe;
          
          /* Light Theme Colors */
          --skills-bg-primary: #ffffff;
          --skills-bg-secondary: #f8fafc;
          --skills-bg-tertiary: #f1f5f9;
          --skills-bg-quaternary: #e2e8f0;
          --skills-bg-overlay: rgba(255, 255, 255, 0.95);
          
          --skills-text-primary: #1e293b;
          --skills-text-secondary: #475569;
          --skills-text-tertiary: #64748b;
          --skills-text-quaternary: #94a3b8;
          --skills-text-inverse: #ffffff;
          
          --skills-border-primary: #e2e8f0;
          --skills-border-secondary: #cbd5e1;
          --skills-border-focus: #3b82f6;
          
          --skills-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --skills-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --skills-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --skills-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          
          --skills-gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --skills-gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --skills-gradient-tertiary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        /* Dark Theme Support */
        [data-theme="dark"], .dark-mode {
          --skills-bg-primary: #0f172a;
          --skills-bg-secondary: #1e293b;
          --skills-bg-tertiary: #334155;
          --skills-bg-quaternary: #475569;
          --skills-bg-overlay: rgba(15, 23, 42, 0.95);
          
          --skills-text-primary: #f8fafc;
          --skills-text-secondary: #e2e8f0;
          --skills-text-tertiary: #cbd5e1;
          --skills-text-quaternary: #94a3b8;
          --skills-text-inverse: #1e293b;
          
          --skills-border-primary: #334155;
          --skills-border-secondary: #475569;
          --skills-border-focus: #60a5fa;
          
          --skills-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --skills-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          --skills-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
          --skills-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        }

        /* Auto-detect dark mode */
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --skills-bg-primary: #0f172a;
            --skills-bg-secondary: #1e293b;
            --skills-bg-tertiary: #334155;
            --skills-bg-quaternary: #475569;
            --skills-bg-overlay: rgba(15, 23, 42, 0.95);
            
            --skills-text-primary: #f8fafc;
            --skills-text-secondary: #e2e8f0;
            --skills-text-tertiary: #cbd5e1;
            --skills-text-quaternary: #94a3b8;
            --skills-text-inverse: #1e293b;
            
            --skills-border-primary: #334155;
            --skills-border-secondary: #475569;
            --skills-border-focus: #60a5fa;
            
            --skills-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
            --skills-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
            --skills-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
            --skills-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
          }
        }

        /* Main Container */
        .skills-form-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--skills-bg-primary);
          border-radius: 16px;
          box-shadow: var(--skills-shadow-xl);
          border: 1px solid var(--skills-border-primary);
          transition: all 0.3s ease;
          min-height: 80vh;
        }

        .skills-form-container:hover {
          box-shadow: var(--skills-shadow-xl), 0 0 0 1px var(--skills-primary-light);
        }

        /* Header Section */
        .skills-form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3rem;
          gap: 2rem;
          position: relative;
        }

        .skills-form-header::after {
          content: '';
          position: absolute;
          bottom: -1.5rem;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--skills-primary), transparent);
        }

        .header-left {
          flex: 1;
          position: relative;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--skills-primary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: var(--skills-primary-light);
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .back-link:hover {
          color: var(--skills-primary-dark);
          background: var(--skills-primary-light);
          transform: translateX(-2px);
          box-shadow: var(--skills-shadow-md);
        }

        .title-section h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--skills-text-primary);
          margin-bottom: 0.75rem;
          background: var(--skills-gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .header-description {
          color: var(--skills-text-secondary);
          font-size: 1.125rem;
          line-height: 1.6;
          font-weight: 400;
          margin-bottom: 0;
        }

        /* Stats Section */
        .header-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--skills-bg-secondary);
          border-radius: 12px;
          box-shadow: var(--skills-shadow-md);
          border: 1px solid var(--skills-border-primary);
          min-width: 140px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient);
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--skills-shadow-lg);
        }

        .stat-item.primary {
          --gradient: var(--skills-gradient-primary);
        }

        .stat-item.secondary {
          --gradient: var(--skills-gradient-secondary);
        }

        .stat-item.tertiary {
          --gradient: var(--skills-gradient-tertiary);
        }

        .stat-item.primary .stat-icon {
          color: var(--skills-primary);
          background: var(--skills-primary-light);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .stat-item.secondary .stat-icon {
          color: var(--skills-secondary);
          background: var(--skills-secondary-light);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .stat-item.tertiary .stat-icon {
          color: var(--skills-success);
          background: var(--skills-success-light);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .stat-icon {
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--skills-text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--skills-text-tertiary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Controls Section */
        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--skills-bg-secondary);
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--skills-border-primary);
          box-shadow: var(--skills-shadow-sm);
          backdrop-filter: blur(8px);
        }

        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .auto-save-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--skills-border-secondary);
          transition: 0.3s;
          border-radius: 14px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background: var(--skills-bg-primary);
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: var(--skills-shadow-sm);
        }

        input:checked + .toggle-slider {
          background: var(--skills-primary);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .control-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--skills-text-primary);
        }

        .auto-save-indicator {
          font-size: 0.75rem;
          color: var(--skills-success);
          animation: pulse 2s infinite;
          font-weight: 500;
        }

        .last-saved {
          font-size: 0.75rem;
          color: var(--skills-text-tertiary);
          font-weight: 400;
        }

        .import-export-controls {
          display: flex;
          gap: 0.75rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--skills-bg-tertiary);
          color: var(--skills-text-primary);
          border: 1px solid var(--skills-border-primary);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .control-btn:hover {
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }

        .file-input-label {
          cursor: pointer;
        }

        .file-input-label input[type="file"] {
          display: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Toolbar */
        .skills-toolbar {
          margin-bottom: 2.5rem;
        }

        .search-filter {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-box {
          position: relative;
          max-width: 500px;
        }

        .search-box input {
          width: 100%;
          padding: 1rem 3rem 1rem 3rem;
          border: 2px solid var(--skills-border-primary);
          border-radius: 12px;
          font-size: 1rem;
          background: var(--skills-bg-secondary);
          color: var(--skills-text-primary);
          transition: all 0.3s ease;
          font-weight: 400;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--skills-border-focus);
          box-shadow: 0 0 0 3px var(--skills-primary-light);
          background: var(--skills-bg-primary);
        }

        .search-box input::placeholder {
          color: var(--skills-text-quaternary);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--skills-text-tertiary);
          font-size: 1.125rem;
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: var(--skills-text-quaternary);
          border: none;
          color: var(--skills-bg-primary);
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .clear-search:hover {
          background: var(--skills-error);
          transform: translateY(-50%) scale(1.1);
        }

        .category-filter {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .filter-icon {
          color: var(--skills-text-tertiary);
          font-size: 1.25rem;
        }

        .category-tabs {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--skills-bg-secondary);
          border: 2px solid var(--skills-border-primary);
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          color: var(--skills-text-primary);
        }

        .category-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .category-tab:hover::before {
          left: 100%;
        }

        .category-tab:hover {
          background: var(--skills-bg-tertiary);
          transform: translateY(-2px);
          box-shadow: var(--skills-shadow-md);
        }

        .category-tab.active {
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          border-color: var(--skills-primary);
          box-shadow: var(--skills-shadow-md);
        }

        .category-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .category-tab:not(.active) .category-count {
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
        }

        /* Skills Sections */
        .skills-sections {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          margin-bottom: 3rem;
        }

        .skills-section {
          background: var(--skills-bg-secondary);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--skills-border-primary);
          box-shadow: var(--skills-shadow-md);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .skills-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--skills-gradient-primary);
        }

        .skills-section:hover {
          box-shadow: var(--skills-shadow-lg);
          transform: translateY(-2px);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--skills-text-primary);
          margin: 0;
        }

        .section-icon {
          color: var(--skills-primary);
          font-size: 1.25rem;
          padding: 0.5rem;
          background: var(--skills-primary-light);
          border-radius: 8px;
        }

        .skill-input-container {
          display: flex;
          gap: 0.75rem;
          max-width: 500px;
        }

        .input-with-suggestions {
          position: relative;
          flex: 1;
        }

        .skill-input-container input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--skills-border-primary);
          border-radius: 10px;
          font-size: 0.875rem;
          background: var(--skills-bg-primary);
          color: var(--skills-text-primary);
          transition: all 0.3s ease;
          font-weight: 400;
        }

        .skill-input-container input:focus {
          outline: none;
          border-color: var(--skills-border-focus);
          box-shadow: 0 0 0 3px var(--skills-primary-light);
        }

        .skill-input-container input::placeholder {
          color: var(--skills-text-quaternary);
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--skills-bg-primary);
          border: 1px solid var(--skills-border-primary);
          border-radius: 10px;
          box-shadow: var(--skills-shadow-lg);
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 0.25rem;
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          color: var(--skills-text-primary);
          border-bottom: 1px solid var(--skills-border-primary);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: var(--skills-bg-tertiary);
          color: var(--skills-primary);
          font-weight: 500;
        }

        .no-suggestions {
          padding: 0.75rem 1rem;
          color: var(--skills-text-tertiary);
          font-size: 0.875rem;
          font-style: italic;
          text-align: center;
        }

        .add-skill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: var(--skills-shadow-sm);
        }

        .add-skill-btn:hover {
          background: var(--skills-primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }        .add-skill-btn:active {
          transform: translateY(0);
        }

        .add-skill-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .add-skill-btn--modal {
          background: var(--skills-secondary);
          font-size: 0.8rem;
          padding: 0.75rem 1rem;
        }

        .add-skill-btn--modal:hover {
          background: var(--skills-secondary-dark);
        }

        /* Skills List */
        .empty-skills {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--skills-text-tertiary);
          background: var(--skills-bg-tertiary);
          border-radius: 12px;
          border: 2px dashed var(--skills-border-primary);
        }

        .empty-skills-icon {
          font-size: 3rem;
          color: var(--skills-text-quaternary);
          margin-bottom: 1rem;
        }

        .empty-skills h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--skills-text-secondary);
          font-weight: 600;
        }

        .empty-skills p {
          font-size: 0.875rem;
          color: var(--skills-text-tertiary);
          margin: 0;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .skill-item {
          background: var(--skills-bg-primary);
          border: 1px solid var(--skills-border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .skill-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--level-color, var(--skills-primary));
        }

        .skill-item:hover {
          box-shadow: var(--skills-shadow-lg);
          transform: translateY(-3px);
          border-color: var(--skills-primary-light);
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .skill-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--skills-text-primary);
          margin: 0;
          line-height: 1.4;
        }

        .remove-skill {
          background: var(--skills-bg-tertiary);
          border: none;
          color: var(--skills-text-tertiary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .remove-skill:hover {
          color: var(--skills-error);
          background: var(--skills-error-light);
          transform: scale(1.1);
        }

        .skill-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skill-level, .skill-years {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skill-level label, .skill-years label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--skills-text-secondary);
        }

        .skill-level select, .skill-years input {
          padding: 0.75rem;
          border: 2px solid var(--skills-border-primary);
          border-radius: 8px;
          font-size: 0.875rem;
          background: var(--skills-bg-secondary);
          color: var(--skills-text-primary);
          transition: all 0.3s ease;
        }

        .skill-level select:focus, .skill-years input:focus {
          outline: none;
          border-color: var(--skills-border-focus);
          box-shadow: 0 0 0 3px var(--skills-primary-light);
        }

        .level-indicator {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          color: var(--skills-text-inverse);
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .skill-years input {
          width: 120px;
        }

        /* Level Colors */
        .skill-item[data-level="beginner"] {
          --level-color: var(--skills-info);
        }

        .skill-item[data-level="intermediate"] {
          --level-color: var(--skills-warning);
        }

        .skill-item[data-level="advanced"] {
          --level-color: var(--skills-secondary);
        }

        .skill-item[data-level="expert"] {
          --level-color: var(--skills-primary);
        }

        .level-indicator[data-level="beginner"] {
          background: var(--skills-info);
        }

        .level-indicator[data-level="intermediate"] {
          background: var(--skills-warning);
        }

        .level-indicator[data-level="advanced"] {
          background: var(--skills-secondary);
        }

        .level-indicator[data-level="expert"] {
          background: var(--skills-primary);
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--skills-text-tertiary);
          background: var(--skills-bg-tertiary);
          border-radius: 12px;
          border: 2px dashed var(--skills-border-primary);
        }

        .no-results-icon {
          font-size: 4rem;
          color: var(--skills-text-quaternary);
          margin-bottom: 1.5rem;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--skills-text-secondary);
          font-weight: 600;
        }

        .no-results p {
          font-size: 1rem;
          color: var(--skills-text-tertiary);
          margin-bottom: 1.5rem;
        }

        .clear-search-btn {
          margin-top: 1rem;
          padding: 0.875rem 1.5rem;
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--skills-shadow-sm);
        }

        .clear-search-btn:hover {
          background: var(--skills-primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 0;
          border-top: 2px solid var(--skills-border-primary);
          margin-top: 2rem;
          background: var(--skills-bg-overlay);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem -2rem -2rem -2rem;
        }

        .action-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .unsaved-changes {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--skills-warning);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.75rem 1rem;
          background: var(--skills-warning-light);
          border-radius: 8px;
          border: 1px solid var(--skills-warning);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .cancel-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: var(--skills-bg-tertiary);
          color: var(--skills-text-primary);
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 2px solid var(--skills-border-primary);
        }

        .cancel-btn:hover {
          background: var(--skills-bg-quaternary);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--skills-shadow-sm);
        }

        .save-btn:hover:not(:disabled) {
          background: var(--skills-primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }        .save-btn:disabled {
          background: var(--skills-text-quaternary);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .add-skill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--skills-primary);
          color: var(--skills-text-inverse);
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--skills-shadow-sm);
          white-space: nowrap;
        }

        .add-skill-btn:hover {
          background: var(--skills-primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--skills-shadow-md);
        }

        .add-skill-btn:active {
          transform: translateY(0);
        }

        .button-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-radius: 50%;
          border-top-color: currentColor;
          animation: spin 1s linear infinite;
        }

        /* Loading Screen */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: var(--skills-text-secondary);
          background: var(--skills-bg-secondary);
          border-radius: 16px;
          padding: 3rem;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--skills-border-primary);
          border-radius: 50%;
          border-top-color: var(--skills-primary);
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        .loading-screen p {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--skills-text-secondary);
          margin: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Notification Banners */
        .error-banner, .success-banner {
          display: flex;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          gap: 1rem;
          font-weight: 500;
          border: 1px solid;
          backdrop-filter: blur(8px);
        }

        .error-banner {
          background: var(--skills-error-light);
          color: var(--skills-error);
          border-color: var(--skills-error);
        }

        .success-banner {
          background: var(--skills-success-light);
          color: var(--skills-success);
          border-color: var(--skills-success);
        }

        .error-banner button, .success-banner button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          margin-left: auto;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .error-banner button:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .success-banner button:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .skills-form-container {
            max-width: 100%;
            margin: 0 1rem;
          }

          .skills-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .skills-form-container {
            padding: 1.5rem;
            margin: 0 0.5rem;
          }

          .skills-form-header {
            flex-direction: column;
            gap: 1.5rem;
          }

          .header-stats {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }

          .stat-item {
            justify-content: center;
            min-width: auto;
          }

          .controls-section {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .controls-left, .controls-right {
            justify-content: center;
          }

          .search-filter {
            flex-direction: column;
          }

          .search-box {
            max-width: 100%;
          }

          .category-tabs {
            flex-wrap: wrap;
            justify-content: center;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .skill-input-container {
            max-width: 100%;
            flex-direction: column;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            padding: 1.5rem;
            margin: 2rem -1.5rem -1.5rem -1.5rem;
          }

          .action-buttons {
            justify-content: center;
            flex-direction: column;
          }

          .title-section h1 {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .skills-form-container {
            padding: 1rem;
          }

          .stat-item {
            padding: 1rem;
          }

          .skills-section {
            padding: 1.5rem;
          }

          .skill-item {
            padding: 1rem;
          }

          .category-tab {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }

          .form-actions {
            padding: 1rem;
            margin: 2rem -1rem -1rem -1rem;
          }
        }

        /* Print Styles */
        @media print {
          .skills-form-container {
            box-shadow: none;
            border: 1px solid #000;
          }

          .controls-section, .form-actions {
            display: none;
          }

          .skill-item {
            break-inside: avoid;
          }

          .skills-section {
            break-inside: avoid;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .skills-form-container {
            border: 2px solid;
          }

          .skill-item {
            border: 2px solid;
          }

          .category-tab {
            border: 2px solid;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus indicators for accessibility */
        .skill-input-container input:focus,
        .skill-level select:focus,
        .skill-years input:focus,
        .search-box input:focus,
        .toggle-switch input:focus + .toggle-slider,
        .category-tab:focus,
        .add-skill-btn:focus,
        .save-btn:focus,
        .cancel-btn:focus,
        .control-btn:focus {
          outline: 3px solid var(--skills-primary);
          outline-offset: 2px;        }      `}</style>      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSkillAdded={handleSkillAdded}
        existingSkills={formData}
        preselectedCategory={preselectedCategory}
      />
    </div>
  );
};

export default SkillsForm;
