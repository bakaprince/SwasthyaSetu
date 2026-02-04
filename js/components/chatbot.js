/**
 * Chatbot Component
 * Handles the floating chatbot widget logic, including toggling visibility,
 * displaying initial greetings, handling FAQ redirects, and contact menu.
 */

class Chatbot {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        console.log('Initializing Chatbot...');
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container = document.createElement('div');
        this.container.id = 'chatbot-component';
        this.container.className = 'chatbot-container';

        // Support email for mailto links
        const supportEmail = 'swasthyasetu.helpdesk@gmail.com';

        this.container.innerHTML = `
            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <h3>
                        <span class="material-icons-outlined">smart_toy</span>
                        Swasthya Assistant
                    </h3>
                    <button class="chatbot-close-btn" id="chatbot-close-btn">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <div class="chatbot-footer">Powered by AI Health Assistant</div>
            </div>

            <!-- Contact Popup Menu -->
            <div class="contact-menu-container" id="contact-menu-container">
                <!-- Main View -->
                <div class="menu-view active" id="menu-main">
                    <button class="contact-menu-item" id="contact-whatsapp">
                        <span class="material-icons-outlined" style="color: #25D366;">chat</span>
                        Chat with us
                    </button>
                    <button class="contact-menu-item" id="contact-email-trigger">
                        <span class="material-icons-outlined" style="color: #EA4335;">email</span>
                        Email
                    </button>
                </div>

                <!-- Email Providers View -->
                <div class="menu-view" id="menu-email">
                    <button class="contact-menu-item back-btn" id="email-back-btn">
                        <span class="material-icons-outlined" style="font-size: 16px;">arrow_back</span>
                        Back
                    </button>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #EA4335;">mail</span>
                        Gmail
                    </a>
                    <a href="https://compose.mail.yahoo.com/?to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #720e9e;">mail</span>
                        Yahoo Mail
                    </a>
                    <a href="https://outlook.live.com/owa/?path=/mail/action/compose&to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #0078d4;">mail</span>
                        Outlook
                    </a>
                    <a href="mailto:${supportEmail}" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #64748b;">forward_to_inbox</span>
                        Others
                    </a>
                </div>
            </div>
            
            <!-- Secondary FAB (Contact) -->
            <button class="chatbot-fab-secondary" id="chatbot-contact-btn" aria-label="Contact Support" title="Contact Options">
                <span class="material-icons-outlined" style="font-size: 24px;">headphones</span>
            </button>

            <!-- Primary FAB (Chat) -->
            <button class="chatbot-fab" id="chatbot-toggle-btn" aria-label="Toggle Chatbot">
                <span class="material-icons-outlined" style="font-size: 24px;">chat</span>
            </button>
        `;

        document.body.appendChild(this.container);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const contactBtn = document.getElementById('chatbot-contact-btn');
        const closeBtn = document.getElementById('chatbot-close-btn');
        const whatsappBtn = document.getElementById('contact-whatsapp');

        // Email Menu Logic
        const emailTriggerBtn = document.getElementById('contact-email-trigger');
        const emailBackBtn = document.getElementById('email-back-btn');
        const menuMain = document.getElementById('menu-main');
        const menuEmail = document.getElementById('menu-email');

        // Chat Toggle
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.closeContactMenu();
                this.toggleChat();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleChat(false));
        }

        // Contact Menu Toggle
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.toggleChat(false);
                this.toggleContactMenu();
            });
        }

        // WhatsApp
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                window.open('https://wa.me/911234567890', '_blank'); // Replace with actual number
                this.closeContactMenu();
            });
        }

        // Switch to Email View
        if (emailTriggerBtn) {
            emailTriggerBtn.addEventListener('click', () => {
                menuMain.classList.remove('active');
                menuEmail.classList.add('active');
            });
        }

        // Back to Main View
        if (emailBackBtn) {
            emailBackBtn.addEventListener('click', () => {
                menuEmail.classList.remove('active');
                menuMain.classList.add('active');
            });
        }

        // Close menu when clicking email links (optional - typically good UX)
        const emailLinks = menuEmail.querySelectorAll('a');
        emailLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Short delay to let the click register/open tab before closing menu
                setTimeout(() => this.closeContactMenu(), 500);
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.toggleChat(false);
                this.closeContactMenu();
            }
        });
    }

    toggleChat(forceState) {
        const windowEl = document.getElementById('chatbot-window');
        const toggleIcon = document.querySelector('#chatbot-toggle-btn .material-icons-outlined');

        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;

        if (this.isOpen) {
            windowEl.classList.add('visible');
            toggleIcon.innerText = 'close';

            // If empty, add initial greeting
            const messagesContainer = document.getElementById('chatbot-messages');
            if (messagesContainer.children.length === 0) {
                this.addBotMessage('Hi, How can I assist you?');
                this.showInitialOptions();
            }
        } else {
            windowEl.classList.remove('visible');
            toggleIcon.innerText = 'chat';
        }
    }

    toggleContactMenu() {
        const menuContainer = document.getElementById('contact-menu-container');
        const menuMain = document.getElementById('menu-main');
        const menuEmail = document.getElementById('menu-email');

        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            menuContainer.classList.add('visible');
            // Reset to main view every time we open
            menuMain.classList.add('active');
            menuEmail.classList.remove('active');
        } else {
            menuContainer.classList.remove('visible');
        }
    }

    closeContactMenu() {
        this.isMenuOpen = false;
        const menuContainer = document.getElementById('contact-menu-container');
        if (menuContainer) menuContainer.classList.remove('visible');
    }

    showInitialOptions() {
        this.addOptions([
            { text: 'How do I book an appointment?', action: 'faq-1' },
            { text: 'What is ABHA ID?', action: 'faq-2' },
            { text: 'How to find hospitals?', action: 'faq-3' }
        ]);
    }

    addBotMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    addOptions(options) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chatbot-options';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-option-btn';
            btn.innerText = opt.text;
            btn.addEventListener('click', () => this.handleOptionClick(opt));
            optionsDiv.appendChild(btn);
        });

        messagesContainer.appendChild(optionsDiv);
        this.scrollToBottom();
    }

    handleOptionClick(option) {
        // Add user selection bubble
        this.addUserMessage(option.text);

        setTimeout(() => {
            switch (option.action) {
                case 'faq-1':
                    this.addBotMessage('You can book an appointment by logging into your Patient account, searching for a hospital or doctor, and selecting a preferred time slot.');
                    break;
                case 'faq-2':
                    this.addBotMessage('Ayushman Bharat Health Account (ABHA) ID is a unique identifier that helps you access and share your health records digitally with your consent.');
                    break;
                case 'faq-3':
                    this.addBotMessage('We use your device\'s location services to show hospitals near you. Ensure your location permissions are enabled.');
                    break;
            }
            // Re-show options
            setTimeout(() => this.showInitialOptions(), 1500);
        }, 500);
    }

    addUserMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Make accessible globally
window.Chatbot = Chatbot;
