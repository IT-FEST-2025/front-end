// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { config } from "../../config"
import Navbar from "./Navbar"
import Home from "./Home"
import Symptom from "./Symptom"
import Chatbot from "./Chatbot"
import HealthTrack from "./Health-track"
import Profile from "./Profile"
import Login from "../Login" // Import Login component
import Register from "../Register" // Import Register component

const ContentContainer = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  // Function to update user state from child components
  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData)
    localStorage.setItem("user", JSON.stringify(updatedUserData))
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (token) {
      // Fetch user basic data
      fetch(`${config.apiUserService}/users/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username && data.email) {
            const userData = {
              username: data.username,
              fullName: data.fullName,
              email: data.email,
              profilePicture: "", // Initialize profilePicture
            }
            // Fetch profile picture
            fetch(`${config.apiUserService}/users/api/photoprofile`, {
              method: "GET", // Specify GET method explicitly
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((photoRes) => photoRes.json())
              .then((photoData) => {
                if (photoData.profilePictureUrl) {
                  userData.profilePicture = photoData.profilePictureUrl
                }
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
              })
              .catch((photoError) => {
                console.error("Error fetching profile photo:", photoError)
                setUser(userData) // Still set user data even if photo fetch fails
                localStorage.setItem("user", JSON.stringify(userData))
              })
          } else {
            navigate("/login")
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/login")
        })
    } else {
      navigate("/login")
    }
  }, [navigate])

  const handleNavigation = (page) => {
    const targetPath = page === "home" ? "/beranda" : `/${page}`
    navigate(targetPath)
  }

  const handleLogout = () => {
    if (onLogout) onLogout()
    localStorage.removeItem("token") // Ensure token is removed
    localStorage.removeItem("user") // Ensure user data is removed
    setUser(null) // Clear user state
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        user={user}
        currentPage={
          location.pathname === "/beranda" || location.pathname === "/"
            ? "home"
            : location.pathname.replace("/", "")
        }
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/beranda" element={<Home />} />
        <Route path="/symptom" element={<Symptom />} />
        <Route path="/chatbot" element={<Chatbot user={user} />} />
        <Route path="/health-tracker" element={<HealthTrack />} />
        {/* Pass handleUserUpdate to Profile component */}
        <Route
          path="/profile"
          element={<Profile user={user} onUserUpdate={handleUserUpdate} />}
        />
        <Route path="*" element={<Home />} /> {/* Fallback route */}
      </Routes>
    </div>
  )
}

export default ContentContainer