import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaSave, 
  FaPlus, 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGlobe,
  FaCode,
  FaCog, 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaLanguage, 
  FaCamera, 
  FaCheck, 
  FaInfoCircle,
  FaFacebook,
  FaInstagram,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaYoutube,
  FaStackOverflow,
  FaCodepen,
  FaCalendarAlt,
  FaUserTag,
  FaIdCard,
  FaFileAlt,
  FaCloudUploadAlt,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import apiService from '../../services/api/apiService';
import firebaseStorageService from '../../services/firebase/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage on initial load
    return localStorage.getItem('profileFormActiveTab') || 'personal';
  });  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    title: '',
    bio: '',
    dob: '',
    gender: '',
    nationality: '',
    profileImage: '',
    coverImage: '',
    resume: '',
    
    // Professional Information
    currentPosition: '',
    currentCompany: '',
    yearsOfExperience: 0,
    hourlyRate: '',
    currency: 'USD',
    
    // Contact Information
    email: '',
    phone: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    
    // Social Links
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    dribbble: '',
    behance: '',
    medium: '',
    youtube: '',
    stackoverflow: '',
    codepen: '',
    
    // Skills & Languages
    skills: [],
    languages: [],
    
    // Preferences
    availability: '',
    jobType: [],
    remoteWork: false,
    relocation: false,
    visibilityPreference: 'public',
    
    // Settings
    theme: 'light',
    fontSize: 'medium',
    animationsEnabled: true,
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    showEmail: true,
    showPhone: true,
    allowSearchEngineIndexing: true,
    twoFactorEnabled: false,
    
    // Education & Experience (excluded for now)
    education: [],
    experience: []
  });
    const [isLoading, setIsLoading] = useState(true);  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('profileFormActiveTab', activeTab);
  }, [activeTab]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('intermediate');
  const [showLocationDetails, setShowLocationDetails] = useState(false);  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Resume management state
  const [resumes, setResumes] = useState([]);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
  const [showResumeDeleteConfirm, setShowResumeDeleteConfirm] = useState(null);
    const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const resumeRef = useRef(null);
    // Import useAuth hook
  const { refreshTokens } = useAuth();

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Call the actual profile API endpoint
        let response;
        try {
          response = await apiService.profile.get();
        } catch (error) {
          // Automatically handle 401 errors with token refresh
          if (error.response && error.response.status === 401) {
            console.log('🔑 Token expired, attempting refresh...');
            const refreshResult = await refreshTokens();
            
            if (refreshResult.success) {
              console.log('✅ Token refreshed, retrying profile fetch');
              response = await apiService.profile.get();
            } else {
              throw new Error('Token refresh failed. Please log in again.');
            }
          } else {
            throw error;
          }
        }
        
        console.log('Profile API response:', response);
        
        // Check if API call was successful
        if (response.data && response.data.success) {
          const userData = response.data.data.user;
          const profileData = userData.profile;
          const settingsData = userData.settings;
          
          // Transform API response to match component's form data structure
          // Helper function to parse social links from JSON string or object
          const parseSocialLinks = (profileData) => {
            try {
              if (typeof profileData?.socialLinks === 'string') {
                return JSON.parse(profileData.socialLinks);
              } else if (typeof profileData?.socialLinks === 'object') {
                return profileData.socialLinks;
              }
              return {};
            } catch (error) {
              console.warn('Failed to parse social links:', error);
              return {};
            }
          };
          
          const socialLinks = parseSocialLinks(profileData);
          
          // Helper function to extract address from nested object
          const extractAddress = (profileData) => {
            if (profileData?.address && typeof profileData.address === 'object') {
              return {
                address: profileData.address.street || '',
                city: profileData.address.city || '',
                state: profileData.address.state || '',
                country: profileData.address.country || '',
                zipCode: profileData.address.zipCode || ''
              };
            }
            return {
              address: profileData?.address || '',
              city: profileData?.city || '',
              state: profileData?.state || '',
              country: profileData?.country || '',
              zipCode: profileData?.zipCode || ''
            };
          };
          
          // Helper function to process resumes array to get primary resume
          const getPrimaryResume = (resumes) => {
            if (!resumes || !Array.isArray(resumes)) return '';
            const primaryResume = resumes.find(resume => resume.isPrimary) || resumes[0];
            return primaryResume?.url || '';
          };
          
          // Helper function to process job types
          const processJobTypes = (jobTypes) => {
            if (!jobTypes) return [];
            if (Array.isArray(jobTypes)) return jobTypes;            if (typeof jobTypes === 'string') {
              try {
                return JSON.parse(jobTypes);
              } catch (error) {
                return [jobTypes];
              }
            }
            return [];
          };
          
          // Helper function to map availability from backend to frontend
          const mapAvailabilityFromBackend = (availability) => {
            const mapping = {
              'Full_time': 'full-time',
              'Part_time': 'part-time',
              'Contract': 'contract',
              'Freelance': 'freelance',
              'Not_available': 'not-available'
            };
            return mapping[availability] || availability?.toLowerCase() || '';
          };
          
          // Helper function to map job types from backend to frontend
          const processJobTypesFromBackend = (jobTypes) => {
            const mapping = {
              'Permanent': 'permanent',
              'Contract': 'contract',
              'Freelance': 'freelance',
              'Internship': 'internship'
            };
            
            if (!jobTypes) return [];
            if (Array.isArray(jobTypes)) {
              return jobTypes.map(type => mapping[type] || type?.toLowerCase() || type);
            }
            if (typeof jobTypes === 'string') {              try {
                const parsed = JSON.parse(jobTypes);
                return Array.isArray(parsed) ? parsed.map(type => mapping[type] || type?.toLowerCase() || type) : [mapping[parsed] || parsed?.toLowerCase() || parsed];
              } catch (error) {
                return [mapping[jobTypes] || jobTypes?.toLowerCase() || jobTypes];
              }
            }
            return [];
          };
          
          console.log('🔍 Profile data from API:');
          console.log('profileData.dateOfBirth:', profileData?.dateOfBirth);
          console.log('profileData.gender:', profileData?.gender);
          console.log('profileData.nationality:', profileData?.nationality);
          console.log('profileData.address:', profileData?.address);
          console.log('profileData.resumes:', profileData?.resumes);
          console.log('profileData.languages:', profileData?.languages);
          console.log('profileData.jobTypes:', profileData?.jobTypes);
          
          const locationData = extractAddress(profileData);
          
          const data = {
            // Personal Information - comprehensive mapping
            name: `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim() || 
                 userData.email.split('@')[0],
            title: profileData?.title || profileData?.currentPosition || '',
            bio: profileData?.bio || '',
            dob: profileData?.dateOfBirth || '',
            gender: profileData?.gender || '',
            nationality: profileData?.nationality || '',
            profileImage: profileData?.avatar,
            coverImage: profileData?.coverImage || '/assets/cover.jpg',
            resume: getPrimaryResume(profileData?.resumes),
            
            // Professional Information
            currentPosition: profileData?.currentPosition || '',
            currentCompany: profileData?.currentCompany || '',
            yearsOfExperience: profileData?.yearsOfExperience || 0,
            hourlyRate: profileData?.hourlyRate || '',
            currency: profileData?.currency || 'USD',
            
            // Contact Information
            email: userData?.email || '',
            phone: profileData?.phone || '',
            location: locationData,
            
            // Social Links - comprehensive mapping
            website: socialLinks?.website || profileData?.website || '',
            github: socialLinks?.github || profileData?.githubProfile || '',
            linkedin: socialLinks?.linkedin || profileData?.linkedinProfile || '',
            twitter: socialLinks?.twitter || profileData?.twitterProfile || '',
            facebook: socialLinks?.facebook || profileData?.facebookProfile || '',
            instagram: socialLinks?.instagram || profileData?.instagramProfile || '',
            dribbble: socialLinks?.dribbble || profileData?.dribbbleProfile || '',
            behance: socialLinks?.behance || profileData?.behanceProfile || '',
            medium: socialLinks?.medium || profileData?.mediumProfile || '',
            youtube: socialLinks?.youtube || profileData?.youtubeProfile || '',
            stackoverflow: socialLinks?.stackoverflow || profileData?.stackoverflowProfile || '',
            codepen: socialLinks?.codepen || profileData?.codepenProfile || '',
            
            // Skills - map from the skills array with proper structure
            skills: profileData?.skills?.map(skill => ({
              name: skill.name,
              proficiencyLevel: skill.proficiencyLevel,
              category: skill.category,
              yearsExperience: skill.yearsExperience,
              isFeatured: skill.isFeatured
            })) || [],
            
            // Languages - handle both array and JSON string formats
            languages: Array.isArray(profileData?.languages)
              ? profileData.languages.map(lang => ({
                  name: lang.name,
                  proficiency: lang.proficiency
                }))
              : (profileData?.languages ? 
                  (typeof profileData.languages === 'string' ? 
                    JSON.parse(profileData.languages) : 
                    [profileData.languages]
                  ) : []),
            
            // Work Preferences - comprehensive mapping with proper format conversion
            availability: mapAvailabilityFromBackend(profileData?.availability || 'Full_time'),
            jobType: processJobTypesFromBackend(profileData?.jobTypes),
            remoteWork: profileData?.remoteWorkAvailable === true || profileData?.remoteWorkAvailable === 1,
            relocation: profileData?.openToRelocation === true || profileData?.openToRelocation === 1,
            
            // Profile Visibility
            visibilityPreference: profileData?.profileVisibility === 'public' ? 'public' : 
                                 (profileData?.profileVisibility === 'connections_only' ? 'connections' : 'private'),
            
            // Settings - map from settings object
            theme: settingsData?.theme || 'light',
            fontSize: settingsData?.fontSize || 'medium',
            animationsEnabled: settingsData?.animationsEnabled === 1,            notificationsEnabled: settingsData?.notificationsEnabled === 1,
            emailNotifications: settingsData?.emailNotifications === 1,
            pushNotifications: settingsData?.pushNotifications === 1,
            showEmail: settingsData?.showEmail === 1,
            showPhone: settingsData?.showPhone === 1,
            allowSearchEngineIndexing: settingsData?.allowSearchEngineIndexing === 1,
            twoFactorEnabled: settingsData?.twoFactorEnabled === 1,
            
            // Reference to related data collections
            education: userData?.education || [],
            experience: userData?.workExperiences || [],
            resumes: profileData?.resumes || []
          };

          setFormData(data);
          setResumes(profileData?.resumes || []);
          console.log('✅ Processed profile data with all fields:', data);
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        setErrors(prev => ({
          ...prev,
          general: 'Failed to load profile data. Please refresh the page.'
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'jobType' && type === 'checkbox') {
      // Handle multiple checkboxes for job type
      if (checked) {
        setFormData(prev => ({
          ...prev,
          jobType: [...prev.jobType, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          jobType: prev.jobType.filter(item => item !== value)
        }));
      }
    } else if (name.includes('.')) {
      // Handle nested objects like location.city
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setIsDirty(true);
  };
    // Handle skill input
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.some(skill => 
      (typeof skill === 'string' ? skill : skill.name) === skillInput.trim()
    )) {
      const newSkill = {
        name: skillInput.trim(),
        proficiencyLevel: 'intermediate',
        category: 'general',
        yearsExperience: 0,
        isFeatured: false
      };
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setSkillInput('');
      setIsDirty(true);
    }
  };
  
  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
    setIsDirty(true);
  };
  
  // Handle language input
  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.some(lang => lang.name === languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { 
          name: languageInput.trim(), 
          proficiency: languageProficiency 
        }]
      }));
      setLanguageInput('');
      setLanguageProficiency('intermediate');
      setIsDirty(true);
    }
  };
    const removeLanguage = (languageName) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.name !== languageName)
    }));
    setIsDirty(true);  };

  // Handle file uploads with Firebase Storage integration
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Clear any previous errors
    setErrors(prev => ({
      ...prev,
      [type]: ''
    }));
    
    try {
      // Validate file based on type
      if (type === 'profileImage' || type === 'coverImage') {
        // Image validation
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(file.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Image file size must be less than 5MB');
        }
      } else if (type === 'resume') {
        // Resume/CV validation
        const allowedResumeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedResumeTypes.includes(file.type)) {
          throw new Error('Please upload a valid resume file (PDF, DOC, DOCX)');
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for documents
          throw new Error('Resume file size must be less than 10MB');
        }
      }

      // Handle different file types
      if (type === 'profileImage') {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          // Step 1: Upload to Firebase Storage with progress tracking
          const firebaseUrl = await firebaseStorageService.uploadImage(
            file, 
            'profiles', // folder name
            null, // auto-generate filename
            (progress) => {
              setUploadProgress(progress);
            }
          );

          console.log('Firebase upload successful, URL:', firebaseUrl);
            
          // Step 2: Upload avatar via the dedicated avatar API endpoint
          // Send JSON with the Firebase URL
          const avatarData = { avatarUrl: firebaseUrl };
          
          const response = await apiService.profile.avatar.upload(avatarData);
        
          if (response.data && response.data.success) {
            // Update form data with the Firebase URL
            setFormData(prev => ({
              ...prev,
              profileImage: firebaseUrl
            }));
            
            setIsDirty(true);
            
            // Show success message
            setSuccessMessage('Profile image uploaded successfully!');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } else {
            // If API update fails, delete the uploaded image from Firebase
            await firebaseStorageService.deleteImage(firebaseUrl);
            throw new Error(response.data?.message || 'Failed to save avatar to database');
          }
        } catch (error) {
          console.error('Error in profile image upload:', error);
          throw error;
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
        
      } else if (type === 'coverImage') {
        // For cover image - create a local preview for now
        // Note: Cover image upload can be implemented similarly if needed
        const fileUrl = URL.createObjectURL(file);
        
        setFormData(prev => ({
          ...prev,
          coverImage: fileUrl
        }));
        
        setIsDirty(true);
        
        // Show temporary success message
        setSuccessMessage('Cover image updated (local preview)!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

      } else if (type === 'resume') {
        // Handle resume upload with Firebase Storage integration
        setResumeUploading(true);
        setResumeUploadProgress(0);
          try {
          // Step 1: Upload to Firebase Storage with progress tracking
          const firebaseUrl = await firebaseStorageService.uploadDocument(
            file, 
            'resumes', // folder name
            null, // auto-generate filename
            (progress) => {
              setResumeUploadProgress(progress);
            }
          );
            console.log('Firebase resume upload successful, URL:', firebaseUrl);
          
          // Step 2: Upload resume via the dedicated resume API endpoint
          // Send JSON data as expected by the backend API
          const resumeData = {
            resumeUrl: firebaseUrl,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            isPrimary: resumes.length === 0 // First resume becomes primary
          };
          
          const response = await apiService.profile.resume.upload(resumeData);
          
          if (response.data && response.data.success) {
            // Add new resume to the resumes list
            const newResume = {
              id: response.data.data.resumeId,
              url: firebaseUrl,
              fileName: file.name,
              fileSize: file.size,
              uploadDate: new Date().toISOString(),
              isPrimary: resumes.length === 0 // First resume becomes primary
            };
            
            setResumes(prev => [...prev, newResume]);
            
            // Update form data with the new resume if it's the first one
            if (resumes.length === 0) {
              setFormData(prev => ({
                ...prev,
                resume: firebaseUrl
              }));
            }
            
            setIsDirty(true);
            
            // Show success message
            setSuccessMessage('Resume uploaded successfully!');
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } else {
            // If API update fails, delete the uploaded file from Firebase
            await firebaseStorageService.deleteImage(firebaseUrl);
            throw new Error(response.data?.message || 'Failed to save resume to database');
          }
        } catch (error) {
          console.error('Error in resume upload:', error);
          throw error;
        } finally {
          setResumeUploading(false);
          setResumeUploadProgress(0);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [type]: error.message || `Failed to upload ${type.replace('Image', ' image')}. Please try again.`      }));
    }
  };

  // Resume management functions
  const handleDeleteResume = async (resumeId, resumeUrl) => {
      try {
        setIsUploading(true);
        
        // Step 1: Delete from API
        const response = await apiService.profile.resume.delete(resumeId);
        
        if (response.data && response.data.success) {
          // Step 2: Delete from Firebase Storage if it's a Firebase URL
          if (resumeUrl && resumeUrl.includes('firebase')) {
            await firebaseStorageService.deleteImage(resumeUrl);
          }
          
          // Step 3: Update local state
          setResumes(prev => {
            const updatedResumes = prev.filter(resume => resume.id !== resumeId);
            
            // If deleted resume was primary and there are other resumes, make the first one primary
            if (updatedResumes.length > 0) {
              const deletedResume = prev.find(resume => resume.id === resumeId);
              if (deletedResume?.isPrimary) {
                updatedResumes[0].isPrimary = true;
                // Set new primary resume
                handleSetPrimaryResume(updatedResumes[0].id);
              }
            }
            
            return updatedResumes;
          });
          
          // Update form data if this was the primary resume
          const deletedResume = resumes.find(resume => resume.id === resumeId);
          if (deletedResume?.isPrimary) {
            const remainingResumes = resumes.filter(resume => resume.id !== resumeId);
            setFormData(prev => ({
              ...prev,
              resume: remainingResumes.length > 0 ? remainingResumes[0].url : ''
            }));
          }
          
          setIsDirty(true);
          setSuccessMessage('Resume deleted successfully!');
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        } else {
          throw new Error(response.data?.message || 'Failed to delete resume');
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
        setErrors(prev => ({
          ...prev,
          resume: error.message || 'Failed to delete resume. Please try again.'
        }));
      } finally {
        setIsUploading(false);
        setShowResumeDeleteConfirm(null);
      }
    };
    
    const handleSetPrimaryResume = async (resumeId) => {
      try {
        const response = await apiService.profile.resume.setPrimary(resumeId);
        
        if (response.data && response.data.success) {
          // Update local state
          setResumes(prev => prev.map(resume => ({
            ...resume,
            isPrimary: resume.id === resumeId
          })));
          
          // Update form data with new primary resume
          const newPrimaryResume = resumes.find(resume => resume.id === resumeId);
          if (newPrimaryResume) {
            setFormData(prev => ({
              ...prev,
              resume: newPrimaryResume.url
            }));
          }
          
          setIsDirty(true);
          setSuccessMessage('Primary resume updated!');
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);        } else {
          throw new Error(response.data?.message || 'Failed to set primary resume');
        }
      } catch (error) {
        console.error('Error setting primary resume:', error);
        setErrors(prev => ({
          ...prev,
          resume: error.message || 'Failed to set primary resume. Please try again.'
        }));
      }
    };
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const formatUploadDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    // Handle profile image removal
  const handleRemoveProfileImage = async () => {
    try {
      if (!formData.profileImage) {
        return;
      }
      
      setIsUploading(true);
      
      // Step 1: Delete from Firebase Storage if it's a Firebase URL
      if (formData.profileImage.includes('firebase')) {
        await firebaseStorageService.deleteImage(formData.profileImage);
      }
      
      // Step 2: Remove avatar via the dedicated avatar API endpoint
      const response = await apiService.profile.avatar.remove();
      
      if (response.data && response.data.success) {
        // Update form data to remove the image
        setFormData(prev => ({
          ...prev,
          profileImage: ''
        }));
        
        setIsDirty(true);
        
        // Show success message
        setSuccessMessage('Profile image removed successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to remove avatar from database');
      }
    } catch (error) {
      console.error('Error removing profile image:', error);
      setErrors(prev => ({
        ...prev,
        profileImage: error.message || 'Failed to remove profile image. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = (ref) => {
    ref.current.click();
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // URL validations
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (formData.website && !urlRegex.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
      if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = 'Please enter a valid URL';
    }
    
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare data for API
      const [firstName, ...lastNameArr] = formData.name.trim().split(' ');
      const lastName = lastNameArr.join(' ');
      
      // Helper function to process skills for API submission
      const processSkillsForAPI = (skills) => {
        if (!Array.isArray(skills)) return [];
        return skills.map(skill => {
          if (typeof skill === 'string') {
            return {
              name: skill,
              proficiencyLevel: 'intermediate',
              category: 'general',
              yearsExperience: 0,
              isFeatured: false
            };
          }
          return {
            name: skill.name || skill,
            proficiencyLevel: skill.proficiencyLevel || 'intermediate',
            category: skill.category || 'general',
            yearsExperience: skill.yearsExperience || 0,
            isFeatured: skill.isFeatured || false
          };
        });
      };
      
      // Helper function to process languages for API submission
      const processLanguagesForAPI = (languages) => {
        if (!Array.isArray(languages)) return [];        return languages.map(lang => {
          if (typeof lang === 'string') {
            return {
              name: lang,
              proficiency: 'intermediate'
            };
          }
          return {
            name: lang.name || lang,
            proficiency: lang.proficiency || 'intermediate'
          };
        });
      };
      
      // Helper function to map availability for backend
      const mapAvailabilityForBackend = (availability) => {
        const mapping = {
          'full-time': 'Full_time',
          'part-time': 'Part_time',
          'contract': 'Contract',
          'freelance': 'Freelance',
          'not-available': 'Not_available'
        };
        return mapping[availability] || availability;
      };
      
      // Helper function to map job types for backend
      const mapJobTypesForBackend = (jobTypes) => {
        const mapping = {
          'permanent': 'Permanent',
          'contract': 'Contract',
          'freelance': 'Freelance',
          'internship': 'Internship'
        };
        
        if (!Array.isArray(jobTypes)) {
          jobTypes = [jobTypes].filter(Boolean);
        }
        
        return jobTypes.map(type => mapping[type] || type);
      };
      
      // Prepare comprehensive data structure for the API
      const apiData = {
        // Basic profile information
        firstName,
        lastName,
        title: formData.title,
        bio: formData.bio,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        nationality: formData.nationality,
        phone: formData.phone,
        
        // Professional Information
        currentPosition: formData.currentPosition || formData.title,
        currentCompany: formData.currentCompany,
        yearsOfExperience: formData.yearsOfExperience || 0,
        hourlyRate: formData.hourlyRate,
        currency: formData.currency || 'USD',        // Social links as object (backend stores and returns as object)
        // Only include non-empty social links
        socialLinks: (() => {
          console.log('🔍 PROCESSING SOCIAL LINKS:');
          console.log('Original formData values:', {
            website: formData.website,
            github: formData.github,
            linkedin: formData.linkedin,
            twitter: formData.twitter,
            facebook: formData.facebook,
            instagram: formData.instagram,
            dribbble: formData.dribbble,
            behance: formData.behance,
            medium: formData.medium,
            youtube: formData.youtube,
            stackoverflow: formData.stackoverflow,
            codepen: formData.codepen
          });
          
          const socialLinksObj = {
            website: formData.website || '',
            github: formData.github || '',
            linkedin: formData.linkedin || '',
            twitter: formData.twitter || '',
            facebook: formData.facebook || '',
            instagram: formData.instagram || '',
            dribbble: formData.dribbble || '',
            behance: formData.behance || '',
            medium: formData.medium || '',
            youtube: formData.youtube || '',
            stackoverflow: formData.stackoverflow || '',
            codepen: formData.codepen || ''
          };
          
          console.log('Social links object before filtering:', socialLinksObj);
          
          // Remove empty values
          const filteredSocialLinks = Object.fromEntries(
            Object.entries(socialLinksObj).filter(([key, value]) => value && value.trim() !== '')
          );
          
          console.log('Filtered social links:', filteredSocialLinks);
          console.log('Number of filtered social links:', Object.keys(filteredSocialLinks).length);
          
          // Return object directly (not JSON string) - backend expects object
          const result = Object.keys(filteredSocialLinks).length > 0 ? filteredSocialLinks : null;
          console.log('Final socialLinks result:', result);
          console.log('Type of socialLinks result:', typeof result);
          
          return result;
        })(),
        
        // Skills and Languages with proper structure
        skills: processSkillsForAPI(formData.skills),
        languages: processLanguagesForAPI(formData.languages),        // Work preferences - fix mapping for backend compatibility
        availability: mapAvailabilityForBackend(formData.availability),
        jobTypes: mapJobTypesForBackend(formData.jobType),
        remoteWorkAvailable: Boolean(formData.remoteWork),
        openToRelocation: Boolean(formData.relocation),
        
        // Address as object (backend expects object or null)
        address: {
          street: formData.location?.address || '',
          city: formData.location?.city || '',
          state: formData.location?.state || '',
          country: formData.location?.country || '',
          zipCode: formData.location?.zipCode || ''
        },
        
        // Profile visibility
        profileVisibility: formData.visibilityPreference === 'public' ? 'public' : 
                          (formData.visibilityPreference === 'connections' ? 'connections_only' : 'private'),
        
        // Settings object for user preferences
        settings: {
          profilePublic: formData.visibilityPreference === 'public' ? 1 : 0,
          theme: formData.theme || 'light',
          fontSize: formData.fontSize || 'medium',
          animationsEnabled: formData.animationsEnabled ? 1 : 0,
          notificationsEnabled: formData.notificationsEnabled ? 1 : 0,
          emailNotifications: formData.emailNotifications ? 1 : 0,
          pushNotifications: formData.pushNotifications ? 1 : 0,
          showEmail: formData.showEmail ? 1 : 0,
          showPhone: formData.showPhone ? 1 : 0,
          allowSearchEngineIndexing: formData.allowSearchEngineIndexing ? 1 : 0,
          twoFactorEnabled: formData.twoFactorEnabled ? 1 : 0
        }
      };      // Clean up empty values to keep payload clean
      Object.keys(apiData).forEach(key => {
        if (key === 'socialLinks') {
          console.log(`🔍 Cleanup check for socialLinks: value = ${apiData[key]}, type = ${typeof apiData[key]}, isNull = ${apiData[key] === null}`);
          if (apiData[key] === null) {
            console.log('🗑️ Removing socialLinks because it is null');
            delete apiData[key];
          } else {
            console.log('✅ Keeping socialLinks because it has a value');
          }
        } else if (apiData[key] === null || apiData[key] === '' || 
            (Array.isArray(apiData[key]) && apiData[key].length === 0)) {
          console.log(`🗑️ Removing ${key} because it's empty/null/empty array`);
          delete apiData[key];
        }
      });
      
      // 🚨 LOG WHAT'S ACTUALLY BEING SENT AFTER CLEANUP
      console.log('🚨 FINAL PAYLOAD AFTER CLEANUP:', {
        socialLinksInPayload: apiData.socialLinks,
        socialLinksExists: 'socialLinks' in apiData,
        completePayload: apiData
      });
      
      // Debug the comprehensive data being submitted
      console.log('🔍 Comprehensive Profile Submission Data:');
      console.log('Basic Info:', {
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        title: apiData.title,
        dateOfBirth: apiData.dateOfBirth,
        gender: apiData.gender,
        nationality: apiData.nationality
      });
      console.log('Professional Info:', {
        currentPosition: apiData.currentPosition,
        currentCompany: apiData.currentCompany,
        yearsOfExperience: apiData.yearsOfExperience,
        hourlyRate: apiData.hourlyRate
      });
      console.log('Address Info:', {
        address: apiData.address,
        city: apiData.city,
        state: apiData.state,
        country: apiData.country,
        zipCode: apiData.zipCode
      });
      console.log('Skills:', apiData.skills);      console.log('Languages:', apiData.languages);
      console.log('Social Links:', {
        raw: {
          website: formData.website,
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          facebook: formData.facebook,
          instagram: formData.instagram,
          dribbble: formData.dribbble,
          behance: formData.behance,
          medium: formData.medium,
          youtube: formData.youtube,
          stackoverflow: formData.stackoverflow,
          codepen: formData.codepen
        },
        processed: apiData.socialLinks
      });
      console.log('Work Preferences:', {
        availability: apiData.availability,
        jobTypes: apiData.jobTypes,
        remoteWorkAvailable: apiData.remoteWorkAvailable,
        openToRelocation: apiData.openToRelocation,
        profileVisibility: apiData.profileVisibility
      });      console.log('Settings:', apiData.settings);
      console.log('Complete API Data:', apiData);
      
      // 🚀 LOG THE EXACT REQUEST BEING SENT TO BACKEND
      console.log('🚀 FINAL REQUEST TO BACKEND:', {
        url: '/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(apiData, null, 2)
      });
        // 🔍 SPECIFIC SOCIAL LINKS DEBUG
      console.log('🔍 SOCIAL LINKS DETAILED DEBUG:');
      console.log('Raw form data social links:', {
        website: formData.website,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        facebook: formData.facebook,
        instagram: formData.instagram,
        dribbble: formData.dribbble,
        behance: formData.behance,
        medium: formData.medium,
        youtube: formData.youtube,
        stackoverflow: formData.stackoverflow,
        codepen: formData.codepen
      });
      console.log('Processed socialLinks in API data:', apiData.socialLinks);
      console.log('Type of socialLinks:', typeof apiData.socialLinks);
      console.log('Is socialLinks null?', apiData.socialLinks === null);
      console.log('Is socialLinks undefined?', apiData.socialLinks === undefined);
      console.log('socialLinks length (if string):', apiData.socialLinks?.length);
      
      // 🌐 LOG THE ACTUAL HTTP REQUEST PAYLOAD
      console.log('🌐 ACTUAL HTTP REQUEST PAYLOAD:');
      console.log('Request Method: PUT');
      console.log('Request URL: /profile');
      console.log('Request Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')?.substring(0, 20)}...`
      });
      console.log('Request Body (stringified):', JSON.stringify(apiData));
      console.log('Request Body (parsed):', apiData);
      
      // Call API to update profile
      const response = await apiService.profile.update(apiData);
        if (response.data && response.data.success) {
        console.log('✅ Profile updated successfully:', response.data);
        
        // Success - update state without reloading
        setSuccessMessage('Profile updated successfully!');
        setShowSuccessMessage(true);
        setIsDirty(false);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      
      let errorMessage = 'Failed to save profile. Please try again.';
      
      // More specific error handling
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Prompt user before leaving if form is dirty
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
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-form-container">
      <div className="profile-form-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>Profile Settings</h1>
        </div>
        
        <div className="header-right">
          <button 
            type="button" 
            className={`visibility-toggle ${formData.visibilityPreference === 'public' ? 'public' : 'private'}`}
            onClick={() => handleChange({
              target: {
                name: 'visibilityPreference',
                value: formData.visibilityPreference === 'public' ? 'private' : 'public'
              }
            })}
          >
            {formData.visibilityPreference === 'public' ? (
              <>
                <FaEye /> Public Profile
              </>
            ) : (
              <>
                <FaEyeSlash /> Private Profile
              </>
            )}
          </button>
          
          <Link to={`/profile/${formData.name.split(' ')[0].toLowerCase()}`} className="view-profile-btn">
            <FaUser /> View Public Profile
          </Link>
        </div>
      </div>
      
      {errors.general && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <p>{errors.general}</p>
          <button onClick={() => setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.general;
            return newErrors;
          })}>
            <FaTimes />
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            className="success-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FaCheck />
            <p>{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="profile-cover-section">
        <div 
          className="profile-cover" 
          style={{ backgroundImage: formData.coverImage ? `url(${formData.coverImage})` : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}
        >
          <button 
            type="button" 
            className="change-cover-btn"
            onClick={() => triggerFileInput(coverImageRef)}
          >
            <FaCamera /> Change Cover
          </button>
          <input 
            type="file" 
            ref={coverImageRef} 
            onChange={(e) => handleFileChange(e, 'coverImage')} 
            accept="image/*" 
            hidden 
          />
        </div>
          <div className="profile-image-container">          <div 
            className="profile-image" 
            style={{ backgroundImage: formData.profileImage ? `url(${formData.profileImage})` : 'none' }}
          >
            {/* No placeholder icon - empty when no image */}
            {/* Add user icon placeholder when no image */}
            {!formData.profileImage && !isUploading && (
              <FaUser className="profile-placeholder-icon" />
            )}
            
            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="upload-progress-overlay">
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div className="upload-progress-text">
                  <span>{Math.round(uploadProgress)}% Uploading...</span>
                </div>
              </div>
            )}
            
            {/* Change Image Button */}
            <button 
              type="button" 
              className="change-image-btn"
              onClick={() => triggerFileInput(profileImageRef)}
              disabled={isUploading}
              title={isUploading ? 'Upload in progress...' : 'Change profile image'}
            >
              <FaCamera />
            </button>
            
            {/* Remove Image Button */}
            {formData.profileImage && !isUploading && (
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={handleRemoveProfileImage}
                title="Remove profile image"
              >
                <FaTrash />
              </button>
            )}
            
            <input 
              type="file" 
              ref={profileImageRef} 
              onChange={(e) => handleFileChange(e, 'profileImage')} 
              accept="image/*" 
              hidden 
            />
          </div>
          
          {/* Profile Image Error */}
          {errors.profileImage && (
            <div className="profile-image-error">
              <FaExclamationTriangle />
              <span>{errors.profileImage}</span>
            </div>
          )}
          
          <div className="profile-name-title">
            <h2>{formData.name || 'Your Name'}</h2>
            <p>{formData.title || 'Your Title'}</p>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <FaUser /> Personal Info
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FaEnvelope /> Contact
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <FaGlobe /> Social Links
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <FaCode /> Skills & Languages
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FaCog /> Preferences
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Information Tab */}
        <div className={`form-tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Professional Title</label>
                <div className="input-with-icon">
                  <FaUserTag className="input-icon" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="4"
              ></textarea>
              <p className="input-help">
                <FaInfoCircle /> Brief description about yourself and your professional background
              </p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <div className="input-with-icon">
                  <FaIdCard className="input-icon" />
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Your nationality"
                  />
                </div>
              </div>
            </div>
              <div className="form-group">
              <label htmlFor="resume">Resume/CV Management</label>
              <div className="resume-management-container">
                {/* Resume Upload Section */}
                <div className="resume-upload-section">
                  <div className="upload-area">
                    <FaCloudUploadAlt className="upload-icon" />
                    <h4>Upload New Resume</h4>
                    <p>Drag and drop or click to upload (PDF, DOC, DOCX)</p>
                    <button 
                      type="button" 
                      className="upload-btn"
                      onClick={() => triggerFileInput(resumeRef)}
                      disabled={resumeUploading}
                    >
                      {resumeUploading ? (
                        <>
                          <div className="button-spinner"></div>
                          Uploading... {resumeUploadProgress}%
                        </>
                      ) : (
                        <>
                          <FaPlus /> Add Resume
                        </>
                      )}
                    </button>
                  </div>
                  
                  {resumeUploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${resumeUploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{resumeUploadProgress}% uploaded</span>
                    </div>
                  )}
                </div>

                {/* Resume List */}
                {resumes.length > 0 && (
                  <div className="resume-list">
                    <h4>Your Resumes ({resumes.length})</h4>
                    <div className="resume-items">
                      {resumes.map((resume, index) => (
                        <div key={resume.id || index} className={`resume-item ${resume.isPrimary ? 'primary' : ''}`}>
                          <div className="resume-icon">
                            <FaFileAlt />
                          </div>
                          
                          <div className="resume-details">
                            <div className="resume-name-row">
                              <span className="resume-name">{resume.fileName || `Resume ${index + 1}`}</span>
                              {resume.isPrimary && <span className="primary-badge">Primary</span>}
                            </div>
                            <div className="resume-meta">
                              <span className="file-size">{formatFileSize(resume.fileSize || 0)}</span>
                              <span className="upload-date">Uploaded {formatUploadDate(resume.uploadDate || new Date())}</span>
                            </div>
                          </div>
                          
                          <div className="resume-actions">
                            <a 
                              href={resume.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="action-btn view-btn"
                              title="View Resume"
                            >
                              <FaEye />
                            </a>
                            
                            {!resume.isPrimary && (
                              <button 
                                type="button"
                                className="action-btn primary-btn"
                                onClick={() => handleSetPrimaryResume(resume.id)}
                                title="Set as Primary"
                              >
                                <FaCheck />
                              </button>
                            )}
                            
                            <button 
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => setShowResumeDeleteConfirm(resume)}
                              title="Delete Resume"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {resumes.length === 0 && (
                  <div className="resume-empty-state">
                    <FaFileAlt className="empty-icon" />
                    <h4>No resumes uploaded</h4>
                    <p>Upload your first resume to get started. You can manage multiple resumes and set one as primary.</p>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={resumeRef} 
                  onChange={(e) => handleFileChange(e, 'resume')} 
                  accept=".pdf,.doc,.docx" 
                  hidden 
                />
              </div>
              
              <p className="input-help">
                <FaInfoCircle /> Accepted formats: PDF, DOC, DOCX. Max size: 10MB. You can upload multiple resumes and set one as primary.
              </p>
              
              {errors.resume && <p className="error-message">{errors.resume}</p>}
            </div>
          </div>
        </div>
        
        {/* Contact Information Tab */}
        <div className={`form-tab-content ${activeTab === 'contact' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group location-group">
              <div className="location-header">
                <label>Location</label>
                <button 
                  type="button" 
                  className="toggle-details-btn"
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                >
                  {showLocationDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              <div className="input-with-icon">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  id="location.address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                />
              </div>
              
              <AnimatePresence>
                {showLocationDetails && (
                  <motion.div 
                    className="location-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.city"
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.state"
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleChange}
                          placeholder="State/Province"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.country"
                          name="location.country"
                          value={formData.location.country}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          id="location.zipCode"
                          name="location.zipCode"
                          value={formData.location.zipCode}
                          onChange={handleChange}
                          placeholder="Zip/Postal Code"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Social Links Tab */}
        <div className={`form-tab-content ${activeTab === 'social' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Social Links</h3>
            <p className="section-description">
              Connect your social profiles to showcase your work and presence across platforms
            </p>
            
            <div className="social-links-grid">
              <div className="form-group">
                <label htmlFor="website">Personal Website</label>
                <div className="input-with-icon">
                  <FaGlobe className="input-icon" />
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? 'error' : ''}
                  />
                </div>
                {errors.website && <p className="error-message">{errors.website}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <div className="input-with-icon">
                  <FaGithub className="input-icon" />
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className={errors.github ? 'error' : ''}
                  />
                </div>
                {errors.github && <p className="error-message">{errors.github}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <div className="input-with-icon">
                  <FaLinkedin className="input-icon" />
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className={errors.linkedin ? 'error' : ''}
                  />
                </div>
                {errors.linkedin && <p className="error-message">{errors.linkedin}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="twitter">Twitter</label>
                <div className="input-with-icon">
                  <FaTwitter className="input-icon" />
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <div className="input-with-icon">
                  <FaFacebook className="input-icon" />
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <div className="input-with-icon">
                  <FaInstagram className="input-icon" />
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="dribbble">Dribbble</label>
                <div className="input-with-icon">
                  <FaDribbble className="input-icon" />
                  <input
                    type="url"
                    id="dribbble"
                    name="dribbble"
                    value={formData.dribbble}
                    onChange={handleChange}
                    placeholder="https://dribbble.com/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="behance">Behance</label>
                <div className="input-with-icon">
                  <FaBehance className="input-icon" />
                  <input
                    type="url"
                    id="behance"
                    name="behance"
                    value={formData.behance}
                    onChange={handleChange}
                    placeholder="https://behance.net/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="medium">Medium</label>
                <div className="input-with-icon">
                  <FaMedium className="input-icon" />
                  <input
                    type="url"
                    id="medium"
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    placeholder="https://medium.com/@username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="youtube">YouTube</label>
                <div className="input-with-icon">
                  <FaYoutube className="input-icon" />
                  <input
                    type="url"
                    id="youtube"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/c/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="stackoverflow">Stack Overflow</label>
                <div className="input-with-icon">
                  <FaStackOverflow className="input-icon" />
                  <input
                    type="url"
                    id="stackoverflow"
                    name="stackoverflow"
                    value={formData.stackoverflow}
                    onChange={handleChange}
                    placeholder="https://stackoverflow.com/users/id/username"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="codepen">CodePen</label>
                <div className="input-with-icon">
                  <FaCodepen className="input-icon" />
                  <input
                    type="url"
                    id="codepen"
                    name="codepen"
                    value={formData.codepen}
                    onChange={handleChange}
                    placeholder="https://codepen.io/username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skills & Languages Tab */}
        <div className={`form-tab-content ${activeTab === 'skills' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Skills</h3>
            <p className="section-description">
              Add your technical skills and areas of expertise
            </p>
            
            <div className="form-group">
              <label htmlFor="skillInput">Add Skills</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React, Python, UI Design"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill}>
                  <FaPlus /> Add
                </button>
              </div>
              <p className="input-help">
                <FaInfoCircle /> Press Enter or click Add to add a skill
              </p>
            </div>
              <div className="skills-container">
              {formData.skills.length === 0 ? (
                <p className="empty-state">No skills added yet. Add your first skill above.</p>
              ) : (
                formData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    <span>{typeof skill === 'string' ? skill : skill.name}</span>
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">Languages</h3>
            <p className="section-description">
              Add languages you speak and your proficiency level
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="languageInput">Language</label>
                <input
                  type="text"
                  id="languageInput"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="e.g. English, Spanish, French"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="languageProficiency">Proficiency</label>
                <select
                  id="languageProficiency"
                  value={languageProficiency}
                  onChange={(e) => setLanguageProficiency(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </select>
              </div>
              
              <div className="form-group form-button-group">
                <label>&nbsp;</label>
                <button type="button" className="add-btn" onClick={addLanguage}>
                  <FaPlus /> Add Language
                </button>
              </div>
            </div>
            
            <div className="languages-list">
              {formData.languages.length === 0 ? (
                <p className="empty-state">No languages added yet. Add your first language above.</p>
              ) : (
                <div className="language-table">
                  <div className="language-table-header">
                    <div className="language-name-header">Language</div>
                    <div className="language-proficiency-header">Proficiency</div>
                    <div className="language-actions-header">Actions</div>
                  </div>
                  {formData.languages.map((language, index) => (
                    <div key={index} className="language-item">
                      <div className="language-name">{language.name}</div>
                      <div className="language-proficiency">
                        <div className={`proficiency-badge ${language.proficiency}`}>
                          {language.proficiency.charAt(0).toUpperCase() + language.proficiency.slice(1)}
                        </div>
                      </div>
                      <div className="language-actions">
                        <button type="button" className="remove-btn" onClick={() => removeLanguage(language.name)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Preferences Tab */}
        <div className={`form-tab-content ${activeTab === 'preferences' ? 'active' : ''}`}>
          <div className="form-section">
            <h3 className="section-title">Work Preferences</h3>
            <p className="section-description">
              Set your availability and job preferences
            </p>
            
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="">Select Availability</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Job Types</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="permanent"
                    checked={formData.jobType.includes('permanent')}
                    onChange={handleChange}
                  />
                  <span>Permanent</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="contract"
                    checked={formData.jobType.includes('contract')}
                    onChange={handleChange}
                  />
                  <span>Contract</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="freelance"
                    checked={formData.jobType.includes('freelance')}
                    onChange={handleChange}
                  />
                  <span>Freelance</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="jobType"
                    value="internship"
                    checked={formData.jobType.includes('internship')}
                    onChange={handleChange}
                  />
                  <span>Internship</span>
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <span>Remote Work</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="remoteWork"
                      checked={formData.remoteWork}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <p className="input-help">Available for remote work opportunities</p>
              </div>
              
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <span>Relocation</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="relocation"
                      checked={formData.relocation}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <p className="input-help">Open to relocating for the right opportunity</p>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">Profile Visibility</h3>
            <p className="section-description">
              Control who can see your profile information
            </p>
            
            <div className="form-group">
              <label htmlFor="visibilityPreference">Profile Visibility</label>
              <select
                id="visibilityPreference"
                name="visibilityPreference"
                value={formData.visibilityPreference}
                onChange={handleChange}
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="private">Private - Only visible to you</option>
                <option value="connections">Connections Only - Visible to your connections</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
            Cancel
          </button>          <button 
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
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        /* Base Variables */
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
          --transition-slow: all 0.5s ease;
        }
        
        /* Dark Mode Variables */
        .dark-mode {
          --white: #111827;
          --gray-50: #1f2937;
          --gray-100: #374151;
          --gray-200: #4b5563;
          --gray-300: #6b7280;
          --gray-400: #9ca3af;
          --gray-500: #d1d5db;
          --gray-600: #e5e7eb;
          --gray-700: #f3f4f6;
          --gray-800: #f9fafb;
          --gray-900: #ffffff;
          --black: #ffffff;
          
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }
        
        /* Global Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        /* Loading Screen */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--white);
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--gray-200);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Profile Form Container */
        .profile-form-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--white);
          color: var(--gray-800);
        }
        
        /* Header */
        .profile-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-600);
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .profile-form-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--gray-900);
        }
        
        .header-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .visibility-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
          border: 1px solid var(--gray-300);
        }
        
        .visibility-toggle.public {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-color);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .visibility-toggle.private {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .visibility-toggle:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        .view-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          background-color: var(--primary-color);
          color: var(--white);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .view-profile-btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        /* Error and Success Banners */
        .error-banner,
        .success-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .error-banner {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid var(--danger-color);
          color: var(--danger-color);
        }
        
        .success-banner {
          background-color: rgba(16, 185, 129, 0.1);
          border-left: 4px solid var(--secondary-color);
          color: var(--secondary-color);
        }
        
        .error-banner svg,
        .success-banner svg {
          font-size: 1.25rem;
        }
        
        .error-banner p,
        .success-banner p {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .error-banner button,
        .success-banner button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .error-banner button:hover,
        .success-banner button:hover {
          opacity: 1;
        }
        
        /* Profile Cover Section */
        .profile-cover-section {
          position: relative;
          margin-bottom: 4rem;
        }
        
        .profile-cover {
          height: 200px;
          border-radius: var(--border-radius-lg);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        
        .change-cover-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          background-color: rgba(0, 0, 0, 0.5);
          color: var(--white);
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .change-cover-btn:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        
        .profile-image-container {
          position: absolute;
          left: 2rem;
          bottom: 50px;
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
        }

        .profile-placeholder-icon {
          font-size: 3rem;
          color: var(--gray-400);
          opacity: 0.7;
          transition: var(--transition-fast);
        }

        .profile-image:hover .profile-placeholder-icon {
          color: var(--gray-500);
          opacity: 0.9;
        }
        
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: var(--border-radius-full);
          background-color: var(--white);
          border: 4px solid var(--white);
          box-shadow: var(--shadow-md);
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .profile-placeholder {
          font-size: 3rem;
          color: var(--gray-400);
        }
        
        .change-image-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          background-color: var(--primary-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
          cursor: pointer;
          transition: var(--transition-fast);
        }
          .change-image-btn:hover:not(:disabled) {
          background-color: var(--primary-dark);
          transform: scale(1.1);
        }
        
        .change-image-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Remove Image Button */
        .remove-image-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          background-color: var(--danger-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .remove-image-btn:hover {
          background-color: #dc2626;
          transform: scale(1.1);
        }
        
        /* Upload Progress Overlay */
        .upload-progress-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--white);
          border-radius: var(--border-radius-full);
        }
        
        .upload-progress {
          width: 70%;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .upload-progress-bar {
          height: 100%;
          background-color: var(--primary-color);
          transition: width 0.3s ease;
        }
        
        .upload-progress-text {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* Profile Image Error */
        .profile-image-error {
          position: absolute;
          top: -2.5rem;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--danger-color);
          color: var(--white);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 500;
          box-shadow: var(--shadow-md);
        }
        
        .profile-image-error svg {
          font-size: 0.875rem;
        }
        
        .profile-name-title {
          padding-bottom: 0.5rem;
        }
        
        .profile-name-title h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }
        
        .profile-name-title p {
          font-size: 1rem;
          color: var(--gray-600);
        }
        
        /* Tabs */
        .profile-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
          margin-bottom: 2rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .profile-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--gray-600);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }
        
        .tab-btn:hover {
          color: var(--primary-color);
        }
        
        .tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        /* Form Content */
        .form-tab-content {
          display: none;
        }
        
        .form-tab-content.active {
          display: block;
        }
        
        .form-section {
          background-color: var(--white);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        
        .section-description {
          font-size: 0.875rem;
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .form-group {
          flex: 1;
          min-width: 250px;
          margin-bottom: 1.5rem;
        }
        
        .form-button-group {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-width: auto;
        }
        
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }
        
        .required {
          color: var(--danger-color);
        }
        
        .profile-form-container input[type="text"],
        .profile-form-container input[type="email"],
        .profile-form-container input[type="tel"],
        .profile-form-container input[type="url"],
        .profile-form-container input[type="date"],
        .profile-form-container input[type="number"],
        .profile-form-container select,
        .profile-form-container textarea {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          color: var(--gray-800);
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }
        
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
          
        input.error,
        select.error,
        textarea.error {
          border-color: var(--danger-color);
        }
        
        input.error:focus,
        select.error:focus,
        textarea.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
        
        .error-message {
          color: var(--danger-color);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .input-help {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
        }
        
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        .input-with-icon input,
        .input-with-icon select {
          padding-left: 2.25rem;
        }
        
        // .input-with-icon input::placeholder {
        //   padding-left: 1.25rem;
        // }
        .profile-form .input-with-icon input[type="text"],
        .profile-form .input-with-icon input[type="url"],
        .profile-form .input-with-icon input[type="date"],
        .profile-form .input-with-icon select {
          padding-left: 2.35rem !important;
        }
        
        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-button input {
          flex: 1;
        }
        
        .input-with-button button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.625rem 1rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .input-with-button button:hover {
          background-color: var(--primary-dark);
        }
        
        /* Location Group */
        .location-group {
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          padding: 1rem;
          background-color: var(--gray-50);
        }
        
        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .toggle-details-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .toggle-details-btn:hover {
          text-decoration: underline;
        }
        
        .location-details {
          margin-top: 1rem;
          overflow: hidden;
        }
        
        /* Social Links */
        .social-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        /* Skills */
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .skill-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius-full);
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .skill-tag button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 0.75rem;
          opacity: 0.7;
          transition: var(--transition-fast);
        }
        
        .skill-tag button:hover {
          opacity: 1;
        }
        
        .empty-state {
          padding: 1.5rem;
          text-align: center;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        /* Languages */
        .language-table {
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          overflow: hidden;
        }
        
        .language-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 80px;
          background-color: var(--gray-100);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--gray-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .language-item {
          display: grid;
          grid-template-columns: 2fr 1fr 80px;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--gray-200);
          align-items: center;
        }
        
        .language-name {
          font-weight: 500;
          color: var(--gray-800);
        }
        
        .proficiency-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }
        
        .proficiency-badge.beginner {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .proficiency-badge.intermediate {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
        
        .proficiency-badge.advanced {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--info-color);
        }
        
        .proficiency-badge.fluent,
        .proficiency-badge.native {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-color);
        }
        
        .language-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-full);
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .remove-btn:hover {
          background-color: rgba(239, 68, 68, 0.2);
        }
        
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .add-btn:hover {
          background-color: var(--primary-dark);
        }
        
        /* Checkbox and Toggle Styles */
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--primary-color);
        }
        
        .toggle-group {
          min-width: 200px;
        }
        
        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-bottom: 0.25rem;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
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
          background-color: var(--gray-300);
          border-radius: 34px;
          transition: var(--transition-fast);
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: var(--white);
          border-radius: 50%;
          transition: var(--transition-fast);
        }
        
        input:checked + .toggle-slider {
          background-color: var(--primary-color);
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        
        /* File Upload */
        .file-upload-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border: 1px dashed var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--gray-50);
        }
        
        .file-upload-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        
        .file-icon {
          font-size: 1.25rem;
          color: var(--gray-500);
        }
        
        .file-name {
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .view-file-link {
          font-size: 0.75rem;
          color: var(--primary-color);
          margin-left: 0.5rem;
        }
        
        .view-file-link:hover {
          text-decoration: underline;
        }
        
        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .upload-btn:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
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
        
        .cancel-btn {
          padding: 0.625rem 1.25rem;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .cancel-btn:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .save-btn:hover:not(:disabled) {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.25rem;
        }

        /* ================================
          COMPREHENSIVE DARK MODE STYLES
          ================================ */

        /* Dark Mode Base Variables */
        body.dark-mode {
          --profile-dark-bg-primary: #0f172a;
          --profile-dark-bg-secondary: #1e293b;
          --profile-dark-bg-tertiary: #334155;
          --profile-dark-text-primary: #f8fafc;
          --profile-dark-text-secondary: #cbd5e1;
          --profile-dark-text-muted: #94a3b8;
          --profile-dark-border: rgba(148, 163, 184, 0.2);
          --profile-dark-border-light: rgba(203, 213, 225, 0.1);
          --profile-dark-accent: #6366f1;
          --profile-dark-accent-secondary: #8b5cf6;
          --profile-dark-success: #10b981;
          --profile-dark-warning: #f59e0b;
          --profile-dark-error: #ef4444;
          --profile-dark-info: #3b82f6;
        }

        /* Profile Form Container - Dark Mode */
        body.dark-mode .profile-form-container {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--profile-dark-border);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          color: var(--profile-dark-text-primary);
        }

        /* Profile Image Placeholder - Dark Mode */
        body.dark-mode .profile-placeholder-icon {
          color: var(--profile-dark-text-muted);
        }

        body.dark-mode .profile-image:hover .profile-placeholder-icon {
          color: var(--profile-dark-text-secondary);
        }
                
        /* Header - Dark Mode */
        body.dark-mode .profile-form-header {
          border-bottom: 1px solid var(--profile-dark-border);
        }

        body.dark-mode .profile-form-header h1 {
          color: var(--profile-dark-text-primary);
          background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        body.dark-mode .back-link {
          background: rgba(51, 65, 85, 0.4);
          color: var(--profile-dark-accent);
          border: 1px solid var(--profile-dark-border);
          backdrop-filter: blur(10px);
        }
        
        body.dark-mode .back-link:hover {
          background: rgba(51, 65, 85, 0.6);
          color: var(--profile-dark-accent-secondary);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }
        
        /* Visibility Toggle - Dark Mode */
        body.dark-mode .visibility-toggle {
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid var(--profile-dark-border);
          color: var(--profile-dark-text-secondary);
          backdrop-filter: blur(10px);
        }
        
        body.dark-mode .visibility-toggle.public {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        body.dark-mode .visibility-toggle.public:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }
        
        body.dark-mode .visibility-toggle.private {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        body.dark-mode .visibility-toggle.private:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
        }
                .dark-mode .form-section {
          background-color: var(--gray-800);
          border-color: var(--gray-700);
        }
        
        .dark-mode .section-title {
          color: var(--gray-100);
        }
        
        .dark-mode .section-description {
          color: var(--gray-400);
        }
        
        .dark-mode label {
          color: var(--gray-300);
        }
        
        .dark-mode input[type="text"],
        .dark-mode input[type="email"],
        .dark-mode input[type="tel"],
        .dark-mode input[type="url"],
        .dark-mode input[type="date"],
        .dark-mode input[type="number"],
        .dark-mode select,
        .dark-mode textarea {
          background-color: var(--gray-700);
          border-color: var(--gray-600);
          color: var(--gray-200);
        }
        
        .dark-mode input:focus,
        .dark-mode select:focus,
        .dark-mode textarea:focus {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }
        
        .dark-mode .input-icon {
          color: var(--gray-400);
        }
        
        .dark-mode .input-help {
          color: var(--gray-400);
        }
        
        .dark-mode .location-group {
          background-color: var(--gray-700);
          border-color: var(--gray-600);
        }
        
        .dark-mode .toggle-details-btn {
          color: var(--primary-light);
        }
        
        .dark-mode .skill-tag {
          background-color: rgba(129, 140, 248, 0.2);
          color: var(--primary-light);
        }
        
        .dark-mode .skill-tag button {
          color: var(--primary-light);
        }
        
        .dark-mode .empty-state {
          background-color: var(--gray-700);
          color: var(--gray-400);
        }
        
        .dark-mode .language-table {
          border-color: var(--gray-700);
        }
        
        .dark-mode .language-table-header {
          background-color: var(--gray-700);
          color: var(--gray-300);
        }
        
        .dark-mode .language-item {
          border-color: var(--gray-700);
        }
          .dark-mode .language-name {
          color: var(--gray-200);
        }

        /* ================================
           COMPREHENSIVE DARK MODE STYLES
           ================================ */

        /* Tab Navigation - Dark Mode */
        body.dark-mode .profile-tabs {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--profile-dark-border);
          border-radius: 12px;
          padding: 6px;
          backdrop-filter: blur(10px);
        }

        body.dark-mode .tab-btn {
          background: transparent;
          color: var(--profile-dark-text-muted);
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        body.dark-mode .tab-btn:hover {
          background: rgba(51, 65, 85, 0.5);
          color: var(--profile-dark-text-secondary);
          transform: translateY(-1px);
        }

        body.dark-mode .tab-btn.active {
          background: linear-gradient(135deg, var(--profile-dark-accent) 0%, var(--profile-dark-accent-secondary) 100%);
          color: var(--profile-dark-text-primary);
          box-shadow: 
            0 4px 12px rgba(99, 102, 241, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        /* Form Content Area - Dark Mode */
        body.dark-mode .tab-content {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid var(--profile-dark-border);
          border-radius: 12px;
          backdrop-filter: blur(15px);
        }

        body.dark-mode .form-section {
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid var(--profile-dark-border-light);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        body.dark-mode .section-title {
          color: var(--profile-dark-text-primary);
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        body.dark-mode .section-description {
          color: var(--profile-dark-text-muted);
        }

        /* Form Inputs - Dark Mode */
        body.dark-mode label {
          color: var(--profile-dark-text-secondary);
          font-weight: 500;
        }

        body.dark-mode input[type="text"],
        body.dark-mode input[type="email"],
        body.dark-mode input[type="tel"],
        body.dark-mode input[type="url"],
        body.dark-mode input[type="date"],
        body.dark-mode input[type="number"],
        body.dark-mode select,
        body.dark-mode textarea {
          background: rgba(51, 65, 85, 0.6);
          border: 1px solid var(--profile-dark-border);
          color: var(--profile-dark-text-primary);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        body.dark-mode input:focus,
        body.dark-mode select:focus,
        body.dark-mode textarea:focus {
          border-color: var(--profile-dark-accent);
          box-shadow: 
            0 0 0 3px rgba(99, 102, 241, 0.2),
            0 4px 12px rgba(99, 102, 241, 0.1);
          background: rgba(51, 65, 85, 0.8);
        }

        body.dark-mode input::placeholder,
        body.dark-mode textarea::placeholder {
          color: var(--profile-dark-text-muted);
        }

        body.dark-mode .input-icon {
          color: var(--profile-dark-text-muted);
        }

        body.dark-mode .input-help {
          color: var(--profile-dark-text-muted);
        }

        /* Location Group - Dark Mode */
        body.dark-mode .location-group {
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid var(--profile-dark-border);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .toggle-details-btn {
          color: var(--profile-dark-accent);
        }

        body.dark-mode .toggle-details-btn:hover {
          color: var(--profile-dark-accent-secondary);
          text-decoration: underline;
        }

        /* Skill Tags - Dark Mode */
        body.dark-mode .skill-tag {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          color: var(--profile-dark-accent);
          border: 1px solid rgba(99, 102, 241, 0.3);
          backdrop-filter: blur(5px);
        }

        body.dark-mode .skill-tag:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
          transform: translateY(-1px);
        }

        body.dark-mode .skill-tag button {
          color: var(--profile-dark-accent);
        }

        body.dark-mode .skill-tag button:hover {
          color: var(--profile-dark-error);
        }

        /* Empty State - Dark Mode */
        body.dark-mode .empty-state {
          background: rgba(51, 65, 85, 0.3);
          color: var(--profile-dark-text-muted);
          border: 1px solid var(--profile-dark-border-light);
          backdrop-filter: blur(10px);
        }

        /* Language Table - Dark Mode */
        body.dark-mode .language-table {
          border: 1px solid var(--profile-dark-border);
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .language-table-header {
          background: linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          color: var(--profile-dark-text-secondary);
          border-bottom: 1px solid var(--profile-dark-border);
        }

        body.dark-mode .language-item {
          border-top: 1px solid var(--profile-dark-border-light);
          background: rgba(51, 65, 85, 0.2);
        }

        body.dark-mode .language-item:hover {
          background: rgba(51, 65, 85, 0.4);
        }

        body.dark-mode .language-name {
          color: var(--profile-dark-text-primary);
        }

        /* Proficiency Badges - Dark Mode */
        body.dark-mode .proficiency-badge.beginner {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        body.dark-mode .proficiency-badge.intermediate {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        body.dark-mode .proficiency-badge.advanced {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        body.dark-mode .proficiency-badge.fluent,
        body.dark-mode .proficiency-badge.native {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        /* Remove Button - Dark Mode */
        body.dark-mode .remove-btn {
          background: rgba(239, 68, 68, 0.2);
          color: var(--profile-dark-error);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        body.dark-mode .remove-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        /* File Upload Components - Dark Mode */
        body.dark-mode .file-upload-container {
          background: rgba(51, 65, 85, 0.4);
          border: 2px dashed var(--profile-dark-border);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        body.dark-mode .file-upload-container:hover {
          border-color: var(--profile-dark-accent);
          background: rgba(51, 65, 85, 0.6);
        }

        body.dark-mode .file-icon {
          color: var(--profile-dark-text-muted);
        }

        body.dark-mode .file-name {
          color: var(--profile-dark-text-secondary);
        }

        body.dark-mode .upload-btn {
          background: linear-gradient(135deg, var(--profile-dark-accent) 0%, var(--profile-dark-accent-secondary) 100%);
          color: var(--profile-dark-text-primary);
          border: 1px solid rgba(99, 102, 241, 0.3);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .upload-btn:hover {
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }

        /* Progress Bar - Dark Mode */
        body.dark-mode .upload-progress {
          background: rgba(51, 65, 85, 0.6);
          border-radius: 8px;
          overflow: hidden;
        }

        body.dark-mode .progress-bar {
          background: linear-gradient(90deg, var(--profile-dark-accent) 0%, var(--profile-dark-accent-secondary) 100%);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }

        body.dark-mode .progress-text {
          color: var(--profile-dark-text-secondary);
        }

        /* Resume Management - Dark Mode */
        body.dark-mode .resume-item {
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid var(--profile-dark-border);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .resume-item:hover {
          background: rgba(51, 65, 85, 0.6);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        body.dark-mode .resume-title {
          color: var(--profile-dark-text-primary);
        }

        body.dark-mode .resume-meta {
          color: var(--profile-dark-text-muted);
        }

        /* Checkbox - Dark Mode */
        body.dark-mode .checkbox-label {
          color: var(--profile-dark-text-secondary);
        }

        body.dark-mode input[type="checkbox"] {
          background: rgba(51, 65, 85, 0.6);
          border: 1px solid var(--profile-dark-border);
        }

        body.dark-mode input[type="checkbox"]:checked {
          background: var(--profile-dark-accent);
          border-color: var(--profile-dark-accent);
        }

        /* Form Actions - Dark Mode */
        body.dark-mode .form-actions {
          border-top: 1px solid var(--profile-dark-border);
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(15px);
        }

        body.dark-mode .cancel-btn {
          background: rgba(51, 65, 85, 0.6);
          color: var(--profile-dark-text-secondary);
          border: 1px solid var(--profile-dark-border);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .cancel-btn:hover {
          background: rgba(51, 65, 85, 0.8);
          border-color: var(--profile-dark-text-muted);
          color: var(--profile-dark-text-primary);
          transform: translateY(-1px);
        }

        body.dark-mode .save-btn {
          background: linear-gradient(135deg, var(--profile-dark-accent) 0%, var(--profile-dark-accent-secondary) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: var(--profile-dark-text-primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        body.dark-mode .save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }

        body.dark-mode .save-btn:disabled {
          background: rgba(51, 65, 85, 0.4);
          color: var(--profile-dark-text-muted);
          border-color: var(--profile-dark-border);
          box-shadow: none;
        }

        /* Modal Components - Dark Mode */
        body.dark-mode .modal-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        body.dark-mode .modal-content {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid var(--profile-dark-border);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }

        body.dark-mode .modal-header {
          border-bottom: 1px solid var(--profile-dark-border);
          color: var(--profile-dark-text-primary);
        }

        body.dark-mode .modal-title {
          color: var(--profile-dark-text-primary);
        }

        body.dark-mode .close-btn {
          color: var(--profile-dark-text-muted);
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid var(--profile-dark-border);
        }

        body.dark-mode .close-btn:hover {
          color: var(--profile-dark-error);
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Success/Error Messages - Dark Mode */
        body.dark-mode .success-message {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          color: var(--profile-dark-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
          color: var(--profile-dark-error);
          border: 1px solid rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .warning-message {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%);
          color: var(--profile-dark-warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
          backdrop-filter: blur(10px);
        }

        body.dark-mode .info-message {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
          color: var(--profile-dark-info);
          border: 1px solid rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
        }

        /* Loading Spinner - Dark Mode */
        body.dark-mode .button-spinner {
          border-color: rgba(248, 250, 252, 0.3);
          border-top-color: var(--profile-dark-text-primary);
        }

        body.dark-mode .loading-spinner {
          border-color: var(--profile-dark-border);
          border-top-color: var(--profile-dark-accent);
        }

        /* Input with Button - Dark Mode */
        body.dark-mode .input-with-button button {
          background: linear-gradient(135deg, var(--profile-dark-accent) 0%, var(--profile-dark-accent-secondary) 100%);
          color: var(--profile-dark-text-primary);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        body.dark-mode .input-with-button button:hover {
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        /* Cover Image - Dark Mode */
        body.dark-mode .profile-cover {
          background: linear-gradient(135deg, var(--profile-dark-bg-secondary) 0%, var(--profile-dark-bg-tertiary) 100%);
          border: 1px solid var(--profile-dark-border);
        }

        /* Profile Image Container - Dark Mode */
        body.dark-mode .profile-image {
          border: 3px solid var(--profile-dark-bg-primary);
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        body.dark-mode .profile-image-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(2px);
        }

        body.dark-mode .image-upload-content {
          color: var(--profile-dark-text-primary);
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .profile-placeholder-icon {
            font-size: 2.5rem;
          }
          .profile-form-container {
            padding: 1rem;
          }
          
          .profile-form-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
          
          .profile-cover {
            height: 150px;
          }
          
          .profile-image-container {
            left: 50%;
            transform: translateX(-50%);
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .profile-tabs {
            margin-top: 4rem;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .social-links-grid {
            grid-template-columns: 1fr;
          }
          
          .language-table-header,
          .language-item {
            grid-template-columns: 1.5fr 1fr 60px;
            font-size: 0.75rem;
            padding: 0.5rem;
          }
          
          .form-actions {
            flex-direction: column-reverse;
            gap: 0.5rem;
          }
            .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }

        /* Resume Management Styles */
        .resume-section {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .resume-upload-area {
          border: 2px dashed #e1e5e9;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: #fafbfc;
        }

        .resume-upload-area:hover {
          border-color: #0066cc;
          background: #f0f7ff;
        }

        .resume-upload-area.drag-over {
          border-color: #0066cc;
          background: #e6f3ff;
        }

        .upload-icon {
          font-size: 2rem;
          color: #6c757d;
          margin-bottom: 1rem;
        }

        .upload-text {
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .upload-subtext {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .resume-list {
          margin-top: 2rem;
        }

        .resume-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          margin-bottom: 1rem;
          background: #fff;
        }

        .resume-item.primary {
          border-color: #0066cc;
          background: #f0f7ff;
        }

        .resume-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .resume-icon {
          color: #dc3545;
          margin-right: 1rem;
          font-size: 1.5rem;
        }

        .resume-details h4 {
          margin: 0 0 0.25rem 0;
          color: #212529;
          font-size: 1rem;
        }

        .resume-meta {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .primary-badge {
          background: #0066cc;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-left: 1rem;
        }

        .resume-actions {
          display: flex;
          gap: 0.5rem;
        }

        .resume-action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .set-primary-btn {
          background: #f8f9fa;
          color: #0066cc;
          border: 1px solid #0066cc;
        }

        .set-primary-btn:hover {
          background: #0066cc;
          color: white;
        }

        .delete-resume-btn {
          background: #f8f9fa;
          color: #dc3545;
          border: 1px solid #dc3545;
        }

        .delete-resume-btn:hover {
          background: #dc3545;
          color: white;
        }

        .upload-progress {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: #0066cc;
          transition: width 0.3s ease;
        }

        .empty-resume-state {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .empty-resume-state .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Delete Confirmation Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-icon {
          color: #dc3545;
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .modal-title {
          margin: 0;
          color: #212529;
          font-size: 1.25rem;
        }

        .modal-body {
          margin-bottom: 2rem;
          color: #495057;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn-cancel {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .modal-btn-cancel:hover {
          background: #e9ecef;
        }

        .modal-btn-delete {
          background: #dc3545;
          color: white;
        }

        .modal-btn-delete:hover {
          background: #c82333;
        }
      `}</style>

      {/* Delete Resume Confirmation Modal */}
      {showResumeDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowResumeDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaExclamationTriangle className="modal-icon" />
              <h3 className="modal-title">Delete Resume</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{showResumeDeleteConfirm.originalName}</strong>?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowResumeDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="modal-btn modal-btn-delete"
                onClick={() => handleDeleteResume(showResumeDeleteConfirm.id)}
              >
                Delete Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
