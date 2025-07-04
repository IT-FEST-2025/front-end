// form input register dan login

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
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-white">
          {label}
        </label>
        {error && <span className="text-xs text-white font-semibold">{error}</span>}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm sm:text-base ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
  )
}

export default FormInput