import AuthLayout from "./layout/layout"

const Reset = () => {
  return (
    <AuthLayout
      title="Reset Password"
      welcomeText="Enter your email address and we'll send you a link to reset your password."
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="sixDigit" className="block text-sm font-medium text-white mb-1">
            Masukkan kode yang didapatkan di email
          </label>
          <input
            id="sixDigit"
            name="sixDigit"
            type="text"
            inputMode="numeric"
            pattern="\d{1,6}"
            placeholder="Masukkan kode 6 digit"
            onInput={(e) => {
              // Hapus karakter non-digit dan batasi jadi maksimal 6 digit
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            }}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-[#ff3131] py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-[#ff3131] hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
        >
          Send Reset Link
        </button>
      </div>
    </AuthLayout>
  )
}

export default Reset