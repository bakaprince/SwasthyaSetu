/**
 * Prefetch Service
 * Loads critical data after login to improve perceived performance
 * Caches data in memory for instant dashboard rendering
 */

const PrefetchService = {
    // In-memory cache
    cache: {
        appointments: null,
        hospitals: null,
        profile: null,
        timestamp: null
    },

    // Cache validity (5 minutes)
    CACHE_DURATION: 5 * 60 * 1000,

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        if (!this.cache.timestamp) return false;
        return (Date.now() - this.cache.timestamp) < this.CACHE_DURATION;
    },

    /**
     * Prefetch all critical data in parallel
     * Called immediately after successful login
     */
    async prefetchAll() {
        console.log('[PrefetchService] Starting prefetch...');
        const startTime = Date.now();

        try {
            // Prefetch all data in parallel using Promise.allSettled()
            // This allows partial success - if one API fails, others still cache
            const results = await Promise.allSettled([
                this.prefetchAppointments(),
                this.prefetchHospitals(),
                this.prefetchProfile()
            ]);

            // Store in cache (including partial successes)
            this.cache = {
                appointments: results[0].status === 'fulfilled' ? results[0].value : null,
                hospitals: results[1].status === 'fulfilled' ? results[1].value : null,
                profile: results[2].status === 'fulfilled' ? results[2].value : null,
                timestamp: Date.now()
            };

            const duration = Date.now() - startTime;
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            console.log(`[PrefetchService] Prefetch complete in ${duration}ms (${successCount}/3 succeeded)`);

            return successCount > 0; // Return true if at least one succeeded
        } catch (error) {
            console.error('[PrefetchService] Prefetch failed:', error);
            // Don't throw - allow normal page load to fetch data
            return false;
        }
    },

    /**
     * Prefetch user appointments
     */
    async prefetchAppointments() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/appointments`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch appointments');

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.warn('[PrefetchService] Appointments prefetch failed:', error);
            return null;
        }
    },

    /**
     * Prefetch hospitals list
     */
    async prefetchHospitals() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/hospitals?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch hospitals');

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.warn('[PrefetchService] Hospitals prefetch failed:', error);
            return null;
        }
    },

    /**
     * Prefetch user profile
     */
    async prefetchProfile() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.warn('[PrefetchService] Profile prefetch failed:', error);
            return null;
        }
    },

    /**
     * Get cached appointments (instant)
     */
    getAppointments() {
        if (this.isCacheValid() && this.cache.appointments) {
            console.log('[PrefetchService] Returning cached appointments');
            return this.cache.appointments;
        }
        return null;
    },

    /**
     * Get cached hospitals (instant)
     */
    getHospitals() {
        if (this.isCacheValid() && this.cache.hospitals) {
            console.log('[PrefetchService] Returning cached hospitals');
            return this.cache.hospitals;
        }
        return null;
    },

    /**
     * Get cached profile (instant)
     */
    getProfile() {
        if (this.isCacheValid() && this.cache.profile) {
            console.log('[PrefetchService] Returning cached profile');
            return this.cache.profile;
        }
        return null;
    },

    /**
     * Clear cache (on logout)
     */
    clearCache() {
        console.log('[PrefetchService] Clearing cache');
        this.cache = {
            appointments: null,
            hospitals: null,
            profile: null,
            timestamp: null
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrefetchService;
}
