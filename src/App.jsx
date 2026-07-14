import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import BackgroundEffect from './components/BackgroundEffect'
import TouchEffectLayer from './components/TouchEffectLayer'
import CursorTrail from './components/CursorTrail'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Recorder from './pages/Recorder'
import Recordings from './pages/Recordings'
import VideoPreview from './pages/VideoPreview'

function AppShell() {
  const { theme } = useTheme()

  return (
    <TouchEffectLayer touch={theme.touch}>
      <BackgroundEffect effect={theme.effect} />
      {theme.cursorEffect && <CursorTrail variant={theme.cursorEffect} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthedLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </TouchEffectLayer>
  )
}

function AuthedLayout() {
  return (
    <div className="font-body">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recorder" element={<Recorder />} />
        <Route path="/recordings" element={<Recordings />} />
        <Route path="/recordings/:id" element={<VideoPreview />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
