// ada animasi pas ngescroll

import { useScrollAnimation } from "../../hooks/scroll-animation"

const Animated = ({
  children,
  className = "",
  delay = 0,
  duration = "duration-700",
  animation = "translate-y-8 opacity-0",
}) => {
  const [ref, isVisible] = useScrollAnimation(0.1)

  return (
    <div
      ref={ref}
      className={`transition-all ${duration} ease-out ${
        isVisible ? "translate-y-0 opacity-100" : animation
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default Animated