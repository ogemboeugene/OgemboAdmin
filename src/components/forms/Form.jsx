import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Form component that handles form state, submission, and validation
 */
const Form = ({
  children,
  initialValues = {},
  onSubmit,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  resetOnSubmit = false,
  className = '',
  ...rest
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form values when initialValues prop changes
  useEffect(() => {
    setValues(initialValues);
  }, [JSON.stringify(initialValues)]);
  
  const runValidation = () => {
    if (typeof validate === 'function') {
      const validationErrors = validate(values);
      setErrors(validationErrors || {});
      return validationErrors;
    }
    return {};
  };
  
  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: newValue
    }));
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    if (validateOnChange) {
      runValidation();
    }
  };
  
  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    if (validateOnBlur) {
      runValidation();
    }
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Validate all fields
    const validationErrors = runValidation();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Check if there are validation errors
    const hasErrors = Object.keys(validationErrors || {}).length > 0;
    
    if (!hasErrors) {
      try {
        await onSubmit(values, { resetForm });
        
        if (resetOnSubmit) {
          resetForm();
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };
    // Create form context value
  const formContext = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isSubmitting,
    setErrors,
  };
  
  // Clone children with form context
  const cloneChildrenWithProps = (children) => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }
      
      // Check if child has name prop (is a form field)
      if (child.props.name) {
        const name = child.props.name;
        
        // Pass form-specific props to form fields
        const fieldProps = {
          value: values[name] || '',
          onChange: handleChange,
          onBlur: handleBlur,
          error: touched[name] ? errors[name] : undefined,
        };
        
        // If field is a checkbox, use checked prop instead of value
        if (child.props.type === 'checkbox') {
          fieldProps.checked = Boolean(values[name]);
          delete fieldProps.value;
        }
        
        return React.cloneElement(child, fieldProps);
      }
      
      // Recursively clone children
      if (child.props.children) {
        return React.cloneElement(
          child,
          {},
          cloneChildrenWithProps(child.props.children)
        );
      }
      
      return child;
    });
  };
  
  return (
    <form 
      className={className} 
      onSubmit={handleSubmit} 
      noValidate
      {...rest}
    >
      {typeof children === 'function' 
        ? children(formContext) 
        : cloneChildrenWithProps(children)
      }
    </form>
  );
};

Form.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  validate: PropTypes.func,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  resetOnSubmit: PropTypes.bool,
  className: PropTypes.string,
};

export default Form; 