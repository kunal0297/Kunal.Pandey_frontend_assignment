import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import NasaAPI from '../services/nasaAPI.js';
import { planetData } from '../planetData.js';
import { isMobile } from '../utils/utils.js';
import { updateUI } from '../utils/ui-animations.js';

const SidePanel = styled(motion.aside)`
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    padding: 20px;
    color: white;
    z-index: 1000;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlanetCard = styled(motion.div)`
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
    margin: 10px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(5px);
    }
`;

const InfoCard = styled(motion.div)`
    position: fixed;
    right: 20px;
    top: 20px;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    color: white;
    max-width: 400px;
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ControlButton = styled(motion.button)`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
    
    &:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

export class UI {
    constructor(solarSystem) {
        this.solarSystem = solarSystem;
        this.infoCard = null;
        this.customSpeedInput = null;
        this.speedSlider = null;

        this.setupUI();
        this.setupSpeedControlsEventListeners();
    }

    setupUI() {
        this.sidePanel = document.querySelector('.side-panel');
        this.planetsList = document.querySelector('.planets-list');
        this.infoCard = document.getElementById('planet-info');

        const closeBtn = this.infoCard.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hidePlanetInfo();
                if (this.solarSystem) {
                    this.solarSystem.enableControls();
                }
            });
        }
    }

    setupSpeedControlsEventListeners() {
        this.customSpeedInput = document.getElementById('custom-speed-input');
        this.speedSlider = document.getElementById('speed-slider');

        if (this.customSpeedInput) {
            this.customSpeedInput.addEventListener('input', () => {
                if (this.solarSystem) {
                    this.solarSystem.setOrbitalSpeedMode(false, parseFloat(this.customSpeedInput.value));
                }
            });
        }

        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => {
                if (this.solarSystem) {
                    const speed = parseFloat(e.target.value);
                    this.solarSystem.setSimulationSpeed(speed);
                }
            });
        }

        // Set initial state of speed controls
        if (this.customSpeedInput && !this.customSpeedInput.value) {
            this.customSpeedInput.value = '1';
        }
    }

    setPlanets(planetsMap) {
        this.solarSystem.planets = planetsMap;
        this.updatePlanetsList();
    }

    updatePlanetsList() {
        this.planetsList.innerHTML = '';
        this.solarSystem.planets.forEach((planet, name) => {
            if (name === 'sun') return;

            const card = document.createElement('div');
            card.className = 'planet-card';
            card.innerHTML = `
                <h3>${name.charAt(0).toUpperCase() + name.slice(1)}</h3>
                <p>${planet.data.info?.type || 'Celestial Body'}</p>
            `;
            card.addEventListener('click', () => this.solarSystem.focusPlanet(name));
            this.planetsList.appendChild(card);
        });
    }

    showPlanetInfo(planetName) {
        const planet = this.solarSystem.planets.get(planetName.toLowerCase());
        if (!planet) return;

        const info = planet.data.info;
        const diameter = planet.data.radius ? (planet.data.radius * 2).toFixed(2) + ' units' : 'N/A';
        const distanceFromSun = planet.data.distance ? planet.data.distance + ' units' : 'N/A';
        const orbitalPeriod = info.orbitalPeriod || 'N/A';

        this.infoCard.querySelector('.planet-name').textContent = planetName;
        this.infoCard.querySelector('.stat:nth-child(1) .value').textContent = diameter;
        this.infoCard.querySelector('.stat:nth-child(2) .value').textContent = distanceFromSun;
        this.infoCard.querySelector('.stat:nth-child(3) .value').textContent = orbitalPeriod;
        
        this.infoCard.style.display = 'block';
    }

    hidePlanetInfo() {
        if (this.infoCard) {
            this.infoCard.style.display = 'none';
        }
    }

    updatePauseButton(isPaused) {
        const pauseBtn = document.getElementById('pause-toggle');
        if (pauseBtn) {
            pauseBtn.innerHTML = `<i class="fas fa-${isPaused ? 'play' : 'pause'}"></i>`;
        }
    }
} 