import { useState, useEffect } from "react"

const TypingEffectText = ({ text, speed = 70 }) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    setDisplayedText("") // Reset text on mount or text change

    if (text) {
      let i = 0
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prevText) => prevText + text[i])
          i++
        } else {
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval) // Cleanup on unmount
    }
  }, [text, speed])

  return <>{displayedText}</>
}

export default TypingEffectText