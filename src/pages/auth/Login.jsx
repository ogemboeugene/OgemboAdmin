import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt, 
  FaEye, 
  FaEyeSlash, 
  FaCode, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaGithub,
  FaGoogle,
  FaKeyboard,
  FaFingerprint,
  FaHistory,
  FaSyncAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Form from '../../components/forms/Form';
import { validateEmail, validateRequired, createFormValidator } from '../../utils/validation';

/**
 * Enhanced Login page component with advanced animations and developer-focused design
 */
const Login = () => {
  const { login, isLoggedIn, isLoading } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [cyberpunkTheme, setCyberpunkTheme] = useState(false);
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  
  // Form validation schema with enhanced validation
  const validateForm = createFormValidator({
    email: (value) => {
      const requiredCheck = validateRequired(value);
      if (requiredCheck) return requiredCheck;
      
      const emailCheck = validateEmail(value);
      if (emailCheck) return emailCheck;
      
      // Additional validation for developer domains
      const devDomains = ['github.com', 'stackoverflow.com', 'gitlab.com', 'dev.to'];
      const domain = value.split('@')[1];
      if (devDomains.includes(domain)) {
        return null; // Valid developer domain
      }
      
      return null; // Still valid, just not a recognized dev domain
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
      
      return null;
    }
  });
  
  // Handle form submission with enhanced error handling
  const handleSubmit = async (values) => {
    try {
      setIsAnimating(true);
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await login({
        ...values,
        rememberMe
      });
      
      if (result.success) {
        success('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setLoginAttempts(prev => prev + 1);
        error(result.error || 'Login failed. Please check your credentials.');
        
        // Trigger matrix effect on failure
        triggerMatrixEffect();
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      error('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
      
      // Trigger matrix effect on failure
      triggerMatrixEffect();
    } finally {
      setIsAnimating(false);
    }
  };

  // Matrix rain animation effect
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

  // Shake animation effect for failed login attempts
  useEffect(() => {
    if (loginAttempts > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);
  
  // Terminal typing animation for the welcome message
  useEffect(() => {
    const terminalText = document.getElementById('terminal-text');
    if (!terminalText) return;
    
    const text = "Welcome to DevPortal. Authentication required...";
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
    const card = document.getElementById('login-card');
    if (!card) return;
    
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 20;
      const angleY = (centerX - x) / 20;
      
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+L to focus login button
      if (e.altKey && e.key === 'l') {
        const loginButton = document.querySelector('.login-button');
        if (loginButton) loginButton.focus();
      }
      
      // Alt+E to focus email field
      if (e.altKey && e.key === 'e') {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Toggle cyberpunk theme
  const toggleCyberpunkTheme = () => {
    document.body.classList.toggle('cyberpunk-theme');
    setCyberpunkTheme(!cyberpunkTheme);
  };

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  
  return (
    <div className="login-container">
      <canvas ref={canvasRef} className="matrix-canvas"></canvas>
      <div id="particles-container" className="particles-container"></div>
      
      {/* Circuit board pattern background */}
      <div className="circuit-pattern"></div>
      
      {/* Theme toggle button */}
      <button 
        className="theme-toggle"
        onClick={toggleCyberpunkTheme}
        aria-label="Toggle cyberpunk theme"
      >
        <FaSyncAlt />
      </button>
      
      <div id="login-card" className={`login-card ${isAnimating ? 'shake' : ''}`} ref={formRef}>
        <div className="login-header">
          <div className="logo-container">
            <FaCode className="logo-icon" />
          </div>
          <h1 className="login-title">DevPortal</h1>
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
        
        <Form
          initialValues={{ email: '', password: '' }}
          onSubmit={handleSubmit}
          validate={validateForm}
          className="login-form"
        >
          {({ values, errors, handleChange, handleBlur, isSubmitting }) => (
            <>
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
                    placeholder="developer@example.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors?.email ? 'input-error' : ''}`}
                    required
                    autoComplete="email"
                  />
                  {errors?.email && (
                    <div className="error-tooltip">
                      <FaExclamationTriangle />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
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
                    placeholder="••••••••"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors?.password ? 'input-error' : ''}`}
                    required
                    autoComplete="current-password"
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
                
                {values.password && !errors?.password && (
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
                
                {values.password && !errors?.password && (
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
              
              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
                
                {/* Biometric authentication option if supported */}
                {window.PublicKeyCredential && (
                  <button 
                    type="button" 
                    className="biometric-button"
                    onClick={() => alert('Biometric authentication would be triggered here')}
                  >
                    <FaFingerprint />
                    <span>Use Biometric</span>
                  </button>
                )}
                  <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                className={`login-button ${isSubmitting || isLoading ? 'loading' : ''}`}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <FaSignInAlt className="button-icon" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
              
              <div className="keyboard-shortcuts">
                <FaKeyboard className="shortcuts-icon" />
                <span>Keyboard shortcuts: Alt+E (Email), Alt+L (Login)</span>
              </div>
              
              <div className="social-login">
                <div className="divider">
                  <span>OR CONTINUE WITH</span>
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
            </>
          )}
        </Form>
        
        <div className="login-footer">
          <p className="demo-credentials">
            <FaInfoCircle className="info-icon" />
            <span>
              Demo credentials: <strong>demo@example.com</strong> / <strong>password123</strong>
            </span>
          </p>
          
          <div className="login-history">
            <div className="history-header">
              <FaHistory className="history-icon" />
              <span>Recent Logins</span>
            </div>
            <div className="history-items">
              <div className="history-item">
                <span className="history-device">MacBook Pro</span>
                <span className="history-time">Yesterday, 3:45 PM</span>
              </div>
              <div className="history-item">
                <span className="history-device">iPhone 13</span>
                <span className="history-time">Oct 12, 9:30 AM</span>
              </div>
            </div>
          </div>
          
          <p className="signup-prompt">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
      
      <style>{`
        .login-container {
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
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-50%) rotate(45deg); }
          100% { transform: translateX(50%) rotate(45deg); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .login-card {
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
        
        .login-card::before {
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
        
        .login-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .login-header {
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
          font-size: 32px;
          color: white;
          z-index: 1;
        }
        
        .login-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }
        
        .terminal {
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .terminal-header {
          background-color: #323232;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .terminal-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        
        .terminal-button.red { background-color: #ff5f56; }
        .terminal-button.yellow { background-color: #ffbd2e; }
        .terminal-button.green { background-color: #27c93f; }
        
        .terminal-body {
          padding: 1rem;
          color: #f8fafc;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          min-height: 40px;
        }
        
        .terminal-prompt {
          color: #06b6d4;
          margin-right: 0.5rem;
        }
        
        .terminal-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background-color: #f8fafc;
          animation: blink 1s step-end infinite;
          margin-left: 2px;
          vertical-align: middle;
        }
        
        .login-form {
          margin-bottom: 1.5rem;
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
          padding-left: 2rem;
          position: relative;
          background-image: linear-gradient(to right, rgba(56, 189, 248, 0.1) 30px, transparent 30px);
          background-size: 100% 100%;
          background-repeat: no-repeat;
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
        
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
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
          transition: all 0.2s ease;
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
        }
        
        .biometric-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #38bdf8;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }
        
        .biometric-button:hover {
          color: #0ea5e9;
          text-decoration: underline;
        }
        
        .forgot-password {
          font-size: 0.875rem;
          color: #38bdf8;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .forgot-password:hover {
          color: #0ea5e9;
          text-decoration: underline;
        }
        
        .keyboard-shortcuts {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.5rem;
          background-color: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .shortcuts-icon {
          color: #38bdf8;
        }
        
        .login-button {
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
        
        .login-button::before {
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
        
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3);
        }
        
        .login-button:hover::before {
          transform: translateX(100%);
        }
        
        .login-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px -1px rgba(6, 182, 212, 0.2);
        }
        
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .login-button.loading {
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
        
        .button-icon {
          font-size: 1.125rem;
        }
        
        .social-login {
          margin-top: 2rem;
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
        
        .login-footer {
          margin-top: 2rem;
          text-align: center;
        }
        
        .demo-credentials {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 8px;
          color: #38bdf8;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        
        .info-icon {
          color: #38bdf8;
          font-size: 1rem;
        }
        
        .login-history {
          margin-bottom: 1rem;
          background-color: rgba(30, 41, 59, 0.5);
          border-radius: 8px;
          padding: 0.75rem;
          text-align: left;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .history-icon {
          color: #38bdf8;
        }
        
        .history-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #e2e8f0;
        }
        
        .history-time {
          color: #94a3b8;
        }
        
        .signup-prompt {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .signup-prompt a {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .signup-prompt a:hover {
          color: #0ea5e9;
          text-decoration: underline;
        }
        
        /* Cyberpunk theme */
        .cyberpunk-theme .login-container {
          background: linear-gradient(135deg, #0f0f23 0%, #1a0b29 100%);
        }
        
        .cyberpunk-theme .login-card {
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
        
        .cyberpunk-theme .login-title {
          background: linear-gradient(to right, #ff00a0, #7928ca);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .cyberpunk-theme .terminal-prompt {
          color: #ff00a0;
        }
        
        .cyberpunk-theme .input-icon,
        .cyberpunk-theme .shortcuts-icon,
        .cyberpunk-theme .history-icon,
        .cyberpunk-theme .info-icon {
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
        
        .cyberpunk-theme .biometric-button,
        .cyberpunk-theme .forgot-password,
        .cyberpunk-theme .signup-prompt a {
          color: #ff00a0;
        }
        
        .cyberpunk-theme .biometric-button:hover,
        .cyberpunk-theme .forgot-password:hover,
        .cyberpunk-theme .signup-prompt a:hover {
          color: #ff3dc8;
        }
        
        .cyberpunk-theme .login-button {
          background: linear-gradient(135deg, #ff00a0, #7928ca);
          box-shadow: 0 4px 6px -1px rgba(255, 0, 128, 0.2);
        }
        
        .cyberpunk-theme .login-button:hover {
          box-shadow: 0 10px 15px -3px rgba(255, 0, 128, 0.3);
        }
        
        .cyberpunk-theme .demo-credentials {
          background-color: rgba(255, 0, 128, 0.1);
          border: 1px solid rgba(255, 0, 128, 0.2);
          color: #ff00a0;
        }
        
        .cyberpunk-theme .circuit-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23ff00a0' fill-opacity='1' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1z'%3E%3C/path%3E%3C/svg%3E");
        }
        
        /* Responsive styles */
        @media (max-width: 576px) {
          .login-card {
            padding: 1.5rem;
          }
          
          .social-buttons {
            grid-template-columns: 1fr;
          }
          
          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .terminal {
            display: none;
          }
          
          .password-requirements {
            grid-template-columns: 1fr;
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
        .login-button:focus,
        .social-button:focus,
        .password-toggle:focus,
        .forgot-password:focus,
        .signup-prompt a:focus,
        .biometric-button:focus,
        .theme-toggle:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4);
        }
        
        .cyberpunk-theme .form-input:focus,
        .cyberpunk-theme .login-button:focus,
        .cyberpunk-theme .social-button:focus,
        .cyberpunk-theme .password-toggle:focus,
        .cyberpunk-theme .forgot-password:focus,
        .cyberpunk-theme .signup-prompt a:focus,
        .cyberpunk-theme .biometric-button:focus,
        .cyberpunk-theme .theme-toggle:focus {
          box-shadow: 0 0 0 3px rgba(255, 0, 128, 0.4);
        }
        
        /* Dark mode optimization */
        @media (prefers-color-scheme: light) {
          .login-container {
            background: linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #283c86 100%);
          }
        
          .login-card {
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
          
          .signup-prompt {
            color: #475569;
          }
          
          .login-title {
            background: linear-gradient(to right, #2563eb, #0ea5e9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .terminal {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          
          .login-history {
            background-color: rgba(241, 245, 249, 0.8);
          }
          
          .history-header {
            color: #475569;
          }
          
          .history-item {
            color: #334155;
          }
          
          .history-time {
            color: #64748b;
          }
          
          .keyboard-shortcuts {
            background-color: rgba(241, 245, 249, 0.8);
            color: #475569;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

