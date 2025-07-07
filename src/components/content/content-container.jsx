// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Home from "./Home"
import Symptom from "./Symptom"
import Chatbot from "./Chatbot"
import HealthTrack from "./Health-track"
import Profile from "./Profile"
import { config } from "../../config"

const ContentContainer = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${config.apiUserService}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.username && result.email) {
              const userData = { username: result.username, fullName: result.fullName, email: result.email };
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            } else {
              navigate("/login");
            }
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          });
      } else {
        navigate("/login");
      }
    }
  }, [navigate])

  // Fungsi untuk navigasi dari Navbar
  const handleNavigation = (page) => {
    const targetPath = page === "home" ? "/beranda" : `/${page}`;
    navigate(targetPath);
  }

  // Fungsi untuk logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar selalu tampil */}
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

      {/* Konten halaman sesuai URL */}
      <Routes>
        <Route path="/beranda" element={<Home />} />
        <Route path="/symptom" element={<Symptom />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/health-tracker" element={<HealthTrack />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default ContentContainer