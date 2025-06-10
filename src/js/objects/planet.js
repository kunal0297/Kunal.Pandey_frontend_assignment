import * as THREE from 'three';
import { nasaAPI } from '../services/nasaAPI';
import { loadingManager } from '../utils/LoadingManager';

export class Planet {
    constructor(data) {
        this.data = data;
        this.mesh = null;
        this.clouds = null;
        this.atmosphere = null;
        this.rings = null;
        this.orbit = null;
        this.isEarth = data.name === 'Earth';
        this.isVenus = data.name === 'Venus';
        this.isSaturn = data.name === 'Saturn';
        
        this.init();
    }

    async init() {
        try {
            console.log(`Initializing planet: ${this.data.name} with radius: ${this.data.radius}`);
            const geometry = new THREE.SphereGeometry(this.data.radius, 64, 64);
            const textureLoader = new THREE.TextureLoader(loadingManager);
            
            // Load textures
            const texture = await this.loadTexture(textureLoader, this.data.texture);
            console.log(`Texture for ${this.data.name} loaded:`, texture);
            texture.colorSpace = THREE.SRGBColorSpace;
            
            // Create materials based on planet type
            let material;
            
            if (this.data.name === 'Sun') {
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    emissive: new THREE.Color(0xffff00),
                    emissiveIntensity: 1,
                    metalness: 0,
                    roughness: 1
                });
            } else {
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.7,
                    metalness: 0.1,
                    bumpScale: 0.05
                });

                // Add bump map for terrain
                if (this.data.bumpMap) {
                    const bumpTexture = await this.loadTexture(textureLoader, this.data.bumpMap);
                    material.bumpMap = bumpTexture;
                }

                // Add specular map for clouds (Earth)
                if (this.data.specularMap) {
                    const specularTexture = await this.loadTexture(textureLoader, this.data.specularMap);
                    material.roughnessMap = specularTexture;
                }
            }

            this.mesh = new THREE.Mesh(geometry, material);
            console.log(`Mesh created for ${this.data.name}:`, this.mesh);
            this.mesh.userData = {
                name: this.data.name,
                info: this.data.info,
                rotationSpeed: this.data.rotationSpeed,
                distance: this.data.distance
            };

            // Create clouds for Earth
            if (this.isEarth) {
                await this.createClouds(textureLoader);
            }

            // Create atmosphere for Venus
            if (this.isVenus && this.data.atmosphere) {
                await this.createAtmosphere(textureLoader);
            }

            // Create rings for Saturn
            if (this.isSaturn && this.data.rings) {
                await this.createRings(textureLoader);
            }

            // Add glow effect for the Sun
            if (this.data.name === 'Sun') {
                this.addSunGlow();
            }

            // Create orbit
            if (this.data.distance !== undefined) {
                this.createOrbit();
            }
        } catch (error) {
            console.error(`Error initializing planet ${this.data.name}:`, error);
            throw error; // Re-throw to propagate the error
        }
    }

    async loadTexture(loader, url) {
        const versionedUrl = `${url}?v=${Date.now()}`;
        return new Promise((resolve, reject) => {
            loader.load(versionedUrl, 
                (texture) => {
                    console.log(`✅ Loaded texture successfully: ${url}`, texture);
                    resolve(texture);
                },
                undefined, 
                (error) => {
                    console.error(`❌ Failed to load texture: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    async createClouds(textureLoader) {
        const cloudGeometry = new THREE.SphereGeometry(this.data.radius * 1.01, 64, 64);
        const cloudTexture = await this.loadTexture(textureLoader, this.data.clouds);
        
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.mesh.add(this.clouds);
    }

    async createAtmosphere(textureLoader) {
        const { texture, opacity, scale } = this.data.atmosphere;
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.data.radius * scale,
            64,
            64
        );
        const atmosphereTexture = await this.loadTexture(textureLoader, texture);
        
        const atmosphereMaterial = new THREE.MeshStandardMaterial({
            map: atmosphereTexture,
            transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh.add(this.atmosphere);
    }

    async createRings(textureLoader) {
        const { innerRadius, outerRadius, texture, opacity, rotation } = this.data.rings;
        const name = this.data.name; // Get planet name for logging

        console.log(`🪐 Creating rings for planet: ${name}`);
        console.log("Rings data:", this.data.rings);

        // Bulletproof NaN protection
        console.log(`🛠️ Planet ${name} | Ring - inner: ${innerRadius}, outer: ${outerRadius}`);
        if (
            typeof innerRadius !== 'number' ||
            typeof outerRadius !== 'number' ||
            isNaN(innerRadius) || isNaN(outerRadius) ||
            outerRadius <= innerRadius ||
            innerRadius < 0 // Ensure innerRadius is non-negative
        ) {
            console.error(`❌ Skipping ring for planet ${name}: Invalid dimensions`, {
                innerRadius,
                outerRadius
            });
            console.trace(`Call stack where ring geometry was skipped for ${name}`);
            return;
        }

        // Create ring geometry with high segment count for smooth edges
        const ringGeometry = new THREE.RingGeometry(
            innerRadius,
            outerRadius,
            128,
            32
        );

        // Load ring texture
        const ringTexture = await this.loadTexture(textureLoader, texture);
        
        // Create ring material with custom shader for better visual effects
        const ringMaterial = new THREE.ShaderMaterial({
            uniforms: {
                ringTexture: { value: ringTexture },
                opacity: { value: opacity },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D ringTexture;
                uniform float opacity;
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    vec4 texColor = texture2D(ringTexture, vUv);
                    
                    // Add subtle pulsing effect
                    float pulse = sin(time * 0.5) * 0.1 + 0.9;
                    
                    // Add slight color variation
                    vec3 color = texColor.rgb * vec3(1.0, 0.95, 0.9);
                    
                    gl_FragColor = vec4(color, texColor.a * opacity * pulse);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Apply initial rotation
        this.rings.rotation.x = THREE.MathUtils.degToRad(rotation.x || 0);
        this.rings.rotation.y = THREE.MathUtils.degToRad(rotation.y || 0);
        this.rings.rotation.z = THREE.MathUtils.degToRad(rotation.z || 0);
        
        this.mesh.add(this.rings);
    }

    addSunGlow() {
        const glowGeometry = new THREE.SphereGeometry(this.data.radius * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                viewVector: { type: 'v3', value: new THREE.Vector3(0, 0, 0) }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying float intensity;
                void main() {
                    vec3 glow = vec3(1.0, 0.6, 0.2) * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
    }

    createOrbit() {
        const distance = this.data.distance;

        // Ensure distance is a valid number before creating the orbit geometry
        if (typeof distance !== 'number' || isNaN(distance) || distance <= 0.1) {
            console.warn(`Skipping orbit creation for ${this.data.name}: Invalid distance value (${distance}).`);
            console.trace(`Orbit geometry skipped for ${this.data.name}`);
            return; 
        }

        console.log(`Creating orbit for ${this.data.name} with distance: ${distance}`);
        console.trace(`Call stack for ${this.data.name} orbit geometry creation`);

        const orbitGeometry = new THREE.RingGeometry(
            distance - 0.1,
            distance + 0.1,
            128
        );
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });

        this.orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        this.orbit.rotation.x = Math.PI / 2;
    }

    async updatePosition(deltaTime, simulationSpeed) {
        // Sun is always at the center, so no position update needed for sun
        if (this.data.name === 'Sun') {
            this.mesh.position.set(0, 0, 0);
            return;
        }

        if (this.isEarth) {
            // Update Earth's rotation based on real-time
            const rotationAngle = nasaAPI.calculateEarthRotation();
            this.mesh.rotation.y = THREE.MathUtils.degToRad(rotationAngle);
            
            if (this.clouds) {
                this.clouds.rotation.y = THREE.MathUtils.degToRad(rotationAngle * 1.1); // Clouds rotate slightly faster
            }
        }

        // Update planet position based on real-time data
        // Use a consistent time source for orbital calculations to avoid NaN and ensure smooth motion.
        // We'll use a simple time counter within the planet instance.
        this.orbitalTime = (this.orbitalTime || 0) + (deltaTime * simulationSpeed);

        const position = nasaAPI.calculatePlanetPosition(this.data, this.orbitalTime);
        console.log(`Calculated position for ${this.data.name}: x=${position.x}, y=${position.y}, z=${position.z}`);
        this.mesh.position.set(position.x, position.y, position.z);
        console.log(`Final mesh position for ${this.data.name}: x=${this.mesh.position.x}, y=${this.mesh.position.y}, z=${this.mesh.position.z}`);
    }

    update(deltaTime, simulationSpeed = 1) {
        // Always update position for all planets except Sun (Sun handled in updatePosition)
        this.updatePosition(deltaTime, simulationSpeed);

        if (!this.isEarth) {
            // Update non-Earth planets' rotation
            this.mesh.rotation.y += this.data.rotationSpeed * deltaTime * simulationSpeed;
            
            // Update Venus atmosphere rotation
            if (this.isVenus && this.atmosphere) {
                this.atmosphere.rotation.y += this.data.rotationSpeed * deltaTime * 0.8 * simulationSpeed;
            }

            // Update Saturn's rings
            if (this.isSaturn && this.rings) {
                // Update shader time uniform for animation
                this.rings.material.uniforms.time.value += deltaTime * simulationSpeed;
                
                // Add slight wobble to rings
                const wobble = Math.sin(this.rings.material.uniforms.time.value * 0.2) * 0.02;
                this.rings.rotation.x = THREE.MathUtils.degToRad(this.data.rings.rotation.x) + wobble;
            }
        }
    }

    getMesh() {
        return this.mesh;
    }

    getOrbit() {
        return this.orbit;
    }
} 