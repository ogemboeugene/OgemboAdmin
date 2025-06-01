import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaPlus, FaEdit, FaTrash, FaEnvelope, FaSpinner, 
  FaSave, FaTimes, FaUserCheck, FaUserCog, FaUser, FaUserTimes,
  FaCheckCircle, FaSearch
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api/apiService';
import './ProjectTeamManagement.css';

const ProjectTeamManagement = ({ projectId }) => {
  const { success, error: showError } = useNotification();
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // State for searchable role dropdown
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [editRoleSearchTerm, setEditRoleSearchTerm] = useState('');
  const [showEditRoleDropdown, setShowEditRoleDropdown] = useState(false);
    // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'member', // Using 'member' as default since it's a common backend role
    responsibilities: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true
  });
  // Complete role options from backend schema
  const roles = [
    // Core Management Roles
    { value: 'owner', label: 'Owner', icon: <FaUserCog />, category: 'Management' },
    { value: 'admin', label: 'Admin', icon: <FaUserCog />, category: 'Management' },
    { value: 'project-manager', label: 'Project Manager', icon: <FaUserCog />, category: 'Management' },
    { value: 'product-manager', label: 'Product Manager', icon: <FaUserCog />, category: 'Management' },
    { value: 'product-owner', label: 'Product Owner', icon: <FaUserCog />, category: 'Management' },
    { value: 'team-lead', label: 'Team Lead', icon: <FaUserCog />, category: 'Management' },
    { value: 'technical-lead', label: 'Technical Lead', icon: <FaUserCog />, category: 'Management' },
    { value: 'scrum-master', label: 'Scrum Master', icon: <FaUserCog />, category: 'Management' },
    { value: 'manager', label: 'Manager', icon: <FaUserCog />, category: 'Management' },
    { value: 'operations-manager', label: 'Operations Manager', icon: <FaUserCog />, category: 'Management' },

    // Development Roles
    { value: 'lead-developer', label: 'Lead Developer', icon: <FaUser />, category: 'Development' },
    { value: 'senior-developer', label: 'Senior Developer', icon: <FaUser />, category: 'Development' },
    { value: 'developer', label: 'Developer', icon: <FaUser />, category: 'Development' },
    { value: 'junior-developer', label: 'Junior Developer', icon: <FaUser />, category: 'Development' },
    { value: 'frontend-developer', label: 'Frontend Developer', icon: <FaUser />, category: 'Development' },
    { value: 'backend-developer', label: 'Backend Developer', icon: <FaUser />, category: 'Development' },
    { value: 'full-stack-developer', label: 'Full Stack Developer', icon: <FaUser />, category: 'Development' },
    { value: 'mobile-developer', label: 'Mobile Developer', icon: <FaUser />, category: 'Development' },
    { value: 'devops-engineer', label: 'DevOps Engineer', icon: <FaUser />, category: 'Development' },
    { value: 'security-engineer', label: 'Security Engineer', icon: <FaUser />, category: 'Development' },
    { value: 'database-administrator', label: 'Database Administrator', icon: <FaUser />, category: 'Development' },
    { value: 'solution-architect', label: 'Solution Architect', icon: <FaUser />, category: 'Development' },
    { value: 'system-architect', label: 'System Architect', icon: <FaUser />, category: 'Development' },

    // Design Roles
    { value: 'designer', label: 'Designer', icon: <FaUser />, category: 'Design' },
    { value: 'ui-designer', label: 'UI Designer', icon: <FaUser />, category: 'Design' },
    { value: 'ux-designer', label: 'UX Designer', icon: <FaUser />, category: 'Design' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer', icon: <FaUser />, category: 'Design' },
    { value: 'graphic-designer', label: 'Graphic Designer', icon: <FaUser />, category: 'Design' },
    { value: 'product-designer', label: 'Product Designer', icon: <FaUser />, category: 'Design' },

    // Quality Assurance
    { value: 'qa-engineer', label: 'QA Engineer', icon: <FaUser />, category: 'Quality Assurance' },
    { value: 'qa-lead', label: 'QA Lead', icon: <FaUser />, category: 'Quality Assurance' },
    { value: 'test-engineer', label: 'Test Engineer', icon: <FaUser />, category: 'Quality Assurance' },

    // Analysis & Data
    { value: 'business-analyst', label: 'Business Analyst', icon: <FaUser />, category: 'Analysis' },
    { value: 'data-analyst', label: 'Data Analyst', icon: <FaUser />, category: 'Analysis' },
    { value: 'data-scientist', label: 'Data Scientist', icon: <FaUser />, category: 'Analysis' },

    // Content & Marketing
    { value: 'technical-writer', label: 'Technical Writer', icon: <FaUser />, category: 'Content' },
    { value: 'content-creator', label: 'Content Creator', icon: <FaUser />, category: 'Content' },
    { value: 'marketing-specialist', label: 'Marketing Specialist', icon: <FaUser />, category: 'Marketing' },
    { value: 'community-manager', label: 'Community Manager', icon: <FaUser />, category: 'Marketing' },

    // Business & Sales
    { value: 'sales-representative', label: 'Sales Representative', icon: <FaUser />, category: 'Business' },
    { value: 'client-representative', label: 'Client Representative', icon: <FaUser />, category: 'Business' },
    { value: 'customer-success', label: 'Customer Success', icon: <FaUser />, category: 'Business' },

    // Support & Services
    { value: 'support-engineer', label: 'Support Engineer', icon: <FaUser />, category: 'Support' },
    { value: 'consultant', label: 'Consultant', icon: <FaUser />, category: 'Support' },

    // External & Temporary
    { value: 'contractor', label: 'Contractor', icon: <FaUser />, category: 'External' },
    { value: 'freelancer', label: 'Freelancer', icon: <FaUser />, category: 'External' },
    { value: 'vendor', label: 'Vendor', icon: <FaUser />, category: 'External' },
    { value: 'external-collaborator', label: 'External Collaborator', icon: <FaUser />, category: 'External' },
    { value: 'intern', label: 'Intern', icon: <FaUser />, category: 'External' },
    { value: 'trainee', label: 'Trainee', icon: <FaUser />, category: 'External' },

    // Stakeholders & Governance
    { value: 'stakeholder', label: 'Stakeholder', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'sponsor', label: 'Sponsor', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'reviewer', label: 'Reviewer', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'approver', label: 'Approver', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'auditor', label: 'Auditor', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'compliance-officer', label: 'Compliance Officer', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'legal-advisor', label: 'Legal Advisor', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'finance-controller', label: 'Finance Controller', icon: <FaUser />, category: 'Stakeholders' },
    { value: 'hr-representative', label: 'HR Representative', icon: <FaUser />, category: 'Stakeholders' },

    // Basic Access
    { value: 'member', label: 'Member', icon: <FaUser />, category: 'Basic' },
    { value: 'viewer', label: 'Viewer', icon: <FaUser />, category: 'Basic' },
    { value: 'guest', label: 'Guest', icon: <FaUser />, category: 'Basic' },
    { value: 'observer', label: 'Observer', icon: <FaUser />, category: 'Basic' }
  ];

  // Load team members
  useEffect(() => {
    if (projectId) {
      loadTeamMembers();
    }
  }, [projectId]);
  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Debug authentication before making request
      const token = localStorage.getItem('access_token');
      console.log('🔍 Authentication debug:', {
        projectId,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
        localStorageKeys: Object.keys(localStorage)
      });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
        console.log('🔍 Loading team members for project:', projectId);
      const response = await apiService.projects.team.get(projectId);
      console.log('✅ Team members response:', response);
      
      // Parse the response according to the expected structure
      let teamData = [];
      if (response.data && response.data.success && response.data.data) {
        // Handle the expected API response structure
        const apiTeamMembers = response.data.data.teamMembers || [];
        
        // Transform API data to match UI expectations
        teamData = apiTeamMembers.map(member => ({
          id: member.id,
          userId: member.userId,
          name: member.user?.profile ? 
            `${member.user.profile.firstName || ''} ${member.user.profile.lastName || ''}`.trim() || 
            member.user.email?.split('@')[0] || 'Unknown User' : 'Unknown User',
          email: member.user?.email || 'No email',
          role: member.role || 'member',
          responsibilities: member.responsibilities || member.description || '',
          joinDate: member.joinedAt ? new Date(member.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isActive: member.isActive === 1 || member.isActive === true,
          // Additional fields from API
          projectId: member.projectId,
          avatar: member.user?.profile?.avatar,
          title: member.user?.profile?.title,
          bio: member.user?.profile?.bio,
          phone: member.user?.profile?.phone,
          hourlyRate: member.user?.profile?.hourlyRate,
          availability: member.user?.profile?.availability,
          // Full user data for advanced features
          userData: member.user
        }));
        
        console.log('🔄 Transformed team data:', teamData);
      } else {
        // Handle alternative response structures
        const members = response.data?.teamMembers || response.data || [];
        teamData = Array.isArray(members) ? members : [];
      }
      
      setTeamMembers(teamData);
      console.log(`✅ Loaded ${teamData.length} team members successfully`);
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
        if (error.response?.status === 403) {
        showError('Access denied. You may not have permission to view team members.');
      } else if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        console.log('📝 No team members found for this project - showing empty state');
        setTeamMembers([]); // Set empty array to show "No team members found" message
        return; // Exit early, don't show error or mock data
      } else if (error.message?.includes('No authentication token')) {
        showError('Please log in to view team members.');      } else {
        showError('Failed to load team members');
        setTeamMembers([]); // Set empty array on error
        return; // Exit early, don't show mock data
      }
      
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      showError('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      
      // Debug: Check token availability
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      console.log('🔍 Token check before API call:', token ? 'Token found' : 'No token found');
      console.log('📦 Sending team member data:', newMember);
      console.log('🎯 Project ID:', projectId);
        const response = await apiService.projects.team.add(projectId, newMember);
      console.log('✅ Add team member response:', response);
      
      // Use the actual response data if available, otherwise create local data
      let newTeamMember;
      if (response.data && response.data.id) {
        // Use the actual team member data from the API response
        newTeamMember = response.data;
      } else if (response.data && response.data.data && response.data.data.id) {
        // Handle nested response structure
        newTeamMember = response.data.data;
      } else {
        // For development/fallback, create local data but with proper user ID structure
        newTeamMember = {
          id: Date.now(), // This should be replaced with actual userId from backend
          userId: Date.now(), // Add explicit userId field for API compatibility
          ...newMember
        };
      }
      
      setTeamMembers(prev => [...prev, newTeamMember]);
      setNewMember({
        name: '',
        email: '',
        role: 'developer',
        responsibilities: '',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
      });
      setIsAddingMember(false);
      success('Team member added successfully');    } catch (error) {
      console.error('❌ Error adding team member:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Handle different error types
      if (error.response?.status === 403) {
        showError('Access denied. Please check your authentication.');
        console.error('🔐 Authentication failed - token may be invalid or expired');
      } else if (error.response?.status === 401) {
        showError('Unauthorized. Please log in again.');
        console.error('🔑 Authentication required - no valid token');
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Failed to add team member');
      }
    } finally {
      setIsLoading(false);
    }
  };  const handleUpdateMember = async () => {
    if (!editingMember.name.trim() || !editingMember.email.trim()) {
      showError('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use userId for the endpoint, falling back to id if userId not available
      const userIdToUpdate = editingMember.userId || editingMember.user_id || editingMember.id;
      
      // Enhanced debugging log specifically for responsibilities field
      console.log('🔍 Responsibilities field debug:', {
        value: editingMember.responsibilities,
        type: typeof editingMember.responsibilities,
        isEmpty: editingMember.responsibilities === '',
        isUndefined: editingMember.responsibilities === undefined,
        isNull: editingMember.responsibilities === null
      });
      
      console.log('🔄 Updating team member:', {
        memberName: editingMember.name,
        memberId: editingMember.id,
        userId: userIdToUpdate,
        projectId,
        editingData: editingMember
      });
      
      // Ensure responsibilities is defined before sending to API
      const memberDataToUpdate = {
        ...editingMember,
        responsibilities: editingMember.responsibilities !== undefined ? editingMember.responsibilities : ''
      };
      
      await apiService.projects.team.update(projectId, userIdToUpdate, memberDataToUpdate);
      
      // Update local state
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === editingMember.id ? editingMember : member
        )
      );
      
      setEditingMember(null);
      success('Team member updated successfully');
    } catch (error) {
      console.error('❌ Error updating team member:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 404) {
        showError('Team member not found. They may have been removed.');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to update this team member.');
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please log in again.');
      } else {
        showError('Failed to update team member');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveMember = async (member) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      setIsLoading(true);
        // Use userId if available, otherwise fall back to id
      const userIdToDelete = member.userId || member.user_id || member.id;
      console.log('🗑️ Removing team member:', {
        memberName: member.name,
        memberId: member.id,
        userId: userIdToDelete,
        projectId
      });
      
      // Try primary endpoint first, then fallback
      try {
        await apiService.projects.team.remove(projectId, userIdToDelete);
      } catch (primaryError) {
        console.warn('⚠️ Primary delete endpoint failed, trying alternative...', primaryError);
        
        if (primaryError.response?.status === 404) {
          // Try alternative endpoint
          try {
            await apiService.projects.team.removeMember(projectId, userIdToDelete);
            console.log('✅ Alternative delete endpoint succeeded');
          } catch (altError) {
            console.error('❌ Both delete endpoints failed:', altError);
            throw altError; // Re-throw the alternative error
          }
        } else {
          throw primaryError; // Re-throw non-404 errors immediately
        }
      }
      
      // Update local state - filter by the member's id (not userId)
      setTeamMembers(prev => prev.filter(m => m.id !== member.id));
      success('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      
      // Enhanced error handling for 404 errors
      if (error.response?.status === 404) {
        showError('Team member not found. They may have already been removed.');
        // Still remove from local state in case of sync issues
        setTeamMembers(prev => prev.filter(m => m.id !== member.id));
      } else if (error.response?.status === 403) {
        showError('You do not have permission to remove this team member.');
      } else if (error.response?.status === 401) {
        showError('Authentication required. Please log in again.');
      } else {
        showError('Failed to remove team member');
      }
    } finally {
      setIsLoading(false);
    }
  };  const handleEditMember = (member) => {
    console.log('📝 Editing member:', member);
    console.log('📋 Member responsibilities:', member.responsibilities);
    // Ensure responsibilities is always defined even if it's an empty string
    // This prevents undefined values from being passed to the form
    setEditingMember({ 
      ...member,
      responsibilities: member.responsibilities || '' 
    });
  };

  const getRoleLabel = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getRoleIcon = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.icon : <FaUser />;
  };
  const getRoleBadgeClass = (roleValue) => {
    switch (roleValue) {
      case 'project-manager': return 'project-manager';
      case 'lead-developer': return 'lead-developer';
      case 'developer': return 'developer';
      case 'designer': return 'designer';
      case 'qa-tester': return 'qa-tester';
      case 'client': return 'client';
      case 'stakeholder': return 'stakeholder';
      default: return 'developer';
    }
  };

  // Filter roles based on search term
  const filterRoles = (searchTerm) => {
    if (!searchTerm.trim()) return roles;
    
    return roles.filter(role => 
      role.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.category && role.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  // Searchable Role Select Component
  const SearchableRoleSelect = ({ 
    value, 
    onChange, 
    searchTerm, 
    setSearchTerm, 
    showDropdown, 
    setShowDropdown,
    placeholder = "Search and select role..." 
  }) => {
    const filteredRoles = filterRoles(searchTerm);
    const selectedRole = roles.find(r => r.value === value);
    const displayValue = selectedRole ? selectedRole.label : '';

    const handleInputChange = (e) => {
      setSearchTerm(e.target.value);
      if (!showDropdown) {
        setShowDropdown(true);
      }
    };

    const handleInputFocus = () => {
      setShowDropdown(true);
      // Only clear search term if there's no current search
      if (!searchTerm) {
        setSearchTerm('');
      }
    };

    const handleInputBlur = () => {
      // Delay hiding dropdown to allow click on options
      setTimeout(() => {
        setShowDropdown(false);
        // Reset search term when closing dropdown
        setSearchTerm('');
      }, 200);
    };

    return (
      <div className="project-team-searchable-select">
        <div className="project-team-select-input-container">
          <input
            type="text"
            placeholder={showDropdown ? "Type to search roles..." : (displayValue || placeholder)}
            value={showDropdown ? searchTerm : displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="project-team-select-input"
          />
          <div 
            className={`project-team-select-arrow ${showDropdown ? 'open' : ''}`}
            onClick={() => {
              if (showDropdown) {
                setShowDropdown(false);
                setSearchTerm('');
              } else {
                setShowDropdown(true);
                setSearchTerm('');
              }
            }}
          >
            ▼
          </div>
        </div>        {showDropdown && (
          <div className="project-team-select-dropdown">
            <div className="project-team-select-options">
              {filteredRoles.length === 0 ? (
                <div className="project-team-select-no-results">
                  No roles found matching "{searchTerm}"
                </div>
              ) : (
                filteredRoles.slice(0, 5).map((role, index) => (
                  <div
                    key={role.value}
                    className={`project-team-select-option ${value === role.value ? 'selected' : ''}`}
                    onMouseDown={(e) => {
                      // Prevent input blur when clicking option
                      e.preventDefault();
                    }}
                    onClick={() => {
                      onChange(role.value);
                      setSearchTerm('');
                      setShowDropdown(false);
                    }}
                  >
                    <div className="project-team-option-content">
                      <span className="project-team-option-icon">{role.icon}</span>
                      <div className="project-team-option-text">
                        <div className="project-team-option-label">{role.label}</div>
                        <div className="project-team-option-category">{role.category}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {filteredRoles.length > 5 && (
                <div className="project-team-select-scrollable">
                  {filteredRoles.slice(5).map((role, index) => (
                    <div
                      key={role.value}
                      className={`project-team-select-option ${value === role.value ? 'selected' : ''}`}
                      onMouseDown={(e) => {
                        // Prevent input blur when clicking option
                        e.preventDefault();
                      }}
                      onClick={() => {
                        onChange(role.value);
                        setSearchTerm('');
                        setShowDropdown(false);
                      }}
                    >
                      <div className="project-team-option-content">
                        <span className="project-team-option-icon">{role.icon}</span>
                        <div className="project-team-option-text">
                          <div className="project-team-option-label">{role.label}</div>
                          <div className="project-team-option-category">{role.category}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter team members - ensure teamMembers is always an array
  const filteredMembers = (Array.isArray(teamMembers) ? teamMembers : []).filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading && (Array.isArray(teamMembers) ? teamMembers.length : 0) === 0) {
    return (
      <div className="project-team-management-container">
        <div className="project-team-management-header">
          <div className="project-team-icon">
            <FaSpinner className="project-team-spinner" />
          </div>
          <h3 className="project-team-title">Loading team...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="project-team-management-container">
      <div className="project-team-management-header">
        <div className="project-team-icon">
          <FaUsers />
        </div>
        <h3 className="project-team-title">Team Management</h3>
        <button 
          className="project-team-add-button"
          onClick={() => setIsAddingMember(true)}
          disabled={isLoading}
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Team Statistics */}
      <div className="project-team-stats-grid">
        <div className="project-team-stat-card">
          <div className="project-team-stat-icon total">
            <FaUsers />
          </div>
          <div className="project-team-stat-content">
            <h3 className="project-team-stat-number">{Array.isArray(teamMembers) ? teamMembers.length : 0}</h3>
            <p className="project-team-stat-label">Total</p>
          </div>
        </div>
        
        <div className="project-team-stat-card">
          <div className="project-team-stat-icon active">
            <FaUserCheck />
          </div>
          <div className="project-team-stat-content">
            <h3 className="project-team-stat-number">{Array.isArray(teamMembers) ? teamMembers.filter(m => m.isActive).length : 0}</h3>
            <p className="project-team-stat-label">Active</p>
          </div>
        </div>
        
        <div className="project-team-stat-card">
          <div className="project-team-stat-icon roles">
            <FaUserCog />
          </div>
          <div className="project-team-stat-content">
            <h3 className="project-team-stat-number">{Array.isArray(teamMembers) ? new Set(teamMembers.map(m => m.role)).size : 0}</h3>
            <p className="project-team-stat-label">Roles</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="project-team-filters">
        <div className="project-team-search-container">
          <FaSearch className="project-team-search-icon" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="project-team-search-input"
          />
        </div>
          <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="project-team-role-select"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {isAddingMember && (
          <motion.div
            className="project-team-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="project-team-form">
              <div className="project-team-form-header">
                <h3>Add Team Member</h3>
                <button 
                  className="project-team-form-close"
                  onClick={() => setIsAddingMember(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="project-team-form-grid">
                <div className="project-team-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="project-team-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                  <div className="project-team-form-group">
                  <label>Role</label>
                  <SearchableRoleSelect
                    value={newMember.role}
                    onChange={(roleValue) => setNewMember(prev => ({ ...prev, role: roleValue }))}
                    searchTerm={roleSearchTerm}
                    setSearchTerm={setRoleSearchTerm}
                    showDropdown={showRoleDropdown}
                    setShowDropdown={setShowRoleDropdown}
                    placeholder="Search and select role..."
                  />
                </div>
                
                <div className="project-team-form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    value={newMember.joinDate}
                    onChange={(e) => setNewMember(prev => ({ ...prev, joinDate: e.target.value }))}
                  />
                </div>
                
                <div className="project-team-form-group">
                  <label>Responsibilities</label>
                  <textarea
                    placeholder="Describe their main responsibilities..."
                    value={newMember.responsibilities}
                    onChange={(e) => setNewMember(prev => ({ ...prev, responsibilities: e.target.value }))}
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="project-team-form-actions">
                <button 
                  className="project-team-form-button secondary"
                  onClick={() => setIsAddingMember(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  className="project-team-form-button primary"
                  onClick={handleAddMember}
                  disabled={isLoading || !newMember.name.trim() || !newMember.email.trim()}
                >
                  {isLoading ? <FaSpinner className="project-team-spinner" /> : <FaSave />}
                  Add Member
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Members List */}
      <div className="project-team-members-container">
        {filteredMembers.length === 0 ? (
          <div className="project-team-empty-state">
            <FaUsers className="project-team-empty-icon" />
            <h3>No team members found</h3>
            <p>
              {(Array.isArray(teamMembers) ? teamMembers.length : 0) === 0 
                ? "Start by adding team members to this project."
                : "Try adjusting your search criteria."
              }
            </p>
            {(Array.isArray(teamMembers) ? teamMembers.length : 0) === 0 && (
              <button 
                className="project-team-add-button"
                onClick={() => setIsAddingMember(true)}
              >
                <FaPlus /> Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className="project-team-members-grid">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                className="project-team-member-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {editingMember && editingMember.id === member.id ? (
                  // Edit form
                  <div className="project-team-edit-form">
                    <div className="project-team-edit-header">
                      <h4>Edit Member</h4>
                      <button 
                        className="project-team-form-close"
                        onClick={() => setEditingMember(null)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="project-team-edit-fields">
                      <input
                        type="text"
                        placeholder="Name"
                        value={editingMember.name}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                      />
                      
                      <input
                        type="email"
                        placeholder="Email"
                        value={editingMember.email}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, email: e.target.value }))}
                      />
                        <SearchableRoleSelect
                        value={editingMember.role}
                        onChange={(roleValue) => setEditingMember(prev => ({ ...prev, role: roleValue }))}
                        searchTerm={editRoleSearchTerm}
                        setSearchTerm={setEditRoleSearchTerm}
                        showDropdown={showEditRoleDropdown}
                        setShowDropdown={setShowEditRoleDropdown}
                        placeholder="Search and select role..."
                      />
                        <textarea                        placeholder="Responsibilities"
                        value={editingMember.responsibilities}
                        onChange={(e) => {
                          console.log('📝 Responsibilities field changing:', e.target.value);
                          setEditingMember(prev => ({ ...prev, responsibilities: e.target.value }));
                        }}
                        rows="2"
                      />
                    </div>
                    
                    <div className="project-team-edit-actions">
                      <button 
                        className="project-team-edit-button secondary"
                        onClick={() => setEditingMember(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="project-team-edit-button primary"
                        onClick={handleUpdateMember}
                        disabled={isLoading}
                      >
                        <FaSave /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="project-team-member-header">
                      <div className="project-team-member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="project-team-member-info">
                        <h4 className="project-team-member-name">{member.name}</h4>
                        <p className="project-team-member-email">{member.email}</p>
                      </div>
                      <div className="project-team-member-status">
                        {member.isActive ? (
                          <span className="project-team-status-badge active">
                            <FaCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="project-team-status-badge inactive">
                            <FaUserTimes /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="project-team-member-details">
                      <div className="project-team-member-role">
                        <span className={`project-team-role-badge ${getRoleBadgeClass(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      
                      {member.responsibilities && (
                        <p className="project-team-member-responsibilities">
                          {member.responsibilities}
                        </p>
                      )}
                      
                      <div className="project-team-member-meta">
                        <span>
                          Joined: {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="project-team-member-actions">
                      <button 
                        className="project-team-action-button project-team-action-edit"
                        onClick={() => handleEditMember(member)}
                        title="Edit member"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="project-team-action-button project-team-action-email"
                        onClick={() => window.open(`mailto:${member.email}`)}
                        title="Send email"
                      >
                        <FaEnvelope />
                      </button>
                      <button 
                        className="project-team-action-button project-team-action-remove"
                        onClick={() => handleRemoveMember(member)}
                        title="Remove member"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTeamManagement;
