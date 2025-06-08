import React from 'react';
import PropTypes from 'prop-types';
import { FaChevronDown } from 'react-icons/fa';

/**
 * SelectField component for dropdown selections with label and error handling
 */
const SelectField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  helperText,
  multiple = false,
  clearable = false,
  isLoading = false,
  onClear,
  className = '',
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  ...rest
}) => {
  const selectId = id || name;
  const isError = Boolean(error);
  
  const containerClasses = [
    'select-container',
    containerClassName,
    isError ? 'has-error' : '',
    disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');
  
  const labelClasses = [
    'select-label',
    labelClassName,
    required ? 'required' : '',
  ].filter(Boolean).join(' ');
  
  const selectClasses = [
    'select-field',
    selectClassName,
    isError ? 'error' : '',
  ].filter(Boolean).join(' ');
  
  const handleClear = (e) => {
    e.stopPropagation();
    if (multiple) {
      onChange({ target: { name, value: [] } });
    } else {
      onChange({ target: { name, value: '' } });
    }
    if (onClear) onClear();
  };
  
  const displayHelperText = helperText && !isError;
  
  const showPlaceholder = !multiple && (!value || value === '');
  
  return (
    <div className={`${containerClasses} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
        <div className="select-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          multiple={multiple}
          className={selectClasses}
          {...rest}
        >
          {showPlaceholder && (
            <option value="" disabled>
              {isLoading ? 'Loading users...' : placeholder}
            </option>
          )}
          
          {isLoading && !options.length ? (
            <option value="" disabled>Loading...</option>
          ) : options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="select-icon">
          <FaChevronDown />
        </div>
        
        {clearable && value && !disabled && (
          <button 
            type="button" 
            className="select-clear-btn"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            &times;
          </button>
        )}
      </div>
      
      {isError && (
        <div className={`select-error ${errorClassName}`}>
          {error}
        </div>
      )}
      
      {displayHelperText && (
        <div className="select-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

SelectField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.node,
  helperText: PropTypes.node,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  onClear: PropTypes.func,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  selectClassName: PropTypes.string,
  errorClassName: PropTypes.string,
};

export default SelectField; 