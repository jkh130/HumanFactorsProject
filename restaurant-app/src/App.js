import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restinfo from './pages/Restinfo';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info/:restaurantName" element={<Restinfo />} /> 
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
