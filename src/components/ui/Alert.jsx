import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

/**
 * Alert component for displaying informational messages
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const baseClasses = 'alert';
  
  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };
  
  const variantIcons = {
    info: <FaInfoCircle />,
    success: <FaCheckCircle />,
    warning: <FaExclamationTriangle />,
    error: <FaExclamationCircle />,
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');
  
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };
  
  const displayIcon = icon || variantIcons[variant];
  
  return (
    <div className={classes} role="alert">
      <div className="alert-content">
        {displayIcon && (
          <div className="alert-icon">
            {displayIcon}
          </div>
        )}
        <div className="alert-message">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-description">{children}</div>
        </div>
      </div>
      {dismissible && (
        <button 
          className="alert-close" 
          onClick={handleDismiss}
          aria-label="Close alert"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  icon: PropTypes.node,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

export default Alert; 