import * as THREE from 'three';
import NasaAPI from '../services/nasaAPI';
import { loadingManager } from '../utils/LoadingManager';

export default class Planet {
    constructor(data, nasaAPI) {
        this.data = data;
        this.nasaAPI = nasaAPI;
        this.mesh = null;
        this.clouds = null;
        this.atmosphere = null;
        this.rings = null;
        this.orbit = null;
        this.isEarth = data.name.toLowerCase() === 'earth';
        this.isVenus = data.name.toLowerCase() === 'venus';
        this.isSaturn = data.name.toLowerCase() === 'saturn';
        this.orbitalTime = 0;
    }

    async init() {
        try {
            console.log(`Initializing planet: ${this.data.name} with radius: ${this.data.radius}`);
            const geometry = new THREE.SphereGeometry(this.data.radius, 128, 128);
            const textureLoader = new THREE.TextureLoader(loadingManager);
            
            // Load textures with improved settings
            const texture = await this.loadTexture(textureLoader, this.data.texture);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 16;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Create materials based on planet type
            let material;
            
            if (this.data.name === 'Sun') {
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    emissive: new THREE.Color(0xffff00),
                    emissiveIntensity: 1,
                    metalness: 0,
                    roughness: 1,
                    envMapIntensity: 1
                });
            } else {
                material = new THREE.MeshStandardMaterial({
                    map: texture,
                    color: 0xAAAAAA, // Fallback color in case texture fails to load
                    roughness: 0.7,
                    metalness: 0.1,
                    bumpScale: 0.05,
                    envMapIntensity: 0.5
                });

                // Add bump map for terrain with improved settings
                if (this.data.bumpMap) {
                    const bumpTexture = await this.loadTexture(textureLoader, this.data.bumpMap);
                    bumpTexture.anisotropy = 16;
                    material.bumpMap = bumpTexture;
                    material.bumpScale = 0.1;
                }

                // Add specular map for clouds (Earth) with improved settings
                if (this.data.specularMap) {
                    const specularTexture = await this.loadTexture(textureLoader, this.data.specularMap);
                    specularTexture.anisotropy = 16;
                    material.roughnessMap = specularTexture;
                    material.roughness = 0.5;
                }
            }

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
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

    async updatePosition(time, simulationSpeed, isRealTimeMode, customSpeedFactor, planetsMap) {
        // Sun is always at the center, so no position update needed for sun
        if (this.data.name === 'Sun') {
            this.mesh.position.set(0, 0, 0);
            return;
        }

        let calculatedPosition;

        if (this.data.name === 'Moon') {
            const earth = planetsMap.get('earth');
            if (earth && earth.mesh) {
                // Moon orbits Earth, so its position is relative to Earth's position
                const moonRelativePosition = this.nasaAPI.calculatePlanetPosition(
                    this.data,
                    time,
                    isRealTimeMode,
                    customSpeedFactor
                );
                calculatedPosition = new THREE.Vector3(
                    earth.mesh.position.x + moonRelativePosition.x,
                    earth.mesh.position.y + moonRelativePosition.y,
                    earth.mesh.position.z + moonRelativePosition.z
                );
            } else {
                console.warn(`Earth not found for Moon's orbit calculation.`);
                return;
            }
        } else {
            // Calculate position for other planets
            calculatedPosition = this.nasaAPI.calculatePlanetPosition(
                this.data,
                time,
                isRealTimeMode,
                customSpeedFactor
            );
        }

        // Update Earth's rotation if this is Earth
        if (this.isEarth) {
            const rotationAngle = this.nasaAPI.calculateEarthRotation();
            this.mesh.rotation.y = THREE.MathUtils.degToRad(rotationAngle);
            
            if (this.clouds) {
                this.clouds.rotation.y = THREE.MathUtils.degToRad(rotationAngle * 1.1);
            }
        }

        // Set the position if it's valid
        if (calculatedPosition && !isNaN(calculatedPosition.x) && !isNaN(calculatedPosition.y) && !isNaN(calculatedPosition.z)) {
            this.mesh.position.set(calculatedPosition.x, calculatedPosition.y, calculatedPosition.z);
        } else {
            console.warn(`Invalid position calculated for ${this.data.name}:`, calculatedPosition);
        }
    }

    update(time, simulationSpeed = 1, isRealTimeMode, customSpeedFactor, planetsMap) {
        // Update position for all planets except Sun
        this.updatePosition(time, simulationSpeed, isRealTimeMode, customSpeedFactor, planetsMap);

        if (!this.isEarth) {
            // Update non-Earth planets' rotation
            const rotationSpeed = this.data.rotationSpeed * simulationSpeed;
            this.mesh.rotation.y += rotationSpeed * 0.01; // Scale down rotation speed
            
            // Update Venus atmosphere rotation
            if (this.isVenus && this.atmosphere) {
                this.atmosphere.rotation.y += rotationSpeed * 0.8 * 0.01;
            }

            // Update Saturn's rings
            if (this.isSaturn && this.rings) {
                this.rings.material.uniforms.time.value += 0.01 * simulationSpeed;
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