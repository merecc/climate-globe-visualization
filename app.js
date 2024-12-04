import * as THREE from 'three';
import getStarfield from "./star_background.js";



// Renderer, scene, and camera
const container = document.getElementById('globe-container');
const w = container.clientWidth;
const h = container.clientHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, w / h, 1, 1000);
camera.position.z = 4.20;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(w, h);
container.appendChild(renderer.domElement);


// Color management 
THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Earth 
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
earthGroup.position.y += .45; // Moves the earth up within the scene
scene.add(earthGroup);

const loader = new THREE.TextureLoader();
const sphereGeometry = new THREE.SphereGeometry(1.5, 128, 128);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("./Textures/earthmap1k.jpg"),
    specularMap: loader.load("./Textures/02_earthspec1k.jpg"),
    bumpMap: loader.load("./Textures/Bump.jpg"),
    bumpScale: 0.04,
    shininess: 15
});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthGroup.add(earthMesh);

// Star Background
const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

// Brighten the earth 
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(-5, 0.5, 5);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Temperature Overlay
const tempOverlayGeometry = new THREE.SphereGeometry(1.51, 128, 128);
const tempMaterials = {};
const tempMesh = new THREE.Mesh(tempOverlayGeometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
tempMesh.scale.set(1.01, 1.01, 1.01);
earthGroup.add(tempMesh);

// Load temperature textures
const years = [];
for (let year = 1973; year <= 2024; year++) {
    years.push(year);
    loader.load(`./Textures/temp_anomaly_${year}.png`, texture => {
        tempMaterials[year] = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: .95,
        });
    });
}

// UI element
const slider = document.getElementById('yearSlider');
const sliderValue = document.getElementById('slider-value');
const galleryButton = document.getElementById('gallery-button');
const galleryModal = document.getElementById('gallery-modal');
const yearDropdown = document.getElementById('year-dropdown');
const prevYearButton = document.getElementById('prev-year');
const nextYearButton = document.getElementById('next-year');

//  Populate Year dropdown 
years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
});

// Event Listeners for UI Interactions

slider.addEventListener('input', () => {
    updateLayer(parseInt(slider.value));
});

galleryButton.addEventListener('click', () => {
    const currentSliderYear = parseInt(slider.value);
    updateLayer(currentSliderYear);
    galleryModal.classList.remove('hidden');
});

document.getElementById('close-gallery').addEventListener('click', () => {
    galleryModal.classList.add('hidden');
});

document.getElementById('backButton').addEventListener('click', () => {
    const container = document.getElementById('container');
    container.style.display = 'flex';
    document.getElementById('header-block').style.display = 'none';

    renderer.render(scene, camera);
});


prevYearButton.addEventListener('click', () => {
    let currentYearValue = parseInt(yearDropdown.value);
    if (currentYearValue > 1973) { 
        currentYearValue -= 1; 
        updateLayer(currentYearValue); 
    } else {
        console.log('Already at the earliest year');
    }
});

nextYearButton.addEventListener('click', () => {
    let currentYearValue = parseInt(yearDropdown.value);
    if (currentYearValue < 2024) { 
        currentYearValue += 1; 
        updateLayer(currentYearValue);
    } else {
        console.log('Already at the latest year');
    }
});

yearDropdown.addEventListener('change', () => {
    const selectedYear = parseInt(yearDropdown.value);
    updateLayer(selectedYear);
});

// Update layer for Earth, UI, and temperature overlay
function updateLayer(year) {
    if (isNaN(year)) return;

    slider.value = year;
    sliderValue.textContent = year;

    // Calculate and update the position of the slider value text
    const sliderWidth = slider.offsetWidth; 
    const percentage = ((year - slider.min) / (slider.max - slider.min));
    const newPosition = percentage * sliderWidth;
    sliderValue.style.left = `calc(${newPosition}px - ${sliderValue.offsetWidth / 2}px)`;

    // Update temperature overlay
    yearDropdown.value = year;
    tempMesh.material = tempMaterials[year] || new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

    const galleryImage = document.getElementById('gallery-image');
    // galleryImage.src = `./Textures/temp_anomaly_${year}.png`;
    galleryImage.src = `./Textures/temp_anomaly__w_scale${year}.png`;
    galleryImage.onerror = () => {
        galleryImage.alt = "Image not found.";
        galleryImage.src = "";
    };
}

// Interaction: Drag to Rotate
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', function (e) {
    isDragging = true;
    previousMousePosition.x = e.clientX;
    previousMousePosition.y = e.clientY;
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y,
        };

        earthGroup.rotation.y += deltaMove.x * 0.005;
        earthGroup.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = {
            x: e.clientX,
            y: e.clientY,
        };
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Adjust globe scale and camera position based on window width
    if (window.innerWidth <= 755) {
        earthMesh.scale.set(0.3, 0.3, 0.3); 
        camera.position.z = 6.2; 
    } else if (window.innerWidth <= 930) {
        earthMesh.scale.set(0.5, 0.5, 0.5); 
        camera.position.z = 5.4; 
    } else {
        earthMesh.scale.set(1, 1, 1);
        camera.position.z = 4.15;
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize);

