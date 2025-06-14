import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SolarSystem from './components/SolarSystem';
import NasaApiTest from './components/NasaApiTest';
import './styles/App.scss';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solar-system" element={<SolarSystem />} />
            <Route path="/nasa-test" element={<NasaApiTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 