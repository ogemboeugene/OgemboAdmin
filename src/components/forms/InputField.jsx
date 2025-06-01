import React from 'react';
import PropTypes from 'prop-types';

/**
 * InputField component for form inputs with label and error handling
 */
const InputField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  placeholder = '',
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helperText,
  icon,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  autoComplete = 'off',
  ...rest
}) => {
  const inputId = id || name;
  const isError = Boolean(error);
  
  const containerClasses = [
    'input-container',
    containerClassName,
    isError ? 'has-error' : '',
    disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');
  
  const labelClasses = [
    'input-label',
    labelClassName,
    required ? 'required' : '',
  ].filter(Boolean).join(' ');
  
  const inputClasses = [
    'input-field',
    inputClassName,
    icon ? 'has-icon' : '',
    isError ? 'error' : '',
  ].filter(Boolean).join(' ');
  
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete={autoComplete}
          {...rest}
        />
      );
    }
    
    return (
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className={inputClasses}
        autoComplete={autoComplete}
        {...rest}
      />
    );
  };
  
  const displayHelperText = helperText && !isError;
  
  return (
    <div className={`${containerClasses} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <div className="input-icon">{icon}</div>}
        {renderInput()}
      </div>
      
      {isError && (
        <div className={`input-error ${errorClassName}`}>
          {error}
        </div>
      )}
      
      {displayHelperText && (
        <div className="input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

InputField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.node,
  helperText: PropTypes.node,
  icon: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  autoComplete: PropTypes.string,
};

export default InputField;