import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Navbar from './components/Navbar'
import MobileNav from './components/MobileNav'
import BackToTop from './components/BackToTop'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Saves from './pages/Saves'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Courses from './pages/Courses'
import Articles from './pages/Articles'
import SubmitArticle from './pages/SubmitArticle'
import ArticleDetail from './pages/ArticleDetail'
import Research from './pages/Research'
import AdminArticles from './pages/AdminArticles'
import OpportunityDetail from './pages/OpportunityDetail'
import Leaderboard from './pages/Leaderboard'
import ForOrganizers from './pages/ForOrganizers'
import Mentors from './pages/Mentors'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const { loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        border: '2px solid var(--accent-violet-muted)',
        borderTopColor: 'var(--accent-violet)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <span style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        Loading Verto...
      </span>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/onboarding" element={<ProtectedRoute><PageWrapper><Onboarding /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/saves" element={<ProtectedRoute><PageWrapper><Saves /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageWrapper><Analytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><PageWrapper><Courses /></PageWrapper></ProtectedRoute>} />
        <Route path="/articles" element={<PageWrapper><Articles /></PageWrapper>} />
        <Route path="/submit-article" element={<ProtectedRoute><PageWrapper><SubmitArticle /></PageWrapper></ProtectedRoute>} />
        <Route path="/articles/:id" element={<PageWrapper><ArticleDetail /></PageWrapper>} />
        <Route path="/opportunities/:id" element={<ProtectedRoute><PageWrapper><OpportunityDetail /></PageWrapper></ProtectedRoute>} />
        <Route path="/research" element={<PageWrapper><Research /></PageWrapper>} />
        <Route path="/admin/articles" element={<ProtectedRoute adminOnly><PageWrapper><AdminArticles /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><PageWrapper><Admin /></PageWrapper></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><PageWrapper><Leaderboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/for-organizers" element={<PageWrapper><ForOrganizers /></PageWrapper>} />
        <Route path="/mentors" element={<PageWrapper><Mentors /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <AppRoutes />
          <MobileNav />
          <BackToTop />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}