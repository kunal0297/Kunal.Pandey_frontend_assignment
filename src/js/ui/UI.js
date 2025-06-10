import { nasaAPI } from '../services/nasaAPI';
import { planetData } from '../planetData';

export class UI {
    constructor() {
        this.infoCard = document.getElementById('planet-info');
        this.planetName = this.infoCard.querySelector('.planet-name');
        this.planetStats = this.infoCard.querySelector('.planet-stats');
        this.closeBtn = this.infoCard.querySelector('.close-btn');
        this.isDarkMode = true;
        
        this.init();
    }

    init() {
        this.createControlPanel();
        this.setupEventListeners();
        this.updateTheme();
    }

    createControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h2>Solar System Controls</h2>
                <button class="theme-toggle">
                    <span class="theme-icon">🌙</span>
                </button>
            </div>
            <div class="speed-controls">
                <h3>Simulation Speed</h3>
                <div class="speed-slider">
                    <input type="range" min="0.1" max="3" step="0.1" value="1" id="speed-slider">
                    <span class="speed-value">1x</span>
                </div>
            </div>
            <div class="planet-list">
                ${planetData.map(planet => this.createPlanetItem(planet)).join('')}
            </div>
            <div class="animation-controls">
                <button class="pause-btn">⏸️ Pause</button>
                <button class="reset-btn">🔄 Reset</button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    createPlanetItem(planet) {
        return `
            <div class="planet-item" data-planet="${planet.name}">
                <div class="planet-icon" style="background-color: ${this.getPlanetColor(planet.name)}"></div>
                <div class="planet-info">
                    <h3>${planet.name}</h3>
                    <p>${planet.info.type}</p>
                </div>
                <div class="planet-tooltip">
                    <h4>${planet.name}</h4>
                    <p>Temperature: ${planet.info.temperature}</p>
                    <p>Gravity: ${planet.info.gravity}</p>
                    <button class="focus-btn">Focus</button>
                </div>
            </div>
        `;
    }

    getPlanetColor(planetName) {
        const colors = {
            'Sun': '#ffcc33',
            'Mercury': '#b6b6b6',
            'Venus': '#e39e1c',
            'Earth': '#2b83ff',
            'Mars': '#c1440e',
            'Jupiter': '#c99039',
            'Saturn': '#e3bb76',
            'Uranus': '#5580aa',
            'Neptune': '#366896'
        };
        return colors[planetName] || '#ffffff';
    }

    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', () => {
            this.infoCard.classList.remove('active');
        });

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            this.updateTheme();
        });

        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.querySelector('.speed-value');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            speedValue.textContent = `${speed}x`;
            this.onSpeedChange(speed);
        });

        // Planet items
        document.querySelectorAll('.planet-item').forEach(item => {
            item.addEventListener('click', () => {
                const planetName = item.dataset.planet;
                const planet = planetData.find(p => p.name === planetName);
                if (planet) {
                    this.showPlanetInfo(planet);
                }
            });
        });

        // Focus buttons
        document.querySelectorAll('.focus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const planetName = btn.closest('.planet-item').dataset.planet;
                this.onPlanetFocus(planetName);
            });
        });

        // Animation controls
        document.querySelector('.pause-btn').addEventListener('click', (e) => {
            const btn = e.target;
            const isPaused = btn.classList.toggle('paused');
            btn.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
            this.onAnimationToggle(isPaused);
        });

        document.querySelector('.reset-btn').addEventListener('click', () => {
            this.onReset();
        });
    }

    updateTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.body.classList.toggle('light-mode', !this.isDarkMode);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.isDarkMode ? '☀️' : '🌙';
    }

    showPlanetInfo(planet) {
        this.planetName.textContent = planet.name;
        this.planetStats.innerHTML = '';

        // Add basic info
        Object.entries(planet.info).forEach(([key, value]) => {
            const stat = document.createElement('div');
            stat.className = 'stat';
            stat.innerHTML = `
                <span class="label">${this.formatLabel(key)}</span>
                <span class="value">${value}</span>
            `;
            this.planetStats.appendChild(stat);
        });

        // Add real-time data for Earth
        if (planet.name === 'Earth') {
            this.updateEarthData();
        }

        this.infoCard.classList.add('active');
    }

    async updateEarthData() {
        const earthData = await nasaAPI.getEarthData();
        if (earthData) {
            const stat = document.createElement('div');
            stat.className = 'stat real-time';
            stat.innerHTML = `
                <span class="label">Real-time Distance</span>
                <span class="value">${(earthData.distance / 1000000).toFixed(2)} million km</span>
            `;
            this.planetStats.appendChild(stat);
        }
    }

    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    // Event callbacks (to be implemented by the main application)
    onSpeedChange(speed) {
        // Implement in main.js
    }

    onPlanetFocus(planetName) {
        // Implement in main.js
    }

    onAnimationToggle(isPaused) {
        // Implement in main.js
    }

    onReset() {
        // Implement in main.js
    }
} 