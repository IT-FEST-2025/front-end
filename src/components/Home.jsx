import Navbar from "./Navbar-home"
import Animated from "./ui/animasi"
import LayoutHome from "./layout/layout-home"

const Home = ({ onNavigateToRegister }) => {
  const handleGetStarted = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister()
    }
  }

  return (
    <div className="min-h-screen overflow-auto">
      <Navbar onGetStarted={handleGetStarted} />

      {/* Hero Section - Full Screen */}
      <main className="pt-16 cursor-default">
        <LayoutHome>
          <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                {/* Main Heading */}
                <Animated delay={200}>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-md mb-6 tracking-tight">
                    Diagnify
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-5xl mx-auto mb-6 leading-relaxed">
                    Asisten kesehatan pintar Anda yang didukung oleh AI. Mendiagnosis gejala, berkonsultasi secara instan, dan melacak kesehatan Anda dengan cepat.
                  </p>
                </Animated>

                {/* CTA Buttons */}
                <Animated delay={500}>
                  <div className="flex flex-col sm:flex-row justify-center items-center mt-4">
                    <button
                      onClick={handleGetStarted}
                      className="cursor-pointer bg-white hover:scale-110 text-[#ff3131] shadow-[0_0_40px_#ffffff] hover:shadow-[0_0_40px_#ffffff] duration-300 px-8 py-4 rounded-lg font-semibold text-lg transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Mulai Sekarang
                    </button>
                  </div>
                </Animated>
              </div>
            </div>
          </div>
        </LayoutHome>

        <div className="flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              {/* Quick Features Preview */}
              <Animated delay={400}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-24 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="w-18 h-18 bg-[#ff3131] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_#ff3131] hover:shadow-[0_0_70px_#ff3131] hover:scale-120 duration-300">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis Cepat</h3>
                  </div>

                  <div className="text-center">
                    <div className="w-18 h-18 bg-[#ff3131] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_#ff3131] hover:shadow-[0_0_70px_#ff3131] hover:scale-120 duration-300">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aman & Privasi</h3>
                  </div>

                  <div className="text-center">
                    <div className="w-18 h-18 bg-[#ff3131] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_#ff3131] hover:shadow-[0_0_70px_#ff3131] hover:scale-120 duration-300">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fleksibel</h3>
                  </div>
                </div>
              </Animated>
            </div>
          </div>
        </div>

        {/* Detailed Features Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Animated>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Utama Kami</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Jelajahi fitur kami yang dirancang untuk membantu Anda memantau dan memahami kesehatan Anda dengan lebih baik.
                </p>
              </div>
            </Animated>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
              {/* AI Symptom Checker */}
              <Animated delay={100} animation="translate-y-12 opacity-0 scale-95">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-[0_0_40px_#b81414] hover:scale-102 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-[#ff3131] shadow-[0_0_40px_#ff3131] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI Symptom Checker</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Advanced AI technology analyzes your symptoms and provides preliminary health assessments with high
                    accuracy and reliability.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Instant symptom analysis
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      95% accuracy rate
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Personalized recommendations
                    </li>
                  </ul>
                </div>
              </Animated>

              {/* Chatbot Konsultasi */}
              <Animated delay={200} animation="translate-y-12 opacity-0 scale-95">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-[0_0_40px_#b81414] hover:scale-102 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-[#ff3131] shadow-[0_0_40px_#ff3131] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chatbot Konsultasi</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Interactive AI chatbot provides 24/7 health consultation, answers medical questions, and guides you
                    through health concerns.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      24/7 availability
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Multilingual support
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Expert-backed responses
                    </li>
                  </ul>
                </div>
              </Animated>

              {/* Health Tracker */}
              <Animated delay={300} animation="translate-y-12 opacity-0 scale-95">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-[0_0_40px_#b81414] hover:scale-102 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-[#ff3131] shadow-[0_0_40px_#ff3131] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.12 2-2.5 2S4 20.105 4 19m5 0c0-1.105 1.12-2 2.5-2S15 17.895 15 19m-6-4v-4m0 4h.01M15 15v-4m0 4h.01M21 15v-4m0 4h.01M15 19v-2.5S17.5 14 17.5 12V9.5M4 19v-2.5S6.5 14 6.5 12V9.5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Health Tracker</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Comprehensive health monitoring system tracks vital signs, symptoms, medications, and provides
                    detailed health analytics.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Vital signs monitoring
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Progress analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Medication reminders
                    </li>
                  </ul>
                </div>
              </Animated>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#ff3131] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Diagnify
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home