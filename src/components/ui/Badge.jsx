import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for displaying status or small counts
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = false,
  dot = false,
  className = '',
}) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
    light: 'badge-light',
    dark: 'badge-dark',
  };
  
  const sizeClasses = {
    small: 'badge-sm',
    medium: 'badge-md',
    large: 'badge-lg',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    rounded ? 'badge-rounded' : '',
    dot ? 'badge-dot' : '',
    className
  ].filter(Boolean).join(' ');
  
  if (dot) {
    return (
      <span className={classes}>
        <span className="badge-dot-indicator"></span>
        {children}
      </span>
    );
  }
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  rounded: PropTypes.bool,
  dot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge; 