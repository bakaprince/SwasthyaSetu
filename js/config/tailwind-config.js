// Tailwind CSS Configuration
// This configuration extends Tailwind with custom colors, fonts, and utilities

const tailwindConfig = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#86efac", // Light green for buttons and accents
                secondary: "#113841", // Deep teal background
                "secondary-light": "#1d525e", // Slightly lighter teal
                "background-dark": "#0d2b32", // Darker version of secondary
                "accent-purple": "#e0defc", // Light purple
                "accent-green": "#e6f0c2", // Light lime green
                "accent-blue": "#d0e8f2", // Light blue for cards
                "health-orange": "#f78e69", // Accent orange for icons
            },
            fontFamily: {
                display: ["Playfair Display", "serif"],
                sans: ["DM Sans", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
};

// Apply configuration to Tailwind (when using CDN)
if (typeof tailwind !== 'undefined') {
    tailwind.config = tailwindConfig;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tailwindConfig;
}
