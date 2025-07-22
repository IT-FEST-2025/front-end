// menggabungkan home, symptom, health track, chatbot, profil jadi satu wadah
// import { config } from "../../config"
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
      const token = localStorage.getItem("accessToken") // Pastikan menggunakan "accessToken"

      // Jika ada data pengguna yang tersimpan, gunakan segera
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Ambil data pengguna terbaru
        const response = await fetch("https://api.ayuwoki.my.id/users/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // Jika token tidak valid/kedaluwarsa, bersihkan dan arahkan ke login
          if (response.status === 401) {
            console.error("Token kedaluwarsa atau tidak valid. Harap login kembali.")
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user") // Bersihkan data pengguna yang usang
            setUser(null) // Set pengguna ke null untuk mencerminkan status logout
            navigate("/login") // Arahkan ke halaman login
          }
          throw new Error("Gagal mengambil data pengguna")
        }

        const data = await response.json()

        if (data.status === "success" && data.data) {
          const userData = {
            username: data.data.username || "",
            fullName: data.data.fullName || "",
            email: data.data.email || "",
            profilePicture: data.data.profilePicture || "", // Langsung gunakan nama file profilePicture
            age: data.data.age || null,
            gender: data.data.gender || "",
            height: data.data.height || null,
            weight: data.data.weight || null,
            chronicDiseases: data.data.chronicDiseases || [],
            smokingStatus: data.data.smokingStatus || "",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        } else {
          console.error("Respons API menunjukkan kegagalan atau data hilang:", data)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("user")
          setUser(null)
          navigate("/login")
        }
      } catch (error) {
        console.error("Error saat mengambil data pengguna:", error)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        setUser(null)
        navigate("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [navigate]) // Tambahkan navigate ke array dependensi

  const handleNavigation = (page) => {
    const targetPath = page === "home" ? "/beranda" : `/${page}`
    navigate(targetPath)
  }

  const handleLogout = () => {
    if (onLogout) onLogout()
  }

  // Tampilkan status loading saat mengambil data pengguna
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3131] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
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