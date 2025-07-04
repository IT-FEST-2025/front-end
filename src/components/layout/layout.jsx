// layout di form register, login, reset

import { useResponsiveBackground } from "../../hooks/responsive-background"
import BackButton from "../ui/back-button"

const Layout = ({
  children,
  title,
  onBack,
}) => {
  const backgroundImage = useResponsiveBackground()

  return (
    <main
      className="min-h-screen w-full flex bg-white overflow-hidden"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* Welcome Section */}
        <section className="w-full lg:w-1/2 h-auto min-h-[33vh] lg:min-h-screen p-4 sm:p-6 lg:p-12 flex flex-col justify-center items-center lg:items-start text-white relative overflow-hidden">
          <div className="flex flex-col items-center relative z-10 text-center w-full max-w-sm mx-auto lg:-translate-x-12">
            <h1 className="cursor-default text-3xl sm:text-3xl lg:text-4xl text-[#ff3131] font-bold mb-3 sm:mb-4">Diagnify</h1>
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" />
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="w-full lg:w-1/2 flex-1 lg:min-h-screen flex flex-col justify-center relative">
          {/* Back button di pojok atas layout */}
          {onBack && (
            <div className="absolute top-4 z-10 xl:-translate-x-150 lg:translate-y-0 lg:-translate-x-130 -translate-y-55 translate-x-10 duration-300">
              <BackButton onClick={onBack} />
            </div>
          )}

          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 flex flex-col justify-center flex-1">
            <div className="w-full max-w-[85%] sm:max-w-[80%] lg:max-w-sm mx-auto">
              <header className="mb-6 sm:mb-7 lg:mb-8">
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