/**
 * @fileoverview Application Utilities
 * Consolidated utilities for Helpers, Formatters, and Validators
 * references: helpers.js, validators.js, formatters.js
 */

/**
 * Utility Helper Functions
 */
const Helpers = {
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        return d.toLocaleDateString('en-IN', options[format] || options.short);
    },

    validateABHA(abhaId) {
        return /^\d{14}$/.test(abhaId);
    },

    validateMobile(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-gray-900',
            info: 'bg-blue-500 text-white'
        };

        toast.className += ` ${colors[type] || colors.info}`;
        toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="material-icons-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}</span>
        <span class="font-medium">${message}</span>
      </div>
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    generateId(length = 8) {
        return Math.random().toString(36).substring(2, 2 + length);
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy', 'error');
            return false;
        }
    },

    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

/**
 * Data Formatting Utilities
 */
const Formatters = {
    formatDate(date, format = 'short') {
        if (!date) return 'N/A';
        try {
            const d = new Date(date);
            if (isNaN(d)) return 'Invalid Date';

            const options = {
                short: { year: 'numeric', month: 'short', day: 'numeric' },
                long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
                time: { hour: '2-digit', minute: '2-digit' },
                datetime: {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }
            };

            if (format === 'relative') {
                return this.formatRelativeTime(d);
            }

            return d.toLocaleDateString('en-IN', options[format] || options.short);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    },

    formatRelativeTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        return this.formatDate(d, 'short');
    },

    formatABHA(abhaId) {
        if (!abhaId) return '';
        const cleaned = abhaId.replace(/-/g, '');
        if (cleaned.length === 14) {
            return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}-${cleaned.substring(10, 14)}`;
        }
        return abhaId;
    },

    formatMobile(mobile, includeCountryCode = false) {
        if (!mobile) return '';
        const cleaned = mobile.replace(/\D/g, '');
        if (includeCountryCode && cleaned.length === 10) {
            return `+91 ${cleaned}`;
        }
        return cleaned;
    },

    formatStatusBadge(status) {
        if (!status) return '';
        const statusConfig = {
            pending: { color: 'yellow', icon: 'schedule', text: 'Pending' },
            confirmed: { color: 'blue', icon: 'event_available', text: 'Confirmed' },
            cancelled: { color: 'red', icon: 'cancel', text: 'Cancelled' },
            completed: { color: 'green', icon: 'check_circle', text: 'Completed' }
        };
        const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
        return `
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-300">
                <span class="material-icons-outlined text-sm">${config.icon}</span>
                ${config.text}
            </span>
        `.trim();
    },

    getStatusColor(status) {
        const colors = {
            pending: 'yellow',
            confirmed: 'blue',
            cancelled: 'red',
            completed: 'green'
        };
        return colors[status?.toLowerCase()] || 'gray';
    },

    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || bytes < 0) return 'N/A';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    formatCurrency(amount, includeSymbol = true) {
        if (amount === null || amount === undefined) return 'N/A';
        const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
        return includeSymbol ? `₹${formatted}` : formatted;
    },

    formatTimeSlot(timeSlot) {
        if (!timeSlot) return '';
        try {
            const [hours, minutes] = timeSlot.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            return timeSlot;
        }
    },

    capitalizeWords(text) {
        if (!text || typeof text !== 'string') return '';
        return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    truncateText(text, maxLength = 50) {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatPatientName(name, gender = null, isDoctor = false) {
        if (!name) return '';
        if (isDoctor) {
            return `Dr. ${this.capitalizeWords(name)}`;
        }
        const title = gender?.toLowerCase() === 'female' ? 'Ms.' : 'Mr.';
        return `${title} ${this.capitalizeWords(name)}`;
    }
};

/**
 * Input Validation Utilities
 */
const Validators = {
    validateABHA(abhaId) {
        if (!abhaId || typeof abhaId !== 'string') return false;
        const cleaned = abhaId.replace(/-/g, '');
        return /^\d{14}$/.test(cleaned);
    },

    validateMobile(mobile) {
        if (!mobile || typeof mobile !== 'string') return false;
        const cleaned = mobile.replace(/[\s-]/g, '');
        return /^[6-9]\d{9}$/.test(cleaned);
    },

    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    },

    validateAge(age) {
        const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
        return !isNaN(numAge) && numAge >= 0 && numAge <= 150;
    },

    validatePassword(password) {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 6;
    },

    validateOTP(otp) {
        if (!otp || typeof otp !== 'string') return false;
        return /^\d{6}$/.test(otp);
    },

    validateAppointmentDate(date) {
        try {
            const appointmentDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return appointmentDate instanceof Date && !isNaN(appointmentDate) && appointmentDate >= today;
        } catch (error) {
            return false;
        }
    },

    validateAppointmentId(appointmentId) {
        if (!appointmentId || typeof appointmentId !== 'string') return false;
        return /^(APT-|PT-)[a-zA-Z0-9]+$/.test(appointmentId);
    },

    validateFile(file, allowedExtensions = ['.pdf', '.jpg', '.png'], maxSizeMB = 10) {
        if (!file || !(file instanceof File)) {
            return { success: false, message: 'No file provided' };
        }
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return { success: false, message: `File size must be less than ${maxSizeMB}MB` };
        }
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
        if (!hasValidExtension) {
            return { success: false, message: `Only ${allowedExtensions.join(', ')} files are allowed` };
        }
        return { success: true, message: 'File is valid' };
    },

    validateRequiredFields(formData, requiredFields) {
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return !value || (typeof value === 'string' && !value.trim());
        });
        return { success: missingFields.length === 0, missingFields: missingFields };
    },

    validateStatus(status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        return validStatuses.includes(status?.toLowerCase());
    }
};

// Global UI Enhancements
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-animate-in');
    const cards = document.querySelectorAll('.card, .bg-white.rounded-xl, .bg-white.rounded-2xl');
    cards.forEach(card => {
        card.classList.add('transition-all', 'duration-300', 'hover:-translate-y-1', 'hover:shadow-lg');
    });
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#"]');
        if (link) {
            e.preventDefault();
            Helpers.showToast('🚧 This feature is currently under development.', 'info');
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Helpers, Formatters, Validators };
}

// Ensure global availability for browser environment
if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
    window.Formatters = Formatters;
    window.Validators = Validators;
}
