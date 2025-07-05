// cek tampilan awal
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthContainer from './components/auth-container';
import ContentContainer from './components/content/content-container';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <Route path="/*" element={<ContentContainer />} />
        ) : (
          <Route path="/*" element={<AuthContainer onLoginSuccess={() => setIsAuthenticated(true)} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;