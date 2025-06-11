export const planetData = [
    {
        name: 'Sun',
        radius: 5,
        texture: '/textures/sun.jpg',
        emissive: true,
        light: {
            color: 0xffcc33,
            intensity: 2
        },
        info: {
            type: 'Star',
            temperature: '5,778 K',
            mass: '1.989 × 10^30 kg'
        }
    },
    {
        name: 'Mercury',
        radius: 0.4,
        distance: 10,
        texture: '/textures/mercury.jpg',
        rotationSpeed: 0.004,
        orbitalSpeed: 4,
        info: {
            type: 'Terrestrial',
            temperature: '167°C to -183°C',
            gravity: '3.7 m/s²',
            orbitalPeriod: '88 Earth days'
        },
        orbitalPeriodDays: 88
    },
    {
        name: 'Venus',
        radius: 0.9,
        distance: 15,
        texture: '/textures/venus_surface.jpg',
        atmosphere: {
            texture: '/textures/venus_atmosphere.png',
            opacity: 0.7,
            scale: 1.02
        },
        rotationSpeed: 0.002,
        orbitalSpeed: 1.5,
        info: {
            type: 'Terrestrial',
            temperature: '462°C',
            gravity: '8.87 m/s²',
            atmosphere: '96.5% CO2, 3.5% N2',
            orbitalPeriod: '225 Earth days'
        },
        orbitalPeriodDays: 225
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 20,
        texture: '/textures/earth.jpg',
        bumpMap: '/textures/earth_bump.jpeg',
        specularMap: '/textures/earth_specular.jpg',
        clouds: '/textures/earth_clouds.jpg',
        rotationSpeed: 0.01,
        orbitalSpeed: 1,
        info: {
            type: 'Terrestrial',
            temperature: '15°C',
            gravity: '9.81 m/s²',
            orbitalPeriod: '365.25 Earth days'
        },
        orbitalPeriodDays: 365.25
    },
    {
        name: 'Moon',
        radius: 0.27,
        distance: 2.5, // Relative distance from Earth, for orbital animation
        texture: '/textures/moon.jpg',
        rotationSpeed: 0.005,
        orbitalSpeed: 3,
        info: {
            type: 'Satellite',
            temperature: '-20°C to 120°C',
            gravity: '1.62 m/s²'
        },
        orbitalPeriodDays: 27.32 // Sidereal orbital period of the Moon
    },
    {
        name: 'Mars',
        radius: 0.5,
        distance: 25,
        texture: '/textures/mars.jpg',
        bumpMap: '/textures/mars_bump.jpg',
        rotationSpeed: 0.009,
        orbitalSpeed: 0.8,
        info: {
            type: 'Terrestrial',
            temperature: '-63°C',
            gravity: '3.72 m/s²',
            orbitalPeriod: '687 Earth days'
        },
        orbitalPeriodDays: 687
    },
    {
        name: 'Jupiter',
        radius: 3.5,
        distance: 35,
        texture: '/textures/jupiter.jpg',
        rotationSpeed: 0.02,
        orbitalSpeed: 0.2,
        info: {
            type: 'Gas Giant',
            temperature: '-110°C',
            gravity: '24.79 m/s²',
            orbitalPeriod: '11.9 Earth years'
        },
        orbitalPeriodDays: 11.9 * 365.25 // Convert years to days
    },
    {
        name: 'Saturn',
        radius: 3,
        distance: 45,
        texture: '/textures/saturn.jpg',
        rings: {
            innerRadius: 3.5,
            outerRadius: 7,
            texture: '/textures/saturn_rings.png',
            opacity: 0.8,
            rotation: {
                x: 26.73,
                y: 0,
                z: 0
            }
        },
        rotationSpeed: 0.018,
        orbitalSpeed: 0.09,
        info: {
            type: 'Gas Giant',
            temperature: '-178°C',
            gravity: '10.44 m/s²',
            orbitalPeriod: '29.5 Earth years'
        },
        orbitalPeriodDays: 29.5 * 365.25 // Convert years to days
    },
    {
        name: 'Uranus',
        radius: 1.8,
        distance: 55,
        texture: '/textures/uranus.jpg',
        rotationSpeed: 0.012,
        orbitalSpeed: 0.04,
        info: {
            type: 'Ice Giant',
            temperature: '-224°C',
            gravity: '8.69 m/s²',
            orbitalPeriod: '84 Earth years'
        },
        orbitalPeriodDays: 84 * 365.25 // Convert years to days
    },
    {
        name: 'Neptune',
        radius: 1.8,
        distance: 65,
        texture: '/textures/neptune.jpg',
        rotationSpeed: 0.014,
        orbitalSpeed: 0.01,
        info: {
            type: 'Ice Giant',
            temperature: '-214°C',
            gravity: '11.15 m/s²',
            orbitalPeriod: '165 Earth years'
        },
        orbitalPeriodDays: 165 * 365.25 // Convert years to days
    }
]; 