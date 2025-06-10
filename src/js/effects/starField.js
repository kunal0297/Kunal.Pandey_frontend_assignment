import * as THREE from 'three';

export class StarField {
    constructor() {
        this.starCount = 5000;
        this.starGeometry = new THREE.BufferGeometry();
        this.starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.init();
    }

    init() {
        const positions = new Float32Array(this.starCount * 3);
        const colors = new Float32Array(this.starCount * 3);
        const sizes = new Float32Array(this.starCount);
        const phases = new Float32Array(this.starCount);

        for (let i = 0; i < this.starCount; i++) {
            const i3 = i * 3;
            
            // Random position in a sphere
            const radius = 100 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Random star color (white to blue)
            const color = new THREE.Color();
            color.setHSL(0.6, 0.8, 0.5 + Math.random() * 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Random size
            sizes[i] = Math.random() * 0.5;

            // Random phase for twinkling
            phases[i] = Math.random() * Math.PI * 2;
        }

        this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.starGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        this.starMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 };
            shader.vertexShader = `
                attribute float phase;
                uniform float time;
                varying float vOpacity;
                ${shader.vertexShader}
            `.replace(
                'gl_PointSize = size;',
                `
                vOpacity = 0.5 + 0.5 * sin(time + phase);
                gl_PointSize = size * (0.5 + 0.5 * vOpacity);
                `
            );
            shader.fragmentShader = `
                varying float vOpacity;
                ${shader.fragmentShader}
            `.replace(
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a * vOpacity );'
            );
            this.shader = shader;
        };

        this.mesh = new THREE.Points(this.starGeometry, this.starMaterial);
        this.rotationSpeed = 0.0001;
    }

    update(time) {
        if (this.shader) {
            this.shader.uniforms.time.value = time;
        }
        this.mesh.rotation.y += this.rotationSpeed;
    }

    getMesh() {
        return this.mesh;
    }
} 