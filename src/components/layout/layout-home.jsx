// layout untuk di tampilan home yang paling awas pas buka web

import { useResponsiveBackground } from "../../hooks/responsive-home"

const Layout = ({ children }) => {
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
      <div className="flex flex-col w-full min-h-screen">
        <section className="w-full flex-1 min-h-screen flex flex-col justify-center relative -translate-y-14">
          <div className="flex flex-col justify-center flex-1">
            <div className="w-full max-w-[90%] mx-auto">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Layout