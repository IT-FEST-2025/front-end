import { config } from "../config"
import { useForm } from "../hooks/form"
import { validationRules } from "../utils/validasi"
import Layout from "./layout/layout"
import FormInput from "./ui/form-input"
import SubmitButton from "./ui/submit-button"
import { useNotification } from "../hooks/notification"
import { Notification } from "./ui/notification"

// Add onNavigateToHome prop to the component
const Register = ({ onNavigateToLogin, onNavigateToHome }) => {
  const initialValues = {
    email: "",
    password: "",
    username: "",
    fullName: "",
  }

  const validation = {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.minLength(1)],
    username: [validationRules.required, validationRules.minLength(1)],
    fullName: [validationRules.required, validationRules.minLength(1)],
  }

  const { formData, errors, isLoading, handleInputChange, handleSubmit } = useForm(initialValues, validation)
  const { notificationMessage, notificationType, showNotification, clearNotification } = useNotification()

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${config.apiUserService}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Registrasi gagal")
      }

      // if (onNavigateToLogin) onNavigateToLogin() // Hapus ini
      if (onNavigateToLogin) {
        // Tambahkan ini
        onNavigateToLogin({ message: "Registrasi berhasil! Silakan login.", type: "success" })
      } else {
        console.log("Navigate to Login with success message")
      }
    } catch (err) {
      // alert("Gagal registrasi: " + err.message)
      showNotification("Gagal registrasi: " + err.message, "error")
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(onSubmit)
  }

  const handleSignInClick = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin()
    } else {
      console.log("Navigate to Login")
    }
  }

  return (
    <Layout title="Registrasi" onBack={onNavigateToHome}>
      <Notification message={notificationMessage} type={notificationType} onClose={clearNotification} />
      <form onSubmit={handleFormSubmit} className="space-y-2 sm:space-y-3" noValidate>
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Alamat E-mail"
          placeholder="Masukkan alamat e-mail"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          autoComplete="email"
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
          autoComplete="new-password"
          required
        />

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
          id="fullName"
          name="fullName"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={formData.fullName}
          onChange={handleInputChange}
          error={errors.fullName}
          autoComplete="name"
          required
        />

        {/* Sign In Link */}
        <div className="text-center py-1">
          <p className="cursor-default text-white text-xs sm:text-sm">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={handleSignInClick}
              className="cursor-pointer text-white font-medium hover:underline transition-colors"
            >
              Login di sini
            </button>
          </p>
        </div>

        <div className="pt-1">
          <SubmitButton isLoading={isLoading} loadingText="Creating Account...">
            Sign Up
          </SubmitButton>
        </div>
      </form>
    </Layout>
  )
}

export default Register