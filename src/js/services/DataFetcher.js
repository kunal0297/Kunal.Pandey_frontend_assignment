class DataFetcher {
    constructor() {
        this.NASA_API_KEY = 'q1T3xI2vSxmmFgjDD628gld32e5uMkpYeabnKiKI';
        this.SOLAR_SYSTEM_API = 'https://api.le-systeme-solaire.net/rest.php';
        this.EPIC_API = 'https://api.nasa.gov/EPIC/api';
    }

    async fetchPlanetData(planetName) {
        try {
            const response = await fetch(`${this.SOLAR_SYSTEM_API}/bodies/${planetName.toLowerCase()}`);
            const data = await response.json();
            return this.processPlanetData(data);
        } catch (error) {
            console.error(`Error fetching data for ${planetName}:`, error);
            return null;
        }
    }

    async fetchEarthImage() {
        try {
            const response = await fetch(`${this.EPIC_API}/natural/available`);
            const dates = await response.json();
            const latestDate = dates[0];
            
            const imageResponse = await fetch(`${this.EPIC_API}/natural/date/${latestDate}`);
            const images = await imageResponse.json();
            const latestImage = images[0];
            
            return `https://epic.gsfc.nasa.gov/archive/natural/${latestDate.split('-').join('/')}/png/${latestImage.image}.png`;
        } catch (error) {
            console.error('Error fetching Earth image:', error);
            return null;
        }
    }

    async fetchHubbleImage() {
        try {
            const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${this.NASA_API_KEY}`);
            const data = await response.json();
            return data.hdurl || data.url;
        } catch (error) {
            console.error('Error fetching Hubble image:', error);
            return null;
        }
    }

    async fetchNasaApod() {
        try {
            const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${this.NASA_API_KEY}`);
            const data = await response.json();
            return data.hdurl || data.url;
        } catch (error) {
            console.error('Error fetching NASA APOD:', error);
            throw error;
        }
    }

    processPlanetData(data) {
        return {
            name: data.name,
            diameter: data.equaRadius * 2,
            distance: data.sideralOrbit,
            orbitalPeriod: data.sideralOrbit,
            rotationPeriod: data.sideralRotation,
            mass: data.mass,
            gravity: data.gravity,
            temperature: data.temperature,
            moons: data.moons,
            discoveredBy: data.discoveredBy,
            discoveryDate: data.discoveryDate
        };
    }

    calculatePlanetPosition(planetData, date = new Date()) {
        // Simplified orbital position calculation
        // In a real application, you would use more complex orbital mechanics
        const time = date.getTime() / 1000; // Convert to seconds
        const period = planetData.orbitalPeriod * 24 * 60 * 60; // Convert days to seconds
        const angle = (time % period) / period * Math.PI * 2;
        
        return {
            x: Math.cos(angle) * planetData.distance,
            y: 0,
            z: Math.sin(angle) * planetData.distance
        };
    }

    calculateEarthRotation(date = new Date()) {
        // Calculate Earth's rotation based on UTC time
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const seconds = date.getUTCSeconds();
        
        // Convert time to rotation angle (360 degrees / 24 hours)
        const rotationAngle = (hours + minutes / 60 + seconds / 3600) * (360 / 24);
        
        return rotationAngle;
    }
}

export const dataFetcher = new DataFetcher(); 