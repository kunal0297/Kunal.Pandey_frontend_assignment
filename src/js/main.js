import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GUI } from 'dat.gui';
import { gsap } from 'gsap';
import NasaAPI from './services/nasaAPI.js';
import { dataFetcher } from './services/DataFetcher.js';
import { setupLights, createSolarSystem, createStarfield } from './setup.js';
import { enableDrag, disableDrag, setupCameraControls } from './camera.js';
import { loadingManager } from './utils/LoadingManager.js';
import { planetData } from './planetData.js';
import Planet from './objects/planet.js';
import { createOrbit } from './objects/orbit.js';
import { UI } from './ui/UI.js';
import { Scene } from './scene.js';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ui.scss';

class App {
    constructor() {
        this.init();
    }

    async init() {
        // Initialize NASA API
        const nasaApiInstance = new NasaAPI();
        // You can use nasaApiInstance to call methods like fetchApod or fetchEpicDates if needed later.

        // Initialize Scene (which contains Three.js scene, camera, renderer)
        this.solarSystemScene = new Scene();
        await this.solarSystemScene.init(); // Wait for the scene to initialize planets
        
        // Initialize UI, passing the scene instance
        this.ui = new UI(this.solarSystemScene);
        this.ui.setPlanets(this.solarSystemScene.planets); // Pass the initialized planets to the UI

        // Setup event listeners for UI controls (delegating to scene)
        this.setupEventListeners();

        // Start animation loop
        this.animate();
    }

    setupEventListeners() {
        // Window resize - handled by Scene class
        window.addEventListener('resize', () => {
            this.solarSystemScene.onWindowResize();
        });

        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                this.solarSystemScene.setSimulationSpeed(speed);
            });
        }

        // Pause toggle
        const pauseToggle = document.getElementById('pause-toggle');
        if (pauseToggle) {
            pauseToggle.addEventListener('click', () => {
                const isPaused = this.solarSystemScene.togglePause();
                this.ui.updatePauseButton(isPaused);
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const icon = themeToggle.querySelector('i');
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
                this.solarSystemScene.updateSceneLighting();
            });
        }

        // Planet click events - handled by Scene class
        this.solarSystemScene.renderer.domElement.addEventListener('click', (event) => {
            this.solarSystemScene.onPlanetClick(event);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.solarSystemScene.update();
        this.solarSystemScene.renderer.render(this.solarSystemScene.scene, this.solarSystemScene.camera);
    }
}

// Start the application
new App(); 