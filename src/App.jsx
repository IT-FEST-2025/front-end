// cek tampilan awal
import { BrowserRouter } from 'react-router-dom';
import ContentContainer from './components/content/content-container';

function App() {
  return (
    <BrowserRouter>
      <ContentContainer />
    </BrowserRouter>
  );
}

export default App;