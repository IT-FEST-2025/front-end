// tombol sign up dan sign in

import LoadingSpinner from "./loading"

const SubmitButton = ({ isLoading, loadingText, children, ...props }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="cursor-pointer w-full bg-white text-[#ff3131] py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:scale-105 hover:shadow-[0_0_40px_#ffffff] focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default SubmitButton
