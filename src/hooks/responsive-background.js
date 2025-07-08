// untuk responsive background

import { useState, useEffect } from "react"

export const useResponsiveBackground = (basePath = "/assets/Register") => {
  const [backgroundImage, setBackgroundImage] = useState(`${basePath}.png`)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width < 640) {
        setBackgroundImage(`${basePath}-hp.png`)
      } else if (width < 1024) {
        setBackgroundImage(`${basePath}-hp.png`)
      } else {
        setBackgroundImage(`${basePath}.png`)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [basePath])

  return backgroundImage
}