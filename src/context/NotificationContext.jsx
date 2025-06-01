import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create the Notification Context
const NotificationContext = createContext();

/**
 * NotificationProvider component for managing notifications/toasts
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    
    const newNotification = {
      id,
      message,
      type,
      duration,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto dismiss notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Shorthand methods for different notification types
  const success = (message, duration) => addNotification(message, 'success', duration);
  const error = (message, duration) => addNotification(message, 'error', duration);
  const warning = (message, duration) => addNotification(message, 'warning', duration);
  const info = (message, duration) => addNotification(message, 'info', duration);
  
  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };
  
  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast container */}
      {notifications.length > 0 && (
        <div className="toast-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`toast toast-${notification.type}`}
            >
              <div className="toast-content">
                <div className="toast-message">{notification.message}</div>
              </div>
              <button
                className="toast-close"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close notification"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;