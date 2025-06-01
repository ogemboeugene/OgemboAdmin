import React from 'react';
import PropTypes from 'prop-types';

/**
 * CheckboxField component for boolean inputs with label and error handling
 */
const CheckboxField = ({
  id,
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  checkboxClassName = '',
  errorClassName = '',
  ...rest
}) => {
  const checkboxId = id || name;
  const isError = Boolean(error);
  
  const containerClasses = [
    'checkbox-container',
    containerClassName,
    isError ? 'has-error' : '',
    disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');
  
  const labelClasses = [
    'checkbox-label',
    labelClassName,
  ].filter(Boolean).join(' ');
  
  const checkboxClasses = [
    'checkbox-input',
    checkboxClassName,
    isError ? 'error' : '',
  ].filter(Boolean).join(' ');
  
  const displayHelperText = helperText && !isError;
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={checkboxClasses}
          {...rest}
        />
        
        {label && (
          <label htmlFor={checkboxId} className={labelClasses}>
            {label}
          </label>
        )}
      </div>
      
      {isError && (
        <div className={`checkbox-error ${errorClassName}`}>
          {error}
        </div>
      )}
      
      {displayHelperText && (
        <div className="checkbox-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

CheckboxField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.node,
  helperText: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  checkboxClassName: PropTypes.string,
  errorClassName: PropTypes.string,
};

export default CheckboxField; 