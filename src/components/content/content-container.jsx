// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah
import { config } from "../../config"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Home from "./Home"
import Symptom from "./Symptom"
import Chatbot from "./Chatbot"
import HealthTrack from "./Health-track"
import Profile from "./Profile"

const ContentContainer = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to update user state from child components
  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData)
    localStorage.setItem("user", JSON.stringify(updatedUserData))
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      // If we have stored user data, use it immediately
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch fresh user data
        const response = await fetch(`${config.apiUserService}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()

        if (data.username && data.email) {
          const userData = {
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            profilePicture: "",
          }

          // Fetch profile picture
          try {
            const photoResponse = await fetch(`${config.apiUserService}/api/photoprofile`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            const photoData = await photoResponse.json()
            if (photoData.profilePictureUrl) {
              userData.profilePicture = photoData.profilePictureUrl
            }
          } catch (photoError) {
            console.error("Error fetching profile photo:", photoError)
          }

          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleNavigation = (page) => {
    const targetPath = page === "home" ? "/beranda" : `/${page}`
    navigate(targetPath)
  }

  const handleLogout = () => {
    if (onLogout) onLogout()
  }

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3131] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        user={user}
        currentPage={location.pathname === "/beranda" ? "home" : location.pathname.replace("/", "")}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/beranda" element={<Home />} />
        <Route path="/symptom" element={<Symptom />} />
        <Route path="/chatbot" element={<Chatbot user={user} />} />
        <Route path="/health-tracker" element={<HealthTrack />} />
        <Route path="/profile" element={<Profile user={user} onUserUpdate={handleUserUpdate} />} />
        {/* Redirect root to beranda */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default ContentContainer