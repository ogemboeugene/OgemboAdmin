import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUniversity, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaLink, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaThLarge,
  FaList,
  FaExternalLinkAlt,
  FaAward,
  FaBook,
  FaCertificate,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import { truncateText } from '../../utils/formatters';
import apiService from '../../services/api/apiService';

const ViewAllEducation = () => {
  const navigate = useNavigate();
  
  // State for education data
  const [educationList, setEducationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('startDate'); // 'startDate', 'degree', 'institution'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'current', 'completed'
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch education data
  useEffect(() => {
    fetchEducationData();
  }, []);
  const fetchEducationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.education.getAll();
      
      setEducationList(response.data.data.educations || []);
    } catch (error) {
      console.error('❌ Error fetching education data:', error);
      setError('Failed to load education records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  // Filter and sort education data
  const getFilteredAndSortedEducation = () => {
    let filtered = [...educationList];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(edu => 
        edu.degree?.toLowerCase().includes(query) ||
        edu.fieldOfStudy?.toLowerCase().includes(query) ||
        edu.institution?.toLowerCase().includes(query) ||
        edu.location?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(edu => {
        const isCurrent = edu.isCurrent || edu.current || false;
        return filterBy === 'current' ? isCurrent : !isCurrent;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'startDate':
          const dateA = new Date(a.startDate || '1900-01-01');
          const dateB = new Date(b.startDate || '1900-01-01');
          comparison = dateA - dateB;
          break;
        case 'degree':
          comparison = (a.degree || '').localeCompare(b.degree || '');
          break;
        case 'institution':
          comparison = (a.institution || '').localeCompare(b.institution || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };
  // Handle delete education
  const handleDeleteEducation = async (id) => {
    try {
      setIsDeleting(true);
      
      await apiService.education.delete(id);
      
      // Remove from local state
      setEducationList(prev => prev.filter(edu => edu.id !== id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('❌ Error deleting education:', error);
      setError('Failed to delete education record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get display date range
  const getDateRange = (edu) => {
    const startDate = edu.startDate ? formatDate(edu.startDate) : '';
    const endDate = edu.endDate ? formatDate(edu.endDate) : '';
    const isCurrent = edu.isCurrent || edu.current;
    
    if (startDate && (endDate || isCurrent)) {
      return `${startDate} - ${isCurrent ? 'Present' : endDate}`;
    } else if (startDate) {
      return startDate;
    }
    return 'Date not specified';
  };
  const filteredEducation = getFilteredAndSortedEducation();

  // Loading state
  if (isLoading) {
    return (
      <div className="education-view-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <FaSpinner />
          </div>
          <p>Loading education records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="education-view-container">
      {/* Header */}
      <div className="education-view-header">
        <div className="header-left">
          <div className="title-section">
            <h1>
              <FaGraduationCap className="title-icon" />
              Education Records
            </h1>
            <p className="subtitle">
              Manage your educational background and qualifications
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/education/new" className="btn-primary">
            <FaPlus /> Add Education
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by degree, institution, field of study..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-sort-section">
          {/* Filter Dropdown */}
          <div className="control-group">
            <label htmlFor="filter-select">Filter:</label>
            <select
              id="filter-select"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="control-select"
            >
              <option value="all">All Education</option>
              <option value="current">Currently Studying</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="control-group">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="startDate">Start Date</option>
              <option value="degree">Degree</option>
              <option value="institution">Institution</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <FaThLarge />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Education Count */}
      {filteredEducation.length > 0 && (
        <div className="results-count">
          <FaInfoCircle />
          <span>
            Showing {filteredEducation.length} of {educationList.length} education record{educationList.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Education Grid/List */}
      <div className={`education-container ${viewMode}`}>
        <AnimatePresence>
          {filteredEducation.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="empty-icon">
                <FaGraduationCap />
              </div>
              <h3>No Education Records Found</h3>
              {searchQuery || filterBy !== 'all' ? (
                <div>
                  <p>No education records match your search or filter criteria.</p>
                  <div className="empty-actions">
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterBy('all');
                      }}
                      className="btn-secondary"
                    >
                      Clear Filters
                    </button>
                    <Link to="/education/new" className="btn-primary">
                      <FaPlus /> Add Education
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p>Start building your educational profile by adding your degrees, certifications, and academic achievements.</p>
                  <Link to="/education/new" className="btn-primary">
                    <FaPlus /> Add Your First Education
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            filteredEducation.map((education, index) => (
              <motion.div
                key={education.id}
                className="education-item"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Card Header */}
                <div className="education-header">
                  <div className="education-basic-info">
                    <div className="degree-info">
                      <h3 className="degree-title">
                        {education.degree}
                        {education.fieldOfStudy && (
                          <span className="field-of-study"> in {education.fieldOfStudy}</span>
                        )}
                      </h3>
                      <div className="institution-info">
                        <FaUniversity className="institution-icon" />
                        <span className="institution-name">{education.institution}</span>
                        {education.location && (
                          <>
                            <FaMapMarkerAlt className="location-icon" />
                            <span className="location">{education.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="education-status">
                      <span className={`status-badge ${education.isCurrent || education.current ? 'current' : 'completed'}`}>
                        {education.isCurrent || education.current ? 'Current' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="education-actions">
                    <Link
                      to={`/education/${education.id}/view`}
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/education/${education.id}/edit`}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteTarget(education);
                        setShowDeleteModal(true);
                      }}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="education-dates">
                  <FaCalendarAlt className="date-icon" />
                  <span>{getDateRange(education)}</span>
                </div>

                {/* GPA */}
                {education.grade && (
                  <div className="education-gpa">
                    <FaAward className="gpa-icon" />
                    <span>GPA: {education.grade}</span>
                    {education.maxGpa && <span className="max-gpa">/{education.maxGpa}</span>}
                  </div>
                )}

                {/* Description */}
                {education.description && (
                  <div className="education-description">
                    <p>{truncateText(education.description, viewMode === 'cards' ? 120 : 200)}</p>
                  </div>
                )}

                {/* Achievements */}
                {education.achievements && education.achievements.length > 0 && (
                  <div className="education-achievements">
                    <h4>
                      <FaAward className="section-icon" />
                      Key Achievements
                    </h4>
                    <ul className="achievements-list">
                      {education.achievements.slice(0, viewMode === 'cards' ? 2 : 3).map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                      {education.achievements.length > (viewMode === 'cards' ? 2 : 3) && (
                        <li className="more-indicator">
                          +{education.achievements.length - (viewMode === 'cards' ? 2 : 3)} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Courses */}
                {education.courses && education.courses.length > 0 && (
                  <div className="education-courses">
                    <h4>
                      <FaBook className="section-icon" />
                      Relevant Courses
                    </h4>
                    <div className="courses-tags">
                      {education.courses.slice(0, viewMode === 'cards' ? 3 : 5).map((course, idx) => (
                        <span key={idx} className="course-tag">{course}</span>
                      ))}
                      {education.courses.length > (viewMode === 'cards' ? 3 : 5) && (
                        <span className="course-tag more-tag">
                          +{education.courses.length - (viewMode === 'cards' ? 3 : 5)} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Certificate Link */}
                {education.certificateUrl && (
                  <div className="education-certificate">
                    <a
                      href={education.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certificate-link"
                    >
                      <FaCertificate className="certificate-icon" />
                      View Certificate
                      <FaExternalLinkAlt className="external-icon" />
                    </a>
                  </div>
                )}

                {/* Institution Website */}
                {education.institutionWebsite && (
                  <div className="education-website">
                    <a
                      href={education.institutionWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      <FaLink className="website-icon" />
                      Institution Website
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Education Record</h3>
              </div>
              
              <div className="modal-body">
                <div className="warning-icon">
                  <FaExclamationTriangle />
                </div>
                <p>
                  Are you sure you want to delete your <strong>{deleteTarget.degree}</strong> from <strong>{deleteTarget.institution}</strong>?
                </p>
                <p className="warning-text">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEducation(deleteTarget.id)}
                  className="btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="spinner" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style jsx>{`
        /* CSS Variables */
        :root {
          --primary-color: #4f46e5;
          --primary-light: #818cf8;
          --primary-dark: #3730a3;
          --secondary-color: #10b981;
          --danger-color: #ef4444;
          --warning-color: #f59e0b;
          --info-color: #06b6d4;
          --success-color: #10b981;
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
          --border-radius: 8px;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --transition: all 0.3s ease;
          --transition-fast: all 0.15s ease;
        }

        /* Container */
        .education-view-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: var(--white);
          min-height: 100vh;
        }

        /* Header */
        .education-view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .title-section h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .title-icon {
          color: var(--primary-color);
        }

        .subtitle {
          color: var(--gray-600);
          font-size: 1rem;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-primary:hover {
          background-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--white);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-secondary:hover {
          background-color: var(--gray-50);
          border-color: var(--gray-400);
        }

        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--danger-color);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .btn-danger:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Error Banner */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid var(--danger-color);
          border-radius: var(--border-radius);
          color: var(--danger-color);
          margin-bottom: 1.5rem;
        }

        .error-banner button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          margin-left: auto;
        }

        /* Controls Bar */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          flex-wrap: wrap;
        }

        .search-section {
          flex: 1;
          min-width: 300px;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--gray-400);
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          background-color: var(--white);
          transition: var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .filter-sort-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          white-space: nowrap;
        }

        .control-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          background-color: var(--white);
          cursor: pointer;
        }

        .sort-order-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .sort-order-btn:hover {
          background-color: var(--gray-50);
          color: var(--primary-color);
        }

        .view-toggle {
          display: flex;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background-color: var(--white);
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .view-btn:hover {
          background-color: var(--gray-50);
        }

        .view-btn.active {
          background-color: var(--primary-color);
          color: var(--white);
        }

        /* Results Count */
        .results-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        /* Education Container */
        .education-container {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .education-container.cards {
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }

        .education-container.list {
          grid-template-columns: 1fr;
        }

        /* Education Item */
        .education-item {
          background-color: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          transition: var(--transition);
          cursor: pointer;
          position: relative;
        }

        .education-item:hover {
          box-shadow: var(--shadow-lg);
          border-color: var(--gray-300);
          transform: translateY(-2px);
        }

        .education-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .education-basic-info {
          flex: 1;
          min-width: 0;
        }

        .degree-info {
          margin-bottom: 0.75rem;
        }

        .degree-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .field-of-study {
          color: var(--gray-600);
          font-weight: 400;
        }

        .institution-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        .institution-icon,
        .location-icon {
          color: var(--primary-color);
          flex-shrink: 0;
        }

        .institution-name {
          font-weight: 500;
          color: var(--gray-700);
        }

        .education-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .status-badge.current {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }

        .status-badge.completed {
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
        }

        .education-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          background-color: var(--white);
          color: var(--gray-600);
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .action-btn:hover {
          background-color: var(--gray-50);
          transform: translateY(-1px);
        }

        .view-btn:hover {
          color: var(--info-color);
          border-color: var(--info-color);
        }

        .edit-btn:hover {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .delete-btn:hover {
          color: var(--danger-color);
          border-color: var(--danger-color);
        }

        /* Education Details */
        .education-dates {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        .date-icon {
          color: var(--primary-color);
        }

        .education-gpa {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--gray-700);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .gpa-icon {
          color: var(--warning-color);
        }

        .max-gpa {
          color: var(--gray-500);
          font-weight: 400;
        }

        .education-description {
          margin-bottom: 1rem;
        }

        .education-description p {
          color: var(--gray-700);
          line-height: 1.6;
          margin: 0;
        }

        .education-achievements,
        .education-courses {
          margin-bottom: 1rem;
        }

        .education-achievements h4,
        .education-courses h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0 0 0.5rem 0;
        }

        .section-icon {
          color: var(--primary-color);
        }

        .achievements-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .achievements-list li {
          position: relative;
          padding-left: 1rem;
          margin-bottom: 0.25rem;
          color: var(--gray-700);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .achievements-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary-color);
          font-weight: bold;
        }

        .more-indicator {
          color: var(--gray-500);
          font-style: italic;
        }

        .courses-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .course-tag {
          padding: 0.25rem 0.75rem;
          background-color: var(--gray-100);
          color: var(--gray-700);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .more-tag {
          background-color: var(--primary-color);
          color: var(--white);
        }

        .education-certificate,
        .education-website {
          margin-bottom: 0.5rem;
        }

        .certificate-link,
        .website-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .certificate-link:hover,
        .website-link:hover {
          text-decoration: underline;
        }

        .certificate-icon,
        .website-icon {
          color: var(--primary-color);
        }

        .external-icon {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
          border: 2px dashed var(--gray-300);
        }

        .empty-icon {
          font-size: 4rem;
          color: var(--gray-400);
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
        }

        .loading-spinner {
          font-size: 2rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .delete-modal {
          background-color: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 1.5rem 0;
        }

        .modal-body {
          padding: 1.5rem;
          text-align: center;
        }

        .warning-icon {
          font-size: 3rem;
          color: var(--warning-color);
          margin-bottom: 1rem;
        }

        .modal-body p {
          color: var(--gray-700);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .warning-text {
          color: var(--gray-500);
          font-size: 0.875rem;
          font-style: italic;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--gray-200);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .education-view-container {
            padding: 1rem;
          }

          .education-view-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .search-section {
            min-width: auto;
          }

          .filter-sort-section {
            justify-content: space-between;
          }

          .education-container.cards {
            grid-template-columns: 1fr;
          }

          .education-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .education-actions {
            align-self: flex-end;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-actions button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .title-section h1 {
            font-size: 1.5rem;
          }

          .education-item {
            padding: 1rem;
          }

          .action-btn {
            width: 32px;
            height: 32px;
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
          }
        }
      `}</style>
    </div>
  );
};

export default ViewAllEducation;
