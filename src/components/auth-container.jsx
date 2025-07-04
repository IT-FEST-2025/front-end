import { useNavigation } from "../hooks/navigation"
import Home from "./Home"
import Login from "./Login"
import Register from "./Register"
import Reset from "./Reset"

const AuthContainer = () => {
  const { currentPage, goToHome, goToLogin, goToRegister, goToReset } = useNavigation("home")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigateToRegister={goToRegister} />
      case "login":
        return <Login onNavigateToRegister={goToRegister} onNavigateToReset={goToReset} onNavigateToHome={goToHome} />
      case "register":
        return <Register onNavigateToLogin={goToLogin} onNavigateToHome={goToHome} />
      case "reset":
        return <Reset onNavigateToLogin={goToLogin} />
      default:
        return <Home onNavigateToRegister={goToRegister} />
    }
  }

  return renderCurrentPage()
}

export default AuthContainer
