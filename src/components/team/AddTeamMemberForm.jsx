import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaUserTag, FaCalendarAlt, FaFileText, FaPlus, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import './AddTeamMemberForm.css';

const AddTeamMemberForm = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    permissions: ['read'],
    joinDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    responsibilities: '',
    department: '',
    hourlyRate: '',
    skills: [],
    portfolio: '',
    linkedin: '',
    github: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [inputFormat, setInputFormat] = useState('form'); // 'form' or 'json'
  const [jsonInput, setJsonInput] = useState('');

  const roles = [
    'Project Lead',
    'Project Manager', 
    'Developer',
    'Senior Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Designer',
    'UI/UX Designer',
    'Graphic Designer',
    'QA Tester',
    'Business Analyst',
    'DevOps Engineer',
    'Data Scientist',
    'Consultant',
    'Member',
    'Viewer'
  ];

  const permissionOptions = [
    { value: 'read', label: 'Read', description: 'Can view project details' },
    { value: 'write', label: 'Write', description: 'Can edit project content' },
    { value: 'admin', label: 'Admin', description: 'Can manage team and settings' },
    { value: 'delete', label: 'Delete', description: 'Can delete project content' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (inputFormat === 'json') {
      // Handle JSON input
      try {
        const jsonData = JSON.parse(jsonInput);
        onSubmit(jsonData);
      } catch (error) {
        alert('Invalid JSON format. Please check your input.');
        return;
      }
    } else {
      // Handle form input
      const submitData = {
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
      };
      onSubmit(submitData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Member',
      permissions: ['read'],
      joinDate: new Date().toISOString().split('T')[0],
      responsibilities: '',
      department: '',
      hourlyRate: '',
      skills: [],
      portfolio: '',
      linkedin: '',
      github: ''
    });
    setJsonInput('');
    setNewSkill('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Sample JSON for user reference
  const sampleJson1 = {
    "user_id": 0,
    "role": "owner",
    "permissions": "string"
  };

  const sampleJson2 = {
    "name": "Eugine Eugine",
    "email": "mrkarwega@gmail.com", 
    "role": "Member",
    "joinDate": "2025-06-01",
    "responsibilities": "Describe the responsibilities"
  };

  const sampleJson3 = {
    "firstName": "John",
    "lastName": "Smith", 
    "email": "john.smith@example.com",
    "role": "Developer",
    "permissions": ["read", "write"],
    "department": "Engineering",
    "skills": ["React", "Node.js", "JavaScript"],
    "hourlyRate": 75.00
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Add Team Member"
      size="large"
    >
      <div className="add-team-member-form">
        {/* Input Format Toggle */}
        <div className="format-toggle">
          <Button
            variant={inputFormat === 'form' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setInputFormat('form')}
          >
            Form Input
          </Button>
          <Button
            variant={inputFormat === 'json' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setInputFormat('json')}
          >
            JSON Input
          </Button>
        </div>

        <form onSubmit={handleFormSubmit}>
          {inputFormat === 'form' ? (
            // Form Input Mode
            <>
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <FaUser /> Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope /> Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">
                      <FaUserTag /> Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="joinDate">
                      <FaCalendarAlt /> Join Date
                    </label>
                    <input
                      type="date"
                      id="joinDate"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="form-section">
                <h3>Permissions</h3>
                <div className="permissions-grid">
                  {permissionOptions.map(option => (
                    <label key={option.value} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(option.value)}
                        onChange={() => handlePermissionChange(option.value)}
                      />
                      <span className="permission-label">
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h3>Additional Information</h3>
                
                <div className="form-group">
                  <label htmlFor="responsibilities">
                    <FaFileText /> Responsibilities
                  </label>
                  <textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    placeholder="Describe the responsibilities"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Engineering, Design"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="hourlyRate">Hourly Rate ($)</label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="form-group">
                  <label>Skills</label>
                  <div className="skills-input">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill} size="small">
                      <FaPlus />
                    </Button>
                  </div>
                  <div className="skills-list">
                    {formData.skills.map(skill => (
                      <span key={skill} className="skill-tag">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)}>
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="portfolio">Portfolio URL</label>
                    <input
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://portfolio.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="linkedin">LinkedIn URL</label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // JSON Input Mode
            <div className="json-input-section">
              <h3>JSON Input</h3>
              <p>Enter team member data in JSON format. Supports multiple formats:</p>
              
              {/* Sample JSON Examples */}
              <div className="json-samples">
                <div className="sample-item">
                  <h4>Format 1 (API Style):</h4>
                  <pre>{JSON.stringify(sampleJson1, null, 2)}</pre>
                </div>
                
                <div className="sample-item">
                  <h4>Format 2 (Form Style):</h4>
                  <pre>{JSON.stringify(sampleJson2, null, 2)}</pre>
                </div>
                
                <div className="sample-item">
                  <h4>Format 3 (Detailed):</h4>
                  <pre>{JSON.stringify(sampleJson3, null, 2)}</pre>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="jsonInput">JSON Data *</label>
                <textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  rows="10"
                  required
                  className="json-textarea"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Add Team Member
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTeamMemberForm;
