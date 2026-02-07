/**
 * Modern Interactive SVG India Map
 * Clean, elegant map with state hover and click interactions
 * Uses TopoJSON for accurate state boundaries
 */

const IndiaMap = {
    // Map container
    container: null,
    svgElement: null,
    tooltip: null,
    modal: null,

    // State data
    statePopulation: {
        "Andaman and Nicobar": 0.4, "Andhra Pradesh": 53.9, "Arunachal Pradesh": 1.6,
        "Assam": 35.6, "Bihar": 127.0, "Chandigarh": 1.2, "Chhattisgarh": 30.0,
        "Dadra and Nagar Haveli": 0.6, "Daman and Diu": 0.3, "Delhi": 21.0, "Goa": 1.6,
        "Gujarat": 71.0, "Haryana": 30.0, "Himachal Pradesh": 7.5, "Jammu and Kashmir": 14.0,
        "Jharkhand": 40.0, "Karnataka": 69.0, "Kerala": 35.7, "Ladakh": 0.3,
        "Lakshadweep": 0.07, "Madhya Pradesh": 87.0, "Maharashtra": 128.0, "Manipur": 3.2,
        "Meghalaya": 3.8, "Mizoram": 1.3, "Nagaland": 2.3, "Odisha": 47.0, "Orissa": 47.0,
        "Puducherry": 1.7, "Punjab": 31.0, "Rajasthan": 82.0, "Sikkim": 0.7,
        "Tamil Nadu": 78.0, "Telangana": 39.0, "Tripura": 4.2, "Uttar Pradesh": 235.0,
        "Uttarakhand": 11.5, "Uttaranchal": 11.5, "West Bengal": 101.0, "NCT of Delhi": 21.0
    },

    stateHospitalRatings: {
        "Andhra Pradesh": 4.1, "Arunachal Pradesh": 3.2, "Assam": 3.5, "Bihar": 3.0,
        "Chhattisgarh": 3.4, "Delhi": 4.3, "NCT of Delhi": 4.3, "Goa": 4.5, "Gujarat": 4.2,
        "Haryana": 3.8, "Himachal Pradesh": 4.0, "Jammu and Kashmir": 3.6, "Jharkhand": 3.2,
        "Karnataka": 4.4, "Kerala": 4.6, "Madhya Pradesh": 3.5, "Maharashtra": 4.3,
        "Manipur": 3.3, "Meghalaya": 3.4, "Mizoram": 3.5, "Nagaland": 3.2, "Odisha": 3.6,
        "Orissa": 3.6, "Punjab": 4.0, "Rajasthan": 3.7, "Sikkim": 3.8, "Tamil Nadu": 4.5,
        "Telangana": 4.2, "Tripura": 3.4, "Uttar Pradesh": 3.3, "Uttarakhand": 3.9,
        "Uttaranchal": 3.9, "West Bengal": 3.8, "Ladakh": 3.0
    },

    // Unique colors for each state (pastel/soft tones)
    stateColors: {
        "Jammu and Kashmir": "#a8d5ba", "Himachal Pradesh": "#ffd6a5", "Punjab": "#fdffb6",
        "Chandigarh": "#caffbf", "Uttarakhand": "#9bf6ff", "Uttaranchal": "#9bf6ff",
        "Haryana": "#a0c4ff", "Delhi": "#bdb2ff", "NCT of Delhi": "#bdb2ff",
        "Rajasthan": "#ffc6ff", "Uttar Pradesh": "#ffadad", "Bihar": "#ffd6a5",
        "Sikkim": "#caffbf", "Arunachal Pradesh": "#9bf6ff", "Nagaland": "#a0c4ff",
        "Manipur": "#bdb2ff", "Mizoram": "#ffc6ff", "Tripura": "#ffadad",
        "Meghalaya": "#fdffb6", "Assam": "#a8d5ba", "West Bengal": "#ffd6a5",
        "Jharkhand": "#caffbf", "Odisha": "#9bf6ff", "Orissa": "#9bf6ff",
        "Chhattisgarh": "#a0c4ff", "Madhya Pradesh": "#bdb2ff", "Gujarat": "#ffc6ff",
        "Daman and Diu": "#ffadad", "Dadra and Nagar Haveli": "#fdffb6",
        "Maharashtra": "#a8d5ba", "Andhra Pradesh": "#ffd6a5", "Karnataka": "#caffbf",
        "Goa": "#9bf6ff", "Lakshadweep": "#a0c4ff", "Kerala": "#bdb2ff",
        "Tamil Nadu": "#ffc6ff", "Puducherry": "#ffadad", "Andaman and Nicobar": "#fdffb6",
        "Telangana": "#a8d5ba", "Ladakh": "#e8f4f8"
    },

    // Short names for state labels
    stateShortNames: {
        "Andaman and Nicobar": "A&N", "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR",
        "Assam": "AS", "Bihar": "BR", "Chandigarh": "CH", "Chhattisgarh": "CG",
        "Dadra and Nagar Haveli": "DNH", "Daman and Diu": "DD", "Delhi": "DL",
        "NCT of Delhi": "DL", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
        "Himachal Pradesh": "HP", "Jammu and Kashmir": "JK", "Jharkhand": "JH",
        "Karnataka": "KA", "Kerala": "KL", "Lakshadweep": "LD", "Madhya Pradesh": "MP",
        "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML", "Mizoram": "MZ",
        "Nagaland": "NL", "Odisha": "OD", "Orissa": "OD", "Puducherry": "PY",
        "Punjab": "PB", "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN",
        "Telangana": "TS", "Tripura": "TR", "Uttar Pradesh": "UP",
        "Uttarakhand": "UK", "Uttaranchal": "UK", "West Bengal": "WB", "Ladakh": "LA"
    },

    // Initialize the map
    async init() {
        console.log('[IndiaMap] Initializing...');

        this.container = document.getElementById('india-map');
        if (!this.container) {
            console.error('[IndiaMap] Container not found');
            return;
        }

        // Create tooltip
        this.createTooltip();

        // Create modal for state details
        this.createModal();

        // Load and render the map
        await this.loadMap();

        console.log('[IndiaMap] Initialized successfully');
    },

    // Create floating tooltip
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'india-map-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: #113841;
            color: #86efac;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            white-space: nowrap;
        `;
        document.body.appendChild(this.tooltip);
    },

    // Create modal for state details
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'state-detail-modal';
        this.modal.className = 'state-detail-modal';
        this.modal.innerHTML = `
            <div class="modal-backdrop" onclick="IndiaMap.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="state-cutout-container">
                        <svg id="state-cutout-svg" viewBox="0 0 200 200"></svg>
                    </div>
                    <div class="state-info">
                        <h2 id="modal-state-name">State Name</h2>
                        <p class="state-subtitle">State of India</p>
                    </div>
                    <button class="modal-close" onclick="IndiaMap.closeModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="stat-card population">
                        <span class="material-icons-outlined">groups</span>
                        <div class="stat-content">
                            <span class="stat-label">Population (2024 Est.)</span>
                            <span class="stat-value" id="modal-population">--</span>
                        </div>
                    </div>
                    <div class="stat-card live-stats">
                        <div class="live-indicator">
                            <span class="pulse"></span>
                            LIVE
                        </div>
                        <div class="live-grid">
                            <div class="live-item">
                                <span class="live-value" id="modal-births">--</span>
                                <span class="live-label">👶 Born Today</span>
                            </div>
                            <div class="live-item">
                                <span class="live-value deaths" id="modal-deaths">--</span>
                                <span class="live-label">☠️ Deaths Today</span>
                            </div>
                            <div class="live-item">
                                <span class="live-value alive" id="modal-alive">--</span>
                                <span class="live-label">🧍 Alive Now</span>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card rating">
                        <span class="material-icons-outlined">local_hospital</span>
                        <div class="stat-content">
                            <span class="stat-label">Avg. Hospital Rating</span>
                            <div class="rating-display">
                                <span class="stat-value" id="modal-rating">--</span>
                                <span class="stars" id="modal-stars">★★★★☆</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="#" id="modal-hospitals-link" class="btn-primary">
                        <span class="material-icons-outlined">local_hospital</span>
                        View All Hospitals
                    </a>
                    <button class="btn-secondary" onclick="IndiaMap.closeModal()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    },

    // Load map from TopoJSON
    async loadMap() {
        try {
            // Use India states TopoJSON
            const response = await fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson');
            const geoJSON = await response.json();

            this.renderSVGMap(geoJSON);
        } catch (error) {
            console.error('[IndiaMap] Failed to load map:', error);
            this.container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">
                    <span class="material-icons-outlined" style="margin-right:8px;">error</span>
                    Failed to load map
                </div>
            `;
        }
    },

    // Render SVG map from GeoJSON
    renderSVGMap(geoJSON) {
        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        geoJSON.features.forEach(feature => {
            const coords = this.getAllCoords(feature.geometry);
            coords.forEach(([lon, lat]) => {
                minX = Math.min(minX, lon);
                maxX = Math.max(maxX, lon);
                minY = Math.min(minY, lat);
                maxY = Math.max(maxY, lat);
            });
        });

        // Add padding
        const padding = 2;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;

        const width = 500;
        const height = 600;

        // Scale function
        const scaleX = (lon) => ((lon - minX) / (maxX - minX)) * width;
        const scaleY = (lat) => height - ((lat - minY) / (maxY - minY)) * height;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('class', 'india-svg-map');
        svg.style.cssText = 'width: 100%; height: 100%; max-height: 700px;';

        // Add defs for filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
            </filter>
        `;
        svg.appendChild(defs);

        // Create group for states
        const statesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        statesGroup.setAttribute('class', 'states-group');

        // Render each state
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'labels-group');

        geoJSON.features.forEach(feature => {
            const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || 'Unknown';
            const pathData = this.geoToPath(feature.geometry, scaleX, scaleY);

            if (!pathData) return;

            // Get state color
            const stateColor = this.stateColors[stateName] || '#f0f0f0';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'state-path');
            path.setAttribute('data-state', stateName);
            path.setAttribute('data-original-path', pathData);
            path.setAttribute('data-color', stateColor);
            path.style.fill = stateColor;

            // Mouse events
            path.addEventListener('mouseenter', (e) => this.onStateHover(e, stateName, path));
            path.addEventListener('mousemove', (e) => this.moveTooltip(e));
            path.addEventListener('mouseleave', () => this.onStateLeave(path));
            path.addEventListener('click', () => this.onStateClick(stateName, pathData, stateColor));

            statesGroup.appendChild(path);

            // Calculate center of state for label
            const coords = this.getAllCoords(feature.geometry);
            if (coords.length > 0) {
                let sumX = 0, sumY = 0;
                coords.forEach(([lon, lat]) => {
                    sumX += scaleX(lon);
                    sumY += scaleY(lat);
                });
                const centerX = sumX / coords.length;
                const centerY = sumY / coords.length;

                // Create label
                const shortName = this.stateShortNames[stateName] || stateName.substring(0, 2).toUpperCase();
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', centerX);
                label.setAttribute('y', centerY);
                label.setAttribute('class', 'state-label');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('dominant-baseline', 'middle');
                label.textContent = shortName;
                labelGroup.appendChild(label);
            }
        });

        svg.appendChild(statesGroup);
        svg.appendChild(labelGroup);

        // Clear container and add SVG
        this.container.innerHTML = '';
        this.container.appendChild(svg);
        this.svgElement = svg;
    },

    // Get all coordinates from geometry
    getAllCoords(geometry) {
        const coords = [];
        const extract = (arr) => {
            if (typeof arr[0] === 'number') {
                coords.push(arr);
            } else {
                arr.forEach(extract);
            }
        };
        if (geometry.coordinates) {
            extract(geometry.coordinates);
        }
        return coords;
    },

    // Convert GeoJSON geometry to SVG path
    geoToPath(geometry, scaleX, scaleY) {
        let path = '';

        const renderRing = (ring) => {
            return ring.map((coord, i) => {
                const x = scaleX(coord[0]);
                const y = scaleY(coord[1]);
                return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ') + ' Z';
        };

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach(ring => {
                path += renderRing(ring) + ' ';
            });
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    path += renderRing(ring) + ' ';
                });
            });
        }

        return path.trim();
    },

    // Hover events
    onStateHover(e, stateName, path) {
        // Highlight state
        path.classList.add('hovered');

        // Show tooltip
        this.tooltip.textContent = stateName;
        this.tooltip.style.opacity = '1';
        this.moveTooltip(e);
    },

    moveTooltip(e) {
        this.tooltip.style.left = (e.clientX + 15) + 'px';
        this.tooltip.style.top = (e.clientY - 10) + 'px';
    },

    onStateLeave(path) {
        path.classList.remove('hovered');
        this.tooltip.style.opacity = '0';
    },

    // Click to show state details
    onStateClick(stateName, pathData, stateColor) {
        const population = this.statePopulation[stateName] || 50;
        const rating = this.stateHospitalRatings[stateName] || 3.5;

        // Update modal content
        document.getElementById('modal-state-name').textContent = stateName;
        document.getElementById('modal-population').textContent = population.toFixed(1) + ' Million';
        document.getElementById('modal-rating').textContent = rating.toFixed(1);
        document.getElementById('modal-stars').textContent = this.getStars(rating);
        document.getElementById('modal-hospitals-link').href = `hospitals.html?state=${encodeURIComponent(stateName)}`;

        // Render state cutout with its color
        this.renderStateCutout(pathData, stateColor);

        // Start live counter
        this.startLiveCounter(population);

        // Show modal
        this.modal.classList.add('visible');
    },

    // Render state cutout in modal
    renderStateCutout(pathData, stateColor = '#113841') {
        const cutoutSvg = document.getElementById('state-cutout-svg');

        // Parse path to get bounds
        const coords = pathData.match(/[\d.]+,[\d.]+/g) || [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        coords.forEach(coord => {
            const [x, y] = coord.split(',').map(Number);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const padding = 10;
        const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

        cutoutSvg.setAttribute('viewBox', viewBox);
        cutoutSvg.innerHTML = `
            <path d="${pathData}" fill="${stateColor}" stroke="#113841" stroke-width="2"/>
        `;
    },

    // Get star rating display
    getStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    // Live population counter
    liveInterval: null,
    startLiveCounter(populationMillions) {
        if (this.liveInterval) clearInterval(this.liveInterval);

        const basePopulation = populationMillions * 1000000;
        const birthRate = 17.0 / 1000;
        const deathRate = 7.3 / 1000;
        const secondsPerYear = 365.25 * 24 * 60 * 60;

        const birthsPerSecond = (basePopulation * birthRate) / secondsPerYear;
        const deathsPerSecond = (basePopulation * deathRate) / secondsPerYear;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const secondsSinceMidnight = (now - todayStart) / 1000;

        let bornToday = Math.floor(birthsPerSecond * secondsSinceMidnight);
        let deathsToday = Math.floor(deathsPerSecond * secondsSinceMidnight);
        let aliveNow = basePopulation + bornToday - deathsToday;

        const update = () => {
            if (Math.random() > 0.4) bornToday += Math.floor(Math.random() * 3);
            if (Math.random() > 0.6) deathsToday += Math.floor(Math.random() * 2);
            aliveNow = basePopulation + bornToday - deathsToday;

            const birthsEl = document.getElementById('modal-births');
            const deathsEl = document.getElementById('modal-deaths');
            const aliveEl = document.getElementById('modal-alive');

            if (birthsEl) birthsEl.textContent = bornToday.toLocaleString();
            if (deathsEl) deathsEl.textContent = deathsToday.toLocaleString();
            if (aliveEl) aliveEl.textContent = this.formatNumber(aliveNow);
        };

        update();
        this.liveInterval = setInterval(update, 1000);
    },

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    },

    closeModal() {
        this.modal.classList.remove('visible');
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
            this.liveInterval = null;
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IndiaMap.init());
} else {
    IndiaMap.init();
}
