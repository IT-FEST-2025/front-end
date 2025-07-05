// cek tampilan awal
import { BrowserRouter } from 'react-router-dom';
import AuthContainer from './components/auth-container';

function App() {
  return (
    <BrowserRouter>
      <AuthContainer />
    </BrowserRouter>
  );
}

export default App;