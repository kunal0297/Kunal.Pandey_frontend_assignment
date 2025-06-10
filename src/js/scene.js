import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Planet } from './objects/planet';
import { planetData } from './planetData';
import { StarField } from './effects/starField';
import { UI } from './ui/UI';
import { dataFetcher } from './services/DataFetcher';
import { loadingManager } from './utils/LoadingManager';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.planets = new Map();
        this.clock = new THREE.Clock();
        this.ui = new UI();
        
        this.init();
    }

    async init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 50;

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;

        // Add lighting
        this.setupLighting();

        // Add star field
        const starField = new StarField();
        this.scene.add(starField.getMesh());

        // Create planets
        await this.createPlanets();

        // Setup event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Sun light
        const sunLight = new THREE.PointLight(0xffffff, 2, 300);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Add subtle blue ambient light for space atmosphere
        const spaceLight = new THREE.AmbientLight(0x0000ff, 0.1);
        this.scene.add(spaceLight);
    }

    async createPlanets() {
        for (const data of planetData) {
            const planet = new Planet(data);
            await planet.init();
            
            this.planets.set(data.name, planet);
            this.scene.add(planet.getMesh());
            
            if (planet.getOrbit()) {
                this.scene.add(planet.getOrbit());
            }
        }
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Handle planet clicks
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const intersects = raycaster.intersectObjects(
                Array.from(this.planets.values()).map(planet => planet.getMesh())
            );

            if (intersects.length > 0) {
                const planet = intersects[0].object;
                this.focusOnPlanet(planet);
                this.ui.showPlanetInfo(planet.userData);
            }
        });
    }

    focusOnPlanet(planet) {
        const distance = planet.userData.distance * 2;
        const duration = 1000; // ms
        const startPosition = this.camera.position.clone();
        const endPosition = new THREE.Vector3(
            planet.position.x + distance,
            planet.position.y + distance * 0.5,
            planet.position.z + distance
        );

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease in-out function
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.camera.position.lerpVectors(startPosition, endPosition, easeProgress);
            this.controls.target.copy(planet.position);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    async update() {
        const deltaTime = this.clock.getDelta();

        // Update planet positions and rotations
        for (const planet of this.planets.values()) {
            await planet.updatePosition();
            planet.update(deltaTime);
        }

        // Update controls
        this.controls.update();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
} 