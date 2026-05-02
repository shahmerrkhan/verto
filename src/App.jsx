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


function App() {
  const { loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/saves" element={
          <ProtectedRoute>
            <Saves />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      } />

      <Route path="/articles" element={
        <Articles />
      } />

      <Route path="/submit-article" element={
        <ProtectedRoute>
          <SubmitArticle />
        </ProtectedRoute>
      } />

      <Route path="/articles/:id" element={
        <ArticleDetail />
      } />

      <Route path="/research" element={
        <Research />
      } />

      <Route path="/admin/articles" element={
        <ProtectedRoute>
          <AdminArticles />
        </ProtectedRoute>
      } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
      <MobileNav />
    </BrowserRouter>
  )
}

export default App