import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate  } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaUser, 
  FaProjectDiagram, 
  FaSignOutAlt, 
  FaChartBar, 
  FaCog, 
  FaCode, 
  FaGraduationCap, 
  FaBriefcase, 
  FaTasks, 
  FaBars, 
  FaTimes,
  FaLightbulb,
  FaChevronRight,
  FaChevronDown,
  FaSearch,
  FaBell,
  FaStar,
  FaQuestionCircle,
  FaCalendarAlt,
  FaClipboardList,
  FaEllipsisH,  FaTachometerAlt,
  FaLayerGroup,
  FaStream,
  FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';


const Sidebar = (props) => {
  const { user } = useAuth(); // Get user data from auth context
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [favorites, setFavorites] = useState(['dashboard', 'projects']);
  const [recentPages, setRecentPages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const searchRef = useRef(null);
  const { logout } = useAuth();
  
  // Check if screen is mobile on initial load and handle resize
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        // Restore user preference on larger screens
        const savedState = localStorage.getItem('sidebarCollapsed');
        setCollapsed(savedState === 'true');
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Save collapsed state preference
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem('sidebarCollapsed', collapsed);
    }
    
    // Add class to body to adjust main content
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);
  
  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.mobile-toggle')) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);
  
  // Track recent pages
  useEffect(() => {
    if (location.pathname !== '/') {
      const currentPath = location.pathname.substring(1); // Remove leading slash
      setRecentPages(prev => {
        const filtered = prev.filter(p => p.path !== currentPath);
        return [{ path: currentPath, time: new Date() }, ...filtered].slice(0, 3);
      });
    }
  }, [location]);
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + / to focus search
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Alt + [1-9] for quick navigation
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < menuItems.length) {
          const item = menuItems[index];
          if (!item.submenu) {
            window.location.href = item.path;
          }
        }
      }
      
      // Alt + C to toggle collapse
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const toggleSubmenu = (key) => {
    setActiveSubmenu(activeSubmenu === key ? null : key);
  };
  
  const toggleFavorite = (key) => {
    setFavorites(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };
  
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  };
  
  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const menuItems = [
    { 
      key: 'dashboard',
      path: '/dashboard', 
      icon: <FaTachometerAlt />, 
      label: 'Dashboard',
      shortcut: 'Alt+1'
    },
    { 
      key: 'profile',
      path: '/profile', 
      icon: <FaUser />, 
      label: 'My Profile',
      shortcut: 'Alt+2'
    },
    { 
      key: 'projects',
      path: '/projects', 
      icon: <FaProjectDiagram />, 
      label: 'Projects',
      shortcut: 'Alt+3',
      badge: '8',
      submenu: [
        { path: '/projects/active', label: 'Active Projects' },
        { path: '/projects/completed', label: 'Completed' },
        { path: '/projects/archived', label: 'Archived' },
        { path: '/projects/new', label: 'Create New' }
      ]
    },
    { 
      key: 'analytics',
      path: '/analytics', 
      icon: <FaChartBar />, 
      label: 'Analytics',
      shortcut: 'Alt+4'
    },
    { 
      key: 'skills',
      path: '/skills', 
      icon: <FaLayerGroup />, 
      label: 'Skills',
      shortcut: 'Alt+5'
    },
    { 
      key: 'education',
      path: '/education', 
      icon: <FaGraduationCap />, 
      label: 'Education',
      shortcut: 'Alt+6',
      submenu: [
        { path: '/education/new', label: 'Add New Education' },
        { path: '/education', label: 'View All Education' }
      ]
    },
    { 
      key: 'experience',
      path: '/experience', 
      icon: <FaBriefcase />, 
      label: 'Experience',
      shortcut: 'Alt+7',
      submenu: [
        { path: '/experience/new', label: 'Add New Experience' },
        { path: '/experience', label: 'View All Experience' }
      ]
    },
    { 
      key: 'tasks',
      path: '/tasks', 
      icon: <FaTasks />, 
      label: 'Tasks',
      shortcut: 'Alt+8',
      badge: '5',
      submenu: [
        { path: '/tasks/upcoming', label: 'Upcoming' },
        { path: '/tasks/completed', label: 'Completed' },
        { path: '/tasks/new', label: 'Add New Task' }
      ]
    },
    { 
      key: 'calendar',
      path: '/calendar', 
      icon: <FaCalendarAlt />, 
      label: 'Calendar',
      shortcut: 'Alt+9'
    },
    { 
      key: 'settings',
      path: '/settings', 
      icon: <FaCog />, 
      label: 'Settings',
      shortcut: 'Alt+0'
    },
  ];
  
  // Filter menu items based on search
  const filteredMenuItems = searchQuery 
    ? menuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.submenu && item.submenu.some(subitem => 
          subitem.label.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : menuItems;
  
  // Get favorite menu items
  const favoriteItems = menuItems.filter(item => favorites.includes(item.key));
  
  // Get recent pages with menu item data
  const recentItems = recentPages.map(recent => {
    const menuItem = menuItems.find(item => item.path.substring(1) === recent.path);
    return menuItem ? { 
      ...menuItem, 
      time: recent.time 
    } : null;
  }).filter(Boolean);
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle" 
        onClick={toggleMobile}
        aria-label="Toggle sidebar"
      >
        <FaStream />
      </button>
      
      {/* Sidebar */}
      <motion.div 
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ 
          width: collapsed && !mobileOpen ? '80px' : '280px',
          x: mobileOpen ? 0 : (window.innerWidth < 1024 && !mobileOpen ? '-100%' : 0)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="sidebar-header">
          <div className="logo">
            <FaCode className="logo-icon" />
            <motion.span 
              className="logo-text"
              initial={false}
              animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
              transition={{ duration: 0.2 }}
            >
              Ogembo Admin
            </motion.span>
          </div>
          <button 
            className="collapse-toggle" 
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronRight className="rotate-180" />}
          </button>
          
          <button 
            className="mobile-close" 
            onClick={toggleMobile}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
          <div className="user-profile">
          <div className="avatar">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'} />
            ) : (
              <FaUserCircle className="user-avatar-icon" />
            )}
            <span className="status-indicator online"></span>
          </div>
          
          <motion.div 
            className="user-info"
            initial={false}
            animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'flex' }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="user-name">
              {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}
            </h3>
            <p className="user-title">
              {user?.profile?.title || user?.profile?.currentPosition || 'Full Stack Developer'}
            </p>
          </motion.div>
        </div>
        
        <div className="sidebar-search">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <motion.input 
              ref={searchRef}
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={handleSearch}
              initial={false}
              animate={{ width: collapsed && !mobileOpen ? 0 : '100%', padding: collapsed && !mobileOpen ? 0 : '8px 8px 8px 36px' }}
              transition={{ duration: 0.2 }}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                <FaTimes />
              </button>
            )}
          </div>
          
          <motion.div 
            className="search-shortcut"
            initial={false}
            animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'flex' }}
            transition={{ duration: 0.2 }}
          >
            Alt + /
          </motion.div>
        </div>
        
        {/* Favorites Section */}
        {favorites.length > 0 && !searchQuery && (
          <motion.div 
            className="sidebar-section"
            initial={false}
            animate={{ height: collapsed && !mobileOpen ? 'auto' : 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="section-header"
              initial={false}
              animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'flex' }}
              transition={{ duration: 0.2 }}
            >
              <h4>Favorites</h4>
            </motion.div>
              <ul className="menu-list">              {favoriteItems.map((item) => (
                <li key={`fav-${item.key}`} className={isActive(item.path) ? 'active' : ''}>
                  <div className="sidebar-link-container">
                    <Link to={item.path} className="sidebar-link" title={item.label}>
                      <span className="sidebar-icon">{item.icon}</span>
                      
                      <motion.span 
                        className="sidebar-text"
                        initial={false}
                        animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                      
                      {item.badge && (
                        <motion.span 
                          className="sidebar-badge"
                          initial={false}
                          animate={{ 
                            opacity: collapsed && !mobileOpen ? 0 : 1, 
                            display: collapsed && !mobileOpen ? 'none' : 'flex',
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 0.2, scale: { repeat: 0, duration: 0.3 } }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </Link>
                    
                    <motion.button 
                      className="favorite-btn active"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item.key);
                      }}
                      initial={false}
                      animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                      transition={{ duration: 0.2 }}
                      title="Remove from favorites"
                      style={{ cursor: 'pointer' }}
                    >
                      <FaStar />
                    </motion.button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        
        {/* Recent Pages Section */}
        {recentItems.length > 0 && !searchQuery && !collapsed && (
          <motion.div 
            className="sidebar-section"
            initial={false}
            animate={{ height: collapsed && !mobileOpen ? 0 : 'auto', opacity: collapsed && !mobileOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h4>Recent</h4>
            </div>
            
            <ul className="menu-list">
              {recentItems.map((item) => (
                <li key={`recent-${item.key}`} className={isActive(item.path) ? 'active' : ''}>
                  <Link to={item.path} className="sidebar-link" title={item.label}>
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-text">{item.label}</span>
                    <span className="recent-time">
                      {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        
        {/* Main Menu */}
        <div className="sidebar-section main-menu">
          <motion.div 
            className="section-header"
            initial={false}
            animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'flex' }}
            transition={{ duration: 0.2 }}
          >
            <h4>Menu</h4>
          </motion.div>
          
          <ul className="menu-list">
            {filteredMenuItems.map((item) => (
              <React.Fragment key={item.key}>
                <motion.li 
                  className={`${isActive(item.path) ? 'active' : ''} ${item.submenu && activeSubmenu === item.key ? 'submenu-open' : ''}`}
                  initial={false}
                  animate={{ 
                    backgroundColor: isActive(item.path) ? 'var(--primary-color)' : 'transparent',
                    boxShadow: isActive(item.path) ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                  whileHover={{ 
                    backgroundColor: isActive(item.path) ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
                    x: 3
                  }}
                  transition={{ duration: 0.2 }}
                >                  {item.submenu ? (
                    <div className="sidebar-link-container">
                      <button 
                        className="sidebar-link has-submenu" 
                        onClick={() => toggleSubmenu(item.key)}
                        aria-expanded={activeSubmenu === item.key}
                        title={item.label}
                      >
                        <span className="sidebar-icon">{item.icon}</span>
                        
                        <motion.span 
                          className="sidebar-text"
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                        
                        {item.badge && (
                          <motion.span 
                            className="sidebar-badge"
                            initial={false}
                            animate={{ 
                              opacity: collapsed && !mobileOpen ? 0 : 1, 
                              display: collapsed && !mobileOpen ? 'none' : 'flex' 
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                        
                        <motion.span 
                          className="submenu-arrow"
                          initial={false}
                          animate={{ 
                            opacity: collapsed && !mobileOpen ? 0 : 1, 
                            display: collapsed && !mobileOpen ? 'none' : 'block',
                            rotate: activeSubmenu === item.key ? 180 : 0
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <FaChevronDown />
                        </motion.span>
                      </button>
                      
                      {!favorites.includes(item.key) ? (
                        <motion.button 
                          className="favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item.key);
                          }}
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 0.5, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          whileHover={{ opacity: 1, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          title="Add to favorites"
                        >
                          <FaStar />
                        </motion.button>
                      ) : (
                        <motion.button 
                          className="favorite-btn active"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item.key);
                          }}
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          transition={{ duration: 0.2 }}
                          title="Remove from favorites"
                        >
                          <FaStar />
                        </motion.button>
                      )}
                    </div>                  ) : (
                    <div className="sidebar-link-container">
                      <Link to={item.path} className="sidebar-link" title={item.label}>
                        <span className="sidebar-icon">{item.icon}</span>
                        
                        <motion.span 
                          className="sidebar-text"
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                        
                        {item.badge && (
                          <motion.span 
                            className="sidebar-badge"
                            initial={false}
                            animate={{ 
                              opacity: collapsed && !mobileOpen ? 0 : 1, 
                              display: collapsed && !mobileOpen ? 'none' : 'flex' 
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                        
                        <motion.span 
                          className="shortcut-hint"
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 0.7, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.shortcut}
                        </motion.span>
                      </Link>
                      
                      {!favorites.includes(item.key) ? (
                        <motion.button 
                          className="favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item.key);
                          }}
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 0.5, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          whileHover={{ opacity: 1, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          title="Add to favorites"
                        >
                          <FaStar />
                        </motion.button>
                      ) : (
                        <motion.button 
                          className="favorite-btn active"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item.key);
                          }}
                          initial={false}
                          animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
                          transition={{ duration: 0.2 }}
                          title="Remove from favorites"
                        >
                          <FaStar />
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.li>
                
                {/* Submenu */}
                {item.submenu && (
                  <AnimatePresence>
                    {(activeSubmenu === item.key || (searchQuery && item.submenu.some(subitem => 
                      subitem.label.toLowerCase().includes(searchQuery.toLowerCase())
                    ))) && (
                      <motion.div 
                        className="submenu-container"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: 'auto', 
                          opacity: 1,
                          display: collapsed && !mobileOpen ? 'none' : 'block'
                        }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ul className="submenu">
                          {item.submenu
                            .filter(subitem => 
                              !searchQuery || 
                              subitem.label.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((subitem, index) => (
                              <motion.li 
                                key={index}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className={isActive(subitem.path) ? 'active' : ''}
                              >
                                <Link to={subitem.path} className="submenu-link">
                                  <span className="submenu-dot"></span>
                                  <span className="submenu-text">{subitem.label}</span>
                                </Link>
                              </motion.li>
                            ))
                          }
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <div className="footer-actions">
            <Link to="/help" className="footer-link" title="Help & Support">
              <FaQuestionCircle />
              <motion.span 
                initial={false}
                animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'inline' }}
                transition={{ duration: 0.2 }}
              >
                Help
              </motion.span>
            </Link>
            
            <button className="footer-link" onClick={toggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <FaEllipsisH />
              <motion.span 
                initial={false}
                animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'inline' }}
                transition={{ duration: 0.2 }}
              >
                {collapsed ? "Expand" : "Collapse"}
              </motion.span>
            </button>
              <button 
              className="footer-link logout" 
              title="Logout"
              onClick={async () => {
                try {
                  console.log('🚪 Logout button clicked');
                  
                  // Call the logout function from AuthContext and wait for it to complete
                  const result = await logout();
                  
                  console.log('✅ Logout completed:', result);
                  
                  // Force navigation to login page after logout is complete
                  window.location.href = '/login';
                } catch (error) {
                  console.error('❌ Logout failed:', error);
                  
                  // Even if logout fails, clear everything locally and redirect
                  localStorage.clear();
                  window.location.href = '/login';
                }
              }}
            >
              <FaSignOutAlt />
              <motion.span 
                initial={false}
                animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'inline' }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            </button>
          </div>
          
          <motion.div 
            className="footer-info"
            initial={false}
            animate={{ opacity: collapsed && !mobileOpen ? 0 : 1, display: collapsed && !mobileOpen ? 'none' : 'block' }}
            transition={{ duration: 0.2 }}
          >
            <p>OgemboAdmin v1.2.0</p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleMobile}          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;



