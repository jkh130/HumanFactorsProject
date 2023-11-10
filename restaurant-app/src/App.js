// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restinfo from './pages/Restinfo';
import NavBar from './components/NavBar'; // Import NavBar

function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar /> {/* Include NavBar here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info/:restaurantName" element={<Restinfo />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
