import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../styles/SolarSystem.scss';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY;
const PLANET_DATA = {
  mercury: { radius: 0.4, distance: 5, speed: 4.1, texture: '/textures/mercury.jpg' },
  venus: { radius: 0.9, distance: 7, speed: 1.6, texture: '/textures/venus.jpg' },
  earth: { radius: 1, distance: 10, speed: 1, texture: '/textures/earth.jpg' },
  mars: { radius: 0.5, distance: 13, speed: 0.5, texture: '/textures/mars.jpg' },
  jupiter: { radius: 2.5, distance: 18, speed: 0.08, texture: '/textures/jupiter.jpg' },
  saturn: { radius: 2.2, distance: 23, speed: 0.03, texture: '/textures/saturn.jpg' },
  uranus: { radius: 1.8, distance: 28, speed: 0.01, texture: '/textures/uranus.jpg' },
  neptune: { radius: 1.7, distance: 32, speed: 0.006, texture: '/textures/neptune.jpg' }
};

const SolarSystem = () => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [nasaData, setNasaData] = useState(null);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Create sun
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create planets
    const planets = {};
    const textureLoader = new THREE.TextureLoader();

    Object.entries(PLANET_DATA).forEach(([name, data]) => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(data.texture),
        roughness: 0.8,
        metalness: 0.2
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = data.distance;
      scene.add(planet);
      planets[name] = { mesh: planet, data };
    });

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Position camera
    camera.position.z = 50;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate planets
      Object.values(planets).forEach(({ mesh, data }) => {
        mesh.rotation.y += 0.01 * speed;
        mesh.position.x = Math.cos(Date.now() * 0.001 * data.speed * speed) * data.distance;
        mesh.position.z = Math.sin(Date.now() * 0.001 * data.speed * speed) * data.distance;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Fetch NASA data
    const fetchNasaData = async () => {
      try {
        const response = await axios.get(
          `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );
        setNasaData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NASA data:', error);
        setLoading(false);
      }
    };

    fetchNasaData();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [speed]);

  return (
    <div className="solar-system">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading solar system...</p>
        </div>
      )}

      <div className="controls">
        <div className="speed-control">
          <label>Simulation Speed</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {nasaData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nasa-info"
        >
          <h3>NASA Astronomy Picture of the Day</h3>
          <h4>{nasaData.title}</h4>
          <p>{nasaData.explanation}</p>
        </motion.div>
      )}

      <div ref={mountRef} className="canvas-container" />
    </div>
  );
};

export default SolarSystem; 