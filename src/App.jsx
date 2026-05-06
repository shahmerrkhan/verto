import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MobileNav from './components/MobileNav'
import Navbar from './components/Navbar'
import { useAuth } from './context/AuthContext'
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
import { ThemeProvider } from './context/ThemeContext'
import OpportunityDetail from './pages/OpportunityDetail'
import BackToTop from './components/BackToTop'
import UrgentNudge from './components/UrgentNudge'
import { useState } from 'react'
import ShortcutManager from './components/ShortcutManager'
import Leaderboard from './pages/Leaderboard'
import ForOrganizers from './pages/ForOrganizers'
import Mentors from './pages/Mentors'



function App() {
  const { loading, user } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '2px solid rgba(245,158,11,0.2)',
        borderTopColor: '#f59e0b',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '13px', color: '#7d8590', fontFamily: 'DM Sans, sans-serif' }}>Loading Verto...</span>
    </div>
  )

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/saves" element={<ProtectedRoute><Saves /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/submit-article" element={<ProtectedRoute><SubmitArticle /></ProtectedRoute>} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
          <Route path="/research" element={<Research />} />
          <Route path="/admin/articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/for-organizers" element={<ForOrganizers />} />
          <Route path="/mentors" element={<Mentors />} />
        </Routes>
        <MobileNav />
      <BackToTop />
      <ShortcutManager />
      {user && <UrgentNudge />}
    </BrowserRouter>
  </ThemeProvider>
  )
}

export default App