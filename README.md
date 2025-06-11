# 🌌 Solar System Dashboard

An immersive, interactive 3D solar system visualization with a modern, responsive UI. Experience the wonders of our solar system through an engaging and educational interface.

![Solar System Dashboard](https://i.imgur.com/placeholder.png)

## 📋 System Context

### Directory Structure
```
Kunal.Pandey_frontend_assignment
├── public
│   └── textures
│       ├── earth_bump.jpeg
│       ├── earth_clouds.jpg
│       ├── earth_specular.jpg
│       ├── earth.jpg
│       ├── jupiter.jpg
│       ├── mars_bump.jpg
│       ├── mars.jpg
│       ├── mercury.jpg
│       ├── moon.jpg
│       ├── neptune.jpg
│       ├── saturn_rings.png
│       ├── saturn.jpg
│       ├── sun.jpg
│       ├── uranus.jpg
│       ├── venus_atmosphere.png
│       └── venus_surface.jpg
├── src
│   ├── js
│   │   ├── effects
│   │   │   └── starField.js
│   │   ├── objects
│   │   │   ├── orbit.js
│   │   │   └── planet.js
│   │   ├── services
│   │   │   ├── DataFetcher.js
│   │   │   └── nasaAPI.js
│   │   ├── ui
│   │   │   └── UI.js
│   │   ├── utils
│   │   │   └── LoadingManager.js
│   │   ├── main.js
│   │   ├── planetData.js
│   │   └── scene.js
│   ├── styles
│   │   └── main.scss
│   └── index.html
├── download-textures.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js
```

### System Architecture
```mermaid
graph TD

    1987["User<br>External Actor"]
    subgraph 1974["External Systems"]
        1986["NASA APIs<br>NASA"]
    end
    subgraph 1975["Solar System Visualizer<br>Vite / JavaScript"]
        1976["Web Page<br>HTML"]
        1977["Application Core<br>JavaScript"]
        1978["3D Scene Manager<br>JavaScript"]
        1979["Solar System Objects<br>JavaScript"]
        1980["Visual Effects<br>JavaScript"]
        1981["UI Controls<br>JavaScript"]
        1982["Asset Loader<br>JavaScript"]
        1983["Texture Assets<br>Image Files"]
        1984["Planet Static Data<br>JavaScript Object"]
        1985["NASA API Client<br>JavaScript"]
        %% Edges at this level (grouped by source)
        1976["Web Page<br>HTML"] -->|Loads| 1977["Application Core<br>JavaScript"]
        1977["Application Core<br>JavaScript"] -->|Initializes| 1978["3D Scene Manager<br>JavaScript"]
        1977["Application Core<br>JavaScript"] -->|Manages| 1979["Solar System Objects<br>JavaScript"]
        1977["Application Core<br>JavaScript"] -->|Initializes &amp;<br>Handles Events from| 1981["UI Controls<br>JavaScript"]
        1977["Application Core<br>JavaScript"] -->|Uses| 1984["Planet Static Data<br>JavaScript Object"]
        1977["Application Core<br>JavaScript"] -->|Fetches details via| 1985["NASA API Client<br>JavaScript"]
        1978["3D Scene Manager<br>JavaScript"] -->|Renders| 1979["Solar System Objects<br>JavaScript"]
        1978["3D Scene Manager<br>JavaScript"] -->|Applies| 1980["Visual Effects<br>JavaScript"]
        1978["3D Scene Manager<br>JavaScript"] -->|Updates| 1981["UI Controls<br>JavaScript"]
        1979["Solar System Objects<br>JavaScript"] -->|Uses for Textures| 1982["Asset Loader<br>JavaScript"]
        1982["Asset Loader<br>JavaScript"] -->|Loads| 1983["Texture Assets<br>Image Files"]
    end
    %% Edges at this level (grouped by source)
    1987["User<br>External Actor"] -->|Interacts with| 1976["Web Page<br>HTML"]
    1985["NASA API Client<br>JavaScript"] -->|Calls| 1986["NASA APIs<br>NASA"]
```

## ✨ Features

### 🎮 Interactive 3D Visualization
- Realistic 3D models of planets and celestial bodies
- Smooth orbital animations
- Interactive camera controls
- Dynamic lighting and shadows
- Realistic space environment

### 🎨 Modern UI/UX
- Clean, minimalist design
- Dark/Light theme toggle
- Responsive layout for all devices
- Smooth animations and transitions
- Intuitive controls and navigation

### 🛠️ Technical Features
- Real-time planet information display
- Customizable simulation speed
- Pause/Resume functionality
- Detailed planet statistics
- Interactive planet selection

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/solar-system-dashboard.git
cd solar-system-dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Built With

- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [GSAP](https://greensock.com/gsap/) - Animation library
- [SASS](https://sass-lang.com/) - CSS preprocessor
- [Axios](https://axios-http.com/) - HTTP client
- [dat.GUI](https://github.com/dataarts/dat.gui) - Debug interface

## 📱 UI Components

### Side Panel
- Planet selection menu
- Theme toggle
- Simulation controls
- Speed adjustment slider

### Main View
- Interactive 3D canvas
- Planet information cards
- Camera controls
- Orbital paths

### Information Cards
- Planet name and type
- Physical characteristics
- Orbital data
- Interesting facts

## 🎨 Design System

### Colors
- Primary: `#2196F3`
- Secondary: `#FF4081`
- Background (Light): `#FFFFFF`
- Background (Dark): `#121212`
- Text (Light): `#333333`
- Text (Dark): `#FFFFFF`

### Typography
- Font Family: Inter
- Headings: 600 weight
- Body: 400 weight
- Monospace: JetBrains Mono

### Spacing
- Base unit: 8px
- Container padding: 24px
- Component spacing: 16px

## 🔧 Configuration

The project can be configured through the following files:
- `vite.config.js` - Build configuration
- `src/js/planetData.js` - Planet data and settings
- `src/styles/main.scss` - Global styles and variables

## 📦 Project Structure

```
├── src/
│   ├── js/
│   │   ├── main.js
│   │   ├── planetData.js
│   │   ├── scene.js
│   │   ├── services/
│   │   ├── utils/
│   │   ├── ui/
│   │   ├── objects/
│   │   └── effects/
│   └── styles/
│       └── main.scss
├── public/
├── index.html
└── vite.config.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NASA for planetary data
- Three.js community for 3D graphics support
- All contributors who have helped shape this project

## 📞 Contact

Your Name - [@kunal](kunalpandey0297@gmail.com)
Project Link: [@https://github.com/kunal0297/Kunal.Pandey_frontend_assignment](@https://github.com/kunal0297/Kunal.Pandey_frontend_assignment )
