/**
 * Government Dashboard Analytics
 * Handles Disease Heatmap, Performance Charts, and Crisis Alerts
 */

const GovAnalytics = {
    map: null,
    heatLayer: null,
    charts: {},

    async init() {
        console.log('Initializing Gov Analytics...');

        // Auth check is handled in HTML to avoid race conditions
        // if (!AuthService.isAuthenticated()) { ... }

        // Initialize Components
        this.initMap();
        this.initCharts();

        // Load Data
        await Promise.all([
            this.loadDiseaseMap(),
            this.loadOutcomes(),
            this.loadHospitalPerformance(),
            this.loadAlerts()
        ]);

        // Setup Interval for Real-time alerts (every 60s)
        setInterval(() => this.loadAlerts(), 60000);
    },

    // --- LEAFLET MAP ---
    initMap() {
        // Center on India with constrained bounds
        const southWest = L.latLng(5.0, 60.0);
        const northEast = L.latLng(40.0, 100.0);
        const bounds = L.latLngBounds(southWest, northEast);

        this.map = L.map('india-map', {
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
            minZoom: 4
        }).setView([22.5937, 78.9629], 5);

        // Dark Mode Tile Layer
        const isDark = document.documentElement.classList.contains('dark');
        const tileUrl = isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
            attribution: '&copy; CARTO',
            maxZoom: 10
        }).addTo(this.map);
    },

    async loadDiseaseMap() {
        try {
            const response = await fetch(`${apiBaseUrl}/analytics/disease-map`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            if (result.success && result.data) {
                // 1. Heatmap Layer
                const heatData = result.data.map(d => [
                    d.lat,
                    d.lng,
                    d.count > 50 ? 1 : (d.count / 50)
                ]);

                if (this.heatLayer) this.map.removeLayer(this.heatLayer);

                this.heatLayer = L.heatLayer(heatData, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 10,
                    gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
                }).addTo(this.map);

                // 2. Add Markers for "Live" Data feel (High Severity Clusters)
                // Filter for cities with significant cases
                result.data.forEach(d => {
                    if (d.count > 10) {
                        const color = d.disease === 'COVID-19' ? '#EF4444' :
                            d.disease === 'Dengue' ? '#F59E0B' : '#10B981';

                        L.circleMarker([d.lat, d.lng], {
                            radius: Math.min(d.count / 2, 20), // Size based on count
                            fillColor: color,
                            color: '#fff',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.7
                        })
                            .bindPopup(`
                            <div class="text-xs font-sans">
                                <strong class="text-sm block mb-1">${d.city}</strong>
                                <span class="uppercase font-bold text-gray-500 text-[10px]">${d.disease}</span><br/>
                                <span class="font-bold text-lg ${d.count > 30 ? 'text-red-600' : 'text-orange-500'}">${d.count} Cases</span>
                                <div class="mt-1 text-[10px] text-gray-400">Live Report</div>
                            </div>
                        `)
                            .addTo(this.map);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load map data:', error);
        }
    },

    // --- CHART.JS ---
    initCharts() {
        // Common Chart Options
        const commonOptions = {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        };

        // Outcome Chart
        // Check if element exists first to avoid errors
        const outcomeCanvas = document.getElementById('outcomeChart');
        if (outcomeCanvas) {
            const ctxOutcome = outcomeCanvas.getContext('2d');
            this.charts.outcome = new Chart(ctxOutcome, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Recovered', 'Deceased'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
                        borderWidth: 0
                    }]
                },
                options: commonOptions
            });
        }

        // Performance Chart
        const ctxPerf = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(ctxPerf, {
            type: 'bar',
            data: {
                labels: ['5★', '4★', '3★', '2★', '1★'],
                datasets: [{
                    label: 'Hospital Ratings',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#86efac',
                    borderRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    async loadOutcomes() {
        try {
            const response = await fetch(`${apiBaseUrl}/analytics/outcomes`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            if (result.success && result.data) {
                this.charts.outcome.data.datasets[0].data = [
                    result.data.active || 0,
                    result.data.recovered || 0,
                    result.data.deceased || 0
                ];
                this.charts.outcome.update();
            }
        } catch (error) {
            console.error('Error outcomes:', error);
        }
    },

    async loadHospitalPerformance() {
        try {
            const response = await fetch(`${apiBaseUrl}/analytics/hospital-performance`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            if (result.success && result.data) {
                const r = result.data.ratings;
                this.charts.performance.data.datasets[0].data = [
                    r['5_star'], r['4_star'], r['3_star'], r['2_star'], r['1_star']
                ];
                this.charts.performance.update();
            }
        } catch (error) {
            console.error('Error performance:', error);
        }
    },

    // --- ALERTS ---
    async loadAlerts() {
        try {
            const response = await fetch(`${apiBaseUrl}/analytics/alerts`, {
                headers: { 'Authorization': `Bearer ${AuthService.getToken()}` }
            });
            const result = await response.json();

            const banner = document.getElementById('crisis-banner');
            const container = document.getElementById('alert-messages');

            if (result.success && result.count > 0) {
                banner.classList.remove('hidden');
                container.innerHTML = result.data.map(alert =>
                    `<p><strong>${alert.location}</strong>: ${alert.message}</p>`
                ).join('');
            } else {
                banner.classList.add('hidden');
            }
        } catch (error) {
            console.warn('Alert check failed');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GovAnalytics.init();
});
