// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah

import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Home from "./Home"
import Symptom from "./Symptom"
import Chatbot from "./Chatbot"
import HealthTrack from "./Health-track"
import Profile from "./Profile"

const ContentContainer = () => {
  // Baca halaman terakhir dari localStorage, default ke "home" jika tidak ada
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentPage") || "home"
    }
    return "home"
  })

  const [user] = useState({
    username: "Contoh",
    email: "contoh@email.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
  })

  // Simpan halaman aktif ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage)
  }, [currentPage])

  // Fungsi untuk mengubah halaman aktif
  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  // Fungsi untuk merender komponen halaman yang sesuai
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />
      case "symptom":
        return <Symptom />
      case "chatbot":
        return <Chatbot />
      case "health-tracker":
        return <HealthTrack />
      case "profile":
        return <Profile />
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar dirender di sini dan mengontrol navigasi */}
      <Navbar user={user} currentPage={currentPage} onNavigate={handleNavigation} />

      {/* Area konten utama */}
      {renderCurrentPage()}
    </div>
  )
}

export default ContentContainer