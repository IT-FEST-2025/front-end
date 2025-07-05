// src/components/Auth-container.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';

// Pastikan path impor ini benar berdasarkan struktur folder Anda
import HomeAuth from "./Home";         // Ini adalah Home untuk AuthContainer (landing page)
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";

const AuthContainer = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Route untuk halaman Home/Landing Page di AuthContainer */}
      {/* Path ini harus spesifik. Jika ini adalah landing page default, biarkan "/" */}
      <Route
        path="/"
        element={<HomeAuth onNavigateToRegister={() => navigate('/register')} />}
      />

      {/* Route untuk halaman Login */}
      <Route
        path="/login"
        element={
          <Login
            onLoginSuccess={() => {
              onLoginSuccess();
              navigate('/'); // Arahkan ke root setelah login berhasil (root ContentContainer)
            }}
          />
        }
      />

      {/* Route untuk halaman Register */}
      <Route
        path="/register"
        element={<Register onNavigateToLogin={() => navigate('/login')} />} // Perbaiki prop
      />

      {/* Route untuk halaman Reset Password */}
      <Route
        path="/reset"
        element={<Reset onNavigateToLogin={() => navigate('/login')} />}
      />

      {/* Opsional: rute catch-all jika ada path yang tidak cocok di dalam AuthContainer */}
      {/* Ini akan menangkap path yang dimulai dengan root, tapi bukan /login, /register, dll. */}
      {/* Jika Anda ingin AuthContainer hanya muncul untuk rute otentikasi, Anda bisa menghapus ini */}
      {/* Atau arahkan ke /login sebagai default jika tidak ada rute yang cocok */}
      <Route path="*" element={<HomeAuth onNavigateToRegister={() => navigate('/register')} />} />
    </Routes>
  );
};

export default AuthContainer;