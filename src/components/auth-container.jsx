// src/components/Auth-container.jsx
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import HomeAuth from "./Home"
import Login from "./Login"
import Register from "./Register"
import Reset from "./Reset"

const AuthContainer = ({ onLoginSuccess }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to home if user lands on content paths while not authenticated
  useEffect(() => {
    const contentPaths = ["/beranda", "/symptom", "/chatbot", "/health-tracker", "/profile"]
    if (contentPaths.includes(location.pathname)) {
      navigate("/", { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <Routes>
      <Route path="/" element={<HomeAuth onNavigateToRegister={() => navigate("/register")} />} />
      <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
      <Route path="/register" element={<Register onNavigateToLogin={() => navigate("/login")} />} />
      <Route path="/reset" element={<Reset onNavigateToLogin={() => navigate("/login")} />} />
      <Route path="*" element={<HomeAuth onNavigateToRegister={() => navigate("/register")} />} />
    </Routes>
  )
}

export default AuthContainer