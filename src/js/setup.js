import * as THREE from 'three';
import { planetData } from './planetData.js';
import Planet from './objects/planet.js';
import { StarField } from './effects/starField.js';

export function setupLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffcc33, 1.5, 0, 0);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
}

export async function createSolarSystem(scene, nasaAPI) {
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/textures/sun.jpg') });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets = new Map();
    for (const data of planetData) {
        const planet = new Planet(data, nasaAPI);
        await planet.init();
        scene.add(planet.mesh);
        if (planet.orbit) {
            scene.add(planet.orbit);
        }
        planets.set(data.name.toLowerCase(), planet);
    }
    return planets;
}

export function createStarfield(scene) {
    const starfield = new StarField();
    scene.add(starfield.mesh);
} 