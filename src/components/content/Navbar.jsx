// navbar di tampilan setelah login
// import { config } from "../../config"
import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { getProfileImageUrl } from "../../utils/profile-images"

const Navbar = ({ user, onNavigate, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // For profile dropdown
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false) // For mobile navigation dropdown
  // Hapus state userData, karena akan menggunakan prop user
  const dropdownRef = useRef(null)
  const mobileNavRef = useRef(null) // Ref for mobile navigation dropdown

  // Hapus fungsi fetchUserData dan useEffect terkait
  // useEffect(() => { fetchUserData() }, [])

  const getCurrentPage = () => {
    switch (location.pathname) {
      case "/":
      case "/beranda":
        return "home"
      case "/symptom":
        return "symptom"
      case "/chatbot":
        return "chatbot"
      case "/health-tracker":
        return "health-tracker"
      case "/profile":
        return "profile"
      default:
        return "home"
    }
  }

  const currentPage = getCurrentPage()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop <= 640)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setIsMobileNavOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    onLogout()
    setIsDropdownOpen(false)
  }

  const handleEditProfile = () => {
    onNavigate("profile")
    setIsDropdownOpen(false)
  }

  const handleNavClick = (page, e) => {
    e.preventDefault()
    onNavigate(page)
    setIsMobileNavOpen(false) // Close mobile nav dropdown on navigation
  }

  // Logika untuk menentukan style navbar
  const isHomePage = currentPage === "home"
  const shouldUseRedBackground = isHomePage && isScrolled

  const customStyles = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
    }
    
    @keyframes slideDownRight {
      from {
        opacity: 0;
        transform: translateY(-10px) translateX(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) translateX(0) scale(1);
      }
    }
    
    .mobile-dropdown-enter {
      animation: slideDown 0.2s ease-out forwards;
    }
    
    .mobile-dropdown-exit {
      animation: slideUp 0.15s ease-in forwards;
    }
    
    .profile-dropdown-enter {
      animation: slideDownRight 0.25s ease-out forwards;
      transform-origin: top right;
    }
  `

  // Gunakan prop user untuk mendapatkan URL gambar profil
  const profileImgSrc = getProfileImageUrl(user?.profilePicture)
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== "" // Periksa apakah ada gambar yang sebenarnya

  return (
    <>
      <nav
        className={`cursor-default fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          shouldUseRedBackground ? "bg-[#ff3131] backdrop-blur-sm" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Nav Toggle */}
            <div className="flex items-center relative" ref={mobileNavRef}>
              <button
                onClick={(e) => {
                  if (window.innerWidth < 768) {
                    // Only toggle on small screens (md breakpoint is 768px)
                    setIsMobileNavOpen(!isMobileNavOpen)
                  } else {
                    handleNavClick("home", e)
                  }
                }}
                className={`text-2xl font-bold transition-colors duration-300 flex items-center ${
                  shouldUseRedBackground ? "text-white" : "text-[#ff3131]"
                }`}
              >
                Diagnify
                <svg
                  className={`w-4 h-4 ml-2 transition-transform duration-300 md:hidden ${
                    isMobileNavOpen ? "rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Mobile Navigation Dropdown */}
              {isMobileNavOpen && (
                <>
                  <style>{customStyles}</style>
                  <div className="md:hidden absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-60 mobile-dropdown-enter">
                    <button
                      onClick={(e) => handleNavClick("home", e)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${
                        currentPage === "home"
                          ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50"
                          : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]"
                      }`}
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                        Beranda
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleNavClick("symptom", e)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${
                        currentPage === "symptom"
                          ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50"
                          : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]"
                      }`}
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                        AI Symptom
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleNavClick("chatbot", e)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${
                        currentPage === "chatbot"
                          ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50"
                          : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]"
                      }`}
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                        Chatbot
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleNavClick("health-tracker", e)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${
                        currentPage === "health-tracker"
                          ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50"
                          : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]"
                      }`}
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
                        Health Tracker
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={(e) => handleNavClick("home", e)}
                className={`font-medium transition-all duration-300 pb-1 relative group ${
                  currentPage === "home" ? "font-bold" : ""
                } ${shouldUseRedBackground ? "text-white" : "text-[#ff3131]"}`}
              >
                Beranda
                {/* Active state underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    currentPage === "home" ? `w-full ${shouldUseRedBackground ? "bg-white" : "bg-[#ff3131]"}` : "w-0"
                  }`}
                />
                {/* Hover animation underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                    currentPage !== "home" ? (shouldUseRedBackground ? "bg-white" : "bg-[#ff3131]") : "bg-transparent"
                  }`}
                />
              </button>

              <button
                onClick={(e) => handleNavClick("symptom", e)}
                className={`font-medium transition-all duration-300 pb-1 relative group ${
                  currentPage === "symptom" ? "font-bold" : ""
                } ${shouldUseRedBackground ? "text-white" : "text-[#ff3131]"}`}
              >
                AI Symptom
                {/* Active state underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    currentPage === "symptom" ? `w-full ${shouldUseRedBackground ? "bg-white" : "bg-[#ff3131]"}` : "w-0"
                  }`}
                />
                {/* Hover animation underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                    currentPage !== "symptom"
                      ? shouldUseRedBackground
                        ? "bg-white"
                        : "bg-[#ff3131]"
                      : "bg-transparent"
                  }`}
                />
              </button>

              <button
                onClick={(e) => handleNavClick("chatbot", e)}
                className={`font-medium transition-all duration-300 pb-1 relative group ${
                  currentPage === "chatbot" ? "font-bold" : ""
                } ${shouldUseRedBackground ? "text-white" : "text-[#ff3131]"}`}
              >
                Chatbot
                {/* Active state underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    currentPage === "chatbot" ? `w-full ${shouldUseRedBackground ? "bg-white" : "bg-[#ff3131]"}` : "w-0"
                  }`}
                />
                {/* Hover animation underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                    currentPage !== "chatbot"
                      ? shouldUseRedBackground
                        ? "bg-white"
                        : "bg-[#ff3131]"
                      : "bg-transparent"
                  }`}
                />
              </button>

              <button
                onClick={(e) => handleNavClick("health-tracker", e)}
                className={`font-medium transition-all duration-300 pb-1 relative group ${
                  currentPage === "health-tracker" ? "font-bold" : ""
                } ${shouldUseRedBackground ? "text-white" : "text-[#ff3131]"}`}
              >
                Health Tracker
                {/* Active state underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    currentPage === "health-tracker"
                      ? `w-full ${shouldUseRedBackground ? "bg-white" : "bg-[#ff3131]"}`
                      : "w-0"
                  }`}
                />
                {/* Hover animation underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                    currentPage !== "health-tracker"
                      ? shouldUseRedBackground
                        ? "bg-white"
                        : "bg-[#ff3131]"
                      : "bg-transparent"
                  }`}
                />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rounded-full"
              >
                {hasProfilePicture ? ( // Kondisional untuk menampilkan gambar atau teks "pp"
                  <img
                    src={profileImgSrc || "/placeholder.svg"}
                    alt="Profile"
                    className={`w-10 h-10 rounded-full object-cover ${
                      shouldUseRedBackground ? "border-2 border-white" : "border-2 border-[#ff3131]"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden cursor-pointer transition-opacity text-2xl font-bold ${
                      shouldUseRedBackground
                        ? "text-white border-2 border-white"
                        : "text-gray-600 border-2 border-[#ff3131]"
                    }`}
                  >
                    {user?.username ? user.username.charAt(0) : "PP"} {/* Gunakan user.username */}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <style>{customStyles}</style>
                  <div className="absolute right-0 mt-2 min-w-64 max-w-80 w-max bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 profile-dropdown-enter">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        {hasProfilePicture ? ( // Kondisional yang sama di dalam dropdown
                          <img
                            src={profileImgSrc || "/placeholder.svg"}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden cursor-pointer text-2xl font-bold text-gray-600 flex-shrink-0">
                            {user?.username ? user.username.charAt(0) : "PP"} {/* Gunakan user.username */}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.username || "Pengguna"} {/* Gunakan user.username */}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleEditProfile}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 group border-l-4 ${
                          currentPage === "profile"
                            ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50"
                            : "text-gray-700 border-transparent hover:bg-red-50 hover:border-[#ff3131] hover:text-[#ff3131]"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          Edit Profile
                        </span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group border-l-4 border-transparent hover:border-red-500"
                      >
                        <svg
                          className="w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar