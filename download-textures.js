const fs = require('fs');
const path = require('path');
const https = require('https');

const TEXTURES = {
  mercury: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury.jpg',
  venus: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus.jpg',
  earth: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth.jpg',
  mars: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars.jpg',
  jupiter: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter.jpg',
  saturn: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn.jpg',
  uranus: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/uranus.jpg',
  neptune: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/neptune.jpg'
};

const texturesDir = path.join(__dirname, 'public', 'textures');

// Create textures directory if it doesn't exist
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

// Download each texture
Object.entries(TEXTURES).forEach(([planet, url]) => {
  const filePath = path.join(texturesDir, `${planet}.jpg`);
  
  https.get(url, (response) => {
    const file = fs.createWriteStream(filePath);
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${planet} texture`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${planet} texture:`, err.message);
  });
}); 