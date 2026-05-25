// src/App.jsx
import React, { useContext, useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthContext';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import { MessageCircle } from 'lucide-react';
import './components/CommunityChatButton.css';
import GoogleLoginModal from './components/GoogleLoginModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeMarketplace from './components/ResumeMarketplace';
import FloatingWhatsAppPopup from './components/FloatingWhatsAppPopup';
import { API_URL } from './services/api.js';


// Lazy-loaded pages
const Home = lazy(() => import('./components/Home'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/signup'));
const ChatPage = lazy(() => import('./components/ChatPage'));
const MentorListPage = lazy(() => import('./components/MentorListPage'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));
const NearbyMentors = lazy(() => import('./components/NearbyMentors'));
const InternshipPage = lazy(() => import('./components/InternshipPage'));
const CommunityChat = lazy(() => import('./components/CommunityChat'));
const EngineView = lazy(() => import('./components/EngineView'));
const MentorDashboard = lazy(() => import('./components/MentorDashboard'));
const MentorMonetization = lazy(() => import('./components/MentorMonetization'));
const MentorProfilePage = lazy(() => import('./components/MentorProfilePage'));
const ShareableMentorProfilePage = lazy(() => import('./components/ShareableMentorProfilePage'));
const MentorOnboardingPage = lazy(() => import('./components/MentorOnboardingPage'));
const MyBookings = lazy(() => import('./components/MyBookings'));
const RoleBasedDashboard = lazy(() => import('./components/RoleBasedDashboard'));
const MyQuestions = lazy(() => import('./components/MyQuestionsEnhanced'));
const EnhancedAskQuestion = lazy(() => import('./components/EnhancedAskQuestion'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CareerGuidesPage = lazy(() => import('./components/CareerGuidesPage'));
const AuthSuccess = lazy(() => import('./components/AuthSuccess'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const IntelligenceTerminal = lazy(() => import('./components/intelligenceTerminal'));
// Community notifications — static, no need inside component
const COMMUNITY_NOTIFICATIONS = [
  '💬 Join the Community Chat!',
  '👋 Hello from VNIT students!',
  '🙋‍♀️ Shwati: Need placement help',
  '🎉 Priyanka got intern at IIM!',
  '🔬 Ravi got IIT research intern!',
  '💼 Arjun cracked Google SDE role',
  '🚀 Live discussions happening now',
  '🎓 MANIT students sharing tips',
  '✨ Get instant career guidance',
  '🤝 Connect with 500+ students',
];

function App() {
  const location = useLocation();
  const { user, login } = useContext(AuthContext);

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCommunityChat, setShowCommunityChat] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [currentNotification, setCurrentNotification] = useState(0);

  const isChatPage = location.pathname === '/chat';
  const isHomePage = location.pathname === '/';
  const isIntelligencePage = location.pathname === '/intelligence';

  // Show WhatsApp widget only on home page
  useEffect(() => {
    document.body.classList.toggle('page-home', isHomePage);
  }, [isHomePage]);

  // Show Google modal once per session if not logged in
  useEffect(() => {
    if (!user && !localStorage.getItem('atyant_google_modal_dismissed')) {
      setShowGoogleModal(true);
    }
  }, [user]);

  // Listen for community chat open event from Navbar
  useEffect(() => {
    const handler = () => setShowCommunityChat(true);
    window.addEventListener('openCommunityChat', handler);
    return () => window.removeEventListener('openCommunityChat', handler);
  }, []);

  const handleToggleCommunityChat = useCallback(() => {
    setShowCommunityChat(prev => !prev);
    setNewMessageCount(0);
  }, []);

  // Rotate notification badge messages (home only)
  useEffect(() => {
    if (!isHomePage || showCommunityChat) return;
    const id = setInterval(() => {
      setCurrentNotification(prev => (prev + 1) % COMMUNITY_NOTIFICATIONS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isHomePage, showCommunityChat]);

  // 🔴 FIX: Poll for new community messages — only when user is logged in & chat closed
  useEffect(() => {
    if (!user || showCommunityChat) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let initialized = false;

    const checkNewMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/community-chat/messages?limit=1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const messages = await res.json();
        if (!Array.isArray(messages) || messages.length === 0) return;

        const latest = messages[messages.length - 1];
        if (!initialized) { setLastMessageId(latest._id); initialized = true; return; }

        setLastMessageId(prev => {
          if (latest._id !== prev) {
            setNewMessageCount(c => c + 1);
            return latest._id;
          }
          return prev;
        });
      } catch { /* silent fail */ }
    };

    checkNewMessages();
    const id = setInterval(checkNewMessages, 15000);
    return () => clearInterval(id);
  }, [user, showCommunityChat]);

  const handleGoogleSuccess = useCallback((credentialResponse) => {
    if (!credentialResponse?.credential) return;
    fetch(`${API_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          login(data.token);
          setShowGoogleModal(false);
          localStorage.setItem('atyant_google_modal_dismissed', 'true');
        } else if (data.message?.toLowerCase().includes('signup')) {
          window.location.href = '/signup';
        }
      })
      .catch(console.error);
  }, [login]);

  const handleModalClose = useCallback(() => {
    setShowGoogleModal(false);
    localStorage.setItem('atyant_google_modal_dismissed', 'true');
  }, []);

  return (
    <div className={isChatPage && user ? 'App chat-active' : 'App'}>
      {!isIntelligencePage && <Navbar />}
      <main>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/internships" element={<InternshipPage />} />

              {/* Added: /dad route shows InternshipPage */}
              <Route path="/dad" element={<InternshipPage />} />
              <Route path="/career-guides" element={<CareerGuidesPage />} />
              <Route path="/profile/:username" element={<PublicProfilePage />} />
              <Route path="/resume-store" element={<ResumeMarketplace />} />
              <Route path="/mentor-onboarding" element={<MentorOnboardingPage />} />
              <Route path="/mentor/:mentorId" element={<ShareableMentorProfilePage />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
              <Route path="/mentors" element={<ProtectedRoute><MentorListPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ErrorBoundary><ChatPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/chat/:mentorId" element={<ProtectedRoute><ErrorBoundary><ChatPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/nearby-mentors" element={<ProtectedRoute><NearbyMentors /></ProtectedRoute>} />
              <Route path="/engine/:questionId" element={<ProtectedRoute><EngineView /></ProtectedRoute>} />
              <Route path="/answer/:answerCardId" element={<ProtectedRoute><EngineView isAnswerView={true} /></ProtectedRoute>} />
              <Route path="/my-questions" element={<ProtectedRoute><MyQuestions /></ProtectedRoute>} />
              <Route path="/ask" element={<ProtectedRoute><EnhancedAskQuestion /></ProtectedRoute>} />
              <Route path="/intelligence" element={<ProtectedRoute><IntelligenceTerminal /></ProtectedRoute>} />
              <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
              <Route path="/mentor-monetization" element={<ProtectedRoute><MentorMonetization /></ProtectedRoute>} />
              <Route path="/mentor-details/:mentorId" element={<MentorProfilePage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>

      {!isChatPage && !isIntelligencePage && <Footer />}
      <Analytics />

      {/* Community Chat FAB removed per request */}

      {showCommunityChat && (
        <Suspense fallback={null}>
          <CommunityChat onClose={() => setShowCommunityChat(false)} />
        </Suspense>
      )}

      {/* Custom WhatsApp Text Popup — home page only */}
      {isHomePage && <FloatingWhatsAppPopup />}

      <GoogleLoginModal
        isOpen={showGoogleModal && !user}
        onSuccess={handleGoogleSuccess}
        onError={() => { }}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;
