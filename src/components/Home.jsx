import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Home.scss';

const Home = () => {
  return (
    <div className="home">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero"
      >
        <h1>Welcome to Solar System Explorer</h1>
        <p>Explore our solar system in an interactive 3D environment</p>
        <Link to="/solar-system" className="cta-button">
          Start Exploring
        </Link>
      </motion.div>

      <div className="features">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="feature-card"
        >
          <h3>Interactive 3D Visualization</h3>
          <p>Explore planets and celestial bodies in real-time 3D</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="feature-card"
        >
          <h3>Real-time NASA Data</h3>
          <p>Get the latest information from NASA's API</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="feature-card"
        >
          <h3>Educational Content</h3>
          <p>Learn about our solar system through interactive features</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 