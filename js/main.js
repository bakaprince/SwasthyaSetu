// Main JavaScript Entry Point
// Initializes all components and sets up global event listeners

document.addEventListener('DOMContentLoaded', function () {
    console.log('MedConnect application initialized');

    // Initialize Navigation
    if (typeof Navigation !== 'undefined') {
        const navigation = new Navigation();
    }

    // Initialize Login Form
    if (typeof LoginForm !== 'undefined') {
        const loginForm = new LoginForm();
    }

    // Add smooth scroll behavior to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dark mode toggle (if needed in the future)
    // const darkModeToggle = document.getElementById('dark-mode-toggle');
    // if (darkModeToggle) {
    //     darkModeToggle.addEventListener('click', toggleDarkMode);
    // }
});

// Utility function for dark mode toggle
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
}
