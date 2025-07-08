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
          <div className="flex flex-col items-center relative z-10 text-center w-full max-w-sm mx-auto lg:-translate-x-12">
            <h1 className="cursor-default text-2xl sm:text-3xl lg:text-4xl text-[#ff3131] font-bold mb-2 sm:mb-3">
              Diagnify
            </h1>
            <div className="mb-2 sm:mb-4 lg:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3" />
            </div>
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