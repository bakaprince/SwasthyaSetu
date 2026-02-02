let allHospitals = [];
let userLocation = null;

// Load hospitals on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize auth service
    AuthService.init();

    // Try to get location first to sort by distance
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (e) {
            console.log("Auto-location failed of ignored");
        }
    }

    await loadHospitals();
    setupFilters();
    setupLocationButton();
    setupLogout();

    // Initialize Navigation (for emergency modal)
    if (typeof Navigation !== 'undefined') {
        new Navigation();
    }
});

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await AuthService.logout();
            Helpers.showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        });
    }
}

function setupLocationButton() {
    const btn = document.getElementById('use-location-btn');
    if (btn) {
        btn.addEventListener('click', async () => {
            btn.innerHTML = '<span class="material-icons-outlined animate-spin">refresh</span> Locating...';

            if (!navigator.geolocation) {
                Helpers.showToast('Geolocation is not supported by your browser', 'error');
                btn.innerHTML = '<span class="material-icons-outlined">my_location</span> Use Current Location';
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                btn.innerHTML = '<span class="material-icons-outlined text-green-600">check_circle</span> Nearby Hospitals';
                btn.classList.add('bg-green-50', 'border-green-200', 'text-green-700');

                // Show loading state in list
                document.getElementById('hospitals-list').innerHTML = '<p class="text-center text-blue-500 py-8"><span class="material-icons-outlined animate-spin text-3xl block mb-2">public</span>Searching nearby hospitals from global network...</p>';

                // Fetch from Overpass
                const osmHospitals = await fetchHospitalsFromOverpassAPI(userLocation.latitude, userLocation.longitude);

                if (osmHospitals.length > 0) {
                    allHospitals = osmHospitals;
                    displayHospitals(allHospitals);
                    Helpers.showToast(`Found ${osmHospitals.length} nearby hospitals`, 'success');
                } else {
                    Helpers.showToast('No hospitals found nearby. Showing default list.', 'info');
                    await loadHospitals(); // Fallback
                }

            }, (error) => {
                console.error("Location error:", error);
                Helpers.showToast('Location access denied. Showing all hospitals.', 'warning');
                btn.innerHTML = '<span class="material-icons-outlined">my_location</span> Use Current Location';
            });
        });
    }
}

async function loadHospitals() {
    const container = document.getElementById('hospitals-list');
    // If we already have OSM data, don't overwrite with JSON unless explicitly needed
    if (allHospitals.length > 0 && allHospitals[0].isExternal) return;

    try {
        // Load from JSON file as default base
        const response = await fetch('../data/hospitals.json');
        let localHospitals = await response.json();

        // Add mock type if missing
        localHospitals = localHospitals.map(h => ({
            ...h,
            type: h.type || (Math.random() > 0.5 ? 'Private' : 'Government'),
            distance: userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, h.latitude || 28.6, h.longitude || 77.2).toFixed(1) : null
        }));

        // Sort if location available
        if (userLocation) {
            localHospitals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        }

        allHospitals = localHospitals;
        displayHospitals(allHospitals);
    } catch (error) {
        console.error('Error loading hospitals:', error);
        container.innerHTML =
            '<p class="text-center text-red-500 py-8">Failed to load hospitals. Please try again.</p>';
    }
}

async function fetchHospitalsFromOverpassAPI(lat, lng) {
    try {
        const radius = 25000; // 25km
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:${radius},${lat},${lng});
              way["amenity"="hospital"](around:${radius},${lat},${lng});
              relation["amenity"="hospital"](around:${radius},${lat},${lng});
            );
            out center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        return data.elements.map(element => {
            const tags = element.tags || {};
            const name = tags.name || tags['name:en'] || "Medical Center";

            let address = tags['addr:full'] ||
                [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') ||
                "Address details unavailable";

            const elLat = element.lat || (element.center && element.center.lat);
            const elLon = element.lon || (element.center && element.center.lon);

            // Infer Type
            let type = "Private";
            if (tags['operator:type'] === 'government' || tags.operator === 'government' || name.toLowerCase().includes('govt') || name.toLowerCase().includes('civil hospital')) {
                type = "Government";
            } else if (name.toLowerCase().includes('trust') || name.toLowerCase().includes('foundation')) {
                type = "Trust";
            }

            // Mock Resources for display consistency
            const totalBeds = 50 + Math.floor(Math.random() * 200);
            const availBeds = Math.floor(totalBeds * (0.3 + Math.random() * 0.5));

            return {
                id: element.id,
                name: name,
                address: address,
                city: tags['addr:city'] || "Nearby",
                type: type, // Government, Private, or Trust
                distance: calculateDistance(lat, lng, elLat, elLon).toFixed(1),
                accreditation: Math.random() > 0.7 ? "NABH" : null,
                telemedicine: Math.random() > 0.6,
                beds: {
                    total: totalBeds,
                    available: availBeds,
                    icu: Math.floor(totalBeds * 0.2),
                    icuAvailable: Math.floor(totalBeds * 0.05)
                },
                resources: {
                    oxygen: Math.random() > 0.2,
                    bloodBank: Math.random() > 0.4,
                    ventilators: 10,
                    ventilatorsAvailable: Math.floor(Math.random() * 5)
                },
                contact: {
                    phone: tags['contact:phone'] || tags['phone'] || "+91-9876543210",
                    emergency: "108"
                },
                isExternal: true
            };
        }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } catch (err) {
        console.warn("Overpass API Error:", err);
        return [];
    }
}

