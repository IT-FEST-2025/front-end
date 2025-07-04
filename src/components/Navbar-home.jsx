import { useState, useEffect } from "react"

const Navbar = ({ onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop <= 640)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`cursor-default fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#ff3131] backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isScrolled ? "text-white" : "text-[#ff3131]"
                }`}
              >
                Diagnify
              </h1>
            </div>
          </div>

          {/* Get Started Button */}
          <div className="flex items-center">
            <button
              onClick={onGetStarted}
              className={`cursor-pointer px-6 py-2 rounded-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                isScrolled
                  ? "bg-white text-[#ff3131] hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_#ffffff] focus:ring-white"
                  : "bg-[#ff3131] text-white hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_#b81414] focus:ring-red-500"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar