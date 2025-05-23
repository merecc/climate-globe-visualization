# Temperature Rising: Climate Data 3D Globe Visualization

**Live Demo:** [Explore the Visualization](https://merecc.github.io/climate-globe-visualization/)

> The app may take a few seconds to load, especially on first visit — it's loading large 3D textures and initializing WebGL.

This interactive web app visualizes **75 years of global temperature anomalies** on a rotating 3D globe. It combines frontend visualization with backend data processing to show how the planet has warmed year by year.

---

## What I Built

- A full-stack **climate visualization tool** with a 3D globe using **Three.js**
- A **Python data pipeline** that processes raw climate data into **yearly heatmap textures**
- An interactive **web interface** with sliders, galleries, and insights using **HTML/CSS/JS**

---

## Technologies Used

### Frontend

- `HTML`, `CSS`, `JavaScript`
- `Three.js` — for 3D globe rendering and texture mapping
- `Chart.js` — to visualize emissions and Antarctic ice mass trends

### Data Processing (Python)

- `xarray`, `cartopy`, `matplotlib`, `PIL`
- Parsed **NASA GISTEMP** NetCDF files into 2D global temperature anomaly PNGs

---

## Key Features

- **Year Slider**  
  Drag through years (1973–2024) to view changing global temperature patterns

- **3D Globe with Dynamic Textures**  
  View realistic Earth with annual heatmap overlays

- **Gallery Mode**  
  Flip through yearly climate data in a modal viewer

- **Learn More Page**  
  See climate insights like **CO₂ emissions** and **ice mass loss** in chart format

---

## Data Sources

- [NASA GISTEMP Surface Temperature Dataset](https://data.giss.nasa.gov/gistemp/)
- [Antarctic Ice Mass Data (NASA)](https://climate.nasa.gov/vital-signs/ice-sheets/)

---

## Author

**Meredith Canova**
