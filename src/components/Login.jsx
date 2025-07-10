import { config } from "../config"
import { useNavigate } from "react-router-dom"
import { useForm } from "../hooks/form"
import { validationRules } from "../utils/validasi"
import Layout from "./layout/layout" // Perhatikan path
import FormInput from "./ui/form-input" // Perhatikan path
import SubmitButton from "./ui/submit-button" // Perhatikan path

// Menerima prop onLoginSuccess
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
      const response = await fetch(`${config.apiUserService}/api/login`, {
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

      localStorage.setItem("token", result.accessToken)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      // Navigasi ke root path ("/") yang akan ditangani oleh ContentContainer
      navigate("/beranda")
    } catch (err) {
      alert("Gagal login: " + err.message)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(onSubmit)
  }

  const handleSignUpClick = () => {
    navigate("/register") // Arahkan ke halaman register
  }

  const handleForgotPasswordClick = () => {
    navigate("/reset") // Arahkan ke halaman reset password
  }

  return (
    <Layout title="Sign In" onBack={() => navigate("/")}>
      {" "}
      {/* Atau sesuaikan onBack */}
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