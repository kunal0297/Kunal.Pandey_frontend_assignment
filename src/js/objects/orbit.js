import * as THREE from 'three';

export function createOrbit(radius) {
    // Add validation for radius
    if (typeof radius !== 'number' || isNaN(radius) || radius <= 0.1) {
        console.warn(`Skipping orbit creation: Invalid radius value (${radius}).`);
        return null; // Return null if the radius is invalid
    }

    const innerRadius = radius - 0.1;
    const outerRadius = radius + 0.1;

    // Additional check to ensure innerRadius < outerRadius and innerRadius is not negative
    if (innerRadius < 0 || innerRadius >= outerRadius) {
        console.warn(`Skipping orbit creation: Invalid calculated ring dimensions (inner: ${innerRadius}, outer: ${outerRadius}).`);
        return null;
    }

    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
    const material = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });

    const orbit = new THREE.Mesh(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    
    return orbit;
} 