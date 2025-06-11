import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Planet from './objects/planet.js';
import { createSolarSystem, setupLights, createStarfield } from './setup.js';
import { updateCameraControls, setupCameraControls } from './camera.js';
import { loadingManager } from './utils/LoadingManager.js';
import { UI } from './ui/UI.js';
import { planetData } from './planetData.js';
import { enableDrag, disableDrag } from './camera.js';
import NasaAPI from './services/nasaAPI.js';
import { StarField } from './effects/starField.js';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        // Get the existing canvas element by its ID
        const canvas = document.getElementById('solar-system');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.planets = new Map();
        this.lastUpdateTime = 0;
        this.simulationSpeed = 1;
        this.isPaused = false;
        this.selectedPlanet = null;
        this.nasaAPI = new NasaAPI();
        this.starfield = null; // Initialize starfield instance
        this.customOrbitalSpeedFactor = 1;
        this.accumulatedTime = 0;

        this.initRenderer();
        setupLights(this.scene);
        this.starfield = createStarfield(this.scene); // Store the starfield instance
        this.setupEventListeners();
    }

    initRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.renderer.setClearColor(0x000000, 1); // Revert to black background
    }

    async init() {
        this.planets = await createSolarSystem(this.scene, this.nasaAPI);
        console.log('Planets initialized:', this.planets);

        // Set initial camera position to view all planets
        this.camera.position.set(0, 70, 70);
        this.camera.lookAt(0, 0, 0);
        
        setupCameraControls(this.camera, this.renderer);
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', this.onPlanetClick.bind(this));
    }

    onPlanetClick(event) {
        event.preventDefault();

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(Array.from(this.planets.values()).map(p => p.mesh));

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const planetName = intersectedObject.userData.name;
            console.log(`Clicked on planet: ${planetName}`);

            this.focusPlanet(planetName);
            
            // Update UI with planet info
            const uiInstance = new UI(); // Assuming UI is a singleton or can be instantiated like this
            uiInstance.showPlanetInfo(planetName);
        } else {
            // If clicked outside planets, hide info card and re-enable controls
            const uiInstance = new UI();
            uiInstance.hidePlanetInfo(); // Assuming a hidePlanetInfo method
            enableDrag();
        }
    }

    focusPlanet(planetName) {
        this.selectedPlanet = this.planets.get(planetName.toLowerCase());
        if (this.selectedPlanet) {
            gsap.to(this.camera.position, {
                duration: 1.5,
                x: this.selectedPlanet.mesh.position.x,
                y: this.selectedPlanet.mesh.position.y,
                z: this.selectedPlanet.mesh.position.z + (this.selectedPlanet.data.radius * 5),
                onUpdate: () => {
                    this.camera.lookAt(this.selectedPlanet.mesh.position);
                },
                onComplete: () => {
                    disableDrag();
                }
            });
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setSimulationSpeed(speed) {
        console.log('Setting simulation speed to:', speed);
        this.simulationSpeed = speed;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    updateSceneLighting() {
        // Logic to update lights based on theme (if applicable)
    }

    setOrbitalSpeedMode(isRealSpeed, customSpeed) {
        this.customOrbitalSpeedFactor = customSpeed;
    }

    enableControls() {
        setupCameraControls(this.camera, this.renderer, true);
    }

    update() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        if (!this.isPaused) {
            // Accumulate time based on simulation speed
            this.accumulatedTime += deltaTime * this.simulationSpeed;

            this.planets.forEach(planet => {
                planet.update(
                    this.accumulatedTime * 1000, // Convert back to milliseconds for API
                    this.simulationSpeed,
                    false,
                    this.customOrbitalSpeedFactor,
                    this.planets
                );
            });

            if (this.starfield) {
                this.starfield.update(currentTime);
            }
        }
        updateCameraControls();
    }

    getRenderer() {
        return this.renderer;
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}

export default Scene; 