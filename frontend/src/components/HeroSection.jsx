// src/components/HeroSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './HeroSection.css';
import LoadingSpinner from './LoadingSpinner';
import { API_URL } from '../services/api.js';
import { ArrowRight, BadgeCheck } from 'lucide-react';

const HeroSection = () => {
  const [problem, setProblem] = useState('');
  const [counters, setCounters] = useState({ students: 0, mentors: 0, support: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const statsRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const rotatingQuestions = [
    'How can I get an IIM internship?',
    'How can I get an IIT internship?',
    'How did seniors from my branch crack Google or Amazon?',
    'What projects help get internship shortlists?',
    'Why am I getting rejected in placements?'
  ];

  const fallbackQuestions = [
    "Generate a structured DSA roadmap",
    "How to get shortlists for product roles",
    "Analyze my resume for ATS matching",
    "Identify exact gaps in my prep",
    "Connect me with someone who solved this"
  ];

  const quickPills = [];

  // ── Typewriter effect ──
  useEffect(() => {
    const currentText = rotatingQuestions[currentQuestion];
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setDisplayText(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setCurrentQuestion((prev) => (prev + 1) % rotatingQuestions.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentQuestion]);

  // ── Counter animation ──
  const animateCounter = (start, end, duration, key) => {
    const increment = (end - start) / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
    }, 16);
  };

  // ── Trigger counter animation on scroll ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounter(0, 1000, 2000, 'students');
          animateCounter(0, 200, 1800, 'mentors');
          animateCounter(0, 24, 1500, 'support');
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // ── Fetch AI suggestions ──
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user?.token) {
        setLoadingSuggestions(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/ask/generate-suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        setSuggestedQuestions(data.ok && Array.isArray(data.suggestions) ? data.suggestions : fallbackQuestions);
      } catch {
        setSuggestedQuestions(fallbackQuestions);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [user]);

  // ── Send question (with profile check) ──
  const sendQuestion = async () => {
    setSubmitting(true);
    setLoading(true);
    try {
      const profileRes = await fetch(`${API_URL}/api/profile/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!profileRes.ok) {
        alert('Failed to verify profile. Please try again.');
        return;
      }

      const profileData = await profileRes.json();
      const hasUsername = !!profileData.username;
      const hasBio = !!profileData.bio;
      const hasEducation = profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0;
      const isProfileComplete = hasUsername && hasBio && hasEducation;

      if (!isProfileComplete) {
        const missingFields = [];
        if (!hasUsername) missingFields.push('Username');
        if (!hasBio) missingFields.push('Bio');
        if (!hasEducation) missingFields.push('Education');
        alert(`Please complete your profile first. Missing: ${missingFields.join(', ')}`);
        localStorage.setItem('pendingQuestion', problem);
        navigate('/profile');
        return;
      }

      localStorage.setItem('draftQuestion', problem);
      navigate('/ask');
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // ── Handle form submit ──
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problem.trim()) return;
    if (!user?.token) {
      localStorage.setItem('pendingQuestion', problem);
      navigate('/login');
      return;
    }
    setShowConfirmPrompt(true);
  };

  // ── Click on typewriter question to fill input ──
  const handleQuestionClick = () => {
    setProblem(rotatingQuestions[currentQuestion]);
  };

  // ── Click on quick pill to fill input ──
  const handlePillClick = (text) => {
    setProblem(text);
    document.querySelector('.hero-ask-input')?.focus();
  };

  // ── Close suggestions on outside click ──
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <section className="hero-section" id="hero-section">
      {/* Background effects */}
      <div className="hero-grid-pattern" />
      <div className="hero-glow hero-glow--blue" />
      <div className="hero-glow hero-glow--cyan" />

      {/* Floating topic cards */}
      <div className="hero-floating-cards">
        <div className="hero-float-card hero-fc-1"><span className="hero-fc-emoji">🎯</span>Placement prep</div>
        <div className="hero-float-card hero-fc-2"><span className="hero-fc-emoji">💼</span>Internship tips</div>
        <div className="hero-float-card hero-fc-3"><span className="hero-fc-emoji">📝</span>Resume review</div>
        <div className="hero-float-card hero-fc-4"><span className="hero-fc-emoji">🧠</span>DSA roadmap</div>
        <div className="hero-float-card hero-fc-5"><span className="hero-fc-emoji">🚀</span>GATE strategy</div>
      </div>

      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          India's career execution intelligence platform
        </div>

        {/* Heading */}
        <h1 className="hero-heading">
          Ask once. Get matched with<br />
          <span className="hero-heading-highlight">seniors who cracked it.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Connecting students with seniors who already solved their exact problem, and training AI on every real outcome
        </p>

        {/* Typewriter Rotating Questions */}
        <div className="hero-rotating-questions" onClick={handleQuestionClick}>
          <span className="hero-rotating-label"></span>
          <div className="hero-question-rotator">
            <span className="hero-rotating-text">
              {displayText}
              <span className={`hero-cursor ${isTyping ? 'hero-cursor--typing' : ''}`}>|</span>
            </span>
          </div>
        </div>

        {/* Ask Bar */}
        <form onSubmit={handleSubmit} className="hero-ask-form">
          <div className="hero-ask-bar" ref={suggestionsRef}>
            <div className="hero-input-wrapper">
              <svg className="hero-spark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5z" />
              </svg>
              <input
                type="text"
                className="hero-ask-input"
                placeholder="Describe your current blocker or goal..."
                value={problem}
                onChange={e => setProblem(e.target.value)}
                maxLength={500}
                required
              />
            </div>

            <button type="submit" className="hero-ask-button" disabled={submitting}>
              {submitting ? '...' : 'Get my answer'}
            </button>
          </div>
        </form>

        {/* Atyant AI — inline banner */}
        <Link to="/intelligence" className="hero-ai-banner">
          <div className="hero-ai-banner-left">
            <span className="hero-ai-banner-icon">✦</span>
            <div>
              <div className="hero-ai-banner-title">Try Atyant AI <span className="hero-ai-banner-badge">New</span></div>
              <div className="hero-ai-banner-sub">Deep career intelligence — just tell me your college, branch &amp; goal</div>
            </div>
          </div>
          <span className="hero-ai-banner-arrow">→</span>
        </Link>

        {/* Mentor onboarding CTA */}
        <Link to="/mentor-onboarding" className="hero-mentor-banner">
          <div className="hero-mentor-banner-left">
            <span className="hero-mentor-banner-icon"><BadgeCheck size={16} /></span>
            <div>
              <div className="hero-mentor-banner-title">Become a verified mentor</div>
              <div className="hero-mentor-banner-sub">Join Atyant and publish your public mentor profile in a few steps</div>
            </div>
          </div>
          <span className="hero-mentor-banner-arrow"><ArrowRight size={18} /></span>
        </Link>

        {/* Confirmation Modal */}
        {showConfirmPrompt && (
          <div className="hero-confirm-overlay" role="dialog" aria-modal="true" onClick={() => setShowConfirmPrompt(false)}>
            <div className="hero-confirm-card" onClick={(e) => e.stopPropagation()}>
              <p className="hero-confirm-label">Analyzing request...</p>
              <h3>Initializing Match</h3>
              <p className="hero-confirm-body">
                Our semantic engine will process your query and connect you with the most relevant verified solution pathways.
              </p>
              <div className="hero-confirm-actions">
                <button type="button" className="hero-confirm-edit" onClick={() => setShowConfirmPrompt(false)}>
                  Edit question
                </button>
                <button
                  type="button"
                  className="hero-confirm-send"
                  onClick={() => {
                    setShowConfirmPrompt(false);
                    sendQuestion();
                  }}
                >
                  Run Query
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="hero-stats" ref={statsRef}>
          <div className="hero-stat-item">
            <span className="hero-stat-number">{counters.students.toLocaleString()}+</span>
            <span className="hero-stat-label">STUDENTS HELPED</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-item">
            <span className="hero-stat-number">{counters.mentors}+</span>
            <span className="hero-stat-label">VERIFIED MENTORS</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-item">
            <span className="hero-stat-number">24/7</span>
            <span className="hero-stat-label">AI SUPPORT</span>
          </div>
        </div>


      </div>
    </section>
  );
};

export default HeroSection;