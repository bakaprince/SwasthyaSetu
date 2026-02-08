/**
 * @fileoverview Admin Connectivity Page Controller
 * Manages inter-hospital communication, resource requests, and real-time status
 */

const AdminConnectivity = {
    // Mock Data State
    state: {
        activeRequests: [],
        nearbyHospitals: [],
        transferLogs: []
    },

    init() {
        console.log('[AdminConnectivity] Initializing...');
        this.loadMockData();
        this.renderAll();
    },

    loadMockData() {
        // Mock Nearby Hospitals
        this.state.nearbyHospitals = [
            { id: 101, name: "City General Hospital", distance: "2.5 km", beds: { icu: 2, gen: 15 }, oxygen: "Stable", blood: { "O+": "High", "A-": "Low" }, lat: 28.6139, lng: 77.2090 },
            { id: 102, name: "St. Mary's Trauma Center", distance: "4.1 km", beds: { icu: 0, gen: 4 }, oxygen: "Critical", blood: { "O+": "Low", "AB+": "None" }, lat: 28.6200, lng: 77.2100 },
            { id: 103, name: "Max Super Speciality", distance: "6.8 km", beds: { icu: 8, gen: 45 }, oxygen: "Stable", blood: { "O+": "High", "A-": "High" }, lat: 28.6300, lng: 77.2200 },
        ];

        // Mock Active Requests
        this.state.activeRequests = [
            { id: 'REQ-8821', type: 'blood', urgency: 'critical', details: "2 Units O-Negative for urgent surgery", from: "St. Mary's Trauma Center", to: "active_broadcast", status: "pending", time: "10 mins ago" },
            { id: 'REQ-8820', type: 'bed', urgency: 'high', details: "ICU Bed with Ventilator transfer", from: "You", to: "City General Hospital", status: "accepted", time: "25 mins ago" },
        ];

        // Mock Logs
        this.state.transferLogs = [
            { id: 'LOG-102', action: "Received", item: "5 Oxygen Cylinders", from: "Max Super Speciality", time: "2 hours ago", status: "completed" },
            { id: 'LOG-101', action: "Sent", item: "Cardiologist Dr. Sharma", to: "St. Mary's Trauma Center", time: "Yesterday", status: "completed" },
        ];
    },

    renderAll() {
        this.renderActiveRequests();
        this.renderHospitalList();
        this.renderTransferLogs();
    },

    renderActiveRequests() {
        const container = document.getElementById('active-requests-container');
        if (!container) return;

        if (this.state.activeRequests.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500">No active network requests</div>';
            return;
        }

        container.innerHTML = this.state.activeRequests.map(req => {
            const isOutgoing = req.from === 'You';
            const urgencyColor = req.urgency === 'critical' ? 'red' : (req.urgency === 'high' ? 'orange' : 'blue');

            return `
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded textxs font-bold uppercase tracking-wide bg-${urgencyColor}-100 text-${urgencyColor}-700 text-[10px] border border-${urgencyColor}-200">
                            ${req.urgency}
                        </span>
                        <span class="text-xs text-gray-400 font-mono">${req.id}</span>
                    </div>
                    <span class="text-xs text-gray-500">${req.time}</span>
                </div>
                
                <div class="flex items-start gap-3">
                    <div class="mt-1">
                        <span class="material-icons-outlined text-gray-400 text-xl">
                            ${req.type === 'blood' ? 'bloodtype' : (req.type === 'bed' ? 'bed' : 'local_shipping')}
                        </span>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">
                            ${req.details}
                        </p>
                        <div class="flex items-center gap-2 mt-2 text-xs">
                            <span class="text-gray-500">
                                ${isOutgoing ? 'To: ' + req.to : 'From: ' + req.from}
                            </span>
                            
                            ${req.status === 'pending' ? `
                                <div class="flex gap-2 ml-auto">
                                    ${!isOutgoing ? `
                                        <button class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm text-xs font-semibold">Accept</button>
                                        <button class="px-3 py-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded shadow-sm text-xs font-semibold">Decline</button>
                                    ` : `<span class="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 font-medium">Awaiting Response...</span>`}
                                </div>
                            ` : `
                                <span class="ml-auto text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-medium flex items-center gap-1">
                                    <span class="material-icons text-[14px]">check_circle</span> Accepted
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    renderHospitalList() {
        const container = document.getElementById('hospital-list');
        if (!container) return;

        container.innerHTML = this.state.nearbyHospitals.map(hosp => `
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors group">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-sm text-secondary dark:text-white group-hover:text-primary transition-colors">${hosp.name}</h4>
                    <span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">${hosp.distance}</span>
                </div>
                
                <div class="mt-3 grid grid-cols-2 gap-2">
                    <div class="text-xs bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded border border-blue-100 dark:border-blue-800">
                        <div class="text-gray-500 mb-0.5 text-[10px]">ICU Beds</div>
                        <div class="font-bold text-blue-700 dark:text-blue-300">${hosp.beds.icu} <span class="text-gray-400 font-normal">/ ${hosp.beds.icu + 2}</span></div>
                    </div>
                    <div class="text-xs bg-${hosp.oxygen === 'Critical' ? 'red' : 'green'}-50 dark:bg-green-900/20 p-1.5 rounded border border-${hosp.oxygen === 'Critical' ? 'red' : 'green'}-100">
                        <div class="text-gray-500 mb-0.5 text-[10px]">Oxygen</div>
                        <div class="font-bold text-${hosp.oxygen === 'Critical' ? 'red' : 'green'}-700">${hosp.oxygen}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderTransferLogs() {
        const container = document.getElementById('transfer-log-container');
        if (!container) return;

        container.innerHTML = this.state.transferLogs.map(log => `
            <div class="p-3 m-3 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 relative">
                <div class="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
                <div class="text-xs text-gray-400 mb-1">${log.time}</div>
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span class="${log.action === 'Sent' ? 'text-blue-600' : 'text-green-600'} font-bold">${log.action}</span>
                    ${log.item}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    ${log.action === 'Sent' ? 'To' : 'From'}: <span class="font-medium text-gray-700 dark:text-gray-300">${log.action === 'Sent' ? log.to : log.from}</span>
                </div>
            </div>
        `).join('');
    },



    // --- Modal Actions ---

    openRequestModal() {
        const modal = document.getElementById('request-modal');
        modal.classList.remove('hidden');
        // Reset state
        this.selectResourceType(null);
    },

    closeRequestModal() {
        const modal = document.getElementById('request-modal');
        modal.classList.add('hidden');
    },

    selectResourceType(type) {
        // Visual Reset
        document.querySelectorAll('.resource-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'bg-primary/10', 'bg-red-50', 'bg-blue-50', 'bg-purple-50');
            btn.classList.add('border-gray-200');
        });

        const input = document.getElementById('input-resourceType');
        input.value = type || '';

        const container = document.getElementById('dynamic-fields');
        container.innerHTML = '';
        container.classList.add('hidden');

        if (!type) {
            return;
        }

        // Active State
        const activeBtn = document.getElementById(`btn-${type}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-gray-200');
            activeBtn.classList.add('ring-2', 'ring-offset-2', 'ring-primary');
            // Add specific bg tint based on type
            if (type === 'oxygen') activeBtn.classList.add('bg-primary/10');
            if (type === 'blood') activeBtn.classList.add('bg-red-50');
            if (type === 'medicine') activeBtn.classList.add('bg-blue-50');
            if (type === 'staff') activeBtn.classList.add('bg-purple-50');
        }

        container.classList.remove('hidden');

        // Dynamic Field Generation
        let fieldsHTML = '';
        if (type === 'oxygen') {
            fieldsHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cylinders (Type D)</label>
                        <input type="number" name="cylinders" placeholder="Count" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Liquid Oxygen (L)</label>
                        <input type="number" name="liquid" placeholder="Volume" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                </div>`;
        } else if (type === 'blood') {
            fieldsHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                        <select name="bloodGroup" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Units Needed</label>
                        <input type="number" name="units" placeholder="Units" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                </div>`;
        } else if (type === 'medicine') {
            fieldsHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drug Name</label>
                        <input type="text" name="drugName" placeholder="e.g. Remdesivir" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                        <input type="number" name="quantity" placeholder="Count/Vials" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                </div>`;
        } else if (type === 'staff') {
            fieldsHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                        <select name="specialization" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                            <option value="icu_nurse">ICU Nurse</option>
                            <option value="anesthesiologist">Anesthesiologist</option>
                            <option value="surgeon">Surgeon</option>
                            <option value="paramedic">Paramedic</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                        <input type="number" name="count" placeholder="Number of staff" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
                    </div>
                </div>`;
        }

        container.innerHTML = fieldsHTML;
    },

    submitRequest() {
        const form = document.getElementById('resource-request-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        if (!data.resourceType) {
            Helpers.showToast("Please select a resource type.", "error");
            return;
        }

        if (!data.comments) {
            Helpers.showToast("Please provide details/comments for the request.", "error");
            return;
        }

        Helpers.showToast(`Request for ${data.resourceType.toUpperCase()} broadcasted to network!`, "success");

        // Construct Detail String based on dynamic fields
        let det = data.comments;
        if (data.resourceType === 'oxygen') det = `Oxygen: ${data.cylinders || 0} Cyl, ${data.liquid || 0} L. ${det}`;
        if (data.resourceType === 'blood') det = `Blood: ${data.units} units of ${data.bloodGroup}. ${det}`;
        if (data.resourceType === 'medicine') det = `Medicine: ${data.quantity}x ${data.drugName}. ${det}`;
        if (data.resourceType === 'staff') det = `Staff: ${data.count}x ${data.specialization}. ${det}`;

        // Add to active requests (Simulated)
        this.state.activeRequests.unshift({
            id: 'REQ-' + Math.floor(Math.random() * 10000),
            type: data.resourceType,
            urgency: 'high', // Default for now
            details: det,
            from: "You",
            to: "Network Broadcast",
            status: "pending",
            time: "Just now"
        });

        this.renderActiveRequests();
        this.closeRequestModal();
        form.reset();
        this.selectResourceType(null);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    AdminConnectivity.init();
});
