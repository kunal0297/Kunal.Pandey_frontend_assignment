const https = require('https');
const fs = require('fs');
const path = require('path');

const textures = {
    'earth': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'mars': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg',
    'jupiter': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter2_1024.jpg',
    'saturn': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn.jpg',
    'neptune': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/neptune.jpg',
    'uranus': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/uranus.jpg',
    'venus': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus.jpg',
    'mercury': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury.jpg'
};

const downloadTexture = (url, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join('public', 'textures', filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename);
            reject(err);
        });
    });
};

async function downloadAllTextures() {
    for (const [planet, url] of Object.entries(textures)) {
        await downloadTexture(url, `${planet}.jpg`);
    }
}

downloadAllTextures().catch(console.error); 