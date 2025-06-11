import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.scss';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Solar System Explorer</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/solar-system" className="nav-link">Solar System</Link>
        <Link to="/nasa-test" className="nav-link">NASA API Test</Link>
      </div>
    </nav>
  );
};

export default Navbar; 