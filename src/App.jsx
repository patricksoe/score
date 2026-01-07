import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Create from './pages/Create';
import Tournament from './pages/Tournament';

function App() {
  return (
    <>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/tournament/:id" element={<Tournament />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
