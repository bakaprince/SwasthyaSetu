/**
 * Seasonal Diseases Component
 * Displays current health risks based on the season/month.
 */

const SeasonalDiseases = {
    init() {
        console.log('SeasonalDiseases: Initializing...');
        this.render();
    },

    getSeasonalRisks() {
        const month = new Date().getMonth(); // 0-11

        // India-specific seasonal risks
        // Winter (Nov-Feb): Flu, Pneumonia, Smog problems
        if (month >= 10 || month <= 1) {
            return [
                { name: 'Influenza (Flu)', risk: 'High', color: 'red', icon: 'masks' },
                { name: 'Smog/Pollution', risk: 'Severe', color: 'purple', icon: 'cloud_off' },
                { name: 'Viral Fever', risk: 'Moderate', color: 'orange', icon: 'thermostat' }
            ];
        }
        // Summer (Mar-Jun): Heatstroke, Dehydration, Typhoid
        else if (month >= 2 && month <= 5) {
            return [
                { name: 'Heatstroke', risk: 'High', color: 'red', icon: 'wb_sunny' },
                { name: 'Dehydration', risk: 'Moderate', color: 'orange', icon: 'water_drop' },
                { name: 'Typhoid', risk: 'Moderate', color: 'orange', icon: 'restaurant' }
            ];
        }
        // Monsoon (Jul-Sep): Dengue, Malaria, Cholera
        else {
            return [
                { name: 'Dengue', risk: 'High', color: 'red', icon: 'mosquito' },
                { name: 'Malaria', risk: 'High', color: 'red', icon: 'pest_control' },
                { name: 'Cholera', risk: 'Moderate', color: 'yellow', icon: 'water' }
            ];
        }
    },

    render() {
        const container = document.getElementById('seasonal-risks-list');
        if (!container) return;

        const risks = this.getSeasonalRisks();
        const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

        document.getElementById('seasonal-month').textContent = currentMonthName;

        container.innerHTML = risks.map(disease => `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border-l-4 border-${disease.color}-500">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-${disease.color}-100 dark:bg-${disease.color}-900 rounded-full text-${disease.color}-600 dark:text-${disease.color}-300">
                        <span class="material-icons-outlined text-lg">${disease.icon}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200 text-sm">${disease.name}</h4>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Risk Level:
                            <span class="font-semibold text-${disease.color}-600">${disease.risk}</span>
                        </span>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-primary transition-colors">
                    <span class="material-icons-outlined">info</span>
                </button>
            </div>
        `).join('');
    }
};

// Initialize if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SeasonalDiseases.init();
});
