/**
 * @fileoverview Data Formatting Utilities
 * Centralized formatting functions for dates, currency, status badges, etc.
 * @module utils/formatters
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

const Formatters = {
    /**
     * Format date to readable string
     * Supports multiple format types for different display contexts
     * 
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'time', 'datetime', 'relative')
     * @returns {string} Formatted date string
     * @example
     * Formatters.formatDate(new Date(), 'short'); // "7 Feb 2026"
     * Formatters.formatDate(new Date(), 'long'); // "Friday, 7 February 2026"
     * Formatters.formatDate(new Date(), 'time'); // "02:30 PM"
     */
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
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }
            };

            // Relative time format (e.g., "2 days ago")
            if (format === 'relative') {
                return this.formatRelativeTime(d);
            }

            return d.toLocaleDateString('en-IN', options[format] || options.short);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    },

    /**
     * Format date as relative time (e.g., "2 days ago", "in 3 hours")
     * 
     * @param {Date|string} date - Date to format
     * @returns {string} Relative time string
     * @example
     * Formatters.formatRelativeTime(new Date(Date.now() - 86400000)); // "1 day ago"
     */
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

        // For older dates, use regular format
        return this.formatDate(d, 'short');
    },

    /**
     * Format ABHA ID with hyphens for readability
     * Converts "12345678901234" to "12-3456-7890-1234"
     * 
     * @param {string} abhaId - ABHA ID to format
     * @returns {string} Formatted ABHA ID
     * @example
     * Formatters.formatABHA('12345678901234'); // "12-3456-7890-1234"
     */
    formatABHA(abhaId) {
        if (!abhaId) return '';

        // Remove existing hyphens
        const cleaned = abhaId.replace(/-/g, '');

        // Add hyphens in XX-XXXX-XXXX-XXXX format
        if (cleaned.length === 14) {
            return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}-${cleaned.substring(10, 14)}`;
        }

        return abhaId;
    },

    /**
     * Format mobile number for display
     * Adds country code prefix if needed
     * 
     * @param {string} mobile - Mobile number to format
     * @param {boolean} includeCountryCode - Whether to include +91 prefix
     * @returns {string} Formatted mobile number
     * @example
     * Formatters.formatMobile('9876543210'); // "9876543210"
     * Formatters.formatMobile('9876543210', true); // "+91 9876543210"
     */
    formatMobile(mobile, includeCountryCode = false) {
        if (!mobile) return '';

        const cleaned = mobile.replace(/\D/g, '');

        if (includeCountryCode && cleaned.length === 10) {
            return `+91 ${cleaned}`;
        }

        return cleaned;
    },

    /**
     * Format status as colored badge HTML
     * Returns HTML string with appropriate Tailwind classes
     * 
     * @param {string} status - Status value
     * @returns {string} HTML string for status badge
     * @example
     * Formatters.formatStatusBadge('confirmed');
     * // Returns: <span class="...">Confirmed</span>
     */
    formatStatusBadge(status) {
        if (!status) return '';

        const statusConfig = {
            pending: {
                color: 'yellow',
                icon: 'schedule',
                text: 'Pending'
            },
            confirmed: {
                color: 'blue',
                icon: 'event_available',
                text: 'Confirmed'
            },
            cancelled: {
                color: 'red',
                icon: 'cancel',
                text: 'Cancelled'
            },
            completed: {
                color: 'green',
                icon: 'check_circle',
                text: 'Completed'
            }
        };

        const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

        return `
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-300">
                <span class="material-icons-outlined text-sm">${config.icon}</span>
                ${config.text}
            </span>
        `.trim();
    },

    /**
     * Get status color class for Tailwind CSS
     * 
     * @param {string} status - Status value
     * @returns {string} Color class name
     * @example
     * Formatters.getStatusColor('confirmed'); // "blue"
     */
    getStatusColor(status) {
        const colors = {
            pending: 'yellow',
            confirmed: 'blue',
            cancelled: 'red',
            completed: 'green'
        };

        return colors[status?.toLowerCase()] || 'gray';
    },

    /**
     * Format file size from bytes to human-readable string
     * 
     * @param {number} bytes - File size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted file size
     * @example
     * Formatters.formatFileSize(1024); // "1 KB"
     * Formatters.formatFileSize(1048576); // "1 MB"
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || bytes < 0) return 'N/A';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Format currency (Indian Rupees)
     * 
     * @param {number} amount - Amount to format
     * @param {boolean} includeSymbol - Whether to include ₹ symbol
     * @returns {string} Formatted currency string
     * @example
     * Formatters.formatCurrency(1000); // "₹1,000"
     * Formatters.formatCurrency(1500.50, false); // "1,500.50"
     */
    formatCurrency(amount, includeSymbol = true) {
        if (amount === null || amount === undefined) return 'N/A';

        const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);

        return includeSymbol ? `₹${formatted}` : formatted;
    },

    /**
     * Format time slot for display
     * Converts 24-hour time to 12-hour format with AM/PM
     * 
     * @param {string} timeSlot - Time in HH:MM format
     * @returns {string} Formatted time slot
     * @example
     * Formatters.formatTimeSlot('14:30'); // "2:30 PM"
     * Formatters.formatTimeSlot('09:00'); // "9:00 AM"
     */
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

    /**
     * Capitalize first letter of each word
     * 
     * @param {string} text - Text to capitalize
     * @returns {string} Capitalized text
     * @example
     * Formatters.capitalizeWords('john doe'); // "John Doe"
     */
    capitalizeWords(text) {
        if (!text || typeof text !== 'string') return '';

        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    /**
     * Truncate text with ellipsis
     * 
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Truncated text
     * @example
     * Formatters.truncateText('This is a long text', 10); // "This is..."
     */
    truncateText(text, maxLength = 50) {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;

        return text.substring(0, maxLength) + '...';
    },

    /**
     * Format patient name with title (Mr/Ms/Dr)
     * 
     * @param {string} name - Patient name
     * @param {string} gender - Patient gender
     * @param {boolean} isDoctor - Whether the person is a doctor
     * @returns {string} Formatted name with title
     * @example
     * Formatters.formatPatientName('John Doe', 'Male'); // "Mr. John Doe"
     * Formatters.formatPatientName('Jane Smith', 'Female', true); // "Dr. Jane Smith"
     */
    formatPatientName(name, gender = null, isDoctor = false) {
        if (!name) return '';

        if (isDoctor) {
            return `Dr. ${this.capitalizeWords(name)}`;
        }

        const title = gender?.toLowerCase() === 'female' ? 'Ms.' : 'Mr.';
        return `${title} ${this.capitalizeWords(name)}`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}
