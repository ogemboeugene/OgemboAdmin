import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaLink, 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaChevronDown,
  FaTh,
  FaList,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaAward,
  FaCog,
  FaExternalLinkAlt,
  FaGlobe,
  FaTimes,
  FaCode
} from 'react-icons/fa';
import { formatDate, truncateText } from '../../utils/formatters';
import apiService from '../../services/api/apiService';

const ViewAllExperience = () => {
  const navigate = useNavigate();
  
  // State management
  const [experienceList, setExperienceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('cards');  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch experience data
  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.experience.getAll();
      
      // Extract experience data from nested response structure
      const experiences = response.data?.data?.experiences || [];
      setExperienceList(experiences);
      
    } catch (err) {
      console.error('Error fetching experience:', err);
      setError('Failed to load experience data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete experience
  const handleDeleteExperience = async (experience) => {
    setDeleteTarget(experience);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await apiService.experience.delete(deleteTarget.id);
      
      // Remove from local state
      setExperienceList(prev => prev.filter(exp => exp.id !== deleteTarget.id));
      
      // Show success message
      setSuccessMessage(`Successfully deleted experience: ${deleteTarget.position} at ${deleteTarget.company}`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting experience:', error);
      setError('Failed to delete experience. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and sort logic
  const filteredAndSortedExperience = useMemo(() => {
    let filtered = experienceList.filter(experience => {
      const matchesSearch = searchTerm === '' || 
        experience.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'current' && experience.current === 1) ||
        (filterBy === 'past' && experience.current === 0);

      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'company':
          aValue = a.company || '';
          bValue = b.company || '';
          break;
        case 'position':
          aValue = a.position || '';
          bValue = b.position || '';
          break;
        case 'startDate':
          aValue = new Date(a.startDate || 0);
          bValue = new Date(b.startDate || 0);
          break;
        case 'endDate':
          aValue = new Date(a.endDate || 0);
          bValue = new Date(b.endDate || 0);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [experienceList, searchTerm, sortBy, sortOrder, filterBy]);

  // Helper functions
  const getDateRange = (experience) => {
    const start = formatDate(experience.startDate);
    const end = experience.current === 1 ? 'Present' : formatDate(experience.endDate);
    return `${start} - ${end}`;
  };

  const getCompanyLogo = (experience) => {
    if (!experience.companyLogo) {
      return null;
    }
    
    return (
      <img 
        src={experience.companyLogo} 
        alt={`${experience.company || 'Company'} logo`}
        className="company-logo"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="experience-loading">
        <motion.div 
          className="loading-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaSpinner className="loading-spinner" />
          <p>Loading experience data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="experience-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error Loading Experience</h3>
        <p>{error}</p>
        <button onClick={fetchExperience} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="view-all-experience">
      {/* Header */}
      <div className="experience-header">
        <div className="header-left">
          <h1>
            <FaBriefcase className="header-icon" />
            Work Experience
          </h1>
          <p className="header-subtitle">
            Manage your professional work experience and career history
          </p>
        </div>
        <div className="header-actions">
          <Link to="/experience/new" className="add-btn">
            <FaPlus /> Add New Experience
          </Link>
        </div>      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <FaExclamationTriangle />
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <FaCheckCircle />
          {successMessage}
        </motion.div>
      )}

      {/* Controls */}
      <div className="experience-controls">
        <div className="controls-left">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search experience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Positions</option>
              <option value="current">Current Positions</option>
              <option value="past">Past Positions</option>
            </select>
          </div>

          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="company">Company</option>
              <option value="position">Position</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <FaSort />
            </button>
          </div>
        </div>

        <div className="controls-right">
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('cards')}
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              title="Card View"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {filteredAndSortedExperience.length} experience{filteredAndSortedExperience.length !== 1 ? 's' : ''} found
        </span>
        {searchTerm && (
          <span className="search-info">for "{searchTerm}"</span>
        )}
      </div>

      {/* Experience List */}
      <div className={`experience-list ${viewMode}`}>
        <AnimatePresence>
          {filteredAndSortedExperience.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FaBriefcase className="empty-icon" />
              <h3>No Experience Found</h3>
              <p>
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start building your professional profile by adding your work experience'
                }
              </p>
              {!searchTerm && filterBy === 'all' && (
                <Link to="/experience/new" className="empty-action-btn">
                  <FaPlus /> Add Your First Experience
                </Link>
              )}
            </motion.div>
          ) : (
            filteredAndSortedExperience.map((experience, index) => (
              <motion.div
                key={experience.id}
                className="experience-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Company Logo Section */}
                <div className="experience-header-section">
                  <div className="company-logo-container">
                    {getCompanyLogo(experience) || (
                      <div className="company-logo-placeholder">
                        <FaBuilding />
                      </div>
                    )}
                  </div>
                  
                  <div className="experience-main-info">
                    <h3 className="position-title">{experience.position || 'Position Not Specified'}</h3>
                    <h4 className="company-name">{experience.company || 'Company Not Specified'}</h4>
                    
                    {/* Status Badge */}
                    {experience.current === 1 && (
                      <span className="current-badge">
                        <FaCheckCircle /> Current Position
                      </span>
                    )}
                  </div>

                  <div className="experience-actions">
                    <Link 
                      to={`/experience/${experience.id}/view`}
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/experience/${experience.id}/edit`}
                      className="action-btn edit-btn"
                      title="Edit Experience"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDeleteExperience(experience)}
                      className="action-btn delete-btn"
                      title="Delete Experience"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Location and Date */}
                <div className="experience-meta">
                  {experience.location && (
                    <div className="experience-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{experience.location}</span>
                    </div>
                  )}
                  
                  <div className="experience-duration">
                    <FaCalendarAlt className="date-icon" />
                    <span>{getDateRange(experience)}</span>
                  </div>
                </div>

                {/* Description */}
                {experience.description && (
                  <div className="experience-description">
                    <p>{truncateText(experience.description, viewMode === 'cards' ? 150 : 250)}</p>
                  </div>
                )}

                {/* Skills */}
                {experience.skills && experience.skills.length > 0 && (
                  <div className="experience-skills">
                    <h4>
                      <FaCode className="section-icon" />
                      Technologies & Skills
                    </h4>
                    <div className="skills-tags">
                      {experience.skills.slice(0, viewMode === 'cards' ? 6 : 10).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                      {experience.skills.length > (viewMode === 'cards' ? 6 : 10) && (
                        <span className="skill-tag more-tag">
                          +{experience.skills.length - (viewMode === 'cards' ? 6 : 10)} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {experience.achievements && experience.achievements.length > 0 && (
                  <div className="experience-achievements">
                    <h4>
                      <FaAward className="section-icon" />
                      Key Achievements
                    </h4>
                    <ul className="achievements-list">
                      {experience.achievements.slice(0, viewMode === 'cards' ? 3 : 5).map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                      {experience.achievements.length > (viewMode === 'cards' ? 3 : 5) && (
                        <li className="more-indicator">
                          +{experience.achievements.length - (viewMode === 'cards' ? 3 : 5)} more achievements
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Company Website */}
                {experience.companyUrl && (
                  <div className="experience-website">
                    <a
                      href={experience.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      <FaGlobe className="website-icon" />
                      Company Website
                      <FaExternalLinkAlt className="external-icon" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              className="delete-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Experience</h3>
                <button
                  onClick={() => !isDeleting && setShowDeleteModal(false)}
                  className="close-btn"
                  disabled={isDeleting}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="warning-icon">
                  <FaExclamationTriangle />
                </div>
                <p>
                  Are you sure you want to delete your experience at{' '}
                  <strong>{deleteTarget.company}</strong> as{' '}
                  <strong>{deleteTarget.position}</strong>?
                </p>
                <p className="warning-text">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="cancel-btn"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="delete-confirm-btn"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="spinner" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete Experience
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .view-all-experience {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header Styles */
        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .header-left h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          color: var(--gray-900);
        }

        .header-icon {
          color: var(--primary);
        }

        .header-subtitle {
          color: var(--gray-600);
          margin: 0;
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        /* Controls Styles */
        .experience-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: var(--white);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .filter-select,
        .sort-select {
          padding: 0.75rem 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .filter-select:focus,
        .sort-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .sort-group {
          display: flex;
          gap: 0.5rem;
        }

        .sort-order-btn {
          padding: 0.75rem;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-order-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .view-toggle {
          display: flex;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn {
          padding: 0.75rem 1rem;
          border: none;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          border-right: 1px solid var(--gray-200);
        }

        .view-btn:last-child {
          border-right: none;
        }

        .view-btn.active {
          background: var(--primary);
          color: white;
        }

        .view-btn:hover:not(.active) {
          background: var(--gray-50);
        }

        /* Results Summary */
        .results-summary {
          margin-bottom: 1rem;
          color: var(--gray-600);
        }

        .results-count {
          font-weight: 500;
        }

        .search-info {
          margin-left: 0.5rem;
          font-style: italic;
        }        /* Experience List Styles */
        .experience-list {
          display: grid;
          gap: 1.5rem;
        }

        .experience-list.cards {
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
        }

        .experience-list.list {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .experience-card {
          background: var(--white);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid var(--gray-100);
        }

        .experience-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        /* List View Specific Styles */
        .experience-list.list .experience-card {
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .experience-list.list .experience-header-section {
          flex: 1;
          margin-bottom: 0;
        }

        .experience-list.list .experience-main-info {
          flex: 1;
        }

        .experience-list.list .position-title {
          font-size: 1.1rem;
          margin-bottom: 0.125rem;
        }

        .experience-list.list .company-name {
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }

        .experience-list.list .experience-meta {
          display: flex;
          gap: 1rem;
          margin: 0;
          font-size: 0.875rem;
        }

        .experience-list.list .experience-description,
        .experience-list.list .skills-section,
        .experience-list.list .achievements-section,
        .experience-list.list .company-website {
          display: none;
        }

        .experience-list.list .experience-actions {
          flex-shrink: 0;
        }

        /* Experience Header Section */
        .experience-header-section {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .company-logo-container {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }

        .company-logo-placeholder {
          width: 60px;
          height: 60px;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--gray-400);
          font-size: 1.5rem;
        }

        .experience-main-info {
          flex: 1;
          min-width: 0;
        }

        .position-title {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          line-height: 1.3;
        }

        .company-name {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--primary);
        }

        .current-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--success);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .experience-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-btn {
          background: var(--blue-100);
          color: var(--blue-600);
        }

        .view-btn:hover {
          background: var(--blue-200);
        }

        .edit-btn {
          background: var(--amber-100);
          color: var(--amber-600);
        }

        .edit-btn:hover {
          background: var(--amber-200);
        }

        .delete-btn {
          background: var(--red-100);
          color: var(--red-600);
        }

        .delete-btn:hover {
          background: var(--red-200);
        }

        /* Experience Meta */
        .experience-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1rem;
          color: var(--gray-600);
        }

        .experience-location,
        .experience-duration {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .location-icon,
        .date-icon {
          color: var(--gray-400);
        }

        /* Description */
        .experience-description {
          margin-bottom: 1.5rem;
        }

        .experience-description p {
          margin: 0;
          line-height: 1.6;
          color: var(--gray-700);
        }

        /* Skills */
        .experience-skills {
          margin-bottom: 1.5rem;
        }

        .experience-skills h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--gray-800);
        }

        .section-icon {
          color: var(--primary);
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: var(--primary-light);
          color: var(--primary-dark);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .skill-tag.more-tag {
          background: var(--gray-200);
          color: var(--gray-600);
        }

        /* Achievements */
        .experience-achievements {
          margin-bottom: 1.5rem;
        }

        .experience-achievements h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--gray-800);
        }

        .achievements-list {
          margin: 0;
          padding-left: 1.25rem;
          list-style: none;
        }

        .achievements-list li {
          position: relative;
          margin-bottom: 0.5rem;
          line-height: 1.5;
          color: var(--gray-700);
        }

        .achievements-list li:before {
          content: '•';
          color: var(--primary);
          font-weight: bold;
          position: absolute;
          left: -1rem;
        }

        .more-indicator {
          color: var(--gray-500);
          font-style: italic;
        }

        /* Website Link */
        .experience-website {
          margin-top: 1rem;
        }

        .website-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .website-link:hover {
          color: var(--primary-dark);
        }

        .external-icon {
          font-size: 0.75rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--white);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--gray-300);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: var(--gray-700);
        }

        .empty-state p {
          margin: 0 0 1.5rem 0;
          color: var(--gray-500);
        }

        .empty-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .empty-action-btn:hover {
          background: var(--primary-dark);
        }

        /* Loading State */
        .experience-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-content {
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          font-size: 2rem;
          color: var(--primary);
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }        /* Error State */
        .experience-error {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--white);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .error-icon {
          font-size: 3rem;
          color: var(--red-500);
          margin-bottom: 1rem;
        }

        .retry-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .retry-btn:hover {
          background: var(--primary-dark);
        }

        /* Success and Error Messages */
        .error-message,
        .success-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          font-weight: 500;
        }

        .error-message {
          background: var(--red-100);
          color: var(--red-600);
          border: 1px solid var(--red-200);
        }

        .success-message {
          background: var(--green-100);
          color: var(--green-600);
          border: 1px solid var(--green-200);
        }

        /* Modal Styles */
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

        .delete-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--gray-900);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: var(--gray-700);
        }

        .modal-body {
          padding: 1.5rem;
          text-align: center;
        }

        .warning-icon {
          font-size: 3rem;
          color: var(--red-500);
          margin-bottom: 1rem;
        }

        .warning-text {
          color: var(--red-600);
          font-weight: 500;
          margin-top: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        .cancel-btn {
          flex: 1;
          background: var(--gray-200);
          color: var(--gray-700);
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .cancel-btn:hover:not(:disabled) {
          background: var(--gray-300);
        }

        .delete-confirm-btn {
          flex: 1;
          background: var(--red-600);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .delete-confirm-btn:hover:not(:disabled) {
          background: var(--red-700);
        }

        .delete-confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }        /* CSS Variables */
        :root {
          --primary: #6366f1;
          --primary-light: #e0e7ff;
          --primary-dark: #3730a3;
          --secondary: #10b981;
          --secondary-light: #d1fae5;
          --secondary-dark: #059669;
          --accent: #f59e0b;
          --accent-light: #fef3c7;
          --accent-dark: #d97706;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --red-100: #fee2e2;
          --red-200: #fecaca;
          --red-500: #ef4444;
          --red-600: #dc2626;
          --red-700: #b91c1c;
          --blue-100: #dbeafe;
          --blue-600: #2563eb;
          --blue-200: #bfdbfe;
          --amber-100: #fef3c7;
          --amber-200: #fde68a;
          --amber-600: #d97706;
          --green-100: #dcfce7;
          --green-200: #bbf7d0;
          --green-500: #22c55e;
          --green-600: #16a34a;
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
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .view-all-experience {
            padding: 1rem;
          }

          .experience-header {
            flex-direction: column;
            gap: 1rem;
          }

          .experience-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .controls-left {
            flex-direction: column;
            width: 100%;
          }

          .search-box {
            min-width: auto;
            width: 100%;
          }

          .experience-list.cards {
            grid-template-columns: 1fr;
          }

          .experience-header-section {
            flex-direction: column;
            text-align: center;
          }

          .experience-actions {
            align-self: center;
          }

          .experience-meta {
            justify-content: center;
          }
        }

        /* Dark Mode Support */        @media (prefers-color-scheme: dark) {
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
            --primary: #3b82f6;
            --green-50: #064e3b;
            --green-100: #065f46;
            --green-500: #10b981;
            --green-600: #059669;
            --blue-50: #1e3a8a;
            --blue-100: #1e40af;
            --blue-500: #3b82f6;
            --blue-600: #2563eb;
            --red-50: #7f1d1d;
            --red-100: #991b1b;
            --red-500: #ef4444;
            --red-600: #dc2626;
          }

          .view-all-experience {
            background: var(--gray-50);
            color: var(--gray-900);
          }

          .page-header h1 {
            color: var(--gray-900);
          }

          .page-subtitle {
            color: var(--gray-600);
          }

          .controls-section {
            background: var(--white);
            border-color: var(--gray-200);
          }

          .search-container input {
            background: var(--white);
            border-color: var(--gray-200);
            color: var(--gray-900);
          }

          .search-container input::placeholder {
            color: var(--gray-500);
          }

          .filter-controls select {
            background: var(--white);
            border-color: var(--gray-200);
            color: var(--gray-900);
          }

          .view-toggle-btn {
            background: var(--gray-100);
            color: var(--gray-700);
            border-color: var(--gray-200);
          }

          .view-toggle-btn.active {
            background: var(--primary);
            color: white;
          }

          .new-experience-btn {
            background: var(--green-600);
            color: white;
          }

          .new-experience-btn:hover {
            background: var(--green-500);
          }

          .results-summary {
            color: var(--gray-600);
          }

          .experience-card {
            background: var(--white);
            border-color: var(--gray-200);
          }

          .position-title {
            color: var(--gray-900);
          }

          .company-name {
            color: var(--gray-700);
          }

          .current-badge {
            background: var(--green-100);
            color: var(--green-600);
          }

          .action-btn {
            background: var(--gray-100);
            color: var(--gray-700);
            border-color: var(--gray-200);
          }

          .view-btn:hover {
            background: var(--blue-100);
            color: var(--blue-600);
          }

          .edit-btn:hover {
            background: var(--blue-100);
            color: var(--blue-600);
          }

          .delete-btn:hover {
            background: var(--red-100);
            color: var(--red-600);
          }

          .experience-meta {
            color: var(--gray-600);
          }

          .experience-description {
            color: var(--gray-700);
          }

          .skills-tag {
            background: var(--blue-100);
            color: var(--blue-600);
          }

          .achievement-item {
            color: var(--gray-700);
          }

          .company-website a {
            color: var(--blue-600);
          }

          .empty-state h3 {
            color: var(--gray-900);
          }

          .empty-state p {
            color: var(--gray-600);
          }

          .empty-action-btn {
            background: var(--green-600);
            color: white;
          }

          .empty-action-btn:hover {
            background: var(--green-500);
          }

          .loading-spinner {
            color: var(--primary);
          }

          .error-message {
            background: var(--red-100);
            color: var(--red-600);
            border-color: var(--red-200);
          }

          .modal-overlay {
            background: rgba(0, 0, 0, 0.7);
          }

          .delete-modal {
            background: var(--white);
            border-color: var(--gray-200);
          }

          .modal-header {
            border-color: var(--gray-200);
          }

          .modal-header h3 {
            color: var(--gray-900);
          }

          .close-btn {
            color: var(--gray-500);
          }

          .close-btn:hover {
            color: var(--gray-700);
          }

          .warning-text {
            color: var(--red-600);
          }

          .modal-actions {
            border-color: var(--gray-200);
          }

          .cancel-btn {
            background: var(--gray-200);
            color: var(--gray-700);
          }

          .cancel-btn:hover:not(:disabled) {
            background: var(--gray-300);
          }

          .delete-confirm-btn {
            background: var(--red-600);
            color: white;
          }

          .delete-confirm-btn:hover:not(:disabled) {
            background: var(--red-500);
          }

          .success-message {
            background: var(--green-100);
            color: var(--green-600);
            border-color: var(--green-200);
          }
        }
      `}</style>
    </div>
  );
};

export default ViewAllExperience;
