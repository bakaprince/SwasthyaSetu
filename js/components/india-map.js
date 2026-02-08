/**
 * Modern Interactive India Map (ECharts Version)
 * Features: 3D "Lift" Effect, Vibrant Colors, Full J&K Boundary
 */

const IndiaMap = {
    chart: null,
    modal: null,
    hospitalsModal: null,
    diseaseChart: null,
    liveInterval: null,
    currentState: null,

    // Vibrant Modern Color Palette for States
    stateColors: {
        "Jammu and Kashmir": "#4ade80", "Ladakh": "#2dd4bf", "Himachal Pradesh": "#38bdf8",
        "Punjab": "#facc15", "Uttarakhand": "#a78bfa", "Haryana": "#fb923c",
        "Rajasthan": "#f472b6", "Uttar Pradesh": "#818cf8", "Bihar": "#34d399",
        "Sikkim": "#fb7185", "West Bengal": "#22d3ee", "Assam": "#a3e635",
        "Arunachal Pradesh": "#60a5fa", "Nagaland": "#c084fc", "Manipur": "#f87171",
        "Mizoram": "#e879f9", "Tripura": "#4ade80", "Meghalaya": "#2dd4bf",
        "Jharkhand": "#fbbf24", "Odisha": "#f43f5e", "Chhattisgarh": "#a78bfa",
        "Madhya Pradesh": "#60a5fa", "Gujarat": "#fb923c", "Maharashtra": "#818cf8",
        "Andhra Pradesh": "#34d399", "Telangana": "#f472b6", "Karnataka": "#22d3ee",
        "Goa": "#facc15", "Kerala": "#f87171", "Tamil Nadu": "#a3e635",
        "Delhi": "#ef4444", "Puducherry": "#8b5cf6"
    },

    // State Population Data (Projected)
    statePopulation: {
        "Andaman and Nicobar": 0.4, "Andhra Pradesh": 53.9, "Arunachal Pradesh": 1.6,
        "Assam": 35.6, "Bihar": 127.0, "Chandigarh": 1.2, "Chhattisgarh": 30.0,
        "Dadra and Nagar Haveli": 0.6, "Daman and Diu": 0.3, "Delhi": 21.0, "Goa": 1.6,
        "Gujarat": 71.0, "Haryana": 30.0, "Himachal Pradesh": 7.5, "Jammu and Kashmir": 14.0,
        "Jharkhand": 40.0, "Karnataka": 69.0, "Kerala": 35.7, "Ladakh": 0.3,
        "Lakshadweep": 0.07, "Madhya Pradesh": 87.0, "Maharashtra": 128.0, "Manipur": 3.2,
        "Meghalaya": 3.8, "Mizoram": 1.3, "Nagaland": 2.3, "Odisha": 47.0, "Puducherry": 1.7,
        "Punjab": 31.0, "Rajasthan": 82.0, "Sikkim": 0.7, "Tamil Nadu": 78.0,
        "Telangana": 39.0, "Tripura": 4.2, "Uttar Pradesh": 235.0, "Uttarakhand": 11.5,
        "West Bengal": 101.0
    },

    // Mock Disease Data
    diseaseRates: {
        "COVID-19": { active: 80, recovered: 400, deceased: 60 },
        "Dengue": { active: 40, recovered: 150, deceased: 15 },
        "Malaria": { active: 35, recovered: 120, deceased: 18 },
        "Typhoid": { active: 25, recovered: 90, deceased: 10 },
        "Tuberculosis": { active: 100, recovered: 300, deceased: 50 },
        "Diabetes": { active: 150, recovered: 500, deceased: 80 },
        "Lung Disease": { active: 70, recovered: 200, deceased: 45 },
        "Heart Disease": { active: 120, recovered: 350, deceased: 95 }
    },

    async init() {
        console.log('[IndiaMap] Initializing ECharts map...');
        const container = document.getElementById('india-map');
        if (!container) return;

        // Initialize ECharts instance
        this.chart = echarts.init(container, null, { renderer: 'canvas' });

        // Show loading
        this.chart.showLoading({
            text: 'Loading 3D Map...',
            color: '#86efac',
            textColor: '#113841',
            maskColor: 'rgba(255, 255, 255, 0.8)'
        });

        // Initialize Modals
        this.createModal();
        this.createHospitalsModal();
        this.createTooltip();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (this.chart) this.chart.resize();
        });

        await this.loadMapData();
    },

    async loadMapData() {
        try {
            // Fetch GeoJSON with full J&K boundaries (PoK + Aksai Chin)
            // Using a reliable source for full India map
            const response = await fetch('../js/data/india_states.geojson');
            if (!response.ok) throw new Error("Failed to load map data");

            const geoJSON = await response.json();

            // Register map
            echarts.registerMap('india', geoJSON);
            this.renderMap(geoJSON);

            this.chart.hideLoading();

        } catch (error) {
            console.error('[IndiaMap] Error:', error);
            this.chart.hideLoading();
            // Fallback or error message
            document.getElementById('india-map').innerHTML = `
                <div class="flex items-center justify-center h-full text-red-500">
                    <p>Failed to load map data. Please check connection.</p>
                </div>
            `;
        }
    },

    renderMap(geoJSON) {
        const isDark = document.documentElement.classList.contains('dark');

        // Helper to normalize names for reliable matching
        const normalizeName = (name) => {
            if (!name) return '';
            return name.toLowerCase()
                .replace(/&/g, 'and')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // Create color map with normalized keys
        const normalizedColors = {};
        Object.keys(this.stateColors).forEach(key => {
            normalizedColors[normalizeName(key)] = this.stateColors[key];
        });

        // Prepare data for visual map (assigning colors)
        const data = geoJSON.features.map(feature => {
            // Try multiple property fields for name
            const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name || feature.properties.NAME;
            const normName = normalizeName(rawName);

            // Find color match
            let color = '#94a3b8'; // Default grey
            // Direct match
            if (normalizedColors[normName]) {
                color = normalizedColors[normName];
            } else {
                // Try fuzzy match or known aliases
                // Example: "odisha" vs "orissa", "uttaranchal" vs "uttarakhand"
                if (normName.includes('jammu')) color = normalizedColors['jammu and kashmir'];
                else if (normName.includes('nicobar')) color = normalizedColors['andaman and nicobar'];
                else if (normName.includes('delhi')) color = normalizedColors['delhi'];
                else if (normName.includes('dadra')) color = normalizedColors['dadra and nagar haveli'];
            }

            console.log(`State: ${rawName} -> Normalized: ${normName} -> Color: ${color}`);

            return {
                name: rawName, // Keep original name for tooltip/display
                itemStyle: {
                    areaColor: color,
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    // Flat initially (no shadow)
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0
                }
            };
        });

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    return `<div style="font-weight:bold; font-size:14px; color: #fff;">${params.name}</div>
                            <div style="font-size:12px; color: #ddd;">Click for details</div>`;
                },
                backgroundColor: 'rgba(17, 56, 65, 0.9)',
                borderColor: '#86efac',
                textStyle: { color: '#fff' }
            },
            geo: {
                map: 'india',
                roam: true, // Enable Zoom/Pan
                zoom: 1.2,
                label: {
                    show: false
                },
                itemStyle: {
                    // Base Flat Style
                    areaColor: '#e2e8f0', // Placeholder, overridden by series data
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0
                },
                emphasis: {
                    // "Cake Piece" Lift Effect on Hover
                    label: { show: true, color: '#fff', fontSize: 14, fontWeight: 'bold' },
                    itemStyle: {
                        // Strong shadow creates floating illusion
                        shadowBlur: 25,
                        shadowOffsetX: 10,
                        shadowOffsetY: 15,
                        shadowColor: 'rgba(0,0,0,0.6)',
                        borderWidth: 2,
                        borderColor: '#fff',
                        // Slightly lighten the color to indicate interaction
                        opacity: 0.9
                    }
                },
                select: {
                    itemStyle: {
                        areaColor: '#fbbf24', // Gold on select
                        shadowBlur: 15,
                        shadowOffsetX: 5,
                        shadowOffsetY: 8
                    },
                    label: { show: true, color: '#000' }
                }
            },
            series: [{
                type: 'map',
                map: 'india',
                geoIndex: 0, // Bind to the configured geo component
                data: data
            }]
        };

        this.chart.setOption(option);

        // Click Event
        this.chart.on('click', (params) => {
            this.onStateClick(params.name);
        });
    },

    // --- Modal & Data Logic (Ported from previous version) ---

    createTooltip() { /* Removed custom tooltip logic as ECharts handles it, but keeping structure if needed */ },

    createModal() {
        // Reuse existing modal structure, ensure it's in DOM if not already
        if (document.getElementById('state-detail-modal')) return;

        // ... (Referencing the exact HTML structure from the previous file for consistency)
        this.modal = document.createElement('div');
        this.modal.id = 'state-detail-modal';
        this.modal.className = 'state-popout-modal';
        // Populate innerHTML same as before to maintain functionalities
        this.modal.innerHTML = `
            <div class="popout-backdrop" onclick="IndiaMap.closeModal()"></div>
            <div class="popout-container">
                <button class="popout-close" onclick="IndiaMap.closeModal()">
                    <span class="material-icons-outlined">close</span>
                </button>
                <div class="popout-center-column">
                    <div class="popout-state-visual">
                        <div id="popout-state-icon" style="font-size: 100px; color: white;">🏛️</div>
                    </div>
                    <div class="state-name-overlay" id="popout-state-name">State Name</div>
                    <button onclick="IndiaMap.showHospitals()" class="popout-action-btn centered">
                        <span class="material-icons-outlined">local_hospital</span>
                        View All Hospitals
                    </button>
                </div>
                <div class="data-connector top-right">
                    <div class="connector-line"></div>
                    <div class="data-box live-population-box large">
                        <div class="data-box-header"><span class="pulse-dot"></span> Live Population</div>
                        <div class="data-box-value large" id="popout-live-pop">--</div>
                        <div class="data-box-sub-grid">
                            <div class="stat-row born"><span class="material-icons-outlined">trending_up</span> <span id="popout-born">0</span></div>
                            <div class="stat-row died"><span class="material-icons-outlined">trending_down</span> <span id="popout-died">0</span></div>
                        </div>
                    </div>
                </div>
                <div class="data-connector left-side">
                    <div class="connector-line"></div>
                    <div class="data-box disease-box">
                        <div class="data-box-header"><span class="material-icons-outlined">coronavirus</span> Disease Statistics</div>
                        <div class="disease-stats-grid">
                            <div class="disease-stat active"><span class="disease-stat-value" id="popout-active">--</span><span class="disease-stat-label">ACTIVE</span></div>
                            <div class="disease-stat recovered"><span class="disease-stat-value" id="popout-recovered">--</span><span class="disease-stat-label">RECOVERED</span></div>
                            <div class="disease-stat deceased"><span class="disease-stat-value" id="popout-deceased">--</span><span class="disease-stat-label">DECEASED</span></div>
                        </div>
                        <div class="disease-chart-container"><canvas id="popout-disease-chart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    },

    createHospitalsModal() {
        if (document.getElementById('hospitals-list-modal')) {
            this.hospitalsModal = document.getElementById('hospitals-list-modal');
            return;
        }
        this.hospitalsModal = document.createElement('div');
        this.hospitalsModal.id = 'hospitals-list-modal';
        this.hospitalsModal.className = 'hospitals-modal';
        this.hospitalsModal.innerHTML = `
            <div class="hospitals-backdrop" onclick="IndiaMap.closeHospitals()"></div>
            <div class="hospitals-content">
                <div class="hospitals-header">
                    <h2 id="hospitals-title">Hospitals</h2>
                    <button class="hospitals-close" onclick="IndiaMap.closeHospitals()"><span class="material-icons-outlined">close</span></button>
                </div>
                <div class="hospitals-search">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="hospital-search" placeholder="Search hospitals..." oninput="IndiaMap.filterHospitals()">
                </div>
                <div class="hospitals-list" id="hospitals-list"></div>
            </div>
        `;
        document.body.appendChild(this.hospitalsModal);
    },

    onStateClick(stateName) {
        this.currentState = stateName;
        // In the ECharts version, we don't do the complex SVG cutout animation for now
        // sticking to opening the modal with data to ensure performance and reliability
        const modal = document.getElementById('state-detail-modal');
        if (!modal) this.createModal();

        document.getElementById('state-detail-modal').classList.add('visible');
        document.getElementById('popout-state-name').textContent = stateName;

        // Random population simulation
        const pop = this.statePopulation[stateName] || 10;
        this.startLiveCounter(pop);
        this.calculateDiseaseStats(pop);
        this.createGroupedDiseaseChart(pop);
    },

    calculateDiseaseStats(populationMillions) {
        let totalActive = 0, totalRecovered = 0, totalDeceased = 0;
        Object.values(this.diseaseRates).forEach(rate => {
            totalActive += Math.floor((rate.active + (Math.random() - 0.5) * rate.active * 0.3) * populationMillions);
            totalRecovered += Math.floor((rate.recovered + (Math.random() - 0.5) * rate.recovered * 0.2) * populationMillions);
            totalDeceased += Math.floor((rate.deceased + (Math.random() - 0.5) * rate.deceased * 0.3) * populationMillions);
        });
        document.getElementById('popout-active').textContent = this.formatNumber(totalActive);
        document.getElementById('popout-recovered').textContent = this.formatNumber(totalRecovered);
        document.getElementById('popout-deceased').textContent = this.formatNumber(totalDeceased);
    },

    createGroupedDiseaseChart(populationMillions) {
        const ctx = document.getElementById('popout-disease-chart');
        if (this.diseaseChart) this.diseaseChart.destroy();

        const diseases = Object.keys(this.diseaseRates);
        const active = diseases.map(d => this.diseaseRates[d].active * populationMillions);

        this.diseaseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diseases,
                datasets: [{ label: 'Cases', data: active, backgroundColor: '#86efac' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    },

    startLiveCounter(populationMillions) {
        if (this.liveInterval) clearInterval(this.liveInterval);
        let current = populationMillions * 1000000;
        const update = () => {
            current += Math.floor(Math.random() * 5) - Math.floor(Math.random() * 2);
            document.getElementById('popout-live-pop').textContent = current.toLocaleString();
        };
        update();
        this.liveInterval = setInterval(update, 1000);
    },

    closeModal() {
        document.getElementById('state-detail-modal').classList.remove('visible');
        if (this.liveInterval) clearInterval(this.liveInterval);
    },

    showHospitals() {
        document.getElementById('hospitals-list-modal').classList.add('visible');
        document.getElementById('hospitals-title').textContent = `Hospitals in ${this.currentState}`;
        this.fetchHospitals(this.currentState);
    },

    closeHospitals() {
        document.getElementById('hospitals-list-modal').classList.remove('visible');
    },

    async fetchHospitals(state) {
        // ... (Reuse existing logic or simplified mock)
        document.getElementById('hospitals-list').innerHTML = '<div style="padding:20px; text-align:center;">Loading hospitals...</div>';
        // Simulating fetch delay
        setTimeout(() => {
            document.getElementById('hospitals-list').innerHTML = `
                <div class="hospital-card" style="padding:15px; border-bottom:1px solid #eee;">
                    <h3>Checkup Center - ${state}</h3>
                    <p>Main District Road, ${state}</p>
                </div>
                 <div class="hospital-card" style="padding:15px; border-bottom:1px solid #eee;">
                    <h3>City General Hospital</h3>
                    <p>Civil Lines, ${state}</p>
                </div>
            `;
        }, 1000);
    },

    filterHospitals() { /* Implement filter logic */ },

    formatNumber(num) {
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IndiaMap.init());
} else {
    IndiaMap.init();
}
