// import { config } from "../config"
import { useNavigate } from "react-router-dom"
import { useForm } from "../hooks/form"
import { validationRules } from "../utils/validasi"
import Layout from "./layout/layout"
import FormInput from "./ui/form-input"
import SubmitButton from "./ui/submit-button"

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate()

  const initialValues = {
    username: "",
    password: "",
  }

  const validation = {
    username: [validationRules.required, validationRules.minLength(1)],
    password: [validationRules.required, validationRules.minLength(1)],
  }

  const { formData, errors, isLoading, handleInputChange, handleSubmit } = useForm(initialValues, validation)

  const onSubmit = async (data) => {
    try {
      const response = await fetch("https://api.ayuwoki.my.id/users/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Login gagal")
      }

      localStorage.setItem("accessToken", result.data.accessToken)

      // Call the callback to update authentication state
      // Don't navigate manually, let App.jsx handle the routing change
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      alert("Gagal login: " + err.message)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(onSubmit)
  }

  const handleSignUpClick = () => {
    navigate("/register")
  }

  const handleForgotPasswordClick = () => {
    navigate("/reset")
  }

  return (
    <Layout title="Sign In" onBack={() => navigate("/")}>
      <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4" noValidate>
        <FormInput
          id="username"
          name="username"
          label="Username"
          placeholder="Masukkan username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          autoComplete="username"
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Kata Sandi"
          placeholder="Masukkan kata sandi"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="cursor-pointer text-white text-xs sm:text-sm hover:underline font-medium transition-colors"
          >
            Lupa Password?
          </button>
        </div>

        <div className="pt-1">
          <SubmitButton isLoading={isLoading} loadingText="Signing In...">
            Sign In
          </SubmitButton>
        </div>

        <div className="text-center py-1">
          <p className="cursor-default text-white text-xs sm:text-sm">
            {"Belum punya akun? "}
            <button
              type="button"
              onClick={handleSignUpClick}
              className="cursor-pointer text-white hover:underline font-medium transition-colors"
            >
              Sign up di sini
            </button>
          </p>
        </div>
      </form>
    </Layout>
  )
}

export default Login