// Haversine Distance Helper
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function displayHospitals(hospitals) {
    const container = document.getElementById('hospitals-list');
    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = `(${hospitals.length})`;

    if (hospitals.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">No hospitals found matching your criteria.</p>';
        return;
    }

    container.innerHTML = hospitals.map(hospital => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <!-- Hospital Info -->
                <div class="flex-1">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-outlined text-primary text-3xl">local_hospital</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <h3 class="font-display text-xl font-bold text-secondary dark:text-white mb-1">
                                    ${hospital.name}
                                    ${hospital.isExternal ? '<span class="ml-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full align-middle">OSM</span>' : ''}
                                </h3>
                                ${hospital.distance ? `<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">${hospital.distance} km</span>` : ''}
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span class="material-icons-outlined text-xs align-middle">location_on</span>
                                ${hospital.address}
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                                    ${hospital.type}
                                </span>
                                ${hospital.accreditation ? `
                                    <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                                        ${hospital.accreditation}
                                    </span>
                                ` : ''}
                                ${hospital.telemedicine ? `
                                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-semibold">
                                        <span class="material-icons-outlined text-xs align-middle">video_call</span> Telemedicine
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resources -->
                <div class="md:w-80 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Resource Availability</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Total Beds</span>
                            <span class="font-bold text-secondary dark:text-white">${hospital.beds.available}/${hospital.beds.total}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${(hospital.beds.available / hospital.beds.total * 100)}%"></div>
                        </div>

                        <div class="flex justify-between items-center mt-3">
                            <span class="text-sm text-gray-600 dark:text-gray-400">ICU Beds</span>
                            <span class="font-bold text-secondary dark:text-white">${hospital.beds.icuAvailable}/${hospital.beds.icu}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${(hospital.beds.icuAvailable / hospital.beds.icu * 100)}%"></div>
                        </div>

                        <div class="flex flex-wrap gap-2 mt-3">
                            ${hospital.resources.oxygen ? '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">Oxygen</span>' : ''}
                            ${hospital.resources.bloodBank ? '<span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-semibold">Blood Bank</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                <div class="flex gap-4 text-sm">
                    <a href="tel:${hospital.contact.phone}" class="flex items-center gap-1 text-secondary dark:text-primary hover:underline">
                        <span class="material-icons-outlined text-sm">phone</span>
                        ${hospital.contact.phone}
                    </a>
                    <a href="tel:${hospital.contact.emergency}" class="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-semibold">
                        <span class="material-icons-outlined text-sm">emergency</span>
                        Emergency: ${hospital.contact.emergency}
                    </a>
                </div>
                <div class="flex gap-2">
                    <button class="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary-light transition-colors">
                        View Details
                    </button>
                    <a href="book-appointment.html" class="px-4 py-2 bg-primary text-secondary rounded-lg text-sm font-semibold hover:bg-green-400 transition-colors">
                        Book Appointment
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const cityFilter = document.getElementById('city-filter');
    const typeFilter = document.getElementById('type-filter');

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCity = cityFilter.value;
        const selectedType = typeFilter.value;

        const filtered = allHospitals.filter(hospital => {
            const matchesSearch = !searchTerm ||
                hospital.name.toLowerCase().includes(searchTerm) ||
                (hospital.city && hospital.city.toLowerCase().includes(searchTerm)) ||
                hospital.address.toLowerCase().includes(searchTerm);

            const matchesCity = !selectedCity || (hospital.city && hospital.city.includes(selectedCity)); // Loose match for city since OSM data is messy
            const matchesType = !selectedType || hospital.type === selectedType;

            return matchesSearch && matchesCity && matchesType;
        });

        displayHospitals(filtered);
    };

    searchInput.addEventListener('input', Helpers.debounce(applyFilters, 300));
    cityFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
}
