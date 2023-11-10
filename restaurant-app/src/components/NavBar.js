import './NavBar.css'; 

import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
      <Link to="/" className="logo-container">
        <img src="/Flogo.png" alt="Logo" />
      </Link>
      <ul>
        <li className="locations">
          <Link to="/">Home</Link>
        </li>
        {/* Add more links here */}
      </ul>
    </nav>
  );
}

export default NavBar;
