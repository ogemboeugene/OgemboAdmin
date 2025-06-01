import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaArrowLeft,
  FaCode, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSyncAlt,
  FaPaperPlane,
  FaShieldAlt,
  FaClock,
  FaHistory
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import Form from '../../components/forms/Form';
import { validateEmail, validateRequired, createFormValidator } from '../../utils/validation';
import apiService from '../../services/api/apiService';

/**
 * ForgotPassword page component with developer-focused design and animations
 */
const ForgotPassword = () => {
  const { error, success } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [cyberpunkTheme, setCyberpunkTheme] = useState(false);
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  
  // Form validation schema
  const validateForm = createFormValidator({
    email: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      const emailCheck = validateEmail(value);
      if (emailCheck) return emailCheck;
      
      return null;
    }
  });

  // Matrix rain animation
  const createMatrixRain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()+-=[]{}|;:,.<>?";
    const matrixArray = matrix.split("");
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * canvas.height;
    }
    
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
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
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  
  // Terminal typing animation
  useEffect(() => {
    const terminalText = document.getElementById('terminal-text');
    if (!terminalText) return;
    
    const text = "Password reset module initialized...";
    let index = 0;
    
    const typeWriter = () => {
      if (index < text.length) {
        terminalText.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, Math.random() * 50 + 30);
      } else {
        setTimeout(() => {
          terminalText.textContent = "";
          index = 0;
          typeWriter();
        }, 5000);
      }
    };
    
    typeWriter();
    
    return () => {
      clearTimeout(typeWriter);
    };
  }, []);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      createMatrixRain();
        const response = await apiService.auth.forgotPassword(values.email);
      
      if (response.data && response.data.success) {
        // Console log the reset URL for testing purposes
        if (response.data.resetToken || response.data.token) {
          const resetToken = response.data.resetToken || response.data.token;
          const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
          console.log('🔗 PASSWORD RESET URL (for testing):', resetUrl);
          console.log('📧 This URL would be sent to:', values.email);
          console.log('🎯 Token:', resetToken);
        }
        
        setEmailSent(true);
        setResendTimer(60); // 60 second timer before allowing resend
        success(response.data.message || 'Password reset instructions have been sent to your email.');
        
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid email address. Please check your input.';
            break;
          case 404:
            // Don't reveal if email exists for security reasons
            errorMessage = 'If an account with that email exists, a password reset link has been sent.';
            setEmailSent(true);
            setResendTimer(60);
            break;
          case 429:
            errorMessage = 'Too many password reset requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred during password reset.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      if (error.response?.status !== 404) {
        setIsAnimating(true);
        error(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  // Handle resend email
  const handleResendEmail = async (email) => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.auth.forgotPassword(email);
      
      // Console log the reset URL for testing purposes
      if (response.data && response.data.success && (response.data.resetToken || response.data.token)) {
        const resetToken = response.data.resetToken || response.data.token;
        const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
        console.log('🔗 PASSWORD RESET URL (RESENT - for testing):', resetUrl);
        console.log('📧 This URL would be sent to:', email);
        console.log('🎯 Token:', resetToken);
      }
      
      setResendTimer(60);
      success('Password reset instructions have been sent again.');
    } catch (error) {
      error('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        'export', 'async', 'await', 'try', 'catch', '{...}', '[]', '.map()', '.filter()',
        'reset', 'password', 'auth', 'security', 'email', 'token', 'verify'
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
    const card = document.getElementById('forgot-card');
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
  return (
    <div className="forgot-password-container">
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
      
      <div id="forgot-card" className={`forgot-password-card ${isAnimating ? 'shake' : ''}`} ref={formRef}>
        <div className="forgot-password-header">
          <div className="logo-container">
            <FaShieldAlt className="logo-icon" />
          </div>
          <h1 className="forgot-password-title">Password Recovery</h1>
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-button red"></span>
              <span className="terminal-button yellow"></span>
              <span className="terminal-button green"></span>
            </div>
            <div className="terminal-body">
              <span className="terminal-prompt">$ </span>
              <span id="terminal-text" className="terminal-text"></span>
              <span className="terminal-cursor">_</span>
            </div>
          </div>
        </div>

        {!emailSent ? (
          <Form
            initialValues={{ email: '' }}
            onSubmit={handleSubmit}
            validate={validateForm}
            className="forgot-password-form"
          >
            {({ values, errors, handleChange, handleBlur, isSubmitting }) => (
              <>
                <div className="form-description">
                  <FaInfoCircle className="info-icon" />
                  <p>Enter your email address and we'll send you instructions to reset your password.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="label-icon" />
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your email address"
                      className={`form-input ${errors?.email ? 'error' : ''}`}
                      disabled={isSubmitting || isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                    {errors?.email && (
                      <div className="error-tooltip">
                        <FaExclamationTriangle />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`reset-button ${isSubmitting || isLoading ? 'loading' : ''}`}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    <>
                      <FaPaperPlane className="button-icon" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <div className="security-note">
                  <FaShieldAlt className="security-icon" />
                  <p>For security reasons, we'll send reset instructions to the email associated with your account.</p>
                </div>
              </>
            )}
          </Form>
        ) : (
          <div className="success-state">
            <div className="success-icon-container">
              <FaCheckCircle className="success-icon" />
            </div>
            <h2 className="success-title">Check Your Email</h2>
            <p className="success-message">
              We've sent password reset instructions to your email address. 
              Please check your inbox and follow the link to reset your password.
            </p>
            
            <div className="email-tips">
              <h3>Didn't receive the email?</h3>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <Form
              initialValues={{ email: '' }}
              onSubmit={(values) => handleResendEmail(values.email)}
              validate={validateForm}
              className="resend-form"
            >
              {({ values, errors, handleChange }) => (
                <div className="resend-section">
                  <div className="form-group">
                    <label htmlFor="resend-email" className="form-label">
                      Email Address for Resend
                    </label>
                    <input
                      id="resend-email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className={`form-input ${errors?.email ? 'error' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className={`resend-button ${resendTimer > 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
                    disabled={resendTimer > 0 || isLoading || !values.email}
                  >
                    {resendTimer > 0 ? (
                      <>
                        <FaClock className="button-icon" />
                        <span>Resend in {resendTimer}s</span>
                      </>
                    ) : isLoading ? (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <FaHistory className="button-icon" />
                        <span>Resend Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </Form>
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login" className="back-link">
            <FaArrowLeft className="back-icon" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>      <style jsx>{`
        .forgot-password-container {
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
          color: rgba(255, 255, 255, 0.3);
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
        
        .forgot-password-card {
          width: 100%;
          max-width: 500px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      0 0 15px rgba(215, 109, 119, 0.3);
          padding: 2.5rem;
          position: relative;
          z-index: 10;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        
        .forgot-password-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(215, 109, 119, 0.03) 50%,
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
        
        .forgot-password-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        /* Cyberpunk theme */
        .cyberpunk-theme .forgot-password-container {
          background: linear-gradient(135deg, #0f0f23 0%, #1a0b29 100%);
        }

        .cyberpunk-theme .forgot-password-card {
          background: linear-gradient(145deg, rgba(26, 11, 41, 0.9), rgba(15, 15, 35, 0.9));
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      0 0 15px rgba(255, 0, 128, 0.3);
        }

        .cyberpunk-theme .code-particle {
          color: rgba(255, 0, 128, 0.3);
        }
          overflow: hidden;
        }
        
        .matrix-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0.3;
        }
        
        .circuit-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: moveBackground 20s linear infinite;
          z-index: 2;
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
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        .forgot-password-card {
          width: 100%;
          max-width: 480px;
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
          animation: fadeIn 0.5s ease forwards;
        }
        
        .forgot-password-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(56, 189, 248, 0.05) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .forgot-password-card.shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .forgot-password-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          border-radius: 12px;
          margin-bottom: 1rem;
          position: relative;
        }
        
        .logo-icon {
          font-size: 1.5rem;
          color: white;
          z-index: 1;
        }
        
        .forgot-password-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .terminal {
          background: #000;
          border-radius: 8px;
          padding: 0;
          margin: 1rem 0;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }
        
        .terminal-header {
          background: linear-gradient(90deg, #1a1a1a, #2a2a2a);
          padding: 0.5rem;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .terminal-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .terminal-button.red { background: #ff5f57; }
        .terminal-button.yellow { background: #ffbd2e; }
        .terminal-button.green { background: #28ca42; }
        
        .terminal-body {
          padding: 1rem;
          color: #38bdf8;
          font-size: 0.875rem;
          min-height: 2rem;
        }
        
        .terminal-prompt {
          color: #22c55e;
        }
        
        .terminal-text {
          color: #38bdf8;
        }
        
        .terminal-cursor {
          color: #38bdf8;
          animation: blink 1s infinite;
        }
        
        .forgot-password-form {
          margin-bottom: 1.5rem;
        }
        
        .form-description {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .info-icon {
          color: #3b82f6;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }
        
        .form-description p {
          color: #cbd5e1;
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 0.5rem;
        }
        
        .label-icon {
          color: #38bdf8;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.5);
          border-radius: 8px;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        
        .form-input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
          background: rgba(15, 23, 42, 0.9);
        }
        
        .form-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .form-input::placeholder {
          color: #64748b;
        }
        
        .error-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ef4444;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          z-index: 10;
        }
        
        .error-tooltip::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 1rem;
          width: 8px;
          height: 8px;
          background: #ef4444;
          transform: rotate(45deg);
        }
        
        .reset-button, .resend-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .reset-button:hover, .resend-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3);
        }
        
        .reset-button:active, .resend-button:active {
          transform: translateY(0);
        }
        
        .reset-button.loading, .resend-button.loading {
          background: linear-gradient(135deg, #64748b, #475569);
          cursor: not-allowed;
        }
        
        .reset-button:disabled, .resend-button:disabled {
          background: linear-gradient(135deg, #64748b, #475569);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .resend-button.disabled {
          background: linear-gradient(135deg, #64748b, #475569);
          cursor: not-allowed;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .button-icon {
          font-size: 0.875rem;
        }
        
        .security-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .security-icon {
          color: #22c55e;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }
        
        .security-note p {
          color: #cbd5e1;
          margin: 0;
          font-size: 0.75rem;
          line-height: 1.5;
        }
        
        .success-state {
          text-align: center;
          padding: 1rem 0;
        }
        
        .success-icon-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .success-icon {
          font-size: 2rem;
          color: white;
        }
        
        .success-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 1rem 0;
        }
        
        .success-message {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        
        .email-tips {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        
        .email-tips h3 {
          color: #f8fafc;
          font-size: 1rem;
          margin: 0 0 1rem 0;
        }
        
        .email-tips ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #cbd5e1;
        }
        
        .email-tips li {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .resend-form {
          margin-bottom: 1.5rem;
        }
        
        .resend-section {
          text-align: left;
        }
        
        .back-to-login {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #38bdf8;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .back-link:hover {
          color: #0ea5e9;
          transform: translateX(-2px);
        }
        
        .back-icon {
          font-size: 0.75rem;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-50%) rotate(45deg); }
          100% { transform: translateX(50%) rotate(45deg); }
        }
        
        /* Responsive design */
        @media (max-width: 640px) {
          .forgot-password-container {
            padding: 0.5rem;
          }
          
          .forgot-password-card {
            padding: 1.5rem;
          }
          
          .forgot-password-title {
            font-size: 1.5rem;
          }
        }
        
        /* Cyberpunk theme */
        :global(body.cyberpunk-theme) .forgot-password-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%);
        }
        
        :global(body.cyberpunk-theme) .forgot-password-card {
          background: linear-gradient(145deg, #1a0a1a, #0a0a0a);
          border: 1px solid #ff00ff;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
        }
        
        :global(body.cyberpunk-theme) .logo-container {
          background: linear-gradient(135deg, #ff00ff, #00ffff);
        }
        
        :global(body.cyberpunk-theme) .forgot-password-title {
          background: linear-gradient(135deg, #ff00ff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
