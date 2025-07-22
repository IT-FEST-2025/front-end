// form input register dan login

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const FormInput = ({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  // Menentukan apakah input adalah tipe 'password'
  const isPasswordType = type === "password"
  // Mengubah tipe input menjadi 'text' jika showPassword true dan input adalah tipe password
  const inputType = isPasswordType && showPassword ? "text" : type

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-white">
          {label}
        </label>
        {error && <span className="text-xs text-white font-semibold">{error}</span>}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType} // Menggunakan tipe input yang dinamis
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm sm:text-base ${error ? "border-red-500" : "border-gray-300"} ${isPasswordType ? "pr-10" : ""}`} // Menambahkan padding kanan jika ini input password
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black focus:outline-none transition-transform hover:scale-110" // Perubahan di sini
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default FormInput