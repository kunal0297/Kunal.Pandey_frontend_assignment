import axios from 'axios';

class NasaAPI {
    constructor() {
        this.apiKey = import.meta.env.VITE_NASA_API_KEY;
        this.baseURL = 'https://api.nasa.gov';
        this.solarSystemURL = 'https://api.le-systeme-solaire.net/rest/bodies';
    }

    async getEarthData() {
        try {
            const response = await axios.get(`${this.solarSystemURL}/earth`);
            return this.processEarthData(response.data);
        } catch (error) {
            console.error('Error fetching Earth data:', error);
            return null;
        }
    }

    async getSunData() {
        try {
            const response = await axios.get(`${this.solarSystemURL}/sun`);
            return this.processSunData(response.data);
        } catch (error) {
            console.error('Error fetching Sun data:', error);
            return null;
        }
    }

    async getPlanetData(planetName) {
        try {
            const response = await axios.get(`${this.solarSystemURL}/${planetName.toLowerCase()}`);
            return this.processPlanetData(response.data);
        } catch (error) {
            console.error(`Error fetching ${planetName} data:`, error);
            return null;
        }
    }

    processEarthData(data) {
        return {
            distance: data.semimajorAxis,
            rotationPeriod: data.sideralOrbit,
            orbitalPeriod: data.sideralRotation,
            mass: data.mass.massValue,
            volume: data.vol.volValue,
            density: data.density,
            gravity: data.gravity,
            meanRadius: data.meanRadius,
            temperature: data.temperature
        };
    }

    processSunData(data) {
        return {
            mass: data.mass.massValue,
            volume: data.vol.volValue,
            density: data.density,
            gravity: data.gravity,
            meanRadius: data.meanRadius,
            temperature: data.temperature
        };
    }

    processPlanetData(data) {
        return {
            distance: data.semimajorAxis,
            rotationPeriod: data.sideralOrbit,
            orbitalPeriod: data.sideralRotation,
            mass: data.mass.massValue,
            volume: data.vol.volValue,
            density: data.density,
            gravity: data.gravity,
            meanRadius: data.meanRadius,
            temperature: data.temperature
        };
    }

    calculateEarthRotation() {
        const now = new Date();
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();
        
        // Calculate rotation angle based on current time
        // Earth rotates 360 degrees in 24 hours
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return (totalSeconds / 86400) * 360; // Convert to degrees
    }

    calculatePlanetPosition(planetData, time = Date.now()) {
        // Sun is always at the center
        if (planetData.name === 'Sun') {
            return { x: 0, y: 0, z: 0 };
        }

        const { distance, orbitalSpeed } = planetData;

        // Ensure orbitalSpeed is a valid number to prevent NaN in position
        if (typeof orbitalSpeed !== 'number' || isNaN(orbitalSpeed) || orbitalSpeed === 0) {
            console.warn(`Invalid orbitalSpeed for ${planetData.name}: ${orbitalSpeed}. Defaulting position to 0.`);
            return { x: 0, y: 0, z: 0 };
        }

        // Calculate angle based on time and orbitalSpeed
        // Assuming orbitalSpeed is a factor that dictates the speed of orbit
        const angle = (time * orbitalSpeed / 1000) * Math.PI * 2; // Scale time by orbital speed, adjust 1000 for speed if needed
        
        console.log(`Angle for ${planetData.name}: ${angle}`);

        return {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance
        };
    }
}

export const nasaAPI = new NasaAPI(); 