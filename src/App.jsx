// cek tampilan awal
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import AuthContainer from "./components/auth-container"
import ContentContainer from "./components/content/content-container"

// Wrapper component to access navigate and location
function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading
  const [isLoading, setIsLoading] = useState(true)

  // Centralized authentication check
  const checkAuthentication = async () => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    try {
      // Verify token validity
      const response = await fetch("https://api.ayuwoki.my.id/users/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        // Token invalid, remove it
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthentication()
  }, [])

  // Handle navigation when authentication state changes
  useEffect(() => {
    if (isAuthenticated === null) return // Still loading

    const currentPath = location.pathname
    const authPaths = ["/", "/login", "/register", "/reset"]
    const contentPaths = ["/beranda", "/symptom", "/chatbot", "/health-tracker", "/profile"]

    if (isAuthenticated) {
      // User is authenticated
      if (authPaths.includes(currentPath)) {
        // If user is on auth page, redirect to beranda
        navigate("/beranda", { replace: true })
      }
      // If user is already on content page, stay there
    } else {
      // User is not authenticated
      if (contentPaths.includes(currentPath)) {
        // If user is on content page, redirect to home
        navigate("/", { replace: true })
      }
      // If user is already on auth page, stay there
    }
  }, [isAuthenticated, navigate, location.pathname])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    // Navigation will be handled by useEffect above
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    // Navigation will be handled by useEffect above
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3131] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<ContentContainer onLogout={handleLogout} />} />
      ) : (
        <Route path="/*" element={<AuthContainer onLoginSuccess={handleLoginSuccess} />} />
      )}
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App