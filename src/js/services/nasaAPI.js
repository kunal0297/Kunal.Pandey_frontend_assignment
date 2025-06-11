import axios from 'axios';

class NasaAPI {
    constructor() {
        this.apiKey = 'q1T3xI2vSxmmFgjDD628gld32e5uMkpYeabnKiKI';
        this.baseURL = 'https://api.nasa.gov';
        this.solarSystemURL = 'https://api.le-systeme-solaire.net/rest/bodies';
        this.epicURL = 'https://api.nasa.gov/EPIC/api/natural/available';
        this.apodURL = 'https://api.nasa.gov/planetary/apod';
    }

    async init() {
        try {
            // Fetch initial data for all planets
            const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
            const planetData = await Promise.all(
                planets.map(planet => this.getPlanetData(planet))
            );
            return planetData;
        } catch (error) {
            console.error('Error initializing NASA API:', error);
            return null;
        }
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
            const data = response.data;
            
            // Get additional data from NASA APIs
            const [epicData, apodData] = await Promise.all([
                this.getEPICData(),
                this.getAPODData()
            ]);

            return {
                ...this.processPlanetData(data),
                epicImage: epicData?.image,
                apodImage: apodData?.url,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching ${planetName} data:`, error);
            return null;
        }
    }

    async getEPICData() {
        try {
            const response = await axios.get(`${this.epicURL}`);
            const dates = response.data;
            const latestDate = dates[0];
            
            const imageResponse = await axios.get(`${this.epicURL}/${latestDate}`);
            const images = imageResponse.data;
            const latestImage = images[0];
            
            return {
                image: `https://epic.gsfc.nasa.gov/archive/natural/${latestDate.split('-').join('/')}/png/${latestImage.image}.png`,
                date: latestDate
            };
        } catch (error) {
            console.error('Error fetching EPIC data:', error);
            return null;
        }
    }

    async getAPODData() {
        try {
            const response = await axios.get(`${this.apodURL}?api_key=${this.apiKey}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching APOD data:', error);
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
            name: data.name,
            distance: data.semimajorAxis,
            rotationPeriod: data.sideralOrbit,
            orbitalPeriod: data.sideralRotation,
            mass: data.mass.massValue,
            volume: data.vol.volValue,
            density: data.density,
            gravity: data.gravity,
            meanRadius: data.meanRadius,
            temperature: data.temperature,
            discoveredBy: data.discoveredBy,
            discoveryDate: data.discoveryDate,
            moons: data.moons,
            isPlanet: data.isPlanet,
            alternativeName: data.alternativeName
        };
    }

    calculateEarthRotation() {
        const now = new Date();
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return (totalSeconds / 86400) * 360;
    }

    calculatePlanetPosition(planetData, time = Date.now(), isRealTimeMode = false, customSpeedFactor = 1) {
        if (planetData.name === 'Sun') {
            return { x: 0, y: 0, z: 0 };
        }

        // Convert time to seconds and calculate angle based on orbital speed
        const timeInSeconds = time / 1000;
        const baseSpeed = planetData.orbitalSpeed || 1;
        const angle = (timeInSeconds * baseSpeed * customSpeedFactor) % (2 * Math.PI);

        const { distance } = planetData;

        return {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance
        };
    }

    async fetchApod() {
        try {
            const response = await fetch(`${this.apodURL}?api_key=${this.apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching APOD:', error);
            throw error;
        }
    }

    async fetchEpicDates() {
        try {
            const response = await fetch(`${this.epicURL}?api_key=${this.apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching EPIC dates:', error);
            throw error;
        }
    }
}

export default NasaAPI; 