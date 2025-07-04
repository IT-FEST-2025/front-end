const BackButton = ({ onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer absolute top-4 left-4 z-20 p-2 rounded-full bg-[#ff3131] hover:scale-120 duration-300 transition-transform hover:shadow-[0_0_40px_#b81414] ${className}`}
      aria-label="Go back"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

export default BackButton