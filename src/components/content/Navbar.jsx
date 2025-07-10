// navbar di tampilan setelah login
import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

const Navbar = ({ user, onNavigate, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // For profile dropdown
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false) // For mobile navigation dropdown
  const dropdownRef = useRef(null)
  const mobileNavRef = useRef(null) // Ref for mobile navigation dropdown

  const getCurrentPage = () => {
    switch (location.pathname) {
      case "/":
      case "/beranda":
        return "home";
      case "/symptom":
        return "symptom";
      case "/chatbot":
        return "chatbot";
      case "/health-tracker":
        return "health-tracker";
      case "/profile":
        return "profile";
      default:
        return "home";
    }
  };

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

  // Get the profile image URL using the utility function
  const profileImgSrc = user?.profilePicture || "/default-avatar.jpg"

  return (
    <>
      <style>{customStyles}</style> {/* Ensure custom styles are applied */}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              {/* Mobile Navigation Dropdown */}
              {isMobileNavOpen && (
                <div className="md:hidden absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-60 mobile-dropdown-enter">
                  <button onClick={(e) => handleNavClick("home", e)} className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${ currentPage === "home" ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50" : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]" }`} >
                    <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block"> Beranda </span>
                  </button>
                  <button onClick={(e) => handleNavClick("symptom", e)} className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${ currentPage === "symptom" ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50" : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]" }`} >
                    <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block"> AI Symptom </span>
                  </button>
                  <button onClick={(e) => handleNavClick("chatbot", e)} className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${ currentPage === "chatbot" ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50" : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]" }`} >
                    <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block"> Chatbot </span>
                  </button>
                  <button onClick={(e) => handleNavClick("health-tracker", e)} className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-4 group ${ currentPage === "health-tracker" ? "font-bold text-[#ff3131] border-[#ff3131] bg-red-50" : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-[#ff3131] hover:text-[#ff3131]" }`} >
                    <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block"> Health Tracker </span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a
                href="/beranda"
                onClick={(e) => handleNavClick("home", e)}
                className={`text-base font-medium transition-colors duration-300 relative group ${
                  currentPage === "home"
                    ? shouldUseRedBackground
                      ? "text-white"
                      : "text-[#ff3131]"
                    : shouldUseRedBackground
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-600 hover:text-[#ff3131]"
                }`}
              >
                Beranda
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-current transform origin-bottom-right transition-transform duration-300 ease-out ${
                    currentPage === "home" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </a>
              <a
                href="/symptom"
                onClick={(e) => handleNavClick("symptom", e)}
                className={`text-base font-medium transition-colors duration-300 relative group ${
                  currentPage === "symptom"
                    ? shouldUseRedBackground
                      ? "text-white"
                      : "text-[#ff3131]"
                    : shouldUseRedBackground
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-600 hover:text-[#ff3131]"
                }`}
              >
                Diagnosa Gejala
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-current transform origin-bottom-right transition-transform duration-300 ease-out ${
                    currentPage === "symptom" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </a>
              <a
                href="/chatbot"
                onClick={(e) => handleNavClick("chatbot", e)}
                className={`text-base font-medium transition-colors duration-300 relative group ${
                  currentPage === "chatbot"
                    ? shouldUseRedBackground
                      ? "text-white"
                      : "text-[#ff3131]"
                    : shouldUseRedBackground
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-600 hover:text-[#ff3131]"
                }`}
              >
                Chatbot AI
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-current transform origin-bottom-right transition-transform duration-300 ease-out ${
                    currentPage === "chatbot" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </a>
              <a
                href="/health-tracker"
                onClick={(e) => handleNavClick("health-tracker", e)}
                className={`text-base font-medium transition-colors duration-300 relative group ${
                  currentPage === "health-tracker"
                    ? shouldUseRedBackground
                      ? "text-white"
                      : "text-[#ff3131]"
                    : shouldUseRedBackground
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-600 hover:text-[#ff3131]"
                }`}
              >
                Health Tracker
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-current transform origin-bottom-right transition-transform duration-300 ease-out ${
                    currentPage === "health-tracker"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </a>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#ff3131] transition-all duration-300 flex-shrink-0">
                  <img
                    src={profileImgSrc}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {user && (
                  <span
                    className={`ml-3 text-base font-medium hidden md:block ${
                      shouldUseRedBackground ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {user.username || user.fullName || "Pengguna"}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  } ${shouldUseRedBackground ? "text-white" : "text-gray-700"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <style>{customStyles}</style>
                  <div className="absolute right-0 mt-3 w-56 rounded-lg shadow-xl bg-white border border-gray-200 py-2 profile-dropdown-enter">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.fullName || "Nama Pengguna"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || "email@example.com"}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 group border-l-4 border-transparent hover:border-[#ff3131]"
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;