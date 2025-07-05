// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import Navbar from "./Navbar"
import Home from "./Home"
import Symptom from "./Symptom"
import Chatbot from "./Chatbot"
import HealthTrack from "./Health-track"
import Profile from "./Profile"

const ContentContainer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [user] = useState({
    username: "Contoh",
    email: "contoh@email.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
  })

  // Fungsi untuk navigasi dari Navbar
  const handleNavigation = (page) => {
    navigate(page === "home" ? "/beranda" : `/${page}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar selalu tampil */}
      <Navbar
        user={user}
        currentPage={location.pathname === "/" ? "home" : location.pathname.replace("/", "")}
        onNavigate={handleNavigation}
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
