import { useEffect, useState } from "react"

export function Notification({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 2000) // Notifikasi akan hilang setelah 2 detik
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [message, onClose])

  if (!isVisible || !message) return null

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500"
  const textColor = "text-white"

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 ease-out ${bgColor} ${textColor}`}
      role="alert"
    >
      {message}
    </div>
  )
}