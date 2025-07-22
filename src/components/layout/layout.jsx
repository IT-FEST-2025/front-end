// layout di form register, login, reset

import { useResponsiveBackground } from "../../hooks/responsive-background"

const Layout = ({ children, title }) => {
  const backgroundImage = useResponsiveBackground()

  return (
    <main
      className="h-screen w-full flex bg-white overflow-hidden"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Welcome Section */}
        <section className="w-full lg:w-1/2 h-[30vh] lg:h-full p-4 sm:p-6 lg:p-12 flex flex-col justify-center items-center lg:items-start text-white relative overflow-hidden">
          <div className="flex flex-col items-center relative z-10 cursor-pointer text-center w-full max-w-sm mx-auto lg:-translate-x-12 hover:scale-105 duration-300 transition-all">
            <img src="/logo.png" alt="Logo" className="w-20 md:w-40 lg:w-70 mb-2"/>
            <p className="text-[#ff3131] text-3xl md:text-4xl lg:text-7xl font-bold sm:mb-3">Diagnify</p>
          </div>
        </section>

        {/* Form Section */}
        <section className="w-full lg:w-1/2 h-[70vh] lg:h-full flex flex-col justify-center relative overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-12 flex flex-col justify-center h-full">
            <div className="w-full max-w-[85%] sm:max-w-[80%] lg:max-w-sm mx-auto">
              <header className="mb-4 sm:mb-6 lg:mb-8">
                <h2 className="cursor-default text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{title}</h2>
              </header>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Layout