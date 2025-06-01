import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserPlus, 
  FaEye, 
  FaEyeSlash, 
  FaCode, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaGithub,
  FaGoogle,
  FaKeyboard,
  FaFingerprint,
  FaShieldAlt,
  FaCheck,
  FaArrowLeft,
  FaRocket,
  FaSyncAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Form from '../../components/forms/Form';
import { validateEmail, validateRequired, createFormValidator } from '../../utils/validation';

/**
 * Enhanced Signup page component with advanced animations and developer-focused design
 */
const Signup = () => {
  const { signup, isLoggedIn, isLoading } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [cyberpunkTheme, setCyberpunkTheme] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  
  // Redirect if already logged in
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Form validation schema with enhanced validation
  const validateForm = createFormValidator({
    name: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      if (value.length < 2) {
        return 'Name must be at least 2 characters';
      }
      
      return null;
    },
    email: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      const emailCheck = validateEmail(value);
      if (emailCheck) return emailCheck;
      
      return null;
    },
    password: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      
      // Check password strength
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      
      setPasswordStrength(strength);
      
      if (strength < 3) {
        return 'Please create a stronger password';
      }
      
      return null;
    },
    confirmPassword: (value, values) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      if (value !== values.password) {
        return 'Passwords do not match';
      }
      
      return null;
    },
    agreeToTerms: (value) => {
      if (!value) {
        return 'You must agree to the terms and conditions';
      }
      
      return null;
    }
  });
    // Handle form submission with enhanced error handling
  const handleSubmit = async (values) => {
    try {
      setIsAnimating(true);
      
      const result = await signup({
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        // Show success message with user's name if available
        const welcomeMessage = result.user?.name 
          ? `Welcome ${result.user.name}! Account created successfully! Redirecting to dashboard...`
          : result.message || 'Account created successfully! Redirecting to dashboard...';
        
        success(welcomeMessage);
        triggerSuccessAnimation();
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Show specific error message
        error(result.error || 'Signup failed. Please try again.');
        triggerErrorAnimation();
      }
    } catch (err) {
      // Handle unexpected errors
      console.error('Signup error:', err);
      error('An unexpected error occurred. Please try again.');
      triggerErrorAnimation();
    } finally {
      setIsAnimating(false);
    }
  };

  // Success animation effect
  const triggerSuccessAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create confetti particles
    const particles = [];
    const colors = ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#ef4444', '#ec4899'];
    
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        gravity: 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      
      if (particles[0].y < canvas.height) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    animate();
  };

  // Error animation effect
  const triggerErrorAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    let currentRadius = 0;
    let alpha = 1;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      ctx.fill();
      
      currentRadius += 15;
      alpha -= 0.02;
      
      if (alpha > 0) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    animate();
  };

  // Floating code particles animation
  useEffect(() => {
    const createParticles = () => {
      const container = document.getElementById('particles-container');
      if (!container) return;
      
      // Clear existing particles
      container.innerHTML = '';
      
      const codeSnippets = [
        '<div>', '</div>', 'const', 'let', 'function()', '=>', 'return', 'import',
        'export', 'async', 'await', 'try', 'catch', '{...}', '[]', '.map()', '.filter()'
      ];
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        
        particle.className = 'code-particle';
        particle.textContent = snippet;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.fontSize = `${Math.random() * 10 + 10}px`;
        
        container.appendChild(particle);
      }
    };
    
    createParticles();
    
    // Recreate particles periodically for a dynamic effect
    const particleInterval = setInterval(createParticles, 10000);
    
    return () => clearInterval(particleInterval);
  }, []);
  
  // 3D tilt effect on card hover
  useEffect(() => {
    const card = document.getElementById('signup-card');
    if (!card) return;
    
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 30;
      const angleY = (centerX - x) / 30;
      
      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    };
    
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Toggle cyberpunk theme
  const toggleCyberpunkTheme = () => {
    document.body.classList.toggle('cyberpunk-theme');
    setCyberpunkTheme(!cyberpunkTheme);
  };
  
  // Handle multi-step form navigation
  const handleNextStep = (values) => {
    setFormData({...formData, ...values});
    setCurrentStep(2);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
  };
  
  // Render step 1 of the form (Name and Email)
  const renderStep1 = (formProps) => {
    const { values, errors, handleChange, handleBlur } = formProps;
    
    return (
      <>
        <div className="step-indicator">
          <div className="step active">1</div>
          <div className="step-line"></div>
          <div className="step">2</div>
        </div>
        
        <div className="step-title">
          <h2>Create Your Account</h2>
          <p>Let's start with your basic information</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            <FaUser className="input-icon" />
            <span>Full Name</span>
          </label>
          <div className="input-wrapper">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors?.name ? 'input-error' : ''}`}
              required
              autoFocus
            />
            {errors?.name && (
              <div className="error-tooltip">
                <FaExclamationTriangle />
                <span>{errors.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <FaEnvelope className="input-icon" />
            <span>Email Address</span>
          </label>
          <div className="input-wrapper">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors?.email ? 'input-error' : ''}`}
              required
            />
            {errors?.email && (
              <div className="error-tooltip">
                <FaExclamationTriangle />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
        </div>        <button
          type="button"
          className="next-button"
          onClick={() => {
            // Validate just the fields in step 1 manually
            const step1Errors = {};
            
            // Validate name
            if (!values.name || values.name.trim() === '') {
              step1Errors.name = 'Name is required';
            } else if (values.name.length < 2) {
              step1Errors.name = 'Name must be at least 2 characters';
            }
            
            // Validate email
            if (!values.email || values.email.trim() === '') {
              step1Errors.email = 'Email is required';
            } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) {
              step1Errors.email = 'Please enter a valid email address';
            }
            
            if (Object.keys(step1Errors).length === 0) {
              handleNextStep(values);
            } else {
              // Show errors by updating the touched state and triggering re-render
              // Since we can't access setErrors directly, we'll use a different approach
              alert(Object.values(step1Errors).join('\n'));
            }
          }}
        >
          Continue
          <span className="button-arrow">→</span>
        </button>
      </>
    );
  };
  
  // Render step 2 of the form (Password and Terms)
  const renderStep2 = (formProps) => {
    const { values, errors, handleChange, handleBlur, isSubmitting } = formProps;
    
    return (
      <>
        <div className="step-indicator">
          <div className="step completed">
            <FaCheck />
          </div>
          <div className="step-line completed"></div>
          <div className="step active">2</div>
        </div>
        
        <div className="step-title">
          <h2>Secure Your Account</h2>
          <p>Create a strong password to protect your account</p>
        </div>
        
        <div className="form-group">
        <label htmlFor="password" className="form-label">
            <FaLock className="input-icon" />
            <span>Password</span>
          </label>
          <div className="input-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors?.password ? 'input-error' : ''}`}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors?.password && (
              <div className="error-tooltip">
                <FaExclamationTriangle />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
          
          {values.password && (
            <div className="password-strength">
              <div className="strength-meter">
                <div 
                  className={`strength-value strength-${passwordStrength}`} 
                  style={{ width: `${passwordStrength * 25}%` }}
                ></div>
              </div>
              <span className="strength-text">
                {passwordStrength === 0 && 'Very Weak'}
                {passwordStrength === 1 && 'Weak'}
                {passwordStrength === 2 && 'Medium'}
                {passwordStrength === 3 && 'Strong'}
                {passwordStrength === 4 && 'Very Strong'}
              </span>
            </div>
          )}
          
          {values.password && (
            <div className="password-requirements">
              <div className={`requirement ${values.password.length >= 8 ? 'met' : 'unmet'}`}>
                <span className="check-icon">{values.password.length >= 8 ? '✓' : '○'}</span>
                <span>At least 8 characters</span>
              </div>
              <div className={`requirement ${/[A-Z]/.test(values.password) ? 'met' : 'unmet'}`}>
                <span className="check-icon">{/[A-Z]/.test(values.password) ? '✓' : '○'}</span>
                <span>Contains uppercase letter</span>
              </div>
              <div className={`requirement ${/[0-9]/.test(values.password) ? 'met' : 'unmet'}`}>
                <span className="check-icon">{/[0-9]/.test(values.password) ? '✓' : '○'}</span>
                <span>Contains number</span>
              </div>
              <div className={`requirement ${/[^A-Za-z0-9]/.test(values.password) ? 'met' : 'unmet'}`}>
                <span className="check-icon">{/[^A-Za-z0-9]/.test(values.password) ? '✓' : '○'}</span>
                <span>Contains special character</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            <FaShieldAlt className="input-icon" />
            <span>Confirm Password</span>
          </label>
          <div className="input-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors?.confirmPassword ? 'input-error' : ''}`}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors?.confirmPassword && (
              <div className="error-tooltip">
                <FaExclamationTriangle />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group terms-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={values.agreeToTerms}
              onChange={handleChange}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">
              I agree to the <a href="#terms" className="terms-link">Terms of Service</a> and <a href="#privacy" className="terms-link">Privacy Policy</a>
            </span>
          </label>
          {errors?.agreeToTerms && (
            <div className="error-message">{errors.agreeToTerms}</div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="back-button"
            onClick={handlePrevStep}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <button
            type="submit"
            className={`signup-button ${isSubmitting || isLoading ? 'loading' : ''}`}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <FaUserPlus className="button-icon" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </div>
      </>
    );
  };
  
  return (
    <div className="signup-container">
      <canvas ref={canvasRef} className="animation-canvas"></canvas>
      <div id="particles-container" className="particles-container"></div>
      
      <div className="circuit-pattern"></div>

      {/* Theme toggle button */}
      <button 
        className="theme-toggle"
        onClick={toggleCyberpunkTheme}
        aria-label="Toggle cyberpunk theme"
      >
        <FaSyncAlt />
      </button>
      
      <div id="signup-card" className={`signup-card ${isAnimating ? 'shake' : ''}`} ref={formRef}>
        <div className="signup-header">
          <div className="logo-container">
            <FaCode className="logo-icon" />
          </div>
          <h1 className="signup-title">DevPortal</h1>
        </div>
        
        <Form
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '',
            agreeToTerms: false
          }}
          onSubmit={handleSubmit}
          validate={validateForm}
          className="signup-form"
        >
          {(formProps) => (
            <>
              {currentStep === 1 && renderStep1(formProps)}
              {currentStep === 2 && renderStep2(formProps)}
            </>
          )}
        </Form>
        
        <div className="signup-footer">
          <div className="social-login">
            <div className="divider">
              <span>OR SIGN UP WITH</span>
            </div>
            
            <div className="social-buttons">
              <button type="button" className="social-button github">
                <FaGithub />
                <span>GitHub</span>
              </button>
              
              <button type="button" className="social-button google">
                <FaGoogle />
                <span>Google</span>
              </button>
            </div>
          </div>
          
          <p className="login-prompt">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
        
        <div className="features-preview">
          <div className="feature">
            <FaRocket className="feature-icon" />
            <div className="feature-text">
              <h3>Developer-focused Dashboard</h3>
              <p>Track your projects and skills in one place</p>
            </div>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <div className="feature-text">
              <h3>Secure Portfolio</h3>
              <p>Share your work with potential employers</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .theme-toggle {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(30, 41, 59, 0.5);
            border: none;
            color: #38bdf8;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s ease;
        }

        .theme-toggle:hover {
            transform: rotate(180deg);
            background: rgba(56, 189, 248, 0.2);
        }

        
        .animation-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        
        .circuit-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%2338bdf8' fill-opacity='1' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9z'%3E%3C/path%3E%3C/svg%3E");
          background-size: 20px 20px;
          animation: moveBackground 120s linear infinite;
          z-index: 1;
        }
        
        .code-particle {
          position: absolute;
          color: rgba(56, 189, 248, 0.3);
          font-family: 'JetBrains Mono', monospace;
          animation: float linear infinite;
          white-space: nowrap;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
          }
        }
        
        @keyframes moveBackground {
          0% { background-position: 0 0; }
          100% { background-position: 500px 500px; }
        }
        
        .signup-card {
          width: 100%;
          max-width: 550px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      0 0 15px rgba(56, 189, 248, 0.15);
          padding: 2.5rem;
          position: relative;
          z-index: 10;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        
        .signup-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(56, 189, 248, 0.03) 50%,
            transparent 100%
          );
          transform: rotate(45deg);
          animation: shimmer 10s linear infinite;
          z-index: -1;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-50%) rotate(45deg); }
          100% { transform: translateX(50%) rotate(45deg); }
        }
        
        .signup-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        /* Cyberpunk theme */
        .cyberpunk-theme .signup-container {
            background: linear-gradient(135deg, #0f0f23 0%, #1a0b29 100%);
        }

        .cyberpunk-theme .signup-card {
            background: linear-gradient(145deg, #1a0b29, #0f0f23);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                        0 0 15px rgba(255, 0, 128, 0.15);
        }

        .cyberpunk-theme .logo-container {
            background: linear-gradient(135deg, #ff00a0, #7928ca);
            box-shadow: 0 10px 15px -3px rgba(255, 0, 128, 0.3),
                        0 0 0 1px rgba(255, 0, 128, 0.5),
                        0 0 20px rgba(255, 0, 128, 0.4);
        }

        .cyberpunk-theme .signup-title {
            background: linear-gradient(to right, #ff00a0, #7928ca);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .cyberpunk-theme .input-icon,
            .cyberpunk-theme .feature-icon {
            color: #ff00a0;
        }

        .cyberpunk-theme .form-input:focus {
            border-color: #ff00a0;
            box-shadow: 0 0 0 2px rgba(255, 0, 128, 0.2);
        }

        .cyberpunk-theme .checkbox-container input:checked ~ .checkbox-custom {
            background-color: #ff00a0;
            border-color: #ff00a0;
        }

        .cyberpunk-theme .terms-link,
            .cyberpunk-theme .login-prompt a {
            color: #ff00a0;
        }

        .cyberpunk-theme .terms-link:hover,
            .cyberpunk-theme .login-prompt a:hover {
            color: #ff3dc8;
        }

        .cyberpunk-theme .next-button,
        .cyberpunk-theme .signup-button {
            background: linear-gradient(135deg, #ff00a0, #7928ca);
            box-shadow: 0 4px 6px -1px rgba(255, 0, 128, 0.2);
        }

        .cyberpunk-theme .next-button:hover,
        .cyberpunk-theme .signup-button:hover {
            box-shadow: 0 10px 15px -3px rgba(255, 0, 128, 0.3);
        }

        .cyberpunk-theme .circuit-pattern {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23ff00a0' fill-opacity='1' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1z'%3E%3C/path%3E%3C/svg%3E");
        }
        
        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 16px;
          margin-bottom: 1rem;
          box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3),
                      0 0 0 1px rgba(6, 182, 212, 0.5),
                      0 0 20px rgba(6, 182, 212, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .logo-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 3s linear infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .logo-icon {
          font-size: 32px;
          color: white;
          z-index: 1;
        }
        
        .signup-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        
        .signup-form {
          margin-bottom: 1.5rem;
        }
        
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .step {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }
        
        .step.active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        
        .step.completed {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }
        
        .step-line {
          flex: 1;
          height: 2px;
          background-color: rgba(148, 163, 184, 0.2);
          margin: 0 10px;
        }
        
        .step-line.completed {
          background-color: #10b981;
        }
        
        .step-title {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .step-title h2 {
          font-size: 1.5rem;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }
        
        .step-title p {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        
        .input-icon {
          color: #38bdf8;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #f8fafc;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding-left: 2.5rem;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
          background-color: rgba(30, 41, 59, 1);
        }
        
        .form-input::placeholder {
          color: #64748b;
        }
        
        .form-input.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
        
        .password-toggle {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        
        .password-toggle:hover {
          color: #38bdf8;
        }
        
        .error-tooltip {
          position: absolute;
          top: 50%;
          right: 2.5rem;
          transform: translateY(-50%);
          color: #ef4444;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .error-tooltip span {
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          background-color: #ef4444;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          margin-right: 0.5rem;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .error-tooltip span::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: transparent transparent transparent #ef4444;
        }
        
        .error-tooltip:hover span {
          opacity: 1;
          visibility: visible;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .password-strength {
          margin-top: 0.5rem;
        }
        
        .strength-meter {
          height: 4px;
          background-color: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          margin-bottom: 0.25rem;
        }
        
        .strength-value {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .strength-0 { background-color: #ef4444; }
        .strength-1 { background-color: #f97316; }
        .strength-2 { background-color: #eab308; }
        .strength-3 { background-color: #22c55e; }
        .strength-4 { background-color: #10b981; }
        
        .strength-text {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .password-requirements {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        
        .requirement {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .requirement.met {
          color: #22c55e;
        }
        
        .requirement.unmet {
          color: #94a3b8;
        }
        
        .check-icon {
          font-size: 0.875rem;
        }
        
        .terms-group {
          margin-top: 1.5rem;
        }
        
        .checkbox-container {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          user-select: none;
        }
        
        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .checkbox-custom {
          position: relative;
          display: inline-block;
          width: 18px;
          height: 18px;
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          margin-right: 0.5rem;
          margin-top: 0.125rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .checkbox-container input:checked ~ .checkbox-custom {
          background-color: #38bdf8;
          border-color: #38bdf8;
        }
        
        .checkbox-custom::after {
          content: '';
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .checkbox-container input:checked ~ .checkbox-custom::after {
          display: block;
        }
        
        .checkbox-label {
          font-size: 0.875rem;
          color: #e2e8f0;
          line-height: 1.4;
        }
        
        .terms-link {
          color: #38bdf8;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .terms-link:hover {
          color: #0ea5e9;
          text-decoration: underline;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .back-button:hover {
          background-color: rgba(30, 41, 59, 0.8);
          border-color: rgba(148, 163, 184, 0.4);
        }
        
        .next-button, .signup-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.2);
        }
        
        .next-button::before, .signup-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        
        .next-button:hover, .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3);
        }
        
        .next-button:hover::before, .signup-button:hover::before {
          transform: translateX(100%);
        }
        
        .next-button:active, .signup-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px -1px rgba(6, 182, 212, 0.2);
        }
        
        .next-button:disabled, .signup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .button-arrow {
          font-size: 1.25rem;
          margin-left: 0.25rem;
          transition: transform 0.3s ease;
        }
        
        .next-button:hover .button-arrow {
          transform: translateX(4px);
        }
        
        .signup-button.loading {
          background: linear-gradient(135deg, #1e40af, #0e7490);
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .button-icon {
          font-size: 1.125rem;
        }
        
        .signup-footer {
          margin-top: 2rem;
        }
        
        .social-login {
          margin-bottom: 1.5rem;
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: rgba(148, 163, 184, 0.2);
        }
        
        .divider span {
          padding: 0 1rem;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        
        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .social-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .social-button:hover {
          transform: translateY(-2px);
          background-color: rgba(30, 41, 59, 1);
        }
        
        .social-button.github:hover {
          border-color: #f8fafc;
          color: #f8fafc;
        }
        
        .social-button.google:hover {
          border-color: #ea4335;
          color: #ea4335;
        }
        
        .login-prompt {
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .login-prompt a {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .login-prompt a:hover {
          color: #0ea5e9;
          text-decoration: underline;
        }
        
        .features-preview {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .feature {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        
        .feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #38bdf8;
          flex-shrink: 0;
        }
        
        .feature-text h3 {
          font-size: 0.875rem;
          color: #e2e8f0;
          margin-bottom: 0.25rem;
        }
        
        .feature-text p {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        /* Responsive styles */
        @media (max-width: 640px) {
          .signup-card {
            padding: 1.5rem;
          }
          
          .social-buttons {
            grid-template-columns: 1fr;
          }
          
          .features-preview {
            grid-template-columns: 1fr;
          }
          
          .password-requirements {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .back-button {
            order: 2;
          }
          
          .signup-button {
            order: 1;
            margin-bottom: 1rem;
          }
        }
        
        /* Animations for code particles */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Accessibility focus styles */
        .form-input:focus,
        .next-button:focus,
        .signup-button:focus,
        .social-button:focus,
        .password-toggle:focus,
        .back-button:focus,
        .terms-link:focus,
        .login-prompt a:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4);
        }
        
        /* Dark mode optimization */
        @media (prefers-color-scheme: light) {
          .signup-container {
            background: linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #283c86 100%);
          }
          
          .signup-card {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(0, 0, 0, 0.05);
            color: #334155;
          }
          
          .form-label {
            color: #334155;
          }
          
          .form-input {
            background-color: white;
            border-color: #e2e8f0;
            color: #0f172a;
          }
          
          .form-input:focus {
            background-color: white;
          }
          
          .checkbox-label {
            color: #334155;
          }
          
          .social-button {
            background-color: white;
            color: #334155;
          }
          
          .login-prompt {
            color: #475569;
          }
          
          .step-title h2 {
            color: #0f172a;
          }
          
          .step-title p {
            color: #475569;
          }
          
          .step {
            background-color: #f1f5f9;
            border-color: #e2e8f0;
            color: #64748b;
          }
          
          .requirement.unmet {
            color: #64748b;
          }
          
          .feature-text h3 {
            color: #0f172a;
          }
          
          .feature-text p {
            color: #475569;
          }
        }
        
        /* Animation for success */
        @keyframes successPulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        
        .success-animation {
          animation: successPulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Signup;


