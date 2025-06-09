import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaCog, 
  FaUser, 
  FaSearch, 
  FaInfo, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSun,
  FaMoon,
  FaUserCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { user } = useAuth(); // Get user data from auth context
  const { darkMode, toggleDarkMode } = useTheme(); // Get theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
    const notificationRef = useRef(null);
  const searchRef = useRef(null);
  
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (searchRef.current && !searchRef.current.contains(event.target) && searchQuery === '') {
        searchRef.current.classList.remove('expanded');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);
  
  // Fetch notifications
  useEffect(() => {
    // Simulate API call for notifications
    const fetchNotifications = async () => {
      try {
        // Sample data
        setNotifications([
          {
            id: 1,
            type: 'info',
            message: 'Your profile has been viewed 12 times this week',
            time: '2 hours ago',
            read: false
          },
          {
            id: 2,
            type: 'success',
            message: 'Project "MamaPesa" has been completed',
            time: '1 day ago',
            read: false
          },
          {
            id: 3,
            type: 'warning',
            message: 'Deadline approaching for "ShopOkoa" project',
            time: '2 days ago',
            read: true
          },
          {
            id: 4,
            type: 'info',
            message: 'New feature request for "DevPortal"',
            time: '3 days ago',
            read: true
          }
        ]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
  }, []);
  
  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
    // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  // Expand search on focus
  const expandSearch = () => {
    if (searchRef.current) {
      searchRef.current.classList.add('expanded');
    }
  };
  
  return (
    <header className="header">
      <div className="header-left">
        <h1>Developer Dashboard</h1>
      </div>
      
      <div className="header-right">
        <div className={`search-box ${searchQuery ? 'active' : ''}`} ref={searchRef}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search projects, skills..." 
            value={searchQuery}
            onChange={handleSearch}
            onFocus={expandSearch}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>
        
        <div className="header-icons">
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className={`notification-btn ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <FaBell />
              {notifications.some(n => !n.read) && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  className="notifications-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">
                        <FaBell className="empty-icon" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <motion.div 
                          key={notification.id} 
                          className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {notification.type === 'info' && <FaInfo className="notification-icon" />}
                          {notification.type === 'success' && <FaCheckCircle className="notification-icon" />}
                          {notification.type === 'warning' && <FaExclamationTriangle className="notification-icon" />}
                          
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  
                  <div className="notifications-footer">
                    <Link to="/notifications" className="view-all-link">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="icon-button theme-toggle-btn" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          
          <button className="icon-button" onClick={handleSettingsClick} title="Settings">
            <FaCog />
          </button>
        </div>
          <div className="user-profile">
          <div className="avatar">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt="User" className="user-avatar-small" />
            ) : (
              <FaUserCircle className="user-avatar-icon" />
            )}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}
            </p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
      </div>
      
      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: var(--white);
          border-bottom: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
        }
        
        .header-left h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .header-icons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .icon-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--gray-100);
          color: var(--gray-700);
          transition: all 0.2s ease;
          position: relative;
          border: none;
          cursor: pointer;
        }
        
        .icon-button:hover {
          background-color: var(--gray-200);
          color: var(--primary-color);
        }
        
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--danger-color);
          color: var(--white);
          font-size: 0.75rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .user-profile:hover {
          background-color: var(--gray-100);
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background-color: var(--gray-300);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
        }
          .user-avatar-small {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .user-avatar-icon {
          width: 100%;
          height: 100%;
          color: var(--gray-400);
          font-size: 2rem;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0;
        }
        
        .user-role {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin: 0;
        }
        
        /* Search Box */
        .search-box {
          position: relative;
          width: 250px;
          transition: all 0.3s ease;
        }
        
        .search-box.expanded, .search-box.active {
          width: 300px;
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: 0.875rem;
          pointer-events: none;
        }

        
        
        .search-box input {
          width: 100%;
          padding: 0.5rem 0.5rem 0.5rem 2.5rem;
          border: 1px solid var(--gray-300);
          border-radius: 9999px;
          background-color: var(--white);
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: 1.125rem;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        
        .clear-search:hover {
          color: var(--gray-700);
        }
        
        /* Notification */
        .notification-wrapper {
          position: relative;
        }
        
        .notification-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--gray-100);
          color: var(--gray-700);
          transition: all 0.2s ease;
          position: relative;
          border: none;
          cursor: pointer;
        }
        
        .notification-btn:hover {
          background-color: var(--gray-200);
          color: var(--primary-color);
        }
        
        .notification-btn.has-unread {
          color: var(--primary-color);
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--danger-color);
          color: var(--white);
          font-size: 0.75rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 100;
          overflow: hidden;
          border: 1px solid var(--gray-200);
        }
        
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }

                .notifications-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }
        
        .mark-read-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .mark-read-btn:hover {
          background-color: var(--gray-100);
        }
        
        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          border-bottom: 1px solid var(--gray-200);
          transition: all 0.2s ease;
        }
        
        .notification-item:last-child {
          border-bottom: none;
        }
        
        .notification-item.unread {
          background-color: rgba(79, 70, 229, 0.05);
        }
        
        .notification-item:hover {
          background-color: var(--gray-100);
        }
        
        .notification-icon {
          margin-right: 1rem;
          font-size: 1.25rem;
          margin-top: 0.25rem;
        }
        
        .notification-item.info .notification-icon {
          color: var(--info-color);
        }
        
        .notification-item.success .notification-icon {
          color: var(--success-color);
        }
        
        .notification-item.warning .notification-icon {
          color: var(--warning-color);
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-content p {
          margin-bottom: 0.25rem;
          color: var(--gray-800);
          font-size: 0.875rem;
        }
        
        .notification-time {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .empty-notifications {
          padding: 2rem;
          text-align: center;
          color: var(--gray-500);
        }
        
        .empty-icon {
          font-size: 1.875rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .notifications-footer {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid var(--gray-200);
        }
        
        .view-all-link {
          color: var(--primary-color);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .view-all-link:hover {
          text-decoration: underline;
        }
        
        /* Theme Toggle Button */
        .theme-toggle-btn {
          color: var(--gray-700);
        }
        
        .dark-mode .theme-toggle-btn {
          color: #f59e0b;
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
          .header {
            padding: 0.75rem 1rem;
          }
          
          .header-left h1 {
            font-size: 1.25rem;
          }
          
          .search-box {
            display: none;
          }
          
          .header-right {
            gap: 0.75rem;
          }
          
          .user-info {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .header-icons {
            gap: 0.5rem;
          }
          
          .icon-button {
            width: 36px;
            height: 36px;
          }
          
          .avatar {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
