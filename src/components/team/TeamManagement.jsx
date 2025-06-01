import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEnvelope, 
  FaUserCheck, 
  FaUserTimes,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaUserCog,
  FaTimes,
  FaSave
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import apiService from '../../services/api/apiService';
import './TeamManagement.css';

const TeamManagement = ({ projectId, isEmbedded = false }) => {
  const { success, error: showError } = useNotification();
  const [teamMembers, setTeamMembers] = useState([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'developer',
    responsibilities: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  // Predefined roles
  const roles = [
    { value: 'project-manager', label: 'Project Manager', icon: <FaUserCog /> },
    { value: 'lead-developer', label: 'Lead Developer', icon: <FaUser /> },
    { value: 'developer', label: 'Developer', icon: <FaUser /> },
    { value: 'designer', label: 'Designer', icon: <FaUser /> },
    { value: 'qa-tester', label: 'QA Tester', icon: <FaUser /> },
    { value: 'client', label: 'Client', icon: <FaUser /> },
    { value: 'stakeholder', label: 'Stakeholder', icon: <FaUser /> }
  ];

  // Load team members
  useEffect(() => {
    if (projectId) {
      loadTeamMembers();
    }
  }, [projectId]);  const loadTeamMembers = async () => {
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
          responsibilities: member.responsibilities || '',
          joinDate: member.joinedAt ? new Date(member.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isActive: member.isActive === 1 || member.isActive === true,
          // Additional fields from API
          projectId: member.projectId,
          avatar: member.user?.profile?.avatar,
          title: member.user?.profile?.title,
          bio: member.user?.profile?.bio,
          phone: member.user?.profile?.phone,
          hourlyRate: member.user?.profile?.hourlyRate,
          department: member.user?.profile?.department,
          skills: member.user?.profile?.skills,
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
        showError('Please log in to view team members.');
      } else {
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
      setIsLoading(true);      const response = await apiService.projects.team.add(projectId, newMember);
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
      success('Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      showError('Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateMember = async () => {
    if (!editingMember.name.trim() || !editingMember.email.trim()) {
      showError('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use userId for the endpoint, falling back to id if userId not available
      const userIdToUpdate = editingMember.userId || editingMember.user_id || editingMember.id;
      console.log('🔄 Updating team member:', {
        memberName: editingMember.name,
        memberId: editingMember.id,
        userId: userIdToUpdate,
        projectId,
        editingData: editingMember
      });
      
      await apiService.projects.team.update(projectId, userIdToUpdate, editingMember);
      
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
        showError('Failed to remove team member');      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditMember = (member) => {
    console.log('📝 Editing member:', member);
    console.log('📋 Member responsibilities:', member.responsibilities);
    setEditingMember({ ...member });
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
      case 'project-manager': return 'team-role-badge-primary';
      case 'lead-developer': return 'team-role-badge-success';
      case 'developer': return 'team-role-badge-info';
      case 'designer': return 'team-role-badge-purple';
      case 'qa-tester': return 'team-role-badge-warning';
      case 'client': return 'team-role-badge-dark';
      case 'stakeholder': return 'team-role-badge-secondary';
      default: return 'team-role-badge-default';
    }
  };  // Filter team members - ensure teamMembers is always an array with enhanced search
  const filteredMembers = (Array.isArray(teamMembers) ? teamMembers : []).filter(member => {
    if (!searchTerm && selectedRole === 'all') return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      (member.responsibilities && member.responsibilities.toLowerCase().includes(searchLower)) ||
      (member.department && member.department.toLowerCase().includes(searchLower)) ||
      getRoleLabel(member.role).toLowerCase().includes(searchLower)
    );
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading && teamMembers.length === 0) {
    return (
      <div className="team-management-loading">
        <FaSpinner className="spinner" />
        <span>Loading team members...</span>
      </div>
    );
  }

  return (
    <div className={`team-management-container ${isEmbedded ? 'embedded' : ''}`}>
      {!isEmbedded && (
        <div className="team-management-header">
          <div className="team-header-left">
            <h2><FaUsers /> Team Management</h2>
            <p className="team-header-description">
              Manage project team members, roles, and responsibilities
            </p>
          </div>
          <div className="team-header-actions">
            <button 
              className="btn-primary team-add-btn"
              onClick={() => setIsAddingMember(true)}
              disabled={isLoading}
            >
              <FaPlus /> Add Member
            </button>
          </div>
        </div>
      )}      {/* Team Statistics */}
      <div className="team-stats-grid">
        <div className="team-stat-card">
          <div className="team-stat-icon">
            <FaUsers />
          </div>
          <div className="team-stat-content">
            <h3>{Array.isArray(teamMembers) ? teamMembers.length : 0}</h3>
            <p>Total Members</p>
          </div>
        </div>
        
        <div className="team-stat-card">
          <div className="team-stat-icon active">
            <FaUserCheck />
          </div>
          <div className="team-stat-content">
            <h3>{Array.isArray(teamMembers) ? teamMembers.filter(m => m.isActive).length : 0}</h3>
            <p>Active Members</p>
          </div>
        </div>
        
        <div className="team-stat-card">
          <div className="team-stat-icon roles">
            <FaUserCog />
          </div>
          <div className="team-stat-content">
            <h3>{Array.isArray(teamMembers) ? new Set(teamMembers.map(m => m.role)).size : 0}</h3>
            <p>Different Roles</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="team-filters-bar">
        <div className="team-search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="team-search-input"
          />
        </div>
        
        <div className="team-role-filter">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="team-role-select"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        {isEmbedded && (
          <button 
            className="btn-outline team-add-btn-small"
            onClick={() => setIsAddingMember(true)}
            disabled={isLoading}
          >
            <FaPlus /> Add
          </button>
        )}
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {isAddingMember && (
          <motion.div
            className="team-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="team-form">
              <div className="team-form-header">
                <h3>Add Team Member</h3>
                <button 
                  className="btn-icon team-form-close"
                  onClick={() => setIsAddingMember(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="team-form-grid">
                <div className="team-form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="team-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="team-form-group">
                  <label>Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="team-form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    value={newMember.joinDate}
                    onChange={(e) => setNewMember(prev => ({ ...prev, joinDate: e.target.value }))}
                  />
                </div>
                
                <div className="team-form-group team-form-group-full">
                  <label>Responsibilities</label>
                  <textarea
                    placeholder="Describe their main responsibilities..."
                    value={newMember.responsibilities}
                    onChange={(e) => setNewMember(prev => ({ ...prev, responsibilities: e.target.value }))}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="team-form-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setIsAddingMember(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleAddMember}
                  disabled={isLoading || !newMember.name.trim() || !newMember.email.trim()}
                >
                  {isLoading ? <FaSpinner className="spinner" /> : <FaSave />}
                  Add Member
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Team Members List */}
      <div className="team-members-container">
        {filteredMembers.length === 0 ? (
          <div className="team-empty-state">
            <FaUsers className="empty-icon" />            <h3>No team members found</h3>
            <p>
              {!Array.isArray(teamMembers) || teamMembers.length === 0 
                ? "Start by adding team members to this project."
                : "Try adjusting your search criteria."
              }
            </p>
            {(!Array.isArray(teamMembers) || teamMembers.length === 0) && (
              <button 
                className="btn-primary"
                onClick={() => setIsAddingMember(true)}
              >
                <FaPlus /> Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className={`team-members-grid ${filteredMembers.length > 6 ? 'scrollable' : ''}`}>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                className="team-member-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {editingMember && editingMember.id === member.id ? (
                  // Edit form
                  <div className="team-member-edit-form">
                    <div className="team-edit-header">
                      <h4>Edit Member</h4>
                      <button 
                        className="btn-icon"
                        onClick={() => setEditingMember(null)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="team-edit-fields">
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
                      
                      <select
                        value={editingMember.role}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, role: e.target.value }))}
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                        <textarea
                        placeholder="Responsibilities"
                        value={editingMember.responsibilities || ''}
                        onChange={(e) => {
                          console.log('📝 Responsibilities field changing:', e.target.value);
                          setEditingMember(prev => ({ ...prev, responsibilities: e.target.value }));
                        }}
                        rows="2"
                      />
                    </div>
                    
                    <div className="team-edit-actions">
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => setEditingMember(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary btn-sm"
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
                    <div className="team-member-header">
                      <div className="team-member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="team-member-info">
                        <h4 className="team-member-name">{member.name}</h4>
                        <p className="team-member-email">{member.email}</p>
                      </div>
                      <div className="team-member-status">
                        {member.isActive ? (
                          <span className="team-status-badge active">
                            <FaCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="team-status-badge inactive">
                            <FaUserTimes /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="team-member-details">
                      <div className="team-member-role">
                        <span className={`team-role-badge ${getRoleBadgeClass(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      
                      {member.responsibilities && (
                        <p className="team-member-responsibilities">
                          {member.responsibilities}
                        </p>
                      )}
                      
                      <div className="team-member-meta">
                        <span className="team-join-date">
                          Joined: {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="team-member-actions">
                      <button 
                        className="btn-icon team-action-edit"
                        onClick={() => handleEditMember(member)}
                        title="Edit member"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-icon team-action-email"
                        onClick={() => window.open(`mailto:${member.email}`)}
                        title="Send email"
                      >
                        <FaEnvelope />
                      </button>
                      <button 
                        className="btn-icon team-action-remove"
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

export default TeamManagement;