// Call the function initially to set up the scene correctly
onWindowResize();


// JavaScript to Run After the DOM is Loaded
window.onload = function() {
    updateLayer(parseInt(document.getElementById('yearSlider').value));
};

document.getElementById('learnMoreBtn').addEventListener('click', async () => {
    console.log("Learn More button clicked");

    // Show header block and hide the globe container
    const container = document.getElementById('container');
    container.style.display = 'none';
    const headerBlock = document.getElementById('header-block');
    headerBlock.style.display = 'flex';

    const iceCharts = document.getElementById('iceCharts');
    const emissionCharts = document.getElementById('emissionCharts');
    if (!iceCharts || !emissionCharts) {
        console.error("Error: IceCharts or EmissionCharts element not found.");
        return;
    }
    iceCharts.innerHTML = '';
    emissionCharts.innerHTML = '';

    try {
        console.log("Fetching data...");
        const emissionsData = await fetchEmissionsData();
        console.log("Fetched Emissions Data:", emissionsData);

        const iceMassData = await fetchIceMassData();
        console.log("Fetched Ice Mass Data:", iceMassData);

        // Render emissions charts
        if (emissionsData) {
            console.log("Rendering Emissions Charts...");
            const industryEmissionsData = organizeYearlyEmissionsData(emissionsData);
            createEmissionsChart(industryEmissionsData, emissionCharts);

            const totalEmissionsData = organizeTotalEmissions(emissionsData);
            createTotalEmissionsChart(totalEmissionsData, emissionCharts);
        } else {
            console.warn("No emissions data available.");
        }

        // Render ice mass charts
        if (iceMassData) {
            console.log("Rendering Ice Mass Charts...");
            createIceMassChart(iceMassData, iceCharts);
            createIceMassChangeChart(iceMassData, iceCharts);
        } else {
            console.warn("No ice mass data available.");
        }
    } catch (error) {
        console.error("Error during data fetching or chart rendering:", error);
    }
});

// Fetch and parse ice mass data
async function fetchIceMassData() {
    try {
        const response = await fetch('./Data/antarctica_mass_200204_202408.txt');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        return parseIceMassData(data);
    } catch (error) {
        console.error('Error fetching ice mass data:', error);
        return null;
    }
}

function parseIceMassData(data) {
    const lines = data.split('\n');
    const time = [];
    const mass = [];
    let headerPassed = false;

    lines.forEach((line, index) => {
        if (line.trim().startsWith("HDR")) {
            return;
        }
        if (!headerPassed) {
            if (!isNaN(parseFloat(line.split(/\s+/)[0]))) {
                headerPassed = true;
            } else {
                return;
            }
        }
        if (headerPassed && line.trim()) {
            const parts = line.split(/\s+/);
            time.push(parts[0]);
            mass.push(parseFloat(parts[1]));
        }
    });
    return { time, mass };
}


// Fetch and organize emissions data
async function fetchEmissionsData() {
    const url = 'https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/Indicator_1_1_quarterly/FeatureServer/0/query?where=1%3D1&outFields=Country,Industry,Gas_Type,Seasonal_Adjustment,Scale,F2010Q1,F2010Q2,F2010Q3,F2010Q4,F2011Q1,F2011Q2,F2011Q3,F2011Q4,F2012Q1,F2012Q2,F2012Q3,F2012Q4,F2013Q1,F2013Q2,F2013Q3,F2013Q4,F2014Q1,F2014Q2,F2014Q3,F2014Q4,F2015Q1,F2015Q2,F2015Q3,F2015Q4,F2016Q1,F2016Q2,F2016Q3,F2016Q4,F2017Q1,F2017Q2,F2017Q3,F2017Q4,F2018Q1,F2018Q2,F2018Q3,F2018Q4,F2019Q1,F2019Q2,F2019Q3,F2019Q4,F2020Q1,F2020Q2,F2020Q3,F2020Q4,F2021Q1,F2021Q2,F2021Q3,F2021Q4,F2022Q1,F2022Q2,F2022Q3,F2022Q4,F2023Q1,F2023Q2,F2023Q3,F2023Q4,F2024Q1&outSR=4326&f=json';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching emissions data:', error);
        return null;
    }
}
function organizeYearlyEmissionsData(emissionsData) {
    const features = emissionsData.features;
    const industryData = {};
    const years = new Set();
    const excludedIndustries = ["Other Services Industries", "Total Industry and Households", "Total Households"];

    features.forEach(feature => {
        const attrs = feature.attributes;
        const industry = attrs.Industry;

        if (excludedIndustries.includes(industry)) {
            return;
        }

        if (!industryData[industry]) {
            industryData[industry] = {}; 
        }

        Object.keys(attrs).forEach(key => {
            if (key.startsWith("F")) {
                const year = key.slice(1, 5); 
                if (parseInt(year) <= 2023) {
                    years.add(year);
                    const value = parseFloat(attrs[key]);
                    if (!isNaN(value)) {
                        if (!industryData[industry][year]) {
                            industryData[industry][year] = 0;
                        }
                        industryData[industry][year] += value;
                    }
                }
            }
        });
    });

    const sortedYears = Array.from(years).sort();
    const colorPalette = ["#00FF40","#FFBEFD", "#FF1515","#BE0AFF","#FF8700", "#FFFF00", "#0AEFFF"];
    let colorIndex = 0;
    const industryColors = {};

    Object.keys(industryData).forEach(industry => {
        if (!industryColors[industry]) {
            industryColors[industry] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
    });

    return {
        labels: sortedYears,
        datasets: Object.keys(industryData).map(industry => {
            const dataPoints = sortedYears.map(year => industryData[industry][year] || 0);
            return {
                label: industry,
                data: dataPoints,
                borderColor: industryColors[industry],
                fill: false
            };
        })
    };
}

function createEmissionsChart(data, container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.labels, 
            datasets: data.datasets, 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 14, 
                        },
                        generateLabels: function(chart) {
                            return chart.data.datasets.map((dataset, index) => {
                                const firstWord = dataset.label.split(' ')[0].replace(/,$/, '');
                                return {
                                    text: firstWord, 
                                    fillStyle: dataset.borderColor,
                                    strokeStyle: dataset.borderColor, 
                                    lineWidth: 2, 
                                    fontColor: '#FFFFFF',
                                    hidden: !chart.isDatasetVisible(index),
                                    datasetIndex: index,
                                };
                            });
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#FFFFFF', 
                    },
                    title: {
                        display: true,
                        text: 'Year',
                        color: 'white', 
                    },
                },
                y: {
                    ticks: {
                        color: '#FFFFFF', 
                    },
                    title: {
                        color: '#FFFFFF', 
                        display: true,
                        text: 'Emissions (units)',
                    },
                    beginAtZero: true,
                },
            },
        },
    });
}

