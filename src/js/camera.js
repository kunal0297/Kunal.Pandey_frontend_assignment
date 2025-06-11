import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let controls;
let isDragging = false;

export function setupCameraControls(camera, renderer, enabled = true) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.enabled = enabled;

    // Disable pan if on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        controls.enablePan = false;
    }
}

export function enableDrag() {
    isDragging = true;
    if (controls) {
        controls.enabled = true;
    }
}

export function disableDrag() {
    isDragging = false;
    if (controls) {
        controls.enabled = false;
    }
}

export function updateCameraControls() {
    if (controls) {
        controls.update();
    }
} 