/**
 * Modern Interactive India Map (Custom SVG Version)
 * Features: Pure SVG Rendering, Hardware Accelerated Animations, Full Interactive State
 */

const IndiaMap = {
    container: null,
    modal: null,
    hospitalsModal: null,
    diseaseChart: null,
    liveInterval: null,
    activeState: null, // Track currently active/locked state

    // Detailed State Colors
    stateColors: {
        "andaman and nicobar": "#06b6d4",
        "andhra pradesh": "#3b82f6",
        "arunachal pradesh": "#10b981",
        "assam": "#8b5cf6",
        "bihar": "#f59e0b",
        "chandigarh": "#ec4899",
        "chhattisgarh": "#6366f1",
        "dadra and nagar haveli": "#14b8a6",
        "daman and diu": "#14b8a6",
        "delhi": "#ef4444",
        "goa": "#f97316",
        "gujarat": "#84cc16",
        "haryana": "#06b6d4",
        "himachal pradesh": "#3b82f6",
        "jammu and kashmir": "#a855f7",
        "jharkhand": "#10b981",
        "karnataka": "#f43f5e",
        "kerala": "#0ea5e9",
        "ladakh": "#8b5cf6",
        "lakshadweep": "#06b6d4",
        "madhya pradesh": "#eab308",
        "maharashtra": "#f97316",
        "manipur": "#ec4899",
        "meghalaya": "#6366f1",
        "mizoram": "#14b8a6",
        "nagaland": "#ef4444",
        "odisha": "#84cc16",
        "puducherry": "#06b6d4",
        "punjab": "#f59e0b",
        "rajasthan": "#eab308",
        "sikkim": "#10b981",
        "tamil nadu": "#f43f5e",
        "telangana": "#3b82f6",
        "tripura": "#8b5cf6",
        "uttar pradesh": "#f97316",
        "uttarakhand": "#0ea5e9",
        "west bengal": "#ec4899"
    },

    // Manual Path Overrides (e.g., for Survey of India boundaries)
    // Users can replace these strings with official high-resolution paths
    manualPaths: {
        "jammu and kashmir": "M 275.5 50.2 L 280.1 45.3 L 290.5 40.1 L 305.2 38.5 L 315.8 32.2 L 325.4 25.1 L 340.1 20.5 L 355.2 18.2 L 368.5 22.1 L 375.2 28.5 L 380.1 35.2 L 378.5 45.1 L 372.1 52.5 L 365.4 58.2 L 355.1 65.5 L 345.2 70.1 L 330.5 75.2 L 315.1 78.5 L 300.2 82.1 L 285.5 80.5 L 275.2 75.1 L 268.5 65.2 L 265.1 55.5 L 270.2 50.1 Z"
    },

    init() {
        this.container = document.getElementById('india-map');
        if (!this.container) return;

        // Initialize Modals
        this.initModals();

        // Load and Render Logic
        this.loadMapData();

        // Handle Resize
        window.addEventListener('resize', () => {
            // SVG is responsive by default, but we might need re-calculations if container changes aspect ratio drastically
            // For now, viewBox handles scaling.
        });
    },

    initModals() {
        // State Details Modal
        const modalHTML = `
            <div id="state-popout-modal" class="state-popout-modal">
                <div class="popout-backdrop"></div>
                <div class="popout-container">
                    <button class="popout-close"><span class="material-icons-outlined">close</span></button>

                    <!-- Data Connectors -->
                    <div class="data-connector top-right">
                        <div class="connector-line"></div>
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card">
                            <div class="data-box-header"><span class="material-icons-outlined">people</span> Total Population</div>
                            <div class="data-box-value large" id="modal-population">0
                                <span class="stars">✨</span>
                            </div>
                            <div class="data-box-sub-grid">
                                <div class="stat-row born">
                                    <span class="material-icons-outlined">child_friendly</span>
                                    <span class="stat-label">Born Today</span>
                                    <span class="stat-number" id="modal-born">0</span>
                                </div>
                                <div class="stat-row died">
                                    <span class="material-icons-outlined">favorite_border</span>
                                    <span class="stat-label">Deceased</span>
                                    <span class="stat-number" id="modal-died">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="data-connector bottom-right">
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card large live-population-box">
                            <div class="data-box-header">
                                <span class="material-icons-outlined">public</span>
                                <div class="pulse-dot"></div> Live Activity
                            </div>
                            <div class="data-box-value" id="modal-live-users">0</div>
                            <div class="data-box-sub">Active users on platform</div>
                        </div>
                    </div>

                    <div class="data-connector left-side">
                        <div class="connector-line"></div>
                        <div class="data-box dashboard-card disease-box">
                            <div class="data-box-header"><span class="material-icons-outlined">coronavirus</span> Disease Statistics</div>
                            <div class="disease-stats-grid">
                                <div class="disease-stat active">
                                    <span class="disease-stat-value" id="stats-active">0</span>
                                    <span class="disease-stat-label">Active</span>
                                </div>
                                <div class="disease-stat recovered">
                                    <span class="disease-stat-value" id="stats-recovered">0</span>
                                    <span class="disease-stat-label">Recovered</span>
                                </div>
                                <div class="disease-stat deceased">
                                    <span class="disease-stat-value" id="stats-deceased">0</span>
                                    <span class="disease-stat-label">Deceased</span>
                                </div>
                            </div>
                            <div class="disease-chart-container">
                                <canvas id="disease-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="popout-center-column">
                        <div class="popout-state-visual" id="modal-state-visual">
                            <!-- SVG Injected Here -->
                        </div>
                        <div class="state-name-overlay" id="modal-state-name">State Name</div>
                        <button class="popout-action-btn centered" id="view-hospitals-btn">
                            <span class="material-icons-outlined">local_hospital</span>
                            View Hospitals
                        </button>
                    </div>
                </div>
            </div>

            <!-- Hospitals List Modal -->
            <div id="hospitals-modal" class="hospitals-modal">
                <div class="hospitals-backdrop"></div>
                <div class="hospitals-content">
                    <div class="hospitals-header">
                        <h2 id="hospitals-title">Hospitals</h2>
                        <button class="hospitals-close"><span class="material-icons-outlined">close</span></button>
                    </div>
                    <div class="hospitals-search">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="hospital-search-input" placeholder="Search hospitals...">
                    </div>
                    <div class="hospitals-list" id="hospitals-list"></div>
                </div>
            </div>
        `;

        if (!document.getElementById('state-popout-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.modal = document.getElementById('state-popout-modal');
        this.hospitalsModal = document.getElementById('hospitals-modal');

        // Close Events
        this.modal.querySelector('.popout-close').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.popout-backdrop').addEventListener('click', () => this.closeModal());

        // Data Box Toggle Logic
        const dataBoxes = this.modal.querySelectorAll('.data-box');
        dataBoxes.forEach(box => {
            box.addEventListener('click', () => {
                // Remove active from all
                dataBoxes.forEach(b => b.classList.remove('active'));
                // Add to clicked
                box.classList.add('active');
            });
        });

        this.hospitalsModal.querySelector('.hospitals-close').addEventListener('click', () => {
            this.hospitalsModal.classList.remove('visible');
        });
        this.hospitalsModal.querySelector('.hospitals-backdrop').addEventListener('click', () => {
            this.hospitalsModal.classList.remove('visible');
        });

        // View Hospitals Click
        document.getElementById('view-hospitals-btn')?.addEventListener('click', () => {
            this.showHospitalsList();
        });
    },

    async loadMapData() {
        try {
            // Show custom loader
            this.container.innerHTML = `
                <div class="map-loader">
                    <div class="spinner"></div>
                    <div class="loading-text">Building Map...</div>
                </div>
            `;

            const response = await fetch('../js/data/india_states.geojson');
            const data = await response.json();

            // Clear loader
            this.container.innerHTML = '';

            this.renderSVG(data);

        } catch (error) {
            console.error('Error loading map data:', error);
            this.container.innerHTML = `<div style="color:red;text-align:center;padding:2rem;">Failed to load map data.</div>`;
        }
    },

    // --- Core SVG Rendering Logic ---
    renderSVG(geoJSON) {
        // 1. Calculate Bounds
        const bounds = this.getBounds(geoJSON);

        // 2. SVG Configuration
        const width = 800;
        const height = 900;
        const padding = 20;

        // 3. Create Projection Function
        // Map geo coordinates (lon, lat) to SVG coordinates (x, y)
        // Simple linear interpolation fitting the bounding box to viewbox
        const project = (lon, lat) => {
            const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (width - 2 * padding) + padding;
            // Latitude Y is inverted in SVG
            const y = height - (((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding) + padding);
            return { x, y };
        };

        // 4. Build SVG Structure
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("class", "india-svg-map");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Filter for Glow Effect
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="lift-shadow" x="-50%" y="-50%" width="200%" height="200%">
               <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
        `;
        svg.appendChild(defs);

        const mapGroup = document.createElementNS(svgNS, "g");
        mapGroup.setAttribute("class", "map-group");
        svg.appendChild(mapGroup);

        // 5. Generate Paths for Features
        geoJSON.features.forEach((feature, index) => {
            const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name || "Unknown";
            const normalizedName = this.normalizeName(rawName);
            const color = this.getColor(normalizedName);

            // Check for Manual Override
            let pathData = this.manualPaths[normalizedName];

            // If no manual override, generate from GeoJSON
            if (!pathData) {
                // If it's a "ladakh" feature but we want to merge it (optional), we could skip
                // But generally we rely on the manual path for the main state to cover it.
                pathData = this.generatePathData(feature.geometry, project);
            }

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", color);
            path.setAttribute("class", "state-path");
            path.setAttribute("data-name", rawName);
            path.setAttribute("id", `state-${index}`);

            // Interaction Events
            path.addEventListener('mouseenter', (e) => this.onStateHover(e, path));
            path.addEventListener('mouseleave', (e) => this.onStateLeave(e, path));
            path.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent map click
                this.onStateClick(feature);
            });

            // Tooltip Logic
            this.addTooltip(path, rawName);

            mapGroup.appendChild(path);
        });

        // Click outside to deselect
        this.container.addEventListener('click', () => {
            this.clearActiveState();
        });

        this.container.appendChild(svg);
    },

    // Calculate Bounding Box of GeoJSON
    getBounds(geoJSON) {
        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

        const processRing = (ring) => {
            ring.forEach(coord => {
                const [lon, lat] = coord;
                if (lon < minLon) minLon = lon;
                if (lat < minLat) minLat = lat;
                if (lon > maxLon) maxLon = lon;
                if (lat > maxLat) maxLat = lat;
            });
        };

        geoJSON.features.forEach(feature => {
            const geom = feature.geometry;
            if (geom.type === 'Polygon') {
                geom.coordinates.forEach(ring => processRing(ring));
            } else if (geom.type === 'MultiPolygon') {
                geom.coordinates.forEach(polygon => {
                    polygon.forEach(ring => processRing(ring));
                });
            }
        });

        return { minLon, minLat, maxLon, maxLat };
    },

    // Convert Geometry to SVG Path String
    generatePathData(geometry, project) {
        const processRing = (ring) => {
            return ring.map((coord, i) => {
                const p = project(coord[0], coord[1]);
                return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            }).join(' ') + 'Z';
        };

        if (geometry.type === 'Polygon') {
            return geometry.coordinates.map(processRing).join(' ');
        } else if (geometry.type === 'MultiPolygon') {
            return geometry.coordinates.map(polygon =>
                polygon.map(processRing).join(' ')
            ).join(' ');
        }
        return '';
    },

    normalizeName(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/\s+/g, ' ')
            .trim();
    },

    getColor(normName) {
        // Fallback or specific logic
        if (normName.includes('jammu')) return this.stateColors['jammu and kashmir'];
        if (normName.includes('nicobar')) return this.stateColors['andaman and nicobar'];
        if (normName.includes('delhi')) return this.stateColors['delhi'];
        if (normName.includes('dadra')) return this.stateColors['dadra and nagar haveli'];

        return this.stateColors[normName] || '#94a3b8'; // Default grey
    },

    // --- Interaction Handlers ---

    activeTooltip: null,

    addTooltip(element, text) {
        element.addEventListener('mousemove', (e) => {
            if (!this.activeTooltip) {
                this.activeTooltip = document.createElement('div');
                this.activeTooltip.className = 'map-tooltip';
                document.body.appendChild(this.activeTooltip);
            }
            this.activeTooltip.innerHTML = text;
            this.activeTooltip.style.display = 'block';
            this.activeTooltip.style.left = e.pageX + 15 + 'px';
            this.activeTooltip.style.top = e.pageY + 15 + 'px';
        });

        element.addEventListener('mouseleave', () => {
            if (this.activeTooltip) {
                this.activeTooltip.style.display = 'none';
            }
        });
    },

    onStateHover(e, path) {
        // Only effect if not active
        if (this.activeState !== path) {
            // Apply simple hover class - CSS handles animation
            path.parentElement.appendChild(path); // Bring to front
        }
    },

    onStateLeave(e, path) {
        // Handled by CSS removal of hover state
    },

    clearActiveState() {
        if (this.activeState) {
            this.activeState.classList.remove('active');
            this.activeState = null;
        }
    },

    onStateClick(feature) {
        // Identify clicked path
        const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name;
        const selector = `.state-path[data-name="${rawName}"]`;
        const path = this.container.querySelector(selector);

        if (!path) return;

        // Toggle Logic
        if (this.activeState && this.activeState !== path) {
            this.activeState.classList.remove('active');
        }

        path.classList.add('active');
        this.activeState = path;

        // Bring active to front
        path.parentElement.appendChild(path);

        // Open Modal Flow
        this.openModal(rawName);
    },

    openModal(stateName) {
        this.modal.classList.add('visible');

        // Update Modal Content
        document.getElementById('modal-state-name').textContent = stateName;

        // Generate State Visual
        this.updateStateVisual(stateName);

        // Animate Numbers
        this.animateNumber('modal-population', 10000000 + Math.random() * 50000000);
        this.animateNumber('modal-live-users', 500 + Math.random() * 5000);
        this.animateNumber('stats-active', 1000 + Math.random() * 5000);
        this.animateNumber('stats-recovered', 8000 + Math.random() * 10000);
        this.animateNumber('stats-deceased', 100 + Math.random() * 500);

        document.getElementById('modal-born').textContent = Math.floor(Math.random() * 500);
        document.getElementById('modal-died').textContent = Math.floor(Math.random() * 200);

        // Reset Active State (Default: Total Population)
        const dataBoxes = this.modal.querySelectorAll('.data-box');
        dataBoxes.forEach(b => b.classList.remove('active'));
        // Set first box (Population) as active by default
        if (dataBoxes[0]) dataBoxes[0].classList.add('active');

        // Start Charts
        this.renderDiseaseChart();
    },

    closeModal() {
        this.modal.classList.remove('visible');
        if (this.hospitalsModal) this.hospitalsModal.classList.remove('visible');

        // Clear activity
        this.clearActiveState();
    },

    updateStateVisual(stateName) {
        // Try to clone the path from the main map to show in modal
        const container = document.getElementById('modal-state-visual');
        container.innerHTML = '';

        // Create a mini SVG for the modal
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 200 200"); // Arbitrary, will need centering
        svg.setAttribute("class", "popout-svg");

        // Find existing path data
        const existingPath = this.container.querySelector(`.state-path[data-name="${stateName}"]`);
        if (existingPath) {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", existingPath.getAttribute("d"));
            path.setAttribute("fill", existingPath.getAttribute("fill"));
            path.setAttribute("class", "state-cutout-path");

            // We need to re-center this path inside the 200x200 viewbox
            // Simplest way: get BBox of path and adjust viewBox
            svg.appendChild(path);
            container.appendChild(svg);

            // Validating BBox requires the element to be in DOM.
            // Since we just appended, we can try to measure.
            try {
                const bbox = existingPath.getBBox();
                svg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
            } catch (e) {
                // Fallback if measurement fails
            }
        }
    },

    animateNumber(id, finalValue) {
        const el = document.getElementById(id);
        if (!el) return;
        const duration = 1500;
        const start = 0;
        const end = Math.floor(finalValue);
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            el.textContent = Math.floor(start + (end - start) * ease).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    },

    renderDiseaseChart() {
        const ctx = document.getElementById('disease-chart').getContext('2d');
        if (this.diseaseChart) this.diseaseChart.destroy();

        if (typeof Chart === 'undefined') return;

        this.diseaseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Recovered', 'Deceased'],
                datasets: [{
                    data: [15, 80, 5],
                    backgroundColor: ['#f97316', '#22c55e', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8' } }
                },
                layout: { padding: 20 },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    },

    showHospitalsList() {
        this.hospitalsModal.classList.add('visible');
        // Mock data population...
        const list = document.getElementById('hospitals-list');
        list.innerHTML = `<div class="loading-hospitals"><div class="spinner"></div>Loading...</div>`;

        setTimeout(() => {
            list.innerHTML = `
                <div style="padding:1rem; color:#64748b; text-align:center;">
                    <p>Demonstration Data</p>
                    <div style="margin-top:10px; text-align:left;">
                        <div style="background:#f1f5f9; padding:15px; margin-bottom:10px; border-radius:10px;">
                            <strong>City General Hospital</strong><br>
                            <span style="font-size:0.9em">Central District • 2.4km away</span>
                        </div>
                        <div style="background:#f1f5f9; padding:15px; margin-bottom:10px; border-radius:10px;">
                            <strong>Apollo Specialty Centre</strong><br>
                            <span style="font-size:0.9em">Tech Park Road • 5.1km away</span>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    IndiaMap.init();
});
