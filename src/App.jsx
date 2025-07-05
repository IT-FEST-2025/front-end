// cek tampilan awal
import AuthContainer from "../src/components/auth-container"

function App() {
  return <AuthContainer />
}

export default App

// cek tampilan setelah login
// import ContentContainer from "./components/content/content-container"

// function App() {
//   return <ContentContainer />
// }

// export default App


// dipake kalo udah sambungin ke db

// import { useState, useEffect } from "react"
// import AuthContainer from "./components/auth-container"
// import ContentContainer from "../src/components/content/content-container"

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     setIsAuthenticated(!!token) // Set to true if token exists
//   }, [])

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const token = localStorage.getItem("token")
//       setIsAuthenticated(!!token)
//     }

//     window.addEventListener("storage", handleStorageChange)
//     return () => window.removeEventListener("storage", handleStorageChange)
//   }, [])

//   return isAuthenticated ? <ContentContainer /> : <AuthContainer />
// }

// export default App