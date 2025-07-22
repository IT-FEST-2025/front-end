import { config } from "../config"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "./layout/layout"
import FormInput from "./ui/form-input"
import SubmitButton from "./ui/submit-button"

const Reset = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [tempToken, setTempToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${config.apiUserService}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim kode reset")
      }

      setEmail(result.data.email) // Store email from response
      setStep(2) // Move to code verification step
      alert("Kode reset telah dikirim ke email Anda.")
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengirim kode reset.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${config.apiUserService}/api/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Kode tidak valid atau kedaluwarsa")
      }

      setTempToken(result.data.tempToken) // Store tempToken
      setStep(3) // Move to password update step
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memverifikasi kode.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Kata sandi tidak cocok.")
      return
    }

    if (newPassword.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${config.apiUserService}/api/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken, newPassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui kata sandi")
      }

      alert("Kata sandi berhasil diperbarui. Silakan login.")
      navigate("/login") // Redirect to login page
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memperbarui kata sandi.")
    } finally {
      setIsLoading(false)
    }
  }

  const getWelcomeText = () => {
    switch (step) {
      case 1:
        return "Masukkan nama pengguna Anda untuk menerima kode reset melalui email."
      case 2:
        return "Masukkan email dan kode 6 digit yang Anda terima."
      case 3:
        return "Masukkan kata sandi baru Anda."
      default:
        return ""
    }
  }

  return (
    <Layout title="Reset Kata Sandi" welcomeText={getWelcomeText()} onBack={() => navigate("/")}>
      <div className="space-y-3 sm:space-y-4">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center font-medium"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleUsernameSubmit} noValidate className="space-y-3 sm:space-y-4">
            <FormInput
              id="username"
              name="username"
              label="Username"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <SubmitButton isLoading={isLoading} loadingText="Mengirim...">
                Kirim Kode Reset
              </SubmitButton>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} noValidate className="space-y-3 sm:space-y-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Alamat E-mail"
              placeholder="Masukkan alamat e-mail Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              id="sixDigit"
              name="sixDigit"
              type="text"
              inputMode="numeric"
              pattern="\d{1,6}"
              label="Kode Verifikasi"
              placeholder="Masukkan kode 6 digit"
              value={resetCode}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setResetCode(e.target.value)
              }}
              required
            />
            <div className="pt-1">
              <SubmitButton isLoading={isLoading} loadingText="Memverifikasi...">
                Verifikasi Kode
              </SubmitButton>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-3 sm:space-y-4">
            <FormInput
              id="newPassword"
              name="newPassword"
              type="password"
              label="Kata Sandi Baru"
              placeholder="Masukkan kata sandi baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Konfirmasi Kata Sandi"
              placeholder="Konfirmasi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="pt-1">
              <SubmitButton isLoading={isLoading} loadingText="Memperbarui...">
                Perbarui Kata Sandi
              </SubmitButton>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default Reset