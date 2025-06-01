import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaCode, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaKey,
  FaArrowLeft,
  FaSyncAlt,
  FaCheck
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import Form from '../../components/forms/Form';
import { validateRequired, createFormValidator } from '../../utils/validation';
import apiService from '../../services/api/apiService';

/**
 * ResetPassword page component with developer-focused design and animations
 */
const ResetPassword = () => {
  const { error, success } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [cyberpunkTheme, setCyberpunkTheme] = useState(false);
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  
  // Get token from URL parameters
  const token = searchParams.get('token');
  
  // Redirect if no token provided
  useEffect(() => {
    if (!token) {
      error('Invalid or missing reset token. Please request a new password reset.');
      navigate('/forgot-password');
    }
  }, [token, error, navigate]);
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
    const card = document.getElementById('reset-card');
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

  // Form validation schema
  const validateForm = createFormValidator({
    password: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);
      
      if (!(hasLower && hasUpper && hasNumber && hasSpecial)) {
        return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
      }
      
      return null;
    },
    confirmPassword: (value, formData) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      if (value !== formData.password) {
        return 'Passwords do not match';
      }
      
      return null;
    }
  });
  // Matrix rain animation
  const triggerMatrixEffect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    const matrixChars = matrix.split("");
    
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const drawMatrix = () => {
      ctx.fillStyle = "rgba(0, 10, 20, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#0f0";
      ctx.font = fontSize + "px monospace";
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };
    
    // Run the animation for a few seconds
    let matrixInterval = setInterval(drawMatrix, 33);
    setTimeout(() => {
      clearInterval(matrixInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
  };
  // Shake animation effect for failed attempts
  useEffect(() => {
    if (isAnimating) {
      triggerMatrixEffect();
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Initialize animations
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger initial matrix effect
      triggerMatrixEffect();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [cyberpunkTheme]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!token) {
      error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.auth.resetPassword({
        token,
        password: formData.password
      });
      
      if (response.data.success) {
        setResetSuccess(true);
        success(response.data.message || 'Password has been reset successfully');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setIsAnimating(true);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password. Please try again.';
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change for strength calculation
  const handlePasswordChange = (value) => {
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { color: 'text-gray-400', text: 'Enter password', width: 0 };
    if (passwordStrength < 25) return { color: 'text-red-500', text: 'Very Weak', width: 25 };
    if (passwordStrength < 50) return { color: 'text-orange-500', text: 'Weak', width: 50 };
    if (passwordStrength < 75) return { color: 'text-yellow-500', text: 'Good', width: 75 };
    return { color: 'text-green-500', text: 'Strong', width: 100 };
  };
  const strengthInfo = getPasswordStrengthInfo();
  // Initialize animations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cyberpunkTheme) {
        createMatrixRain();
      } else {
        createCircuitBoard();
      }
    }, 100);
    
    // Create floating code particles
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
    
    return () => {
      clearTimeout(timer);
      clearInterval(particleInterval);
    };
  }, [cyberpunkTheme]);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  // Toggle cyberpunk theme
  const toggleCyberpunkTheme = () => {
    document.body.classList.toggle('cyberpunk-theme');
    setCyberpunkTheme(!cyberpunkTheme);
  };

  if (resetSuccess) {
    return (
      <div className={`reset-container ${cyberpunkTheme ? 'cyberpunk-theme' : ''}`}>
        <canvas
          ref={canvasRef}
          className="matrix-canvas"
        />
        
        {/* Circuit board pattern */}
        <div className="circuit-pattern"></div>
        
        {/* Floating code particles */}
        <div id="particles-container" className="particles-container"></div>

        <div className="reset-content">
          <div className="reset-card success-card">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            
            <h1 className="success-title">
              Password Reset Successful!
            </h1>
            
            <p className="success-message">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            
            <Link
              to="/login"
              className="submit-button success-button"
            >
              <FaArrowLeft />
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`reset-container ${cyberpunkTheme ? 'cyberpunk-theme' : ''}`}>
      <canvas
        ref={canvasRef}
        className="matrix-canvas"
      />
      
      {/* Circuit board pattern */}
      <div className="circuit-pattern"></div>
      
      {/* Floating code particles */}
      <div id="particles-container" className="particles-container"></div>

      {/* Theme toggle */}
      <button
        className="theme-toggle"
        onClick={() => setCyberpunkTheme(!cyberpunkTheme)}
        aria-label="Toggle cyberpunk theme"
      >
        <FaSyncAlt />
      </button>      <div className="reset-content">
        {/* Header */}
        <div className="reset-header">
          <div className="logo-container">
            <FaKey className="logo-icon" />
          </div>
          
          <h1 className="reset-title">
            Reset Password
          </h1>
          
          <p className="reset-subtitle">
            Enter your new password below
          </p>
          
          {/* Terminal-style header */}
          <div className="terminal-prompt">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <span className="terminal-title">security/reset-password</span>
            </div>
            <div className="terminal-content">
              $ sudo chmod 600 ~/.password && echo "New credentials required"
            </div>
          </div>
        </div>

        {/* Reset Password Form */}
        <div 
          ref={formRef}
          id="reset-card"
          className={`reset-card ${isAnimating ? 'shake' : ''}`}
        >          <Form onSubmit={handleSubmit} validate={validateForm}>            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="input-icon" />
                <span>New Password</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  className="form-input"
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-value strength-${Math.floor(passwordStrength / 25)}`}
                    style={{ width: `${strengthInfo.width}%` }}
                  />
                </div>
                <span className="strength-text">
                  {strengthInfo.text}
                </span>
              </div>
            </div>            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FaShieldAlt className="input-icon" />
                <span>Confirm Password</span>
              </label>
              <div className="input-wrapper">
                <FaShieldAlt className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className="form-input"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="security-info">
              <div className="info-header">
                <FaInfoCircle className="info-icon" />
                <span className="info-title">Password Requirements:</span>
              </div>
              <div className="password-requirements">
                <div className="requirement">
                  <span className="check-icon">•</span>
                  <span>At least 8 characters long</span>
                </div>
                <div className="requirement">
                  <span className="check-icon">•</span>
                  <span>Contains uppercase and lowercase letters</span>
                </div>
                <div className="requirement">
                  <span className="check-icon">•</span>
                  <span>Contains at least one number</span>
                </div>
                <div className="requirement">
                  <span className="check-icon">•</span>
                  <span>Contains at least one special character</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <FaKey />
                  Reset Password
                </>
              )}
            </button>
          </Form>

          {/* Back to Login */}
          <div className="form-footer">
            <Link
              to="/login"
              className="back-link"
            >
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Developer Footer */}
        <div className="developer-footer">
          <div className="developer-info">
            <FaCode className="code-icon" />
            <span>Secure password reset protocol</span>
          </div>
        </div>
      </div>      {/* CSS for animations */}
      <style>{`
        .reset-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #283c86 100%);
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .matrix-canvas {
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .reset-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 400px;
          animation: fadeIn 0.6s ease-out;
        }
        
        .reset-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.1);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.05),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .reset-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(56, 189, 248, 0.03) 50%,
            transparent 100%
          );
          transform: rotate(45deg);
          animation: shimmer 10s linear infinite;
          z-index: -1;
        }
        
        .reset-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .reset-header {
          text-align: center;
          margin-bottom: 2rem;
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
        
        .logo-icon {
          font-size: 1.75rem;
          color: white;
          z-index: 1;
          position: relative;
        }
        
        .reset-title {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #38bdf8, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .reset-subtitle {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        
        .terminal-prompt {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          color: #22c55e;
          font-size: 0.875rem;
        }
        
        .terminal-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .terminal-dots {
          display: flex;
          gap: 0.25rem;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .dot.red { background-color: #ef4444; }
        .dot.yellow { background-color: #eab308; }
        .dot.green { background-color: #22c55e; }
        
        .terminal-title {
          margin-left: 0.5rem;
          font-size: 0.75rem;
        }
        
        .terminal-content {
          font-size: 0.75rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .input-icon {
          color: #38bdf8;
        }
          .input-wrapper {
          position: relative;
        }
          .input-wrapper .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #38bdf8;
          z-index: 2;
          pointer-events: none;
        }.form-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 12px;
          padding: 1rem 2.5rem 1rem 2.5rem;
          color: #ffffff !important;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        
        .form-input::placeholder {
          color: #64748b;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
          background: rgba(15, 23, 42, 0.8);
          color: #ffffff !important;
        }
          .input-wrapper::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          z-index: 1;
        }
        
        /* Ensure proper text cursor positioning */
        .form-input:focus {
          text-indent: 0;
        }
        
        .form-input {
          text-indent: 0;
        }
          .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .password-toggle:hover {
          color: #94a3b8;
        }
        
        .password-strength {
          margin-top: 0.75rem;
        }
        
        .strength-meter {
          width: 100%;
          height: 4px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .strength-value {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        
        .strength-0 { background: #ef4444; }
        .strength-1 { background: #f97316; }
        .strength-2 { background: #eab308; }
        .strength-3 { background: #22c55e; }
        .strength-4 { background: #16a34a; }
        
        .strength-text {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .security-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .info-icon {
          color: #3b82f6;
        }
        
        .info-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #93c5fd;
        }
        
        .password-requirements {
          font-size: 0.75rem;
          color: #bfdbfe;
        }
        
        .requirement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .check-icon {
          color: #3b82f6;
        }
        
        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none;
          border-radius: 12px;
          padding: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .form-footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #38bdf8;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }
        
        .back-link:hover {
          color: #0ea5e9;
        }
        
        .developer-footer {
          margin-top: 2rem;
          text-align: center;
        }
        
        .developer-info {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .code-icon {
          color: #22c55e;
        }
        
        /* Success page styles */
        .success-card {
          text-align: center;
        }
        
        .success-icon {
          font-size: 4rem;
          color: #22c55e;
          margin-bottom: 1.5rem;
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .success-title {
          font-size: 1.875rem;
          font-weight: bold;
          color: white;
          margin-bottom: 1rem;
        }
        
        .success-message {
          color: #94a3b8;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        
        .success-button {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }
        
        .success-button:hover {
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }
        
        /* Cyberpunk theme */
        .cyberpunk-theme .reset-container {
          background: linear-gradient(135deg, #0f0f23 0%, #1a0b29 100%);
        }
        
        .cyberpunk-theme .reset-card {
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
        
        .cyberpunk-theme .reset-title {
          background: linear-gradient(to right, #ff00a0, #7928ca);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .cyberpunk-theme .terminal-prompt {
          border-color: rgba(255, 0, 128, 0.3);
          color: #ff00a0;
        }
        
        .cyberpunk-theme .input-icon,
        .cyberpunk-theme .info-icon,
        .cyberpunk-theme .code-icon {
          color: #ff00a0;
        }
          .cyberpunk-theme .form-input:focus {
          border-color: #ff00a0;
          background: rgba(26, 11, 41, 0.9);
          color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(255, 0, 128, 0.1);
        }

        .cyberpunk-theme .form-input {
          color: #ffffff !important;
          background: rgba(26, 11, 41, 0.5);
          border: 1px solid rgba(255, 0, 128, 0.2);
        }

        .cyberpunk-theme .form-input::placeholder {
          color: #8b5a9f;
        }

      `}</style>
    </div>
  );
};

export default ResetPassword;
