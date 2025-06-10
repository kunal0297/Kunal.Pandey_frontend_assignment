import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { planetData } from './planetData';
import { StarField } from './effects/starField';
import { Planet } from './objects/planet';
import { createOrbit } from './objects/orbit';
import { UI } from './ui/UI';
import { Scene } from './scene';
import { nasaAPI } from './services/nasaAPI';

class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#solar-system'),
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.clock = new THREE.Clock();
        this.isPaused = false;
        this.simulationSpeed = 1;

        this.init();
    }

    async init() {
        try {
            // Initialize data fetcher
            // await nasaAPI.init(); // Removed as nasaAPI object does not have an init method

            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            
            // Setup camera
            this.camera.position.set(0, 30, 50);
            this.camera.lookAt(0, 0, 0);
            
            // Create star field
            this.starField = new StarField();
            this.scene.add(this.starField.getMesh());
            
            // Initialize UI
            this.ui = new UI(this);

            this.setupLights();
            await this.createPlanets();
            this.setupControls();
            this.setupEventListeners();
            this.animate();
        } catch (error) {
            console.error('Error initializing SolarSystem:', error);
        }
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        // Sun light
        const sunLight = new THREE.PointLight(0xffffff, 2);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);

        // Add subtle rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
        rimLight.position.set(50, 50, 50);
        this.scene.add(rimLight);
    }

    async createPlanets() {
        this.planets = new Map();
        this.orbits = new Map();

        // Create Sun
        const sun = new Planet({
            name: 'Sun',
            radius: 5,
            texture: '/textures/sun.jpg',
            emissive: true
        });
        await sun.init(); // Await initialization
        this.scene.add(sun.getMesh());
        this.planets.set('sun', sun);

        // Create planets
        for (const data of planetData) {
            const planet = new Planet(data);
            await planet.init(); // Await initialization
            
            // Create orbit only if distance is defined and valid
            let orbit = null;
            if (data.distance !== undefined && typeof data.distance === 'number' && !isNaN(data.distance)) {
                orbit = createOrbit(data.distance);
            }

            // Only add planet mesh to scene if it exists
            if (planet.getMesh()) {
                this.scene.add(planet.getMesh());
                // Enable shadows for planets if mesh exists
                if (planet.mesh) {
                    planet.mesh.castShadow = true;
                    planet.mesh.receiveShadow = true;
                }
            }
            
            // Only add orbit to scene if it exists
            if (orbit) {
                this.scene.add(orbit);
            }
            
            this.planets.set(data.name.toLowerCase(), planet);
            // Only store orbit if it's a valid object
            if (orbit) {
                this.orbits.set(data.name.toLowerCase(), orbit);
            }
        }
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Planet click events
        this.renderer.domElement.addEventListener('click', this.onPlanetClick.bind(this));
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            this.updateSceneLighting();
        });
        
        // Pause toggle
        document.getElementById('pause-toggle').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.ui.updatePauseButton(this.isPaused);
            this.controls.autoRotate = !this.isPaused;
        });
        
        // Speed control
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.simulationSpeed = parseFloat(e.target.value);
            console.log(`Simulation Speed updated to: ${this.simulationSpeed}`);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onPlanetClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(Array.from(this.planets.values()).map(p => p.getMesh()));
        
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            const planetName = planet.userData.name;
            this.focusPlanet(planetName);
        }
    }

    focusPlanet(planetName) {
        const planet = this.planets.get(planetName.toLowerCase());
        if (!planet) return;

        // Highlight orbit
        const orbit = this.orbits.get(planetName.toLowerCase());
        if (orbit) {
            gsap.to(orbit.material.color, {
                r: 1,
                g: 1,
                b: 1,
                duration: 0.5
            });
        }

        // Animate camera
        const targetPosition = new THREE.Vector3();
        planet.getMesh().getWorldPosition(targetPosition);
        targetPosition.multiplyScalar(1.5);

        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(planet.getMesh().position);
            }
        });

        // Show info card
        this.ui.showPlanetInfo(planetName);
    }

    updateSceneLighting() {
        const isDark = document.body.dataset.theme === 'dark';
        const intensity = isDark ? 0.3 : 0.5;
        
        // Update ambient light
        this.scene.children.forEach(child => {
            if (child.isAmbientLight) {
                child.intensity = intensity;
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (!this.isPaused) {
            const deltaTime = this.clock.getDelta();
            
            // Update controls
            this.controls.update();

            // Update planets
            this.planets.forEach((planet, name) => {
                planet.update(deltaTime, this.simulationSpeed);
                if (name !== 'sun') {
                    const orbit = this.orbits.get(name);
                    if (orbit) {
                        // Update orbit line
                        // orbit.geometry.setFromPoints(planet.getMesh().position.toArray()); // This might not be needed for static orbits
                    }
                }
            });

            // Update Sun glow effect
            const sun = this.planets.get('sun');
            if (sun && sun.getMesh().children.length > 0) {
                sun.getMesh().children.forEach(child => {
                    if (child.material.uniforms && child.material.uniforms.viewVector) {
                        child.material.uniforms.viewVector.value.subVectors(
                            this.camera.position,
                            sun.getMesh().position
                        );
                    }
                });
            }
            
            // Update star field
            this.starField.update(this.clock.getElapsedTime());
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
}); 