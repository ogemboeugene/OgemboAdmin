import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component for displaying content in a box with optional header and footer
 */
const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  className = '',
  hoverable = false,
  bordered = true,
  shadow = 'md',
  padding = 'md',
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const classes = [
    'card',
    bordered ? 'border' : '',
    shadowClasses[shadow],
    hoverable ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  const bodyClasses = paddingClasses[padding];

  const hasHeader = title || subtitle || headerActions;

  return (
    <div className={classes}>
      {hasHeader && (
        <div className="card-header">
          <div className="card-header-title">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="card-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={`card-body ${bodyClasses}`}>
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  headerActions: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  bordered: PropTypes.bool,
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
};

export default Card;