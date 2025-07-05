import { config } from "../config"
import { useForm } from "../hooks/form"
import { validationRules } from "../utils/validasi"
import Layout from "./layout/layout"
import FormInput from "./ui/form-input"
import SubmitButton from "./ui/submit-button"

const Login = ({ onNavigateToRegister, onNavigateToReset, onNavigate }) => {
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login gagal");
    }

    // Simpan token JWT ke localStorage
    localStorage.setItem("token", result.token);

    alert("Login berhasil!");

    if (typeof onNavigate === "function") {
      onNavigate("home")
    }

  } catch (err) {
    alert("Gagal login: " + err.message); 
  }
};

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    await handleSubmit(onSubmit)
  }

  const handleSignUpClick = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister()
    } else {
      console.log("Navigate to Register")
    }
  }

  const handleForgotPasswordClick = () => {
    if (onNavigateToReset) {
      onNavigateToReset()
    } else {
      console.log("Navigate to Forgot Password")
    }
  }

  return (
    <Layout title="Sign In" onBack={onNavigateToRegister}>
      <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5" noValidate>
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

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="cursor-pointer text-white text-xs sm:text-sm hover:underline font-medium transition-colors"
          >
            Lupa Password?
          </button>
        </div>

        <div className="pt-2">
          <SubmitButton isLoading={isLoading} loadingText="Signing In...">
            Sign In
          </SubmitButton>
        </div>

        {/* Sign Up Link */}
        <div className="text-center py-2">
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