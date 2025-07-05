// cek tampilan awal
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthContainer from './components/auth-container';
import ContentContainer from './components/content/content-container';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/beranda" element={<ContentContainer onLogout={handleLogout} />} />
            <Route path="/symptom" element={<ContentContainer onLogout={handleLogout} />} />
            <Route path="/chatbot" element={<ContentContainer onLogout={handleLogout} />} />
            <Route path="/health-tracker" element={<ContentContainer onLogout={handleLogout} />} />
            <Route path="/profile" element={<ContentContainer onLogout={handleLogout} />} />
            {/* Redirect any unmatched routes to /beranda for authenticated users */}
            <Route path="*" element={<Navigate to="/beranda" replace />} />
          </>
        ) : (
          <>
            <Route path="/*" element={<AuthContainer onLoginSuccess={() => setIsAuthenticated(true)} />} />
            {/* Redirect protected routes to root for unauthenticated users */}
            <Route path="/beranda" element={<Navigate to="/" replace />} />
            <Route path="/symptom" element={<Navigate to="/" replace />} />
            <Route path="/chatbot" element={<Navigate to="/" replace />} />
            <Route path="/health-tracker" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;