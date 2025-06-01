import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaBook, 
  FaVideo, 
  FaHeadset, 
  FaEnvelope, 
  FaSearch, 
  FaChevronRight, 
  FaChevronDown, 
  FaExternalLinkAlt, 
  FaArrowLeft,
  FaGithub,
  FaSlack,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaLightbulb,
  FaExclamationCircle,
  FaInfoCircle,
  FaFileAlt,
  FaTools,
  FaCode
} from 'react-icons/fa';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  // FAQ data
  const faqs = [
    {
      question: "How do I create a new project?",
      answer: "To create a new project, navigate to the Projects section from the sidebar and click on the 'Add New Project' button. Fill in the required details in the form and click 'Create Project'."
    },
    {
      question: "How can I update my profile information?",
      answer: "You can update your profile information by going to the Profile section. Click on the 'Edit Profile' button to modify your personal details, skills, and other information."
    },
    {
      question: "How do I change my password?",
      answer: "To change your password, go to the Settings page and navigate to the Security tab. Enter your current password and your new password, then click 'Save Changes'."
    },
    {
      question: "Can I export my portfolio data?",
      answer: "Yes, you can export your portfolio data in various formats. Go to the Settings page, navigate to the Backup & Data tab, select your preferred format (JSON, CSV, or XML), and click the 'Export' button."
    },
    {
      question: "How do I connect my social media accounts?",
      answer: "To connect your social media accounts, go to the Settings page and navigate to the Social Profiles tab. Enter your usernames for each platform and click 'Save Changes'."
    },
    {
      question: "What happens if I delete my account?",
      answer: "Deleting your account will permanently remove all your data, including projects, profile information, and settings. This action cannot be undone. To delete your account, go to Settings > Account and click on 'Delete Account'."
    },
    {
      question: "How can I customize the appearance of my dashboard?",
      answer: "You can customize the appearance of your dashboard by going to Settings > Appearance. Here you can change the theme, color scheme, and font size according to your preferences."
    },
    {
      question: "Is my data backed up automatically?",
      answer: "By default, your data is backed up automatically on our secure servers. You can configure backup frequency in Settings > Backup & Data. You can also perform manual backups at any time."
    }
  ];
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  // Documentation links
  const documentationLinks = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using the OgemboAdmin dashboard",
      icon: <FaBook />,
      link: "#"
    },
    {
      title: "Project Management",
      description: "How to create and manage your portfolio projects",
      icon: <FaFileAlt />,
      link: "#"
    },
    {
      title: "Profile Customization",
      description: "Tips for optimizing your developer profile",
      icon: <FaTools />,
      link: "#"
    },
    {
      title: "API Documentation",
      description: "Technical details for integrating with our API",
      icon: <FaCode />,
      link: "#"
    }
  ];
  
  // Video tutorials
  const videoTutorials = [
    {
      title: "Dashboard Overview",
      duration: "5:32",
      thumbnail: "/assets/pro.jpg",
      link: "#"
    },
    {
      title: "Creating Your First Project",
      duration: "8:17",
      thumbnail: "/assets/pro.jpg",
      link: "#"
    },
    {
      title: "Optimizing Your Profile",
      duration: "6:45",
      thumbnail: "/assets/pro.jpg",
      link: "#"
    },
    {
      title: "Advanced Settings Configuration",
      duration: "10:23",
      thumbnail: "/assets/pro.jpg",
      link: "#"
    }
  ];
  
  return (
    <div className="help-container">
      <div className="help-header">
        <div className="header-left">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1><FaQuestionCircle /> Help & Support</h1>
          <p className="header-description">Find answers, learn how to use OgemboAdmin, and get support</p>
        </div>
      </div>
      
      <div className="help-search">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for help topics..." 
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>
      </div>
      
      <div className="help-tabs">
        <button 
          className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <FaQuestionCircle /> Frequently Asked Questions
        </button>
        <button 
          className={`tab-button ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          <FaBook /> Documentation
        </button>
        <button 
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <FaVideo /> Video Tutorials
        </button>
        <button 
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FaHeadset /> Contact Support
        </button>
      </div>
      
      <div className="help-content">
        {/* FAQ Section */}
        {activeTab === 'faq' && (
          <div className="faq-section">
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              {filteredFaqs.length === 0 && searchQuery && (
                <p className="no-results">No FAQs match your search query. Try different keywords or contact support.</p>
              )}
            </div>
            
            <div className="faq-list">
              {filteredFaqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <button 
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={expandedFaq === index}
                  >
                    <div className="question-text">
                      <FaQuestionCircle className="question-icon" />
                      <span>{faq.question}</span>
                    </div>
                    {expandedFaq === index ? <FaChevronDown /> : <FaChevronRight />}
                  </button>
                  
                  <motion.div 
                    className="faq-answer"
                    initial={false}
                    animate={{ 
                      height: expandedFaq === index ? 'auto' : 0,
                      opacity: expandedFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            <div className="faq-footer">
              <p>Can't find what you're looking for?</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('contact')}
              >
                <FaHeadset /> Contact Support
              </button>
            </div>
          </div>
        )}
        
        {/* Documentation Section */}
        {activeTab === 'docs' && (
          <div className="docs-section">
            <div className="section-header">
              <h2>Documentation</h2>
              <p>Comprehensive guides to help you make the most of OgemboAdmin</p>
            </div>
            
            <div className="docs-grid">
              {documentationLinks.map((doc, index) => (
                <motion.a 
                  key={index}
                  href={doc.link}
                  className="doc-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="doc-icon">{doc.icon}</div>
                  <div className="doc-content">
                    <h3>{doc.title}</h3>
                    <p>{doc.description}</p>
                  </div>
                  <FaExternalLinkAlt className="external-link-icon" />
                </motion.a>
              ))}
            </div>
            
            <div className="docs-categories">
              <div className="category-header">
                <h3>Browse by Category</h3>
              </div>
              
              <div className="category-grid">
                <div className="category-item">
                  <FaLightbulb className="category-icon" />
                  <h4>Getting Started</h4>
                  <ul>
                    <li><a href="#">Dashboard Overview</a></li>
                    <li><a href="#">Account Setup</a></li>
                    <li><a href="#">Navigation Guide</a></li>
                  </ul>
                </div>
                
                <div className="category-item">
                  <FaFileAlt className="category-icon" />
                  <h4>Projects</h4>
                  <ul>
                    <li><a href="#">Creating Projects</a></li>
                    <li><a href="#">Managing Projects</a></li>
                    <li><a href="#">Project Settings</a></li>
                  </ul>
                </div>
                
                <div className="category-item">
                  <FaTools className="category-icon" />
                  <h4>Profile</h4>
                  <ul>
                    <li><a href="#">Profile Customization</a></li>
                    <li><a href="#">Skills Management</a></li>
                    <li><a href="#">Experience & Education</a></li>
                  </ul>
                </div>
                
                <div className="category-item">
                  <FaCode className="category-icon" />
                  <h4>Advanced</h4>
                  <ul>
                    <li><a href="#">API Integration</a></li>
                    <li><a href="#">Data Export/Import</a></li>
                    <li><a href="#">Custom Themes</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="full-documentation">
              <a href="#" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                <FaBook /> View Full Documentation
              </a>
            </div>
          </div>
        )}
        
        {/* Video Tutorials Section */}
        {activeTab === 'videos' && (
          <div className="videos-section">
            <div className="section-header">
              <h2>Video Tutorials</h2>
              <p>Learn how to use OgemboAdmin through our video guides</p>
            </div>
            
            <div className="videos-grid">
              {videoTutorials.map((video, index) => (
                <motion.div 
                  key={index}
                  className="video-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="video-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="video-duration">{video.duration}</div>
                    <div className="play-button">
                      <FaYoutube />
                    </div>
                  </div>
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <a href={video.link} className="watch-link" target="_blank" rel="noopener noreferrer">
                      Watch Tutorial <FaExternalLinkAlt />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="video-channel">
              <div className="channel-info">
                <FaYoutube className="channel-icon" />
                <div className="channel-text">
                  <h3>OgemboAdmin YouTube Channel</h3>
                  <p>Subscribe to our channel for more tutorials and updates</p>
                </div>
              </div>
              <a href="#" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                Visit Channel <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        )}
        
        {/* Contact Support Section */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            <div className="section-header">
              <h2>Contact Support</h2>
              <p>Get help from our support team</p>
            </div>
            
            <div className="contact-options">
              <motion.div 
                className="contact-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-info">
                  <h3>Email Support</h3>
                  <p>Get a response within 24 hours</p>
                  <a href="mailto:support@ogembo.com" className="contact-link">
                    support@ogembo.com
                  </a>
                </div>
              </motion.div>
              
              <motion.div 
                className="contact-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="contact-icon">
                  <FaHeadset />
                </div>
                <div className="contact-info">
                  <h3>Live Chat</h3>
                  <p>Chat with our support team</p>
                  <button className="btn-primary">
                    Start Chat
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="contact-form-container">
              <h3>Send a Message</h3>
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" required>
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="projects">Projects</option>
                    <option value="billing">Billing</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="attach-logs" />
                    <span>Attach system logs to help troubleshoot</span>
                  </label>
                </div>
                
                <button type="submit" className="btn-primary">
                  <FaEnvelope /> Send Message
                </button>
              </form>
            </div>
            
            <div className="community-support">
              <h3>Community Support</h3>
              <p>Connect with other users and get help from the community</p>
              
              <div className="community-links">
                <a href="#" className="community-link github" target="_blank" rel="noopener noreferrer">
                  <FaGithub /> GitHub Discussions
                </a>
                <a href="#" className="community-link slack" target="_blank" rel="noopener noreferrer">
                  <FaSlack /> Slack Channel
                </a>
                <a href="#" className="community-link discord" target="_blank" rel="noopener noreferrer">
                  <FaDiscord /> Discord Server
                </a>
                <a href="#" className="community-link twitter" target="_blank" rel="noopener noreferrer">
                  <FaTwitter /> Twitter
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="help-footer">
        <div className="help-tips">
          <div className="tip-item">
            <FaLightbulb className="tip-icon" />
            <div className="tip-content">
              <h4>Pro Tip</h4>
              <p>Use keyboard shortcuts to navigate faster. Press <kbd>?</kbd> anywhere to see available shortcuts.</p>
            </div>
          </div>
          
          <div className="tip-item">
            <FaExclamationCircle className="tip-icon" />
            <div className="tip-content">
              <h4>Common Issue</h4>
              <p>If your changes aren't saving, try clearing your browser cache or using incognito mode.</p>
            </div>
          </div>
          
          <div className="tip-item">
            <FaInfoCircle className="tip-icon" />
            <div className="tip-content">
              <h4>Did You Know?</h4>
              <p>You can export your entire portfolio as a PDF to share with potential employers.</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        /* Help Container */
        .help-container {
          padding: var(--spacing-xl);
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
        
        /* Help Header */
        .help-header {
          margin-bottom: var(--spacing-xl);
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-sm);
          transition: var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-color);
        }
        
        .help-header h1 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .header-description {
          color: var(--gray-600);
          font-size: var(--text-base);
        }
        
        /* Help Search */
        .help-search {
          margin-bottom: var(--spacing-xl);
        }
        
        .search-wrapper {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .search-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }
        
        .help-search input {
          width: 100%;
          padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) * 2 + 1em);
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius-full);
          font-size: var(--text-base);
          transition: var(--transition-fast);
        }
        
        .help-search input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .clear-search {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          font-size: var(--text-xl);
          cursor: pointer;
          padding: 0;
        }
        
        .clear-search:hover {
          color: var(--gray-700);
        }
        
        /* Help Tabs */
        .help-tabs {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
          border-bottom: 1px solid var(--gray-200);
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .help-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background: none;
          border: none;
          color: var(--gray-600);
          font-size: var(--text-base);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        }
        
        .tab-button:hover {
          color: var(--primary-color);
        }
        
        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        /* Section Header */
        .section-header {
          margin-bottom: var(--spacing-xl);
        }
        
        .section-header h2 {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
        }
        
        .section-header p {
          color: var(--gray-600);
          font-size: var(--text-base);
        }
        
        .no-results {
          padding: var(--spacing-lg);
          background-color: var(--gray-100);
          border-radius: var(--border-radius);
          text-align: center;
          color: var(--gray-600);
        }
        
        /* FAQ Section */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .faq-item {
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          overflow: hidden;
          transition: var(--transition);
        }
        
        .faq-item.expanded {
          box-shadow: var(--shadow-md);
        }
        
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .question-text {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          font-weight: 500;
          color: var(--gray-800);
          font-size: var(--text-base);
        }
        
        .question-icon {
          color: var(--primary-color);
          flex-shrink: 0;
        }
        
        .faq-question:hover {
          background-color: var(--gray-50);
        }
        
        .faq-answer {
          padding: 0 var(--spacing-lg);
          overflow: hidden;
        }
        
        .faq-answer p {
          padding-bottom: var(--spacing-lg);
          color: var(--gray-600);
          line-height: 1.6;
        }
        
        .faq-footer {
          text-align: center;
          margin-top: var(--spacing-xl);
          padding: var(--spacing-xl) 0;
          border-top: 1px solid var(--gray-200);
        }
        
        .faq-footer p {
          margin-bottom: var(--spacing-md);
          color: var(--gray-600);
        }
        
        /* Documentation Section */
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .doc-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
          position: relative;
        }
        
        .doc-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          border-radius: var(--border-radius);
          font-size: var(--text-xl);
          flex-shrink: 0;
        }
        
        .doc-content {
          flex: 1;
        }
        
        .doc-content h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .doc-content p {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        .external-link-icon {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          color: var(--gray-400);
          font-size: var(--text-sm);
          transition: var(--transition-fast);
        }
        
        .doc-card:hover .external-link-icon {
          color: var(--primary-color);
        }
        
        .docs-categories {
          margin-bottom: var(--spacing-xl);
        }
        
        .category-header {
          margin-bottom: var(--spacing-lg);
        }
        
        .category-header h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
        }
        
        .category-item {
          padding: var(--spacing-lg);
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
        }
        
        .category-icon {
          font-size: var(--text-2xl);
          color: var(--primary-color);
          margin-bottom: var(--spacing-md);
        }
        
        .category-item h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-md);
        }
        
        .category-item ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .category-item li {
          margin-bottom: var(--spacing-sm);
        }
        
        .category-item li:last-child {
          margin-bottom: 0;
        }
        
        .category-item a {
          color: var(--gray-700);
          transition: var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .category-item a:hover {
          color: var(--primary-color);
        }
        
        .category-item a::before {
          content: '→';
          opacity: 0;
          transition: var(--transition-fast);
          margin-right: -10px;
        }
        
        .category-item a:hover::before {
          opacity: 1;
          margin-right: var(--spacing-xs);
        }
        
        .full-documentation {
          text-align: center;
          margin-top: var(--spacing-xl);
        }
        
        /* Video Tutorials Section */
        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .video-card {
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          overflow: hidden;
          transition: var(--transition);
        }
        
        .video-thumbnail {
          position: relative;
          height: 160px;
          overflow: hidden;
        }
        
        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        
        .video-card:hover .video-thumbnail img {
          transform: scale(1.05);
        }
        
        .video-duration {
          position: absolute;
          bottom: var(--spacing-sm);
          right: var(--spacing-sm);
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--white);
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
          font-size: var(--text-xs);
        }
        
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: var(--text-2xl);
          opacity: 0.8;
          transition: var(--transition-fast);
        }
        
        .video-card:hover .play-button {
          background-color: var(--primary-color);
          opacity: 1;
        }
        
        .video-info {
          padding: var(--spacing-md);
        }
        
        .video-info h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-sm);
        }
        
        .watch-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--primary-color);
          font-size: var(--text-sm);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .watch-link:hover {
          text-decoration: underline;
        }
        
        .video-channel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          margin-top: var(--spacing-xl);
        }
        
        .channel-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .channel-icon {
          font-size: var(--text-3xl);
          color: #ff0000;
        }
        
        .channel-text h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .channel-text p {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        /* Contact Support Section */
        .contact-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        
        .contact-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          transition: var(--transition);
        }
        
        .contact-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--border-radius-full);
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-2xl);
          flex-shrink: 0;
        }
        
        .contact-info {
          flex: 1;
        }
        
        .contact-info h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .contact-info p {
          color: var(--gray-600);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .contact-link {
          color: var(--primary-color);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .contact-link:hover {
          text-decoration: underline;
        }
        
        .contact-form-container {
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }
        
        .contact-form-container h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-lg);
        }
        
        .contact-form {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }
        
        .form-group {
          margin-bottom: 0;
        }
        
        .form-group:nth-child(3),
        .form-group:nth-child(4),
        .form-group:nth-child(5),
        .form-group:nth-child(6) {
          grid-column: span 2;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }
        
        .checkbox-label input {
          width: auto;
        }
        
        .community-support {
          background-color: var(--white);
          border-radius: var(--border-radius);
          border: 1px solid var(--gray-200);
          padding: var(--spacing-xl);
        }
        
        .community-support h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .community-support p {
          color: var(--gray-600);
          margin-bottom: var(--spacing-lg);
        }
        
        .community-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }
        
        .community-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-radius: var(--border-radius);
          font-weight: 500;
          transition: var(--transition-fast);
        }
        
        .community-link.github {
          background-color: #f6f8fa;
          color: #333;
        }
        
        .community-link.slack {
          background-color: #4A154B;
          color: white;
        }
        
        .community-link.discord {
          background-color: #5865F2;
          color: white;
        }
        
        .community-link.twitter {
          background-color: #1DA1F2;
          color: white;
        }
        
        .community-link:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        /* Help Footer */
        .help-footer {
          margin-top: var(--spacing-2xl);
          padding-top: var(--spacing-xl);
          border-top: 1px solid var(--gray-200);
        }
        
        .help-tips {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }
        
        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--gray-50);
          border-radius: var(--border-radius);
        }
        
        .tip-icon {
          font-size: var(--text-xl);
          color: var(--primary-color);
          margin-top: var(--spacing-xs);
        }
        
        .tip-content h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--spacing-xs);
        }
        
        .tip-content p {
          color: var(--gray-600);
          font-size: var(--text-sm);
        }
        
        kbd {
          display: inline-block;
          padding: 2px 6px;
          background-color: var(--gray-200);
          border-radius: var(--border-radius-sm);
          font-family: monospace;
          font-size: var(--text-xs);
          color: var(--gray-700);
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .help-container {
            padding: var(--spacing-md);
          }
          
          .help-tabs {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .tab-button {
            flex: 1;
            justify-content: center;
          }
          
          .contact-form {
            grid-template-columns: 1fr;
          }
          
          .form-group:nth-child(3),
          .form-group:nth-child(4),
          .form-group:nth-child(5),
          .form-group:nth-child(6) {
            grid-column: span 1;
          }
          
          .video-channel {
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
          
          .channel-info {
            flex-direction: column;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .help-header h1 {
            font-size: var(--text-2xl);
          }
          
          .contact-card {
            flex-direction: column;
            text-align: center;
          }
          
          .contact-icon {
            margin-bottom: var(--spacing-md);
          }
          
          .community-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Help;
