// auth-container.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";

const AuthContainer = () => {
  const navigate = useNavigate(); // Dapatkan fungsi navigate dari React Router

  return (
    <Routes>
      <Route path="/" element={<Home onNavigateToRegister={() => navigate('/register')} />} />
      <Route path="/login" element={<Login
        onNavigateToRegister={() => navigate('/register')}
        onNavigateToReset={() => navigate('/reset')}
        onNavigateToHome={() => navigate('/')}
      />} />
      <Route path="/register" element={<Register
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToHome={() => navigate('/')}
      />} />
      <Route path="/reset" element={<Reset onNavigateToLogin={() => navigate('/login')} />} />
      {/* Opsional: tambahkan Route untuk 404 Not Found */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AuthContainer;