function createTotalEmissionsChart(chartData, container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas); 

    new Chart(canvas.getContext('2d'), {
        type: 'line', 
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        boxWidth: 12,
                    },
                },
            },
            scales: {
                x: {ticks: {
                    color: '#FFFFFF', 
                },
                    title: {color: '#FFFFFF',
                        display: true,
                        text: 'Year',
                    },
                },
                y: {ticks: {
                    color: '#FFFFFF', 
                },
                    title: {color: '#FFFFFF',
                        display: true,
                        text: 'Total Emissions (units)', 
                    },
                    beginAtZero: true, 
                },
            },
        },
    });
}
function createIceMassChart(data, container) {
    const chartWrapper = document.createElement('div');
    chartWrapper.classList.add('chart-wrapper');
    container.appendChild(chartWrapper);

    const canvas = document.createElement('canvas');
    chartWrapper.appendChild(canvas);

    // Add explanatory paragraph to the chart wrapper
    const description = document.createElement('p');
    description.textContent = "This table shows Antarctic ice mass anomalies from 2002 to 2024, measured in gigatonnes (Gt). The values represent changes in ice mass relative to April 2002, with negative numbers indicating ice loss. Over time, there is a clear downward trend, reflecting significant and ongoing ice loss from the Antarctic ice sheet.";
    description.classList.add('chart-description');
    chartWrapper.appendChild(description);

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.time,
            datasets: [
                {
                    label: 'Antarctic Ice Mass',
                    data: data.mass,
                    borderColor: '#A7EBFF',
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        boxWidth: 12,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#FFFFFF',
                    },
                    title: {
                        color: '#FFFFFF',
                        display: true,
                        text: 'Year',
                    },
                },
                y: {
                    ticks: {
                        color: '#FFFFFF',
                    },
                    title: {
                        color: '#FFFFFF',
                        display: true,
                        text: 'Mass (Gt)',
                    },
                    beginAtZero: false,
                },
            },
        },
    });
}

function organizeTotalEmissions(data) {
    const totals = {};
    const labels = [];

    data.features.forEach(feature => {
        const attributes = feature.attributes;

        Object.keys(attributes).forEach(key => {
            if (key.startsWith("F")) {
                const year = key.substring(1, 5);
                if (parseInt(year) <= 2023) { 
                    const emissionValue = parseFloat(attributes[key]);

                    if (!isNaN(emissionValue)) {
                        if (!totals[year]) {
                            totals[year] = 0; 
                            labels.push(year); 
                        }
                        totals[year] += emissionValue;
                    }
                }
            }
        });
    });

    labels.sort(); 

    return {
        labels: labels,
        datasets: [{
            label: 'Total Emissions',
            data: labels.map(year => totals[year] || 0),
            borderColor: '#FF33E7', 
            backgroundColor: 'rgba(255, 142, 251, 0.2)',
            fill: true, 
        }],
    };
}
function adjustChartLayout() {
    const iceCharts = document.getElementById('iceCharts');
    const emissionCharts = document.getElementById('emissionCharts');

    if (window.innerWidth <= 768) {
        iceCharts.style.flexDirection = 'column';
        emissionCharts.style.flexDirection = 'column';
    } else {
        iceCharts.style.flexDirection = 'row';
        emissionCharts.style.flexDirection = 'row';
    }
}

// Call function on page load and window resize
window.addEventListener('load', adjustChartLayout);
window.addEventListener('resize', adjustChartLayout);

